#!/bin/bash

# Production server start script for Hnoss Landing Page
# This script starts the application in production mode with all security features

set -e

echo "🚀 Starting Hnoss Landing Page in production mode..."

# Check if we're running in production
if [ "$NODE_ENV" != "production" ]; then
    echo "⚠️  Warning: NODE_ENV is not set to 'production'"
    echo "Setting NODE_ENV=production"
    export NODE_ENV=production
fi

# Ensure required environment variables are set
if [ -z "$SESSION_SECRET" ]; then
    echo "❌ Error: SESSION_SECRET environment variable is required"
    exit 1
fi

if [ -z "$DOMAIN" ]; then
    echo "⚠️  Warning: DOMAIN not set, using default"
    export DOMAIN="wwwKnowNowNoKnow.Rocks"
fi

# Set production security defaults
export TRUST_PROXY=true
export HTTPS=true
export SECURE_COOKIES=true

# Build the application if dist doesn't exist
if [ ! -d "dist" ]; then
    echo "📦 Building application..."
    npm run build
fi

# Start the application
echo "🌟 Starting Hnoss Landing Page server..."
echo "🌐 Domain: https://$DOMAIN"
echo "🔐 Security: Enhanced production mode"
echo "📡 Port: ${PORT:-3002}"

# Use built server
if [ -f "dist/server/index.js" ]; then
    node dist/server/index.js
else
    echo "❌ Built server not found. Running TypeScript version..."
    npx tsx server/index.ts
fi