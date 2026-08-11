# 🔥 REDXBOT302 — Deploy

> This repo contains **no bot source code**.
> It is a deploy bridge — the real bot is cloned from a private repo at container startup.

---

## One-click deploy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/YOUR_USERNAME/YOUR_PUBLIC_REPO)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/YOUR_TEMPLATE_CODE)

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/YOUR_USERNAME/YOUR_PUBLIC_REPO)

> Replace `YOUR_USERNAME/YOUR_PUBLIC_REPO` with this repo's actual URL.

---

## How it works

```
Platform pulls this public repo (Dockerfile only)
        ↓
Container starts → entrypoint.sh runs
        ↓
Clones private bot source using REDX_PRIVATE_REPO_TOKEN
        ↓
npm install → node index.js
        ↓
Bot running 🔥
```

No source code lives in this repo. No credentials live in any file.

---

## Required environment variables

Set these in your platform dashboard **before** deploying.

| Variable | Required | Description |
|----------|----------|-------------|
| `REDX_PRIVATE_REPO_TOKEN` | ✅ | Fine-grained GitHub PAT — see below |
| `PRIVATE_REPO_OWNER` | ✅ | GitHub username of private repo owner |
| `PRIVATE_REPO_NAME` | ✅ | Private repo name |
| `PRIVATE_REPO_BRANCH` | ❌ | Branch to deploy (default: `main`) |
| `OWNER_NUMBER` | ✅ | Your WhatsApp number (no `+`, e.g. `923001234567`) |
| `BOT_NAME` | ❌ | Bot display name |
| `PREFIX` | ❌ | Command prefix (default: `.`) |
| `BOT_MODE` | ❌ | `public` or `private` |
| `ADMIN_USERNAME` | ❌ | Admin panel username (change from default!) |
| `ADMIN_PASSWORD` | ❌ | Admin panel password (change from default!) |
| `MONGO_URL` | ❌ | MongoDB Atlas connection string |
| `SUPABASE_URL` | ❌ | Supabase project URL |
| `SUPABASE_ANON_KEY` | ❌ | Supabase anon key |
| `SUPABASE_SERVICE_KEY` | ❌ | Supabase service-role key |
| `PORT` | ❌ | HTTP port (default: `3000`) |

---

## Creating REDX_PRIVATE_REPO_TOKEN

This token lets the container clone your private repo. It needs the **minimum possible access**.

1. GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate new token
2. Resource owner: your account
3. Repository access: **Only select repositories** → your **private** bot repo
4. Permissions → Repository permissions:
   - **Contents: Read** ← only this
   - Everything else: **No access**
5. Expiration: 90 days (or custom)
6. Generate → copy value
7. Paste into your platform's environment variable dashboard as `REDX_PRIVATE_REPO_TOKEN`

> ⚠️ Never put this token in any file. Never commit it. Set it only in the platform dashboard.

---

## Platform setup

### Render
1. New Web Service → connect this public repo
2. Environment → add all variables above
3. Deploy

### Railway
1. New Project → Deploy from GitHub repo → this public repo
2. Variables tab → add all variables above
3. Deploy

### Heroku
1. Click the Heroku button above
2. Fill in the env vars when prompted
3. Deploy

---

## Updating the bot

Push to your **private** repo → re-deploy on the platform (or enable auto-deploy).

The container always clones the latest commit from `PRIVATE_REPO_BRANCH` on startup.
