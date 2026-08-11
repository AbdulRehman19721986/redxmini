# deployment-bridge

This is a **public documentation and deployment-trigger repo**. It intentionally contains no application source code.

## What this is

The real project lives in a private repository. Render, Railway, and Heroku are each connected **directly** to that private repository through their own first-party GitHub integrations (installed on that one repo only, from each platform's dashboard). That connection is what actually deploys the app on every push — this repo is not in that path.

This repo exists only to:
- document the architecture and required environment variables (names only, no values)
- optionally let an authorized maintainer manually request a redeploy of the private repo, without ever seeing or holding the private source or the platform's real deploy credentials

## What this is *not*

- Not a mirror or copy of the private source.
- Not a place any real secret, token, or `.env` value is ever committed.
- Not required for deployment to work — Render/Railway/Heroku's native GitHub App integration on the private repo is sufficient on its own. This repo is a convenience front door, not a dependency.

## Architecture

```
private repo (source) ──push──> Render / Railway / Heroku (GitHub App, per-repo access)
                                        │
private repo's own GitHub Actions ─────┘  (deploy.yml: logs deployed commit, health check)

this public repo ──(optional, manual)──> workflow_dispatch on the private repo's deploy.yml
```

## Required environment variables (names only — set actual values in each platform's dashboard, never here)

```
MONGO_URL
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY
DATABASE_URL
TENOR_API_KEY
ADMIN_USERNAME
ADMIN_PASSWORD
OWNER_NUMBER
BOT_NAME
PREFIX
BOT_MODE
PORT
```

## Triggering a manual redeploy

If the optional `PRIVATE_REPO_DISPATCH_TOKEN` secret is configured on this repo (see `SECURITY.md`), go to the **Actions** tab → `Request redeploy` → **Run workflow**. This calls the private repo's `workflow_dispatch` endpoint; it does not build or deploy anything itself.

## Security model

See `SECURITY.md`.
