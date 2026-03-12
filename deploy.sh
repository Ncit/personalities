#!/usr/bin/env bash
set -euo pipefail

# Deploy PersonaDev to nikmobdev.ru
# Stack: Traefik → nginx:alpine container
# Mount: /home/nikita/personadev/dist → /usr/share/nginx/html
# Route: nikmobdev.ru/personadev/* (prefix stripped by Traefik)

SSH_HOST="nikita@nikmobdev.ru"
REMOTE_DIR="/home/nikita/personadev/dist"
BUILD_DIR="dist"
SOURCE_BRANCH="glm"

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
COMMIT_HASH=$(git rev-parse --short HEAD)

echo "=== PersonaDev Deploy ==="
echo "Source: $CURRENT_BRANCH ($COMMIT_HASH)"
echo "Target: $SSH_HOST:$REMOTE_DIR"
echo ""

# 1. Ensure we're on glm
if [[ "$CURRENT_BRANCH" != "$SOURCE_BRANCH" ]]; then
    echo "ERROR: Must deploy from '$SOURCE_BRANCH'. Currently on '$CURRENT_BRANCH'."
    exit 1
fi

# 2. Check for uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
    echo "ERROR: Uncommitted changes. Commit or stash first."
    exit 1
fi

# 3. Build
echo "→ Installing dependencies..."
npm ci --silent

echo "→ Building..."
npm run build

if [[ ! -d "$BUILD_DIR" ]]; then
    echo "ERROR: Build failed — $BUILD_DIR not found."
    exit 1
fi

# 4. Deploy via rsync
echo "→ Deploying to $SSH_HOST..."
rsync -avz --delete \
    "$BUILD_DIR/" \
    "$SSH_HOST:$REMOTE_DIR/"

echo ""
echo "=== Deployed! ==="
echo "https://nikmobdev.ru/personadev/"
