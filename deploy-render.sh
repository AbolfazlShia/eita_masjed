#!/bin/bash

# Quick deployment script for Render
# This script helps push your current branch to GitHub
# Render will automatically detect and deploy

set -e

echo "🚀 Masjed Deployment Helper for Render"
echo "======================================"
echo ""

# Check if git is available
if ! command -v git &> /dev/null; then
  echo "❌ Git is not installed. Please install Git first."
  exit 1
fi

# Check if we're in a git repository
if [ ! -d .git ]; then
  echo "❌ Not a git repository. Please run this from the project root."
  exit 1
fi

# Get current branch
BRANCH=$(git branch --show-current)
echo "📍 Current branch: $BRANCH"
echo ""

# Check if there are uncommitted changes
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "📝 Found uncommitted changes. Staging them..."
  git add -A
  
  read -p "📧 Enter commit message (or press Enter for default): " commit_msg
  if [ -z "$commit_msg" ]; then
    commit_msg="Deploy update: $(date '+%Y-%m-%d %H:%M:%S')"
  fi
  
  git commit -m "$commit_msg"
else
  echo "✅ No uncommitted changes."
fi

echo ""
echo "🔄 Pushing to GitHub..."
git push origin "$BRANCH"

echo ""
echo "✅ Push completed!"
echo ""
echo "📋 Next steps:"
echo "1. Go to https://dashboard.render.com"
echo "2. Your service should automatically redeploy"
echo "3. Check the 'Logs' tab to monitor the build"
echo "4. Once deployed, your site will be live!"
echo ""
