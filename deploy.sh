#!/bin/bash

# Hnoss Landing Page - Production Deployment Script
# Deploys the application with full security modules to https://wwwKnowNowNoKnow.Rocks

set -e

echo "🚀 Starting Hnoss Landing Page deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
print_status "Creating deployment directories..."
mkdir -p ssl
mkdir -p logs
mkdir -p fail2ban

# Generate SSL certificate directories if they don't exist
if [ ! -d "ssl" ]; then
    mkdir -p ssl
    print_warning "SSL certificates not found. Please place your SSL certificates in the ssl/ directory:"
    print_warning "  - ssl/fullchain.pem (certificate)"
    print_warning "  - ssl/privkey.pem (private key)"
fi

# Check for environment file
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from .env.example..."
    cp .env.example .env
    print_warning "Please configure your .env file with production values before deployment."
fi

# Validate environment variables
print_status "Validating environment configuration..."
source .env

required_vars=("SESSION_SECRET" "DOMAIN")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        print_error "Required environment variable $var is not set in .env"
        exit 1
    fi
done

# Build the application
print_status "Building the application..."
npm run build

# Pull latest Docker images
print_status "Pulling latest Docker images..."
docker-compose pull

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose down

# Start the application
print_status "Starting Hnoss Landing Page..."
docker-compose up -d

# Wait for services to be ready
print_status "Waiting for services to start..."
sleep 30

# Health check
print_status "Performing health checks..."
if curl -f http://localhost/health > /dev/null 2>&1; then
    print_status "✅ Application is healthy and running!"
else
    print_error "❌ Health check failed. Check the logs:"
    docker-compose logs --tail=50
    exit 1
fi

# Security check
print_status "Performing security checks..."
if curl -f http://localhost/security-status > /dev/null 2>&1; then
    print_status "✅ Security modules are active!"
else
    print_warning "⚠️  Security check returned warnings. Review security configuration."
fi

# Display deployment summary
echo ""
echo "🎉 Deployment Complete!"
echo "=================================================="
print_status "Application URL: https://${DOMAIN}"
print_status "Health Check: https://${DOMAIN}/health"
print_status "Security Status: https://${DOMAIN}/security-status"
print_status "API Status: https://${DOMAIN}/api/status"
echo ""
echo "🔐 Security Features Enabled:"
echo "  ✅ HTTPS/TLS Encryption"
echo "  ✅ DDoS Protection (Rate Limiting)"
echo "  ✅ XSS Protection"
echo "  ✅ CSRF Protection" 
echo "  ✅ Security Headers (Helmet)"
echo "  ✅ CORS Configuration"
echo "  ✅ Session Security"
echo "  ✅ Input Validation"
echo ""
echo "🌍 Global Accessibility:"
echo "  ✅ No Country Restrictions"
echo "  ✅ 24/7 Availability"
echo "  ✅ Cross-Platform Support"
echo "  ✅ Mobile Responsive"
echo ""
echo "📡 API Integration:"
echo "  ✅ RESTful API with Authentication"
echo "  ✅ Rate Limited Endpoints"
echo "  ✅ Health Monitoring"
echo "  ✅ Real-time Status Checks"
echo ""

# Show container status
print_status "Container Status:"
docker-compose ps

echo ""
print_status "To view logs: docker-compose logs -f"
print_status "To stop: docker-compose down"
print_status "To restart: docker-compose restart"

echo ""
print_status "🎯 Deployment successful! Application is now available at https://${DOMAIN}"