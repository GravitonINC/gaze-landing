###############################################################################
# Gaze Landing — AWS Infrastructure (Terraform)
# Domain: gazeprotocol.com
# Stack: ACM + S3 + CloudFront + Route53
#
# Usage:
#   cd infra/
#   terraform init
#   terraform plan -var="hosted_zone_id=<YOUR_ZONE_ID>"
#   terraform apply -var="hosted_zone_id=<YOUR_ZONE_ID>"
#
# After apply, note the outputs and set GitHub secrets:
#   AWS_ROLE_ARN              → from IAM OIDC role (see iam.tf)
#   S3_BUCKET_NAME            → gazeprotocol-com-site
#   CLOUDFRONT_DISTRIBUTION_ID → from terraform output cloudfront_distribution_id
###############################################################################

terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Primary provider — us-east-1 (required for ACM + CloudFront)
provider "aws" {
  region = "us-east-1"
}

variable "hosted_zone_id" {
  description = "Route53 hosted zone ID for gazeprotocol.com"
  type        = string
}

variable "domain" {
  description = "Primary domain"
  type        = string
  default     = "gazeprotocol.com"
}

variable "www_domain" {
  description = "WWW subdomain"
  type        = string
  default     = "www.gazeprotocol.com"
}

variable "s3_bucket_name" {
  description = "S3 bucket name for site assets"
  type        = string
  default     = "gazeprotocol-com-site"
}

variable "github_org" {
  description = "GitHub organization for OIDC trust"
  type        = string
  default     = "GravitonINC"
}

variable "github_repo" {
  description = "GitHub repository for OIDC trust"
  type        = string
  default     = "gaze-landing"
}

###############################################################################
# ACM Certificate (must be in us-east-1 for CloudFront)
###############################################################################

resource "aws_acm_certificate" "site" {
  domain_name               = var.domain
  subject_alternative_names = [var.www_domain]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Project = "gaze-landing"
    ManagedBy = "terraform"
  }
}

resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.site.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = var.hosted_zone_id
}

resource "aws_acm_certificate_validation" "site" {
  certificate_arn         = aws_acm_certificate.site.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}

###############################################################################
# S3 Bucket (private — served via CloudFront OAC only)
###############################################################################

resource "aws_s3_bucket" "site" {
  bucket = var.s3_bucket_name

  tags = {
    Project   = "gaze-landing"
    ManagedBy = "terraform"
  }
}

resource "aws_s3_bucket_public_access_block" "site" {
  bucket = aws_s3_bucket.site.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "site" {
  bucket = aws_s3_bucket.site.id
  versioning_configuration {
    status = "Enabled"
  }
}

###############################################################################
# CloudFront Origin Access Control (OAC)
###############################################################################

resource "aws_cloudfront_origin_access_control" "site" {
  name                              = "gaze-landing-oac"
  description                       = "OAC for gazeprotocol.com S3 origin"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

###############################################################################
# CloudFront Distribution
###############################################################################

resource "aws_cloudfront_distribution" "site" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  aliases             = [var.domain, var.www_domain]
  price_class         = "PriceClass_100"  # US, Canada, Europe

  origin {
    domain_name              = aws_s3_bucket.site.bucket_regional_domain_name
    origin_id                = "S3-${var.s3_bucket_name}"
    origin_access_control_id = aws_cloudfront_origin_access_control.site.id
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${var.s3_bucket_name}"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 86400    # 1 day
    max_ttl     = 31536000 # 1 year
  }

  # SPA fallback — serve index.html for 403/404 (Astro static routing)
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.site.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Project   = "gaze-landing"
    ManagedBy = "terraform"
  }

  depends_on = [aws_acm_certificate_validation.site]
}

###############################################################################
# S3 Bucket Policy — allow CloudFront OAC
###############################################################################

data "aws_iam_policy_document" "s3_cloudfront" {
  statement {
    sid    = "AllowCloudFrontOAC"
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.site.arn}/*"]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.site.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "site" {
  bucket = aws_s3_bucket.site.id
  policy = data.aws_iam_policy_document.s3_cloudfront.json
}

###############################################################################
# Route53 DNS Records
###############################################################################

resource "aws_route53_record" "apex_a" {
  zone_id = var.hosted_zone_id
  name    = var.domain
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "apex_aaaa" {
  zone_id = var.hosted_zone_id
  name    = var.domain
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www_a" {
  zone_id = var.hosted_zone_id
  name    = var.www_domain
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www_aaaa" {
  zone_id = var.hosted_zone_id
  name    = var.www_domain
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}

###############################################################################
# IAM OIDC — GitHub Actions federation
# (See iam.tf for the full role definition)
###############################################################################

###############################################################################
# Outputs
###############################################################################

output "s3_bucket_name" {
  description = "S3 bucket name — set as GitHub secret S3_BUCKET_NAME"
  value       = aws_s3_bucket.site.id
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID — set as GitHub secret CLOUDFRONT_DISTRIBUTION_ID"
  value       = aws_cloudfront_distribution.site.id
}

output "cloudfront_domain" {
  description = "CloudFront domain name"
  value       = aws_cloudfront_distribution.site.domain_name
}

output "certificate_arn" {
  description = "ACM certificate ARN"
  value       = aws_acm_certificate.site.arn
}

output "site_url" {
  description = "Live site URL"
  value       = "https://${var.domain}"
}
