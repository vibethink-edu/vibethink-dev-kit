const fs = require("fs");
const path = require("path");

console.log("🗺️ Iniciando generación de mapa de rutas...");

// Verificar que existe el archivo App.tsx
const appFile = path.join(__dirname, "../src/App.tsx");
if (!fs.existsSync(appFile)) {
  console.error("❌ No se encontró el archivo App.tsx");
  process.exit(1);
}

console.log("✅ Archivo App.tsx encontrado");

// Leer el contenido
const content = fs.readFileSync(appFile, "utf8");
console.log(`📄 Contenido leído: ${content.length} caracteres`);

// Buscar rutas
const routeRegex = /<Route\s+path="([^"]+)"\s+element=\{([^}]+)\}/g;
let match;
const routes = [];

while ((match = routeRegex.exec(content)) !== null) {
  const [, routePath, element] = match;
  routes.push({ path: routePath, element: element.trim() });
}

console.log(`📊 Rutas encontradas: ${routes.length}`);

// Crear directorio de salida
const outputDir = path.join(__dirname, "../docs");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generar documento simple
let markdown = `# 🗺️ Mapa de Rutas - AI Pair Orchestrator Pro

**Generado automáticamente**: ${new Date().toLocaleString("es-ES")}

## 📊 Rutas Encontradas (${routes.length})

| Ruta | Elemento |
|------|----------|
`;

routes.forEach((route) => {
  markdown += `| \`${route.path}\` | \`${route.element}\` |\n`;
});

markdown += `
---

*Documento generado automáticamente*
`;

// Escribir archivo
const outputFile = path.join(outputDir, "ROUTE_MAP.md");
fs.writeFileSync(outputFile, markdown);

console.log(`✅ Mapa de rutas generado: ${outputFile}`);
console.log(`📊 Total de rutas procesadas: ${routes.length}`);
