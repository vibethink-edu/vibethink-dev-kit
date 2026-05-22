#!/usr/bin/env node
/**
 * Genera un índice markdown y un dashboard HTML de todos los reportes de evidencia en docs/cmmi/evidence/
 */
const fs = require("fs");
const path = require("path");

const evidenceDir = path.resolve(__dirname, "../docs/cmmi/evidence/");
const indexFile = path.join(evidenceDir, "index.md");
const htmlFile = path.join(evidenceDir, "index.html");

const files = fs.readdirSync(evidenceDir).filter((f) => f.endsWith(".md") && f !== "index.md");

let index = `# Índice de Evidencia CMMI\n\n| Archivo | Fecha | Tarea | Estado | Responsable | Cumplimiento |\n|---------|-------|-------|--------|-------------|--------------|\n`;
let htmlRows = "";

for (const file of files) {
  const content = fs.readFileSync(path.join(evidenceDir, file), "utf8");
  const fecha = (content.match(/\*\*Fecha:\*\* (.*)/) || [])[1] || "";
  const tarea = (content.match(/\*\*Tarea:\*\* (.*)/) || [])[1] || "";
  const estado = (content.match(/\*\*Estado:\*\* (.*)/) || [])[1] || "";
  const responsable = (content.match(/\*\*Responsable:\*\* (.*)/) || [])[1] || "";
  const cumplimiento = (content.match(/\*\*cumplimiento_metodologia:\*\* (.*)/) || [])[1] || "";
  index += `| [${file}](${file}) | ${fecha} | ${tarea} | ${estado} | ${responsable} | ${cumplimiento} |\n`;
  htmlRows += `<tr><td><a href='${file}'>${file}</a></td><td>${fecha}</td><td>${tarea}</td><td>${estado}</td><td>${responsable}</td><td>${cumplimiento}</td></tr>\n`;
}

fs.writeFileSync(indexFile, index, "utf8");

const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Índice de Evidencia CMMI</title>
  <style>
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
    th { background: #f0f0f0; }
    input { margin-bottom: 10px; }
  </style>
</head>
<body>
  <h1>Índice de Evidencia CMMI</h1>
  <input type="text" id="filtro" placeholder="Filtrar por cualquier campo..." onkeyup="filtrar()" />
  <table id="tablaEvidencia">
    <thead>
      <tr><th>Archivo</th><th>Fecha</th><th>Tarea</th><th>Estado</th><th>Responsable</th><th>Cumplimiento</th></tr>
    </thead>
    <tbody>
      ${htmlRows}
    </tbody>
  </table>
  <script>
    function filtrar() {
      var input = document.getElementById('filtro');
      var filtro = input.value.toLowerCase();
      var tabla = document.getElementById('tablaEvidencia');
      var filas = tabla.getElementsByTagName('tr');
      for (var i = 1; i < filas.length; i++) {
        var celdas = filas[i].getElementsByTagName('td');
        var mostrar = false;
        for (var j = 0; j < celdas.length; j++) {
          if (celdas[j].innerText.toLowerCase().indexOf(filtro) > -1) mostrar = true;
        }
        filas[i].style.display = mostrar ? '' : 'none';
      }
    }
  </script>
</body>
</html>`;

fs.writeFileSync(htmlFile, html, "utf8");
console.log(`Índice de evidencia generado: ${indexFile}`);
console.log(`Dashboard visual generado: ${htmlFile}`);
