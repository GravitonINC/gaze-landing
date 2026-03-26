#!/usr/bin/env bash
# provision.sh — AWS infrastructure provisioning for gazeprotocol.com
#
# Prerequisites:
#   - AWS CLI v2 configured with credentials that have ACM, S3, CloudFront, Route53 permissions
#   - jq installed
#
# Usage:
#   chmod +x infra/provision.sh
#   ./infra/provision.sh
#
# This script is idempotent — it checks for existing resources before creating.
# Run from the repo root.

set -euo pipefail

DOMAIN="gazeprotocol.com"
BUCKET_NAME="gazeprotocol-com-site"
REGION="us-east-1"

echo "=== gazeprotocol.com Infrastructure Provisioning ==="
echo "Domain: $DOMAIN"
echo "Bucket: $BUCKET_NAME"
echo "Region: $REGION"
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 1: ACM Certificate (MUST be us-east-1)
# ─────────────────────────────────────────────────────────────────────────────
echo "--- Phase 1: ACM Certificate ---"

# Check for existing cert
EXISTING_CERT=$(aws acm list-certificates \
  --region "$REGION" \
  --query "CertificateSummaryList[?DomainName=='$DOMAIN'].CertificateArn" \
  --output text 2>/dev/null || echo "")

if [ -n "$EXISTING_CERT" ] && [ "$EXISTING_CERT" != "None" ]; then
  CERT_ARN="$EXISTING_CERT"
  echo "✓ ACM certificate already exists: $CERT_ARN"
else
  echo "Requesting ACM certificate for $DOMAIN + *.$DOMAIN ..."
  CERT_ARN=$(aws acm request-certificate \
    --region "$REGION" \
    --domain-name "$DOMAIN" \
    --subject-alternative-names "*.$DOMAIN" \
    --validation-method DNS \
    --query "CertificateArn" \
    --output text)
  echo "✓ Certificate requested: $CERT_ARN"
  echo ""
  echo "⚠️  ACTION REQUIRED: Create DNS validation CNAME records in Route53."
  echo "   Run this to get the CNAME values:"
  echo "   aws acm describe-certificate --region $REGION --certificate-arn $CERT_ARN --query 'Certificate.DomainValidationOptions'"
  echo ""
  echo "   Then create the CNAME records in Route53 and wait for status ISSUED."
  echo "   Polling every 30s (may take 5–30 min)..."
fi

# Poll until ISSUED
echo "Waiting for certificate to be ISSUED..."
while true; do
  STATUS=$(aws acm describe-certificate \
    --region "$REGION" \
    --certificate-arn "$CERT_ARN" \
    --query "Certificate.Status" \
    --output text)
  echo "  Certificate status: $STATUS"
  if [ "$STATUS" = "ISSUED" ]; then
    echo "✓ Certificate ISSUED: $CERT_ARN"
    break
  elif [ "$STATUS" = "FAILED" ] || [ "$STATUS" = "REVOKED" ]; then
    echo "✗ Certificate in terminal state: $STATUS. Exiting."
    exit 1
  fi
  sleep 30
done

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 2: S3 Bucket
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "--- Phase 2: S3 Bucket ---"

if aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
  echo "✓ S3 bucket already exists: $BUCKET_NAME"
else
  echo "Creating S3 bucket $BUCKET_NAME ..."
  aws s3api create-bucket \
    --bucket "$BUCKET_NAME" \
    --region "$REGION" \
    --create-bucket-configuration LocationConstraint="$REGION" 2>/dev/null || \
  aws s3api create-bucket \
    --bucket "$BUCKET_NAME" \
    --region "$REGION"
  echo "✓ S3 bucket created: $BUCKET_NAME"
fi

# Block all public access
echo "Blocking all public access on $BUCKET_NAME ..."
aws s3api put-public-access-block \
  --bucket "$BUCKET_NAME" \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
echo "✓ Public access blocked"

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 3: CloudFront OAC + Distribution
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "--- Phase 3: CloudFront OAC ---"

# Check for existing OAC
EXISTING_OAC=$(aws cloudfront list-origin-access-controls \
  --query "OriginAccessControlList.Items[?Name=='gazeprotocol-com-oac'].Id" \
  --output text 2>/dev/null || echo "")

if [ -n "$EXISTING_OAC" ] && [ "$EXISTING_OAC" != "None" ]; then
  OAC_ID="$EXISTING_OAC"
  echo "✓ CloudFront OAC already exists: $OAC_ID"
else
  echo "Creating CloudFront OAC ..."
  OAC_RESULT=$(aws cloudfront create-origin-access-control \
    --origin-access-control-config '{
      "Name": "gazeprotocol-com-oac",
      "Description": "OAC for gazeprotocol-com-site S3 bucket",
      "SigningProtocol": "sigv4",
      "SigningBehavior": "always",
      "OriginAccessControlOriginType": "s3"
    }')
  OAC_ID=$(echo "$OAC_RESULT" | jq -r '.OriginAccessControl.Id')
  echo "✓ CloudFront OAC created: $OAC_ID"
fi

echo ""
echo "--- Phase 3: CloudFront Distribution ---"

# Check for existing distribution
EXISTING_DIST=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?Aliases.Items[?contains(@, '$DOMAIN')]].Id" \
  --output text 2>/dev/null || echo "")

if [ -n "$EXISTING_DIST" ] && [ "$EXISTING_DIST" != "None" ]; then
  DIST_ID="$EXISTING_DIST"
  DIST_DOMAIN=$(aws cloudfront get-distribution \
    --id "$DIST_ID" \
    --query "Distribution.DomainName" \
    --output text)
  echo "✓ CloudFront distribution already exists: $DIST_ID ($DIST_DOMAIN)"
else
  echo "Creating CloudFront distribution ..."
  ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
  S3_ORIGIN_DOMAIN="${BUCKET_NAME}.s3.${REGION}.amazonaws.com"

  DIST_CONFIG=$(cat <<EOF
{
  "CallerReference": "gazeprotocol-com-$(date +%s)",
  "Aliases": {
    "Quantity": 1,
    "Items": ["$DOMAIN"]
  },
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-gazeprotocol-com-site",
        "DomainName": "$S3_ORIGIN_DOMAIN",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        },
        "OriginAccessControlId": "$OAC_ID"
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-gazeprotocol-com-site",
    "ViewerProtocolPolicy": "redirect-to-https",
    "CachePolicyId": "658327ea-f89d-4fab-a63d-7e88639e58f6",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"]
    },
    "Compress": true
  },
  "CustomErrorResponses": {
    "Quantity": 2,
    "Items": [
      {
        "ErrorCode": 403,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 10
      },
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 10
      }
    ]
  },
  "Comment": "gazeprotocol.com landing page",
  "PriceClass": "PriceClass_100",
  "Enabled": true,
  "ViewerCertificate": {
    "ACMCertificateArn": "$CERT_ARN",
    "SSLSupportMethod": "sni-only",
    "MinimumProtocolVersion": "TLSv1.2_2021"
  },
  "HttpVersion": "http2and3",
  "IsIPV6Enabled": true
}
EOF
)

  DIST_RESULT=$(aws cloudfront create-distribution --distribution-config "$DIST_CONFIG")
  DIST_ID=$(echo "$DIST_RESULT" | jq -r '.Distribution.Id')
  DIST_DOMAIN=$(echo "$DIST_RESULT" | jq -r '.Distribution.DomainName')
  echo "✓ CloudFront distribution created: $DIST_ID ($DIST_DOMAIN)"

  # Update S3 bucket policy to allow this distribution's OAC
  echo "Updating S3 bucket policy for OAC ..."
  BUCKET_POLICY=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontOAC",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${BUCKET_NAME}/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::${ACCOUNT_ID}:distribution/${DIST_ID}"
        }
      }
    }
  ]
}
EOF
)
  aws s3api put-bucket-policy --bucket "$BUCKET_NAME" --policy "$BUCKET_POLICY"
  echo "✓ S3 bucket policy updated"
fi

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 4: Route53 DNS
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "--- Phase 4: Route53 DNS ---"

HOSTED_ZONE_ID=$(aws route53 list-hosted-zones-by-name \
  --dns-name "$DOMAIN" \
  --query "HostedZones[0].Id" \
  --output text | sed 's|/hostedzone/||')

if [ -z "$HOSTED_ZONE_ID" ] || [ "$HOSTED_ZONE_ID" = "None" ]; then
  echo "✗ Route53 hosted zone for $DOMAIN not found. Cannot create DNS records."
  exit 1
fi

echo "Found hosted zone: $HOSTED_ZONE_ID"

# CloudFront hosted zone ID (fixed AWS value for all CloudFront distributions)
CF_HOSTED_ZONE_ID="Z2FDTNDATAQYW2"

CHANGE_BATCH=$(cat <<EOF
{
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "$DOMAIN",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "$CF_HOSTED_ZONE_ID",
          "DNSName": "$DIST_DOMAIN",
          "EvaluateTargetHealth": false
        }
      }
    },
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "$DOMAIN",
        "Type": "AAAA",
        "AliasTarget": {
          "HostedZoneId": "$CF_HOSTED_ZONE_ID",
          "DNSName": "$DIST_DOMAIN",
          "EvaluateTargetHealth": false
        }
      }
    }
  ]
}
EOF
)

aws route53 change-resource-record-sets \
  --hosted-zone-id "$HOSTED_ZONE_ID" \
  --change-batch "$CHANGE_BATCH"
echo "✓ Route53 A + AAAA ALIAS records created/updated for $DOMAIN → $DIST_DOMAIN"

# ─────────────────────────────────────────────────────────────────────────────
# SUMMARY
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "=== Provisioning Complete ==="
echo ""
echo "Resource IDs (save these — needed for GitHub Actions secrets in issue #1):"
echo "  ACM Certificate ARN:        $CERT_ARN"
echo "  S3 Bucket:                  $BUCKET_NAME"
echo "  CloudFront Distribution ID: $DIST_ID"
echo "  CloudFront Domain:          $DIST_DOMAIN"
echo "  Route53 Zone ID:            $HOSTED_ZONE_ID"
echo ""
echo "GitHub Secrets to set in GravitonINC/gaze-landing:"
echo "  CLOUDFRONT_DISTRIBUTION_ID = $DIST_ID"
echo "  AWS_ACCESS_KEY_ID           = <IAM user key with S3+CloudFront permissions>"
echo "  AWS_SECRET_ACCESS_KEY       = <IAM user secret>"
echo ""
echo "Next steps:"
echo "  1. Set the GitHub secrets above in the repo settings"
echo "  2. Merge the feature/initial-scaffold branch to main"
echo "  3. GitHub Actions will build and deploy the Astro site"
echo "  4. Wait ~5–15 min for CloudFront propagation"
echo "  5. Verify https://$DOMAIN loads correctly"
echo ""
echo "CloudFront distribution may take 5–15 min to reach 'Deployed' status."
echo "Check: aws cloudfront get-distribution --id $DIST_ID --query 'Distribution.Status'"
