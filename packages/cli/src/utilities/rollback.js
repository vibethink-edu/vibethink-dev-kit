#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

/**
 * Script de rollback para revertir despliegues problemáticos
 * Uso: node scripts/rollback.js <environment> <version> [--force]
 */

class RollbackManager {
  constructor(environment, version, force = false) {
    this.environment = environment;
    this.version = version;
    this.force = force;
    this.startTime = Date.now();
    this.logs = [];
  }

  /**
   * Ejecuta el rollback completo
   */
  async executeRollback() {
    try {
      // TODO: log `🔄 Iniciando rollback para ${this.environment} a versión ${this.version}`

      // Validaciones iniciales
      await this.validateRollback();

      // Ejecutar pasos del rollback
      await this.checkoutVersion();
      await this.installDependencies();
      await this.buildApplication();
      await this.deployRollback();
      await this.verifyDeployment();

      // Reporte final
      this.generateReport();

      // TODO: log '✅ Rollback completado exitosamente'
    } catch (error) {
      // TODO: log '❌ Rollback falló:' error.message
      this.logs.push(`ERROR: ${error.message}`);
      this.generateReport();
      throw error;
    }
  }

  /**
   * Valida que el rollback sea posible
   */
  async validateRollback() {
    // TODO: log '🔍 Validando rollback...'

    // Verificar que la versión existe
    const tags = execSync("git tag --list", { encoding: "utf8" });
    if (!tags.includes(this.version)) {
      throw new Error(`Versión ${this.version} no encontrada en tags`);
    }

    // Verificar que no estamos en producción sin --force
    if (this.environment === "production" && !this.force) {
      // TODO: log '⚠️ Rollback a producción requiere --force flag'
      throw new Error("Rollback a producción requiere confirmación explícita");
    }

    // Verificar estado del repositorio
    const status = execSync("git status --porcelain", { encoding: "utf8" });
    if (status.trim()) {
      throw new Error(
        "Repositorio tiene cambios sin commitear. Hacer commit o stash antes del rollback"
      );
    }

    this.logs.push("VALIDACIÓN: Rollback validado correctamente");
    // TODO: log '✅ Validación completada'
  }

  /**
   * Hace checkout a la versión especificada
   */
  async checkoutVersion() {
    // TODO: log `📦 Haciendo checkout a versión ${this.version}...`

    try {
      // Guardar branch actual
      const currentBranch = execSync("git branch --show-current", { encoding: "utf8" }).trim();
      this.logs.push(`CHECKOUT: Branch actual: ${currentBranch}`);

      // Checkout a la versión
      execSync(`git checkout ${this.version}`, { stdio: "inherit" });
      this.logs.push(`CHECKOUT: Checkout exitoso a ${this.version}`);

      // Verificar que estamos en la versión correcta
      const currentCommit = execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
      this.logs.push(`CHECKOUT: Commit actual: ${currentCommit}`);

      // TODO: log '✅ Checkout completado'
    } catch (error) {
      throw new Error(`Error en checkout: ${error.message}`);
    }
  }

  /**
   * Instala las dependencias
   */
  async installDependencies() {
    // TODO: log '📦 Instalando dependencias...'

    try {
      // Limpiar node_modules si existe
      if (fs.existsSync("node_modules")) {
        execSync("rm -rf node_modules", { stdio: "inherit" });
        this.logs.push("INSTALACIÓN: node_modules limpiado");
      }

      // Limpiar cache de npm
      execSync("npm cache clean --force", { stdio: "inherit" });
      this.logs.push("INSTALACIÓN: Cache de npm limpiado");

      // Instalar dependencias
      execSync("npm ci", { stdio: "inherit" });
      this.logs.push("INSTALACIÓN: Dependencias instaladas correctamente");

      // TODO: log '✅ Instalación completada'
    } catch (error) {
      throw new Error(`Error en instalación: ${error.message}`);
    }
  }

  /**
   * Construye la aplicación
   */
  async buildApplication() {
    // TODO: log '🔨 Construyendo aplicación...'

    try {
      // Verificar que package.json tiene script de build
      const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
      if (!packageJson.scripts.build) {
        throw new Error("Script de build no encontrado en package.json");
      }

      // Ejecutar build
      execSync("npm run build", { stdio: "inherit" });
      this.logs.push("BUILD: Aplicación construida correctamente");

      // Verificar que el build fue exitoso
      if (!fs.existsSync("dist") && !fs.existsSync("build")) {
        throw new Error("Build no generó archivos de salida");
      }

      // TODO: log '✅ Build completado'
    } catch (error) {
      throw new Error(`Error en build: ${error.message}`);
    }
  }

  /**
   * Despliega el rollback
   */
  async deployRollback() {
    // TODO: log `🚀 Desplegando rollback a ${this.environment}...`

    try {
      // Determinar comando de despliegue según el ambiente
      const deployCommand = this.getDeployCommand();

      // Ejecutar despliegue
      execSync(deployCommand, { stdio: "inherit" });
      this.logs.push(`DESPLIEGUE: Rollback desplegado a ${this.environment}`);

      // Esperar un poco para que el despliegue se propague
      // TODO: log '⏳ Esperando propagación del despliegue...'
      await this.sleep(30000); // 30 segundos

      // TODO: log '✅ Despliegue completado'
    } catch (error) {
      throw new Error(`Error en despliegue: ${error.message}`);
    }
  }

  /**
   * Obtiene el comando de despliegue según el ambiente
   */
  getDeployCommand() {
    const commands = {
      production: "npm run deploy:production",
      staging: "npm run deploy:staging",
      development: "npm run deploy:development",
    };

    const command = commands[this.environment];
    if (!command) {
      throw new Error(`Ambiente '${this.environment}' no soportado`);
    }

    return command;
  }

  /**
   * Verifica que el despliegue fue exitoso
   */
  async verifyDeployment() {
    // TODO: log '🔍 Verificando despliegue...'

    try {
      // Ejecutar health check
      const { HealthChecker } = require("./health-check.js");
      const checker = new HealthChecker(this.environment);

      const status = await checker.runHealthCheck();

      if (status === "unhealthy") {
        throw new Error("Health check falló después del rollback");
      }

      this.logs.push(`VERIFICACIÓN: Health check exitoso (${status})`);

      // Ejecutar smoke tests si están disponibles
      if (this.hasSmokeTests()) {
        // TODO: log '🧪 Ejecutando smoke tests...'
        execSync("npm run test:smoke", { stdio: "inherit" });
        this.logs.push("VERIFICACIÓN: Smoke tests pasaron");
      }

      // TODO: log '✅ Verificación completada'
    } catch (error) {
      throw new Error(`Error en verificación: ${error.message}`);
    }
  }

  /**
   * Verifica si hay smoke tests disponibles
   */
  hasSmokeTests() {
    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
    return packageJson.scripts && packageJson.scripts["test:smoke"];
  }

  /**
   * Genera el reporte del rollback
   */
  generateReport() {
    const totalTime = Date.now() - this.startTime;
    const timestamp = new Date().toISOString();

    const report = `# Rollback Report

**Ambiente**: ${this.environment.toUpperCase()}
**Versión**: ${this.version}
**Timestamp**: ${timestamp}
**Duración**: ${totalTime}ms
**Forzado**: ${this.force ? "Sí" : "No"}

## 📋 Logs de Ejecución

${this.logs.map((log) => `- ${log}`).join("\n")}

## 📊 Resumen

- **Estado**: ${this.logs.some((log) => log.includes("ERROR")) ? "FALLIDO" : "EXITOSO"}
- **Tiempo total**: ${totalTime}ms
- **Pasos completados**: ${this.logs.length}

## 🔧 Comandos Ejecutados

1. \`git checkout ${this.version}\`
2. \`npm ci\`
3. \`npm run build\`
4. \`${this.getDeployCommand()}\`
5. Health check y verificación

## 📝 Notas

${this.generateNotes()}

---
*Reporte generado automáticamente por el sistema de rollback*
`;

    const reportPath = path.join(
      process.cwd(),
      `rollback-report-${this.environment}-${Date.now()}.md`
    );
    fs.writeFileSync(reportPath, report);

    // TODO: log `📄 Reporte guardado: ${reportPath}`

    // Mostrar resumen en consola
    // TODO: log '\n📊 RESUMEN DEL ROLLBACK:'
    // TODO: log '=' .repeat(40)
    // TODO: log `Ambiente: ${this.environment.toUpperCase()}`
    // TODO: log `Versión: ${this.version}`
    // TODO: log `Estado: ${this.logs.some(log => log.includes('ERROR')) ? '❌ FALLIDO' : '✅ EXITOSO'}`
    // TODO: log `Tiempo: ${totalTime}ms`
    // TODO: log `Logs: ${this.logs.length} entradas`
  }

  /**
   * Genera notas adicionales para el reporte
   */
  generateNotes() {
    const notes = [];

    if (this.force) {
      notes.push("- Rollback ejecutado con flag --force");
    }

    if (this.environment === "production") {
      notes.push("- Rollback en producción - verificar impacto en usuarios");
      notes.push("- Monitorear métricas de aplicación");
      notes.push("- Notificar al equipo de soporte");
    }

    if (this.logs.some((log) => log.includes("ERROR"))) {
      notes.push("- Se detectaron errores durante el rollback");
      notes.push("- Revisar logs para más detalles");
      notes.push("- Considerar rollback manual si es necesario");
    }

    return notes.length > 0 ? notes.join("\n") : "Rollback ejecutado sin problemas.";
  }

  /**
   * Función de utilidad para esperar
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Función principal
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    // TODO: log '❌ Uso: node scripts/rollback.js <environment> <version> [--force]'
    // TODO: log 'Ejemplo: node scripts/rollback.js production v1.2.3 --force'
    process.exit(1);
  }

  const environment = args[0];
  const version = args[1];
  const force = args.includes("--force");

  // Validar ambiente
  const validEnvironments = ["production", "staging", "development"];
  if (!validEnvironments.includes(environment)) {
    // TODO: log `❌ Ambiente inválido: ${environment}`
    // TODO: log `Ambientes válidos: ${validEnvironments.join(', ')}`
    process.exit(1);
  }

  // Confirmación para producción
  if (environment === "production" && !force) {
    // TODO: log '⚠️  ADVERTENCIA: Rollback a producción'
    // TODO: log 'Para continuar, agregue --force al comando'
    process.exit(1);
  }

  const rollbackManager = new RollbackManager(environment, version, force);

  try {
    await rollbackManager.executeRollback();
    process.exit(0);
  } catch (error) {
    // TODO: log '❌ Rollback falló:' error.message
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = RollbackManager;
