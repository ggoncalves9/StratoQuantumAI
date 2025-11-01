# Strato Quantum AI Agents v2.6.3

Sistema de agentes especializados usando CrewAI e FastAPI, preparado para deployment em AWS Agents Core.

## 🚀 Características Principais

- **FastAPI Backend**: API moderna e performática
- **CrewAI Framework**: Agentes colaborativos especializados
- **Docker Ready**: Containerização completa para AWS
- **WebSocket Support**: Comunicação em tempo real
- **Kubernetes Ready**: Manifests para EKS deployment
- **Monitoring**: Prometheus + Grafana integrados

## 🤖 Agentes Disponíveis

### 1. **Financeiro Agent** 💰
- **Especialidade**: Análise financeira, fluxo de caixa, previsões
- **Tools**: cash_flow_analysis, budget_analysis, roi_calculation, financial_forecast
- **Endpoint**: `/api/agents/financeiro`

### 2. **RH Agent** 👥
- **Especialidade**: Gestão de pessoas, recrutamento, performance
- **Tools**: recruitment_analysis, performance_analysis, culture_analysis, training_analysis
- **Endpoint**: `/api/agents/rh`

### 3. **Tecnologia Agent** 💻
- **Especialidade**: Arquitetura, DevOps, segurança
- **Tools**: architecture_review, security_analysis, performance_optimization, code_review
- **Endpoint**: `/api/agents/tecnologia`

### 4. **Operações Agent** ⚙️
- **Especialidade**: Processos, SLA, gestão de projetos
- **Tools**: process_optimization, sla_monitoring, project_management, incident_analysis
- **Endpoint**: `/api/agents/operacoes`

### 5. **Comercial Agent** 💼
- **Especialidade**: Vendas, CRM, pipeline
- **Tools**: lead_qualification, sales_forecast, pipeline_analysis, conversion_optimization
- **Endpoint**: `/api/agents/comercial`

### 6. **Produto Agent** 🚀
- **Especialidade**: Roadmap, features, feedback
- **Tools**: feature_prioritization, user_feedback_analysis, roadmap_planning, usage_analytics
- **Endpoint**: `/api/agents/produto`

### 7. **Marketing Agent** 📈
- **Especialidade**: Campanhas, SEO, performance
- **Tools**: campaign_optimization, seo_analysis, content_strategy, roi_analysis
- **Endpoint**: `/api/agents/marketing`

## 🏗️ Arquitetura v2.6.3

```
stratoquantum_agents/
├── api/                     # FastAPI application
│   ├── main.py             # Application entry point
│   ├── config.py           # Environment configuration
│   ├── routes/             # API endpoints
│   ├── services/           # Business logic
│   ├── middleware/         # Custom middleware
│   └── utils/              # Utilities
├── agents/                 # CrewAI agent implementations
├── kubernetes/             # K8s deployment manifests
├── scripts/                # Deployment scripts
├── monitoring/             # Prometheus/Grafana configs
├── docker-compose.yml      # Container orchestration
├── Dockerfile             # Multi-stage build
└── requirements.txt        # Python dependencies
```

## 🚀 Tecnologias

### Core Framework
- **FastAPI**: Modern Python web framework
- **CrewAI**: Collaborative AI agents framework
- **LangChain**: LLM toolchain and integrations
- **Pydantic**: Data validation and settings

### AI & ML
- **OpenAI**: GPT models integration
- **Anthropic**: Claude models support
- **LangChain Tools**: Specialized agent tools

### Infrastructure
- **PostgreSQL**: Primary database
- **Redis**: Caching and session management
- **Docker**: Containerization
- **Kubernetes**: Orchestration for AWS EKS

### Monitoring & Observability
- **Prometheus**: Metrics collection
- **Grafana**: Dashboards and visualization
- **Sentry**: Error tracking and monitoring
- **Structured Logging**: JSON-based logging

## 🐳 Quick Start with Docker

### Development
```bash
# Clone and setup
git clone <repository-url>
cd stratoquantum_agents

# Copy environment file
cp .env.example .env
# Edit .env with your API keys

# Start development environment
docker-compose --profile development up -d

# View logs
docker-compose logs -f agents-dev
```

### Production (AWS EC2)
```bash
# Deploy to AWS EC2
chmod +x scripts/deploy-aws.sh
./scripts/deploy-aws.sh

# With monitoring
docker-compose --profile monitoring up -d
```

## 📊 API Endpoints

### Core Endpoints
- **Health Check**: `GET /health`
- **API Info**: `GET /`
- **Metrics**: `GET /metrics`
- **Documentation**: `GET /docs`

### Agent Management
- **List Agents**: `GET /api/agents`
- **Get Agent**: `GET /api/agents/{agent_id}`
- **Agent Status**: `GET /api/agents/{agent_id}/status`
- **Chat with Agent**: `POST /api/agents/{agent_id}/chat`
- **Restart Agent**: `POST /api/agents/{agent_id}/restart`

### WebSocket
- **Real-time Chat**: `WS /ws/{agent_id}`

## 🔧 Configuration

### Environment Variables
```bash
# Application
ENVIRONMENT=production
DEBUG=false
PORT=8000

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379

# AI Models
OPENAI_API_KEY=your-key-here
MODEL_PROVIDER=openai
DEFAULT_MODEL=gpt-3.5-turbo

# Security
SECRET_KEY=your-secret-key
ALLOWED_ORIGINS=["https://app.stratoquantum.com"]
```

### Agent Configuration
Each agent can be configured individually:
```python
{
    "timeout": 30,
    "memory_size": 10,
    "model": "gpt-4",
    "tools": ["tool1", "tool2"]
}
```

## 🚀 AWS Deployment

### Prerequisites
- AWS EC2 instance with Docker
- PostgreSQL database (RDS recommended)
- Redis instance (ElastiCache recommended)
- OpenAI API key

### Deployment Steps
1. **Setup EC2 instance**
2. **Install Docker and Docker Compose**
3. **Clone repository**
4. **Configure environment variables**
5. **Run deployment script**

```bash
# On AWS EC2
./scripts/deploy-aws.sh
```

### Kubernetes (EKS)
```bash
# Apply Kubernetes manifests
kubectl apply -f kubernetes/

# Check deployment
kubectl get pods -n strato-quantum
```

## 📈 Monitoring

### Metrics Available
- **Agent Performance**: Response times, success rates
- **System Metrics**: CPU, memory, disk usage
- **Business Metrics**: Conversations, user interactions
- **Error Tracking**: Failed requests, exceptions

### Dashboards
- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Agent Status**: http://localhost:8000/api/agents/status/all

## 🔒 Security

- **JWT Authentication**: Secure API access
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Pydantic models
- **CORS Configuration**: Controlled origins
- **Environment Isolation**: Container security

## 🤝 Integration with Platform

### WebSocket Communication
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/financeiro');
ws.send(JSON.stringify({
    message: "Como está nosso fluxo de caixa?",
    user_id: "user123"
}));
```

### REST API Integration
```javascript
const response = await fetch('/api/agents/financeiro/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        message: "Análise financeira mensal",
        conversation_id: "conv123"
    })
});
```

## 📝 Development

### Adding New Agents
1. Create agent class in `agents/`
2. Implement CrewAI agent with tools
3. Register in `agent_manager.py`
4. Add configuration in `config.py`
5. Update API routes

### Testing
```bash
# Run tests
pytest

# Test specific agent
curl -X POST "http://localhost:8000/api/agents/financeiro/chat" \
     -H "Content-Type: application/json" \
     -d '{"message": "Test message"}'
```

---

**Strato Quantum AI Agents v2.6.3** - Ready for AWS Agents Core deployment! 🚀