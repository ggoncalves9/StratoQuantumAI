// ============================================
// StratoQuantum Platform - Configuration Manager
// ============================================
require('dotenv').config();

const config = {
  // Application Settings
  app: {
    name: process.env.APP_NAME || 'StratoQuantum Platform',
    version: process.env.APP_VERSION || '2.6.8',
    env: process.env.NODE_ENV || 'development',
    host: process.env.HOST || 'localhost',
    port: parseInt(process.env.PORT) || 3000,
    url: process.env.PLATFORM_URL || `http://localhost:${process.env.PORT || 3000}`
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || 'postgresql://stratoquantum:stratoquantum2025@localhost:5432/stratoquantum',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT) || 5432,
    name: process.env.DATABASE_NAME || 'stratoquantum',
    user: process.env.DATABASE_USER || 'stratoquantum',
    password: process.env.DATABASE_PASSWORD || 'stratoquantum2025',
    poolSize: parseInt(process.env.DATABASE_POOL_SIZE) || 20,
    ssl: process.env.DATABASE_SSL === 'true' || process.env.NODE_ENV === 'production'
  },

  // Redis Configuration
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || 'stratoquantum2025',
    db: parseInt(process.env.REDIS_DB) || 0
  },

  // Security Configuration
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    sessionSecret: process.env.SESSION_SECRET || 'your-session-secret-key',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12
  },

  // CORS Configuration
  cors: {
    origins: process.env.ALLOWED_ORIGINS 
      ? JSON.parse(process.env.ALLOWED_ORIGINS)
      : ['http://localhost:3000', 'http://localhost:8080', 'http://127.0.0.1:5500'],
    methods: process.env.ALLOWED_METHODS
      ? JSON.parse(process.env.ALLOWED_METHODS)
      : ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true
  },

  // Rate Limiting
  rateLimit: {
    requests: parseInt(process.env.RATE_LIMIT_REQUESTS) || 100,
    window: parseInt(process.env.RATE_LIMIT_WINDOW) || 60,
    skipSuccessful: process.env.RATE_LIMIT_SKIP_SUCCESSFUL === 'true'
  },

  // AI Agents Integration
  agents: {
    apiUrl: process.env.AGENTS_API_URL || 'http://localhost:8000',
    apiKey: process.env.AGENTS_API_KEY || 'your-agents-api-key',
    timeout: parseInt(process.env.AGENTS_TIMEOUT) || 30000
  },

  // WebSocket Configuration
  websocket: {
    enabled: process.env.WEBSOCKET_ENABLED === 'true',
    port: parseInt(process.env.WEBSOCKET_PORT) || 3001,
    heartbeatInterval: parseInt(process.env.WEBSOCKET_HEARTBEAT_INTERVAL) || 30,
    timeout: parseInt(process.env.WEBSOCKET_TIMEOUT) || 60
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    fileEnabled: process.env.LOG_FILE_ENABLED === 'true',
    filePath: process.env.LOG_FILE_PATH || './logs/platform.log',
    format: process.env.LOG_FORMAT || 'json'
  },

  // File Upload Configuration
  upload: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
    path: process.env.UPLOAD_PATH || './uploads',
    allowedTypes: process.env.ALLOWED_FILE_TYPES
      ? JSON.parse(process.env.ALLOWED_FILE_TYPES)
      : ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx']
  },

  // Email Configuration
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM || 'noreply@stratoquantum.com'
  },

  // Monitoring Configuration
  monitoring: {
    enabled: process.env.ENABLE_METRICS === 'true',
    sentryDsn: process.env.SENTRY_DSN,
    healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30
  },

  // Development Settings
  development: {
    hotReload: process.env.HOT_RELOAD === 'true',
    watchFiles: process.env.WATCH_FILES === 'true',
    apiDocsEnabled: process.env.API_DOCS_ENABLED !== 'false',
    debugger: process.env.ENABLE_DEBUGGER === 'true'
  }
};

// Validation function
function validateConfig() {
  const required = [
    'JWT_SECRET',
    'DATABASE_URL',
    'REDIS_URL'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate JWT secret length
  if (config.security.jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  return true;
}

// Export configuration
module.exports = {
  ...config,
  validate: validateConfig,
  
  // Helper functions
  isDevelopment: () => config.app.env === 'development',
  isProduction: () => config.app.env === 'production',
  isTest: () => config.app.env === 'test',
  
  // Get full database connection string
  getDatabaseUrl: () => config.database.url,
  
  // Get full Redis connection string
  getRedisUrl: () => config.redis.url,
  
  // Get CORS origins for current environment
  getCorsOrigins: () => {
    if (config.app.env === 'production') {
      return ['https://stratoquantum.com', 'https://app.stratoquantum.com'];
    }
    return config.cors.origins;
  }
};