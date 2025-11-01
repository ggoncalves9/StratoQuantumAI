# Strato Quantum AI Agents - ECR Deployment Guide

Guia completo para deployment de agentes individuais no **Amazon ECR** para uso com **Amazon Bedrock Agents Runtime**.

## 🎯 Visão Geral

Cada agente Strato Quantum é containerizado individualmente e deployado no Amazon ECR como uma imagem separada. Isso permite que o Amazon Bedrock Agents Runtime execute cada agente de forma isolada e escalável.

## 📦 Estrutura de Containers

### Agentes Disponíveis
```
stratoquantum/agent-financeiro    # Análise financeira
stratoquantum/agent-rh           # Recursos humanos  
stratoquantum/agent-tecnologia   # Tecnologia e DevOps
stratoquantum/agent-operacoes    # Operações e processos
stratoquantum/agent-comercial    # Vendas e CRM
stratoquantum/agent-produto      # Gestão de produto
stratoquantum/agent-marketing    # Marketing e campanhas
```

### Estrutura de Diretórios
```
stratoquantum_agents/
├── agents/
│   ├── financeiro/
│   │   ├── Dockerfile          # Container específico
│   │   └── config.json         # Configuração Bedrock
│   ├── rh/
│   │   ├── Dockerfile
│   │   └── config.json
│   └── [outros agentes...]
├── scripts/
│   ├── build-and-push-ecr.sh   # Build e push para ECR
│   ├── create-bedrock-agents.sh # Criação no Bedrock
│   └── generate-agent-structure.sh
└── api/
    └── bedrock_runtime.py       # Runtime para Bedrock
```

## 🚀 Deploy Rápido

### Pré-requisitos
```bash
# AWS CLI configurado
aws configure

# Docker instalado e rodando
docker --version

# Variáveis de ambiente
export AWS_ACCOUNT_ID=123456789012
export AWS_REGION=us-east-1
export VERSION=v2.6.3
```

### 1. Gerar Estrutura dos Agentes
```bash
# Gerar todos os agentes
./scripts/generate-agent-structure.sh

# Ou gerar agente específico
./scripts/generate-agent-structure.sh financeiro
```

### 2. Build e Push para ECR
```bash
# Fazer build e push de todos os agentes
./scripts/build-and-push-ecr.sh

# Ou agente específico
./scripts/build-and-push-ecr.sh financeiro
```

### 3. Criar Agentes no Bedrock
```bash
# Criar todos os agentes no Bedrock
./scripts/create-bedrock-agents.sh

# Ou agente específico
./scripts/create-bedrock-agents.sh financeiro
```

## 🔧 Configuração Detalhada

### Dockerfile Individual
Cada agente tem seu próprio Dockerfile otimizado:

```dockerfile
# agents/financeiro/Dockerfile
FROM python:3.11-slim as base

ENV PYTHONUNBUFFERED=1 \
    AGENT_ID=financeiro

# Install dependencies
RUN apt-get update && apt-get install -y gcc g++ curl

# Copy agent-specific code
COPY agents/financeiro_agent.py ./agent.py
COPY api/bedrock_runtime.py ./runtime.py
COPY agents/financeiro/config.json ./config.json

# Health check for AWS
HEALTHCHECK --interval=30s --timeout=10s \
    CMD curl -f http://localhost:8080/health || exit 1

EXPOSE 8080
CMD ["python", "runtime.py"]
```

### Configuração Bedrock
Cada agente tem configuração específica para Bedrock:

```json
{
  "agent": {
    "id": "financeiro",
    "name": "Agente Financeiro",
    "description": "Especialista em análise financeira"
  },
  "bedrock": {
    "model_id": "anthropic.claude-3-sonnet-20240229-v1:0",
    "region": "us-east-1",
    "max_tokens": 4000,
    "temperature": 0.1
  },
  "tools": [
    {
      "name": "cash_flow_analyzer",
      "description": "Analisa fluxo de caixa",
      "parameters": {
        "period": {
          "type": "string",
          "description": "Período de análise"
        }
      }
    }
  ],
  "aws": {
    "ecr_repository": "stratoquantum/agent-financeiro",
    "task_role_arn": "arn:aws:iam::ACCOUNT:role/StratoQuantumAgentFinanceiroRole"
  }
}
```

## 🏗️ Processo de Build

### Build Manual
```bash
# 1. Login no ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  123456789012.dkr.ecr.us-east-1.amazonaws.com

# 2. Criar repositório ECR (se não existir)
aws ecr create-repository \
  --repository-name stratoquantum/agent-financeiro \
  --region us-east-1

# 3. Build da imagem
docker build \
  -f agents/financeiro/Dockerfile \
  -t 123456789012.dkr.ecr.us-east-1.amazonaws.com/stratoquantum/agent-financeiro:v2.6.3 \
  .

# 4. Push para ECR
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/stratoquantum/agent-financeiro:v2.6.3
```

### Build Automatizado
```bash
# Build todos os agentes
chmod +x scripts/build-and-push-ecr.sh
./scripts/build-and-push-ecr.sh

# Saída esperada:
# ✅ Agent financeiro deployed to ECR:
#    📦 Repository: stratoquantum/agent-financeiro
#    🏷️  Image URI: 123456789012.dkr.ecr.us-east-1.amazonaws.com/stratoquantum/agent-financeiro:v2.6.3
```

## 🤖 Integração com Bedrock

### Criação do Agente
```bash
# Criar agente no Bedrock
aws bedrock-agent create-agent \
  --agent-name "StratoQuantumFinanceiroAgent" \
  --description "Especialista em análise financeira" \
  --foundation-model "anthropic.claude-3-sonnet-20240229-v1:0" \
  --instruction "Você é o agente financeiro da Strato Quantum..."
```

### Configuração de Action Group
```bash
# Criar action group
aws bedrock-agent create-agent-action-group \
  --agent-id AGENT_ID \
  --agent-version DRAFT \
  --action-group-name "FinanceiroActions" \
  --action-group-executor '{"customControl": "RETURN_CONTROL"}' \
  --function-schema file://agents/financeiro/config.json
```

### Teste do Agente
```bash
# Invocar agente
aws bedrock-agent-runtime invoke-agent \
  --agent-id AGENT_ID \
  --agent-alias-id production \
  --session-id test-session \
  --input-text "Como está nosso fluxo de caixa?"
```

## 📊 Monitoramento

### CloudWatch Logs
```bash
# Ver logs do agente
aws logs describe-log-groups \
  --log-group-name-prefix "/aws/bedrock/agent/stratoquantum-financeiro"
```

### Métricas
- **Invocations**: Número de invocações
- **Duration**: Tempo de resposta
- **Errors**: Taxa de erro
- **Throttles**: Limitações de rate

### Health Checks
Cada container expõe endpoint de saúde:
```bash
curl http://localhost:8080/health
```

## 🔒 Segurança e IAM

### Roles Necessárias

#### Agent Execution Role
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "bedrock.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

#### Agent Task Role
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

### ECR Permissions
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage"
      ],
      "Resource": "*"
    }
  ]
}
```

## 🚀 Deployment em Produção

### CI/CD Pipeline
```yaml
# .github/workflows/deploy-agents.yml
name: Deploy Agents to ECR
on:
  push:
    branches: [main]
    paths: ['stratoquantum_agents/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Configure AWS
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Build and Push
        run: |
          cd stratoquantum_agents
          ./scripts/build-and-push-ecr.sh
```

### Terraform (Opcional)
```hcl
# terraform/ecr.tf
resource "aws_ecr_repository" "agent_repositories" {
  for_each = toset([
    "stratoquantum/agent-financeiro",
    "stratoquantum/agent-rh",
    "stratoquantum/agent-tecnologia"
  ])
  
  name = each.value
  
  image_scanning_configuration {
    scan_on_push = true
  }
  
  encryption_configuration {
    encryption_type = "AES256"
  }
}
```

## 🔍 Troubleshooting

### Problemas Comuns

#### 1. ECR Login Failed
```bash
# Verificar credenciais AWS
aws sts get-caller-identity

# Re-fazer login
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
```

#### 2. Build Failed
```bash
# Verificar Dockerfile
docker build -f agents/financeiro/Dockerfile . --no-cache

# Verificar dependências
docker run -it python:3.11-slim bash
```

#### 3. Bedrock Agent Error
```bash
# Verificar logs
aws logs tail /aws/bedrock/agent/AGENT_ID --follow

# Verificar permissões
aws iam get-role --role-name StratoQuantumAgentFinanceiroRole
```

### Logs e Debug
```bash
# Ver logs do container
docker logs CONTAINER_ID

# Debug interativo
docker run -it --entrypoint bash IMAGE_URI

# Testar health check
curl -f http://localhost:8080/health
```

## 📋 Checklist de Deploy

- [ ] AWS CLI configurado
- [ ] Docker instalado
- [ ] Variáveis de ambiente definidas
- [ ] Repositórios ECR criados
- [ ] IAM roles configuradas
- [ ] Agentes buildados e pushed
- [ ] Bedrock agents criados
- [ ] Testes de invocação realizados
- [ ] Monitoramento configurado

## 🎯 Próximos Passos

1. **Implementar agentes restantes** (tecnologia, operações, etc.)
2. **Configurar CI/CD pipeline** para deploy automático
3. **Integrar com plataforma principal** via API
4. **Configurar monitoramento** e alertas
5. **Otimizar custos** e performance

---

**Cada agente agora roda isoladamente no ECR e pode ser invocado pelo Bedrock Agents Runtime!** 🚀