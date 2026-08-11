# REDX Deployment Bridge

> **This repository contains no application source code.**
> The real application lives in a private repository.
> Cloning this repo gives you only deployment tooling and documentation.

---

## What this is

A public deployment bridge for the REDX WhatsApp bot. It provides:

- A manual redeploy trigger (GitHub Actions `workflow_dispatch`)
- Deployment documentation
- Security guidance

The actual bot source, plugins, commands, database logic, and credentials are **private**.

---

## Architecture

```
PUBLIC REPO (this repo)
       │
       │  REDX_PRIVATE_REPO_TOKEN
       │  workflow_dispatch API call
       ▼
PRIVATE REPO
       │
       │  GitHub Actions (deploy.yml)
       │  checks out private source
       ▼
Render / Railway / Heroku
```

The public repo **never** receives, clones, or touches the private source.

---

## Quick setup

### 1. Configure the public repo workflow

Edit `.github/workflows/trigger-deploy.yml` and set:

```yaml
env:
  PRIVATE_REPO_OWNER: "your-github-username"
  PRIVATE_REPO_NAME:  "your-private-repo-name"
  PRIVATE_WORKFLOW_FILE: "deploy.yml"
  PRIVATE_REPO_REF: "main"
```

### 2. Create the dispatch token

See [SECURITY.md](./SECURITY.md) for exact steps.

Minimum permission required: **Actions: Read and write** on the private repo only.

### 3. Add the secret to this repo

Settings → Secrets and variables → Actions → New repository secret:

| Name | Value |
|------|-------|
| `REDX_PRIVATE_REPO_TOKEN` | your fine-grained PAT |

**This is the only secret this public repo needs.**

### 4. Copy `deploy.yml` to your private repo

Place `.github/workflows/deploy.yml` in your **private** repository.

Then configure variables and secrets in the **private** repo's Settings:

**Variables** (non-sensitive):

| Variable | Description |
|----------|-------------|
| `USE_RENDER` | `"true"` to enable Render |
| `USE_RAILWAY` | `"true"` to enable Railway |
| `USE_HEROKU` | `"true"` to enable Heroku |
| `HEROKU_APP_NAME` | your Heroku app name |
| `RAILWAY_PROJECT_ID` | Railway project ID |
| `RAILWAY_SERVICE_NAME` | Railway service name |
| `RAILWAY_ENVIRONMENT` | Railway environment (default: `production`) |
| `APP_URL` | your deployment URL for health checks |

**Secrets** (sensitive — private repo only):

| Secret | Description |
|--------|-------------|
| `RENDER_DEPLOY_HOOK` | Render deploy-hook URL |
| `RAILWAY_TOKEN` | Railway API token |
| `HEROKU_API_KEY` | Heroku API key |

---

## Manual redeploy

1. This repo → Actions → **Request redeploy** → Run workflow
2. Optionally enter a reason
3. The private repo's `deploy.yml` runs automatically

---

## Automatic deploy

The private repo's `deploy.yml` triggers on every push to `main`.
No action needed in this public repo for routine deployments.

---

## Rollback

### Render
Dashboard → your service → **Deploys** tab → click any past deploy → **Redeploy**

### Railway
Dashboard → your service → **Deployments** → find a previous deployment → **Rollback** (or redeploy from that commit SHA)

### Heroku
```bash
heroku releases -a YOUR_APP_NAME
heroku rollback vNN -a YOUR_APP_NAME   # where NN is the version number
```

---

## Which commit is deployed?

Every run of `deploy.yml` uploads an artifact named `deployed-commit-NNN` containing the deployed `GITHUB_SHA`. Check the private repo's Actions → the latest Deploy run → Artifacts.

---

## Security

See [SECURITY.md](./SECURITY.md) for the full threat model, token setup, and checklist.

No credentials of any kind belong in this public repository.
