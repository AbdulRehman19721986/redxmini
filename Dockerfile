# NOTE: This Dockerfile is NOT used by the build workflow.
# The workflow uses the private repo's own Dockerfile (src/Dockerfile).
# This file is kept for reference only.
#
# If you want to build locally without GitHub Actions:
#   1. Clone private repo into src/
#   2. docker build -f src/Dockerfile src/

FROM node:20-slim
RUN echo "Use src/Dockerfile via GitHub Actions workflow. See README." && exit 1
