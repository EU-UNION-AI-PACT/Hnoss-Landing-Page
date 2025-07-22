# Production Dockerfile for Hnoss Landing Page
FROM node:18-alpine

# Security: Create non-root user
RUN addgroup -g 1001 -S hnoss && \
    adduser -S hnoss -u 1001

# Install security updates
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (with security audit)
RUN npm ci --only=production && \
    npm audit --production && \
    npm cache clean --force

# Copy application files
COPY . .

# Build application
RUN npm run build

# Change ownership to non-root user
RUN chown -R hnoss:hnoss /app

# Switch to non-root user
USER hnoss

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); \
    const options = {hostname: 'localhost', port: 3002, path: '/health', timeout: 2000}; \
    const req = http.request(options, (res) => process.exit(res.statusCode === 200 ? 0 : 1)); \
    req.on('error', () => process.exit(1)); \
    req.end();"

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "dist/server/index.js"]