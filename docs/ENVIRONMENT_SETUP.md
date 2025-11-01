# StratoQuantum - Environment Variables Setup

## 📋 Overview

This guide explains how to configure environment variables for the StratoQuantum project. The project uses a comprehensive environment variable system to manage configuration across all components.

## 🚀 Quick Setup

### Automated Setup (Recommended)

**Windows:**
```bash
scripts\setup-env.bat
```

**Linux/macOS:**
```bash
chmod +x scripts/setup-env.sh
./scripts/setup-env.sh
```

### Manual Setup

1. Copy template files:
```bash
cp .env.example .env
cp stratoquantum_platform/.env.example stratoquantum_platform/.env
cp stratoquantum_agents/.env.example stratoquantum_agents/.env
```

2. Edit each `.env` file with your specific values

## 📁 Environment Files Structure

```
StratoQuantumAI/
├── .env                                    # Root configuration
├── .env.example                           # Root template
├── stratoquantum_platform/
│   ├── .env                              # Platform backend config
│   └── .env.example                      # Platform template
└── stratoquantum_agents/
    ├── .env                              # AI agents config
    └── .env.example                      # Agents template
```

## 🔧 Configuration Categories

### 1. Application Settings
```env
NODE_ENV=development
APP_NAME=StratoQuantum
APP_VERSION=2.6.8
DEBUG=true
```

### 2. Server Configuration
```env
# Platform Backend
PLATFORM_HOST=localhost
PLATFORM_PORT=3000
PLATFORM_URL=http://localhost:3000

# AI Agents Backend
AGENTS_HOST=localhost
AGENTS_PORT=8000
AGENTS_URL=http://localhost:8000
```

### 3. Database Configuration
```env
# PostgreSQL (Primary)
DATABASE_URL=postgresql://user:password@localhost:5432/stratoquantum
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=stratoquantum
DATABASE_USER=stratoquantum
DATABASE_PASSWORD=your-secure-password

# Redis (Cache & Sessions)
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

### 4. Security Settings
```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Session Security
SESSION_SECRET=your-session-secret-key
BCRYPT_ROUNDS=12

# API Keys
AGENTS_API_KEY=your-agents-api-key
PLATFORM_API_KEY=your-platform-api-key
```

### 5. AI Models Configuration
```env
# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=4000
OPENAI_TEMPERATURE=0.7

# Anthropic
ANTHROPIC_API_KEY=your-anthropic-api-key
ANTHROPIC_MODEL=claude-3-sonnet-20240229

# Local AI (Optional)
LOCAL_AI_URL=http://localhost:11434
LOCAL_AI_MODEL=deepseek-coder
LOCAL_AI_ENABLED=false

# Model Provider
MODEL_PROVIDER=openai
DEFAULT_MODEL=gpt-4
FALLBACK_MODEL=gpt-3.5-turbo
```

### 6. External Services
```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@stratoquantum.com

# AWS Configuration (Optional)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=stratoquantum-files
```

## 🔒 Security Best Practices

### 1. Secret Generation
- Use strong, randomly generated secrets (minimum 32 characters)
- Different secrets for each environment (dev, staging, prod)
- Never reuse secrets across different applications

### 2. API Keys Management
- Store API keys securely
- Use environment-specific keys
- Rotate keys regularly
- Monitor API usage

### 3. Database Security
- Use strong passwords
- Enable SSL/TLS in production
- Restrict database access by IP
- Regular security updates

### 4. File Security
```bash
# Set proper permissions (Linux/macOS)
chmod 600 .env
chmod 600 stratoquantum_platform/.env
chmod 600 stratoquantum_agents/.env

# Verify .env files are in .gitignore
git check-ignore .env
```

## 🌍 Environment-Specific Configuration

### Development Environment
```env
NODE_ENV=development
DEBUG=true
LOG_LEVEL=debug
CORS_ORIGINS=["http://localhost:3000","http://localhost:8080"]
DATABASE_SSL=false
REDIS_TLS=false
```

### Production Environment
```env
NODE_ENV=production
DEBUG=false
LOG_LEVEL=warn
CORS_ORIGINS=["https://app.stratoquantum.com"]
DATABASE_SSL=true
REDIS_TLS=true
SENTRY_DSN=your-production-sentry-dsn
```

### Testing Environment
```env
NODE_ENV=test
DEBUG=false
DATABASE_NAME=stratoquantum_test
REDIS_DB=2
LOG_LEVEL=error
```

## 🔧 Configuration Validation

The application includes built-in configuration validation:

### Platform Backend (Node.js)
```javascript
// Validates required environment variables on startup
const config = require('./config');
config.validate(); // Throws error if invalid
```

### AI Agents (Python)
```python
# Pydantic-based validation with type checking
from config.settings import settings
# Automatic validation on import
```

## 🚨 Troubleshooting

### Common Issues

1. **Missing Environment Variables**
```bash
Error: Missing required environment variables: JWT_SECRET, DATABASE_URL
```
**Solution:** Ensure all required variables are set in your `.env` file

2. **Invalid JWT Secret Length**
```bash
Error: JWT_SECRET must be at least 32 characters long
```
**Solution:** Generate a longer secret using the setup script

3. **Database Connection Failed**
```bash
Error: PostgreSQL connection failed
```
**Solution:** Check database credentials and ensure PostgreSQL is running

4. **Redis Connection Failed**
```bash
Error: Redis connection failed
```
**Solution:** Verify Redis is running and credentials are correct

### Validation Commands

```bash
# Check environment variables
npm run config:validate

# Test database connection
npm run db:test

# Test Redis connection
npm run redis:test

# Health check all services
curl http://localhost:3000/health
curl http://localhost:8000/health
```

## 📚 Additional Resources

- [Node.js Environment Variables Best Practices](https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs)
- [Pydantic Settings Documentation](https://pydantic-docs.helpmanual.io/usage/settings/)
- [Docker Environment Variables](https://docs.docker.com/compose/environment-variables/)
- [Kubernetes ConfigMaps and Secrets](https://kubernetes.io/docs/concepts/configuration/)

## 🔄 Migration Guide

If you're upgrading from a previous version:

1. **Backup existing configuration:**
```bash
cp .env .env.backup
cp stratoquantum_platform/.env stratoquantum_platform/.env.backup
```

2. **Run the setup script:**
```bash
./scripts/setup-env.sh
```

3. **Merge your custom values:**
- Compare `.env.backup` with new `.env`
- Update API keys and custom settings
- Test the configuration

4. **Validate the new setup:**
```bash
npm run config:validate
npm run health:check
```

## 📞 Support

If you encounter issues with environment configuration:

1. Check this documentation
2. Verify all required variables are set
3. Run validation commands
4. Check application logs
5. Create an issue with configuration details (without sensitive data)