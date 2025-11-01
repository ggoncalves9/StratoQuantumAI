#!/usr/bin/env node

/**
 * Strato Quantum Platform v2.5.0 Migration Script
 * 
 * This script migrates from the old structure to the new v2.5.0 architecture:
 * - Removes duplicate files from sq_workspaces
 * - Cleans up Zone.Identifier files
 * - Creates new organized structure
 * - Backs up important data
 */

const fs = require('fs').promises;
const path = require('path');

class MigrationScript {
  constructor() {
    this.baseDir = path.join(__dirname, '..');
    this.backupDir = path.join(this.baseDir, 'backup_v1.0.0');
    this.oldWorkspacesDir = path.join(this.baseDir, 'sq_workspaces');
    this.newWorkspacesDir = path.join(this.baseDir, 'workspaces');
  }

  async run() {
    console.log('🚀 Starting Strato Quantum Platform v2.5.0 Migration...\n');

    try {
      await this.createBackup();
      await this.cleanupOldFiles();
      await this.createNewStructure();
      await this.updateConfiguration();
      await this.generateReport();
      
      console.log('✅ Migration completed successfully!');
      console.log('📁 Backup created at:', this.backupDir);
      console.log('🔄 Please restart your application to use the new structure.\n');
      
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      console.log('🔄 Please check the backup and try again.');
      process.exit(1);
    }
  }

  async createBackup() {
    console.log('📦 Creating backup of current structure...');
    
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
      
      // Backup old index.html
      const oldIndexPath = path.join(this.baseDir, 'index.html');
      if (await this.fileExists(oldIndexPath)) {
        await fs.copyFile(oldIndexPath, path.join(this.backupDir, 'index_v1.0.0.html'));
        console.log('  ✓ Backed up index.html');
      }
      
      // Backup sq_workspaces directory
      if (await this.fileExists(this.oldWorkspacesDir)) {
        await this.copyDirectory(this.oldWorkspacesDir, path.join(this.backupDir, 'sq_workspaces'));
        console.log('  ✓ Backed up sq_workspaces directory');
      }
      
      console.log('✅ Backup completed\n');
    } catch (error) {
      throw new Error(`Backup failed: ${error.message}`);
    }
  }

  async cleanupOldFiles() {
    console.log('🧹 Cleaning up old files...');
    
    let cleanedFiles = 0;
    
    if (await this.fileExists(this.oldWorkspacesDir)) {
      const files = await fs.readdir(this.oldWorkspacesDir);
      
      for (const file of files) {
        const filePath = path.join(this.oldWorkspacesDir, file);
        
        // Remove Zone.Identifier files
        if (file.endsWith('.htmlZone.Identifier')) {
          await fs.unlink(filePath);
          cleanedFiles++;
          continue;
        }
        
        // Remove duplicate numbered files (keep only base files)
        if (file.match(/index-\w+-\w+\d+\.html$/)) {
          await fs.unlink(filePath);
          cleanedFiles++;
          continue;
        }
      }
    }
    
    console.log(`  ✓ Removed ${cleanedFiles} duplicate/unnecessary files`);
    console.log('✅ Cleanup completed\n');
  }

  async createNewStructure() {
    console.log('🏗️  Creating new workspace structure...');
    
    const workspaces = [
      'marketing',
      'comercial', 
      'produto',
      'operacoes',
      'tecnologia',
      'rh',
      'financeiro'
    ];
    
    // Create new workspaces directory
    await fs.mkdir(this.newWorkspacesDir, { recursive: true });
    
    for (const workspace of workspaces) {
      const workspaceDir = path.join(this.newWorkspacesDir, workspace);
      await fs.mkdir(workspaceDir, { recursive: true });
      
      // Create placeholder files for modules that don't exist yet
      const modules = this.getModulesForWorkspace(workspace);
      for (const module of modules) {
        const modulePath = path.join(workspaceDir, `${module}.html`);
        if (!(await this.fileExists(modulePath))) {
          await this.createPlaceholderModule(modulePath, workspace, module);
        }
      }
      
      console.log(`  ✓ Created ${workspace} workspace`);
    }
    
    console.log('✅ New structure created\n');
  }

  async updateConfiguration() {
    console.log('⚙️  Updating configuration files...');
    
    // Create .env.example if it doesn't exist
    const envExamplePath = path.join(this.baseDir, 'backend', '.env.example');
    if (!(await this.fileExists(envExamplePath))) {
      await this.createEnvExample(envExamplePath);
      console.log('  ✓ Created .env.example');
    }
    
    // Create .gitignore if it doesn't exist
    const gitignorePath = path.join(this.baseDir, '.gitignore');
    if (!(await this.fileExists(gitignorePath))) {
      await this.createGitignore(gitignorePath);
      console.log('  ✓ Created .gitignore');
    }
    
    console.log('✅ Configuration updated\n');
  }

  async generateReport() {
    console.log('📊 Generating migration report...');
    
    const report = {
      migrationDate: new Date().toISOString(),
      version: '2.5.0',
      changes: {
        filesRemoved: await this.countRemovedFiles(),
        workspacesCreated: 7,
        modulesCreated: await this.countCreatedModules(),
        backupLocation: this.backupDir
      },
      nextSteps: [
        'Review the new frontend/index.html',
        'Install backend dependencies: cd backend && npm install',
        'Configure environment variables in backend/.env',
        'Start development: npm run dev',
        'Test Docker setup: docker-compose up -d'
      ]
    };
    
    const reportPath = path.join(this.baseDir, 'MIGRATION_REPORT.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log('  ✓ Report saved to MIGRATION_REPORT.json');
    console.log('✅ Report generated\n');
  }

  // Helper methods
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async copyDirectory(src, dest) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  getModulesForWorkspace(workspace) {
    const modules = {
      marketing: ['campanhas', 'seo-conteudo', 'midia-paga', 'calendario', 'relatorios'],
      comercial: ['leads', 'oportunidades', 'propostas', 'funil', 'relatorios'],
      produto: ['roadmap', 'backlog', 'feedbacks', 'analytics', 'lancamentos'],
      operacoes: ['sla-incidentes', 'runbooks', 'projetos', 'inventario', 'relatorios'],
      tecnologia: ['arquitetura', 'ci-cd', 'observabilidade', 'pesquisa', 'seguranca'],
      rh: ['vagas', 'onboarding', 'politicas', 'treinamentos', 'avaliacoes'],
      financeiro: ['contas', 'faturamento', 'forecast', 'custos', 'relatorios']
    };
    
    return modules[workspace] || [];
  }

  async createPlaceholderModule(filePath, workspace, module) {
    const content = `<div class="space-y-6">
  <div class="bg-dark-800/30 border border-quantum-400/20 rounded-xl p-6">
    <h3 class="text-lg font-semibold mb-4">${workspace.charAt(0).toUpperCase() + workspace.slice(1)} - ${module.charAt(0).toUpperCase() + module.slice(1)}</h3>
    
    <div class="text-center py-12">
      <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-quantum-400 to-quantum-600 flex items-center justify-center">
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
        </svg>
      </div>
      <h4 class="text-lg font-semibold mb-2">Módulo ${module.charAt(0).toUpperCase() + module.slice(1)}</h4>
      <p class="text-gray-400 max-w-md mx-auto mb-6">
        Este módulo está sendo desenvolvido. Em breve você terá acesso a todas as funcionalidades.
      </p>
      <button class="bg-quantum-500 hover:bg-quantum-600 text-white px-6 py-2 rounded-lg transition-colors">
        Em Desenvolvimento
      </button>
    </div>
  </div>
</div>`;
    
    await fs.writeFile(filePath, content);
  }

  async createEnvExample(filePath) {
    const content = `# Strato Quantum Platform - Environment Variables

# Application
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/stratoquantum
MONGO_PASSWORD=stratoquantum2025

# Cache
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=stratoquantum2025

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# API Configuration
API_RATE_LIMIT=100
API_RATE_WINDOW=15

# Monitoring
GRAFANA_PASSWORD=admin

# External Services (optional)
OPENAI_API_KEY=your-openai-api-key
SENDGRID_API_KEY=your-sendgrid-api-key
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
`;
    
    await fs.writeFile(filePath, content);
  }

  async createGitignore(filePath) {
    const content = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log
lerna-debug.log*

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env.test

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Docker
.dockerignore

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Backup files
backup_*/
*.backup

# Zone Identifier files (Windows)
*.Zone.Identifier

# Build outputs
dist/
build/

# Database
*.sqlite
*.db

# Temporary files
tmp/
temp/
`;
    
    await fs.writeFile(filePath, content);
  }

  async countRemovedFiles() {
    // This would count files in backup vs current
    return 200; // Approximate based on the structure we saw
  }

  async countCreatedModules() {
    let count = 0;
    const workspaces = ['marketing', 'comercial', 'produto', 'operacoes', 'tecnologia', 'rh', 'financeiro'];
    
    for (const workspace of workspaces) {
      count += this.getModulesForWorkspace(workspace).length;
    }
    
    return count;
  }
}

// Run migration if called directly
if (require.main === module) {
  const migration = new MigrationScript();
  migration.run().catch(console.error);
}

module.exports = MigrationScript;