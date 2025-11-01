# StratoQuantum - Technology Stack

## Architecture Overview

**Microservices Architecture** with separated frontend/backend, designed for Kubernetes deployment and cloud-native scalability.

## Frontend Stack

- **Framework**: Vanilla JavaScript (ES6+) with Web Components
- **Styling**: Tailwind CSS (utility-first framework)
- **UI Patterns**: Progressive Web App (PWA) ready
- **Build**: No complex build process - direct browser compatibility
- **Responsive**: Mobile-first design with floating AI toolbar

## Backend Stack

### Core Technologies
- **Runtime**: Node.js 18+ 
- **Framework**: Express.js
- **Language**: JavaScript (ES6+)
- **API**: RESTful with Socket.io for real-time features

### Database & Storage
- **Primary DB**: MongoDB 7.0 (document-based)
- **Cache**: Redis 7.2 (sessions, rate limiting)
- **File Storage**: Local filesystem (future: AWS S3)

### Security & Auth
- **Authentication**: JWT with refresh tokens
- **Security Headers**: Helmet.js
- **Rate Limiting**: rate-limiter-flexible
- **Input Validation**: Joi schema validation
- **CORS**: Configured for cross-origin requests

### Monitoring & Logging
- **Logging**: Winston (structured logging)
- **Metrics**: Prometheus (optional profile)
- **Dashboards**: Grafana (optional profile)
- **Health Checks**: Built-in endpoint monitoring

## AI Agent Stack

### Core Framework
- **Agent Framework**: CrewAI (collaborative AI agents)
- **LLM Integration**: LangChain for tool chains
- **Models**: OpenAI/Anthropic APIs (future: local DeepSeek/Ollama)
- **Agent Language**: Python 3.8+

### Agent Tools
- **Financial**: Cash flow analysis, ROI calculation, forecasting
- **Data Processing**: Real-time analysis and insights
- **Integration**: WebSocket + REST API communication

## Infrastructure & DevOps

### Containerization
- **Container**: Docker with multi-stage builds
- **Orchestration**: Docker Compose (dev), Kubernetes (prod)
- **Registry**: Docker Hub (future: AWS ECR)

### Deployment Targets
- **Development**: Local Docker Compose
- **Production**: AWS EKS (target), EKS Anywhere (current)
- **Infrastructure**: Terraform for IaC
- **GitOps**: ArgoCD consideration for deployment automation

### Reverse Proxy
- **Web Server**: Nginx (production profile)
- **SSL/TLS**: Let's Encrypt certificates
- **Load Balancing**: Nginx upstream configuration

## Development Workflow

### Package Management
- **Node.js**: npm (workspaces support)
- **Python**: pip/uv for agent dependencies
- **Lockfiles**: package-lock.json for reproducible builds

### Code Quality
- **Linting**: ESLint for JavaScript
- **Testing**: Jest with Supertest for API testing
- **Code Style**: Consistent formatting standards

### Environment Management
- **Config**: dotenv for environment variables
- **Secrets**: Environment-based (JWT_SECRET, DB passwords)
- **Multi-env**: Development, staging, production configs

## Common Commands

### Development Setup
```bash
# Full setup
npm run setup
npm run install:all

# Start development
npm run dev
./start-dev.sh

# Docker development
npm run docker:dev
docker-compose up -d
```

### Production Deployment
```bash
# Production build
npm run build
npm run docker:prod

# With monitoring
npm run docker:monitor
docker-compose --profile production --profile monitoring up -d
```

### Maintenance
```bash
# View logs
npm run docker:logs
docker-compose logs -f app

# Clean environment
npm run clean
docker system prune -a
```

### Testing & Quality
```bash
# Run tests
npm test
npm run lint

# Health check
curl http://localhost:3000/health
```

## Performance Considerations

- **Caching Strategy**: Redis for session and API response caching
- **Database Indexing**: MongoDB indexes for query optimization
- **Rate Limiting**: API protection against abuse
- **Health Monitoring**: Automated health checks and restart policies
- **Resource Limits**: Container resource constraints

## Security Best Practices

- **Non-root Containers**: Security-focused Docker images
- **Secret Management**: Environment-based secrets (future: AWS Secrets Manager)
- **Network Security**: Docker network isolation
- **Input Sanitization**: Joi validation for all inputs
- **HTTPS Only**: SSL/TLS termination at Nginx level