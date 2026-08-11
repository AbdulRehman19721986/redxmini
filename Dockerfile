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

# Copy only the entrypoint — no source code lives here
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Runtime: entrypoint clones private source then starts bot
CMD ["./entrypoint.sh"]
