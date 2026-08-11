# Security model — REDX Deployment Bridge

## What this repository is

This is a **public deployment bridge** for the REDX bot. It contains:

- A workflow that can request a redeploy from the private repository
- Documentation and security guidance

It does **not** contain:

- Application source code
- Bot plugins or commands
- Database credentials
- API keys
- Private repository contents
- Any encrypted copy of private source

---

## Threat model

| Threat | Outcome |
|--------|---------|
| Someone clones this repo | Gets docs and a workflow file. No source, no secrets. |
| Someone reads all workflow files | Sees a reference to `secrets.REDX_PRIVATE_REPO_TOKEN` — GitHub never exposes secret values in logs or to repo viewers. |
| Someone submits a malicious PR | `pull_request` workflows from forks cannot access Actions secrets (GitHub default). This repo does not use `pull_request_target`. |
| Someone modifies this repo's workflow | At most they could trigger `workflow_dispatch` more often. They cannot change what the private deploy workflow does — that logic and its secrets live in the private repo. |
| Someone obtains `REDX_PRIVATE_REPO_TOKEN` | Scoped to **Actions: Read and write** on the private repository only. Cannot read source, push code, or read/write secrets. Rotate immediately if compromised. |
| Repeated trigger abuse | `workflow_dispatch` runs are subject to GitHub's Actions concurrency. The private `deploy.yml` uses `concurrency: group: deploy-production` so repeated triggers queue, not pile up. |
| Deployment fails | No secret values appear in logs. The curl command never prints the token. |

---

## The dispatch token

### Name

```
REDX_PRIVATE_REPO_TOKEN
```

This is the **only** custom secret in this repository.

### What it is

A **fine-grained GitHub Personal Access Token** (PAT) with the minimum permission required to call:

```
POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches
```

### Minimum required permission

| Permission | Level |
|-----------|-------|
| Actions | Read and write |
| All other permissions | No access |

**Important:** The token needs **no** `Contents` permission. It cannot read any source code in the private repository. It can only request that an already-configured workflow starts running.

### How to create it

1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → **Generate new token**
2. Token name: `redx-deploy-bridge` (or similar)
3. Resource owner: your account
4. Repository access: **Only select repositories** → select the **private** repository only
5. Permissions → Repository permissions:
   - **Actions: Read and write** ← only this
   - Every other permission: **No access**
6. Set an expiration date (90 days recommended)
7. Generate and copy the token value **once**

### How to add it to this repo

1. This repo → Settings → Secrets and variables → Actions → **New repository secret**
2. Name: `REDX_PRIVATE_REPO_TOKEN` (exact spelling, all caps)
3. Value: paste the token

The token is **never** committed to any file.

---

## Verification checklist

```
[ ] REDX_PRIVATE_REPO_TOKEN is the only Actions secret in this repo
[ ] No application source exists in this repository
[ ] No database credentials exist in any file
[ ] No API keys exist in any file
[ ] Private repository is set to private (check GitHub settings)
[ ] Token has Actions: Read and write on the private repo only
[ ] Token has no Contents, Administration, or Secrets permissions
[ ] Pull requests to this repo cannot access REDX_PRIVATE_REPO_TOKEN
[ ] Logs do not print the token value
[ ] Token has an expiration date and a rotation reminder set
[ ] Token is rotated if ever exposed or compromised
```

---

## Credential rotation

If `REDX_PRIVATE_REPO_TOKEN` is compromised:

1. GitHub → Settings → Developer settings → Fine-grained tokens → find the token → **Revoke**
2. Create a replacement token following the steps above
3. Update the secret in this repo's Settings → Secrets and variables → Actions

---

## Secrets that belong in the PRIVATE repository only

These are application secrets. They must **never** appear in this public repo:

```
MONGO_URL
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY
TENOR_API_KEY
ADMIN_USERNAME
ADMIN_PASSWORD
RENDER_DEPLOY_HOOK
RAILWAY_TOKEN
HEROKU_API_KEY
```

Set them in the private repo's Settings → Secrets, or in each platform's dashboard (Render, Railway, Heroku environment variables).

---

## Reporting a security issue

Open a private security advisory on this repository, or contact the maintainer directly. Do not open a public issue for security concerns.
