# 🔥 REDXBOT302 — Deploy

> No source code in this repo.
> GitHub Actions clones private source at build time, builds a Docker image, pushes to ghcr.io.
> Platforms pull the image — **no secrets needed in platform dashboard**.

---

## Architecture

```
Push to public repo
        ↓
GitHub Actions (build-and-push.yml)
        ↓ uses REDX_PRIVATE_REPO_TOKEN (GitHub secret)
Clone private repo source
        ↓
Build Docker image
        ↓
Push → ghcr.io/USERNAME/redxbot302:latest
        ↓
Render / Railway / Heroku pulls image
        ↓
Bot running 🔥
```

---

## One-time setup

### Step 1 — GitHub repo secrets (Settings → Secrets → Actions)

| Name | Value |
|------|-------|
| `REDX_PRIVATE_REPO_TOKEN` | your fine-grained PAT (Contents: Read) |

### Step 2 — GitHub repo variables (Settings → Variables → Actions)

| Name | Value |
|------|-------|
| `PRIVATE_REPO_OWNER` | your GitHub username |
| `PRIVATE_REPO_NAME` | your private repo name |
| `PRIVATE_REPO_BRANCH` | `main` |

### Step 3 — Make ghcr.io image public

After first build:
1. github.com → your profile → **Packages** → `redxbot302`
2. Package settings → **Change visibility** → Public

This lets platforms pull without auth.

### Step 4 — Connect platform to image

**Render** — render.yaml already configured. Just set bot env vars (OWNER_NUMBER etc) in dashboard.

**Railway** — New Project → Deploy Docker Image → `ghcr.io/YOUR_USERNAME/redxbot302:latest`

**Heroku**
```bash
heroku stack:set container -a YOUR_APP_NAME
heroku config:set OWNER_NUMBER=923xxxxxxxxx -a YOUR_APP_NAME
# push this repo to heroku remote
```

---

## Updating the bot

Push to **private repo** → run `build-and-push.yml` manually (Actions → Run workflow) → platform redeploys.

Or push to this **public repo** → workflow triggers automatically → new image built → redeploy on platform.

---

## Platform env vars needed (non-sensitive only)

```
OWNER_NUMBER=
OWNER_NAME=
BOT_NAME=
PREFIX=.
BOT_MODE=public
ADMIN_USERNAME=
ADMIN_PASSWORD=
MONGO_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
PORT=3000
```

No `REDX_PRIVATE_REPO_TOKEN` in platform dashboard. GitHub Actions handles that.
