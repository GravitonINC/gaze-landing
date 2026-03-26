###############################################################################
# IAM OIDC — GitHub Actions federation for gaze-landing deploy workflow
#
# This creates an IAM role that GitHub Actions can assume via OIDC.
# The role grants S3 sync + CloudFront invalidation permissions.
#
# After apply, set GitHub secret:
#   AWS_ROLE_ARN = <output from terraform output iam_role_arn>
###############################################################################

data "aws_caller_identity" "current" {}

###############################################################################
# GitHub OIDC Provider (may already exist in your account — use data source
# if it does, or create it if it doesn't)
###############################################################################

# Check if the OIDC provider already exists before running:
#   aws iam list-open-id-connect-providers | grep token.actions.githubusercontent.com
# If it exists, import it:
#   terraform import aws_iam_openid_connect_provider.github <ARN>

resource "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"

  client_id_list = ["sts.amazonaws.com"]

  # GitHub's OIDC thumbprint (stable — verified 2024)
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]

  tags = {
    Project   = "gaze-landing"
    ManagedBy = "terraform"
  }

  lifecycle {
    # Prevent accidental deletion if shared with other repos
    prevent_destroy = true
  }
}

###############################################################################
# IAM Role — assumed by GitHub Actions via OIDC
###############################################################################

data "aws_iam_policy_document" "github_actions_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    # Restrict to the specific repo and main branch only
    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_org}/${var.github_repo}:ref:refs/heads/main"]
    }
  }
}

resource "aws_iam_role" "github_actions_deploy" {
  name               = "gaze-landing-github-actions-deploy"
  assume_role_policy = data.aws_iam_policy_document.github_actions_assume_role.json

  tags = {
    Project   = "gaze-landing"
    ManagedBy = "terraform"
  }
}

###############################################################################
# IAM Policy — S3 sync + CloudFront invalidation
###############################################################################

data "aws_iam_policy_document" "deploy_permissions" {
  # S3: sync dist/ to bucket
  statement {
    sid    = "S3SyncObjects"
    effect = "Allow"
    actions = [
      "s3:PutObject",
      "s3:GetObject",
      "s3:DeleteObject",
      "s3:ListBucket",
    ]
    resources = [
      aws_s3_bucket.site.arn,
      "${aws_s3_bucket.site.arn}/*",
    ]
  }

  # CloudFront: create cache invalidation
  statement {
    sid    = "CloudFrontInvalidate"
    effect = "Allow"
    actions = [
      "cloudfront:CreateInvalidation",
    ]
    resources = [
      aws_cloudfront_distribution.site.arn,
    ]
  }
}

resource "aws_iam_policy" "deploy" {
  name        = "gaze-landing-deploy-policy"
  description = "Allows GitHub Actions to sync S3 and invalidate CloudFront for gaze-landing"
  policy      = data.aws_iam_policy_document.deploy_permissions.json

  tags = {
    Project   = "gaze-landing"
    ManagedBy = "terraform"
  }
}

resource "aws_iam_role_policy_attachment" "deploy" {
  role       = aws_iam_role.github_actions_deploy.name
  policy_arn = aws_iam_policy.deploy.arn
}

###############################################################################
# Output
###############################################################################

output "iam_role_arn" {
  description = "IAM role ARN — set as GitHub secret AWS_ROLE_ARN"
  value       = aws_iam_role.github_actions_deploy.arn
}
