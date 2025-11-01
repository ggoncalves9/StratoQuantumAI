# 🐳 Guia de Containerização - StratoQuantum AI

> Documentação completa sobre a estrutura de Dockerfiles e docker-compose do projeto StratoQuantum AI

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura de Arquivos](#estrutura-de-arquivos)
3. [StratoQuantum Agents](#stratoquantum-agents)
4. [StratoQuantum Platform](#stratoquantum-platform)
5. [Orquestração com Docker Compose](#orquestração-com-docker-compose)
6. [Perfis de Deploy](#perfis-de-deploy)
7. [Volumes e Persistência](#volumes-e-persistência)
8. [Rede e Comunicação](#rede-e-comunicação)
9. [Health Checks](#health-checks)
10. [Monitoramento](#monitoramento)
11. [Comandos Úteis](#comandos-úteis)

---

## 🎯 Visão Geral

O projeto StratoQuantum AI é composto por dois módulos principais containerizados:

- **`stratoquantum_agents`**: Módulo de agentes AI (Python/FastAPI)
- **`stratoquantum_platform`**: Plataforma principal (Node.js)

Cada módulo possui seus próprios Dockerfiles e docker-compose, podendo ser executados de forma independente ou integrados.

---

## 📁 Estrutura de Arquivos

```
StratoQuantumAI/
├── stratoquantum_agents/
│   ├── Dockerfile                    # Build multi-stage para agents
│   ├── docker-compose.yml            # Orquestração dos agents
│   ├── requirements.txt              # Dependências Python
│   └── kubernetes/
│       └── agents-deployment.yaml    # Deploy K8s
│
├── stratoquantum_platform/
│   ├── Dockerfile                    # Build multi-stage para platform
│   ├── docker-compose.yml            # Orquestração da platform
│   ├── database/
│   │   ├── Dockerfile                # PostgreSQL customizado
│   │   ├── postgresql.conf           # Config PostgreSQL
│   │   ├── pg_hba.conf               # Auth config
│   │   └── init/
│   │       ├── 01-create-database.sql
│   │       ├── 02-create-tables.sql
│   │       └── 03-seed-data.sql
│   └── scripts/
│       ├── docker-dev.sh             # Setup desenvolvimento
│       └── docker-prod.sh            # Setup produção
```

---

## 🤖 StratoQuantum Agents

### Dockerfile

**Localização**: `stratoquantum_agents/Dockerfile`

**Arquitetura**: Multi-stage build com 3 estágios:

#### 1. **Base Stage**
```dockerfile
FROM python:3.11-slim as base
```
- Define variáveis de ambiente Python
- Instala dependências do sistema (gcc, g++, curl)
- Base para os demais estágios

#### 2. **Development Stage**
```dockerfile
FROM base as development
```
- **Target**: Desenvolvimento local
- Instala todas as dependências (dev + prod)
- Expõe porta 8000
- **Hot-reload** habilitado com `--reload`
- Comando: `uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload`

#### 3. **Dependencies Stage**
```dockerfile
FROM base as deps
```
- Isola instalação de dependências Python
- Otimiza cache do Docker

#### 4. **Production Stage**
```dockerfile
FROM python:3.11-slim as production
```
- **Usuário não-root**: `agents:agents` (segurança)
- Instala apenas runtime dependencies
- Copia dependencies do estágio `deps`
- **Health check**: curl para `/health` a cada 30s
- **Workers**: 4 processos Uvicorn
- Porta: 8000

### Docker Compose

**Localização**: `stratoquantum_agents/docker-compose.yml`

#### Serviços Principais

##### 1. **agents-core** (Produção)
```yaml
services:
  agents-core:
    build:
      target: production
    ports:
      - "8000:8000"
    environment:
      - ENVIRONMENT=production
      - WORKERS=4
      - DATABASE_URL=postgresql://stratoquantum:stratoquantum2025@postgres:5432/stratoquantum
      - REDIS_URL=redis://redis:6379
    restart: unless-stopped
```
- **Rede**: `agents-network`
- **Volumes**: `agents-logs` para persistência de logs
- **Health check**: Integrado com Docker

##### 2. **agents-dev** (Desenvolvimento)
```yaml
services:
  agents-dev:
    build:
      target: development
    profiles:
      - development
```
- **Volumes**: Bind mount de todo código (`.:/app`)
- **Hot-reload**: Automático com Uvicorn
- **Exclui**: `__pycache__` via volumes nomeados

##### 3. **Individual Agent Services** (Microserviços)

```yaml
agent-financeiro:
  ports:
    - "8001:8000"
  environment:
    - AGENT_ID=financeiro

agent-rh:
  ports:
    - "8002:8000"
  environment:
    - AGENT_ID=rh

agent-tecnologia:
  ports:
    - "8003:8000"
  environment:
    - AGENT_ID=tecnologia
```

**Perfil**: `microservices` - Ativa arquitetura distribuída

##### 4. **postgres**
```yaml
postgres:
  image: postgres:15-alpine
  ports:
    - "5433:5432"  # Porta diferente para evitar conflitos
  volumes:
    - agents-postgres-data:/var/lib/postgresql/data
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U stratoquantum -d stratoquantum"]
```

##### 5. **redis**
```yaml
redis:
  image: redis:7.2-alpine
  ports:
    - "6380:6379"  # Porta diferente para evitar conflitos
  command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
  healthcheck:
    test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
```

##### 6. **agents-lb** (Load Balancer)
```yaml
agents-lb:
  image: haproxy:2.8-alpine
  ports:
    - "8080:80"      # Frontend
    - "8404:8404"    # Stats page
  profiles:
    - production
    - microservices
```
- Balanceamento de carga para múltiplos agentes
- Stats em `http://localhost:8404`

##### 7. **prometheus** (Monitoramento)
```yaml
prometheus:
  image: prom/prometheus:latest
  ports:
    - "9090:9090"
  volumes:
    - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
  profiles:
    - monitoring
```

##### 8. **grafana** (Visualização)
```yaml
grafana:
  image: grafana/grafana:latest
  ports:
    - "3001:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD:-admin}
  profiles:
    - monitoring
```

---

## 🎨 StratoQuantum Platform

### Dockerfile

**Localização**: `stratoquantum_platform/Dockerfile`

**Arquitetura**: Multi-stage build com 4 estágios:

#### 1. **Base Stage**
```dockerfile
FROM node:18-alpine AS base
```
- Node.js 18 Alpine (imagem minimalista)

#### 2. **Dependencies Stage**
```dockerfile
FROM base AS deps
```
- Instala apenas dependências de produção
- `npm ci --only=production`
- Cache otimizado

#### 3. **Development Stage**
```dockerfile
FROM base AS dev
```
- Instala todas as dependências (incluindo dev)
- Hot-reload com `npm run dev`
- Porta: 3000

#### 4. **Builder Stage**
```dockerfile
FROM base AS builder
```
- Copia dependencies do estágio `deps`
- Copia código backend e frontend
- Prépara artefatos para produção

#### 5. **Production Stage**
```dockerfile
FROM base AS production
```
- Usuário não-root: `stratoquantum:nodejs`
- Copia artefatos do `builder`
- Health check: HTTP GET para `/health`
- `npm start` (produção)

### Database Dockerfile

**Localização**: `stratoquantum_platform/database/Dockerfile`

```dockerfile
FROM postgres:15-alpine
COPY postgresql.conf /etc/postgresql/postgresql.conf
COPY pg_hba.conf /etc/postgresql/pg_hba.conf
COPY init/ /docker-entrypoint-initdb.d/
```

**Características**:
- PostgreSQL 15 Alpine
- Configuração customizada
- Scripts de inicialização automáticos
- Health check: `pg_isready`

### Docker Compose

**Localização**: `stratoquantum_platform/docker-compose.yml`

#### Serviços Principais

##### 1. **app** (Produção)
```yaml
services:
  app:
    build:
      target: production
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
```

##### 2. **app-dev** (Desenvolvimento)
```yaml
services:
  app-dev:
    build:
      target: dev
    profiles:
      - development
    volumes:
      - ./backend:/app/backend
      - ./frontend:/app/frontend
      - ./workspaces:/app/workspaces
```
- Bind mounts para hot-reload
- Exclui `node_modules` via volume

##### 3. **postgres**
```yaml
postgres:
  build:
    context: ./database
    dockerfile: Dockerfile
  ports:
    - "5432:5432"
  volumes:
    - postgres-data:/var/lib/postgresql/data
    - postgres-logs:/var/log/postgresql
  environment:
    - POSTGRES_DB=stratoquantum
    - POSTGRES_USER=stratoquantum
    - POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-stratoquantum2025}
```

##### 4. **redis**
```yaml
redis:
  image: redis:7.2-alpine
  ports:
    - "6379:6379"
  command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
```

##### 5. **nginx**
```yaml
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    - ./nginx/ssl:/etc/nginx/ssl:ro
  profiles:
    - production
```
- Reverse proxy para produção
- SSL/TLS configurável

##### 6. **prometheus & grafana**
- Similar aos agents, mas com portas diferentes
- Perfil: `monitoring`

---

## 🎭 Perfis de Deploy

### Docker Compose Profiles

Os perfis permitem ativar/desativar serviços conforme o ambiente:

#### **Agents**

| Perfil | Serviços Ativos | Uso |
|--------|----------------|-----|
| *(default)* | `agents-core`, `postgres`, `redis` | Produção básica |
| `development` | `agents-dev` | Desenvolvimento local |
| `microservices` | `agent-{nome}`, `agents-lb` | Arquitetura distribuída |
| `production` | `agents-lb` | Produção com load balancer |
| `monitoring` | `prometheus`, `grafana` | Observabilidade |

#### **Platform**

| Perfil | Serviços Ativos | Uso |
|--------|----------------|-----|
| *(default)* | `app`, `postgres`, `redis` | Produção básica |
| `development` | `app-dev` | Desenvolvimento local |
| `production` | `nginx` | Produção com proxy |
| `monitoring` | `prometheus`, `grafana` | Observabilidade |

### Comandos de Deploy

```bash
# Agents - Produção básica
cd stratoquantum_agents
docker-compose up -d

# Agents - Desenvolvimento
docker-compose --profile development up -d

# Agents - Microserviços completos
docker-compose --profile microservices --profile monitoring up -d

# Platform - Produção completa
cd stratoquantum_platform
docker-compose --profile production --profile monitoring up -d
```

---

## 💾 Volumes e Persistência

### Agents Volumes

| Volume | Path | Descrição |
|--------|------|-----------|
| `agents-postgres-data` | `/var/lib/postgresql/data` | Dados PostgreSQL |
| `agents-redis-data` | `/data` | Dados Redis (AOF) |
| `agents-logs` | `/app/logs` | Logs da aplicação |
| `agents-prometheus-data` | `/prometheus` | Métricas Prometheus |
| `agents-grafana-data` | `/var/lib/grafana` | Dashboards Grafana |

### Platform Volumes

| Volume | Path | Descrição |
|--------|------|-----------|
| `postgres-data` | `/var/lib/postgresql/data` | Dados PostgreSQL |
| `postgres-logs` | `/var/log/postgresql` | Logs PostgreSQL |
| `redis-data` | `/data` | Dados Redis (AOF) |
| `app-logs` | `/app/logs` | Logs da aplicação |
| `nginx-logs` | `/var/log/nginx` | Logs Nginx |
| `prometheus-data` | `/prometheus` | Métricas Prometheus |
| `grafana-data` | `/var/lib/grafana` | Dashboards Grafana |

### Backup Recomendado

```bash
# Backup PostgreSQL Agents
docker run --rm -v strato-quantum-agents-postgres-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/postgres-agents-backup.tar.gz /data

# Backup Redis Agents
docker run --rm -v strato-quantum-agents-redis-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/redis-agents-backup.tar.gz /data
```

---

## 🌐 Rede e Comunicação

### Networks

#### Agents Network
```yaml
networks:
  agents-network:
    driver: bridge
    name: strato-quantum-agents-network
```

**Serviços Conectados**:
- `agents-core`, `agents-dev`
- `agent-{nome}` (microservices)
- `postgres`, `redis`
- `agents-lb`, `prometheus`, `grafana`

#### Platform Network
```yaml
networks:
  strato-network:
    driver: bridge
    name: strato-quantum-network
```

**Serviços Conectados**:
- `app`, `app-dev`
- `postgres`, `redis`
- `nginx`, `prometheus`, `grafana`

### Portas Expostas

#### Agents

| Serviço | Porta Externa | Porta Interna | Descrição |
|---------|---------------|---------------|-----------|
| `agents-core` | 8000 | 8000 | API principal |
| `agents-dev` | 8000 | 8000 | Dev API |
| `agent-financeiro` | 8001 | 8000 | Microserviço |
| `agent-rh` | 8002 | 8000 | Microserviço |
| `agent-tecnologia` | 8003 | 8000 | Microserviço |
| `agents-lb` | 8080 | 80 | Load balancer |
| `agents-lb-stats` | 8404 | 8404 | Stats HAProxy |
| `postgres` | 5433 | 5432 | Database |
| `redis` | 6380 | 6379 | Cache |
| `prometheus` | 9090 | 9090 | Métricas |
| `grafana` | 3001 | 3000 | Dashboards |

#### Platform

| Serviço | Porta Externa | Porta Interna | Descrição |
|---------|---------------|---------------|-----------|
| `app` | 3000 | 3000 | App principal |
| `nginx` | 80, 443 | 80, 443 | Reverse proxy |
| `postgres` | 5432 | 5432 | Database |
| `redis` | 6379 | 6379 | Cache |
| `prometheus` | 9090 | 9090 | Métricas |
| `grafana` | 3001 | 3000 | Dashboards |

**⚠️ Nota**: As portas são diferentes entre Agents e Platform para evitar conflitos.

---

## 🏥 Health Checks

Todos os serviços principais possuem health checks:

### Agents Health Checks

```yaml
# Agents Core
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s

# PostgreSQL
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U stratoquantum -d stratoquantum"]
  interval: 10s
  timeout: 5s
  retries: 5

# Redis
healthcheck:
  test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
  interval: 30s
  timeout: 3s
  retries: 5
```

### Platform Health Checks

```yaml
# App
healthcheck:
  test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

**Verificação**:
```bash
# Status de todos os serviços
docker-compose ps

# Logs de health check
docker-compose logs | grep health
```

---

## 📊 Monitoramento

### Stack de Observabilidade

```bash
# Ativar monitoramento completo
docker-compose --profile monitoring up -d

# Acessar Prometheus
open http://localhost:9090

# Acessar Grafana
open http://localhost:3001
# Credenciais: admin / admin (padrão)
```

### Métricas Coletadas

- **Performance**: CPU, memória, latência
- **APIs**: Requisições, erros, tempo de resposta
- **Database**: Conexões, queries lentas
- **Cache**: Hit rate, evictions
- **Agents**: Mensagens processadas, erros

### Dashboards

Os dashboards são provisionados automaticamente via volumes:
- `./monitoring/grafana/dashboards` → Dashboards JSON
- `./monitoring/grafana/datasources` → Config Prometheus

---

## 🛠️ Comandos Úteis

### Build e Deploy

```bash
# Build sem cache
docker-compose build --no-cache

# Build específico
docker-compose build agents-core

# Deploy em background
docker-compose up -d

# Deploy com logs
docker-compose up

# Restart específico
docker-compose restart agents-core

# Stop/Start
docker-compose stop
docker-compose start

# Down (remove containers)
docker-compose down

# Down + volumes (⚠️ CUIDADO: apaga dados)
docker-compose down -v
```

### Logs e Debug

```bash
# Logs de todos os serviços
docker-compose logs -f

# Logs de serviço específico
docker-compose logs -f agents-core

# Últimas 100 linhas
docker-compose logs --tail=100 agents-core

# Executar comando no container
docker-compose exec agents-core /bin/bash
docker-compose exec postgres psql -U stratoquantum -d stratoquantum

# Inspecionar container
docker-compose ps
docker inspect strato-quantum-agents-core
```

### Limpeza

```bash
# Limpar containers parados
docker-compose down

# Limpar imagens não utilizadas
docker image prune -a

# Limpar volumes não utilizados
docker volume prune

# Limpeza completa do Docker
docker system prune -a --volumes
```

### Desenvolvimento

```bash
# Hot-reload Agents
cd stratoquantum_agents
docker-compose --profile development up

# Hot-reload Platform
cd stratoquantum_platform
docker-compose --profile development up

# Rebuild após mudanças
docker-compose up --build

# Testar produção localmente
docker-compose --profile production up
```

### Kubernetes

```bash
# Deploy no K8s (Agents)
cd stratoquantum_agents/kubernetes
kubectl apply -f agents-deployment.yaml

# Status
kubectl get pods -n stratoquantum
kubectl logs -f <pod-name> -n stratoquantum

# Port forward
kubectl port-forward svc/agents-core 8000:8000 -n stratoquantum
```

---

## 🔐 Segurança

### Boas Práticas Implementadas

✅ **Usuários não-root** em production
✅ **Senhas via variáveis de ambiente** (`.env`)
✅ **Health checks** para resiliência
✅ **Volumes nomeados** para isolamento
✅ **Networks isoladas** por módulo
✅ **Multi-stage builds** para imagens menores
✅ **Alpine base** quando possível

### Recomendações Adicionais

1. **Use secrets management**:
   ```yaml
   secrets:
     db_password:
       file: ./secrets/db_password.txt
   ```

2. **Configure SSL/TLS** no Nginx

3. **Implemente rate limiting** nas APIs

4. **Use Docker secrets** em produção

5. **Scan de vulnerabilidades**:
   ```bash
   docker scan strato-quantum-agents-core
   ```

---

## 📝 Variáveis de Ambiente

### Agents

| Variável | Default | Descrição |
|----------|---------|-----------|
| `ENVIRONMENT` | `production` | Ambiente |
| `DEBUG` | `false` | Debug mode |
| `DATABASE_URL` | - | Connection string PostgreSQL |
| `REDIS_URL` | - | Connection string Redis |
| `SECRET_KEY` | `agents-secret-key...` | Secret da aplicação |
| `OPENAI_API_KEY` | - | OpenAI API key |
| `LOG_LEVEL` | `INFO` | Nível de log |
| `WORKERS` | `4` | Workers Uvicorn |
| `AGENT_ID` | - | ID do agente (microservices) |

### Platform

| Variável | Default | Descrição |
|----------|---------|-----------|
| `NODE_ENV` | `production` | Ambiente Node.js |
| `PORT` | `3000` | Porta da aplicação |
| `DATABASE_URL` | - | Connection string PostgreSQL |
| `REDIS_URL` | - | Connection string Redis |
| `JWT_SECRET` | `your-super-secret...` | Secret JWT |
| `API_RATE_LIMIT` | `100` | Rate limit |
| `POSTGRES_PASSWORD` | `stratoquantum2025` | PostgreSQL password |
| `REDIS_PASSWORD` | `stratoquantum2025` | Redis password |
| `GRAFANA_PASSWORD` | `admin` | Grafana admin password |

### Arquivo .env

```bash
# Criar .env na raiz do módulo
cp .env.example .env

# Editar valores sensíveis
nano .env
```

---

## 🚀 Roadmap de Containerização

### Próximos Passos

- [ ] **Docker Swarm** para orquestração
- [ ] **Kubernetes manifests** completos
- [ ] **Helm charts** para deploy
- [ ] **CI/CD pipeline** com GitLab/GitHub Actions
- [ ] **Multi-arch builds** (ARM64, AMD64)
- [ ] **Distroless images** para maior segurança
- [ ] **gRPC** entre serviços
- [ ] **Service Mesh** (Istio/Linkerd)
- [ ] **Secrets management** integrado

---

## 📚 Referências

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)

---

## 🤝 Contribuindo

Para melhorias na containerização:

1. Teste todas as mudanças localmente
2. Documente novas variáveis de ambiente
3. Atualize este README
4. Execute scans de segurança
5. Submeta PR

---

**Última atualização**: Dezembro 2024  
**Versão**: 1.0.0  
**Mantenedor**: Equipe StratoQuantum AI

---

*"Containerizando o futuro da inteligência empresarial"* 🚀

