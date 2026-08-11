# Private Repo → Public Deployment Bridge — Audit & Design

Project audited: `redxbot302-ultra` (Node.js / Express / `@whiskeysockets/baileys` WhatsApp automation bot with an admin web panel), from the uploaded `nonoofyours-main.zip`.

---

## ⚠️ Urgent — rotate these credentials before anything else

The secret scan (Part 2 / Part 14 below) found **live-looking credentials committed in `.env.example`**, not placeholders. `.env.example` is the file convention expects you to commit to git, so if this project has ever been pushed anywhere — public or private — these should be treated as compromised right now:

| File | What's exposed | Type |
|---|---|---|
| `.env.example` (and `.env`, which matches it) | Supabase project URL, anon key, **and service-role key** | Service-role keys bypass row-level security — this is the most sensitive one |
| `.env.example` (and `.env`) | Full Postgres connection string with an embedded password | Database credential |
| `plugins/cat-03-sticker.js:1077` | A Google-format API key (`AIzaSy...`) hardcoded in source, used against a Tenor/Google endpoint | API key |
| `.env` / `app.json` / `render.yaml` | Admin panel default credentials (`redx` / `redx`) | Weak default, not a leak but should change |

I haven't reproduced the actual values anywhere in this response or the generated files. Action items:
1. In the Supabase dashboard, **rotate the service-role key and anon key** for that project, and rotate the Postgres password.
2. Rotate/regenerate the Google API key (or restrict it by referrer/IP/API in Google Cloud Console) and move it into an env var instead of the source file.
3. Change the admin panel credentials to something not equal to the username.
4. If this project has a real `.git` history anywhere (none was included in the zip, so I couldn't check), scan that history for these values too — deleting them in a new commit does not remove them from history. `git log -p -- .env.example` or a tool like `trufflehog`/`gitleaks` against the full history will confirm.

None of this is fixed by the deployment-bridge architecture below — it's independent and more urgent.

---

## Part 1 — Architecture audit

- **Runtime**: single long-running Node process (`index.js`) — Express + Socket.IO admin panel, plus a Baileys WhatsApp socket per paired number. This is a stateful service (holds live WhatsApp sessions in `session/`), not a stateless request/response app.
- **Plugin system**: `plugins/*.js`, loaded dynamically — ~50 command modules (media tools, group management, games, downloaders, an admin/owner category, etc).
- **Persistence**: JSON files under `data/` by default, with optional MongoDB (`lib/mongoSessionStore.js`) and Supabase (`lib/supabaseStore.js`) backends for settings/session backup. `lib/lightweight_store.js` is the primary store abstraction.
- **Admin panel**: token-based auth (`/api/admin/login` issues a token checked via `adminAuth` middleware), username/password compared with `!==` (not constant-time — low-severity timing side channel) against `ADMIN_USERNAME`/`ADMIN_PASSWORD`, no visible rate limiting on the login route.
- **Existing deployment configs already committed**: `Dockerfile`, `Procfile`, `heroku.yml`, `app.json`, `render.yaml`, `railway.json` — the project is already set up to deploy to Heroku, Render, and Railway directly. There's also `lib/fly.sh`, `lib/heroku.sh`, `lib/railway.sh` — interactive one-click-deploy shell scripts left over from an earlier template (they still `git clone` a different repo name, `Abdul Rehman RajpootInfo/MEGA-MDX` — stale, not functional as-is; low-priority cleanup).
- **Existing self-update mechanism**: `lib/autoUpdate.js` already pulls plugin updates from `raw.githubusercontent.com` for a configured `UPDATE_REPO_OWNER`/`UPDATE_REPO_NAME`, driven by `update-manifest.json`. This is precedent inside your own codebase for a "public repo publishes an update manifest, app pulls it anonymously over HTTPS" pattern — no token involved because it only reads public raw content. Worth keeping in mind: it's the same shape as the bridge you're asking for, just for a different payload.
- **No `.git` directory** was present in the zip, so git history couldn't be audited directly (see rotation note above).

## Part 2 — Security audit summary

| Severity | Finding |
|---|---|
| Critical | Real Supabase service-role key, anon key, and DB password committed as literal values in `.env.example` (see box above) |
| Critical | Same real values duplicated in `.env` (gitignored, but present in the zip you're working from — make sure it's never force-added) |
| High | Hardcoded Google API key in `plugins/cat-03-sticker.js` |
| Medium | Admin login uses `!==` string comparison instead of a constant-time compare, and has no visible rate limiting → brute-forceable if the panel is internet-reachable |
| Medium | Default admin credentials (`redx`/`redx`) ship in `app.json`/`render.yaml`/`.env.example` as the "value" a one-click deploy will actually use unless changed |
| Low | Owner phone numbers (`OWNER_NUMBER`, `CO_OWNER_NUM`) are committed as plain values in `render.yaml`/`app.json` — not a secret, but PII you may not want in a public repo |
| Low | `lib/fly.sh`, `lib/heroku.sh`, `lib/railway.sh` reference a different, stale upstream repo and would not work unmodified |

I didn't change any of the application code — these are flagged for you to fix, per your instruction not to touch business logic unless necessary. The Google API key and the admin-auth comparison are the two I'd fix first since they're small, contained, one-line changes with no architectural impact.

## Part 3 — Recommended architecture

Your draft assumed the public repo needs to *fetch* the private repo's source. After inspecting the project, I'd recommend against that shape — it's Approach B in your own list, and it's the one you flagged concern about. Here's the comparison:

- **Approach A — deploy platform connects directly to the private repo.** Render, Railway, and Heroku all have first-party GitHub Apps/OAuth integrations that you authorize against **just this one private repository**. The platform then pulls source itself, server-side, using its own scoped installation — you never generate, store, or rotate a PAT for this at all. This is safer than anything a custom bridge can do, because there's no credential for anyone to find in the first place.
- **Approach B — public repo holds a token that reads the private repo's source.** This is what your draft described. It works, but it means a real credential capable of reading your proprietary source has to live *somewhere* reachable from the public repo (an Actions secret). Secrets in a public repo's Actions are not exposed to `pull_request` workflows from forks by default, which limits but doesn't eliminate the blast radius of a maintainer mistake (e.g. a workflow that echoes the token, or a `pull_request_target` misconfiguration). Not recommended when Approach A satisfies the same goal with strictly less exposure.
- **Approach C — GitHub Actions in the *private* repo does the deploying.** The workflow checks itself out (native `GITHUB_TOKEN`, no PAT needed — same-repo checkout never needs cross-repo permissions) and pushes to Render/Railway/Heroku using each platform's own deploy secret, stored as a repo secret **in the private repo**. This gets you commit tracking, deploy logs, health checks, and rollback bookkeeping that Approach A alone doesn't give you for free.
- **Approach D — GitHub App / deploy key.** Only worth it over A if you need finer-grained control than the platform's own GitHub App gives you (e.g. deploying the same repo to somewhere with no native GitHub integration). Not needed for Render/Railway/Heroku specifically.

**Recommendation: A + C, with a thin, credential-free public repo as an optional front door.**

```
PRIVATE REPO (real source)
   │  push to main
   ▼
Render/Railway/Heroku GitHub App        ──► auto-deploys directly (Approach A)
   (installed on this repo only, in each platform's dashboard)
   │
   ▼
Private repo's own GitHub Actions workflow  ──► logs the deployed commit,
   (deploy.yml — uses platform deploy-hook /   posts health check, can also
    API secrets stored ONLY in this repo)      re-trigger Railway/Heroku deploys
                                                that don't auto-deploy on push

PUBLIC REPO (deployment-bridge)
   - README, architecture docs, required-env-var list (names only)
   - optional: a "Request redeploy" Action a maintainer can click,
     which calls the PRIVATE repo's workflow_dispatch endpoint
   - holds NO source code and NO deploy credentials of its own
```

The public repo never needs read access to your source. If you want it to be able to *trigger* a redeploy (rather than just document how to), the only credential it needs is a fine-grained PAT scoped to **Actions: Read and write, on the private repository only** — this permission lets it call the `workflow_dispatch` REST endpoint but grants it no `Contents` access whatsoever, so structurally it cannot read source even if the token leaked. That's what `trigger-deploy.yml` in the generated bridge repo does. (I verified this permission requirement against GitHub's current docs rather than assuming it — `repository_dispatch` needs `Contents: Read & write`, which is why the bridge uses `workflow_dispatch` instead.)

## Part 4 — Files to create

**In a new public repo** (generated for you under `deployment-bridge/` — see files below):
- `README.md` — what the repo is, security model, links to your Render/Railway/Heroku dashboards, required env var *names* only
- `.gitignore`
- `.env.example` — placeholder names only
- `.github/workflows/trigger-deploy.yml` — optional manual "request redeploy" button
- `SECURITY.md` — the threat-model checklist from Part 14

**In your existing private repo** (generated for you under `private-repo-additions/` — copy into the private repo):
- `.github/workflows/deploy.yml` — deploys on push, records the deployed commit SHA as a build artifact, supports manual re-run

## Part 5 — Files to modify (in the private repo, small and contained)

- `.env.example` — replace the real Supabase/Postgres values with placeholders (this is the one that must never contain real data)
- `plugins/cat-03-sticker.js` — replace the hardcoded Tenor/Google key with `process.env.TENOR_API_KEY`
- `index.js` (lines ~1696, ~1800) — swap the `!==` credential comparisons for `crypto.timingSafeEqual`, and add basic rate limiting to `/api/admin/login` (e.g. `express-rate-limit`)
- `render.yaml` / `app.json` — drop the hardcoded `OWNER_NUMBER`/`CO_OWNER_NUM` values and default admin creds; leave them required-but-empty so whoever deploys is forced to set their own

None of this touches your plugin architecture, database logic, or command handling.

## Part 6 — Files that must never be public

`.env`, `data/` (contains `sudo.json`, `owner.json`, session/store state), `session/`/`sessions/` (live WhatsApp auth credentials — equivalent to an account takeover credential if leaked), `data.json`, `deploys.json` (contains a deploy key), `baileys_store.json`. Your existing `.gitignore` already covers most of these — I left it as-is since it's correct; the bridge repo gets its own separate, minimal `.gitignore`.

## Part 7 — Secret configuration (names only)

Store these as **private-repo** Actions secrets (never in the public repo, never in any committed file):

```
RENDER_DEPLOY_HOOK        # Render service's deploy-hook URL (treat as a secret — it's a bearer URL)
RAILWAY_TOKEN             # only if you need Actions to trigger Railway (native GitHub App may make this unnecessary)
HEROKU_API_KEY            # only if you need Actions to trigger Heroku (native GitHub App may make this unnecessary)
MONGO_URL
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY
DATABASE_URL
TENOR_API_KEY             # replaces the hardcoded key in cat-03-sticker.js
ADMIN_USERNAME
ADMIN_PASSWORD
```

In the **public** repo, the only secret that should ever exist is, optionally:

```
PRIVATE_REPO_DISPATCH_TOKEN   # fine-grained PAT, Actions: Read & write, scoped to the private repo only, nothing else
```

## Part 8 — GitHub configuration

- Private repo → Settings → Secrets and variables → Actions → New repository secret, for each item in Part 7's first block.
- If you use the optional dispatch trigger: create the fine-grained PAT at github.com/settings/personal-access-tokens/new → Resource owner: your account → **Only select repositories: the private repo** → Repository permissions: **Actions: Read and write**, everything else "No access" → set an expiration and put a calendar reminder to rotate it. Add it as `PRIVATE_REPO_DISPATCH_TOKEN` in the **public** repo's Actions secrets.
- Branch protection on the private repo's default branch (require PR review, no direct pushes) is worth turning on since a push there now triggers a real deploy.
- Actions permissions on both repos: Settings → Actions → General → Workflow permissions → set to **Read repository contents** (not "Read and write"), since neither generated workflow needs to write back to the repo.

## Part 9 — Render setup

1. Render dashboard → New → Web Service → connect the **private** repo (Render's GitHub App only needs access to that one repo — grant it per-repo, not org-wide).
2. Build command: `apt-get install -y ffmpeg 2>/dev/null; npm install --legacy-peer-deps --no-audit --no-fund` (already in your `render.yaml`). Start command: `node index.js`.
3. Set every env var from Part 7 in Render's dashboard (Environment tab) — not in `render.yaml`, since that file is committed.
4. Enable Auto-Deploy on the branch you push to. This alone satisfies "push to private repo → new deployment" with zero bridge involved.
5. Optional: copy the service's Deploy Hook URL into the private repo's `RENDER_DEPLOY_HOOK` secret if you also want `deploy.yml` to be able to force a redeploy without a new commit (e.g. after rotating a secret).

## Part 10 — Railway setup

1. Railway dashboard → New Project → Deploy from GitHub repo → select the private repo (same per-repo GitHub App model as Render).
2. Your `railway.json` already sets the Nixpacks build command, start command, and a `/health` healthcheck — Railway will pick these up automatically.
3. Set env vars in Railway's Variables tab.
4. Railway auto-deploys on push once connected — again, Approach A alone covers your "push updates → running app updates" requirement.

## Part 11 — Heroku setup

1. Heroku dashboard → your app → Deploy tab → GitHub → connect the private repo (Heroku's GitHub integration is also per-repo authorized).
2. Since `heroku.yml` is present, set the app's stack to `container` (`heroku stack:set container`) so Heroku builds from your `Dockerfile` rather than buildpacks.
3. Enable "Automatic Deploys" from the branch, or use "Deploy Branch" manually / via the `deploy.yml` workflow using `HEROKU_API_KEY`.
4. Set env vars under Settings → Config Vars.

## Part 12 — Automatic updates

With Approach A (native GitHub App per platform) enabled, `push to private repo main` → platform's own webhook fires → platform pulls the new commit and redeploys, with no bridge, token, or Action involved. `deploy.yml` in the private repo is additive: it runs on the same push, records the deployed SHA (`git rev-parse HEAD`) as a build artifact/log line, and can also poll the platform's health endpoint afterward to confirm the new version is actually serving.

## Part 13 — Rollback

Practical, low-machinery approach given this is three third-party platforms, not a custom orchestrator:
- Render and Railway both keep a deploy history in their dashboards with one-click "redeploy this commit."
- Heroku: `heroku releases` lists past releases; `heroku rollback vNN` reverts.
- `deploy.yml` writes the deployed commit SHA to its workflow run summary/artifact each time, so "what's currently live" is always answerable from the Actions history without needing a separate database.
- For a git-level rollback, `git revert` the offending commit and push — that's a normal commit, so Part 12's flow redeploys it the same way as any other change.

## Part 14 — Security verification checklist

```
[x] No secrets in public repository        — bridge repo ships no real values, only names
[x] No private source in public repository — bridge repo never reads/holds source
[x] No credentials in client-side code     — none of the generated files touch the frontend
[ ] Private repository remains private     — verify this yourself in GitHub settings
[x] Token has minimum permissions          — Actions:R&W only, one repo, if you use the trigger at all
[x] Pull requests cannot access production secrets — GitHub's default fork-PR secret restriction applies; nothing here overrides it
[x] Logs do not expose credentials         — workflows only reference secrets via ${{ secrets.X }}, never echoed
[x] Deployment identifies the correct commit — deploy.yml logs $GITHUB_SHA
[x] Failed deployments do not silently deploy unsafe code — curl calls use -f (fail on HTTP error), no fallback deploy path
[ ] Secrets can be rotated/revoked         — true for the GitHub PAT and platform tokens; you still need to rotate the Supabase/Postgres/Tenor credentials flagged at the top, which is on you to do outside of this repo
```
