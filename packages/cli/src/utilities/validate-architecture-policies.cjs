#!/usr/bin/env node

/**
 * Script de validación de políticas arquitectónicas centralizadas
 * Busca archivos de política, regla o principio fuera de /docs/project/architecture-rules/
 * Falla si encuentra archivos dispersos en /docs/architecture
 */

const fs = require("fs");
const path = require("path");

const ARCHITECTURE_DIR = path.join(__dirname, "../docs/architecture");
const CENTRAL_POLICY_DIR = path.join(__dirname, "../docs/project/architecture-rules");

const POLICY_KEYWORDS = [
  "policy",
  "política",
  "regla",
  "principio",
  "universal",
  "pattern",
  "arquitectura",
  "governance",
  "gobernanza",
];

function isPolicyFile(filename) {
  const lower = filename.toLowerCase();
  return POLICY_KEYWORDS.some((keyword) => lower.includes(keyword));
}

function findPolicyFiles(dir, excludeDir) {
  let results = [];
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fullPath === excludeDir) continue;
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(findPolicyFiles(fullPath, excludeDir));
    } else if (isPolicyFile(file)) {
      results.push(fullPath);
    }
  }
  return results;
}

const policyFiles = findPolicyFiles(ARCHITECTURE_DIR, CENTRAL_POLICY_DIR);

if (policyFiles.length > 0) {
  console.error(
    "❌ Políticas arquitectónicas dispersas encontradas fuera de /docs/project/architecture-rules/:"
  );
  policyFiles.forEach((f) => console.error(" - " + f));
  process.exit(1);
} else {
  console.log("✅ Todas las políticas arquitectónicas están centralizadas correctamente.");
  process.exit(0);
}
