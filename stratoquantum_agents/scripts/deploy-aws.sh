#!/bin/bash

# Strato Quantum AI Agents - AWS Deployment Script v2.6.3
# Deploy agents to AWS EC2 with Docker

set -e

echo "🚀 Deploying Strato Quantum AI Agents v2.6.3 to AWS..."
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
    REGION=$(curl -s http://169.254.169.254/latest/meta-data/placement/region)
    print_success "Running on AWS EC2: $INSTANCE_ID ($INSTANCE_TYPE) in $REGION"
else
    print_warning "Not running on AWS EC2, proceeding with local deployment"
fi

# Check Docker
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please install and start Docker."
    exit 1
fi

print_success "Docker is available"

# Check environment variables
if [ -z "$OPENAI_API_KEY" ]; then
    print_warning "OPENAI_API_KEY not set. Agents will use mock responses."
fi

if [ -z "$SECRET_KEY" ]; then
    print_warning "SECRET_KEY not set, generating one..."
    export SECRET_KEY="agents-secret-$(date +%s)-$(openssl rand -hex 16)"
fi

# Create production .env file
print_status "Creating production environment configuration..."
cat > .env << EOF
# Production Configuration - Generated $(date)
ENVIRONMENT=production
DEBUG=false
HOST=0.0.0.0
PORT=8000
WORKERS=4

# Database
DATABASE_URL=postgresql://stratoquantum:${POSTGRES_PASSWORD:-stratoquantum2025}@postgres:5432/stratoquantum
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=30

# Redis
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=${REDIS_PASSWORD:-stratoquantum2025}

# Security
SECRET_KEY=${SECRET_KEY}
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI Models
OPENAI_API_KEY=${OPENAI_API_KEY:-}
MODEL_PROVIDER=openai
DEFAULT_MODEL=gpt-3.5-turbo

# CORS - Allow platform access
ALLOWED_ORIGINS=["http://localhost:3000","https://*.stratoquantum.com"]

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json

# Monitoring
ENABLE_METRICS=true
SENTRY_DSN=${SENTRY_DSN:-}

# AWS
AWS_REGION=${AWS_REGION:-us-east-1}

# Agent Configuration
AGENT_TIMEOUT=30
MAX_CONCURRENT_REQUESTS=100
AGENT_MEMORY_SIZE=10

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60
EOF

print_success "Production .env created"

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose down --remove-orphans

# Build images
print_status "Building production images..."
docker-compose build --no-cache

# Start core services
print_status "Starting AI Agents services..."
docker-compose up -d

# Wait for services to be ready
print_status "Waiting for services to initialize..."
sleep 20

# Health checks
print_status "Performing health checks..."

# Check PostgreSQL
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

# Check Agents Core
for i in {1..60}; do
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        print_success "AI Agents Core is healthy"
        break
    fi
    if [ $i -eq 60 ]; then
        print_error "AI Agents Core failed to start"
        exit 1
    fi
    sleep 2
done

# Test agent functionality
print_status "Testing agent functionality..."
RESPONSE=$(curl -s -X POST "http://localhost:8000/api/agents/financeiro/chat" \
    -H "Content-Type: application/json" \
    -d '{"message": "Como está nosso fluxo de caixa?"}')

if echo "$RESPONSE" | grep -q '"success":true'; then
    print_success "Agent functionality test passed"
else
    print_warning "Agent functionality test failed, but service is running"
fi

# Show deployment summary
echo ""
print_success "🎉 Strato Quantum AI Agents v2.6.3 deployed successfully!"
echo ""
echo "📊 Services:"
echo "   • AI Agents API: http://localhost:8000"
echo "   • Health Check: http://localhost:8000/health"
echo "   • API Documentation: http://localhost:8000/docs"
echo "   • WebSocket: ws://localhost:8000/ws/{agent_id}"
echo ""
echo "🤖 Available Agents:"
echo "   • Financeiro: http://localhost:8000/api/agents/financeiro"
echo "   • RH: http://localhost:8000/api/agents/rh"
echo "   • Tecnologia: http://localhost:8000/api/agents/tecnologia"
echo "   • Operações: http://localhost:8000/api/agents/operacoes"
echo "   • Comercial: http://localhost:8000/api/agents/comercial"
echo "   • Produto: http://localhost:8000/api/agents/produto"
echo "   • Marketing: http://localhost:8000/api/agents/marketing"
echo ""
echo "🔧 Management:"
echo "   • View logs: docker-compose logs -f agents-core"
echo "   • Monitor: docker-compose --profile monitoring up -d"
echo "   • Scale: docker-compose up --scale agents-core=3 -d"
echo "   • Stop: docker-compose down"
echo ""

# Show container status
print_status "Container Status:"
docker-compose ps

# Optional: Start monitoring
read -p "Start monitoring stack (Prometheus + Grafana)? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Starting monitoring stack..."
    docker-compose --profile monitoring up -d
    echo "   • Prometheus: http://localhost:9090"
    echo "   • Grafana: http://localhost:3001 (admin/admin)"
fi

echo ""
print_success "Deployment completed! 🚀"
print_status "Agents are ready to serve the Strato Quantum Platform"