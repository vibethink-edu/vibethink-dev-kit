#!/usr/bin/env node
/**
 * Notifica a uno o varios canales (Slack/Mattermost) sobre nueva evidencia de calidad/metodología.
 * Lee la configuración de webhooks y preferencias desde config/notification-channels.yaml
 * Uso: node scripts/notify-evidence-to-slack.js "Nombre del reporte" "Responsable" "Estado" "Enlace al índice" "Categoría" "Descripción" "Enlace directo"
 */
const https = require("https");
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const configPath = path.resolve(__dirname, "../config/notification-channels.yaml");
let webhooks = [];
try {
  const config = yaml.load(fs.readFileSync(configPath, "utf8"));
  webhooks = config.webhooks || [];
} catch (e) {
  console.error(
    "No se pudo leer la configuración de canales. Usando variable de entorno SLACK_WEBHOOK_URL."
  );
  if (process.env.SLACK_WEBHOOK_URL) webhooks = [process.env.SLACK_WEBHOOK_URL];
}

const [, , reporte, responsable, estado, enlace, categoria, descripcion, enlaceDirecto] =
  process.argv;

if (!reporte || !responsable || !estado || !enlace) {
  console.error(
    'Uso: node scripts/notify-evidence-to-slack.js "Reporte" "Responsable" "Estado" "Enlace" "Categoría" "Descripción" "EnlaceDirecto"'
  );
  process.exit(1);
}

const mensaje = `:clipboard: *Nueva evidencia de calidad/metodología registrada*\n• *Reporte:* ${reporte}\n• *Categoría:* ${categoria || "-"}\n• *Descripción:* ${descripcion || "-"}\n• *Responsable:* ${responsable}\n• *Estado:* ${estado}\n• *Ver índice:* ${enlace}\n• *Enlace directo:* ${enlaceDirecto || "-"}\n• *cumplimiento_metodologia:* CMMI-ML3`;

const data = JSON.stringify({ text: mensaje });

for (const webhookUrl of webhooks) {
  try {
    const url = new URL(webhookUrl);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };
    const req = https.request(options, (res) => {
      res.on("data", (d) => process.stdout.write(d));
    });
    req.on("error", (error) => console.error(error));
    req.write(data);
    req.end();
    // Log de notificación
    const logPath = path.resolve(__dirname, "../logs/notifications.log");
    const logMsg = `[${new Date().toISOString()}] Notificación enviada a ${webhookUrl} | Reporte: ${reporte} | Responsable: ${responsable} | Estado: ${estado}\n`;
    fs.appendFileSync(logPath, logMsg, "utf8");
  } catch (err) {
    console.error("Error enviando notificación:", err);
  }
}
