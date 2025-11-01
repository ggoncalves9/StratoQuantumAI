# Strato Quantum Platform v2.6.0

Uma plataforma moderna e escalável para gestão empresarial com agentes de IA integrados.

## 🚀 Características Principais

- **Frontend Moderno**: Interface responsiva com Tailwind CSS
- **Arquitetura Separada**: Frontend e Backend desacoplados
- **🤖 Agentes IA Flutuantes**: Barra arrastável com 7 agentes especializados
- **👥 Chat da Equipe**: Sistema interno com 4 personas (Hacker, Hipster, Marketing, Hustle)
- **Workspaces Organizados**: 35 módulos por domínio de negócio
- **CrewAI Integration**: Agentes inteligentes com especialização setorial
- **Docker Ready**: Containerização completa
- **Microserviços**: Preparado para arquitetura distribuída

## 📁 Estrutura do Projeto

```
stratoquantum_platform/
├── frontend/                 # Interface do usuário
│   ├── index.html           # Página principal
│   ├── js/                  # JavaScript modular
│   └── assets/              # Recursos estáticos
├── backend/                 # API e servidor
│   ├── src/                 # Código fonte
│   ├── package.json         # Dependências Node.js
│   └── Dockerfile           # Container backend
├── workspaces/              # Módulos organizados
│   ├── marketing/           # Workspace Marketing
│   ├── comercial/           # Workspace Comercial
│   ├── produto/             # Workspace Produto
│   ├── operacoes/           # Workspace Operações
│   ├── tecnologia/          # Workspace Tecnologia
│   ├── rh/                  # Workspace RH
│   └── financeiro/          # Workspace Financeiro
├── docker-compose.yml       # Orquestração de containers
├── Dockerfile              # Build da aplicação
└── CHANGELOG.md            # Histórico de versões
```

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Tailwind CSS** - Framework CSS utility-first
- **Vanilla JavaScript** - JavaScript moderno (ES6+)
- **Web Components** - Componentes reutilizáveis
- **Progressive Web App** - PWA ready

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Banco de dados NoSQL
- **Redis** - Cache e sessões
- **JWT** - Autenticação
- **Socket.io** - Comunicação real-time

### DevOps
- **Docker** - Containerização
- **Docker Compose** - Orquestração local
- **Nginx** - Proxy reverso
- **Prometheus** - Monitoramento
- **Grafana** - Dashboards

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 18+
- Docker & Docker Compose (opcional)
- Git

### 🐳 Docker (Recomendado para AWS EC2)

1. **Clone o repositório**
```bash
git clone <repository-url>
cd stratoquantum_platform
```

2. **Desenvolvimento com Docker**
```bash
chmod +x scripts/docker-dev.sh
./scripts/docker-dev.sh
```

3. **Produção com Docker**
```bash
chmod +x scripts/docker-prod.sh
./scripts/docker-prod.sh
```

### ⚡ Instalação Local (Alternativa)

1. **Setup automático**
```bash
node scripts/dev-setup.js
```

2. **Inicie desenvolvimento**
```bash
npm run dev
```

### 🔧 Instalação Manual

1. **Instale dependências**
```bash
npm run install:all
```

2. **Configure ambiente**
```bash
cd backend && cp .env.example .env
```

3. **Inicie desenvolvimento**
```bash
npm run dev
```

4. **Inicie o desenvolvimento**
```bash
npm run dev
```

### Usando Docker

1. **Desenvolvimento**
```bash
# Inicia todos os serviços em modo desenvolvimento
docker-compose up -d

# Logs da aplicação
docker-compose logs -f app
```

2. **Produção**
```bash
# Build e deploy completo
docker-compose --profile production up -d

# Com monitoramento
docker-compose --profile production --profile monitoring up -d
```

## 📊 Workspaces Disponíveis

### Marketing 📈
- **Campanhas**: Gestão de campanhas de marketing
- **SEO & Conteúdo**: Otimização e criação de conteúdo
- **Mídia Paga**: Campanhas pagas e ROI
- **Calendário**: Planejamento de conteúdo
- **Relatórios**: Analytics e métricas

### Comercial 💼
- **Leads**: Gestão de leads e prospects
- **Oportunidades**: Pipeline de vendas
- **Propostas**: Criação e acompanhamento
- **Funil**: Análise do funil de vendas
- **Relatórios**: Performance comercial

### Produto 🚀
- **Roadmap**: Planejamento de produto
- **Backlog**: Gestão de funcionalidades
- **Feedbacks**: Feedback dos usuários
- **Analytics**: Métricas de uso
- **Lançamentos**: Gestão de releases

### Operações ⚙️
- **SLA & Incidentes**: Gestão de incidentes
- **Runbooks**: Procedimentos operacionais
- **Projetos**: Gestão de projetos
- **Inventário**: Controle de ativos
- **Relatórios**: Métricas operacionais

### Tecnologia 💻
- **Arquitetura**: Arquitetura de sistemas
- **CI/CD**: Pipeline de desenvolvimento
- **Observabilidade**: Monitoramento e logs
- **P&D**: Pesquisa e desenvolvimento
- **Segurança**: Segurança da informação

### Recursos Humanos 👥
- **Vagas**: Recrutamento e seleção
- **Onboarding**: Integração de colaboradores
- **Políticas**: Políticas e procedimentos
- **Treinamentos**: Capacitação e desenvolvimento
- **Avaliações**: Avaliação de desempenho

### Financeiro 💰
- **Contas**: Contas a pagar e receber
- **Faturamento**: Gestão de faturamento
- **Forecast**: Projeções financeiras
- **Custos**: Controle de custos
- **Relatórios**: Relatórios financeiros

## 🤖 Agentes IA Flutuantes

**Nova funcionalidade v2.6.0**: Barra flutuante arrastável com 7 agentes especializados

### 🎯 Agentes Disponíveis
- **💰 Financeiro**: Análise financeira, fluxo de caixa e previsões
- **👥 RH**: Gestão de pessoas, recrutamento e performance  
- **💻 Tecnologia**: Arquitetura, DevOps e segurança
- **⚙️ Operações**: Processos, SLA e gestão de projetos
- **💼 Comercial**: Vendas, CRM e pipeline
- **🚀 Produto**: Roadmap, features e feedback
- **📈 Marketing**: Campanhas, SEO e performance

### 💬 Interface de Chat
- **Design**: Estilo WhatsApp/Telegram
- **Transparência**: 70-80% para elegância
- **Responsivo**: Otimizado para mobile
- **Arrastável**: Posicione onde preferir

## 👥 Chat da Equipe

**Nova funcionalidade v2.6.0**: Sistema de chat interno com personas

### 🎭 Personas da Equipe
- **👨‍💻 Hacker (Alex Chen)**: Tech Lead - Técnico e focado em soluções
- **🎨 Hipster (Maya Santos)**: UX/UI Designer - Criativa e user-centric  
- **📈 Marketing (Carlos Oliveira)**: Growth Marketing - Data-driven e estratégico
- **🚀 Hustle (Você)**: CEO/Founder - Visionário e executor

### ✨ Funcionalidades
- **Status Online**: Indicadores em tempo real
- **Auto-respostas**: Simulação inteligente para demos
- **Histórico**: Conversas mock para apresentações
- **Personalidades**: Cada persona tem características únicas

## 🔧 Scripts Disponíveis

### Backend
```bash
npm start          # Produção
npm run dev        # Desenvolvimento com hot reload
npm test           # Testes
npm run lint       # Linting
npm run build      # Build para produção
```

### Docker
```bash
# Desenvolvimento
docker-compose up -d
docker-compose logs -f app

# Produção
docker-compose --profile production up -d

# Monitoramento
docker-compose --profile monitoring up -d

# Limpeza
docker-compose down -v
docker system prune -a
```

## 🌐 Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Workspaces
- `GET /api/workspaces` - Listar workspaces
- `GET /api/workspaces/:id` - Detalhes do workspace
- `GET /api/workspaces/:id/modules` - Módulos do workspace
- `POST /api/workspaces/:id/modules/:moduleId/actions` - Executar ações

### Agentes
- `GET /api/agents` - Listar agentes
- `POST /api/agents/:id/chat` - Chat com agente
- `GET /api/agents/:id/history` - Histórico de conversas

### Analytics
- `GET /api/analytics/dashboard` - Dashboard geral
- `GET /api/analytics/workspace/:id` - Analytics do workspace

## 🔒 Segurança

- **Autenticação JWT** com refresh tokens
- **Rate Limiting** por IP e usuário
- **Helmet.js** para headers de segurança
- **CORS** configurado adequadamente
- **Validação** de entrada com Joi
- **Sanitização** de dados

## 📈 Monitoramento

### Métricas Disponíveis
- Performance da aplicação
- Uso de recursos (CPU, memória)
- Latência de APIs
- Erros e exceções
- Métricas de negócio

### Dashboards
- **Grafana**: Visualização de métricas
- **Prometheus**: Coleta de métricas
- **Health Checks**: Status dos serviços

## 🚀 Deploy

### Ambiente de Produção
1. Configure as variáveis de ambiente
2. Execute `docker-compose --profile production up -d`
3. Configure SSL/TLS no Nginx
4. Configure backup automático do MongoDB

### CI/CD
Pipeline sugerido:
1. **Build**: Testes e build da aplicação
2. **Security**: Scan de vulnerabilidades
3. **Deploy**: Deploy automático
4. **Monitor**: Verificação de saúde

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

- **Documentação**: [docs.stratoquantum.com](https://docs.stratoquantum.com)
- **Issues**: [GitHub Issues](https://github.com/stratoquantum/platform/issues)
- **Email**: support@stratoquantum.com

---

**Strato Quantum Platform v2.6.0** - Transformando a gestão empresarial com IA 🚀

### 🆕 Novidades v2.6.0
- 🤖 **Agentes IA Flutuantes**: Barra arrastável com chat elegante
- 👥 **Chat da Equipe**: 4 personas com auto-respostas inteligentes  
- 🏗️ **CrewAI Integration**: Estrutura preparada para agentes especializados
- 📱 **Mobile Optimized**: Design responsivo aprimorado
- 🎨 **UX Melhorada**: Interface mais intuitiva e moderna