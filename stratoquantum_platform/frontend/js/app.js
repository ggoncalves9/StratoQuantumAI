// Strato Quantum Platform v2.6.0 - Main Application
class StratoQuantumApp {
  constructor() {
    this.currentWorkspace = null;
    this.currentAgent = null;
    this.currentTeamChat = null;
    this.workspaces = this.initializeWorkspaces();
    this.agents = this.initializeAgents();
    this.teamData = this.initializeTeamData();
    this.agentsBarCollapsed = false;
    this.leftSidebarHidden = false;
    this.rightSidebarHidden = false;
    this.init();
  }

  initializeWorkspaces() {
    return [
      {
        id: 'marketing',
        name: 'Marketing',
        icon: '📈',
        color: 'from-pink-500 to-rose-500',
        modules: [
          { id: 'campanhas', name: 'Campanhas', description: 'Gestão de campanhas de marketing' },
          { id: 'seo-conteudo', name: 'SEO & Conteúdo', description: 'Otimização e criação de conteúdo' },
          { id: 'midia-paga', name: 'Mídia Paga', description: 'Campanhas pagas e ROI' },
          { id: 'calendario', name: 'Calendário', description: 'Planejamento de conteúdo' },
          { id: 'relatorios', name: 'Relatórios', description: 'Analytics e métricas' }
        ]
      },
      {
        id: 'comercial',
        name: 'Comercial',
        icon: '💼',
        color: 'from-blue-500 to-cyan-500',
        modules: [
          { id: 'leads', name: 'Leads', description: 'Gestão de leads e prospects' },
          { id: 'oportunidades', name: 'Oportunidades', description: 'Pipeline de vendas' },
          { id: 'propostas', name: 'Propostas', description: 'Criação e acompanhamento' },
          { id: 'funil', name: 'Funil', description: 'Análise do funil de vendas' },
          { id: 'relatorios', name: 'Relatórios', description: 'Performance comercial' }
        ]
      },
      {
        id: 'produto',
        name: 'Produto',
        icon: '🚀',
        color: 'from-purple-500 to-indigo-500',
        modules: [
          { id: 'roadmap', name: 'Roadmap', description: 'Planejamento de produto' },
          { id: 'backlog', name: 'Backlog', description: 'Gestão de funcionalidades' },
          { id: 'feedbacks', name: 'Feedbacks', description: 'Feedback dos usuários' },
          { id: 'analytics', name: 'Analytics', description: 'Métricas de uso' },
          { id: 'lancamentos', name: 'Lançamentos', description: 'Gestão de releases' }
        ]
      },
      {
        id: 'operacoes',
        name: 'Operações',
        icon: '⚙️',
        color: 'from-green-500 to-emerald-500',
        modules: [
          { id: 'sla-incidentes', name: 'SLA & Incidentes', description: 'Gestão de incidentes' },
          { id: 'runbooks', name: 'Runbooks', description: 'Procedimentos operacionais' },
          { id: 'projetos', name: 'Projetos', description: 'Gestão de projetos' },
          { id: 'inventario', name: 'Inventário', description: 'Controle de ativos' },
          { id: 'relatorios', name: 'Relatórios', description: 'Métricas operacionais' }
        ]
      },
      {
        id: 'tecnologia',
        name: 'Tecnologia',
        icon: '💻',
        color: 'from-cyan-500 to-blue-500',
        modules: [
          { id: 'arquitetura', name: 'Arquitetura', description: 'Arquitetura de sistemas' },
          { id: 'ci-cd', name: 'CI/CD', description: 'Pipeline de desenvolvimento' },
          { id: 'observabilidade', name: 'Observabilidade', description: 'Monitoramento e logs' },
          { id: 'pesquisa', name: 'P&D', description: 'Pesquisa e desenvolvimento' },
          { id: 'seguranca', name: 'Segurança', description: 'Segurança da informação' }
        ]
      },
      {
        id: 'rh',
        name: 'Recursos Humanos',
        icon: '👥',
        color: 'from-orange-500 to-red-500',
        modules: [
          { id: 'vagas', name: 'Vagas', description: 'Recrutamento e seleção' },
          { id: 'onboarding', name: 'Onboarding', description: 'Integração de novos colaboradores' },
          { id: 'politicas', name: 'Políticas', description: 'Políticas e procedimentos' },
          { id: 'treinamentos', name: 'Treinamentos', description: 'Capacitação e desenvolvimento' },
          { id: 'avaliacoes', name: 'Avaliações', description: 'Avaliação de desempenho' }
        ]
      },
      {
        id: 'financeiro',
        name: 'Financeiro',
        icon: '💰',
        color: 'from-yellow-500 to-orange-500',
        modules: [
          { id: 'contas', name: 'Contas', description: 'Contas a pagar e receber' },
          { id: 'faturamento', name: 'Faturamento', description: 'Gestão de faturamento' },
          { id: 'forecast', name: 'Forecast', description: 'Projeções financeiras' },
          { id: 'custos', name: 'Custos', description: 'Controle de custos' },
          { id: 'relatorios', name: 'Relatórios', description: 'Relatórios financeiros' }
        ]
      }
    ];
  }

  initializeAgents() {
    return [
      { 
        id: 'financeiro-ai', 
        name: 'Financeiro', 
        shortName: 'F',
        workspace: 'financeiro', 
        status: 'online',
        color: 'from-yellow-500 to-orange-500',
        description: 'Especialista em análise financeira'
      },
      { 
        id: 'rh-ai', 
        name: 'Rec. Humanos', 
        shortName: 'RH',
        workspace: 'rh', 
        status: 'online',
        color: 'from-orange-500 to-red-500',
        description: 'Especialista em gestão de pessoas'
      },
      { 
        id: 'tecnologia-ai', 
        name: 'Tecnologia', 
        shortName: 'T',
        workspace: 'tecnologia', 
        status: 'online',
        color: 'from-cyan-500 to-blue-500',
        description: 'Especialista em tecnologia'
      },
      { 
        id: 'operacoes-ai', 
        name: 'Operações', 
        shortName: 'O',
        workspace: 'operacoes', 
        status: 'online',
        color: 'from-green-500 to-emerald-500',
        description: 'Especialista em operações'
      },
      { 
        id: 'comercial-ai', 
        name: 'Comercial', 
        shortName: 'C',
        workspace: 'comercial', 
        status: 'online',
        color: 'from-blue-500 to-cyan-500',
        description: 'Especialista em vendas'
      },
      { 
        id: 'produto-ai', 
        name: 'Produto', 
        shortName: 'P',
        workspace: 'produto', 
        status: 'online',
        color: 'from-purple-500 to-indigo-500',
        description: 'Especialista em produto'
      },
      { 
        id: 'marketing-ai', 
        name: 'Marketing', 
        shortName: 'M',
        workspace: 'marketing', 
        status: 'online',
        color: 'from-pink-500 to-rose-500',
        description: 'Especialista em marketing'
      }
    ];
  }

  initializeTeamData() {
    return {
      personas: {
        "hacker": {
          name: "Alex Chen",
          role: "Tech Lead",
          avatar: "👨‍💻",
          status: "online",
          lastSeen: "Agora",
          personality: "técnico, direto, focado em soluções"
        },
        "hipster": {
          name: "Maya Santos",
          role: "UX/UI Designer", 
          avatar: "🎨",
          status: "online",
          lastSeen: "Agora",
          personality: "criativa, user-centric, visual"
        },
        "marketing": {
          name: "Carlos Oliveira",
          role: "Growth Marketing",
          avatar: "📈", 
          status: "online",
          lastSeen: "Agora",
          personality: "data-driven, growth-focused, estratégico"
        },
        "hustle": {
          name: "Você",
          role: "CEO/Founder",
          avatar: "🚀",
          status: "online",
          lastSeen: "Agora",
          personality: "visionário, estratégico, executor"
        }
      },
      conversations: this.generateMockConversations(),
      autoResponses: {
        "hacker": [
          "Vou analisar a arquitetura e te retorno em 15min",
          "Implementei a otimização, performance melhorou 40%",
          "Identifiquei o bug, já tenho a correção pronta"
        ],
        "hipster": [
          "Criei um protótipo novo, quer dar uma olhada?",
          "Os usuários estão adorando a nova interface!",
          "Fiz uns testes de usabilidade, tenho insights interessantes"
        ],
        "marketing": [
          "CAC diminuiu 25% com a nova estratégia!",
          "Vamos testar essa hipótese com A/B test",
          "ROI da campanha bateu 300%, vamos escalar!"
        ]
      }
    };
  }

  generateMockConversations() {
    const now = new Date();
    return [
      {
        id: 1,
        sender: "marketing",
        message: "CAC diminuiu 25% com a nova estratégia! 🎉",
        timestamp: new Date(now - 2 * 60 * 60 * 1000), // 2 horas atrás
        read: true
      },
      {
        id: 2,
        sender: "hustle",
        message: "Excelente! Qual foi o driver principal?",
        timestamp: new Date(now - 2 * 60 * 60 * 1000 + 2 * 60 * 1000), // 1h58min atrás
        read: true
      },
      {
        id: 3,
        sender: "marketing",
        message: "Otimização da landing page + segmentação melhor no ads",
        timestamp: new Date(now - 2 * 60 * 60 * 1000 + 5 * 60 * 1000), // 1h55min atrás
        read: true
      },
      {
        id: 4,
        sender: "hipster",
        message: "Fiz uns testes de usabilidade, tenho insights interessantes",
        timestamp: new Date(now - 30 * 60 * 1000), // 30min atrás
        read: true
      },
      {
        id: 5,
        sender: "hacker",
        message: "Deploy realizado com sucesso, tudo funcionando ✅",
        timestamp: new Date(now - 10 * 60 * 1000), // 10min atrás
        read: false
      }
    ];
  }

  init() {
    this.renderNavigation();
    this.renderFloatingAgents();
    this.renderTeamMembers();
    this.bindEvents();
    this.loadStoredTheme();
    this.loadSidebarPreferences();
    this.initializeDraggableAgentsBar();
    this.animateToolbarEntrance();
  }

  animateToolbarEntrance() {
    // Add entrance animation to the toolbar
    const toolbar = document.getElementById('floatingAgentsBar');
    if (toolbar) {
      toolbar.classList.add('animate-slide-up');
      
      // Add staggered animation to agent buttons
      setTimeout(() => {
        const agentButtons = toolbar.querySelectorAll('.agent-btn');
        agentButtons.forEach((btn, index) => {
          setTimeout(() => {
            btn.classList.add('animate-bounce-in');
          }, index * 100);
        });
      }, 300);
    }
  }

  renderNavigation() {
    const nav = document.getElementById('workspaceNav');
    nav.innerHTML = this.workspaces.map(workspace => `
      <div class="workspace-item cursor-pointer p-2 rounded-lg border border-transparent hover:border-quantum-400/30 hover:bg-quantum-400/5 transition-all"
           data-workspace="${workspace.id}">
        <div class="flex items-center space-x-2">
          <span class="text-lg">${workspace.icon}</span>
          <div class="flex-1 min-w-0">
            <div class="font-medium text-sm truncate">${workspace.name}</div>
            <div class="text-xs text-gray-400">${workspace.modules.length} módulos</div>
          </div>
        </div>
      </div>
    `).join('');
  }

  renderFloatingAgents() {
    const agentsList = document.getElementById('aiAgentsList');
    agentsList.innerHTML = this.agents.map(agent => `
      <div class="agent-btn cursor-pointer w-12 h-12 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center text-white font-bold text-sm shadow-lg hover:scale-105 transition-all duration-200 relative group"
           data-agent="${agent.id}"
           title="${agent.name} - ${agent.description}">
        ${agent.shortName}
        <div class="absolute left-full ml-3 bg-dark-800 text-white px-2 py-1 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
          ${agent.name}
        </div>
        <div class="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-dark-900 ${agent.status === 'online' ? '' : 'hidden'}"></div>
      </div>
    `).join('');
  }

  renderTeamMembers() {
    const teamList = document.getElementById('teamMembersList');
    const personas = Object.entries(this.teamData.personas).filter(([id]) => id !== 'hustle');
    
    teamList.innerHTML = personas.map(([id, persona]) => `
      <div class="team-member cursor-pointer p-2 rounded-lg border border-transparent hover:border-quantum-400/30 hover:bg-quantum-400/5 transition-all"
           data-member="${id}">
        <div class="flex items-center space-x-2">
          <div class="relative">
            <span class="text-lg">${persona.avatar}</span>
            <div class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-dark-900"></div>
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="font-medium text-sm truncate">${persona.name}</h4>
            <p class="text-xs text-gray-400 truncate">${persona.role}</p>
          </div>
          <div class="flex items-center">
            <div class="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
          </div>
        </div>
      </div>
    `).join('');
  }

  loadWorkspace(workspaceId) {
    const workspace = this.workspaces.find(w => w.id === workspaceId);
    if (!workspace) return;

    this.currentWorkspace = workspace;
    
    document.getElementById('contentTitle').textContent = workspace.name;
    document.getElementById('contentSubtitle').textContent = `${workspace.modules.length} módulos disponíveis`;
    
    const contentBody = document.getElementById('contentBody');
    contentBody.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${workspace.modules.map(module => `
          <div class="module-card bg-dark-800/30 border border-quantum-400/20 rounded-xl p-6 hover:border-quantum-400/40 hover:bg-dark-800/50 transition-all cursor-pointer"
               data-module="${module.id}" data-workspace="${workspace.id}">
            <h3 class="font-semibold text-lg mb-2">${module.name}</h3>
            <p class="text-gray-400 text-sm mb-4">${module.description}</p>
            <div class="flex items-center justify-between">
              <span class="text-xs text-quantum-300 bg-quantum-400/10 px-2 py-1 rounded-full">
                ${workspace.name}
              </span>
              <svg class="w-5 h-5 text-quantum-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Update active state
    document.querySelectorAll('.workspace-item').forEach(item => {
      item.classList.remove('border-quantum-400/50', 'bg-quantum-400/10');
    });
    document.querySelector(`[data-workspace="${workspaceId}"]`).classList.add('border-quantum-400/50', 'bg-quantum-400/10');
  }

  loadModule(workspaceId, moduleId) {
    const workspace = this.workspaces.find(w => w.id === workspaceId);
    const module = workspace?.modules.find(m => m.id === moduleId);
    
    if (!workspace || !module) return;

    // Load module content via fetch (will be implemented with backend)
    this.loadModuleContent(workspaceId, moduleId);
  }

  async loadModuleContent(workspaceId, moduleId) {
    try {
      // For now, load from static files
      const response = await fetch(`../workspaces/${workspaceId}/${moduleId}.html`);
      if (response.ok) {
        const content = await response.text();
        document.getElementById('contentBody').innerHTML = content;
      } else {
        // Fallback to generated content
        this.generateModuleContent(workspaceId, moduleId);
      }
    } catch (error) {
      this.generateModuleContent(workspaceId, moduleId);
    }
  }

  generateModuleContent(workspaceId, moduleId) {
    const workspace = this.workspaces.find(w => w.id === workspaceId);
    const module = workspace?.modules.find(m => m.id === moduleId);
    
    document.getElementById('contentTitle').textContent = `${workspace.name} - ${module.name}`;
    document.getElementById('contentSubtitle').textContent = module.description;
    
    document.getElementById('contentBody').innerHTML = `
      <div class="space-y-6">
        <div class="bg-dark-800/30 border border-quantum-400/20 rounded-xl p-6">
          <h3 class="text-lg font-semibold mb-4">Dashboard - ${module.name}</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="bg-gradient-to-br ${workspace.color} p-4 rounded-lg text-white">
              <div class="text-2xl font-bold">127</div>
              <div class="text-sm opacity-90">Total de itens</div>
            </div>
            <div class="bg-dark-700/50 border border-quantum-400/20 p-4 rounded-lg">
              <div class="text-2xl font-bold text-green-400">+23%</div>
              <div class="text-sm text-gray-400">Crescimento</div>
            </div>
            <div class="bg-dark-700/50 border border-quantum-400/20 p-4 rounded-lg">
              <div class="text-2xl font-bold text-quantum-400">89%</div>
              <div class="text-sm text-gray-400">Eficiência</div>
            </div>
          </div>
          
          <div class="space-y-4">
            ${Array.from({length: 5}, (_, i) => `
              <div class="bg-dark-700/30 border border-quantum-400/10 rounded-lg p-4 hover:border-quantum-400/30 transition-colors">
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="font-medium">${module.name} Item ${i + 1}</h4>
                    <p class="text-sm text-gray-400">Descrição do item ${i + 1} do módulo ${module.name}</p>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="px-2 py-1 text-xs bg-green-400/20 text-green-300 rounded-full">Ativo</span>
                    <button class="text-quantum-400 hover:text-quantum-300">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="flex justify-between items-center">
          <button class="bg-dark-700 hover:bg-dark-600 text-white px-4 py-2 rounded-lg transition-colors"
                  onclick="app.loadWorkspace('${workspaceId}')">
            ← Voltar para ${workspace.name}
          </button>
          <button class="bg-quantum-500 hover:bg-quantum-600 text-white px-6 py-2 rounded-lg transition-colors">
            Novo ${module.name}
          </button>
        </div>
      </div>
    `;
  }

  openAgentModal(agentId) {
    const agent = this.agents.find(a => a.id === agentId);
    if (!agent) return;

    this.currentAgent = agent;
    document.getElementById('agentModalTitle').textContent = agent.name;
    document.getElementById('agentModal').classList.remove('hidden');
    document.getElementById('agentModal').classList.add('flex');
    
    // Load agent conversation
    this.loadAgentConversation(agentId);
  }

  loadAgentConversation(agentId) {
    const conversations = this.getStoredConversations(agentId);
    const modalBody = document.getElementById('agentModalBody');
    
    modalBody.innerHTML = conversations.length ? 
      conversations.map(msg => `
        <div class="mb-4 ${msg.sender === 'user' ? 'text-right' : 'text-left'}">
          <div class="inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
            msg.sender === 'user' 
              ? 'bg-quantum-500 text-white' 
              : 'bg-dark-800 border border-quantum-400/20'
          }">
            <p class="text-sm">${msg.text}</p>
            <p class="text-xs opacity-70 mt-1">${new Date(msg.timestamp).toLocaleTimeString()}</p>
          </div>
        </div>
      `).join('') :
      '<p class="text-gray-400 text-center">Nenhuma conversa ainda. Inicie uma conversa!</p>';
  }

  sendAgentMessage(message, agentId = null) {
    const targetAgent = agentId || this.currentAgent?.id;
    if (!targetAgent || !message.trim()) return;

    const timestamp = new Date().toISOString();
    
    // Store user message
    this.storeMessage(targetAgent, { sender: 'user', text: message, timestamp });
    
    // Simulate agent response
    setTimeout(() => {
      const responses = [
        'Entendi sua solicitação. Vou analisar os dados disponíveis.',
        'Baseado nos dados atuais, posso sugerir algumas ações.',
        'Vou processar essa informação e retornar com insights relevantes.',
        'Analisando... Encontrei algumas oportunidades interessantes.',
        'Dados processados. Aqui estão as recomendações principais.'
      ];
      const response = responses[Math.floor(Math.random() * responses.length)];
      this.storeMessage(targetAgent, { sender: 'agent', text: response, timestamp: new Date().toISOString() });
      
      if (this.currentAgent?.id === targetAgent) {
        this.loadAgentConversation(targetAgent);
      }
    }, 1000 + Math.random() * 2000);

    if (this.currentAgent?.id === targetAgent) {
      this.loadAgentConversation(targetAgent);
    }
  }

  storeMessage(agentId, message) {
    const conversations = this.getStoredConversations(agentId);
    conversations.push(message);
    localStorage.setItem(`sq_conversations_${agentId}`, JSON.stringify(conversations));
  }

  getStoredConversations(agentId) {
    try {
      return JSON.parse(localStorage.getItem(`sq_conversations_${agentId}`)) || [];
    } catch {
      return [];
    }
  }

  loadStoredTheme() {
    const theme = localStorage.getItem('sq_theme') || 'neo';
    this.applyTheme(theme);
  }

  // AI Agents Chat Functions
  openAgentChat(agentId) {
    const agent = this.agents.find(a => a.id === agentId);
    if (!agent) return;

    this.currentAgent = agent;
    
    // Update modal content
    document.getElementById('agentChatAvatar').textContent = agent.shortName;
    document.getElementById('agentChatAvatar').className = `w-8 h-8 rounded-full bg-gradient-to-br ${agent.color} flex items-center justify-center text-white font-semibold text-sm`;
    document.getElementById('agentChatTitle').textContent = `Agente ${agent.name}`;
    
    // Load conversation history
    this.loadAgentConversation(agentId);
    
    // Show modal
    document.getElementById('agentChatModal').classList.remove('hidden');
    document.getElementById('agentChatModal').classList.add('flex');
  }

  closeAgentChat() {
    document.getElementById('agentChatModal').classList.add('hidden');
    document.getElementById('agentChatModal').classList.remove('flex');
    this.currentAgent = null;
  }

  loadAgentConversation(agentId) {
    const conversations = this.getStoredConversations(`agent_${agentId}`);
    const messagesContainer = document.getElementById('agentChatMessages');
    
    if (conversations.length === 0) {
      messagesContainer.innerHTML = `
        <div class="text-center py-8">
          <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-quantum-400 to-quantum-600 flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
          </div>
          <p class="text-sm text-gray-400">Olá! Sou seu assistente especializado. Como posso ajudar?</p>
        </div>
      `;
    } else {
      messagesContainer.innerHTML = conversations.map(msg => this.formatAgentMessage(msg)).join('');
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  formatAgentMessage(message) {
    const isUser = message.sender === 'user';
    const time = new Date(message.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    return `
      <div class="mb-4 ${isUser ? 'text-right' : 'text-left'}">
        <div class="inline-block max-w-xs px-4 py-2 rounded-2xl ${
          isUser 
            ? 'bg-quantum-500 text-white rounded-br-md' 
            : 'bg-dark-800/50 border border-quantum-400/20 rounded-bl-md'
        }">
          <p class="text-sm">${message.text}</p>
          <p class="text-xs opacity-70 mt-1">${time}</p>
        </div>
      </div>
    `;
  }

  sendAgentMessage(message) {
    if (!this.currentAgent || !message.trim()) return;

    const agentId = this.currentAgent.id;
    const timestamp = new Date().toISOString();
    
    // Store user message
    this.storeMessage(`agent_${agentId}`, { sender: 'user', text: message, timestamp });
    
    // Update UI
    this.loadAgentConversation(agentId);
    
    // Simulate agent response
    setTimeout(() => {
      const responses = [
        'Analisando seus dados... Um momento.',
        'Baseado nas informações disponíveis, posso sugerir algumas ações.',
        'Processando sua solicitação. Vou retornar com insights relevantes.',
        'Dados analisados. Aqui estão as principais recomendações.',
        'Entendi sua consulta. Vou buscar as informações mais atualizadas.'
      ];
      const response = responses[Math.floor(Math.random() * responses.length)];
      this.storeMessage(`agent_${agentId}`, { sender: 'agent', text: response, timestamp: new Date().toISOString() });
      this.loadAgentConversation(agentId);
    }, 1000 + Math.random() * 2000);
  }

  // Team Chat Functions
  openTeamChat(memberId) {
    const persona = this.teamData.personas[memberId];
    if (!persona) return;

    this.currentTeamChat = memberId;
    
    // Update chat header
    document.getElementById('activeChatAvatar').textContent = persona.avatar;
    document.getElementById('activeChatName').textContent = persona.name;
    
    // Load conversation
    this.loadTeamConversation();
    
    // Show chat area
    document.getElementById('teamChatArea').style.display = 'flex';
  }

  closeTeamChat() {
    document.getElementById('teamChatArea').style.display = 'none';
    this.currentTeamChat = null;
  }

  loadTeamConversation() {
    const messagesContainer = document.getElementById('teamMessages');
    const conversations = this.teamData.conversations.filter(msg => 
      msg.sender === this.currentTeamChat || msg.sender === 'hustle'
    );
    
    messagesContainer.innerHTML = conversations.map(msg => this.formatTeamMessage(msg)).join('');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  formatTeamMessage(message) {
    const isUser = message.sender === 'hustle';
    const persona = this.teamData.personas[message.sender];
    const time = new Date(message.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    return `
      <div class="mb-3 ${isUser ? 'text-right' : 'text-left'}">
        ${!isUser ? `<div class="text-xs text-gray-400 mb-1">${persona?.name}</div>` : ''}
        <div class="inline-block max-w-xs px-3 py-2 rounded-lg ${
          isUser 
            ? 'bg-quantum-500 text-white' 
            : 'bg-dark-800/50 border border-quantum-400/20'
        }">
          <p class="text-sm">${message.message}</p>
          <p class="text-xs opacity-70 mt-1">${time}</p>
        </div>
      </div>
    `;
  }

  sendTeamMessage(message) {
    if (!this.currentTeamChat || !message.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      sender: 'hustle',
      message: message,
      timestamp: new Date(),
      read: true
    };
    
    this.teamData.conversations.push(userMessage);
    this.loadTeamConversation();
    
    // Auto-response from team member
    setTimeout(() => {
      const responses = this.teamData.autoResponses[this.currentTeamChat];
      if (responses) {
        const response = responses[Math.floor(Math.random() * responses.length)];
        const autoMessage = {
          id: Date.now() + 1,
          sender: this.currentTeamChat,
          message: response,
          timestamp: new Date(),
          read: false
        };
        
        this.teamData.conversations.push(autoMessage);
        this.loadTeamConversation();
      }
    }, 1000 + Math.random() * 2000);
  }

  // Agents Bar Functions
  initializeDraggableAgentsBar() {
    const toolbar = document.getElementById('agentsToolbar');
    const container = document.getElementById('floatingAgentsBar');
    let isDragging = false;
    let startX, startY, startLeft, startTop;

    toolbar.addEventListener('mousedown', (e) => {
      if (e.target.closest('.agent-btn') || e.target.closest('#toggleAgentsBar')) return;
      
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      
      const rect = container.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
      
      toolbar.style.cursor = 'grabbing';
      toolbar.classList.add('scale-105', 'shadow-2xl');
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      const newLeft = startLeft + deltaX;
      const newTop = startTop + deltaY;
      
      // Keep within viewport bounds - adjusted for horizontal toolbar
      const toolbarWidth = toolbar.offsetWidth;
      const toolbarHeight = toolbar.offsetHeight;
      const maxLeft = window.innerWidth - toolbarWidth - 20;
      const maxTop = window.innerHeight - toolbarHeight - 20;
      const minLeft = 20;
      const minTop = 20;
      
      // Constrain movement
      const constrainedLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));
      const constrainedTop = Math.max(minTop, Math.min(newTop, maxTop));
      
      container.style.left = constrainedLeft + 'px';
      container.style.bottom = 'auto';
      container.style.top = constrainedTop + 'px';
      container.style.transform = 'none';
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        toolbar.style.cursor = 'move';
        toolbar.classList.remove('scale-105', 'shadow-2xl');
      }
    });

    // Add touch support for mobile
    toolbar.addEventListener('touchstart', (e) => {
      if (e.target.closest('.agent-btn') || e.target.closest('#toggleAgentsBar')) return;
      
      const touch = e.touches[0];
      isDragging = true;
      startX = touch.clientX;
      startY = touch.clientY;
      
      const rect = container.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
      
      e.preventDefault();
    });

    document.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      
      const newLeft = startLeft + deltaX;
      const newTop = startTop + deltaY;
      
      // Keep within viewport bounds
      const toolbarWidth = toolbar.offsetWidth;
      const toolbarHeight = toolbar.offsetHeight;
      const maxLeft = window.innerWidth - toolbarWidth - 20;
      const maxTop = window.innerHeight - toolbarHeight - 20;
      
      container.style.left = Math.max(20, Math.min(newLeft, maxLeft)) + 'px';
      container.style.bottom = 'auto';
      container.style.top = Math.max(20, Math.min(newTop, maxTop)) + 'px';
      container.style.transform = 'none';
      
      e.preventDefault();
    });

    document.addEventListener('touchend', () => {
      if (isDragging) {
        isDragging = false;
      }
    });
  }

  toggleAgentsBar() {
    const agentsList = document.getElementById('aiAgentsList');
    const toggleBtn = document.getElementById('toggleAgentsBar');
    
    this.agentsBarCollapsed = !this.agentsBarCollapsed;
    
    const toolbar = document.getElementById('agentsToolbar');
    
    if (this.agentsBarCollapsed) {
      // Hide agents list for horizontal layout
      agentsList.style.display = 'none';
      toolbar.classList.add('opacity-75', 'scale-95');
      toggleBtn.innerHTML = `
        <svg class="w-4 h-4 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7-7-7 7"></path>
        </svg>
      `;
    } else {
      // Show agents list in horizontal layout
      agentsList.style.display = 'flex';
      toolbar.classList.remove('opacity-75', 'scale-95');
      toggleBtn.innerHTML = `
        <svg class="w-4 h-4 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7 7 7-7"></path>
        </svg>
      `;
    }
  }

  // Sidebar Control Functions
  toggleLeftSidebar() {
    this.leftSidebarHidden = !this.leftSidebarHidden;
    this.updateLayoutClasses();
    
    const leftSidebar = document.getElementById('leftSidebar');
    const showBtn = document.getElementById('showLeftSidebar');
    
    if (this.leftSidebarHidden) {
      leftSidebar.style.display = 'none';
      showBtn.classList.remove('hidden');
    } else {
      leftSidebar.style.display = 'block';
      showBtn.classList.add('hidden');
    }
    
    // Store preference
    localStorage.setItem('sq_left_sidebar_hidden', this.leftSidebarHidden);
  }

  toggleRightSidebar() {
    this.rightSidebarHidden = !this.rightSidebarHidden;
    this.updateLayoutClasses();
    
    const rightSidebar = document.getElementById('rightSidebar');
    const showBtn = document.getElementById('showRightSidebar');
    
    if (this.rightSidebarHidden) {
      rightSidebar.style.display = 'none';
      showBtn.classList.remove('hidden');
    } else {
      rightSidebar.style.display = 'block';
      showBtn.classList.add('hidden');
    }
    
    // Store preference
    localStorage.setItem('sq_right_sidebar_hidden', this.rightSidebarHidden);
  }

  showLeftSidebar() {
    this.leftSidebarHidden = false;
    this.updateLayoutClasses();
    
    document.getElementById('leftSidebar').style.display = 'block';
    document.getElementById('showLeftSidebar').classList.add('hidden');
    
    localStorage.setItem('sq_left_sidebar_hidden', false);
  }

  showRightSidebar() {
    this.rightSidebarHidden = false;
    this.updateLayoutClasses();
    
    document.getElementById('rightSidebar').style.display = 'block';
    document.getElementById('showRightSidebar').classList.add('hidden');
    
    localStorage.setItem('sq_right_sidebar_hidden', false);
  }

  updateLayoutClasses() {
    const mainLayout = document.getElementById('mainLayout');
    
    // Remove all layout classes
    mainLayout.classList.remove('sidebar-hidden-left', 'sidebar-hidden-right', 'sidebar-hidden-both');
    
    // Apply appropriate class based on sidebar states
    if (this.leftSidebarHidden && this.rightSidebarHidden) {
      mainLayout.classList.add('sidebar-hidden-both');
    } else if (this.leftSidebarHidden) {
      mainLayout.classList.add('sidebar-hidden-left');
    } else if (this.rightSidebarHidden) {
      mainLayout.classList.add('sidebar-hidden-right');
    }
  }

  loadSidebarPreferences() {
    // Load stored preferences
    const leftHidden = localStorage.getItem('sq_left_sidebar_hidden') === 'true';
    const rightHidden = localStorage.getItem('sq_right_sidebar_hidden') === 'true';
    
    if (leftHidden) {
      this.leftSidebarHidden = true;
      document.getElementById('leftSidebar').style.display = 'none';
      document.getElementById('showLeftSidebar').classList.remove('hidden');
    }
    
    if (rightHidden) {
      this.rightSidebarHidden = true;
      document.getElementById('rightSidebar').style.display = 'none';
      document.getElementById('showRightSidebar').classList.remove('hidden');
    }
    
    this.updateLayoutClasses();
  }

  applyTheme(theme) {
    // Theme switching logic (simplified for now)
    localStorage.setItem('sq_theme', theme);
    
    // Update active theme indicator
    document.querySelectorAll('[data-theme]').forEach(btn => {
      btn.classList.remove('ring-2', 'ring-white');
    });
    document.querySelector(`[data-theme="${theme}"]`)?.classList.add('ring-2', 'ring-white');
  }

  bindEvents() {
    // Navigation events
    document.getElementById('workspaceNav').addEventListener('click', (e) => {
      const workspaceItem = e.target.closest('.workspace-item');
      if (workspaceItem) {
        this.loadWorkspace(workspaceItem.dataset.workspace);
      }
    });

    // Module events
    document.getElementById('contentBody').addEventListener('click', (e) => {
      const moduleCard = e.target.closest('.module-card');
      if (moduleCard) {
        this.loadModule(moduleCard.dataset.workspace, moduleCard.dataset.module);
      }
    });

    // Floating Agents events
    document.getElementById('aiAgentsList').addEventListener('click', (e) => {
      const agentBtn = e.target.closest('.agent-btn');
      if (agentBtn) {
        this.openAgentChat(agentBtn.dataset.agent);
      }
    });

    // Agent Chat Modal events
    document.getElementById('closeAgentChat').addEventListener('click', () => {
      this.closeAgentChat();
    });

    document.getElementById('sendAgentMessage').addEventListener('click', () => {
      const input = document.getElementById('agentChatInput');
      this.sendAgentMessage(input.value);
      input.value = '';
    });

    document.getElementById('agentChatInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('sendAgentMessage').click();
      }
    });

    // Team Chat events
    document.getElementById('teamMembersList').addEventListener('click', (e) => {
      const memberItem = e.target.closest('.team-member');
      if (memberItem) {
        this.openTeamChat(memberItem.dataset.member);
      }
    });

    document.getElementById('closeChatBtn').addEventListener('click', () => {
      this.closeTeamChat();
    });

    document.getElementById('sendTeamMessage').addEventListener('click', () => {
      const input = document.getElementById('teamMessageInput');
      this.sendTeamMessage(input.value);
      input.value = '';
    });

    document.getElementById('teamMessageInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('sendTeamMessage').click();
      }
    });

    // Agents Bar Toggle
    document.getElementById('toggleAgentsBar').addEventListener('click', () => {
      this.toggleAgentsBar();
    });

    // Sidebar Toggle Events
    document.getElementById('toggleLeftSidebar').addEventListener('click', () => {
      this.toggleLeftSidebar();
    });

    document.getElementById('toggleRightSidebar').addEventListener('click', () => {
      this.toggleRightSidebar();
    });

    document.getElementById('showLeftSidebar').addEventListener('click', () => {
      this.showLeftSidebar();
    });

    document.getElementById('showRightSidebar').addEventListener('click', () => {
      this.showRightSidebar();
    });

    // Theme events
    document.getElementById('themeSelector').addEventListener('click', (e) => {
      const themeBtn = e.target.closest('[data-theme]');
      if (themeBtn) {
        this.applyTheme(themeBtn.dataset.theme);
      }
    });

    // Close modals on backdrop click
    document.getElementById('agentChatModal').addEventListener('click', (e) => {
      if (e.target.id === 'agentChatModal') {
        this.closeAgentChat();
      }
    });
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new StratoQuantumApp();
});