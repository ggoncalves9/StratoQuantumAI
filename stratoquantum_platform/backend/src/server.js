// Strato Quantum Platform - Backend Server v2.5.0
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

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
const PORT = process.env.PORT || 3000;

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
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://stratoquantum.com', 'https://app.stratoquantum.com']
    : ['http://localhost:3000', 'http://localhost:8080', 'http://127.0.0.1:5500'],
  credentials: true
}));

// Rate limiting
app.use(rateLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files (serve frontend in production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend')));
}

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbHealth = await database.healthCheck();
  const dbInfo = database.getConnectionInfo();
  
  res.json({
    status: dbHealth ? 'OK' : 'DEGRADED',
    version: '2.6.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      connected: dbHealth,
      ...dbInfo
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
    name: 'Strato Quantum Platform API',
    version: '2.5.0',
    description: 'Backend API for Strato Quantum Platform',
    endpoints: {
      auth: '/api/auth',
      workspaces: '/api/workspaces',
      agents: '/api/agents',
      analytics: '/api/analytics'
    },
    documentation: '/api/docs',
    health: '/health'
  });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
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
    // Connect to database
    await database.connect();
    
    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Strato Quantum Backend v2.6.0 running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🗄️  Database: PostgreSQL connected`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
      logger.info(`📚 API docs: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;