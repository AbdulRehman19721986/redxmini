# 🔥 REDXBOT302 — Railway Deploy Bridge

> No source code here. Private source cloned at container startup.

## Railway setup

1. New Project → Deploy from GitHub repo → this public repo
2. **Variables** tab → add:

| Variable | Value |
|----------|-------|
| `REDX_PRIVATE_REPO_TOKEN` | fine-grained PAT (Contents: Read, private repo only) |
| `PRIVATE_REPO_OWNER` | your GitHub username |
| `PRIVATE_REPO_NAME` | your private repo name |
| `PRIVATE_REPO_BRANCH` | `main` |
| `OWNER_NUMBER` | your WhatsApp number |
| `BOT_NAME` | bot display name |
| `MONGO_URL` | MongoDB connection string |
| `ADMIN_USERNAME` | admin panel username |
| `ADMIN_PASSWORD` | admin panel password |

3. Deploy → bot starts

## How it works

```
Railway pulls public repo (Dockerfile + entrypoint.sh only)
        ↓
Container starts → entrypoint.sh runs
        ↓ REDX_PRIVATE_REPO_TOKEN (from Railway Variables)
git clone private repo → /app/src
        ↓
unset token from env
        ↓
npm install → node index.js
```

Token never baked into image. Injected at runtime by Railway.
