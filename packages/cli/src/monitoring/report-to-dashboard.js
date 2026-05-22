const axios = require("axios");
const [, , component, version, status] = process.argv;

axios
  .post("https://dashboard-central/api/report", {
    component,
    version,
    status,
    timestamp: new Date().toISOString(),
  })
  .then(() => {
    // TODO: log 'Reporte enviado al dashboard central'
  })
  .catch((err) => {
    // TODO: log 'Error enviando reporte:' err.message
  });
