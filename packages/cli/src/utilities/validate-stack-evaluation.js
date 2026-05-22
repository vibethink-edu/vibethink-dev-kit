#!/usr/bin/env node

/**
 * Script de Validación de Evaluaciones de Stack
 *
 * Verifica que todas las evaluaciones cumplan con los criterios obligatorios:
 * 1. Mínimo 3 casos de uso documentados
 * 2. Búsqueda exhaustiva completada
 * 3. Compatibilidad hacia atrás validada
 * 4. Análisis de riesgos realizado
 * 5. Validación de suposiciones
 *
 * Uso: node scripts/validate-stack-evaluation.js [archivo]
 */

const fs = require("fs");
const path = require("path");

// Colores para output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

// Criterios obligatorios
const CRITERIA = {
  USE_CASES: {
    name: "Casos de Uso (Mínimo 3)",
    required: true,
    patterns: [
      /## 🎯 \*\*Casos de Uso \(OBLIGATORIO - Mínimo 3\)\*\*/,
      /### \*\*Caso de Uso 1:/,
      /### \*\*Caso de Uso 2:/,
      /### \*\*Caso de Uso 3:/,
    ],
  },
  EXHAUSTIVE_SEARCH: {
    name: "Búsqueda Exhaustiva",
    required: true,
    patterns: [
      /## 🔍 \*\*Búsqueda Exhaustiva Completada\*\*/,
      /### \*\*Alternativas Evaluadas:/,
      /### \*\*Métricas Comparativas:/,
    ],
  },
  BACKWARD_COMPATIBILITY: {
    name: "Compatibilidad Hacia Atrás",
    required: true,
    patterns: [
      /## 🔄 \*\*Compatibilidad Hacia Atrás\*\*/,
      /### \*\*Decisiones Previas Revisadas:/,
      /### \*\*Matriz de Compatibilidad:/,
    ],
  },
  RISK_ANALYSIS: {
    name: "Análisis de Riesgos",
    required: true,
    patterns: [
      /## ⚠️ \*\*Análisis de Riesgos\*\*/,
      /### \*\*Riesgos Identificados:/,
      /### \*\*Estrategias de Mitigación:/,
    ],
  },
  ASSUMPTION_VALIDATION: {
    name: "Validación de Suposiciones",
    required: true,
    patterns: [
      /## 🎯 \*\*Validación de Suposiciones\*\*/,
      /### \*\*Suposiciones Validadas:/,
      /### \*\*Nivel de Confianza:/,
    ],
  },
};

/**
 * Valida un archivo de evaluación
 */
function validateEvaluation(filePath) {
  console.log(`${colors.cyan}${colors.bright}🔍 Validando: ${filePath}${colors.reset}\n`);

  try {
    const content = fs.readFileSync(filePath, "utf8");
    const results = {};
    let allPassed = true;

    // Validar cada criterio
    for (const [key, criterion] of Object.entries(CRITERIA)) {
      const passed = criterion.patterns.every((pattern) => pattern.test(content));
      results[key] = {
        name: criterion.name,
        passed,
        required: criterion.required,
      };

      if (criterion.required && !passed) {
        allPassed = false;
      }
    }

    // Mostrar resultados
    console.log(`${colors.bright}📋 Resultados de Validación:${colors.reset}\n`);

    for (const [key, result] of Object.entries(results)) {
      const status = result.passed
        ? `${colors.green}✅ PASÓ${colors.reset}`
        : `${colors.red}❌ FALLÓ${colors.reset}`;

      const required = result.required
        ? `${colors.yellow}(OBLIGATORIO)${colors.reset}`
        : `${colors.blue}(OPCIONAL)${colors.reset}`;

      console.log(`  ${status} ${result.name} ${required}`);
    }

    // Resumen final
    console.log(`\n${colors.bright}📊 Resumen:${colors.reset}`);
    if (allPassed) {
      console.log(
        `${colors.green}${colors.bright}🎉 TODOS LOS CRITERIOS OBLIGATORIOS CUMPLIDOS${colors.reset}`
      );
      console.log(`${colors.green}✅ La evaluación está lista para implementación${colors.reset}`);
    } else {
      console.log(
        `${colors.red}${colors.bright}⚠️  CRITERIOS OBLIGATORIOS FALTANTES${colors.reset}`
      );
      console.log(
        `${colors.red}❌ La evaluación necesita correcciones antes de implementación${colors.reset}`
      );

      // Mostrar criterios faltantes
      console.log(`\n${colors.yellow}${colors.bright}📝 Criterios faltantes:${colors.reset}`);
      for (const [key, result] of Object.entries(results)) {
        if (result.required && !result.passed) {
          console.log(`  ❌ ${result.name}`);
        }
      }
    }

    return allPassed;
  } catch (error) {
    console.error(`${colors.red}❌ Error al leer el archivo: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Busca archivos de evaluación en el directorio docs/evaluations
 */
function findEvaluationFiles() {
  const evaluationsDir = path.join(__dirname, "..", "docs", "evaluations");

  if (!fs.existsSync(evaluationsDir)) {
    console.error(
      `${colors.red}❌ Directorio de evaluaciones no encontrado: ${evaluationsDir}${colors.reset}`
    );
    return [];
  }

  const files = fs
    .readdirSync(evaluationsDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => path.join(evaluationsDir, file));

  return files;
}

/**
 * Función principal
 */
function main() {
  console.log(
    `${colors.cyan}${colors.bright}🚀 Validador de Evaluaciones de Stack${colors.reset}\n`
  );

  const args = process.argv.slice(2);
  let filesToValidate = [];

  if (args.length > 0) {
    // Validar archivo específico
    const filePath = path.resolve(args[0]);
    if (fs.existsSync(filePath)) {
      filesToValidate = [filePath];
    } else {
      console.error(`${colors.red}❌ Archivo no encontrado: ${args[0]}${colors.reset}`);
      process.exit(1);
    }
  } else {
    // Validar todos los archivos de evaluación
    filesToValidate = findEvaluationFiles();

    if (filesToValidate.length === 0) {
      console.log(`${colors.yellow}⚠️  No se encontraron archivos de evaluación${colors.reset}`);
      process.exit(0);
    }
  }

  console.log(`${colors.blue}📁 Archivos a validar: ${filesToValidate.length}${colors.reset}\n`);

  let totalPassed = 0;
  let totalFailed = 0;

  // Validar cada archivo
  for (const file of filesToValidate) {
    const passed = validateEvaluation(file);
    if (passed) {
      totalPassed++;
    } else {
      totalFailed++;
    }
    console.log("\n" + "=".repeat(80) + "\n");
  }

  // Resumen final
  console.log(`${colors.bright}📈 Resumen Final:${colors.reset}`);
  console.log(`  ${colors.green}✅ Evaluaciones aprobadas: ${totalPassed}${colors.reset}`);
  console.log(`  ${colors.red}❌ Evaluaciones con problemas: ${totalFailed}${colors.reset}`);
  console.log(`  ${colors.blue}📊 Total evaluaciones: ${filesToValidate.length}${colors.reset}`);

  if (totalFailed > 0) {
    console.log(`\n${colors.yellow}⚠️  Algunas evaluaciones necesitan correcciones${colors.reset}`);
    process.exit(1);
  } else {
    console.log(
      `\n${colors.green}🎉 Todas las evaluaciones cumplen con los criterios obligatorios${colors.reset}`
    );
    process.exit(0);
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main();
}

module.exports = {
  validateEvaluation,
  findEvaluationFiles,
  CRITERIA,
};
