#!/usr/bin/env node

/**
 * Fix Nomenclature Violations - VibeThink Orchestrator
 * Corrige automáticamente las 427 violaciones de nomenclatura VThink
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Colores para output
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

class NomenclatureFixer {
  constructor() {
    this.projectRoot = process.cwd();
    this.filesFixed = 0;
    this.violationsFixed = 0;
    this.skippedFiles = 0;

    // Patrones específicos y seguros - enfocados en software/UI
    this.replacementPatterns = [
      // Nombres de marcas/software
      {
        pattern: /VThink Orchestrator/g,
        replacement: "VibeThink Orchestrator",
        context: "brand-name",
      },
      {
        pattern: /VThink Dashboard/g,
        replacement: "VibeThink Dashboard",
        context: "app-name",
      },
      {
        pattern: /VThink Team/g,
        replacement: "VibeThink Team",
        context: "brand-team",
      },
      // En código: tipos y interfaces (claramente software)
      {
        pattern: /VThinkCalendarEvent/g,
        replacement: "VibeThinkCalendarEvent",
        context: "type-definition",
      },
      {
        pattern: /VThinkThemeProvider/g,
        replacement: "VibeThinkThemeProvider",
        context: "component-name",
      },
      // En strings y títulos de UI
      {
        pattern: /"VThink"/g,
        replacement: '"VibeThink"',
        context: "quoted-brand",
      },
      {
        pattern: /'VThink'/g,
        replacement: "'VibeThink'",
        context: "quoted-brand-single",
      },
      // Comentarios sobre características del software (no metodología)
      {
        pattern: /VThink DOI principle/g,
        replacement: "VibeThink DOI principle",
        context: "software-feature",
      },
      {
        pattern: /VThink sidebar/g,
        replacement: "VibeThink sidebar",
        context: "ui-feature",
      },
      {
        pattern: /VThink innovations/g,
        replacement: "VibeThink innovations",
        context: "software-innovation",
      },
      {
        pattern: /VThink features/g,
        replacement: "VibeThink features",
        context: "software-features",
      },
      // Casos más agresivos pero seguros (no metodología)
      {
        pattern: /\* VThink ([A-Z][a-zA-Z\s]+)/g,
        replacement: "* VibeThink $1",
        context: "comment-software",
      },
      {
        pattern: /\/\/ VThink ([a-zA-Z\s]+)/g,
        replacement: "// VibeThink $1",
        context: "inline-comment",
      },
      {
        pattern: /VThink (user|platform|system|app|application|software|tool)/gi,
        replacement: "VibeThink $1",
        context: "software-references",
      },
    ];

    // Archivos que deben mantener "VThink" (metodología)
    this.methodologyFiles = [
      "VTHINK_METHODOLOGY_LAW.md",
      "AI_UNIVERSAL_STANDARDS.md",
      "CLAUDE.md",
      "VThink-1.0/",
      "methodology/",
      "MULTILANG_VALIDATION_RULES.md",
    ];

    // Extensiones de archivos a procesar
    this.codeExtensions = [".ts", ".tsx", ".js", ".jsx", ".vue", ".svelte"];
  }

  async fixViolations() {
    log.title("\n🔧 NOMENCLATURE VIOLATIONS FIXER - VibeThink Orchestrator");
    log.title("=".repeat(60));
    log.info("🔧 EJECUTANDO CORRECCIONES DE NOMENCLATURA\n");

    try {
      // 1. Obtener lista de archivos con violaciones
      const violatingFiles = await this.getViolatingFiles();

      if (violatingFiles.length === 0) {
        log.info("✅ No se encontraron archivos con violaciones");
        return;
      }

      // 2. Procesar cada archivo
      log.title("\n📋 CORRIGIENDO ARCHIVOS:");
      log.title("=".repeat(30));

      for (const file of violatingFiles) {
        await this.fixFile(file);
      }

      // 3. Validar resultado
      await this.validateResult();

      this.printSummary();
    } catch (error) {
      log.error(`Error durante preview: ${error.message}`);
      process.exit(1);
    }
  }

  async getViolatingFiles() {
    log.info("🔍 Identificando archivos con violaciones...");

    const codeFiles = this.getCodeFiles();
    const violatingFiles = [];

    for (const file of codeFiles) {
      if (this.isMethodologyFile(file)) {
        continue; // Saltar archivos de metodología
      }

      try {
        const content = fs.readFileSync(file, "utf8");
        const violations = this.countViolations(content);

        if (violations > 0) {
          violatingFiles.push(file);
        }
      } catch (error) {
        log.warning(`No se pudo leer ${file}: ${error.message}`);
      }
    }

    log.info(`📊 Encontrados ${violatingFiles.length} archivos con violaciones`);
    return violatingFiles;
  }

  getCodeFiles() {
    const files = [];

    const searchDirs = ["apps/", "src/", "dev-tools/", "tests/"];

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

      if (stat.isDirectory()) {
        // Saltar directorios de node_modules, .git, etc.
        if (!item.startsWith(".") && item !== "node_modules") {
          this.traverseDirectory(fullPath, files);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(fullPath);
        if (this.codeExtensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }

  isMethodologyFile(file) {
    return this.methodologyFiles.some((pattern) => file.includes(pattern));
  }

  countViolations(content) {
    // Contar "VThink" que NO sea metodología
    const vthinkMatches = content.match(/VThink(?!\s+1\.0)(?!\s+methodology)/g) || [];
    return vthinkMatches.length;
  }

  async previewFile(file) {
    try {
      const content = fs.readFileSync(file, "utf8");
      const originalViolations = this.countViolations(content);

      if (originalViolations === 0) {
        return;
      }

      const relativePath = path.relative(this.projectRoot, file);
      log.info(`\n📄 ${relativePath} (${originalViolations} violaciones):`);

      // Mostrar líneas problemáticas
      const lines = content.split("\n");
      lines.forEach((line, index) => {
        if (line.match(/VThink(?!\s+1\.0)(?!\s+methodology)/g)) {
          const lineNum = index + 1;
          const preview = line.length > 80 ? line.substring(0, 77) + "..." : line;
          console.log(`  ${colors.yellow}L${lineNum}:${colors.reset} ${preview}`);

          // Mostrar cómo quedaría después del cambio
          let fixed = line;
          for (const pattern of this.replacementPatterns) {
            if (typeof pattern.replacement === "function") {
              fixed = fixed.replace(pattern.pattern, pattern.replacement);
            } else {
              fixed = fixed.replace(pattern.pattern, pattern.replacement);
            }
          }

          if (fixed !== line) {
            const fixedPreview = fixed.length > 80 ? fixed.substring(0, 77) + "..." : fixed;
            console.log(`  ${colors.green}→${colors.reset} ${fixedPreview}`);
          }
        }
      });
    } catch (error) {
      log.warning(`No se pudo preview ${file}: ${error.message}`);
    }
  }

  async fixFile(file) {
    try {
      let content = fs.readFileSync(file, "utf8");
      const originalViolations = this.countViolations(content);

      if (originalViolations === 0) {
        return;
      }

      let modified = false;

      // Aplicar patrones de reemplazo
      for (const pattern of this.replacementPatterns) {
        if (typeof pattern.replacement === "function") {
          const newContent = content.replace(pattern.pattern, pattern.replacement);
          if (newContent !== content) {
            content = newContent;
            modified = true;
          }
        } else {
          const newContent = content.replace(pattern.pattern, pattern.replacement);
          if (newContent !== content) {
            content = newContent;
            modified = true;
          }
        }
      }

      if (modified) {
        // Escribir archivo corregido
        fs.writeFileSync(file, content, "utf8");

        const newViolations = this.countViolations(content);
        const fixed = originalViolations - newViolations;

        this.filesFixed++;
        this.violationsFixed += fixed;

        const relativePath = path.relative(this.projectRoot, file);
        log.success(`${relativePath}: ${fixed} violaciones corregidas`);
      }
    } catch (error) {
      log.error(`Error procesando ${file}: ${error.message}`);
      this.skippedFiles++;
    }
  }

  async validateResult() {
    log.info("\n🔍 Validando resultado...");

    try {
      const result = execSync("npm run validate:multilang", {
        encoding: "utf8",
        stdio: "pipe",
      });

      if (result.includes("PASSED") || !result.includes("violaciones de nomenclatura VThink")) {
        log.success("✅ Validación exitosa - Violaciones de nomenclatura corregidas");
      } else {
        log.warning("⚠️ Algunas violaciones pueden persistir");
      }
    } catch (error) {
      // El comando puede fallar pero queremos ver el output
      if (error.stdout && !error.stdout.includes("violaciones de nomenclatura VThink")) {
        log.success("✅ Violaciones de nomenclatura corregidas");
      } else {
        log.warning("⚠️ Validar manualmente el resultado");
      }
    }
  }

  printSummary() {
    log.title("\n📊 RESUMEN DE CORRECCIONES");
    log.title("=".repeat(40));
    log.info(`Archivos procesados: ${this.filesFixed}`);
    log.info(`Violaciones corregidas: ${this.violationsFixed}`);
    log.info(`Archivos omitidos: ${this.skippedFiles}`);

    if (this.violationsFixed > 0) {
      log.success(`\n✅ Corrección completada: ${this.violationsFixed} violaciones eliminadas`);
      log.info('💡 Ejecuta "npm run validate:universal" para verificar el estado completo');
    } else {
      log.warning("\n⚠️ No se encontraron violaciones para corregir");
    }
  }
}

// Ejecutar
if (require.main === module) {
  const fixer = new NomenclatureFixer();
  fixer.fixViolations().catch((error) => {
    log.error(`Error fatal: ${error.message}`);
    process.exit(1);
  });
}

module.exports = NomenclatureFixer;
