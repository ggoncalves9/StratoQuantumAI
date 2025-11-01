# StratoQuantum - Project Structure

## Repository Organization

The StratoQuantum project follows a **monorepo structure** with clear separation of concerns across three main components:

```
StratoQuantumAI/
├── stratoquantum_platform/     # Main web platform
├── stratoquantum_agents/       # AI agents system  
├── stratoquantum_environment/  # Infrastructure configs
├── .kiro/                      # Kiro AI assistant configs
├── .vscode/                    # VS Code workspace settings
└── README.md                   # Project overview
```

## Platform Structure (`stratoquantum_platform/`)

### Frontend Organization
```
frontend/
├── index.html                  # Main application entry
├── js/                        # JavaScript modules
│   ├── agents/                # AI agent UI components
│   ├── chat/                  # Team chat system
│   ├── workspaces/            # Workspace modules
│   └── utils/                 # Shared utilities
└── assets/                    # Static resources
    ├── css/                   # Tailwind CSS
    ├── images/                # Images and icons
    └── fonts/                 # Custom fonts
```

### Backend Organization
```
backend/
├── src/
│   ├── server.js              # Application entry point
│   ├── routes/                # API route definitions
│   │   ├── auth.js           # Authentication routes
│   │   ├── agents.js         # AI agent endpoints
│   │   ├── workspaces.js     # Workspace APIs
│   │   └── analytics.js      # Analytics endpoints
│   ├── middleware/            # Express middleware
│   │   ├── auth.js           # JWT authentication
│   │   ├── rateLimiter.js    # Rate limiting
│   │   └── validation.js     # Input validation
│   └── utils/                 # Backend utilities
├── logs/                      # Application logs
├── package.json               # Backend dependencies
├── .env.example               # Environment template
└── Dockerfile                 # Backend container
```

### Workspaces Organization
```
workspaces/
├── marketing/                 # Marketing domain
│   ├── campanhas.html        # Campaigns module
│   ├── seo.html             # SEO & Content
│   ├── midia-paga.html      # Paid media
│   ├── calendario.html       # Content calendar
│   └── relatorios.html       # Marketing reports
├── comercial/                 # Sales domain
│   ├── leads.html            # Lead management
│   ├── oportunidades.html    # Opportunities
│   ├── propostas.html        # Proposals
│   ├── funil.html           # Sales funnel
│   └── relatorios.html       # Sales reports
├── produto/                   # Product domain
│   ├── roadmap.html          # Product roadmap
│   ├── backlog.html          # Feature backlog
│   ├── feedbacks.html        # User feedback
│   ├── analytics.html        # Product analytics
│   └── lancamentos.html      # Release management
├── operacoes/                 # Operations domain
│   ├── sla-incidentes.html   # SLA & Incidents
│   ├── runbooks.html         # Operational procedures
│   ├── projetos.html         # Project management
│   ├── inventario.html       # Asset inventory
│   └── relatorios.html       # Operations reports
├── tecnologia/                # Technology domain
│   ├── arquitetura.html      # System architecture
│   ├── cicd.html            # CI/CD pipelines
│   ├── observabilidade.html  # Monitoring & logs
│   ├── pd.html              # R&D projects
│   └── seguranca.html        # Security management
├── rh/                        # HR domain
│   ├── vagas.html            # Job openings
│   ├── onboarding.html       # Employee onboarding
│   ├── politicas.html        # HR policies
│   ├── treinamentos.html     # Training programs
│   └── avaliacoes.html       # Performance reviews
└── financeiro/                # Financial domain
    ├── contas.html           # Accounts payable/receivable
    ├── faturamento.html      # Billing management
    ├── forecast.html         # Financial forecasting
    ├── custos.html          # Cost management
    └── relatorios.html       # Financial reports
```

## AI Agents Structure (`stratoquantum_agents/`)

```
stratoquantum_agents/
├── agents/                    # Agent implementations
│   ├── financeiro_agent.py   # Financial specialist
│   ├── rh_agent.py          # HR specialist
│   ├── tecnologia_agent.py   # Technology specialist
│   ├── operacoes_agent.py    # Operations specialist
│   ├── comercial_agent.py    # Sales specialist
│   ├── produto_agent.py      # Product specialist
│   └── marketing_agent.py    # Marketing specialist
├── tools/                     # Agent-specific tools
│   ├── financial_tools.py    # Financial analysis tools
│   ├── data_connectors.py    # Database connectors
│   └── api_integrations.py   # External API tools
├── mock/                      # Mock data for development
│   ├── team_chat_data.py     # Team chat personas
│   └── sample_data.py        # Sample business data
├── api/                       # Agent API interface
│   ├── agent_server.py       # FastAPI server
│   └── websocket_handler.py  # Real-time communication
└── README.md                  # Agent documentation
```

## Infrastructure Structure (`stratoquantum_environment/`)

```
stratoquantum_environment/
├── terraform/                 # Infrastructure as Code
│   ├── aws/                  # AWS EKS configuration
│   ├── local/                # Local development
│   └── modules/              # Reusable modules
├── kubernetes/                # K8s manifests
│   ├── deployments/          # Application deployments
│   ├── services/             # Service definitions
│   └── ingress/              # Ingress controllers
├── ansible/                   # Configuration management
└── monitoring/                # Observability configs
    ├── prometheus/           # Metrics collection
    └── grafana/              # Dashboard definitions
```

## Configuration Files

### Root Level Configs
- **docker-compose.yml**: Multi-service orchestration
- **Dockerfile**: Application containerization
- **start-dev.sh**: Development startup script
- **package.json**: Root package configuration
- **README.md**: Project documentation

### Development Configs
- **.vscode/**: VS Code workspace settings
- **.kiro/**: AI assistant steering rules
- **.git/**: Version control configuration

## Naming Conventions

### Files & Directories
- **Lowercase with hyphens**: `user-management.js`
- **Camel case for classes**: `UserManager.js`
- **Portuguese for business domains**: `financeiro/`, `comercial/`
- **English for technical components**: `backend/`, `frontend/`

### API Endpoints
- **RESTful patterns**: `/api/workspaces/:id/modules`
- **Kebab case**: `/api/team-chat/messages`
- **Versioning**: `/api/v1/agents`

### Environment Variables
- **UPPERCASE with underscores**: `MONGODB_URI`
- **Prefixed by service**: `REDIS_URL`, `JWT_SECRET`

## Module Organization Principles

### Workspace Modules
Each business domain (workspace) contains **5 core modules**:
1. **Primary Function** (e.g., leads, campaigns, roadmap)
2. **Secondary Function** (e.g., opportunities, SEO)
3. **Management** (e.g., proposals, calendar)
4. **Analytics** (e.g., funnel, analytics)
5. **Reports** (e.g., relatorios)

### Agent Specialization
Each AI agent corresponds to a business domain:
- **Domain expertise**: Specialized knowledge and tools
- **Cross-domain collaboration**: CrewAI framework integration
- **Real-time communication**: WebSocket + REST API

### Infrastructure Layers
1. **Application Layer**: Frontend + Backend
2. **Data Layer**: MongoDB + Redis
3. **Agent Layer**: Python AI agents
4. **Infrastructure Layer**: Docker + Kubernetes
5. **Monitoring Layer**: Prometheus + Grafana

## Development Workflow

### Feature Development
1. **Frontend**: Add UI components in `frontend/js/`
2. **Backend**: Create API routes in `backend/src/routes/`
3. **Workspace**: Add business modules in `workspaces/`
4. **Agents**: Implement AI logic in `agents/`

### File Placement Guidelines
- **Shared utilities**: `utils/` directories
- **Business logic**: Domain-specific folders
- **Configuration**: Root level or dedicated config folders
- **Documentation**: README files in each major directory