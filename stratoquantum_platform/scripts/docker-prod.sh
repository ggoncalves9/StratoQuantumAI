#!/bin/bash

# Strato Quantum Platform - Docker Production Script
# This script deploys the platform in production mode

set -e

echo "🚀 Deploying Strato Quantum Platform v2.6.0 to Production..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running on AWS EC2
if curl -s --max-time 2 http://169.254.169.254/latest/meta-data/instance-id > /dev/null 2>&1; then
    INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
    INSTANCE_TYPE=$(curl -s http://169.254.169.254/latest/meta-data/instance-type)
    print_success "Running on AWS EC2 instance: $INSTANCE_ID ($INSTANCE_TYPE)"
else
    print_warning "Not running on AWS EC2, proceeding with local production setup"
fi

# Check Docker
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check environment variables
if [ -z "$JWT_SECRET" ]; then
    print_warning "JWT_SECRET not set, using default (not recommended for production)"
    export JWT_SECRET="production-jwt-secret-$(date +%s)"
fi

if [ -z "$POSTGRES_PASSWORD" ]; then
    print_warning "POSTGRES_PASSWORD not set, using default"
    export POSTGRES_PASSWORD="stratoquantum2025"
fi

# Create production .env if it doesn't exist
if [ ! -f backend/.env.production ]; then
    print_status "Creating production .env file..."
    cat > backend/.env.production << EOF
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://stratoquantum:${POSTGRES_PASSWORD}@postgres:5432/stratoquantum
REDIS_URL=redis://redis:6379
JWT_SECRET=${JWT_SECRET}
API_RATE_LIMIT=100
LOG_LEVEL=info
EOF
    print_success "Production .env file created"
fi

# Stop any running containers
print_status "Stopping existing containers..."
docker-compose down --remove-orphans

# Pull latest images (if using registry)
print_status "Building production images..."
docker-compose build --no-cache

# Start production services
print_status "Starting production services..."
docker-compose --profile production up -d

# Wait for services
print_status "Waiting for services to initialize..."
sleep 15

# Health checks
print_status "Performing health checks..."

# Check database
for i in {1..30}; do
    if docker-compose exec postgres pg_isready -U stratoquantum -d stratoquantum > /dev/null 2>&1; then
        print_success "PostgreSQL is healthy"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "PostgreSQL failed to start"
        exit 1
    fi
    sleep 2
done

# Check Redis
for i in {1..30}; do
    if docker-compose exec redis redis-cli ping > /dev/null 2>&1; then
        print_success "Redis is healthy"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Redis failed to start"
        exit 1
    fi
    sleep 2
done

# Check application
for i in {1..60}; do
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        print_success "Application is healthy"
        break
    fi
    if [ $i -eq 60 ]; then
        print_error "Application failed to start"
        exit 1
    fi
    sleep 2
done

# Show deployment info
echo ""
print_success "🎉 Strato Quantum Platform deployed successfully!"
echo ""
echo "📊 Production Services:"
echo "   • Application: http://localhost:3000"
echo "   • Health Check: http://localhost:3000/health"
echo "   • API Documentation: http://localhost:3000/api"
echo ""
echo "🔧 Management Commands:"
echo "   • View logs: docker-compose logs -f app"
echo "   • Monitor: docker-compose --profile monitoring up -d"
echo "   • Scale: docker-compose up --scale app=3 -d"
echo "   • Stop: docker-compose down"
echo ""
echo "📈 Monitoring (optional):"
echo "   • Grafana: http://localhost:3001 (admin/admin)"
echo "   • Prometheus: http://localhost:9090"
echo ""

# Show container status
print_status "Container Status:"
docker-compose ps

echo ""
print_success "Deployment completed! 🚀"