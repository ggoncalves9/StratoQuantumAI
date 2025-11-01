# Strato Quantum Platform - Multi-stage Docker Build
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY backend/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Development stage
FROM base AS dev
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Build stage
FROM base AS builder
WORKDIR /app

# Copy backend dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY backend/ ./

# Copy frontend files
COPY frontend/ ./frontend/

# Production stage
FROM base AS production
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 stratoquantum

# Copy built application
COPY --from=builder --chown=stratoquantum:nodejs /app/src ./src
COPY --from=builder --chown=stratoquantum:nodejs /app/frontend ./frontend
COPY --from=builder --chown=stratoquantum:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=stratoquantum:nodejs /app/package*.json ./

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

USER stratoquantum

EXPOSE 3000

CMD ["npm", "start"]