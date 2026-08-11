#!/bin/sh
# Clones private repo at RUNTIME using REDX_PRIVATE_REPO_TOKEN.
# Railway injects Variables as env vars at runtime — works perfectly.
# Token never baked into image.

set -e

if [ -z "${REDX_PRIVATE_REPO_TOKEN}" ]; then
  echo "[REDX] ERROR: REDX_PRIVATE_REPO_TOKEN not set in Railway Variables tab." >&2
  exit 1
fi
if [ -z "${PRIVATE_REPO_OWNER}" ]; then
  echo "[REDX] ERROR: PRIVATE_REPO_OWNER not set." >&2
  exit 1
fi
if [ -z "${PRIVATE_REPO_NAME}" ]; then
  echo "[REDX] ERROR: PRIVATE_REPO_NAME not set." >&2
  exit 1
fi

BRANCH="${PRIVATE_REPO_BRANCH:-main}"

echo "[REDX] Cloning private source (${PRIVATE_REPO_OWNER}/${PRIVATE_REPO_NAME}@${BRANCH})..."

# FIX (crash-loop after OOM): if the process crashed (e.g. heap OOM) and
# Railway restarts the SAME container instead of a fresh one, /app/src
# from the previous run is still on disk — `git clone` then fails with
# "destination path already exists" on every single restart forever,
# since set -e kills the script before it ever reaches node. Wipe any
# leftover clone first so a crash-restart can always recover on its own.
if [ -d /app/src ]; then
  echo "[REDX] /app/src already exists (previous run's leftover) — removing before re-clone."
  rm -rf /app/src
fi

git clone \
  --depth=1 \
  --branch "${BRANCH}" \
  "https://x-access-token:${REDX_PRIVATE_REPO_TOKEN}@github.com/${PRIVATE_REPO_OWNER}/${PRIVATE_REPO_NAME}.git" \
  /app/src

# FIX: scrub token from git remote — clone bakes it into .git/config in plaintext,
# `unset` alone does NOT remove it. Anyone with container shell access could read it.
git -C /app/src remote set-url origin "https://github.com/${PRIVATE_REPO_OWNER}/${PRIVATE_REPO_NAME}.git"

# Clear token from env immediately
unset REDX_PRIVATE_REPO_TOKEN

echo "[REDX] Clone complete."

# Load ALL other config from the private repo's own .env — no need to
# duplicate BOT_NAME, OWNER_NUMBER, MONGO_URL, SUPABASE_*, etc. in Railway
# Variables. Only the 4 bridge vars above (token/owner/name/branch) must
# stay in Railway, since they're needed before this file even exists.
if [ -f /app/src/.env ]; then
  echo "[REDX] Loading vars from private repo .env..."
  set -a
  . /app/src/.env
  set +a
else
  echo "[REDX] WARNING: no .env found in private repo — relying on Railway Variables only." >&2
fi

echo "[REDX] Installing dependencies..."
cd /app/src

# FIX: no lockfile in repo, so `npm ci` is not usable (fails hard w/o package-lock.json).
# Dropped --legacy-peer-deps (silently masks real peer conflicts w/ Baileys pre-release,
# was letting broken sub-deps install unnoticed). If install fails, retry once clean
# instead of dying on a transient registry blip.
if [ -f package-lock.json ]; then
  echo "[REDX] Lockfile found, using npm ci for reproducible install."
  npm ci --omit=dev --no-audit --no-fund --quiet || {
    echo "[REDX] npm ci failed, retrying with npm install..." >&2
    npm install --omit=dev --no-audit --no-fund --quiet
  }
else
  echo "[REDX] WARNING: no package-lock.json in private repo — install is NOT reproducible." >&2
  echo "[REDX] Commit a package-lock.json for reliable, faster, pinned installs." >&2
  npm install --omit=dev --no-audit --no-fund --quiet || {
    echo "[REDX] npm install failed, retrying once..." >&2
    sleep 3
    npm install --omit=dev --no-audit --no-fund --quiet
  }
fi

mkdir -p session temp data plugins public

# FIX: these dirs are on the container's ephemeral filesystem. Every redeploy/restart
# wipes them unless a Railway Volume is mounted at /app/src/session and /app/src/data,
# or unless SUPABASE_URL / MONGO_URL is actually set so state persists externally.
if [ -z "${SUPABASE_URL}" ] && [ -z "${MONGO_URL}" ]; then
  echo "[REDX] WARNING: no SUPABASE_URL or MONGO_URL set — session/data will NOT survive a restart." >&2
  echo "[REDX] Mount a Railway Volume at /app/src/session (+ /app/src/data) or set a DB URL." >&2
fi

echo "[REDX] Starting bot..."
# Explicit heap ceiling so a leak degrades as GC pressure/slow responses
# (visible in logs) rather than a hard OOM kill with no warning.
exec node --max-old-space-size=${NODE_MAX_OLD_SPACE_MB:-1024} index.js
