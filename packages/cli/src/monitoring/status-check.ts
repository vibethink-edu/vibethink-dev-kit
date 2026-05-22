#!/usr/bin/env tsx

/**
 * Status Check Script - VThink 10 * 
 * Verifica el estado completo del proyecto:
 * - Servidor de desarrollo
 * - Configuraciones
 * - Módulos implementados
 * - Dependencias
 * - Base de datos
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

interface StatusCheck {
  name: string;
  status: '✅' | '❌' | '⚠️';
  message: string;
  details?: any;
}

class VThinkStatusChecker {
  private checks: StatusCheck[] = [];

  async runAllChecks(): Promise<void> {
    // TODO: log '🔍 Verificando estado del proyecto VThink 1.0...\n'

    await this.checkServerStatus();
    await this.checkDependencies();
    await this.checkConfigurations();
    await this.checkModules();
    await this.checkDatabase();
    await this.checkEnvironment();
    await this.checkDartAI();
    await this.checkDataDog();

    this.printResults();
  }

  private async checkServerStatus(): Promise<void> {
    try {
      const result = execSync('netstat -ano | findstr :31, { encoding: 'utf8' });
      this.addCheck('Servidor de Desarrollo', '✅', 'Ejecutándose en puerto 31[object Object]port: 301 });
    } catch (error) {
      this.addCheck('Servidor de Desarrollo', '❌', 'No está ejecutándose', { error: error.message });
    }
  }

  private async checkDependencies(): Promise<void> {
    try {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
      const requiredDeps = ['next', 'eact', 'typescript', 'tailwindcss', '@supabase/supabase-js'];
      const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]);

      if (missingDeps.length === 0) {
        this.addCheck('Dependencias', '✅', 'Todas las dependencias instaladas', { total: Object.keys(packageJson.dependencies).length });
      } else {
        this.addCheck('Dependencias', '❌', `Faltan dependencias: ${missingDeps.join(', ')}`, { missing: missingDeps });
      }
    } catch (error) {
      this.addCheck('Dependencias', '❌', 'Error verificando dependencias', { error: error.message });
    }
  }

  private async checkConfigurations(): Promise<void> {
    const configFiles = [
      'next.config.js', 'tailwind.config.ts', 'tsconfig.json',
      '.dartai.config.json',
      'env.example'
    ];

    const existingFiles = configFiles.filter(file => existsSync(file));
    const missingFiles = configFiles.filter(file => !existsSync(file));

    if (missingFiles.length === 0) {
      this.addCheck('Archivos de Configuración', '✅', 'Todos los archivos de configuración presentes', { total: existingFiles.length });
    } else {
      this.addCheck('Archivos de Configuración', '⚠️', `Faltan archivos: ${missingFiles.join(', ')}`, { missing: missingFiles });
    }
  }

  private async checkModules(): Promise<void> {
    const modules = [
      'src/modules/meeting-processor',
      'src/modules/observability', 'src/shared/components',
      'src/shared/hooks', 'src/shared/services'
    ];

    const existingModules = modules.filter(module => existsSync(module));
    const missingModules = modules.filter(module => !existsSync(module));

    if (missingModules.length === 0) {
      this.addCheck('Módulos del Proyecto', '✅', 'Todos los módulos implementados', { total: existingModules.length });
    } else {
      this.addCheck('Módulos del Proyecto', '⚠️', `Faltan módulos: ${missingModules.join(', ')}`, { missing: missingModules });
    }
  }

  private async checkDatabase(): Promise<void> {
    const dbFiles = ['supabase/migrations/1initial_schema.sql', 'supabase/migrations/2_vthink_schema.sql', 'supabase/migrations/dartai_tasks.sql'];

    const existingFiles = dbFiles.filter(file => existsSync(file));
    const missingFiles = dbFiles.filter(file => !existsSync(file));

    if (missingFiles.length === 0) {
      this.addCheck('Schema de Base de Datos', '✅', 'Todos los archivos de migración presentes', { total: existingFiles.length });
    } else {
      this.addCheck('Schema de Base de Datos', '⚠️', `Faltan archivos: ${missingFiles.join(', ')}`, { missing: missingFiles });
    }
  }

  private async checkEnvironment(): Promise<void> {
    const envFile = 'env.example';
    if (existsSync(envFile)) {
      const envContent = readFileSync(envFile, 'utf8');
      const requiredVars = [
        'NEXT_PUBLIC_SUPABASE_URL', 'OPENAI_API_KEY',
        'DART_AI_TOKEN',
        'DATADOG_API_KEY'
      ];

      const missingVars = requiredVars.filter(varName => !envContent.includes(varName));

      if (missingVars.length === 0) {
        this.addCheck('Variables de Entorno', '✅', 'Todas las variables requeridas definidas', { total: requiredVars.length });
      } else {
        this.addCheck('Variables de Entorno', '⚠️', `Faltan variables: ${missingVars.join(', ')}`, { missing: missingVars });
      }
    } else {
      this.addCheck('Variables de Entorno', '❌', 'Archivo env.example no encontrado');
    }
  }

  private async checkDartAI(): Promise<void> {
    const dartaiConfig = '.dartai.config.json';
    if (existsSync(dartaiConfig)) {
      try {
        const config = JSON.parse(readFileSync(dartaiConfig, 'utf8'));
        const requiredFields = ['projectId', 'workspace', 'integrations'];
        const missingFields = requiredFields.filter(field => !config[field]);

        if (missingFields.length === 0) {
          this.addCheck('DartAI Configuración', '✅', 'Configuración completa', { projectId: config.projectId });
        } else {
          this.addCheck('DartAI Configuración', '⚠️', `Faltan campos: ${missingFields.join(', ')}`, { missing: missingFields });
        }
      } catch (error) {
        this.addCheck('DartAI Configuración', '❌', 'Error leyendo configuración', { error: error.message });
      }
    } else {
      this.addCheck('DartAI Configuración', '❌', 'Archivo de configuración no encontrado');
    }
  }

  private async checkDataDog(): Promise<void> {
    try {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
      const hasDataDog = packageJson.dependencies['dd-trace'] || packageJson.devDependencies['dd-trace'];
      if (hasDataDog) {
        this.addCheck('DataDog Observability', '✅', 'DataDog instalado y configurado', { version: packageJson.dependencies['dd-trace'] || packageJson.devDependencies['dd-trace'] });
      } else {
        this.addCheck('DataDog Observability', '❌', 'DataDog no instalado');
      }
    } catch (error) {
      this.addCheck('DataDog Observability', '❌', 'Error verificando DataDog', { error: error.message });
    }
  }

  private addCheck(name: string, status: '✅' | '❌' | '⚠️', message: string, details?: any): void {
    this.checks.push({ name, status, message, details });
  }

  private printResults(): void {
    // TODO: log '\n📊 Resultados del Status Check:\n'

    const passed = this.checks.filter(check => check.status === '✅').length;
    const failed = this.checks.filter(check => check.status === '❌').length;
    const warnings = this.checks.filter(check => check.status === '⚠️').length;

    this.checks.forEach(check => {
      // TODO: log `${check.status} ${check.name}: ${check.message}`
      if (check.details) {
        // TODO: log `   📋 ${JSON.stringify(check.details, null, 2)}`
      }
    });

    // TODO: log '\n📈 Resumen:'
    // TODO: log `   ✅ Exitosos: ${passed}`
    // TODO: log `   ⚠️  Advertencias: ${warnings}`
    // TODO: log `   ❌ Errores: ${failed}`

    if (failed === 0 && warnings === 0) {
      // TODO: log '\n🎉 ¡Proyecto VThink 1.0 listo para desarrollo!'
    } else if (failed === 0) {
      // TODO: log '\n⚠️  Proyecto funcional con algunas advertencias menores.'
    } else {
      // TODO: log '\n❌ Hay errores que necesitan atención antes de continuar.'
    }
  }
}

// Run status check
const checker = new VThinkStatusChecker();
checker.runAllChecks().catch(console.error); 