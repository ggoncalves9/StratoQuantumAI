// Strato Quantum Platform - Backend Server v2.6.8
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Import configuration
const config = require('./config');

const logger = require('./utils/logger');
const database = require('./utils/database');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const rateLimiter = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth');
const workspaceRoutes = require('./routes/workspaces');
const agentRoutes = require('./routes/agents');
const analyticsRoutes = require('./routes/analytics');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.tailwindcss.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "https://cdn.tailwindcss.com"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: config.getCorsOrigins(),
  methods: config.cors.methods,
  credentials: config.cors.credentials
}));

// Rate limiting
app.use(rateLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files (serve frontend in production)
if (config.isProduction()) {
  app.use(express.static(path.join(__dirname, '../../frontend')));
}

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbHealth = await database.healthCheck();
  const dbInfo = database.getConnectionInfo();
  
  res.json({
    status: dbHealth ? 'OK' : 'DEGRADED',
    name: config.app.name,
    version: config.app.version,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.app.env,
    database: {
      connected: dbHealth,
      ...dbInfo
    },
    agents: {
      url: config.agents.apiUrl,
      connected: false // TODO: Add agents health check
    }
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/analytics', analyticsRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: config.app.name + ' API',
    version: config.app.version,
    description: 'Backend API for StratoQuantum Platform',
    environment: config.app.env,
    endpoints: {
      auth: '/api/auth',
      workspaces: '/api/workspaces',
      agents: '/api/agents',
      analytics: '/api/analytics'
    },
    documentation: '/api/docs',
    health: '/health',
    websocket: config.websocket.enabled ? `ws://localhost:${config.websocket.port}` : null
  });
});

// Serve frontend in production
if (config.isProduction()) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/index.html'));
  });
}

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Initialize database and start server
async function startServer() {
  try {
    // Validate configuration
    config.validate();
    
    // Connect to database
    await database.connect();
    
    // Start server
    app.listen(config.app.port, config.app.host, () => {
      logger.info(`🚀 ${config.app.name} v${config.app.version} running on ${config.app.url}`);
      logger.info(`📊 Environment: ${config.app.env}`);
      logger.info(`🗄️  Database: PostgreSQL connected`);
      logger.info(`🔗 Health check: ${config.app.url}/health`);
      logger.info(`📚 API docs: ${config.app.url}/api`);
      
      if (config.websocket.enabled) {
        logger.info(`🔌 WebSocket: ws://localhost:${config.websocket.port}`);
      }
      
      if (config.agents.apiUrl) {
        logger.info(`🤖 AI Agents: ${config.agents.apiUrl}`);
      }
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;