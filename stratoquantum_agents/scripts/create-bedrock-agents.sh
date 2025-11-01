#!/bin/bash

# Strato Quantum AI Agents - Create Bedrock Agents Script
# Creates Amazon Bedrock Agents using the ECR images

set -e

echo "🤖 Creating Amazon Bedrock Agents for Strato Quantum..."
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

# Check required variables
if [ -z "$AWS_ACCOUNT_ID" ]; then
    print_error "AWS_ACCOUNT_ID environment variable is required"
    exit 1
fi

# Function to create Bedrock Agent
create_bedrock_agent() {
    local agent_id=$1
    local agent_name=$2
    local description=$3
    local image_uri="${ECR_REGISTRY}/stratoquantum/agent-${agent_id}:${VERSION}"
    
    print_status "Creating Bedrock Agent: $agent_name"
    
    # Create agent definition JSON
    cat > /tmp/agent-${agent_id}.json << EOF
{
    "agentName": "StratoQuantum${agent_name}Agent",
    "description": "$description",
    "idleSessionTTLInSeconds": 1800,
    "foundationModel": "anthropic.claude-3-sonnet-20240229-v1:0",
    "instruction": "Você é o $agent_name da plataforma Strato Quantum. $description. Responda de forma profissional, técnica e acionável.",
    "agentResourceRoleArn": "arn:aws:iam::${AWS_ACCOUNT_ID}:role/StratoQuantumAgent${agent_name}Role"
}
EOF

    # Create the agent
    AGENT_ARN=$(aws bedrock-agent create-agent \
        --region $AWS_REGION \
        --cli-input-json file:///tmp/agent-${agent_id}.json \
        --query 'agent.agentArn' \
        --output text)
    
    if [ $? -eq 0 ]; then
        print_success "Bedrock Agent created: $AGENT_ARN"
        
        # Extract agent ID from ARN
        BEDROCK_AGENT_ID=$(echo $AGENT_ARN | cut -d'/' -f2)
        
        # Create action group for the agent
        create_action_group $BEDROCK_AGENT_ID $agent_id $image_uri
        
        # Prepare the agent
        prepare_agent $BEDROCK_AGENT_ID $agent_name
        
    else
        print_error "Failed to create Bedrock Agent: $agent_name"
    fi
    
    # Cleanup
    rm -f /tmp/agent-${agent_id}.json
}

# Function to create action group
create_action_group() {
    local bedrock_agent_id=$1
    local agent_id=$2
    local image_uri=$3
    
    print_status "Creating action group for agent: $agent_id"
    
    # Load agent configuration
    local config_file="agents/${agent_id}/config.json"
    if [ ! -f "$config_file" ]; then
        print_warning "Config file not found: $config_file"
        return
    fi
    
    # Create action group definition
    cat > /tmp/action-group-${agent_id}.json << EOF
{
    "actionGroupName": "StratoQuantum${agent_id^}Actions",
    "description": "Action group for Strato Quantum ${agent_id} agent",
    "actionGroupExecutor": {
        "customControl": "RETURN_CONTROL"
    },
    "functionSchema": {
        "functions": $(jq '.tools' $config_file)
    },
    "actionGroupState": "ENABLED"
}
EOF

    # Create action group
    aws bedrock-agent create-agent-action-group \
        --region $AWS_REGION \
        --agent-id $bedrock_agent_id \
        --agent-version "DRAFT" \
        --cli-input-json file:///tmp/action-group-${agent_id}.json
    
    if [ $? -eq 0 ]; then
        print_success "Action group created for agent: $agent_id"
    else
        print_error "Failed to create action group for agent: $agent_id"
    fi
    
    # Cleanup
    rm -f /tmp/action-group-${agent_id}.json
}

# Function to prepare agent
prepare_agent() {
    local bedrock_agent_id=$1
    local agent_name=$2
    
    print_status "Preparing Bedrock Agent: $agent_name"
    
    # Prepare the agent
    aws bedrock-agent prepare-agent \
        --region $AWS_REGION \
        --agent-id $bedrock_agent_id
    
    if [ $? -eq 0 ]; then
        print_success "Agent prepared: $agent_name"
        
        # Create alias
        create_agent_alias $bedrock_agent_id $agent_name
    else
        print_error "Failed to prepare agent: $agent_name"
    fi
}

# Function to create agent alias
create_agent_alias() {
    local bedrock_agent_id=$1
    local agent_name=$2
    
    print_status "Creating alias for agent: $agent_name"
    
    # Create alias
    ALIAS_ARN=$(aws bedrock-agent create-agent-alias \
        --region $AWS_REGION \
        --agent-id $bedrock_agent_id \
        --agent-alias-name "production" \
        --description "Production alias for $agent_name" \
        --query 'agentAlias.agentAliasArn' \
        --output text)
    
    if [ $? -eq 0 ]; then
        print_success "Agent alias created: $ALIAS_ARN"
        
        # Output connection info
        echo ""
        print_success "✅ $agent_name Agent Ready:"
        echo "   🤖 Agent ID: $bedrock_agent_id"
        echo "   🔗 Alias ARN: $ALIAS_ARN"
        echo "   📞 Invoke: aws bedrock-agent-runtime invoke-agent --agent-id $bedrock_agent_id --agent-alias-id production"
        echo ""
    else
        print_error "Failed to create alias for agent: $agent_name"
    fi
}

# Main execution
print_status "Creating Bedrock Agents..."

# Agent definitions
declare -A AGENTS=(
    ["financeiro"]="Financeiro|Especialista em análise financeira, fluxo de caixa e previsões"
    ["rh"]="RH|Especialista em gestão de pessoas, recrutamento e desenvolvimento"
    ["tecnologia"]="Tecnologia|Especialista em arquitetura, DevOps e segurança"
    ["operacoes"]="Operacoes|Especialista em processos, SLA e gestão de projetos"
    ["comercial"]="Comercial|Especialista em vendas, CRM e pipeline"
    ["produto"]="Produto|Especialista em roadmap, features e feedback"
    ["marketing"]="Marketing|Especialista em campanhas, SEO e performance"
)

# Check if specific agent is requested
if [ $# -eq 1 ]; then
    AGENT_ID=$1
    if [[ -v AGENTS[$AGENT_ID] ]]; then
        IFS='|' read -r agent_name description <<< "${AGENTS[$AGENT_ID]}"
        print_status "Creating single Bedrock Agent: $agent_name"
        create_bedrock_agent $AGENT_ID "$agent_name" "$description"
    else
        print_error "Unknown agent: $AGENT_ID"
        print_status "Available agents: ${!AGENTS[@]}"
        exit 1
    fi
else
    # Create all agents
    print_status "Creating all Bedrock Agents..."
    
    for agent_id in "${!AGENTS[@]}"; do
        IFS='|' read -r agent_name description <<< "${AGENTS[$agent_id]}"
        echo ""
        print_status "Processing: $agent_name"
        
        # Check if agent directory exists
        if [ -d "agents/${agent_id}" ]; then
            create_bedrock_agent $agent_id "$agent_name" "$description"
        else
            print_warning "Agent directory not found: agents/${agent_id}, skipping..."
        fi
    done
fi

# Summary
echo ""
print_success "🎉 Bedrock Agents creation completed!"
echo ""
print_status "📋 Next steps:"
echo "   1. Test agent invocations using AWS CLI or SDK"
echo "   2. Configure agent permissions and policies"
echo "   3. Integrate with Strato Quantum Platform"
echo "   4. Monitor agent performance and costs"
echo ""

print_status "🧪 Test an agent:"
echo "   aws bedrock-agent-runtime invoke-agent \\"
echo "     --agent-id <AGENT_ID> \\"
echo "     --agent-alias-id production \\"
echo "     --session-id test-session \\"
echo "     --input-text 'Como posso ajudar?'"
echo ""

print_success "All Bedrock Agents are ready! 🚀"