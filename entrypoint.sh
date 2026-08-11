#!/bin/sh
# ── REDX Runtime Bootstrapper ─────────────────────────────────────────────
# Clones the private bot source at container start using REDX_PRIVATE_REPO_TOKEN.
# REDX_PRIVATE_REPO_TOKEN is injected by the platform (Render/Railway/Heroku dashboard).
# It is NEVER stored in any file or image layer.
# ──────────────────────────────────────────────────────────────────────────

set -e

# ── Validate required env vars ────────────────────────────────────────────
if [ -z "${REDX_PRIVATE_REPO_TOKEN}" ]; then
  echo "[REDX] ERROR: REDX_PRIVATE_REPO_TOKEN environment variable is not set."
  echo "[REDX] Set it in your platform dashboard (Render/Railway/Heroku)."
  echo "[REDX] It must be a fine-grained GitHub PAT with Contents: Read on the private repo."
  exit 1
fi

if [ -z "${PRIVATE_REPO_OWNER}" ]; then
  echo "[REDX] ERROR: PRIVATE_REPO_OWNER is not set."
  exit 1
fi

if [ -z "${PRIVATE_REPO_NAME}" ]; then
  echo "[REDX] ERROR: PRIVATE_REPO_NAME is not set."
  exit 1
fi

BRANCH="${PRIVATE_REPO_BRANCH:-main}"
CLONE_DIR="/app/src"

echo "[REDX] Cloning private source (branch: ${BRANCH})..."

# Clone using PAT — credential appears only in this process env, never logged
git clone \
  --depth=1 \
  --branch "${BRANCH}" \
  "https://x-access-token:${REDX_PRIVATE_REPO_TOKEN}@github.com/${PRIVATE_REPO_OWNER}/${PRIVATE_REPO_NAME}.git" \
  "${CLONE_DIR}"

# Unset PAT immediately — no longer needed after clone
unset REDX_PRIVATE_REPO_TOKEN

echo "[REDX] Clone complete. Installing dependencies..."

cd "${CLONE_DIR}"

npm install \
  --omit=dev \
  --no-audit \
  --no-fund \
  --legacy-peer-deps \
  --quiet

# Create required runtime directories
mkdir -p session temp data plugins public

echo "[REDX] Starting bot..."
exec node index.js
