#!/usr/bin/env node
/**
 * Valida la existencia de los documentos y scripts clave de gobernanza del proyecto.
 * Notifica por consola si falta alguno y sale con error.
 */
const fs = require("fs");
const paths = [
  "docs/methodology/VTK_METHODOLOGY.md",
  "docs/testing/",
  "docs/vtk_backlog.yaml",
  "CONTRIBUTING.md",
  "scripts/validate-rules-sync.js",
  "scripts/mark-rule-task-done.js",
];

let allOk = true;
for (const p of paths) {
  if (!fs.existsSync(p)) {
    console.error(`FALTA: ${p}`);
    allOk = false;
  }
}
if (!allOk) {
  console.error("Faltan archivos o carpetas clave de gobernanza. Revisa la documentación.");
  process.exit(1);
} else {
  console.log("Todos los archivos y scripts clave de gobernanza están presentes.");
}
