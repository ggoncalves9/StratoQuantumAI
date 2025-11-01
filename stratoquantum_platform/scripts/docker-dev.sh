#!/bin/bash

# Strato Quantum Platform - Docker Development Script
# This script sets up and runs the development environment using Docker

set -e

echo "🚀 Starting Strato Quantum Platform v2.6.0 in Docker..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

print_success "Docker is running"

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "docker-compose is not installed. Please install docker-compose and try again."
    exit 1
fi

print_success "docker-compose is available"

# Create .env file if it doesn't exist
if [ ! -f backend/.env ]; then
    print_status "Creating .env file from template..."
    cp backend/.env.example backend/.env
    print_success ".env file created"
else
    print_status ".env file already exists"
fi

# Stop any running containers
print_status "Stopping any running containers..."
docker-compose down --remove-orphans

# Build and start services
print_status "Building and starting services..."
docker-compose --profile development up --build -d

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 10

# Check service health
print_status "Checking service health..."

# Check PostgreSQL
if docker-compose exec postgres pg_isready -U stratoquantum -d stratoquantum > /dev/null 2>&1; then
    print_success "PostgreSQL is ready"
else
    print_warning "PostgreSQL is not ready yet, waiting..."
    sleep 5
fi

# Check Redis
if docker-compose exec redis redis-cli ping > /dev/null 2>&1; then
    print_success "Redis is ready"
else
    print_warning "Redis is not ready yet, waiting..."
    sleep 5
fi

# Check application
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    print_success "Application is ready"
else
    print_warning "Application is starting up..."
fi

echo ""
print_success "🎉 Strato Quantum Platform is running!"
echo ""
echo "📊 Services:"
echo "   • Frontend: http://localhost:3000"
echo "   • Backend API: http://localhost:3000/api"
echo "   • Health Check: http://localhost:3000/health"
echo "   • PostgreSQL: localhost:5432"
echo "   • Redis: localhost:6379"
echo ""
echo "🔧 Management:"
echo "   • View logs: docker-compose logs -f app-dev"
echo "   • Stop services: docker-compose down"
echo "   • Restart: docker-compose restart app-dev"
echo ""
echo "💡 Features:"
echo "   • 🤖 Floating AI Agents Toolbar"
echo "   • 👥 Team Chat with 4 Personas"
echo "   • 📊 7 Business Workspaces"
echo "   • 🗄️  PostgreSQL Database"
echo ""

# Show logs
print_status "Showing application logs (Ctrl+C to exit)..."
docker-compose logs -f app-dev