#!/usr/bin/env bash
# Applies the S3 deploy IAM policy to github-actions-user.
# Requires AWS CLI configured with credentials that have iam:CreatePolicy,
# iam:GetPolicy, iam:CreatePolicyVersion, and iam:AttachUserPolicy permissions.
#
# Usage: ./infra/apply-iam-policy.sh

set -euo pipefail

POLICY_NAME="GithubActionsS3Deploy"
IAM_USER="github-actions-user"
POLICY_FILE="$(dirname "$0")/iam-policy-github-actions.json"
ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
POLICY_ARN="arn:aws:iam::${ACCOUNT_ID}:policy/${POLICY_NAME}"

echo "Account: ${ACCOUNT_ID}"

# Create or update the managed policy
if aws iam get-policy --policy-arn "${POLICY_ARN}" &>/dev/null; then
  echo "Policy ${POLICY_NAME} already exists — deleting non-default versions..."
  aws iam list-policy-versions --policy-arn "${POLICY_ARN}" \
    --query 'Versions[?IsDefaultVersion==`false`].VersionId' --output text | \
    xargs -r -n1 aws iam delete-policy-version --policy-arn "${POLICY_ARN}" --version-id
  echo "Creating new policy version..."
  aws iam create-policy-version \
    --policy-arn "${POLICY_ARN}" \
    --policy-document "file://${POLICY_FILE}" \
    --set-as-default
else
  echo "Creating IAM policy ${POLICY_NAME}..."
  aws iam create-policy \
    --policy-name "${POLICY_NAME}" \
    --policy-document "file://${POLICY_FILE}" \
    --query 'Policy.Arn' \
    --output text
fi

# Attach to user (idempotent — no-op if already attached)
echo "Attaching policy ${POLICY_ARN} to user ${IAM_USER}..."
aws iam attach-user-policy \
  --user-name "${IAM_USER}" \
  --policy-arn "${POLICY_ARN}"

echo "Done. ${IAM_USER} now has the required S3 deploy permissions."
