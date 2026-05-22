#!/usr/bin/env node
/**
 * Script para validar que todos los archivos relevantes estén en UTF-8.
 * Uso: node scripts/check-encoding.js
 *
 * - Falla si encuentra archivos con encoding incorrecto.
 * - Excluye node_modules, .git, dist, build, coverage, backups, y binarios comunes.
 * - Pensado para ejecutarse en pre-commit y CI/CD.
 */
const fs = require("fs");
const path = require("path");
const glob = require("glob");
const chardet = require("chardet");

const EXCLUDE_DIRS = [
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  "backups",
  "bin",
  "out",
  ".next",
  ".turbo",
];
const TEXT_FILE_EXT = [
  ".js",
  ".ts",
  ".tsx",
  ".jsx",
  ".json",
  ".md",
  ".css",
  ".scss",
  ".html",
  ".yml",
  ".yaml",
  ".env",
  ".txt",
  ".sh",
  ".ps1",
  ".py",
  ".cjs",
  ".mjs",
  ".lock",
  ".ini",
  ".conf",
];

function isTextFile(file) {
  return TEXT_FILE_EXT.includes(path.extname(file).toLowerCase());
}

function shouldExclude(file) {
  return EXCLUDE_DIRS.some((dir) => file.split(path.sep).includes(dir));
}

const files = glob.sync("**/*.*", { nodir: true, dot: true });
let hasError = false;

files.forEach((file) => {
  if (shouldExclude(file) || !isTextFile(file)) return;
  try {
    const buffer = fs.readFileSync(file);
    const encoding = chardet.detect(buffer);
    if (encoding !== "UTF-8") {
      console.error(`\u274C Archivo con encoding inválido: ${file} (${encoding})`);
      hasError = true;
    }
  } catch (e) {
    // Ignorar archivos que no se pueden leer
  }
});

if (hasError) {
  console.error(
    "\nError: Se encontraron archivos con encoding incorrecto. Corrige antes de continuar."
  );
  process.exit(1);
} else {
  console.log("\u2705 Todos los archivos relevantes están en UTF-8.");
}
