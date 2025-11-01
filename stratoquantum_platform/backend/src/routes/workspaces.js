// Workspaces API Routes
const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

// Mock data for development (will be replaced with database)
const mockWorkspaces = [
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Gestão de campanhas, SEO e mídia paga',
    icon: '📈',
    color: 'from-pink-500 to-rose-500',
    modules: [
      { id: 'campanhas', name: 'Campanhas', description: 'Gestão de campanhas de marketing', active: true },
      { id: 'seo-conteudo', name: 'SEO & Conteúdo', description: 'Otimização e criação de conteúdo', active: true },
      { id: 'midia-paga', name: 'Mídia Paga', description: 'Campanhas pagas e ROI', active: true },
      { id: 'calendario', name: 'Calendário', description: 'Planejamento de conteúdo', active: true },
      { id: 'relatorios', name: 'Relatórios', description: 'Analytics e métricas', active: true }
    ],
    stats: {
      totalCampaigns: 24,
      activeLeads: 342,
      monthlyROI: 127000,
      avgCTR: 3.2
    }
  },
  {
    id: 'comercial',
    name: 'Comercial',
    description: 'Gestão de leads, oportunidades e vendas',
    icon: '💼',
    color: 'from-blue-500 to-cyan-500',
    modules: [
      { id: 'leads', name: 'Leads', description: 'Gestão de leads e prospects', active: true },
      { id: 'oportunidades', name: 'Oportunidades', description: 'Pipeline de vendas', active: true },
      { id: 'propostas', name: 'Propostas', description: 'Criação e acompanhamento', active: true },
      { id: 'funil', name: 'Funil', description: 'Análise do funil de vendas', active: true },
      { id: 'relatorios', name: 'Relatórios', description: 'Performance comercial', active: true }
    ],
    stats: {
      totalLeads: 342,
      conversionRate: 23,
      avgTicket: 2300,
      avgTime: 7
    }
  },
  {
    id: 'produto',
    name: 'Produto',
    description: 'Roadmap, backlog e gestão de produto',
    icon: '🚀',
    color: 'from-purple-500 to-indigo-500',
    modules: [
      { id: 'roadmap', name: 'Roadmap', description: 'Planejamento de produto', active: true },
      { id: 'backlog', name: 'Backlog', description: 'Gestão de funcionalidades', active: true },
      { id: 'feedbacks', name: 'Feedbacks', description: 'Feedback dos usuários', active: true },
      { id: 'analytics', name: 'Analytics', description: 'Métricas de uso', active: true },
      { id: 'lancamentos', name: 'Lançamentos', description: 'Gestão de releases', active: true }
    ],
    stats: {
      plannedFeatures: 12,
      inDevelopment: 3,
      storyPoints: 123,
      onTime: 87
    }
  }
];

// Validation middleware
const validateWorkspaceId = [
  param('workspaceId').isAlphanumeric().withMessage('Workspace ID deve ser alfanumérico')
];

const validateModuleId = [
  param('moduleId').isAlphanumeric().withMessage('Module ID deve ser alfanumérico')
];

// GET /api/workspaces - List all workspaces
router.get('/', auth, async (req, res) => {
  try {
    const { search, active } = req.query;
    let workspaces = [...mockWorkspaces];

    // Filter by search term
    if (search) {
      workspaces = workspaces.filter(ws => 
        ws.name.toLowerCase().includes(search.toLowerCase()) ||
        ws.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by active status
    if (active !== undefined) {
      const isActive = active === 'true';
      workspaces = workspaces.filter(ws => ws.active === isActive);
    }

    logger.info(`Retrieved ${workspaces.length} workspaces for user ${req.user.id}`);
    
    res.json({
      success: true,
      data: workspaces,
      total: workspaces.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error retrieving workspaces:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/workspaces/:workspaceId - Get specific workspace
router.get('/:workspaceId', auth, validateWorkspaceId, async (req, res) => {
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
    const workspace = mockWorkspaces.find(ws => ws.id === workspaceId);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace não encontrado'
      });
    }

    logger.info(`Retrieved workspace ${workspaceId} for user ${req.user.id}`);
    
    res.json({
      success: true,
      data: workspace,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error retrieving workspace:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/workspaces/:workspaceId/modules - Get workspace modules
router.get('/:workspaceId/modules', auth, validateWorkspaceId, async (req, res) => {
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
    const workspace = mockWorkspaces.find(ws => ws.id === workspaceId);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace não encontrado'
      });
    }

    res.json({
      success: true,
      data: workspace.modules,
      workspace: {
        id: workspace.id,
        name: workspace.name
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error retrieving workspace modules:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/workspaces/:workspaceId/modules/:moduleId - Get specific module content
router.get('/:workspaceId/modules/:moduleId', auth, [...validateWorkspaceId, ...validateModuleId], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { workspaceId, moduleId } = req.params;
    const workspace = mockWorkspaces.find(ws => ws.id === workspaceId);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace não encontrado'
      });
    }

    const module = workspace.modules.find(mod => mod.id === moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Módulo não encontrado'
      });
    }

    // In a real implementation, this would fetch module-specific data
    const moduleData = {
      ...module,
      workspace: {
        id: workspace.id,
        name: workspace.name,
        color: workspace.color
      },
      data: generateMockModuleData(workspaceId, moduleId),
      lastUpdated: new Date().toISOString()
    };

    logger.info(`Retrieved module ${moduleId} from workspace ${workspaceId} for user ${req.user.id}`);
    
    res.json({
      success: true,
      data: moduleData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error retrieving module:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/workspaces/:workspaceId/modules/:moduleId/actions - Execute module actions
router.post('/:workspaceId/modules/:moduleId/actions', 
  auth, 
  [...validateWorkspaceId, ...validateModuleId],
  [
    body('action').notEmpty().withMessage('Ação é obrigatória'),
    body('data').optional().isObject().withMessage('Dados devem ser um objeto')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const { workspaceId, moduleId } = req.params;
      const { action, data } = req.body;

      // Mock action processing
      const result = await processModuleAction(workspaceId, moduleId, action, data, req.user);

      logger.info(`Executed action ${action} on module ${moduleId} in workspace ${workspaceId} for user ${req.user.id}`);
      
      res.json({
        success: true,
        message: `Ação ${action} executada com sucesso`,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error executing module action:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao executar ação',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// Helper functions
function generateMockModuleData(workspaceId, moduleId) {
  // Generate mock data based on workspace and module
  const baseData = {
    items: Array.from({ length: 5 }, (_, i) => ({
      id: `${moduleId}_${i + 1}`,
      title: `${moduleId.charAt(0).toUpperCase() + moduleId.slice(1)} Item ${i + 1}`,
      description: `Descrição do item ${i + 1} do módulo ${moduleId}`,
      status: ['active', 'pending', 'completed'][Math.floor(Math.random() * 3)],
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    })),
    stats: {
      total: 127,
      active: 89,
      pending: 23,
      completed: 15
    }
  };

  return baseData;
}

async function processModuleAction(workspaceId, moduleId, action, data, user) {
  // Mock action processing
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate processing time
  
  return {
    action,
    workspaceId,
    moduleId,
    userId: user.id,
    result: 'success',
    processedAt: new Date().toISOString(),
    data: data || {}
  };
}

module.exports = router;