#!/usr/bin/env node
/**
 * Simula un proceso automático con reintentos y crea un caso de desarrollo si falla.
 * Caso de prueba.
 */
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const { spawn } = require("child_process");

const BACKLOG_PATH = path.resolve(__dirname, "../docs/vtk_backlog.yaml");
const REPORTS_DIR = path.resolve(__dirname, "../reports/");
const tarea = "prueba";
const maxRetries = 3;
const success = false;
let lastError = null;

for (let i = 0; i < maxRetries; i++) {
  try {
    // Simulación de fallo
    throw new Error(`Error simulado en intento ${i + 1}`);
  } catch (err) {
    lastError = err;
  }
}

if (!success) {
  // Crear caso en backlog
  let backlog;
  try {
    backlog = yaml.load(fs.readFileSync(BACKLOG_PATH, "utf8"));
  } catch (e) {
    backlog = { tareas: [] };
  }
  const fecha = new Date().toISOString().slice(0, 10);
  const caso = {
    tipo: "Caso de Desarrollo Automático",
    nombre: tarea,
    estado: "pendiente",
    fecha: fecha,
    descripcion: `No se pudo resolver la tarea "${tarea}" tras ${maxRetries} intentos automáticos.`,
    error: lastError ? lastError.message : "N/A",
    evidencia: "Ver reporte en /reports/",
    responsable: "Automático",
  };
  backlog.tareas.push(caso);
  fs.writeFileSync(BACKLOG_PATH, yaml.dump(backlog), "utf8");

  // Generar reporte
  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR);
  const reportFile = path.join(
    REPORTS_DIR,
    `devcase-${fecha}-${tarea.replace(/\s+/g, "_").toLowerCase()}.md`
  );
  const report = `### Caso de Desarrollo Automático

- **Tarea:** ${tarea}
- **Estado:** pendiente
- **Fecha:** ${fecha}
- **Intentos realizados:** ${maxRetries}
- **Error:** ${lastError ? lastError.message : "N/A"}
- **Evidencia:** (adjuntar logs si aplica)
- **Contexto:** Simulación de fallo automático
- **Responsable:** Automático
- **Acción requerida:** Intervención humana para resolver el caso.
`;
  fs.writeFileSync(reportFile, report, "utf8");

  // Copiar el reporte a la carpeta de evidencia CMMI
  const cmmiEvidenceDir = path.resolve(__dirname, "../docs/cmmi/evidence/");
  if (!fs.existsSync(cmmiEvidenceDir)) fs.mkdirSync(cmmiEvidenceDir, { recursive: true });
  const cmmiReportFile = path.join(cmmiEvidenceDir, path.basename(reportFile));
  const reportWithCMMI = report + "\n- **cumplimiento_metodologia:** CMMI-ML3\n";
  fs.writeFileSync(cmmiReportFile, reportWithCMMI, "utf8");

  // Notificar a Slack/Mattermost sobre la nueva evidencia (enriquecido)
  spawn(
    "node",
    [
      path.resolve(__dirname, "notify-evidence-to-slack.cjs"),
      path.basename(reportFile),
      "Automático",
      "pendiente",
      "docs/cmmi/evidence/index.md",
      "Incidente",
      "Simulación de fallo automático",
      `docs/cmmi/evidence/${path.basename(reportFile)}`,
    ],
    { stdio: "inherit" }
  );

  console.log(`Caso de desarrollo creado en backlog y reporte generado: ${reportFile}`);
  console.log(`Copia para evidencia CMMI: ${cmmiReportFile}`);
  console.log("\n--- Resumen del caso generado ---\n");
  console.log(reportWithCMMI);
}
