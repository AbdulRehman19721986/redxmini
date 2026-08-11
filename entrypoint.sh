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

git clone \
  --depth=1 \
  --branch "${BRANCH}" \
  "https://x-access-token:${REDX_PRIVATE_REPO_TOKEN}@github.com/${PRIVATE_REPO_OWNER}/${PRIVATE_REPO_NAME}.git" \
  /app/src

# Clear token from env immediately
unset REDX_PRIVATE_REPO_TOKEN

echo "[REDX] Clone complete. Installing dependencies..."
cd /app/src

npm install \
  --omit=dev \
  --no-audit \
  --no-fund \
  --legacy-peer-deps \
  --quiet

mkdir -p session temp data plugins public

echo "[REDX] Starting bot..."
exec node index.js
