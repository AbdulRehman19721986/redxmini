<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&height=230&color=0:6a0dad,100:ab47bc&text=REDXBOT302&fontColor=ffffff&fontSize=70&fontAlignY=40&animation=twinkling&desc=Public%20Deploy%20Bridge%20%C2%B7%20Private%20Source&descSize=18&descAlignY=65&stroke=ffffff&strokeWidth=1.2" width="100%"/>

**Built on Baileys · 400+ Commands · Pair-Only Login**

> ⚠️ **No source code here.** This is a public deploy bridge only —
> the real bot lives in a private repo and is cloned into the
> container at startup. Nothing you can copy from this repo runs
> the bot on its own.

</div>

---

## 🚀 One-Click Deploy

| Platform | Button |
|---|---|
| Railway | [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/AbdulRehman19721986/redxbot302-bridge) |
| Render | [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/AbdulRehman19721986/redxbot302-bridge) |

Deploy sets up the container. It won't boot the bot until you add the private-repo variables below.

## ⚙️ Required Variables

| Variable | Value |
|---|---|
| `REDX_PRIVATE_REPO_TOKEN` | Fine-grained GitHub PAT — `Contents: Read` on your private repo only |
| `PRIVATE_REPO_OWNER` | Your GitHub username |
| `PRIVATE_REPO_NAME` | Your private repo name |
| `PRIVATE_REPO_BRANCH` | `main` |
| `OWNER_NUMBER` | Your WhatsApp number |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Admin panel login — change from any default |

Set these in your platform's **Variables/Config Vars UI** — never in this repo.

## 🔧 How it works

```
Platform pulls this public repo (Dockerfile + entrypoint.sh only)
        ↓
Container starts → entrypoint.sh runs
        ↓ REDX_PRIVATE_REPO_TOKEN (from platform Variables)
git clone private repo → /app/src
        ↓
git remote scrubbed (token never left readable on disk)
        ↓
npm ci / npm install → node index.js
```

The token is used once at clone time, never baked into the image, and the git remote is rewritten immediately after clone so it can't be read back out of `.git/config`.

---

<div align="center">
Powered by REDXBOT302
</div>
