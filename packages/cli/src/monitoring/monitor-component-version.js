const fetch = require("node-fetch");
const fs = require("fs");
const pkg = process.argv[2]; // Ej: 'strapi'
const localVersion = require("../../package.json").dependencies[pkg];

fetch(`https://registry.npmjs.org/${pkg}/latest`)
  .then((res) => res.json())
  .then((data) => {
    const latest = data.version;
    if (localVersion !== latest) {
      // TODO: log `[ALERTA] Hay una nueva versión de ${pkg}: ${latest} (local: ${localVersion})`
    } else {
      // TODO: log `[OK] ${pkg} está actualizado (${localVersion})`
    }
  });
