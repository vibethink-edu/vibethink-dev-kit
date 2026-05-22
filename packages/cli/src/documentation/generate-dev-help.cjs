#!/usr/bin/env node

/**
 * Script para extraer comandos útiles de los README principales del monorepo
 * y generar un archivo JSON consumible por el dashboard de developers.
 *
 * Uso: node scripts/generate-dev-help.js
 *
 * Puedes agregar más archivos README a la lista según evolucione el monorepo.
 *
 * El resultado se guarda en: dev-dashboard/src/data/devHelp.json
 */

const fs = require("fs");
const path = require("path");

// Archivos README a analizar (agrega más rutas según tu estructura)
const files = [
  "README.md",
  "docs/templates/README_CONNECTOR_TEMPLATE.md",
  // Puedes agregar más archivos aquí
];

// Expresión regular para detectar comandos útiles en líneas sueltas y en bloques de código
const commandRegex = /^(npm|node|npx|git|yarn|pnpm) .+/;
const codeBlockRegex = /```(?:bash|sh|zsh|shell)?\n([\s\S]*?)```/g;

const helpData = [];

files.forEach((file) => {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, "utf8");
  let lastSection = "global";

  // Procesar línea por línea para asociar comandos a secciones
  const lines = content.split("\n");
  lines.forEach((line) => {
    const sectionMatch = line.match(/^#+\s*(.+)/);
    if (sectionMatch) lastSection = sectionMatch[1];
    const cmdMatch = line.match(commandRegex);
    if (cmdMatch) {
      helpData.push({
        context: lastSection.toLowerCase(),
        title: lastSection,
        commands: [{ cmd: cmdMatch[0], desc: "" }],
      });
    }
  });

  // Buscar comandos en bloques de código
  let codeBlockMatch;
  while ((codeBlockMatch = codeBlockRegex.exec(content)) !== null) {
    const block = codeBlockMatch[1];
    block.split("\n").forEach((line) => {
      const cmdMatch = line.match(commandRegex);
      if (cmdMatch) {
        helpData.push({
          context: lastSection.toLowerCase(),
          title: lastSection,
          commands: [{ cmd: cmdMatch[0], desc: "" }],
        });
      }
    });
  }
});

// Agrupar por contexto/título
const grouped = {};
helpData.forEach((item) => {
  if (!grouped[item.context]) grouped[item.context] = { title: item.title, commands: [] };
  grouped[item.context].commands.push(...item.commands);
});

const outputDir = path.resolve(__dirname, "../dev-dashboard/src/data");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(
  path.join(outputDir, "devHelp.json"),
  JSON.stringify(Object.values(grouped), null, 2)
);

console.log("✅ Ayuda de developer generada en dev-dashboard/src/data/devHelp.json");

// Copiar el archivo generado a dev-dashboard/public/ para servirlo como asset estático
const publicDir = path.resolve(__dirname, "../dev-dashboard/public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
fs.copyFileSync(path.join(outputDir, "devHelp.json"), path.join(publicDir, "devHelp.json"));

console.log(
  "✅ devHelp.json también copiado a dev-dashboard/public/ para uso como asset estático."
);
