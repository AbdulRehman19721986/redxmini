# 🔥 REDXBOT302 — Deploy Bridge

> No source code here. Private source cloned at build time.

## Railway setup (recommended)

1. New Project → Deploy from GitHub repo → this public repo
2. **Variables** tab → add:

| Variable | Value |
|----------|-------|
| `REDX_PRIVATE_REPO_TOKEN` | your fine-grained PAT (Contents: Read) |
| `PRIVATE_REPO_OWNER` | your GitHub username |
| `PRIVATE_REPO_NAME` | your private repo name |
| `PRIVATE_REPO_BRANCH` | `main` |
| `OWNER_NUMBER` | your WhatsApp number |
| `BOT_NAME` | bot display name |
| `MONGO_URL` | MongoDB connection string |
| *(other bot vars)* | see .env.example |

3. Deploy → Railway builds image using your private source → bot starts

## How it works

```
Railway pulls public repo
        ↓
Dockerfile runs
        ↓ REDX_PRIVATE_REPO_TOKEN (build arg)
git clone private repo into /app
        ↓
npm install
        ↓
node index.js
```

Token used only during build. Not stored in final image.
