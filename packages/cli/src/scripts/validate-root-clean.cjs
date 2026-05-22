#!/usr/bin/env node
/**
 * validate-root-clean.cjs
 * Valida la limpieza del directorio raíz según ROOT_CLEANLINESS_POLICY.md
 * No borra nada, solo reporta y sugiere acciones.
 *
 * Uso: node dev-tools/scripts/validate-root-clean.cjs
 */
const fs = require("fs");
const path = require("path");

// === CONFIGURACIÓN DE REGLAS ===
// Archivos y carpetas permitidos en raíz
const allowed = [
  "README.md",
  "package.json",
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "tsconfig.json",
  "jsconfig.json",
  "next.config.js",
  "next.config.mjs",
  "next-env.d.ts",
  ".gitignore",
  ".git",
  ".husky",
  ".vscode",
  ".env",
  ".env.example",
  ".editorconfig",
  "apps",
  "src",
  "bundui",
  "public",
  "tests",
  "dev-tools",
  "docs",
  "scripts",
  "config",
  "traefik",
  "CHANGELOG.md",
  "CODE_OF_CONDUCT.md",
  "components.json",
];
// Extensiones prohibidas en raíz
const prohibitedExt = [".log", ".tmp", ".bak", ".swp", ".old", ".orig"];
// Patrones prohibidos (archivos temporales, etc.)
const prohibitedPatterns = [/^~.*$/, /^\..*\.swp$/, /^npm-debug\.log.*$/];

// === FUNCIÓN PRINCIPAL ===
function validateRoot() {
  const root = process.cwd();
  const files = fs.readdirSync(root);
  const issues = [];

  // 1. Archivos/carpetas no permitidos
  files.forEach((f) => {
    if (!allowed.includes(f)) {
      // Permitir carpetas ocultas de sistema y node_modules
      if (f.startsWith(".") && ![".git", ".husky", ".vscode"].includes(f)) return;
      if (f === "node_modules") return;
      issues.push({ type: "NO_PERMITIDO", name: f });
    }
  });

  // 2. Extensiones prohibidas
  files.forEach((f) => {
    const ext = path.extname(f);
    if (prohibitedExt.includes(ext)) {
      issues.push({ type: "EXT_PROHIBIDA", name: f });
    }
  });

  // 3. Patrones prohibidos
  files.forEach((f) => {
    for (const pat of prohibitedPatterns) {
      if (pat.test(f)) {
        issues.push({ type: "PATRON_PROHIBIDO", name: f });
      }
    }
  });

  // === REPORTE ===
  if (issues.length === 0) {
    console.log("\x1b[32m[OK] El directorio raíz está limpio y cumple las reglas.\x1b[0m");
  } else {
    console.log(
      "\x1b[33m[WARN] Se encontraron archivos/carpeta fuera de estándar en el ROOT:\x1b[0m"
    );
    issues.forEach((i) => {
      let msg = ` - [${i.type}] ${i.name}`;
      if (i.type === "NO_PERMITIDO") msg += " (no permitido en raíz)";
      if (i.type === "EXT_PROHIBIDA") msg += " (extensión prohibida)";
      if (i.type === "PATRON_PROHIBIDO") msg += " (patrón prohibido)";
      console.log(msg);
    });
    console.log("\nRevisa ROOT_CLEANLINESS_POLICY.md para las reglas completas.");
    console.log("Sugerencia: mueve archivos a dev-tools/, scripts/, o elimina si son temporales.");
  }
}

// === EJECUCIÓN ===
if (require.main === module) {
  validateRoot();
}
