#!/bin/bash

# Strato Quantum AI Agents - Build and Push to ECR Script
# Builds individual agent containers and pushes to Amazon ECR

set -e

echo "🚀 Building and pushing Strato Quantum AI Agents to ECR..."
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

# Configuration
AWS_REGION=${AWS_REGION:-us-east-1}
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID}
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
VERSION=${VERSION:-v2.6.3}

# Available agents
AGENTS=("financeiro" "rh" "tecnologia" "operacoes" "comercial" "produto" "marketing")

# Check required variables
if [ -z "$AWS_ACCOUNT_ID" ]; then
    print_error "AWS_ACCOUNT_ID environment variable is required"
    exit 1
fi

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed"
    exit 1
fi

# Check Docker
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running"
    exit 1
fi

print_success "Prerequisites check passed"

# Login to ECR
print_status "Logging in to Amazon ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY
print_success "ECR login successful"

# Function to create ECR repository if it doesn't exist
create_ecr_repo() {
    local repo_name=$1
    
    print_status "Checking ECR repository: $repo_name"
    
    if ! aws ecr describe-repositories --repository-names $repo_name --region $AWS_REGION > /dev/null 2>&1; then
        print_status "Creating ECR repository: $repo_name"
        aws ecr create-repository \
            --repository-name $repo_name \
            --region $AWS_REGION \
            --image-scanning-configuration scanOnPush=true \
            --encryption-configuration encryptionType=AES256
        print_success "ECR repository created: $repo_name"
    else
        print_status "ECR repository already exists: $repo_name"
    fi
}

# Function to build and push agent
build_and_push_agent() {
    local agent_id=$1
    local repo_name="stratoquantum/agent-${agent_id}"
    local image_tag="${ECR_REGISTRY}/${repo_name}:${VERSION}"
    local latest_tag="${ECR_REGISTRY}/${repo_name}:latest"
    
    print_status "Building agent: $agent_id"
    
    # Check if agent directory exists
    if [ ! -d "agents/${agent_id}" ]; then
        print_warning "Agent directory not found: agents/${agent_id}, skipping..."
        return
    fi
    
    # Create ECR repository
    create_ecr_repo $repo_name
    
    # Build Docker image
    print_status "Building Docker image for $agent_id..."
    docker build \
        -f agents/${agent_id}/Dockerfile \
        -t $image_tag \
        -t $latest_tag \
        --build-arg AGENT_ID=$agent_id \
        --build-arg VERSION=$VERSION \
        .
    
    print_success "Docker image built: $image_tag"
    
    # Push to ECR
    print_status "Pushing to ECR: $repo_name"
    docker push $image_tag
    docker push $latest_tag
    
    print_success "Successfully pushed: $repo_name"
    
    # Output image URI
    echo ""
    print_success "✅ Agent $agent_id deployed to ECR:"
    echo "   📦 Repository: $repo_name"
    echo "   🏷️  Image URI: $image_tag"
    echo "   🔗 Latest: $latest_tag"
    echo ""
}

# Main execution
print_status "Starting build and push process for all agents..."
echo ""

# Check if specific agent is requested
if [ $# -eq 1 ]; then
    AGENT_ID=$1
    if [[ " ${AGENTS[@]} " =~ " ${AGENT_ID} " ]]; then
        print_status "Building single agent: $AGENT_ID"
        build_and_push_agent $AGENT_ID
    else
        print_error "Unknown agent: $AGENT_ID"
        print_status "Available agents: ${AGENTS[*]}"
        exit 1
    fi
else
    # Build all agents
    print_status "Building all agents: ${AGENTS[*]}"
    
    for agent in "${AGENTS[@]}"; do
        echo ""
        print_status "Processing agent: $agent"
        build_and_push_agent $agent
    done
fi

# Summary
echo ""
print_success "🎉 Build and push completed!"
echo ""
print_status "📋 Summary:"
echo "   • AWS Region: $AWS_REGION"
echo "   • ECR Registry: $ECR_REGISTRY"
echo "   • Version: $VERSION"
echo ""
print_status "🔧 Next steps:"
echo "   1. Configure Bedrock Agents to use these ECR images"
echo "   2. Set up IAM roles for agent execution"
echo "   3. Create Bedrock Agent definitions"
echo "   4. Test agent invocations"
echo ""

# Show ECR repositories
print_status "📦 ECR Repositories created:"
for agent in "${AGENTS[@]}"; do
    if [ -d "agents/${agent}" ]; then
        repo_name="stratoquantum/agent-${agent}"
        echo "   • $repo_name"
    fi
done

echo ""
print_success "All agents are ready for Bedrock deployment! 🚀"