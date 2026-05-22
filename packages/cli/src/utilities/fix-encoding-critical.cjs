#!/usr/bin/env node

/**
 * Script para corregir encoding de archivos críticos
 * VThink Methodology 1.0 - XTP v4.6
 *
 * Este script corrige automáticamente el encoding de archivos críticos
 * que están causando errores de compilación en el proyecto.
 */

const fs = require("fs");
const path = require("path");

// Archivos críticos que necesitan corrección inmediata
const criticalFiles = [
  "src/components/helpdesk/SupportTicketCard.tsx",
  "src/components/ui/AccessibleComponent.tsx",
  "src/components/ui/CurrencySelector.tsx",
  "src/components/ui/LanguageSelector.tsx",
  "src/apps/helpdesk/components/SupportTicketCard.tsx",
  "src/apps/admin/components/CompanyThemeConfigurator.tsx",
  "scripts/wcag-testing.js",
  "scripts/validate_complete_system.py",
  "scripts/simple-test.js",
  "scripts/setup_cmmi_system.py",
  "docs/VTK_METHODOLOGY/05_BEST_PRACTICES/AI_INTEGRATION_STANDARDS.md",
  "docs/user-documentation/USER_GUIDE_FINAL.md",
  "docs/templates/FAQ_TEMPLATE.md",
  "docs/STRATEGIC_PENDING_TASKS.md",
  "docs/STACK_VALIDATION_ANALYSIS.md",
  "docs/ROADMAP_MANAGEMENT_SYSTEM.md",
  "docs/MY_PENDING_TASKS_SUMMARY.md",
  "docs/MARKDOWN_RELATIONSHIP_TABLE.md",
  "docs/FINAL_IMPLEMENTATION_SUMMARY.md",
  "docs/ECOSYSTEM_LIVING_RULE.md",
  "docs/DECISION_LOG.md",
  "docs/methodology/XTR_USER_STORIES_SUMMARY.md",
  "docs/methodology/XTR_USER_STORIES_AND_FAQS_METHODOLOGY.md",
  "docs/methodology/VTK_METHODOLOGY.md",
  "docs/methodology/VALIDATION_QUICK_CHECK.md",
  "docs/methodology/XTP/XTP_METHODOLOGY.md",
  "docs/methodology/VThink/historia/VTK_METHODOLOGY.md",
  "docs/methodology/templates/xtr-story-template.md",
  "docs/methodology/CMMI/CMMI_V3_FRAMEWORK.md",
  "docs/user-documentation/USER_GUIDE_FINAL.md",
  "docs/legacy/session-logs.txt",
  "docs/knowledge-base/README.md",
  "docs/knowledge-base/features/universal-tagging-system-faq.md",
  "docs/knowledge-base/features/plastics-company-faq.md",
  "docs/knowledge-base/features/plastics-company-executive-summary.md",
  "docs/knowledge-base/features/plastics-company-analysis.md",
  "docs/knowledge-base/architecture/wcag-implementation-faq.md",
  "docs/knowledge-base/architecture/universal-enterprise-faq.md",
  "docs/knowledge-base/architecture/universal-enterprise-executive-summary.md",
  "docs/knowledge-base/architecture/universal-enterprise-analysis.md",
  "docs/knowledge-base/architecture/universal-architecture-practices.md",
  "docs/knowledge-base/architecture/system-philosophy.md",
  "docs/knowledge-base/architecture/session-2025-06-22-summary.md",
  "docs/knowledge-base/architecture/missing-components-analysis.md",
  "docs/knowledge-base/architecture/faq-index.md",
  "docs/knowledge-base/architecture/accessibility-governance-faq.md",
  "docs/INDUSTRY_STACKS/UNIVERSAL_FRAMEWORK.md",
  "docs/INDUSTRY_STACKS/RESTAURANT_STACK.md",
  "docs/INDUSTRY_STACKS/README.md",
  "docs/INDUSTRY_STACKS/QUICK_CONFIGURATION_SYSTEM.md",
  "docs/INDUSTRY_STACKS/INTEGRATION_ECOSYSTEM.md",
  "docs/INDUSTRY_STACKS/INTEGRATION_CASE_STUDY_LAPETITE.md",
  "docs/INDUSTRY_STACKS/INDUSTRY_PROTOCOL.md",
  "docs/INDUSTRY_STACKS/IMPLEMENTATION_ROADMAP.md",
  "docs/INDUSTRY_STACKS/EXECUTIVE_SUMMARY.md",
  "docs/ideas/backlog/STRATEGIC_IDEAS_V1.md",
  "docs/foundation/UNIFIED_VISION.md",
  "docs/foundation/faqs/universal/006-users-enterprises-plans.md",
  "docs/features/UI_UX_STACK_REFERENCE.md",
  "docs/features/SESSION_CLOSURE_SUMMARY.md",
  "docs/features/SESSION_CLOSURE_EXECUTIVE_SUMMARY.md",
  "docs/features/PARAMETRIC_PERMISSION_SYSTEM.md",
  "docs/features/INTERNATIONALIZATION.md",
  "docs/features/HYBRID_ARCHITECTURE_CASES.md",
  "docs/features/DEPARTMENT_ROLES_SYSTEM_COMPLETE.md",
  "docs/features/ACCOUNTING_ASSISTANT_INTERNATIONAL_ARCHITECTURE.md",
  "docs/features/ACCOUNTING_ASSISTANT_ADDITIONAL_OPTIONS.md",
  "docs/evaluations/STACK_EVALUATION_FRAMEWORK.md",
  "docs/evaluations/security-assessment-2025-01-22.md",
  "docs/evaluations/PIM_WORKSPACE_VALIDATION_SUMMARY.md",
  "docs/evaluations/PIM_WORKSPACE_STRUCTURE_ANALYSIS.md",
  "docs/evaluations/PIM_OPENSOURCE_ANALYSIS.md",
  "docs/evaluations/PIM_MARKET_ANALYSIS_PROCAPS.md",
  "docs/evaluations/PIM_IMPLEMENTATION_STRATEGY.md",
  "docs/evaluations/PIMCORE_COMMUNITY_LIMITATIONS.md",
  "docs/evaluations/MULTI_LEVEL_DEVELOPMENT_COST_ANALYSIS.md",
  "docs/evaluations/ecommerce-evaluation-strategy.md",
  "docs/development/WCAG_DEVELOPMENT_STANDARD.md",
  "docs/development/TAGGING_IMPLEMENTATION_EXAMPLE.md",
  "docs/development/TAGGING_BEST_PRACTICES.md",
  "docs/development/INTERFACE_ACCESSIBILITY_GOVERNANCE.md",
  "docs/development/DOCUMENTATION_CATEGORIZATION_ANALYSIS.md",
  "docs/development/COMMANDXTR_UNIFIED_SYNTAX.md",
  "docs/development/COMMANDXTR_PAUSE_NOTICE.md",
  "docs/development/COMMANDXTR_ALL_MODIFIER.md",
  "docs/development/ACCESSIBILITY_FRAMEWORK_INTEGRATION.md",
  "docs/components/FORMS_UNIFIED_SYSTEM.md",
  "dashboard/cmmi_dashboard.html",
  ".cursor/rules.md",
];

/**
 * Detecta el encoding de un archivo
 */
function detectEncoding(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);

    // Detectar BOM (Byte Order Mark)
    if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
      return "UTF-8-BOM";
    }
    if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
      return "UTF-16LE";
    }
    if (buffer.length >= 2 && buffer[0] === 0xfe && buffer[1] === 0xff) {
      return "UTF-16BE";
    }
    if (
      buffer.length >= 4 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xfe &&
      buffer[2] === 0x00 &&
      buffer[3] === 0x00
    ) {
      return "UTF-32LE";
    }
    if (
      buffer.length >= 4 &&
      buffer[0] === 0x00 &&
      buffer[1] === 0x00 &&
      buffer[2] === 0xfe &&
      buffer[3] === 0xff
    ) {
      return "UTF-32BE";
    }

    // Intentar detectar encoding por contenido
    const content = buffer.toString("utf8");
    if (content.includes("")) {
      return "ISO-8859-1";
    }

    return "UTF-8";
  } catch (error) {
    console.error(`Error detectando encoding de ${filePath}:`, error.message);
    return "UNKNOWN";
  }
}

/**
 * Convierte un archivo a UTF-8
 */
function convertToUTF8(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Archivo no encontrado: ${filePath}`);
      return false;
    }

    const encoding = detectEncoding(filePath);
    console.log(`📁 ${filePath} (${encoding})`);

    if (encoding === "UTF-8") {
      console.log(`✅ Ya está en UTF-8: ${filePath}`);
      return true;
    }

    // Leer el archivo con el encoding detectado
    let content;
    try {
      if (encoding === "UTF-16LE") {
        content = fs.readFileSync(filePath, "utf16le");
      } else if (encoding === "UTF-16BE") {
        content = fs.readFileSync(filePath, "utf16be");
      } else if (encoding === "UTF-32LE") {
        content = fs.readFileSync(filePath, "utf32le");
      } else if (encoding === "UTF-32BE") {
        content = fs.readFileSync(filePath, "utf32be");
      } else if (encoding === "ISO-8859-1") {
        content = fs.readFileSync(filePath, "latin1");
      } else {
        content = fs.readFileSync(filePath, "utf8");
      }
    } catch (readError) {
      console.error(`❌ Error leyendo ${filePath}:`, readError.message);
      return false;
    }

    // Crear backup
    const backupPath = `${filePath}.backup-${Date.now()}`;
    fs.writeFileSync(backupPath, content, "utf8");
    console.log(`💾 Backup creado: ${backupPath}`);

    // Escribir en UTF-8
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`✅ Convertido a UTF-8: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error convirtiendo ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Función principal
 */
function main() {
  console.log("🚀 Iniciando corrección de encoding de archivos críticos...\n");
  console.log("📋 VThink Methodology 1.0 - XTP v4.6\n");

  let successCount = 0;
  let errorCount = 0;

  for (const filePath of criticalFiles) {
    if (convertToUTF8(filePath)) {
      successCount++;
    } else {
      errorCount++;
    }
    console.log(""); // Línea en blanco para separar
  }

  console.log("📊 Resumen de corrección:");
  console.log(`✅ Archivos corregidos: ${successCount}`);
  console.log(`❌ Errores: ${errorCount}`);
  console.log(`📁 Total procesados: ${criticalFiles.length}`);

  if (errorCount === 0) {
    console.log("\n🎉 ¡Todos los archivos críticos han sido corregidos exitosamente!");
    console.log("💡 Ahora puedes ejecutar: npm run build");
  } else {
    console.log("\n⚠️  Algunos archivos no pudieron ser corregidos. Revisa los errores arriba.");
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { convertToUTF8, detectEncoding };
