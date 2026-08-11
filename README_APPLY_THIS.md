# How to apply this to your private repo

1. Copy `.github/workflows/deploy.yml` into your **private** repo at the same path.
2. In the private repo → Settings → Secrets and variables → Actions:
   - **Secrets**: add whichever of `RENDER_DEPLOY_HOOK`, `RAILWAY_TOKEN`, `HEROKU_API_KEY` you actually use.
   - **Variables**: add `USE_RENDER=true`, `USE_RAILWAY=true`, and/or `USE_HEROKU=true` (plus `HEROKU_APP_NAME` if using Heroku) for whichever platforms apply. Leave the others unset — the corresponding step skips itself.
3. If you've connected Render/Railway/Heroku's GitHub App directly to this repo and turned on their own auto-deploy, you likely don't need any of these secrets at all — the platform is already deploying on push. Only wire these up for platforms where you want a forced/manual redeploy path.
4. This workflow does not need `PRIVATE_REPO_DISPATCH_TOKEN` — that only exists in the public bridge repo. This file uses the automatic same-repo `GITHUB_TOKEN` for checkout and nothing else for git operations.
