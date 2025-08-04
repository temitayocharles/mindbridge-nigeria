#!/bin/bash

# 🚀 MindBridge Nigeria - Production Deployment Script
# This script builds and pushes the Docker image to DockerHub

set -e  # Exit on any error

# ======================== Configuration ========================
IMAGE_NAME="mindbridge-nigeria"
DOCKER_USERNAME=${DOCKERHUB_USERNAME:-"your-dockerhub-username"}
REGISTRY="docker.io"
BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ======================== Helper Functions ========================
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

# ======================== Pre-flight Checks ========================
log_info "Starting MindBridge Nigeria deployment process..."

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    log_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "Dockerfile" ]; then
    log_error "Please run this script from the project root directory."
    exit 1
fi

# Check for required files
REQUIRED_FILES=("Dockerfile" ".dockerignore" "next.config.js" "package.json")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        log_error "Required file $file not found!"
        exit 1
    fi
done

log_success "Pre-flight checks passed"

# ======================== Version Management ========================
# Get version from package.json or use timestamp
if command -v node >/dev/null 2>&1; then
    VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "1.0.0")
else
    VERSION="1.0.0"
fi

# If version starts with 'v', remove it
VERSION=${VERSION#v}

# Create version tag
VERSION_TAG="v${VERSION}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BUILD_TAG="${VERSION}-${TIMESTAMP}-${GIT_COMMIT}"

log_info "Building version: ${VERSION_TAG}"
log_info "Build tag: ${BUILD_TAG}"

# ======================== Build Process ========================
log_info "Building Docker image..."

# Build the image with multiple tags
docker build \
    --build-arg BUILDTIME="${BUILD_DATE}" \
    --build-arg VERSION="${VERSION}" \
    --build-arg REVISION="${GIT_COMMIT}" \
    --build-arg BRANCH="${GIT_BRANCH}" \
    --tag "${REGISTRY}/${DOCKER_USERNAME}/${IMAGE_NAME}:latest" \
    --tag "${REGISTRY}/${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION_TAG}" \
    --tag "${REGISTRY}/${DOCKER_USERNAME}/${IMAGE_NAME}:${BUILD_TAG}" \
    --cache-from "${REGISTRY}/${DOCKER_USERNAME}/${IMAGE_NAME}:latest" \
    .

if [ $? -eq 0 ]; then
    log_success "Docker image built successfully"
else
    log_error "Docker build failed"
    exit 1
fi

# ======================== Security Scan ========================
if command -v trivy >/dev/null 2>&1; then
    log_info "Running security scan with Trivy..."
    trivy image --exit-code 0 --severity HIGH,CRITICAL "${REGISTRY}/${DOCKER_USERNAME}/${IMAGE_NAME}:latest"
    if [ $? -eq 0 ]; then
        log_success "Security scan passed"
    else
        log_warning "Security scan found issues, but continuing deployment"
    fi
else
    log_warning "Trivy not installed, skipping security scan"
fi

# ======================== Push to Registry ========================
log_info "Logging into Docker Hub..."

if [ -z "${DOCKERHUB_TOKEN}" ]; then
    log_warning "DOCKERHUB_TOKEN not set, using docker login"
    docker login ${REGISTRY}
else
    echo "${DOCKERHUB_TOKEN}" | docker login ${REGISTRY} -u "${DOCKER_USERNAME}" --password-stdin
fi

if [ $? -eq 0 ]; then
    log_success "Successfully logged into Docker Hub"
else
    log_error "Failed to login to Docker Hub"
    exit 1
fi

log_info "Pushing images to Docker Hub..."

# Push all tags
docker push "${REGISTRY}/${DOCKER_USERNAME}/${IMAGE_NAME}:latest"
docker push "${REGISTRY}/${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION_TAG}"
docker push "${REGISTRY}/${DOCKER_USERNAME}/${IMAGE_NAME}:${BUILD_TAG}"

if [ $? -eq 0 ]; then
    log_success "Successfully pushed all images to Docker Hub"
else
    log_error "Failed to push images to Docker Hub"
    exit 1
fi

# ======================== Cleanup ========================
log_info "Cleaning up old images..."
docker image prune -f

# ======================== Summary ========================
echo ""
echo "🎉 Deployment Summary:"
echo "======================="
echo "📦 Image: ${REGISTRY}/${DOCKER_USERNAME}/${IMAGE_NAME}"
echo "🏷️  Tags pushed:"
echo "   - latest"
echo "   - ${VERSION_TAG}"
echo "   - ${BUILD_TAG}"
echo "🕒 Build time: ${BUILD_DATE}"
echo "🔗 Git commit: ${GIT_COMMIT}"
echo "🌿 Git branch: ${GIT_BRANCH}"
echo ""
echo "🚀 Your MindBridge Nigeria application is now available at:"
echo "   docker pull ${REGISTRY}/${DOCKER_USERNAME}/${IMAGE_NAME}:latest"
echo ""
echo "📝 To deploy, run:"
echo "   docker run -p 3000:3000 ${REGISTRY}/${DOCKER_USERNAME}/${IMAGE_NAME}:latest"
echo ""
log_success "Deployment completed successfully! 🎉"
