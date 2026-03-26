# gaze-landing Infrastructure

## Overview

The Gaze Protocol landing page (`gazeprotocol.com`) is deployed as a static site on AWS using:

- **S3** — Static file hosting (private bucket, no public access)
- **CloudFront** — CDN with HTTPS, Origin Access Control (OAC)
- **ACM** — TLS certificate for `gazeprotocol.com` and `www.gazeprotocol.com`
- **Route53** — DNS ALIAS records pointing to CloudFront
- **GitHub OIDC** — Secure CI/CD deployments without long-lived AWS credentials

---

## Architecture

```
Browser
  │
  ▼
Route53 (gazeprotocol.com / www.gazeprotocol.com)
  │  ALIAS A + AAAA records
  ▼
CloudFront Distribution
  │  HTTPS only (redirect HTTP → HTTPS)
  │  ACM cert: gazeprotocol.com + www.gazeprotocol.com (us-east-1)
  │  Default root object: index.html
  │  Custom error: 404 → /404.html
  │
  ▼ (Origin Access Control)
S3 Bucket: gazeprotocol-com-site
  │  Private (block all public access)
  │  Versioning: enabled
  │  Bucket policy: allow CloudFront OAC principal only
  ▼
Static files (Astro build output: dist/)
```

---

## Required AWS Resources

### 1. ACM Certificate
- **Region:** `us-east-1` (REQUIRED for CloudFront)
- **Domains:** `gazeprotocol.com`, `www.gazeprotocol.com`
- **Validation:** DNS (Route53 CNAME records)
- **Status required:** `ISSUED` before CloudFront can use it

### 2. S3 Bucket
- **Name:** `gazeprotocol-com-site`
- **Region:** `us-east-1` (or `us-west-2` — CloudFront is global)
- **Public access:** BLOCKED (all 4 settings)
- **Versioning:** Enabled
- **Bucket policy:** Allow CloudFront OAC `s3:GetObject` only

### 3. CloudFront Distribution
- **Origin:** S3 bucket via OAC (NOT legacy OAI)
- **Default root object:** `index.html`
- **Custom error responses:**
  - 403 → `/index.html` (200) — for SPA-style routing
  - 404 → `/404.html` (404)
- **Viewer protocol:** Redirect HTTP to HTTPS
- **Alternate domain names:** `gazeprotocol.com`, `www.gazeprotocol.com`
- **ACM certificate:** ARN from step 1
- **Price class:** `PriceClass_100` (US/EU/Asia)
- **Cache policy:** `CachingOptimized` (managed)

### 4. Route53 DNS
- **Zone:** `gazeprotocol.com` (must exist)
- **Records:**
  - `gazeprotocol.com` → ALIAS A → CloudFront distribution domain
  - `gazeprotocol.com` → ALIAS AAAA → CloudFront distribution domain
  - `www.gazeprotocol.com` → ALIAS A → CloudFront distribution domain
  - `www.gazeprotocol.com` → ALIAS AAAA → CloudFront distribution domain

### 5. GitHub OIDC Provider
- **Provider URL:** `https://token.actions.githubusercontent.com`
- **Audience:** `sts.amazonaws.com`
- **IAM Role:** `gaze-landing-github-actions-deploy`
  - Trust policy: GitHub Actions OIDC for `GravitonINC/gaze-landing`
  - Permissions:
    - `s3:PutObject`, `s3:DeleteObject`, `s3:ListBucket` on `gazeprotocol-com-site`
    - `cloudfront:CreateInvalidation` on the distribution

### 6. GitHub Repository Secret
- **Secret name:** `CLOUDFRONT_DISTRIBUTION_ID`
- **Value:** CloudFront distribution ID (e.g., `E1ABCDEF123456`)
- **Also needed:** `AWS_ROLE_ARN` (the OIDC role ARN)

---

## Deploy Workflow (`.github/workflows/deploy.yml`)

The deploy workflow expects:
- `AWS_ROLE_ARN` secret — OIDC role to assume
- `CLOUDFRONT_DISTRIBUTION_ID` secret — for cache invalidation
- S3 bucket named `gazeprotocol-com-site`

Workflow steps:
1. Configure AWS credentials via OIDC (`aws-actions/configure-aws-credentials`)
2. Build Astro site (`npm run build`)
3. Sync `dist/` to S3 (`aws s3 sync dist/ s3://gazeprotocol-com-site --delete`)
4. Invalidate CloudFront cache (`aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*"`)

---

## Provisioning Checklist

- [ ] ACM certificate requested in `us-east-1`
- [ ] DNS validation CNAME records created in Route53
- [ ] ACM certificate status: `ISSUED`
- [ ] S3 bucket `gazeprotocol-com-site` created
- [ ] S3 bucket public access blocked
- [ ] S3 versioning enabled
- [ ] CloudFront distribution created with OAC
- [ ] S3 bucket policy updated to allow CloudFront OAC
- [ ] Route53 ALIAS A + AAAA records created for apex + www
- [ ] GitHub OIDC provider registered in AWS IAM
- [ ] IAM role `gaze-landing-github-actions-deploy` created
- [ ] `CLOUDFRONT_DISTRIBUTION_ID` secret set in GitHub repo
- [ ] `AWS_ROLE_ARN` secret set in GitHub repo
- [ ] Test deploy: push to main, verify CloudFront serves `gazeprotocol.com`

---

## Outputs (record after provisioning)

| Resource | Value |
|---|---|
| S3 Bucket | `gazeprotocol-com-site` |
| CloudFront Distribution ID | _TBD_ |
| CloudFront Domain | _TBD_ (e.g., `d1abc.cloudfront.net`) |
| ACM Certificate ARN | _TBD_ |
| Route53 Zone ID | _TBD_ |
| IAM Role ARN | _TBD_ |

---

## Notes

- ACM cert **must** be in `us-east-1` — CloudFront only reads certs from that region
- Use OAC (Origin Access Control), **not** legacy OAI — OAI is deprecated
- The S3 bucket does NOT need static website hosting enabled — CloudFront handles routing
- `www.gazeprotocol.com` should redirect to apex (or serve same content) — configure via CloudFront behaviors or Route53
- After first deploy, CloudFront propagation takes ~5-15 minutes globally

---

*Specification authored by Deployer agent. Provisioning requires human operator with AWS access.*
*Tracking: GravitonINC/gaze-landing#3*
