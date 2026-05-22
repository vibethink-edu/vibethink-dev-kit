#!/usr/bin/env node

/**
 * DartAI Setup Script - VThink 1.0
 *
 * Script simplificado para configuración inicial de DartAI
 * sin dependencias de Supabase
 */

import "dotenv/config";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

class DartAISetup {
  constructor() {
    this.configPath = path.join(process.cwd(), ".dartai.config.json");
  }

  /**
   * Ejecutar setup completo
   */
  async run() {
    // TODO: log '🚀 Iniciando setup de DartAI para VThink 1.0...\n'

    try {
      await this.checkPrerequisites();
      await this.setupConfig();
      await this.setupCursor();
      await this.setupGitHubActions();
      await this.createDatabaseSchema();
      await this.testIntegration();

      // TODO: log '\n✅ Setup de DartAI completado exitosamente!'
      // TODO: log '\n📋 Próximos pasos:'
      // TODO: log '1. Configurar API key en .dartai.config.json'
      // TODO: log '2. Crear cuenta en dartai.com'
      // TODO: log '3. Configurar variables de entorno (.env)'
      // TODO: log '4. Ejecutar: npm run dart:sync'
    } catch (error) {
      // TODO: log '❌ Error en setup:' error.message
      process.exit(1);
    }
  }

  /**
   * Verificar prerequisitos
   */
  async checkPrerequisites() {
    // TODO: log '🔍 Verificando prerequisitos...'

    // Verificar Node.js
    const nodeVersion = process.version;
    // TODO: log `✅ Node.js ${nodeVersion}`

    // Verificar npm
    try {
      const npmVersion = execSync("npm --version", { encoding: "utf8" }).trim();
      // TODO: log `✅ npm ${npmVersion}`
    } catch (error) {
      throw new Error("npm no está instalado");
    }

    // Verificar Git
    try {
      const gitVersion = execSync("git --version", { encoding: "utf8" }).trim();
      // TODO: log `✅ ${gitVersion}`
    } catch (error) {
      throw new Error("Git no está instalado");
    }

    // TODO: log '✅ Todos los prerequisitos cumplidos\n'
  }

  /**
   * Configurar archivo de configuración
   */
  async setupConfig() {
    // TODO: log '⚙️ Configurando DartAI...'

    if (!fs.existsSync(this.configPath)) {
      const config = {
        apiKey: process.env.DART_TOKEN || "",
        projectId: "vibethink-orchestrator",
        workspace: "VThink-1.0",
        integrations: {
          github: {
            enabled: true,
            repo: "VibeThink-Orchestrator",
            syncIssues: true,
          },
          supabase: {
            enabled: true,
            table: "tasks",
          },
        },
        workflows: {
          meetingProcessor: {
            enabled: true,
            priority: "HIGH",
          },
          resourceScraper: {
            enabled: true,
            priority: "MEDIUM",
          },
          contentPipeline: {
            enabled: false,
            priority: "LOW",
          },
        },
        notifications: {
          email: true,
          slack: false,
          discord: false,
        },
      };

      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
      // TODO: log '✅ Archivo de configuración creado'
    } else {
      // TODO: log '✅ Archivo de configuración ya existe'
    }

    // TODO: log ''
  }

  /**
   * Configurar Cursor MCP
   */
  async setupCursor() {
    // TODO: log '🎯 Configurando Cursor MCP...'

    const cursorConfigPath = path.join(process.cwd(), ".cursor", "settings.json");
    const cursorDir = path.dirname(cursorConfigPath);

    // Crear directorio .cursor si no existe
    if (!fs.existsSync(cursorDir)) {
      fs.mkdirSync(cursorDir, { recursive: true });
    }

    const cursorConfig = {
      mcpServers: {
        dart: {
          command: "npx",
          args: ["-y", "dart-mcp-server@latest"],
          env: {
            DART_TOKEN: "${env:DART_TOKEN}",
          },
        },
      },
    };

    fs.writeFileSync(cursorConfigPath, JSON.stringify(cursorConfig, null, 2));
    // TODO: log '✅ Configuración de Cursor MCP creada'
    // TODO: log ''
  }

  /**
   * Configurar GitHub Actions
   */
  async setupGitHubActions() {
    // TODO: log '🔗 Configurando GitHub Actions...'

    const workflowsDir = path.join(process.cwd(), ".github", "workflows");
    if (!fs.existsSync(workflowsDir)) {
      fs.mkdirSync(workflowsDir, { recursive: true });
    }

    const dartSyncWorkflow = `name: DartAI Sync

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  issues:
    types: [ opened, edited, closed ]
  issue_comment:
    types: [ created, edited, deleted ]

jobs:
  dart-sync:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Setup DartAI
      env:
        DART_TOKEN: \${{ secrets.DART_TOKEN }}
      run: |
        npm install -g dart-mcp-server
        node scripts/dart-integration.ts
    
    - name: Sync with DartAI
      env:
        DART_TOKEN: \${{ secrets.DART_TOKEN }}
      run: npm run dart:sync
`;

    const workflowPath = path.join(workflowsDir, "dart-sync.yml");
    fs.writeFileSync(workflowPath, dartSyncWorkflow);
    // TODO: log '✅ GitHub Actions workflow creado'
    // TODO: log ''
  }

  /**
   * Crear schema de base de datos
   */
  async createDatabaseSchema() {
    // TODO: log '🗄️ Creando schema de base de datos...'

    const schemaSQL = `-- DartAI Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'TODO' CHECK (status IN ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE')),
  priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  assignee TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  tags TEXT[] DEFAULT '{}',
  source TEXT DEFAULT 'manual',
  source_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE
);

-- RLS Policies
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tasks from their company" ON tasks
  FOR SELECT USING (company_id = auth.jwt() ->> 'company_id');

CREATE POLICY "Users can insert tasks for their company" ON tasks
  FOR INSERT WITH CHECK (company_id = auth.jwt() ->> 'company_id');

CREATE POLICY "Users can update tasks from their company" ON tasks
  FOR UPDATE USING (company_id = auth.jwt() ->> 'company_id');

CREATE POLICY "Users can delete tasks from their company" ON tasks
  FOR DELETE USING (company_id = auth.jwt() ->> 'company_id');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tasks_company_id ON tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at 
  BEFORE UPDATE ON tasks 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
`;

    const schemaPath = path.join(process.cwd(), "supabase", "migrations", "dartai_tasks.sql");
    const migrationsDir = path.dirname(schemaPath);

    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
    }

    fs.writeFileSync(schemaPath, schemaSQL);
    // TODO: log '✅ Schema de base de datos creado'
    // TODO: log ''
  }

  /**
   * Probar integración
   */
  async testIntegration() {
    // TODO: log '🧪 Probando integración...'

    try {
      // Verificar configuración
      const config = JSON.parse(fs.readFileSync(this.configPath, "utf8"));
      if (config.projectId && config.workspace) {
        // TODO: log '✅ Configuración válida'
      } else {
        // TODO: log '⚠️ Configuración incompleta - revisar .dartai.config.json'
      }

      // Verificar que los archivos se crearon
      const filesToCheck = [
        ".dartai.config.json",
        ".cursor/settings.json",
        ".github/workflows/dart-sync.yml",
        "supabase/migrations/dartai_tasks.sql",
      ];

      for (const file of filesToCheck) {
        if (fs.existsSync(path.join(process.cwd(), file))) {
          // TODO: log `✅ ${file} creado`
        } else {
          // TODO: log `⚠️ ${file} no encontrado`
        }
      }
    } catch (error) {
      // TODO: log '⚠️ Error en prueba de integración:' error.message
    }

    // TODO: log ''
  }
}

// Ejecutar setup
const setup = new DartAISetup();
setup.run();
