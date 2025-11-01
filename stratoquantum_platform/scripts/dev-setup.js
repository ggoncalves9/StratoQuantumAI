#!/usr/bin/env node

/**
 * Strato Quantum Platform v2.6.0 - Development Setup Script
 * 
 * This script helps developers set up the development environment quickly
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class DevSetup {
  constructor() {
    this.baseDir = path.join(__dirname, '..');
    this.backendDir = path.join(this.baseDir, 'backend');
  }

  async run() {
    console.log('🚀 Setting up Strato Quantum Platform v2.6.0 for development...\n');

    try {
      await this.checkPrerequisites();
      await this.setupEnvironment();
      await this.installDependencies();
      await this.createDevDatabase();
      await this.startServices();
      
      console.log('✅ Development environment setup completed!');
      console.log('\n📋 Next steps:');
      console.log('1. Open http://localhost:3000 in your browser');
      console.log('2. Test the floating AI agents toolbar');
      console.log('3. Try the team chat functionality');
      console.log('4. Explore the new workspaces structure\n');
      
    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      process.exit(1);
    }
  }

  async checkPrerequisites() {
    console.log('🔍 Checking prerequisites...');
    
    try {
      execSync('node --version', { stdio: 'pipe' });
      console.log('  ✓ Node.js is installed');
    } catch {
      throw new Error('Node.js is not installed. Please install Node.js 18+ first.');
    }

    try {
      execSync('npm --version', { stdio: 'pipe' });
      console.log('  ✓ npm is installed');
    } catch {
      throw new Error('npm is not installed. Please install npm first.');
    }

    console.log('✅ Prerequisites check passed\n');
  }

  async setupEnvironment() {
    console.log('⚙️  Setting up environment variables...');
    
    const envPath = path.join(this.backendDir, '.env');
    const envExamplePath = path.join(this.backendDir, '.env.example');
    
    try {
      await fs.access(envPath);
      console.log('  ✓ .env file already exists');
    } catch {
      try {
        const envExample = await fs.readFile(envExamplePath, 'utf8');
        await fs.writeFile(envPath, envExample);
        console.log('  ✓ Created .env from .env.example');
      } catch {
        console.log('  ⚠️  .env.example not found, creating basic .env');
        await this.createBasicEnv(envPath);
      }
    }
    
    console.log('✅ Environment setup completed\n');
  }

  async createBasicEnv(envPath) {
    const basicEnv = `# Strato Quantum Platform - Development Environment
NODE_ENV=development
PORT=3000

# Database (will use in-memory for development)
MONGODB_URI=mongodb://localhost:27017/stratoquantum_dev
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# API Configuration
API_RATE_LIMIT=1000
API_RATE_WINDOW=15
`;
    
    await fs.writeFile(envPath, basicEnv);
  }

  async installDependencies() {
    console.log('📦 Installing dependencies...');
    
    try {
      console.log('  Installing backend dependencies...');
      execSync('npm install', { 
        cwd: this.backendDir, 
        stdio: 'inherit' 
      });
      console.log('  ✓ Backend dependencies installed');
    } catch (error) {
      throw new Error('Failed to install backend dependencies');
    }
    
    console.log('✅ Dependencies installation completed\n');
  }

  async createDevDatabase() {
    console.log('🗄️  Setting up development database...');
    
    // For now, we'll use in-memory storage for development
    // In the future, this will set up MongoDB
    
    console.log('  ✓ Using in-memory storage for development');
    console.log('✅ Database setup completed\n');
  }

  async startServices() {
    console.log('🔄 Starting development services...');
    
    // Create a simple start script
    const startScript = `#!/bin/bash
echo "🚀 Starting Strato Quantum Platform v2.6.0..."
echo "📊 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:3000/api"
echo "💬 AI Agents: Floating toolbar available"
echo "👥 Team Chat: Right sidebar"
echo ""
echo "Press Ctrl+C to stop"
echo ""

cd backend && npm run dev
`;

    const startScriptPath = path.join(this.baseDir, 'start-dev.sh');
    await fs.writeFile(startScriptPath, startScript);
    
    // Make it executable (Unix systems)
    try {
      execSync(`chmod +x "${startScriptPath}"`);
    } catch {
      // Windows doesn't need chmod
    }
    
    console.log('  ✓ Created start-dev.sh script');
    console.log('  ✓ Run ./start-dev.sh to start development server');
    console.log('✅ Services setup completed\n');
  }
}

// Run setup if called directly
if (require.main === module) {
  const setup = new DevSetup();
  setup.run().catch(console.error);
}

module.exports = DevSetup;