FROM node:20-slim

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

# Source is copied in by GitHub Actions build (cloned from private repo)
# This Dockerfile never runs git clone itself — that happens in the workflow
COPY . ./

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
