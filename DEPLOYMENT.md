# 🚀 MindBridge Nigeria - Production Deployment Guide

## 🎯 Overview
This guide covers the complete CI/CD pipeline setup for deploying MindBridge Nigeria to production using Docker and GitHub Actions.

## 📋 Prerequisites

### Required Tools
- Docker Desktop (latest version)
- Git
- Node.js 18+ 
- GitHub account
- DockerHub account

### Required Secrets
Set these in your GitHub repository secrets:
- `DOCKERHUB_USERNAME`: Your DockerHub username
- `DOCKERHUB_TOKEN`: Your DockerHub access token

## 🐳 Docker Configuration

### Multi-Stage Dockerfile Features
- **Base Stage**: Alpine Linux with security updates
- **Dependencies Stage**: Optimized npm ci installation
- **Builder Stage**: Application build with dev dependencies
- **Runtime Stage**: Minimal production image

### Optimizations Applied
- ✅ Multi-stage build for minimal image size
- ✅ Layer caching for faster builds
- ✅ Security scanning with health checks
- ✅ Non-root user for security
- ✅ Signal handling with dumb-init
- ✅ Production-grade environment variables

## 🔧 Local Development Setup

### 1. Environment Configuration
```bash
# Copy environment template
cp .env.production.example .env.local

# Edit with your values
nano .env.local
```

### 2. Build and Run with Docker
```bash
# Build the image
docker build -t mindbridge-nigeria:local .

# Run locally
docker run -p 3000:3000 mindbridge-nigeria:local
```

### 3. Full Stack with Docker Compose
```bash
# Start all services (app, MongoDB, Redis, nginx)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## 🚀 Production Deployment

### Method 1: Automated GitHub Actions (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "feat: production deployment setup"
   git push origin main
   ```

2. **GitHub Actions automatically**:
   - Runs tests and security scans
   - Builds multi-platform Docker image
   - Pushes to DockerHub with version tags
   - Creates deployment artifacts

### Method 2: Manual Deployment

1. **Set environment variables**:
   ```bash
   export DOCKERHUB_USERNAME="your-username"
   export DOCKERHUB_TOKEN="your-token"
   ```

2. **Run deployment script**:
   ```bash
   ./deploy.sh
   ```

## 📦 Docker Image Tags

The CI/CD pipeline creates multiple tags:
- `latest`: Latest stable version
- `v1.0.0`: Semantic version tag
- `v1.0.0-20250804-abc123`: Build-specific tag

## 🔍 Monitoring & Health Checks

### Built-in Health Check
The Docker image includes a health check endpoint:
```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' mindbridge-app

# Manual health check
curl http://localhost:3000/api/health
```

### Container Monitoring
```bash
# View container stats
docker stats mindbridge-app

# View logs
docker logs -f mindbridge-app

# Execute commands in container
docker exec -it mindbridge-app sh
```

## 🛡️ Security Features

### Image Security
- ✅ Non-root user execution
- ✅ Minimal Alpine Linux base
- ✅ Security updates applied
- ✅ Trivy vulnerability scanning
- ✅ Multi-platform builds (amd64, arm64)

### Application Security
- ✅ Security headers implemented
- ✅ Rate limiting configured
- ✅ HTTPS/TLS ready
- ✅ Environment secrets management

## 📊 Performance Optimizations

### Build Optimizations
- Layer caching for faster rebuilds
- Multi-stage builds reduce final image size
- Dependencies cached separately from source
- Build-time optimizations enabled

### Runtime Optimizations
- Next.js standalone output mode
- Static asset optimization
- Memory-efficient Node.js settings
- Proper signal handling

## 🔧 Troubleshooting

### Common Issues

1. **Build Fails**:
   ```bash
   # Check Docker is running
   docker info
   
   # Clean build cache
   docker builder prune
   ```

2. **Health Check Fails**:
   ```bash
   # Check application logs
   docker logs mindbridge-app
   
   # Test health endpoint manually
   curl -v http://localhost:3000/api/health
   ```

3. **Push to DockerHub Fails**:
   ```bash
   # Re-login to DockerHub
   docker login
   
   # Check credentials
   echo $DOCKERHUB_TOKEN | docker login -u $DOCKERHUB_USERNAME --password-stdin
   ```

### Debug Commands
```bash
# Build with debug output
docker build --progress=plain .

# Run container with debug mode
docker run -e NODE_ENV=development mindbridge-nigeria:latest

# Inspect image layers
docker history mindbridge-nigeria:latest
```

## 📈 Deployment Environments

### Development
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Staging
```bash
docker-compose -f docker-compose.yml -f docker-compose.staging.yml up
```

### Production
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

## 🔄 CI/CD Pipeline

### Workflow Triggers
- Push to `main` branch
- Pull request creation
- Tag creation (v*)

### Pipeline Stages
1. **Test**: Lint, build, comprehensive tests
2. **Security**: Vulnerability scanning
3. **Build**: Multi-platform Docker build
4. **Push**: Upload to DockerHub
5. **Deploy**: Production deployment

## 📝 Environment Variables

### Required Production Variables
```bash
NODE_ENV=production
MONGODB_URI=mongodb://...
REDIS_URL=redis://...
NEXTAUTH_SECRET=...
OPENAI_API_KEY=...
STRIPE_SECRET_KEY=...
```

### Docker-specific Variables
```bash
DOCKERHUB_USERNAME=your-username
DOCKERHUB_TOKEN=your-access-token
```

## 🆘 Support

For deployment issues:
1. Check the GitHub Actions logs
2. Review Docker container logs
3. Verify environment variables
4. Test health endpoints
5. Check security settings

## 📚 Additional Resources

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [DockerHub Documentation](https://docs.docker.com/docker-hub/)

---

**Last Updated**: August 4, 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅
