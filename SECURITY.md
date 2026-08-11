# Security model

## What this repo can and cannot do

This repo holds **no application source and no deploy credentials**. The only credential it can optionally hold is a single fine-grained GitHub PAT used to *ask* the private repo's own workflow to run — it cannot read the private repo's contents with that token.

## Threat model

| Threat | Outcome |
|---|---|
| Someone clones this repo | They get docs and a workflow file. No source, no secrets. |
| Someone reads every workflow file here | They see a reference to `secrets.PRIVATE_REPO_DISPATCH_TOKEN` — GitHub never exposes secret values in logs, workflow files, or to viewers without repo-secret-write access. |
| Someone reads this repo's settings/variables | No private credentials are stored as repo variables — only the one PAT, stored as a secret, never a variable. |
| Someone submits a malicious PR to this repo | Actions secrets are not available to `pull_request` workflows triggered from forks (GitHub default). This repo does not use `pull_request_target`, which is the usual way that protection gets accidentally bypassed. |
| Someone modifies this repo's deploy-trigger workflow | At most, they could try to fire `workflow_dispatch` on the private repo more often. They cannot change what that workflow does — that logic and its own secrets live in the private repo. |
| Someone obtains the dispatch PAT | It's scoped to **Actions: Read and write** on the private repository only — no `Contents`, no other repos, no org access. It can trigger a run of an existing workflow; it cannot read source, push code, or read/write secrets. Rotate it via GitHub → Settings → Developer settings → Fine-grained tokens. |
| Someone abuses the trigger repeatedly | `workflow_dispatch` runs are subject to GitHub's normal Actions concurrency/queueing; add a `concurrency` group in the private repo's `deploy.yml` (already included in the generated version) so repeated triggers queue rather than pile up. |

## Setting up the optional dispatch token

1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token.
2. Resource owner: your account. Repository access: **Only select repositories** → the private repo.
3. Permissions → Repository permissions → **Actions: Read and write**. Leave every other permission at "No access," including Contents.
4. Set an expiration date.
5. Copy the token once, then add it to **this repo's** Settings → Secrets and variables → Actions as `PRIVATE_REPO_DISPATCH_TOKEN`. It is never committed to any file.

## Verification checklist

```
[ ] No secrets in this repository (only PRIVATE_REPO_DISPATCH_TOKEN as an Actions secret, if used at all)
[ ] No private source in this repository
[ ] No credentials in client-side code
[ ] Private repository remains private (verify in its GitHub settings)
[ ] Dispatch token has minimum permissions (Actions: Read & write, one repo, nothing else)
[ ] Pull requests to this repo cannot access the dispatch token
[ ] Logs do not print the token value
[ ] Token has an expiration date and a rotation reminder
```
