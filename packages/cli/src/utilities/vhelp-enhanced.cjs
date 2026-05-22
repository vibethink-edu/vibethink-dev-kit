#!/usr/bin/env node

/**
 * VHelp Enhanced - Sistema de ayuda con seguridad integrada para VibeThink Orchestrator
 * Incluye warnings, confirmaciones y análisis de riesgo para comandos
 *
 * @author AI Assistant
 * @version 2.0.0 (Enhanced Security)
 * @date 2025-01-27
 */

const fs = require("fs");
const path = require("path");

// Importar configuración de seguridad (simular ES6 import en CommonJS)
const securityConfig = (() => {
  try {
    // En entorno de producción esto sería una importación real
    // Por ahora incluimos la lógica directamente
    const RISK_LEVELS = {
      SAFE: "safe",
      MODERATE: "moderate",
      DANGEROUS: "dangerous",
    };

    const commandRisks = {
      [RISK_LEVELS.SAFE]: [
        "vhelp",
        "validate:quick",
        "validate:universal",
        "validate:architecture",
        "validate:ecosystem",
        "validate:cross-app-compatibility",
        "validate:shared-component-impact",
        "validate:external-update",
        "validate:security",
        "validate:performance",
        "validate:multilang",
        "validate:npm-install",
        "validate:duplication",
        "validate:integration",
        "validate:ui-generic",
        "validate:guard",
        "lint",
        "type-check",
        "test",
        "test:dashboard",
        "dev:dashboard",
        "dev:admin",
        "dev:login",
        "dev:helpdesk",
        "dev:all",
        "dev",
      ],
      [RISK_LEVELS.MODERATE]: [
        "fix:npm-duplications",
        "ai:safe-commit",
        "ai:before-changes",
        "ai:after-changes",
        "ai:recovery",
        "install:all",
        "setup",
        "build",
        "build:dashboard",
        "build:admin",
        "build:website",
        "build:all",
      ],
      [RISK_LEVELS.DANGEROUS]: [
        "clean",
        "clean:all",
        "clean:force",
        "clean:win",
        "clean:unix",
        "clean:next",
      ],
    };

    const riskStyling = {
      [RISK_LEVELS.SAFE]: { emoji: "🟢", color: "\x1b[32m", label: "SEGURO" },
      [RISK_LEVELS.MODERATE]: { emoji: "🟡", color: "\x1b[33m", label: "MODERADO" },
      [RISK_LEVELS.DANGEROUS]: { emoji: "🔴", color: "\x1b[31m", label: "PELIGROSO" },
    };

    function getRiskLevel(command) {
      for (const [risk, commands] of Object.entries(commandRisks)) {
        if (commands.includes(command)) {
          return risk;
        }
      }
      return RISK_LEVELS.SAFE;
    }

    function getRiskStyling(risk) {
      return riskStyling[risk] || riskStyling[RISK_LEVELS.SAFE];
    }

    return { RISK_LEVELS, commandRisks, getRiskLevel, getRiskStyling };
  } catch (error) {
    console.error("Error loading security config:", error);
    return null;
  }
})();

// Colores para output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  bright_red: "\x1b[91m",
};

const log = {
  title: (msg) => console.log(`${colors.cyan}${colors.bold}${msg}${colors.reset}`),
  subtitle: (msg) => console.log(`${colors.magenta}${colors.bold}${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}📋 ${msg}${colors.reset}`),
  command: (cmd, desc) =>
    console.log(`${colors.white}  ${cmd.padEnd(35)} ${colors.dim}# ${desc}${colors.reset}`),
  commandSecure: (cmd, desc, securityBadge) =>
    console.log(
      `${colors.white}  ${cmd.padEnd(30)} ${securityBadge} ${colors.dim}# ${desc}${colors.reset}`
    ),
  section: (title) =>
    console.log(`\n${colors.yellow}${colors.bold}📂 ${title.toUpperCase()}${colors.reset}`),
};

class VThinkHelperEnhanced {
  constructor() {
    this.projectRoot = process.cwd();
    this.commands = new Map();
    this.securityEnabled = !!securityConfig;
    this.categories = {
      development: {
        title: "Desarrollo y Construcción",
        keywords: ["dev", "build", "start", "serve"],
        icon: "🚀",
      },
      validation: {
        title: "Validación y Calidad",
        keywords: ["validate", "lint", "test", "check"],
        icon: "🔍",
      },
      fixing: {
        title: "Corrección Automática",
        keywords: ["fix", "clean", "install"],
        icon: "🔧",
      },
      ai: {
        title: "Comandos AI-Específicos",
        keywords: ["ai:"],
        icon: "🤖",
      },
    };
  }

  async run() {
    try {
      this.printHeader();
      await this.loadCommands();
      this.printCommands();
      this.printFooter();
    } catch (error) {
      log.error(`Error ejecutando VHelp: ${error.message}`);
      process.exit(1);
    }
  }

  printHeader() {
    log.title("\n🛠️  VHELP Enhanced - VibeThink Orchestrator Command Center 🛡️");

    if (this.securityEnabled) {
      log.subtitle("🔒 Sistema de Seguridad Activado - Análisis de Riesgo Incluido");
    } else {
      log.warning("⚠️  Sistema de Seguridad No Disponible - Modo Básico");
    }

    console.log(`${colors.dim}📍 Directorio: ${this.projectRoot}${colors.reset}`);
    console.log(`${colors.dim}📅 Fecha: ${new Date().toLocaleDateString("es-ES")}${colors.reset}`);

    if (this.securityEnabled) {
      console.log(`\n${colors.bold}🛡️  NIVELES DE SEGURIDAD:${colors.reset}`);
      console.log(
        `   🟢 ${colors.green}SEGURO${colors.reset}    - Solo lectura, validación, análisis`
      );
      console.log(`   🟡 ${colors.yellow}MODERADO${colors.reset}  - Modificaciones controladas`);
      console.log(
        `   🔴 ${colors.red}PELIGROSO${colors.reset} - Borrado de archivos, cambios mayores`
      );
    }

    console.log("");
  }

  async loadCommands() {
    const packagePath = path.join(this.projectRoot, "package.json");

    if (!fs.existsSync(packagePath)) {
      log.error("package.json no encontrado en la raíz del proyecto");
      return;
    }

    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
    const scripts = packageJson.scripts || {};

    // Agregar comandos desde package.json
    Object.entries(scripts).forEach(([command, script]) => {
      const securityInfo = this.getSecurityInfo(command);
      this.commands.set(`npm run ${command}`, {
        script,
        description: this.generateDescription(command, script),
        category: this.determineCategory(command),
        security: securityInfo,
      });
    });

    // Agregar comandos adicionales manualmente conocidos
    this.addManualCommands();
  }

  getSecurityInfo(command) {
    if (!this.securityEnabled) return null;

    const risk = securityConfig.getRiskLevel(command);
    const styling = securityConfig.getRiskStyling(risk);

    return {
      risk,
      badge: `${styling.emoji} ${styling.color}${styling.label}${colors.reset}`,
      requiresConfirmation: risk === securityConfig.RISK_LEVELS.DANGEROUS,
      isModerate: risk === securityConfig.RISK_LEVELS.MODERATE,
      isDangerous: risk === securityConfig.RISK_LEVELS.DANGEROUS,
    };
  }

  generateDescription(command, script) {
    const descriptions = {
      // Desarrollo
      dev: "Dashboard en puerto 3001 - inicia servidor directamente",
      "dev:dashboard": "Dashboard en puerto 3001 - servidor directo",
      "dev:admin": "Admin en puerto 3002 - servidor directo",
      "dev:login": "Login en puerto 3003 - servidor directo",
      "dev:helpdesk": "Helpdesk en puerto 3004 - servidor directo",
      "dev:website": "Website en puerto 3005 - servidor directo",
      "dev:test": "🧪 Dashboard en puerto 3099 para pruebas",
      "dev:test:reserve": "📌 Reservar puerto 3099 (sin levantar servidor)",
      "dev:all": "Todos los servidores (3001-3004)",
      "dev:status": "🔍 Ver qué puertos están ocupados",

      // Build
      build: "Construye todas las aplicaciones",
      "build:dashboard": "Construye aplicación Dashboard",
      "build:admin": "Construye aplicación Admin",
      "build:website": "Construye sitio web de marketing",
      "build:all": "Construye todas las aplicaciones del monorepo",

      // Validación - SIMPLIFICADO
      validate: "Validación combinada (quick + universal)",
      "validate:quick": "NIVEL 1 - Validación rápida (antes de empezar)",
      "validate:universal": "NIVEL 2 - Validación completa (antes de commit)",
      "validate:full": "Validación ecosistema completo con todas las verificaciones",
      "validate:guard": "NIVEL 3 - Protección emergencia (cuando algo se rompe)",
      "validate:security": "Validación de cumplimiento de seguridad",
      "validate:arch": "Validación de arquitectura y estructura",
      "validate:perf": "Validación de métricas de rendimiento",

      // Validaciones especializadas
      "validate:cross-app-compatibility": "Validación entre aplicaciones",
      "validate:shared-component-impact": "Análisis de impacto de componentes compartidos",
      "validate:external-update": "Evaluación de riesgo para actualizaciones externas",
      "validate:security": "Validación de cumplimiento de seguridad",
      "validate:performance": "Validación de métricas de rendimiento",
      "validate:architecture": "Validación de arquitectura y estructura",
      "validate:multilang": "Validación de reglas multiidioma",
      "validate:npm-install": "Validación de instalaciones NPM",
      "validate:duplication": "Detección de código y dependencias duplicadas",
      "validate:integration": "Validación de integración entre componentes",
      "validate:ui-generic": "Validación de componentes UI genéricos",

      // Corrección y utilidades
      "fix:deps": "Corrige automáticamente duplicaciones NPM",
      "port-check": "🔍 Ver estado de todos los puertos (3001-3099)",
      "kill-ports": "🚨 Liberar TODOS los puertos ocupados",
      "quick-start": "⚡ Start inteligente con detección de puertos",
      emergency: "🚨 Limpieza de emergencia + liberar puertos",
      status: "📊 Estado completo del sistema + puertos",

      // AI
      "ai:commit": "Commit seguro con validación automática",
      "ai:recovery": "Procedimiento de recuperación de errores",

      // Testing
      test: "Ejecuta pruebas del dashboard principal",
      "test:all": "Ejecuta pruebas de todas las aplicaciones",
      lint: "Ejecuta linting en dashboard principal",
      "lint:all": "Ejecuta linting en todas las apps",
      "type-check": "Verificación de tipos TypeScript",

      // Limpieza - SIMPLIFICADO
      clean: "🧹 Limpieza de node_modules y archivos .next",
      "clean:force": "💀 Limpieza + mata procesos Node activos",

      // Mantenimiento
      "install:all": "Instala dependencias en root y todas las apps",
      setup: "Setup completo: limpia + instala todo",

      // Utilidades principales
      "pre-commit": "Validación pre-commit automática",
      vhelp: "Muestra este centro de comandos",
      "vhelp:help": "Ayuda detallada del sistema VHELP",
      start: "Inicia dashboard en modo producción",
      "start:website": "Inicia website en modo producción",
    };

    return descriptions[command] || this.inferDescription(command, script);
  }

  inferDescription(command, script) {
    if (script.includes("next dev")) return "Servidor de desarrollo Next.js";
    if (script.includes("next build")) return "Construcción de producción Next.js";
    if (script.includes("eslint")) return "Verificación de código con ESLint";
    if (script.includes("validate")) return "Validación del proyecto";
    if (script.includes("clean")) return "Limpieza de archivos generados";
    if (script.includes("install")) return "Instalación de dependencias";
    if (script.includes("test")) return "Ejecución de pruebas";

    return "Comando personalizado del proyecto";
  }

  determineCategory(command) {
    for (const [key, category] of Object.entries(this.categories)) {
      if (category.keywords.some((keyword) => command.includes(keyword))) {
        return key;
      }
    }
    return "others";
  }

  addManualCommands() {
    // Agregar comandos adicionales que no están en package.json
    this.commands.set("npm install", {
      script: "npm install",
      description: "Instala dependencias del proyecto",
      category: "fixing",
      security: this.getSecurityInfo("install"),
    });
  }

  printCommands() {
    const groupedCommands = this.groupCommandsByCategory();

    Object.entries(groupedCommands).forEach(([category, commands]) => {
      const categoryConfig = this.categories[category];
      if (categoryConfig && commands.length > 0) {
        log.section(`${categoryConfig.icon} ${categoryConfig.title}`);

        // Sort commands by security risk (safe first, dangerous last)
        commands.sort((a, b) => {
          if (!this.securityEnabled) return 0;

          const getRiskPriority = (cmd) => {
            const risk = cmd.security?.risk;
            if (risk === securityConfig.RISK_LEVELS.SAFE) return 0;
            if (risk === securityConfig.RISK_LEVELS.MODERATE) return 1;
            if (risk === securityConfig.RISK_LEVELS.DANGEROUS) return 2;
            return 0;
          };

          return getRiskPriority(a) - getRiskPriority(b);
        });

        commands.forEach(({ command, description, security }) => {
          if (this.securityEnabled && security) {
            log.commandSecure(command, description, security.badge);

            // Add security note for dangerous commands
            if (security.isDangerous) {
              console.log(`${colors.dim}       ⚠️  REQUIERE CONFIRMACIÓN MANUAL${colors.reset}`);
            } else if (security.isModerate) {
              console.log(`${colors.dim}       ℹ️  Revisa antes de ejecutar${colors.reset}`);
            }
          } else {
            log.command(command, description);
          }
        });
      }
    });

    // Show commands without category (others)
    if (groupedCommands.others && groupedCommands.others.length > 0) {
      log.section("🔧 Otros Comandos");
      groupedCommands.others.forEach(({ command, description, security }) => {
        if (this.securityEnabled && security) {
          log.commandSecure(command, description, security.badge);
        } else {
          log.command(command, description);
        }
      });
    }
  }

  groupCommandsByCategory() {
    const grouped = {};

    this.commands.forEach((commandInfo, command) => {
      const category = commandInfo.category;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push({
        command,
        description: commandInfo.description,
        security: commandInfo.security,
      });
    });

    return grouped;
  }

  printFooter() {
    console.log("\n" + "=".repeat(70));
    log.title("🚨 COMANDOS ESENCIALES DIARIOS");
    console.log("=".repeat(70));

    if (this.securityEnabled) {
      log.commandSecure(
        "npm run validate:quick",
        "Validación rápida (empezar trabajo)",
        "🟢 SEGURO"
      );
      log.commandSecure(
        "npm run validate:universal",
        "Validación completa (antes de commit)",
        "🟢 SEGURO"
      );
      log.commandSecure("npm run dev:dashboard", "Servidor desarrollo dashboard", "🟢 SEGURO");
      log.commandSecure("npm run clean", "Limpieza de archivos build", "🔴 PELIGROSO");
    } else {
      log.command("npm run validate:quick", "Validación rápida (empezar trabajo)");
      log.command("npm run validate:universal", "Validación completa (antes de commit)");
      log.command("npm run dev:dashboard", "Servidor desarrollo dashboard");
      log.command("npm run clean", "Limpieza de archivos build");
    }

    console.log("\n" + "=".repeat(70));
    log.title("🚨 WORKFLOW AI - 4 NIVELES VALIDACIÓN");
    console.log("=".repeat(70));

    log.info("🟢 NIVEL 1: validate:quick    # Antes de empezar trabajo");
    log.info("🔧 [IMPLEMENTAR CAMBIOS]      # Desarrollo");
    log.info("🟡 NIVEL 2: validate:universal # Antes de commit");
    log.info("🔴 NIVEL 3: validate:guard     # Si algo se rompe");
    log.info("🚀 NIVEL 4: validate:ecosystem # CI/CD completo");

    if (this.securityEnabled) {
      console.log("\n" + "=".repeat(70));
      log.title("🛡️  SISTEMA DE SEGURIDAD");
      console.log("=".repeat(70));

      log.warning("Los comandos 🔴 PELIGROSOS requieren confirmación manual");
      log.info("Los comandos 🟡 MODERADOS muestran información antes de ejecutar");
      log.success("Los comandos 🟢 SEGUROS se ejecutan sin restricciones");

      console.log(
        `\n${colors.cyan}💡 Consejo:${colors.reset} Para ejecutar comandos peligrosos sin confirmación:`
      );
      console.log(`${colors.dim}   Usa el flag --force (cuando esté disponible)${colors.reset}`);
    }

    console.log("\n" + "=".repeat(70));
    log.title("📚 DOCUMENTACIÓN CRÍTICA");
    console.log("=".repeat(70));

    log.info("• AI_UNIFIED_RULES.md - SINGLE SOURCE OF TRUTH");
    log.info("• ROOT_CLEANUP_SUCCESS_REPORT.md - Estado del repositorio");
    log.info("• docs/development/VHELP_UPDATE_PROCESS.md - Actualizar vhelp");

    console.log(
      `\n${colors.dim}🤖 AI-Friendly: Este comando funciona con cualquier AI (Claude, OpenAI, Gemini)${colors.reset}`
    );
    console.log(`${colors.dim}📍 Ejecutado desde: ${this.projectRoot}${colors.reset}\n`);
  }
}

// Función para mostrar ayuda detallada
function showHelp() {
  const colors = {
    reset: "\x1b[0m",
    cyan: "\x1b[36m",
    yellow: "\x1b[33m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    bold: "\x1b[1m",
    dim: "\x1b[2m",
  };

  console.log(`${colors.cyan}${colors.bold}
🛠️  VHELP Enhanced - Sistema de Ayuda Interactivo
${colors.reset}`);

  console.log(`${colors.yellow}${colors.bold}DESCRIPCIÓN:${colors.reset}
${colors.dim}VHELP es el Command Center oficial de VibeThink Orchestrator con sistema de seguridad integrado.
Proporciona un inventario completo de 60+ comandos clasificados por nivel de riesgo para 
prevenir comandos destructivos accidentales y facilitar el desarrollo AI-friendly.${colors.reset}

${colors.yellow}${colors.bold}USO:${colors.reset}
  npm run vhelp              ${colors.dim}# Mostrar centro de comandos interactivo${colors.reset}
  npm run vhelp:help         ${colors.dim}# Mostrar esta ayuda detallada${colors.reset}
  cat VHELP_COMPLETE_GUIDE.md ${colors.dim}# Documentación completa (400+ líneas)${colors.reset}

${colors.yellow}${colors.bold}CLASIFICACIÓN DE RIESGO:${colors.reset}
  ${colors.green}🟢 SEGUROS (28 comandos)${colors.reset}     ${colors.dim}# Solo lectura, validación, análisis${colors.reset}
  ${colors.yellow}🟡 MODERADOS (8 comandos)${colors.reset}   ${colors.dim}# Modificaciones controladas, builds${colors.reset}  
  ${colors.red}🔴 PELIGROSOS (6 comandos)${colors.reset}   ${colors.dim}# Eliminación archivos, cambios mayores${colors.reset}

${colors.yellow}${colors.bold}CATEGORÍAS DE COMANDOS:${colors.reset}
  ${colors.cyan}🚀 DESARROLLO Y CONSTRUCCIÓN${colors.reset}
    - Servidores de desarrollo (dev:dashboard, dev:admin, etc.)
    - Construcción de aplicaciones (build:all, build:dashboard, etc.)
    - Gestión de procesos (start, kill-node)

  ${colors.cyan}🔍 VALIDACIÓN Y CALIDAD${colors.reset}  
    - 4 Niveles de validación jerarquizada:
      ${colors.green}🟢 NIVEL 1${colors.reset}: validate:quick     ${colors.dim}# Antes de empezar trabajo${colors.reset}
      ${colors.yellow}🟡 NIVEL 2${colors.reset}: validate:universal ${colors.dim}# Antes de commit${colors.reset}
      ${colors.red}🔴 NIVEL 3${colors.reset}: validate:guard     ${colors.dim}# Emergencias/rollback${colors.reset}
      ${colors.cyan}🚀 NIVEL 4${colors.reset}: validate:ecosystem ${colors.dim}# CI/CD completo${colors.reset}
    - Linting y testing (lint, test, type-check)
    - Validaciones especializadas (security, performance, architecture)

  ${colors.cyan}🔧 CORRECCIÓN AUTOMÁTICA${colors.reset}
    - Limpieza de archivos ${colors.red}(PELIGROSO)${colors.reset}: clean, clean:force
    - Corrección de dependencias: fix:deps
    - Instalación: install:all, setup

  ${colors.cyan}🎮 PORT MANAGER - GESTIÓN DE PUERTOS${colors.reset}
    ${colors.green}PUERTOS FIJOS DEL SISTEMA:${colors.reset}
    ┌──────────────┬───────┬─────────────────────────┐
    │ Dashboard    │ 3001  │ npm run dev              │
    │ Admin        │ 3002  │ npm run dev:admin        │
    │ Login        │ 3003  │ npm run dev:login        │
    │ Helpdesk     │ 3004  │ npm run dev:helpdesk     │
    │ Website      │ 3005  │ npm run dev:website      │
    │ Test 🧪      │ 3099  │ npm run dev:test         │
    └──────────────┴───────┴─────────────────────────┘
    - port-check: Ver estado de todos los puertos
    - kill-ports: Liberar todos los puertos ocupados
    - emergency: Recuperación total del sistema

  ${colors.cyan}🤖 COMANDOS AI-ESPECÍFICOS${colors.reset}
    - ai:commit: Commit con validación automática
    - ai:recovery: Recuperación de errores

${colors.yellow}${colors.bold}SISTEMA DE SEGURIDAD:${colors.reset}
  - ${colors.green}Comandos SEGUROS${colors.reset}: Se ejecutan sin restricciones
  - ${colors.yellow}Comandos MODERADOS${colors.reset}: Muestran información antes de ejecutar  
  - ${colors.red}Comandos PELIGROSOS${colors.reset}: Requieren confirmación manual explícita

${colors.yellow}${colors.bold}INTEGRACIÓN AI:${colors.reset}
  - Compatible con todas las IAs: Claude, Gemini, GPT, Cursor
  - Parte del protocolo de saludo universal (AI_UNIVERSAL_STANDARDS.md)
  - Workflow estandarizado para consistencia entre sesiones

${colors.yellow}${colors.bold}COMANDOS ESENCIALES:${colors.reset}
  ${colors.cyan}# 🚀 LEVANTAR SERVIDORES (PUERTOS FIJOS)${colors.reset}
  npm run dev               ${colors.green}# Dashboard en puerto 3001${colors.reset}
  npm run dev:admin         ${colors.green}# Admin en puerto 3002${colors.reset}
  npm run dev:login         ${colors.green}# Login en puerto 3003${colors.reset}
  npm run dev:helpdesk      ${colors.green}# Helpdesk en puerto 3004${colors.reset}
  npm run dev:website       ${colors.green}# Website en puerto 3005${colors.reset}
  npm run dev:test          ${colors.yellow}# 🧪 Puerto 3099 (pruebas aisladas)${colors.reset}
  npm run dev:all           ${colors.cyan}# TODOS los servidores (3001-3004)${colors.reset}

  ${colors.cyan}# 🔍 GESTIÓN Y CONTROL DE PUERTOS${colors.reset}
  npm run port-check        ${colors.green}# Ver qué puertos están ocupados${colors.reset}
  npm run dev:status        ${colors.green}# Estado de todos los servidores${colors.reset}
  npm run quick-start       ${colors.green}# Start inteligente con detección${colors.reset}
  npm run kill-ports        ${colors.yellow}# Liberar todos los puertos${colors.reset}

  ${colors.cyan}# ✨ Workflow Diario${colors.reset}
  npm run validate:quick    ${colors.green}# Validación rápida pre-trabajo${colors.reset}
  npm run validate          ${colors.green}# Validación combinada${colors.reset}
  npm run ai:commit         ${colors.green}# Commit con mensaje automático${colors.reset}

  ${colors.cyan}# Emergencias${colors.reset}
  npm run emergency         ${colors.red}# Recuperación total del sistema${colors.reset}
  npm run clean:force       ${colors.red}# Limpieza + mata procesos${colors.reset}

${colors.yellow}${colors.bold}ARCHIVOS TÉCNICOS:${colors.reset}
  - Configuración: dev-tools/utilities/vhelp-security-config.js
  - Sistema principal: dev-tools/utilities/vhelp-enhanced.cjs
  - Documentación: docs/development/VHELP_SECURITY_SYSTEM.md

${colors.yellow}${colors.bold}VALOR ARQUITECTÓNICO:${colors.reset}
  ✅ Protege inversión en desarrollo (previene pérdida accidental)
  ✅ CMMI-ML3 compliant (documentación automatizada)  
  ✅ Facilita onboarding de desarrolladores y IAs
  ✅ Estandariza workflows entre equipos

${colors.dim}🤖 Sistema AI-Friendly diseñado para colaboración humano-IA óptima
📍 VibeThink Orchestrator - VThink 1.0 Methodology${colors.reset}
`);
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  // Verificar argumentos de línea de comandos
  const args = process.argv.slice(2);

  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
  } else {
    const helper = new VThinkHelperEnhanced();
    helper.run().catch((error) => {
      console.error("Error fatal:", error);
      process.exit(1);
    });
  }
}

module.exports = VThinkHelperEnhanced;
