// scripts/validate-branding.js
const fs = require("fs");
const path = require("path");

const forbidden = ["VThink Orchestrator", "Orchestrator", "vthink-default"];

function scanDir(dir) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanDir(fullPath);
    } else if (/(js|ts|tsx|md|html|json)$/.test(file)) {
      const content = fs.readFileSync(fullPath, "utf8");
      forbidden.forEach((term) => {
        if (content.includes(term)) {
          console.error(`❌ Branding prohibido encontrado: "${term}" en ${fullPath}`);
          process.exit(1);
        }
      });
    }
  });
}

scanDir("./src");
scanDir("./docs");
console.log("✅ Branding VibeThink validado correctamente.");
