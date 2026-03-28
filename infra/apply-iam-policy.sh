#!/usr/bin/env bash
# Applies the S3 deploy IAM policy to github-actions-user.
# Requires AWS CLI configured with credentials that have iam:CreatePolicy
# and iam:AttachUserPolicy permissions.
#
# Usage: ./infra/apply-iam-policy.sh

set -euo pipefail

POLICY_NAME="GithubActionsS3Deploy"
IAM_USER="github-actions-user"
POLICY_FILE="$(dirname "$0")/iam-policy-github-actions.json"
ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"

echo "Creating IAM policy ${POLICY_NAME} in account ${ACCOUNT_ID}..."
POLICY_ARN="$(aws iam create-policy \
  --policy-name "${POLICY_NAME}" \
  --policy-document "file://${POLICY_FILE}" \
  --query 'Policy.Arn' \
  --output text)"

echo "Attaching policy ${POLICY_ARN} to user ${IAM_USER}..."
aws iam attach-user-policy \
  --user-name "${IAM_USER}" \
  --policy-arn "${POLICY_ARN}"

echo "Done. ${IAM_USER} now has the required S3 deploy permissions."
