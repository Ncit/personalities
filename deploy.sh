#!/usr/bin/env bash
set -euo pipefail

# Deploy script for PersonaDev
# Deploys from the glm branch to GitHub Pages (gh_pages branch)
# Target: nikmobdev.ru/personadev/

SOURCE_BRANCH="glm"
DEPLOY_BRANCH="gh_pages"
BUILD_DIR="dist"
REPO_URL=$(git remote get-url origin)
COMMIT_HASH=$(git rev-parse --short HEAD)

echo "=== PersonaDev Deploy ==="
echo "Source: $SOURCE_BRANCH ($COMMIT_HASH)"
echo "Target: $DEPLOY_BRANCH"
echo ""

# 1. Ensure we're on glm
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$CURRENT_BRANCH" != "$SOURCE_BRANCH" ]]; then
    echo "ERROR: Must deploy from '$SOURCE_BRANCH' branch. Currently on '$CURRENT_BRANCH'."
    exit 1
fi

# 2. Check for uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
    echo "ERROR: Working directory has uncommitted changes."
    echo "Please commit or stash them before deploying."
    exit 1
fi

# 3. Install dependencies
echo "→ Installing dependencies..."
npm ci --silent

# 4. Run tests
echo "→ Running tests..."
npm test -- --passWithNoTests 2>/dev/null || {
    echo "ERROR: Tests failed. Fix them before deploying."
    exit 1
}

# 5. Build for production
echo "→ Building for production..."
npm run build

if [[ ! -d "$BUILD_DIR" ]]; then
    echo "ERROR: Build failed — $BUILD_DIR directory not found."
    exit 1
fi

# 6. Copy CNAME for custom domain
if [[ -f "CNAME" ]]; then
    cp CNAME "$BUILD_DIR/CNAME"
    echo "→ CNAME copied to build output"
fi

# 7. Deploy to gh_pages branch
echo "→ Deploying to $DEPLOY_BRANCH..."

cd "$BUILD_DIR"

git init
git checkout -b "$DEPLOY_BRANCH"
git add -A
git commit -m "deploy: $SOURCE_BRANCH@$COMMIT_HASH — $(date '+%Y-%m-%d %H:%M:%S')"
git remote add origin "$REPO_URL"
git push origin "$DEPLOY_BRANCH" --force

cd ..

# 8. Cleanup temp git repo in dist
rm -rf "$BUILD_DIR/.git"

echo ""
echo "=== Deployed successfully! ==="
echo "Site: https://nikmobdev.ru/personadev/"
