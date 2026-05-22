#!/usr/bin/env node

/**
 * MULTILANG VALIDATOR - VibeThink Orchestrator
 * ================================
 *
 * Validador universal para verificar:
 * - Completitud de traducciones
 * - Uso correcto de i18n en componentes
 * - Consistencia de keys entre idiomas
 * - Headers y componentes UI multilang ready
 */

const fs = require("fs");
const path = require("path");

// Colores para output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

const log = {
  title: (msg) => console.log(`${colors.cyan}${colors.bold}${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}📋 ${msg}${colors.reset}`),
  stat: (msg) => console.log(`${colors.magenta}📊 ${msg}${colors.reset}`),
};

class MultilangValidator {
  constructor() {
    this.localesPath = "src/locales";
    this.srcPath = "src";
    this.appsPath = "apps";

    this.results = {
      successes: [],
      warnings: [],
      errors: [],
      stats: {
        translationFiles: 0,
        totalKeys: 0,
        hardcodedStrings: 0,
        i18nComponents: 0,
        nonI18nComponents: 0,
        nomenclatureViolations: 0,
      },
    };
  }

  async validate() {
    log.title("🌍 MULTILANG VALIDATOR - VibeThink Orchestrator");
    log.title("=============================================\n");

    try {
      await this.validateNomenclature();
      await this.validateTranslationFiles();
      await this.validateKeyConsistency();
      await this.scanHardcodedStrings();
      await this.validateI18nUsage();

      this.generateReport();
      return this.results.errors.length === 0;
    } catch (error) {
      log.error(`Error en validación: ${error.message}`);
      return false;
    }
  }

  async validateNomenclature() {
    log.info("🔍 Validando nomenclatura VThink vs VibeThink Orchestrator...");

    const codeFiles = this.getCodeFiles();
    let totalViolations = 0;

    // Patrones prohibidos en código
    const prohibitedPatterns = [
      /VThink(?!\s+(1\.0|methodology|standards))/g, // VThink sin excepciones documentales
      /vthink(?!-orchestrator)/gi, // vthink sin el sufijo correcto
      /class\s+VThink/g, // Clases con VThink
      /const\s+vthink/g, // Variables con vthink
      /function\s+vthink/gi, // Funciones con vthink
    ];

    for (const file of codeFiles) {
      const content = fs.readFileSync(file, "utf8");
      let fileViolations = 0;

      // Verificar si es documentación (permitir VThink 1.0)
      const isDocumentation =
        /\.(md|txt|rst)$/.test(file) ||
        content.includes("* @fileoverview") ||
        (content.includes("/**") && content.includes("methodology"));

      if (!isDocumentation) {
        for (const pattern of prohibitedPatterns) {
          const matches = content.match(pattern);
          if (matches) {
            fileViolations += matches.length;
          }
        }

        if (fileViolations > 0) {
          this.results.errors.push(
            `${path.relative(process.cwd(), file)}: ${fileViolations} violaciones de nomenclatura VThink`
          );
          totalViolations += fileViolations;
        }
      }
    }

    this.results.stats.nomenclatureViolations = totalViolations;

    if (totalViolations === 0) {
      this.results.successes.push("Nomenclatura VThink vs VibeThink Orchestrator: OK");
    } else {
      this.results.errors.push(`Total violaciones nomenclatura: ${totalViolations} - CRÍTICO`);
    }
  }

  getCodeFiles() {
    const files = [];

    // Función recursiva para buscar archivos
    const walkDir = (dir) => {
      if (!fs.existsSync(dir)) return;

      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          // Evitar node_modules, .next, .git
          if (!item.startsWith(".") && !["node_modules", "dist", "build"].includes(item)) {
            walkDir(fullPath);
          }
        } else if (/\.(tsx|jsx|ts|js)$/.test(item)) {
          files.push(fullPath);
        }
      }
    };

    // Buscar en directorios principales
    ["src", "apps"].forEach((dir) => {
      if (fs.existsSync(dir)) {
        walkDir(dir);
      }
    });

    return files;
  }

  async validateTranslationFiles() {
    log.info("🔍 Verificando archivos de traducción...");

    if (!fs.existsSync(this.localesPath)) {
      this.results.errors.push("Directorio src/locales no existe");
      return;
    }

    const translationFiles = fs
      .readdirSync(this.localesPath)
      .filter((file) => file.endsWith(".json"));

    if (translationFiles.length === 0) {
      this.results.errors.push("No se encontraron archivos de traducción");
      return;
    }

    this.results.stats.translationFiles = translationFiles.length;

    const translations = {};
    for (const file of translationFiles) {
      const lang = path.basename(file, ".json");
      const content = JSON.parse(fs.readFileSync(path.join(this.localesPath, file), "utf8"));
      translations[lang] = content;
    }

    // Validar idiomas mínimos requeridos
    const requiredLangs = ["es", "en"];
    const missingLangs = requiredLangs.filter((lang) => !translations[lang]);

    if (missingLangs.length > 0) {
      this.results.errors.push(`Idiomas faltantes: ${missingLangs.join(", ")}`);
    } else {
      this.results.successes.push(`Idiomas requeridos presentes: ${requiredLangs.join(", ")}`);
    }

    // Contar keys totales
    if (translations.es) {
      this.results.stats.totalKeys = this.countKeys(translations.es);
    }

    this.translations = translations;
  }

  countKeys(obj, prefix = "") {
    let count = 0;
    for (const key in obj) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        count += this.countKeys(obj[key], `${prefix}${key}.`);
      } else {
        count++;
      }
    }
    return count;
  }

  async validateKeyConsistency() {
    log.info("🔍 Verificando consistencia de keys...");

    if (!this.translations || Object.keys(this.translations).length < 2) {
      this.results.warnings.push("No hay suficientes idiomas para comparar consistencia");
      return;
    }

    const languages = Object.keys(this.translations);
    const baseKeys = this.getKeysFlat(this.translations[languages[0]]);

    let inconsistentKeys = 0;

    for (let i = 1; i < languages.length; i++) {
      const currentKeys = this.getKeysFlat(this.translations[languages[i]]);
      const missing = baseKeys.filter((key) => !currentKeys.includes(key));
      const extra = currentKeys.filter((key) => !baseKeys.includes(key));

      if (missing.length > 0) {
        this.results.warnings.push(
          `${languages[i]} faltante keys: ${missing.slice(0, 5).join(", ")}${missing.length > 5 ? "..." : ""}`
        );
        inconsistentKeys += missing.length;
      }

      if (extra.length > 0) {
        this.results.warnings.push(
          `${languages[i]} keys extra: ${extra.slice(0, 5).join(", ")}${extra.length > 5 ? "..." : ""}`
        );
        inconsistentKeys += extra.length;
      }
    }

    if (inconsistentKeys === 0) {
      this.results.successes.push("Consistencia de keys entre idiomas: OK");
    }
  }

  getKeysFlat(obj, prefix = "") {
    const keys = [];
    for (const key in obj) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        keys.push(...this.getKeysFlat(obj[key], `${prefix}${key}.`));
      } else {
        keys.push(`${prefix}${key}`);
      }
    }
    return keys;
  }

  async scanHardcodedStrings() {
    log.info("🔍 Escaneando strings hardcodeados...");

    const patterns = [
      // Patrones de strings hardcodeados en JSX
      /placeholder=["']([^"']+)["']/g,
      /title=["']([^"']+)["']/g,
      />([A-Z][^<>{]*[a-z][^<>{}]*)</g, // Texto en JSX
      /aria-label=["']([^"']+)["']/g,
    ];

    const componentFiles = this.getComponentFiles();
    let totalHardcoded = 0;

    for (const file of componentFiles) {
      const content = fs.readFileSync(file, "utf8");

      // Verificar si usa i18n
      const hasI18n = /useTranslation|t\(|i18n/.test(content);

      if (hasI18n) {
        this.results.stats.i18nComponents++;
      } else {
        this.results.stats.nonI18nComponents++;
      }

      // Buscar strings hardcodeados
      let fileHardcoded = 0;
      for (const pattern of patterns) {
        const matches = content.match(pattern);
        if (matches) {
          fileHardcoded += matches.length;
        }
      }

      if (fileHardcoded > 3) {
        // Threshold para reportar
        this.results.warnings.push(
          `${path.relative(process.cwd(), file)}: ${fileHardcoded} strings hardcodeados`
        );
      }

      totalHardcoded += fileHardcoded;
    }

    this.results.stats.hardcodedStrings = totalHardcoded;

    if (totalHardcoded > 100) {
      this.results.warnings.push(`Alto número de strings hardcodeados: ${totalHardcoded}`);
    }
  }

  getComponentFiles() {
    const files = [];

    // Función recursiva para buscar archivos
    const walkDir = (dir) => {
      if (!fs.existsSync(dir)) return;

      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          // Evitar node_modules y .next
          if (!item.startsWith(".") && item !== "node_modules") {
            walkDir(fullPath);
          }
        } else if (/\.(tsx|jsx)$/.test(item)) {
          files.push(fullPath);
        }
      }
    };

    // Buscar en directorios principales
    ["src", "apps"].forEach((dir) => {
      if (fs.existsSync(dir)) {
        walkDir(dir);
      }
    });

    return files;
  }

  async validateI18nUsage() {
    log.info("🔍 Validando uso de i18n...");

    // Verificar archivos de configuración i18n
    const i18nConfigs = [
      "src/i18n/index.ts",
      "src/lib/i18n.ts",
      "i18n.config.js",
      "next-i18next.config.js",
    ];

    const hasI18nConfig = i18nConfigs.some((config) => fs.existsSync(config));

    if (!hasI18nConfig) {
      this.results.warnings.push("No se encontró configuración de i18n");
    } else {
      this.results.successes.push("Configuración i18n encontrada");
    }

    // Validar header específicamente
    const headerFile = "src/shared/components/bundui-premium/components/layout/header/index.tsx";
    if (fs.existsSync(headerFile)) {
      const content = fs.readFileSync(headerFile, "utf8");
      const hasI18n = /useTranslation|t\(/.test(content);

      if (hasI18n) {
        this.results.successes.push("Header usa i18n correctamente");
      } else {
        this.results.warnings.push("Header no usa i18n - strings hardcodeados");
      }
    }
  }

  generateReport() {
    log.title("\n📊 REPORTE MULTILANG");
    log.title("===================\n");

    // Estadísticas
    log.stat(`Violaciones nomenclatura VThink: ${this.results.stats.nomenclatureViolations}`);
    log.stat(`Archivos de traducción: ${this.results.stats.translationFiles}`);
    log.stat(`Keys de traducción: ${this.results.stats.totalKeys}`);
    log.stat(`Componentes con i18n: ${this.results.stats.i18nComponents}`);
    log.stat(`Componentes sin i18n: ${this.results.stats.nonI18nComponents}`);
    log.stat(`Strings hardcodeados: ${this.results.stats.hardcodedStrings}`);

    // Éxitos
    if (this.results.successes.length > 0) {
      log.title("\n✅ ÉXITOS:");
      this.results.successes.forEach((success) => log.success(success));
    }

    // Advertencias
    if (this.results.warnings.length > 0) {
      log.title("\n⚠️ ADVERTENCIAS:");
      this.results.warnings.slice(0, 10).forEach((warning) => log.warning(warning));
      if (this.results.warnings.length > 10) {
        log.warning(`... y ${this.results.warnings.length - 10} advertencias más`);
      }
    }

    // Errores
    if (this.results.errors.length > 0) {
      log.title("\n❌ ERRORES:");
      this.results.errors.forEach((error) => log.error(error));
    }

    // Resultado final
    const totalIssues = this.results.errors.length + this.results.warnings.length;
    log.title("\n🎯 RESULTADO FINAL");
    log.title("==================");

    if (this.results.errors.length === 0) {
      if (this.results.warnings.length === 0) {
        log.success("✅ MULTILANG VALIDATION: PASSED - Sistema completamente multilang");
      } else {
        log.warning("⚠️ MULTILANG VALIDATION: WARNING - Sistema funcional con mejoras pendientes");
      }
    } else {
      log.error("❌ MULTILANG VALIDATION: FAILED - Errores críticos detectados");
    }

    log.stat(
      `Total issues: ${totalIssues} (${this.results.errors.length} errores, ${this.results.warnings.length} advertencias)`
    );
  }
}

// Ejecutar validador
if (require.main === module) {
  const validator = new MultilangValidator();
  validator.validate().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = MultilangValidator;
