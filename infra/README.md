# gazeprotocol.com — AWS Infrastructure Specification

> **Status:** Awaiting provisioning — AWS CLI/SDK access required  
> **Tracking Issue:** https://github.com/GravitonINC/gaze-landing/issues/3  
> **Priority:** P0  
> **Last Updated:** 2026-03-26

---

## Overview

Static site hosting for `gazeprotocol.com` using:
- **ACM** — TLS certificate (us-east-1, required for CloudFront)
- **S3** — Private origin bucket (no public access, no static website hosting)
- **CloudFront** — CDN with OAC (Origin Access Control) for S3 access
- **Route53** — DNS ALIAS records pointing to CloudFront

---

## Execution Order

### Step 1: ACM Certificate (us-east-1)

```bash
aws acm request-certificate \
  --region us-east-1 \
  --domain-name gazeprotocol.com \
  --subject-alternative-names "*.gazeprotocol.com" \
  --validation-method DNS \
  --query 'CertificateArn' \
  --output text
```

- **Region:** MUST be `us-east-1` (CloudFront requirement)
- **Domains:** `gazeprotocol.com` + `*.gazeprotocol.com`
- **Validation:** DNS (via Route53)

After requesting, get the DNS validation CNAME records:
```bash
aws acm describe-certificate \
  --region us-east-1 \
  --certificate-arn <CERT_ARN> \
  --query 'Certificate.DomainValidationOptions[*].ResourceRecord'
```

Create the CNAME records in Route53 (see Step 2), then poll until ISSUED:
```bash
aws acm wait certificate-validated \
  --region us-east-1 \
  --certificate-arn <CERT_ARN>
```

---

### Step 2: Route53 DNS Validation CNAMEs

Get the hosted zone ID for `gazeprotocol.com`:
```bash
aws route53 list-hosted-zones-by-name \
  --dns-name gazeprotocol.com \
  --query 'HostedZones[0].Id' \
  --output text
```

Create the ACM validation CNAME record(s):
```json
{
  "Changes": [{
    "Action": "UPSERT",
    "ResourceRecordSet": {
      "Name": "<CNAME_NAME_FROM_ACM>",
      "Type": "CNAME",
      "TTL": 300,
      "ResourceRecords": [{"Value": "<CNAME_VALUE_FROM_ACM>"}]
    }
  }]
}
```

```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id <ZONE_ID> \
  --change-batch file://acm-validation.json
```

**Wait for cert to be ISSUED before proceeding to Step 5.**

---

### Step 3: S3 Bucket

```bash
aws s3api create-bucket \
  --bucket gazeprotocol-com-site \
  --region us-east-1 \
  --create-bucket-configuration LocationConstraint=us-east-1
```

> **Note:** `us-east-1` does NOT use `LocationConstraint` — omit that flag for us-east-1:
```bash
aws s3api create-bucket \
  --bucket gazeprotocol-com-site \
  --region us-east-1
```

Block all public access:
```bash
aws s3api put-public-access-block \
  --bucket gazeprotocol-com-site \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

**Do NOT enable static website hosting** — CloudFront OAC accesses S3 directly via the REST API endpoint.

---

### Step 4: CloudFront Origin Access Control (OAC)

```bash
aws cloudfront create-origin-access-control \
  --origin-access-control-config '{
    "Name": "gazeprotocol-com-oac",
    "Description": "OAC for gazeprotocol-com-site S3 bucket",
    "SigningProtocol": "sigv4",
    "SigningBehavior": "always",
    "OriginAccessControlOriginType": "s3"
  }' \
  --query 'OriginAccessControl.Id' \
  --output text
```

Save the OAC ID — needed for the CloudFront distribution config.

---

### Step 5: CloudFront Distribution

**Prerequisites:** ACM cert must be ISSUED before this step.

```bash
aws cloudfront create-distribution \
  --distribution-config '{
    "CallerReference": "gazeprotocol-com-2026-03-26",
    "Aliases": {
      "Quantity": 1,
      "Items": ["gazeprotocol.com"]
    },
    "DefaultRootObject": "index.html",
    "Origins": {
      "Quantity": 1,
      "Items": [{
        "Id": "gazeprotocol-com-s3",
        "DomainName": "gazeprotocol-com-site.s3.us-east-1.amazonaws.com",
        "S3OriginConfig": {"OriginAccessIdentity": ""},
        "OriginAccessControlId": "<OAC_ID>"
      }]
    },
    "DefaultCacheBehavior": {
      "TargetOriginId": "gazeprotocol-com-s3",
      "ViewerProtocolPolicy": "redirect-to-https",
      "AllowedMethods": {"Quantity": 2, "Items": ["GET", "HEAD"], "CachedMethods": {"Quantity": 2, "Items": ["GET", "HEAD"]}},
      "CachePolicyId": "658327ea-f89d-4fab-a63d-7e88639e58f6",
      "Compress": true
    },
    "CustomErrorResponses": {
      "Quantity": 2,
      "Items": [
        {"ErrorCode": 403, "ResponsePagePath": "/index.html", "ResponseCode": "200", "ErrorCachingMinTTL": 0},
        {"ErrorCode": 404, "ResponsePagePath": "/index.html", "ResponseCode": "200", "ErrorCachingMinTTL": 0}
      ]
    },
    "HttpVersion": "http2and3",
    "PriceClass": "PriceClass_100",
    "ViewerCertificate": {
      "ACMCertificateArn": "<CERT_ARN>",
      "SSLSupportMethod": "sni-only",
      "MinimumProtocolVersion": "TLSv1.2_2021"
    },
    "Enabled": true,
    "Comment": "gazeprotocol.com landing page"
  }' \
  --query 'Distribution.{Id:Id,Domain:DomainName}' \
  --output json
```

Save the **Distribution ID** and **CloudFront domain** (e.g., `d1234abcd.cloudfront.net`).

---

### Step 6: S3 Bucket Policy (Allow CloudFront OAC)

Get your AWS account ID:
```bash
aws sts get-caller-identity --query Account --output text
```

Apply the bucket policy:
```bash
aws s3api put-bucket-policy \
  --bucket gazeprotocol-com-site \
  --policy '{
    "Version": "2012-10-17",
    "Statement": [{
      "Sid": "AllowCloudFrontOAC",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::gazeprotocol-com-site/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::<ACCOUNT_ID>:distribution/<DISTRIBUTION_ID>"
        }
      }
    }]
  }'
```

---

### Step 7: Route53 DNS Records (A + AAAA ALIAS)

```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id <ZONE_ID> \
  --change-batch '{
    "Changes": [
      {
        "Action": "UPSERT",
        "ResourceRecordSet": {
          "Name": "gazeprotocol.com",
          "Type": "A",
          "AliasTarget": {
            "HostedZoneId": "Z2FDTNDATAQYW2",
            "DNSName": "<CLOUDFRONT_DOMAIN>",
            "EvaluateTargetHealth": false
          }
        }
      },
      {
        "Action": "UPSERT",
        "ResourceRecordSet": {
          "Name": "gazeprotocol.com",
          "Type": "AAAA",
          "AliasTarget": {
            "HostedZoneId": "Z2FDTNDATAQYW2",
            "DNSName": "<CLOUDFRONT_DOMAIN>",
            "EvaluateTargetHealth": false
          }
        }
      }
    ]
  }'
```

> **Note:** `Z2FDTNDATAQYW2` is the fixed hosted zone ID for ALL CloudFront distributions.

---

### Step 8: Verify

Wait for CloudFront distribution to be deployed:
```bash
aws cloudfront wait distribution-deployed \
  --id <DISTRIBUTION_ID>
```

Test DNS resolution:
```bash
dig gazeprotocol.com A
dig gazeprotocol.com AAAA
curl -I https://gazeprotocol.com
```

---

## Resource IDs to Record

After provisioning, record these in GitHub Secrets for the deploy workflow:

| Resource | Value | GitHub Secret Name |
|---|---|---|
| ACM Certificate ARN | `arn:aws:acm:us-east-1:...` | — (used in CloudFront config) |
| S3 Bucket Name | `gazeprotocol-com-site` | `S3_BUCKET_NAME` |
| CloudFront Distribution ID | `E...` | `CLOUDFRONT_DISTRIBUTION_ID` |
| CloudFront Domain | `d....cloudfront.net` | — (for DNS verification) |
| Route53 Zone ID | `Z...` | — (for DNS management) |
| AWS IAM Role ARN | `arn:aws:iam::...:role/...` | `AWS_ROLE_ARN` |

> **Note:** `AWS_ROLE_ARN` and `CLOUDFRONT_DISTRIBUTION_ID` are required by the GitHub Actions deploy workflow (`.github/workflows/deploy.yml`). See issue #1 for the full secrets checklist.

---

## IAM Role for GitHub Actions (OIDC)

The deploy workflow uses OIDC to assume an IAM role. Create a role with:

**Trust Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Federated": "arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com"},
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {"token.actions.githubusercontent.com:aud": "sts.amazonaws.com"},
      "StringLike": {"token.actions.githubusercontent.com:sub": "repo:GravitonINC/gaze-landing:*"}
    }
  }]
}
```

**Permissions Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:DeleteObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::gazeprotocol-com-site",
        "arn:aws:s3:::gazeprotocol-com-site/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": "cloudfront:CreateInvalidation",
      "Resource": "arn:aws:cloudfront::<ACCOUNT_ID>:distribution/<DISTRIBUTION_ID>"
    }
  ]
}
```

---

## Critical Notes

1. **ACM cert MUST be in `us-east-1`** — CloudFront only accepts certs from us-east-1
2. **Use OAC, NOT legacy OAI** — OAI is deprecated; OAC is the current standard
3. **S3 bucket: NO static website hosting** — OAC uses the S3 REST API endpoint, not the website endpoint
4. **CloudFront hosted zone ID is always `Z2FDTNDATAQYW2`** for Route53 ALIAS records
5. **ACM cert must be ISSUED before creating CloudFront distribution** — cert validation can take 5-30 minutes
6. **Route53 hosted zone for `gazeprotocol.com` already exists** — do not create a new one

---

## Checklist

- [ ] ACM certificate requested (us-east-1)
- [ ] DNS validation CNAMEs created in Route53
- [ ] ACM certificate status: ISSUED
- [ ] S3 bucket `gazeprotocol-com-site` created (us-east-1, all public access blocked)
- [ ] CloudFront OAC created
- [ ] CloudFront distribution created (HTTP/2+3, PriceClass_100, custom errors 403/404→/index.html)
- [ ] S3 bucket policy updated (allow CloudFront OAC)
- [ ] Route53 A + AAAA ALIAS records created → CloudFront
- [ ] CloudFront distribution status: Deployed
- [ ] DNS resolves correctly (`dig gazeprotocol.com`)
- [ ] HTTPS works (`curl -I https://gazeprotocol.com`)
- [ ] GitHub Secrets set: `CLOUDFRONT_DISTRIBUTION_ID`, `AWS_ROLE_ARN`, `S3_BUCKET_NAME`
- [ ] Resource IDs reported to #gaze-development
