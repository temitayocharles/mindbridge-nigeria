# Production-Grade Multi-Stage Dockerfile for MindBridge Nigeria
# Optimized for minimal size, security, and performance

# ======================== Base Stage ========================
FROM node:18-alpine AS base

# Install security updates and dependencies
RUN apk update && apk upgrade && \
    apk add --no-cache \
    libc6-compat \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Create non-root user early for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# ======================== Dependencies Stage ========================
FROM base AS deps

# Copy package files for dependency installation
COPY package.json package-lock.json* ./

# Install dependencies with optimization
RUN npm ci --only=production --no-audit --no-fund --quiet && \
    npm cache clean --force

# ======================== Development Dependencies Stage ========================
FROM base AS dev-deps

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies including dev dependencies
RUN npm ci --no-audit --no-fund --quiet && \
    npm cache clean --force

# ======================== Builder Stage ========================
FROM base AS builder

# Copy dev dependencies
COPY --from=dev-deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Set build environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV SKIP_ENV_VALIDATION=1

# Build the application with optimizations
RUN npm run build && \
    # Remove dev dependencies to save space
    rm -rf node_modules && \
    # Reinstall only production dependencies
    npm ci --only=production --no-audit --no-fund --quiet && \
    npm cache clean --force

# ======================== Runtime Stage ========================
FROM base AS runner

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create app directory with correct permissions
RUN mkdir -p /app && chown -R nextjs:nodejs /app

# Copy production files with correct ownership
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Create and set permissions for cache directory
RUN mkdir -p .next/cache && \
    chown -R nextjs:nodejs .next

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server.js"]

# Add labels for better container management
LABEL maintainer="MindBridge Nigeria Team"
LABEL version="1.0.0"
LABEL description="MindBridge Nigeria - Mental Health Platform"
LABEL org.opencontainers.image.source="https://github.com/mindbridge-nigeria/mindbridge-app"
