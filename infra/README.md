# Infrastructure Operations — gaze-landing

This directory contains AWS infrastructure definitions and scripts for
the `gaze-landing` deployment.

## IAM Policy Setup

**`iam-policy-github-actions.json`** — the managed IAM policy that grants
`github-actions-user` S3 + CloudFront deploy permissions.

**`apply-iam-policy.sh`** — idempotent script to create or update the policy
and attach it to `github-actions-user`.

### How to apply IAM changes

IAM changes **cannot** be applied by the standard deploy role
(`gaze-landing-github-deploy`). That role is intentionally scoped to S3 and
CloudFront only. Attempting to run IAM operations with it will fail with
`AccessDenied`.

Instead, use the dedicated **Apply IAM Policy** workflow
(`.github/workflows/apply-iam-policy.yml`):

1. Go to **Actions → Apply IAM Policy (admin only)** in the GitHub UI.
2. Click **Run workflow**.
3. The `infra-admin` environment requires manual approval — a repo admin must
   approve the deployment gate before the job runs.
4. The workflow assumes the role in `AWS_INFRA_ADMIN_ROLE_ARN` (set in the
   `infra-admin` environment secrets), applies the policy, and exits.

### One-time environment setup (repo admin required)

Before the workflow can succeed, a repo admin must configure the
`infra-admin` environment:

1. **Create the `infra-admin` GitHub environment**
   - Go to **Settings → Environments → New environment** → name it
     `infra-admin`.
   - Add **Required reviewers** (at least one repo admin) so the workflow
     cannot run without approval.
   - Set the **Deployment branch policy** to `main` only.

2. **Create the `gaze-infra-admin` IAM role in AWS**
   The role must:
   - Trust the GitHub OIDC provider
     (`token.actions.githubusercontent.com`)
   - Restrict the subject claim to this workflow:
     ```
     repo:GravitonINC/gaze-landing:environment:infra-admin
     ```
   - Allow at minimum:
     ```json
     {
       "Effect": "Allow",
       "Action": [
         "iam:CreatePolicy",
         "iam:GetPolicy",
         "iam:CreatePolicyVersion",
         "iam:ListPolicyVersions",
         "iam:DeletePolicyVersion",
         "iam:AttachUserPolicy",
         "sts:GetCallerIdentity"
       ],
       "Resource": "*"
     }
     ```

3. **Set the `AWS_INFRA_ADMIN_ROLE_ARN` secret**
   In the `infra-admin` environment secrets, add:
   ```
   AWS_INFRA_ADMIN_ROLE_ARN = arn:aws:iam::<account-id>:role/gaze-infra-admin
   ```
   **Do NOT reuse `AWS_ROLE_ARN`** (the deploy role) — that role does not
   have IAM write permissions and will fail.

4. **Set `CLOUDFRONT_DISTRIBUTION_ID`** in the `infra-admin` environment
   secrets (copy from the repo-level secret of the same name).

### Principle of least privilege

| Role | Permissions | Used by |
|------|-------------|---------|
| `gaze-landing-github-deploy` | S3 + CloudFront only | `deploy.yml` (on every push to main) |
| `gaze-infra-admin` | IAM write (scoped) | `apply-iam-policy.yml` (manual, approval-gated) |

The deploy role must **never** be granted IAM write permissions.
IAM self-escalation (`iam:CreatePolicy` from the role being deployed) is a
security anti-pattern and will always be denied by AWS permission boundaries.

