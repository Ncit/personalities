#!/usr/bin/env bash
set -euo pipefail

# Deploy goodsv2 backend to nikmobdev.ru
# Stack: Docker Compose → node:18-alpine container
# Mount: /home/nikita/goodsv2 → /app
# Route: nikmobdev.ru/api/* and nikmobdev.ru/goodsshop/api/*

SSH_HOST="nikita@nikmobdev.ru"
REMOTE_DIR="/home/nikita/goodsv2"
LOCAL_DIR="/Users/nikitaf/development/projects/goodsv2"

echo "=== GoodsV2 Backend Deploy ==="
echo "Source: $LOCAL_DIR"
echo "Target: $SSH_HOST:$REMOTE_DIR"
echo ""

# 1. Sync files (exclude database, node_modules, .git)
echo "→ Syncing files..."
rsync -avz \
    --exclude='node_modules' \
    --exclude='purchases.db' \
    --exclude='.git' \
    --exclude='*.db-journal' \
    "$LOCAL_DIR/" \
    "$SSH_HOST:$REMOTE_DIR/"

# 1.5 Set .env permissions
echo "→ Securing .env..."
ssh "$SSH_HOST" "chmod 600 $REMOTE_DIR/.env"

# 2. Install dependencies if package.json changed
echo "→ Installing dependencies..."
ssh "$SSH_HOST" "cd $REMOTE_DIR && npm install --production 2>&1 | tail -3"

# 3. Restart the container
echo "→ Restarting goodsv2-server..."
ssh "$SSH_HOST" "docker compose restart goodsv2-server 2>&1"

# 4. Wait and check logs
echo "→ Checking server status..."
sleep 3
ssh "$SSH_HOST" "docker compose logs goodsv2-server --tail 5 2>&1"

# 5. Health check
echo ""
echo "→ Health check..."
if ssh "$SSH_HOST" "curl -sf http://localhost:3001/purchase > /dev/null 2>&1"; then
    echo "✓ Server is responding"
else
    echo "⚠ Server may still be starting..."
fi

echo ""
echo "=== Backend Deployed! ==="
echo "API: https://nikmobdev.ru/goodsshop/api/"
