#!/usr/bin/env node

/**
 * Surgical Nomenclature Fixer - EXTREMO CUIDADO
 * Corrige solo referencias al software, preserva metodología VThink 1.0
 */

const fs = require("fs");
const path = require("path");

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

const log = {
  title: (msg) => console.log(`${colors.cyan}${colors.bold}${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}📋 ${msg}${colors.reset}`),
};

class SurgicalFixer {
  constructor() {
    this.projectRoot = process.cwd();
    this.filesFixed = 0;
    this.violationsFixed = 0;

    // PATRONES QUIRÚRGICOS - Solo software, NUNCA metodología
    this.surgicalPatterns = [
      // En emails de marketing - claramente se refiere al software/plataforma
      {
        pattern: /plataforma VThink(?!\s+1\.0)/g,
        replacement: "plataforma VibeThink",
        context: "platform-reference",
        safe: true,
      },
      {
        pattern: /Con VThink tendrás/g,
        replacement: "Con VibeThink tendrás",
        context: "marketing-copy",
        safe: true,
      },
      {
        pattern: /© \d{4} VThink\./g,
        replacement: (match) => match.replace("VThink", "VibeThink"),
        context: "copyright",
        safe: true,
      },
      // En comentarios sobre UI/componentes (NO metodología)
      {
        pattern: /\* (.+) - VThink ([A-Za-z\s]+)$/gm,
        replacement: (match, description, feature) => {
          // Solo reemplazar si NO es "1.0" (metodología)
          if (
            feature.trim() === "1.0" ||
            feature.includes("1.0") ||
            feature.includes("methodology")
          ) {
            return match; // NO cambiar
          }
          return match.replace("VThink", "VibeThink");
        },
        context: "component-comments",
        safe: true,
      },
      // En UI text que se refiere al software
      {
        pattern: /title.*VThink(?!\s+1\.0)(?!\s+methodology)/g,
        replacement: (match) => match.replace("VThink", "VibeThink"),
        context: "ui-titles",
        safe: true,
      },
      // En configuraciones/constantes que se refieren al software
      {
        pattern: /VThink (Platform|App|Dashboard|System|Software)(?!\s+1\.0)/gi,
        replacement: "VibeThink $1",
        context: "software-constants",
        safe: true,
      },
    ];

    // PATRONES PROHIBIDOS - NUNCA tocar estos
    this.forbiddenPatterns = [
      /VThink\s+1\.0/, // Metodología VThink 1.0
      /VThink\s+methodology/i, // Referencias a metodología
      /VThink.*DOI/, // Principios de diseño
      /VTHINK_METHODOLOGY/, // Constantes de metodología
      /VThink.*framework/i, // Framework metodológico
    ];
  }

  async surgicalFix() {
    log.title("\n🔬 SURGICAL NOMENCLATURE FIXER - EXTREMO CUIDADO");
    log.title("=".repeat(55));
    log.warning("⚠️ MODO QUIRÚRGICO: Solo software, NUNCA metodología\n");

    try {
      const violatingFiles = await this.getViolatingFiles();

      if (violatingFiles.length === 0) {
        log.info("✅ No se encontraron violaciones quirúrgicas");
        return;
      }

      log.info(`🔍 Archivos a procesar: ${violatingFiles.length}\n`);

      for (const file of violatingFiles) {
        await this.processFileSurgically(file);
      }

      this.printSummary();
    } catch (error) {
      log.error(`Error durante corrección quirúrgica: ${error.message}`);
      process.exit(1);
    }
  }

  async getViolatingFiles() {
    const codeFiles = this.getCodeFiles();
    const violatingFiles = [];

    for (const file of codeFiles) {
      if (this.isMethodologyFile(file)) {
        continue; // Saltar archivos de metodología completamente
      }

      try {
        const content = fs.readFileSync(file, "utf8");
        if (this.hasSafeViolations(content)) {
          violatingFiles.push(file);
        }
      } catch (error) {
        // Ignorar archivos que no se pueden leer
      }
    }

    return violatingFiles;
  }

  hasSafeViolations(content) {
    // Verificar si tiene violaciones que NO sean metodología
    const vthinkMatches = content.match(/VThink/g) || [];

    if (vthinkMatches.length === 0) return false;

    // Verificar si todas las ocurrencias son metodología (prohibidas de cambiar)
    for (const forbidden of this.forbiddenPatterns) {
      if (forbidden.test(content)) {
        // Si tiene patrones prohibidos, analizar más cuidadosamente
        const lines = content.split("\n");
        for (const line of lines) {
          if (line.includes("VThink") && !this.isMethodologyLine(line)) {
            return true; // Tiene violaciones seguras para corregir
          }
        }
      }
    }

    // Si no tiene patrones prohibidos, es seguro procesar
    return vthinkMatches.length > 0;
  }

  isMethodologyLine(line) {
    const methodologyKeywords = [
      "VThink 1.0",
      "VThink methodology",
      "VTHINK_METHODOLOGY",
      "VThink DOI",
      "VThink framework",
    ];

    return methodologyKeywords.some((keyword) =>
      line.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  async processFileSurgically(file) {
    try {
      let content = fs.readFileSync(file, "utf8");
      const originalContent = content;
      let fileViolationsFixed = 0;

      // Aplicar cada patrón quirúrgico con extremo cuidado
      for (const pattern of this.surgicalPatterns) {
        const beforeContent = content;

        if (typeof pattern.replacement === "function") {
          content = content.replace(pattern.pattern, pattern.replacement);
        } else {
          content = content.replace(pattern.pattern, pattern.replacement);
        }

        if (content !== beforeContent) {
          const matches = beforeContent.match(pattern.pattern) || [];
          fileViolationsFixed += matches.length;
        }
      }

      // Solo escribir si hubo cambios
      if (content !== originalContent) {
        // VERIFICACIÓN FINAL DE SEGURIDAD
        if (this.isSafeToWrite(originalContent, content)) {
          fs.writeFileSync(file, content, "utf8");
          this.filesFixed++;
          this.violationsFixed += fileViolationsFixed;

          const relativePath = path.relative(this.projectRoot, file);
          log.success(`${relativePath}: ${fileViolationsFixed} correcciones quirúrgicas`);
        } else {
          log.warning(
            `SALTADO ${path.relative(this.projectRoot, file)}: Cambio riesgoso detectado`
          );
        }
      }
    } catch (error) {
      log.error(`Error procesando ${file}: ${error.message}`);
    }
  }

  isSafeToWrite(original, modified) {
    // Verificar que no se haya tocado metodología accidentalmente
    const originalMethodology = (original.match(/VThink\s+1\.0/g) || []).length;
    const modifiedMethodology = (modified.match(/VThink\s+1\.0/g) || []).length;

    if (originalMethodology !== modifiedMethodology) {
      log.error("🚨 DETECTADO: Cambio en referencias metodológicas - ABORTANDO");
      return false;
    }

    // Verificar otros patrones críticos
    for (const forbidden of this.forbiddenPatterns) {
      const originalCount = (original.match(forbidden) || []).length;
      const modifiedCount = (modified.match(forbidden) || []).length;

      if (originalCount !== modifiedCount) {
        log.error("🚨 DETECTADO: Cambio en patrón prohibido - ABORTANDO");
        return false;
      }
    }

    return true; // Seguro para escribir
  }

  getCodeFiles() {
    const files = [];
    const searchDirs = ["apps/", "src/", "dev-tools/"];

    for (const dir of searchDirs) {
      const fullPath = path.join(this.projectRoot, dir);
      if (fs.existsSync(fullPath)) {
        this.traverseDirectory(fullPath, files);
      }
    }

    return files;
  }

  traverseDirectory(dir, files) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !item.startsWith(".") && item !== "node_modules") {
        this.traverseDirectory(fullPath, files);
      } else if (stat.isFile()) {
        const ext = path.extname(fullPath);
        if ([".ts", ".tsx", ".js", ".jsx"].includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }

  isMethodologyFile(file) {
    const methodologyPaths = [
      "VTHINK_METHODOLOGY_LAW.md",
      "AI_UNIVERSAL_STANDARDS.md",
      "CLAUDE.md",
      "VThink-1.0/",
      "methodology/",
      "MULTILANG_VALIDATION_RULES.md",
    ];

    return methodologyPaths.some((pattern) => file.includes(pattern));
  }

  printSummary() {
    log.title("\n📊 RESUMEN QUIRÚRGICO");
    log.title("=".repeat(25));
    log.info(`Archivos procesados: ${this.filesFixed}`);
    log.info(`Violaciones quirúrgicas corregidas: ${this.violationsFixed}`);

    if (this.violationsFixed > 0) {
      log.success(`\n✅ Corrección quirúrgica completada: ${this.violationsFixed} correcciones`);
      log.warning("🔬 Todas las correcciones preservaron la metodología VThink 1.0");
      log.info('💡 Ejecuta "npm run validate:multilang" para verificar');
    } else {
      log.info("\nℹ️ No se realizaron correcciones quirúrgicas");
    }
  }
}

// Ejecutar
if (require.main === module) {
  const fixer = new SurgicalFixer();
  fixer.surgicalFix().catch((error) => {
    log.error(`Error fatal: ${error.message}`);
    process.exit(1);
  });
}

module.exports = SurgicalFixer;
