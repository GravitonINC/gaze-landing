# gaze-landing Infrastructure

## Overview

The Gaze Protocol landing page (`gazeprotocol.com`) is deployed as a static site on AWS using:

- **ACM** — TLS certificate for `gazeprotocol.com` and `*.gazeprotocol.com` (us-east-1)
- **S3** — Static file hosting (private bucket, no public access, no static website hosting)
- **CloudFront** — CDN with HTTPS, Origin Access Control (OAC), HTTP/2+3
- **Route53** — DNS ALIAS A + AAAA records pointing to CloudFront

---

## Architecture

```
Browser
  │
  ▼
Route53 (gazeprotocol.com)
  │  ALIAS A + AAAA records
  ▼
CloudFront Distribution
  │  HTTPS only (redirect HTTP → HTTPS)
  │  ACM cert: gazeprotocol.com + *.gazeprotocol.com (us-east-1)
  │  Default root object: index.html
  │  Custom errors: 403 → /index.html (200), 404 → /index.html (200)
  │  Price class: PriceClass_100
  │  HTTP/2 + HTTP/3 enabled
  │
  ▼ (Origin Access Control — signing: Always, type: S3)
S3 Bucket: gazeprotocol-com-site (us-east-1)
  │  Private (block ALL public access)
  │  No static website hosting
  │  Bucket policy: allow CloudFront OAC principal s3:GetObject only
  ▼
Static files (Astro build output: dist/)
```

---

## Execution Order (MUST follow this sequence)

1. **Request ACM certificate** in `us-east-1` for `gazeprotocol.com` + `*.gazeprotocol.com` with DNS validation
2. **Create DNS validation CNAME records** in Route53 hosted zone
3. **Poll ACM cert status** until `ISSUED` (may take 5–30 min — cert must be ISSUED before CloudFront)
4. **Create S3 bucket** `gazeprotocol-com-site` with all public access blocked
5. **Create CloudFront OAC** (signing behavior: Always sign, origin type: S3)
6. **Create CloudFront distribution** (origin: S3 via OAC, root: index.html, alt domain: gazeprotocol.com, cert: ACM from step 1, price class: PriceClass_100, HTTP/2+3, custom errors 403/404 → /index.html 200)
7. **Update S3 bucket policy** to allow CloudFront OAC principal `s3:GetObject`
8. **Create Route53 A + AAAA ALIAS records** for `gazeprotocol.com` → CloudFront distribution
9. **Verify** CloudFront distribution status is `Deployed` and DNS resolves correctly

---

## Required AWS Resources

### 1. ACM Certificate
- **Region:** `us-east-1` (**REQUIRED** for CloudFront — no exceptions)
- **Domains:** `gazeprotocol.com` (primary), `*.gazeprotocol.com` (SAN)
- **Validation:** DNS (Route53 CNAME records)
- **Status required:** `ISSUED` before CloudFront distribution can be created

### 2. S3 Bucket
- **Name:** `gazeprotocol-com-site`
- **Region:** `us-east-1`
- **Public access:** BLOCKED (all 4 settings — `BlockPublicAcls`, `IgnorePublicAcls`, `BlockPublicPolicy`, `RestrictPublicBuckets`)
- **Static website hosting:** DISABLED (CloudFront handles routing)
- **Versioning:** Optional

### 3. CloudFront Origin Access Control (OAC)
- **Name:** `gazeprotocol-com-oac` (or similar)
- **Signing behavior:** Always sign
- **Origin type:** S3
- **Signing protocol:** SigV4

### 4. CloudFront Distribution
- **Origin:** S3 bucket `gazeprotocol-com-site` via OAC (NOT legacy OAI)
- **Default root object:** `index.html`
- **Custom error responses:**
  - HTTP 403 → `/index.html` (response code: 200)
  - HTTP 404 → `/index.html` (response code: 200)
- **Viewer protocol policy:** Redirect HTTP to HTTPS
- **Alternate domain names (CNAMEs):** `gazeprotocol.com`
- **ACM certificate:** ARN from step 1
- **Price class:** `PriceClass_100` (US, Canada, Europe)
- **HTTP versions:** HTTP/2 + HTTP/3

### 5. S3 Bucket Policy
Allow CloudFront OAC principal to `s3:GetObject` on the bucket:

```json
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
      "Resource": "arn:aws:s3:::gazeprotocol-com-site/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::<ACCOUNT_ID>:distribution/<DISTRIBUTION_ID>"
        }
      }
    }
  ]
}
```

### 6. Route53 DNS
- **Zone:** `gazeprotocol.com` (hosted zone already exists)
- **Records to create:**
  - `gazeprotocol.com` → ALIAS A → CloudFront distribution domain (e.g., `d1abc.cloudfront.net`)
  - `gazeprotocol.com` → ALIAS AAAA → CloudFront distribution domain
- **CloudFront hosted zone ID for ALIAS:** `Z2FDTNDATAQYW2` (this is the fixed AWS CloudFront zone ID)

---

## GitHub Actions Deploy Workflow

The deploy workflow (`.github/workflows/deploy.yml`) needs these GitHub repository secrets:

| Secret | Value |
|---|---|
| `AWS_ACCESS_KEY_ID` | IAM user access key with S3 + CloudFront permissions |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront distribution ID (e.g., `E1ABCDEF123456`) |

> **Note:** The current workflow uses static IAM credentials. For improved security, consider migrating to GitHub OIDC (see OIDC section below). Either approach works — static credentials are simpler to set up initially.

### Minimum IAM Permissions Required

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

### Optional: GitHub OIDC (No Long-Lived Credentials)

If using OIDC instead of static credentials:
- Register GitHub OIDC provider: `https://token.actions.githubusercontent.com` (audience: `sts.amazonaws.com`)
- Create IAM role `gaze-landing-github-actions-deploy` with trust policy for `GravitonINC/gaze-landing`
- Replace `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` secrets with `AWS_ROLE_ARN`
- Update workflow to use `role-to-assume` instead of static credentials

---

## Provisioning Checklist

### Phase 1: Certificate
- [ ] ACM certificate requested in `us-east-1` for `gazeprotocol.com` + `*.gazeprotocol.com`
- [ ] DNS validation CNAME records created in Route53 hosted zone
- [ ] ACM certificate status: `ISSUED` ← **MUST complete before Phase 2**

### Phase 2: Storage
- [ ] S3 bucket `gazeprotocol-com-site` created in `us-east-1`
- [ ] All public access blocked (4 settings)
- [ ] Static website hosting: disabled

### Phase 3: CDN
- [ ] CloudFront OAC created (signing: Always, type: S3)
- [ ] CloudFront distribution created with all settings above
- [ ] S3 bucket policy updated to allow CloudFront OAC `s3:GetObject`

### Phase 4: DNS
- [ ] Route53 ALIAS A record: `gazeprotocol.com` → CloudFront
- [ ] Route53 ALIAS AAAA record: `gazeprotocol.com` → CloudFront

### Phase 5: GitHub Secrets
- [ ] `AWS_ACCESS_KEY_ID` set in GravitonINC/gaze-landing repo secrets
- [ ] `AWS_SECRET_ACCESS_KEY` set in GravitonINC/gaze-landing repo secrets
- [ ] `CLOUDFRONT_DISTRIBUTION_ID` set in GravitonINC/gaze-landing repo secrets

### Phase 6: Verification
- [ ] CloudFront distribution status: `Deployed`
- [ ] `https://gazeprotocol.com` resolves and serves content
- [ ] TLS certificate valid (no browser warnings)
- [ ] Custom error pages working (404 → index.html)

---

## Outputs (record after provisioning — needed for issue #1 GitHub Actions secrets)

| Resource | Value |
|---|---|
| S3 Bucket | `gazeprotocol-com-site` |
| CloudFront Distribution ID | _TBD — record here_ |
| CloudFront Domain | _TBD (e.g., `d1abc.cloudfront.net`)_ |
| ACM Certificate ARN | _TBD_ |
| Route53 Zone ID | _TBD_ |
| IAM User/Role ARN | _TBD_ |

---

## Critical Notes

- ACM cert **must** be in `us-east-1` — CloudFront only reads certs from that region
- Use OAC (Origin Access Control), **not** legacy OAI — OAI is deprecated
- The S3 bucket does **not** need static website hosting — CloudFront handles all routing
- Custom errors 403 + 404 both map to `/index.html` with HTTP 200 — this handles SPA-style client-side routing
- After CloudFront distribution is created, propagation takes ~5–15 minutes globally
- The Route53 hosted zone for `gazeprotocol.com` already exists — do not create a new one

---

*Specification authored by Deployer agent. Provisioning requires human operator with AWS console/CLI access.*
*Tracking: GravitonINC/gaze-landing#3*
*Last updated: 2026-03-26*
