#!/usr/bin/env node
/**
 * Script de validación de sincronización de reglas de proyecto e IDE
 * Compara naming, linting y formateo entre archivos de configuración del proyecto y del IDE
 * Notifica por consola cualquier conflicto o desalineación
 * Sale con código 1 si hay problemas
 */
const fs = require("fs");
const path = require("path");

const configFiles = [
  ".CursorRules",
  ".vscode/settings.json",
  ".eslintrc.js",
  "prettier.config.js",
  ".prettierrc",
  "docs/naming_convention.md",
  "CONTRIBUTING.md",
];

function readConfig(file) {
  try {
    const fullPath = path.resolve(process.cwd(), file);
    if (!fs.existsSync(fullPath)) return null;
    return fs.readFileSync(fullPath, "utf8");
  } catch (e) {
    return null;
  }
}

function parseJSONorJS(fileContent) {
  try {
    if (!fileContent) return {};
    if (fileContent.trim().startsWith("module.exports")) {
      // Eval simple para configs tipo module.exports = {...}
      const exportsObj = {};
      eval(fileContent.replace("module.exports", "exportsObj"));
      return exportsObj;
    }
    return JSON.parse(fileContent);
  } catch (e) {
    return {};
  }
}

function checkNaming(contents) {
  const namingKeywords = ["camelCase", "PascalCase", "snake_case"];
  const namingSet = new Set();
  for (const file of Object.keys(contents)) {
    const content = contents[file];
    if (!content) continue;
    for (const keyword of namingKeywords) {
      if (content.includes(keyword)) namingSet.add(keyword + " in " + file);
    }
  }
  if (namingSet.size > 1) {
    console.error("Conflicto de naming convention detectado:", Array.from(namingSet));
    process.exit(1);
  }
  console.log("Sincronización de reglas de naming OK.");
}

function checkLinting(contents) {
  // Busca reglas clave en ESLint y VSCode
  let eslintConfig = {};
  let vscodeConfig = {};
  if (contents[".eslintrc.js"]) eslintConfig = parseJSONorJS(contents[".eslintrc.js"]);
  if (contents[".vscode/settings.json"])
    vscodeConfig = parseJSONorJS(contents[".vscode/settings.json"]);
  // Ejemplo: indentación
  const eslintIndent = eslintConfig.rules?.indent?.[1] || null;
  const vscodeIndent = vscodeConfig["editor.tabSize"] || null;
  if (eslintIndent && vscodeIndent && eslintIndent !== vscodeIndent) {
    console.error(`Conflicto de indentación: ESLint (${eslintIndent}) vs VSCode (${vscodeIndent})`);
    process.exit(1);
  }
  // Ejemplo: comillas
  const eslintQuotes = eslintConfig.rules?.quotes?.[1] || null;
  const vscodeQuotes = vscodeConfig["editor.defaultFormatter"]?.includes("single")
    ? "single"
    : "double";
  if (eslintQuotes && vscodeQuotes && eslintQuotes !== vscodeQuotes) {
    console.error(`Conflicto de comillas: ESLint (${eslintQuotes}) vs VSCode (${vscodeQuotes})`);
    process.exit(1);
  }
  // Ejemplo: punto y coma
  const eslintSemi = eslintConfig.rules?.semi?.[0] || null;
  if (eslintSemi && vscodeConfig["editor.formatOnSave"] && eslintSemi === "never") {
    console.error(
      "Conflicto: ESLint prohíbe punto y coma pero el formateador del IDE podría añadirlos."
    );
    process.exit(1);
  }
  console.log("Sincronización de reglas de linting OK.");
}

function checkPrettier(contents) {
  // Busca reglas clave en Prettier y VSCode
  let prettierConfig = {};
  let vscodeConfig = {};
  if (contents["prettier.config.js"])
    prettierConfig = parseJSONorJS(contents["prettier.config.js"]);
  if (contents[".prettierrc"])
    prettierConfig = { ...prettierConfig, ...parseJSONorJS(contents[".prettierrc"]) };
  if (contents[".vscode/settings.json"])
    vscodeConfig = parseJSONorJS(contents[".vscode/settings.json"]);
  // Ejemplo: ancho de línea
  const prettierWidth = prettierConfig.printWidth || null;
  const vscodeWidth = vscodeConfig["editor.wordWrapColumn"] || null;
  if (prettierWidth && vscodeWidth && prettierWidth !== vscodeWidth) {
    console.error(
      `Conflicto de ancho de línea: Prettier (${prettierWidth}) vs VSCode (${vscodeWidth})`
    );
    process.exit(1);
  }
  // Ejemplo: comillas
  const prettierQuotes = prettierConfig.singleQuote ? "single" : "double";
  const vscodeQuotes = vscodeConfig["editor.defaultFormatter"]?.includes("single")
    ? "single"
    : "double";
  if (prettierQuotes && vscodeQuotes && prettierQuotes !== vscodeQuotes) {
    console.error(
      `Conflicto de comillas: Prettier (${prettierQuotes}) vs VSCode (${vscodeQuotes})`
    );
    process.exit(1);
  }
  // Ejemplo: punto y coma
  const prettierSemi = prettierConfig.semi;
  if (typeof prettierSemi === "boolean" && vscodeConfig["editor.formatOnSave"]) {
    // No hay una opción directa en VSCode, pero se puede advertir
    console.log("Validación de punto y coma: Prettier=" + prettierSemi);
  }
  console.log("Sincronización de reglas de formateo OK.");
}

function checkSync() {
  const contents = {};
  for (const file of configFiles) {
    contents[file] = readConfig(file);
  }
  checkNaming(contents);
  checkLinting(contents);
  checkPrettier(contents);
}

checkSync();
