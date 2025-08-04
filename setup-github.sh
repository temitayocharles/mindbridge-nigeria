#!/bin/bash

# 🚀 MindBridge Nigeria - GitHub Repository Setup Script
# This script creates a GitHub repository and sets up the remote

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Configuration
REPO_NAME="mindbridge-nigeria"
REPO_DESCRIPTION="🧠 MindBridge Nigeria - Mental Health Platform | Next.js + MongoDB + Docker + AI"
GITHUB_USERNAME=""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    log_error "Not in a git repository. Please run 'git init' first."
    exit 1
fi

log_info "Starting GitHub repository setup for MindBridge Nigeria..."

# Check if GitHub CLI is installed
if ! command -v gh >/dev/null 2>&1; then
    log_warning "GitHub CLI (gh) not found. Installing instructions:"
    echo ""
    echo "🍺 macOS (Homebrew):"
    echo "   brew install gh"
    echo ""
    echo "🐧 Linux (apt):"
    echo "   sudo apt install gh"
    echo ""
    echo "🏗️  Windows (winget):"
    echo "   winget install --id GitHub.cli"
    echo ""
    echo "After installation, run: gh auth login"
    echo "Then run this script again."
    exit 1
fi

# Check if user is authenticated
if ! gh auth status >/dev/null 2>&1; then
    log_warning "Not authenticated with GitHub. Please run:"
    echo "   gh auth login"
    echo "Then run this script again."
    exit 1
fi

# Get GitHub username
GITHUB_USERNAME=$(gh api user --jq '.login')
log_success "Authenticated as: ${GITHUB_USERNAME}"

# Create repository
log_info "Creating GitHub repository: ${REPO_NAME}"

gh repo create "${REPO_NAME}" \
    --description "${REPO_DESCRIPTION}" \
    --public \
    --clone=false \
    --add-readme=false

if [ $? -eq 0 ]; then
    log_success "Repository created successfully"
else
    log_error "Failed to create repository"
    exit 1
fi

# Add remote origin
log_info "Adding remote origin..."
git remote add origin "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

# Verify remote
if git remote -v | grep -q origin; then
    log_success "Remote origin added successfully"
else
    log_error "Failed to add remote origin"
    exit 1
fi

# Push to GitHub
log_info "Pushing code to GitHub..."
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    log_success "Code pushed to GitHub successfully"
else
    log_error "Failed to push to GitHub"
    exit 1
fi

# Set up repository secrets for CI/CD
log_info "Setting up repository secrets..."
echo ""
echo "🔐 Please set up the following secrets in your GitHub repository:"
echo "   Go to: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}/settings/secrets/actions"
echo ""
echo "Required secrets:"
echo "   DOCKERHUB_USERNAME: Your DockerHub username"
echo "   DOCKERHUB_TOKEN: Your DockerHub access token"
echo ""

# Create DockerHub access token instructions
echo "📝 To create DockerHub access token:"
echo "   1. Go to https://hub.docker.com/settings/security"
echo "   2. Click 'New Access Token'"
echo "   3. Name: 'GitHub Actions MindBridge'"
echo "   4. Permissions: Read, Write, Delete"
echo "   5. Copy the token and add it as DOCKERHUB_TOKEN"
echo ""

# Optional: Open repository in browser
if command -v open >/dev/null 2>&1; then
    read -p "Open repository in browser? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"
    fi
elif command -v xdg-open >/dev/null 2>&1; then
    read -p "Open repository in browser? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        xdg-open "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"
    fi
fi

# Summary
echo ""
echo "🎉 GitHub Setup Complete!"
echo "========================="
echo "📦 Repository: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"
echo "🔄 CI/CD: GitHub Actions configured"
echo "🐳 Docker: Multi-stage Dockerfile ready"
echo "📚 Docs: DEPLOYMENT.md available"
echo ""
echo "🚀 Next Steps:"
echo "   1. Set up repository secrets (DOCKERHUB_USERNAME, DOCKERHUB_TOKEN)"
echo "   2. Push changes to trigger CI/CD pipeline"
echo "   3. Monitor GitHub Actions for build status"
echo "   4. Deploy to production from DockerHub"
echo ""
log_success "GitHub repository setup completed successfully! 🎉"
