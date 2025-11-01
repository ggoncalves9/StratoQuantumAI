#!/bin/bash

# Strato Quantum AI Agents - Generate Agent Structure Script
# Creates directory structure and files for new agents

set -e

echo "🏗️  Generating agent structure for Strato Quantum..."
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

# Function to generate agent structure
generate_agent() {
    local agent_id=$1
    local agent_name=$2
    local description=$3
    local capabilities=$4
    
    print_status "Generating structure for agent: $agent_name"
    
    # Create agent directory
    mkdir -p "agents/${agent_id}"
    
    # Generate Dockerfile
    cat > "agents/${agent_id}/Dockerfile" << EOF
# Strato Quantum - Agente ${agent_name} - Individual Container for AWS Bedrock
FROM python:3.11-slim as base

# Set environment variables
ENV PYTHONUNBUFFERED=1 \\
    PYTHONDONTWRITEBYTECODE=1 \\
    PIP_NO_CACHE_DIR=1 \\
    PIP_DISABLE_PIP_VERSION_CHECK=1 \\
    AGENT_ID=${agent_id}

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    gcc \\
    g++ \\
    curl \\
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r agent && useradd -r -g agent agent

# Set working directory
WORKDIR /app

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy agent-specific code
COPY agents/${agent_id}_agent.py ./agent.py
COPY agents/tools/ ./tools/
COPY api/bedrock_runtime.py ./runtime.py
COPY api/utils/ ./utils/

# Copy configuration
COPY agents/${agent_id}/config.json ./config.json

# Create logs directory
RUN mkdir -p /app/logs && chown -R agent:agent /app

# Switch to non-root user
USER agent

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
    CMD curl -f http://localhost:8080/health || exit 1

# Expose port
EXPOSE 8080

# Start agent runtime
CMD ["python", "runtime.py"]
EOF
    
    # Generate config.json
    cat > "agents/${agent_id}/config.json" << EOF
{
  "agent": {
    "id": "${agent_id}",
    "name": "Agente ${agent_name}",
    "version": "2.6.3",
    "description": "${description}",
    "workspace": "${agent_id}"
  },
  "bedrock": {
    "runtime_version": "1.0",
    "model_id": "anthropic.claude-3-sonnet-20240229-v1:0",
    "region": "us-east-1",
    "max_tokens": 4000,
    "temperature": 0.2
  },
  "capabilities": ${capabilities},
  "tools": [
    {
      "name": "${agent_id}_analyzer",
      "description": "Ferramenta principal de análise para ${agent_name}",
      "parameters": {
        "query": {
          "type": "string",
          "description": "Consulta ou solicitação para análise"
        }
      }
    }
  ],
  "runtime": {
    "port": 8080,
    "timeout": 30,
    "memory_limit": "512Mi",
    "cpu_limit": "0.5",
    "log_level": "INFO"
  },
  "aws": {
    "ecr_repository": "stratoquantum/agent-${agent_id}",
    "task_role_arn": "arn:aws:iam::ACCOUNT_ID:role/StratoQuantumAgent${agent_name}Role",
    "execution_role_arn": "arn:aws:iam::ACCOUNT_ID:role/StratoQuantumAgentExecutionRole"
  }
}
EOF
    
    print_success "Generated structure for agent: $agent_name"
}

# Agent definitions
declare -A AGENTS=(
    ["tecnologia"]="Tecnologia|Especialista em arquitetura, DevOps e segurança|[\"architecture_review\", \"security_analysis\", \"performance_optimization\", \"code_review\"]"
    ["operacoes"]="Operações|Especialista em processos, SLA e gestão de projetos|[\"process_optimization\", \"sla_monitoring\", \"project_management\", \"incident_analysis\"]"
    ["comercial"]="Comercial|Especialista em vendas, CRM e pipeline|[\"lead_qualification\", \"sales_forecast\", \"pipeline_analysis\", \"conversion_optimization\"]"
    ["produto"]="Produto|Especialista em roadmap, features e feedback|[\"feature_prioritization\", \"user_feedback_analysis\", \"roadmap_planning\", \"usage_analytics\"]"
    ["marketing"]="Marketing|Especialista em campanhas, SEO e performance|[\"campaign_optimization\", \"seo_analysis\", \"content_strategy\", \"roi_analysis\"]"
)

# Main execution
if [ $# -eq 1 ]; then
    # Generate specific agent
    AGENT_ID=$1
    if [[ -v AGENTS[$AGENT_ID] ]]; then
        IFS='|' read -r agent_name description capabilities <<< "${AGENTS[$AGENT_ID]}"
        generate_agent $AGENT_ID "$agent_name" "$description" "$capabilities"
    else
        print_error "Unknown agent: $AGENT_ID"
        print_status "Available agents: ${!AGENTS[@]}"
        exit 1
    fi
else
    # Generate all missing agents
    print_status "Generating structure for all agents..."
    
    for agent_id in "${!AGENTS[@]}"; do
        IFS='|' read -r agent_name description capabilities <<< "${AGENTS[$agent_id]}"
        
        if [ ! -d "agents/${agent_id}" ]; then
            echo ""
            generate_agent $agent_id "$agent_name" "$description" "$capabilities"
        else
            print_status "Agent ${agent_name} already exists, skipping..."
        fi
    done
fi

echo ""
print_success "🎉 Agent structure generation completed!"
echo ""
print_status "📋 Next steps:"
echo "   1. Implement agent logic in agents/<agent_id>_agent.py"
echo "   2. Build and push to ECR: ./scripts/build-and-push-ecr.sh"
echo "   3. Create Bedrock agents: ./scripts/create-bedrock-agents.sh"
echo ""

print_success "Agent structures are ready for implementation! 🚀"