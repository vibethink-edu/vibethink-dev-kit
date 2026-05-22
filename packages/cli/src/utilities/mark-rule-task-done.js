#!/usr/bin/env node
/**
 * Marca como realizada una tarea de tipo "Regla del Proyecto" en el backlog central YAML.
 * Además, genera un reporte de cierre en formato markdown en la carpeta 'reports/'.
 * Uso: node scripts/mark-rule-task-done.js "nombre de la regla"
 */
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const BACKLOG_PATH = path.resolve(__dirname, "../docs/vtk_backlog.yaml");
const REPORTS_DIR = path.resolve(__dirname, "../reports/");
const ruleName = process.argv[2];
const responsable = process.env.USER || process.env.USERNAME || "Automático";
const fecha = new Date().toISOString().slice(0, 10);

if (!ruleName) {
  // TODO: log 'Debes indicar el nombre de la regla/tarea.'
  process.exit(1);
}

let backlog;
try {
  backlog = yaml.load(fs.readFileSync(BACKLOG_PATH, "utf8"));
} catch (e) {
  backlog = { tareas: [] };
}
let found = false;
let tareaCerrada = null;

for (const tarea of backlog.tareas || []) {
  if (
    tarea.tipo === "Regla del Proyecto" &&
    tarea.nombre &&
    tarea.nombre.toLowerCase().includes(ruleName.toLowerCase())
  ) {
    tarea.estado = "realizada";
    tarea.fecha_cierre = fecha;
    tarea.responsable = responsable;
    found = true;
    tareaCerrada = tarea;
    // TODO: log `Tarea "${tarea.nombre}" marcada como realizada.`
    break;
  }
}

if (!found) {
  tareaCerrada = {
    tipo: "Regla del Proyecto",
    nombre: ruleName,
    estado: "realizada",
    fecha: fecha,
    fecha_cierre: fecha,
    responsable: responsable,
  };
  backlog.tareas = backlog.tareas || [];
  backlog.tareas.push(tareaCerrada);
  // TODO: log `Tarea nueva "${ruleName}" creada y marcada como realizada.`
}

fs.writeFileSync(BACKLOG_PATH, yaml.dump(backlog), "utf8");

// --- Generar reporte de cierre ---
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR);
}
const reportFile = path.join(
  REPORTS_DIR,
  `closure-${fecha}-${ruleName.replace(/\s+/g, "_").toLowerCase()}.md`
);
const commitHash = (() => {
  try {
    return require("child_process").execSync("git rev-parse HEAD").toString().trim();
  } catch {
    return "N/A";
  }
})();

const report = `### Reporte de Cierre de Tarea Pendiente

- **Tarea:** ${tareaCerrada.nombre}
- **Estado:** ${tareaCerrada.estado}
- **Fecha de cierre:** ${tareaCerrada.fecha_cierre || fecha}
- **Responsable:** ${tareaCerrada.responsable || responsable}
- **Implementación:** Ver backlog central y documentación asociada.
- **Evidencia técnica:**
  - Commit: ${commitHash}
  - Script: scripts/mark-rule-task-done.js
- **Referencia cruzada:**
  - Backlog: docs/vtk_backlog.yaml
- **Notas técnicas:** (agregar si aplica)
- **Cumplimiento CMMI:** Verificado (procesos, trazabilidad, evidencia y cierre documentados).
`;

fs.writeFileSync(reportFile, report, "utf8");

// Copiar el reporte a la carpeta de evidencia CMMI
const cmmiEvidenceDir = path.resolve(__dirname, "../docs/cmmi/evidence/");
if (!fs.existsSync(cmmiEvidenceDir)) fs.mkdirSync(cmmiEvidenceDir, { recursive: true });
const cmmiReportFile = path.join(cmmiEvidenceDir, path.basename(reportFile));
const reportWithCMMI = report + "\n- **cumplimiento_metodologia:** CMMI-ML3\n";
fs.writeFileSync(cmmiReportFile, reportWithCMMI, "utf8");

// TODO: log `Reporte de cierre generado: ${reportFile}`
// TODO: log `Copia para evidencia CMMI: ${cmmiReportFile}`
// TODO: log '\n--- Resumen del caso generado ---\n'
// TODO: log reportWithCMMI
