# CLAUDE.md — gaze-landing

> Project-level instructions for AI coding tools working in this repository.

## PR Auto-Merge (Mandatory)

After every `gh pr create`, immediately enable GitHub's native auto-merge:

```bash
gh pr merge <PR_NUMBER> --auto --squash
```

This queues the PR to merge automatically once all required status checks pass.
Do not skip this step.

## IAM Policy Changes

IAM policy changes require the **admin role** and a **manual approval gate**:

1. Edit `infra/iam-policy-github-actions.json` or `infra/apply-iam-policy.sh` in a PR.
2. After merge, go to **Actions → Apply IAM Policy (admin only)** and trigger it manually via `workflow_dispatch`.
3. The workflow runs under `environment: admin` — a human approver must approve it in GitHub before AWS credentials are issued.
4. The workflow assumes `AWS_ADMIN_ROLE_ARN` (not the deploy role). This secret must be set by a repository admin.

**Never** grant IAM management permissions to the deploy role (`AWS_ROLE_ARN`). The separation is intentional.

## Repo Notes

- Default branch: `main`
- Keep changes narrowly scoped to the issue you were assigned.
- Open a PR for every branch you push.
