# MindBridge Nigeria - Docker Deployment Setup

## Quick Deployment Guide

### 1. GitHub Secrets Configuration

You need to add these secrets to your GitHub repository:

1. Go to: `https://github.com/temitayocharles/mindbridge-nigeria/settings/secrets/actions`
2. Add the following secrets:
   - `DOCKERHUB_USERNAME`: Your Docker Hub username
   - `DOCKERHUB_TOKEN`: Your Docker Hub access token

### 2. Docker Hub Access Token

1. Go to Docker Hub: https://hub.docker.com/settings/security
2. Click "New Access Token"
3. Name: "MindBridge-GitHub-Actions"
4. Access permissions: "Read, Write, Delete"
5. Copy the generated token and add it as `DOCKERHUB_TOKEN` secret

### 3. Current Status

✅ ESLint errors fixed
✅ Dockerfile configured (multi-stage, production-ready)
✅ GitHub Actions workflow ready
✅ Next.js standalone output configured

### 4. Deploy Process

Once secrets are added, every push to `main` branch will:

1. ✅ Lint code
2. ✅ Build Next.js application
3. ✅ Build Docker image (multi-platform: amd64, arm64)
4. ✅ Push to Docker Hub as: `docker.io/[username]/mindbridge-nigeria:latest`

### 5. Running the Container

```bash
docker run -d \
  --name mindbridge-app \
  -p 3000:3000 \
  -e NODE_ENV=production \
  [your-dockerhub-username]/mindbridge-nigeria:latest
```

### 6. Production Environment Variables

Add these to your production environment:
- `MONGODB_URI`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NODE_ENV=production`

The application will be available at `http://localhost:3000`

## Current Build Status

The GitHub Actions pipeline is configured and ready. Latest commit pushed successfully.
