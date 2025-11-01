// Analytics routes for Strato Quantum Platform
const express = require('express');
const { query, param, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// GET /api/analytics/dashboard - Get dashboard analytics
router.get('/dashboard', auth, async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    // Mock dashboard data
    const dashboardData = {
      overview: {
        totalWorkspaces: 7,
        activeUsers: 45,
        totalAgents: 7,
        systemHealth: 98.5
      },
      metrics: {
        userActivity: generateActivityData(period),
        agentUsage: generateAgentUsageData(),
        workspaceMetrics: generateWorkspaceMetrics(),
        systemPerformance: generatePerformanceData()
      },
      alerts: [
        {
          id: 'alert_1',
          type: 'warning',
          message: 'Alto uso de CPU no servidor de produção',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          resolved: false
        },
        {
          id: 'alert_2',
          type: 'info',
          message: 'Backup automático concluído com sucesso',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          resolved: true
        }
      ],
      period,
      generatedAt: new Date().toISOString()
    };

    logger.info(`Dashboard analytics retrieved for user ${req.user.id}`);

    res.json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error retrieving dashboard analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao recuperar analytics do dashboard',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/analytics/workspace/:workspaceId - Get workspace-specific analytics
router.get('/workspace/:workspaceId', auth, [
  param('workspaceId').notEmpty().withMessage('Workspace ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { workspaceId } = req.params;
    const { period = '30d' } = req.query;

    // Mock workspace analytics
    const workspaceAnalytics = {
      workspace: {
        id: workspaceId,
        name: getWorkspaceName(workspaceId),
        activeUsers: Math.floor(Math.random() * 20) + 5,
        totalModules: 5,
        lastActivity: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
      },
      usage: {
        dailyActiveUsers: generateDailyUsage(period),
        moduleUsage: generateModuleUsage(workspaceId),
        peakHours: generatePeakHours(),
        userEngagement: {
          averageSessionTime: Math.floor(Math.random() * 60) + 15, // 15-75 minutes
          actionsPerSession: Math.floor(Math.random() * 50) + 10,
          returnRate: Math.floor(Math.random() * 30) + 70 // 70-100%
        }
      },
      performance: {
        responseTime: Math.floor(Math.random() * 200) + 100, // 100-300ms
        errorRate: Math.random() * 2, // 0-2%
        uptime: 99.5 + Math.random() * 0.5 // 99.5-100%
      },
      period,
      generatedAt: new Date().toISOString()
    };

    logger.info(`Workspace analytics retrieved for ${workspaceId} by user ${req.user.id}`);

    res.json({
      success: true,
      data: workspaceAnalytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error retrieving workspace analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao recuperar analytics do workspace',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/analytics/agents - Get agents analytics
router.get('/agents', auth, async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    const agentsAnalytics = {
      summary: {
        totalAgents: 7,
        activeAgents: 7,
        totalConversations: Math.floor(Math.random() * 1000) + 500,
        averageResponseTime: Math.floor(Math.random() * 3000) + 1000 // 1-4 seconds
      },
      agentMetrics: [
        {
          id: 'financeiro-ai',
          name: 'Agente Financeiro',
          conversations: Math.floor(Math.random() * 200) + 50,
          averageRating: 4.2 + Math.random() * 0.8,
          responseTime: Math.floor(Math.random() * 2000) + 1000,
          topQueries: ['fluxo de caixa', 'análise de custos', 'projeções financeiras']
        },
        {
          id: 'rh-ai',
          name: 'Agente RH',
          conversations: Math.floor(Math.random() * 150) + 30,
          averageRating: 4.1 + Math.random() * 0.9,
          responseTime: Math.floor(Math.random() * 2000) + 1000,
          topQueries: ['recrutamento', 'avaliação de performance', 'clima organizacional']
        },
        {
          id: 'tecnologia-ai',
          name: 'Agente Tecnologia',
          conversations: Math.floor(Math.random() * 180) + 40,
          averageRating: 4.3 + Math.random() * 0.7,
          responseTime: Math.floor(Math.random() * 2000) + 1000,
          topQueries: ['arquitetura', 'performance', 'segurança']
        }
      ],
      usage: generateAgentUsageData(),
      period,
      generatedAt: new Date().toISOString()
    };

    logger.info(`Agents analytics retrieved for user ${req.user.id}`);

    res.json({
      success: true,
      data: agentsAnalytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error retrieving agents analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao recuperar analytics dos agentes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper functions
function generateActivityData(period) {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const data = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      users: Math.floor(Math.random() * 30) + 10,
      sessions: Math.floor(Math.random() * 50) + 20,
      actions: Math.floor(Math.random() * 200) + 100
    });
  }
  
  return data;
}

function generateAgentUsageData() {
  const agents = ['financeiro-ai', 'rh-ai', 'tecnologia-ai', 'operacoes-ai', 'comercial-ai', 'produto-ai', 'marketing-ai'];
  
  return agents.map(agentId => ({
    agentId,
    name: getAgentName(agentId),
    usage: Math.floor(Math.random() * 100) + 50,
    conversations: Math.floor(Math.random() * 200) + 30,
    satisfaction: 4.0 + Math.random() * 1.0
  }));
}

function generateWorkspaceMetrics() {
  const workspaces = ['marketing', 'comercial', 'produto', 'operacoes', 'tecnologia', 'rh', 'financeiro'];
  
  return workspaces.map(workspaceId => ({
    workspaceId,
    name: getWorkspaceName(workspaceId),
    activeUsers: Math.floor(Math.random() * 15) + 5,
    totalSessions: Math.floor(Math.random() * 100) + 50,
    averageSessionTime: Math.floor(Math.random() * 45) + 15
  }));
}

function generatePerformanceData() {
  return {
    cpu: Math.floor(Math.random() * 30) + 20, // 20-50%
    memory: Math.floor(Math.random() * 40) + 30, // 30-70%
    disk: Math.floor(Math.random() * 20) + 10, // 10-30%
    network: Math.floor(Math.random() * 50) + 25 // 25-75 Mbps
  };
}

function generateDailyUsage(period) {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const data = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      users: Math.floor(Math.random() * 10) + 2
    });
  }
  
  return data;
}

function generateModuleUsage(workspaceId) {
  const modules = getWorkspaceModules(workspaceId);
  
  return modules.map(module => ({
    module,
    usage: Math.floor(Math.random() * 100) + 20,
    users: Math.floor(Math.random() * 8) + 2
  }));
}

function generatePeakHours() {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    hours.push({
      hour: i,
      usage: Math.floor(Math.random() * 50) + (i >= 9 && i <= 17 ? 30 : 5) // Higher during business hours
    });
  }
  return hours;
}

function getWorkspaceName(workspaceId) {
  const names = {
    marketing: 'Marketing',
    comercial: 'Comercial',
    produto: 'Produto',
    operacoes: 'Operações',
    tecnologia: 'Tecnologia',
    rh: 'Recursos Humanos',
    financeiro: 'Financeiro'
  };
  return names[workspaceId] || workspaceId;
}

function getAgentName(agentId) {
  const names = {
    'financeiro-ai': 'Agente Financeiro',
    'rh-ai': 'Agente RH',
    'tecnologia-ai': 'Agente Tecnologia',
    'operacoes-ai': 'Agente Operações',
    'comercial-ai': 'Agente Comercial',
    'produto-ai': 'Agente Produto',
    'marketing-ai': 'Agente Marketing'
  };
  return names[agentId] || agentId;
}

function getWorkspaceModules(workspaceId) {
  const modules = {
    marketing: ['campanhas', 'seo-conteudo', 'midia-paga', 'calendario', 'relatorios'],
    comercial: ['leads', 'oportunidades', 'propostas', 'funil', 'relatorios'],
    produto: ['roadmap', 'backlog', 'feedbacks', 'analytics', 'lancamentos'],
    operacoes: ['sla-incidentes', 'runbooks', 'projetos', 'inventario', 'relatorios'],
    tecnologia: ['arquitetura', 'ci-cd', 'observabilidade', 'pesquisa', 'seguranca'],
    rh: ['vagas', 'onboarding', 'politicas', 'treinamentos', 'avaliacoes'],
    financeiro: ['contas', 'faturamento', 'forecast', 'custos', 'relatorios']
  };
  return modules[workspaceId] || [];
}

module.exports = router;