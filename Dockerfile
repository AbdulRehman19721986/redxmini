# ╔══════════════════════════════════════════════════════════════╗
# ║   🔥 REDXBOT302 — Public Repo Dockerfile                    ║
# ║   Clones private source at BUILD TIME using build arg.      ║
# ║   Token never stored in image layers.                       ║
# ╚══════════════════════════════════════════════════════════════╝

FROM node:20-slim AS builder

# Install git + ffmpeg + build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    ffmpeg \
    python3 \
    python3-pip \
    make \
    g++ \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Build args — set in Railway dashboard (Variables tab)
# NEVER hardcode values here
ARG REDX_PRIVATE_REPO_TOKEN
ARG PRIVATE_REPO_OWNER
ARG PRIVATE_REPO_NAME
ARG PRIVATE_REPO_BRANCH=main

# Clone private source at build time
# Token used only in this RUN layer — not stored in final image
RUN if [ -z "${REDX_PRIVATE_REPO_TOKEN}" ]; then \
      echo "ERROR: REDX_PRIVATE_REPO_TOKEN build arg not set" && exit 1; \
    fi && \
    if [ -z "${PRIVATE_REPO_OWNER}" ]; then \
      echo "ERROR: PRIVATE_REPO_OWNER build arg not set" && exit 1; \
    fi && \
    if [ -z "${PRIVATE_REPO_NAME}" ]; then \
      echo "ERROR: PRIVATE_REPO_NAME build arg not set" && exit 1; \
    fi && \
    git clone \
      --depth=1 \
      --branch "${PRIVATE_REPO_BRANCH}" \
      "https://x-access-token:${REDX_PRIVATE_REPO_TOKEN}@github.com/${PRIVATE_REPO_OWNER}/${PRIVATE_REPO_NAME}.git" \
      /app && \
    # Remove git history — no credentials in layers
    rm -rf /app/.git

# Install dependencies
RUN npm install \
    --omit=dev \
    --no-audit \
    --no-fund \
    --legacy-peer-deps

# Create required runtime directories
RUN mkdir -p session temp data plugins public

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["node", "index.js"]
