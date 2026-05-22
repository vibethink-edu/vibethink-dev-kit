#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🚀 Iniciando VibeThink Orchestrator...\n");

// Función para verificar si un archivo existe
function checkFile(filePath) {
  try {
    fs.accessSync(filePath);
    console.log(`✅ ${filePath}`);
    return true;
  } catch (error) {
    console.log(`❌ ${filePath} - NO ENCONTRADO`);
    return false;
  }
}

// Función para verificar puertos ocupados
function checkPort(port) {
  try {
    const result = execSync(`netstat -ano | findstr :${port}`, { encoding: "utf8" });
    if (result.trim()) {
      console.log(`⚠️  Puerto ${port} está ocupado`);
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

// Función para detener procesos Node.js
function killNodeProcesses() {
  try {
    execSync("taskkill /f /im node.exe 2>nul", { stdio: "ignore" });
    console.log("🔄 Procesos Node.js detenidos");
  } catch (error) {
    // Ignorar errores si no hay procesos
  }
}

// Verificaciones críticas
console.log("📋 Verificando archivos críticos...");
const criticalFiles = [
  "src/lib/utils.ts",
  "src/apps/login/main.tsx",
  "src/apps/login/App.tsx",
  "src/apps/login/Login.tsx",
  "vite.config.ts",
];

let allFilesExist = true;
criticalFiles.forEach((file) => {
  if (!checkFile(file)) {
    allFilesExist = false;
  }
});

// Verificar puertos
console.log("\n🔌 Verificando puertos...");
const portsToCheck = [8080, 8081, 8082, 8083];
let portOccupied = false;

portsToCheck.forEach((port) => {
  if (checkPort(port)) {
    portOccupied = true;
  }
});

// Si hay problemas, intentar solucionarlos
if (!allFilesExist || portOccupied) {
  console.log("\n🔧 Intentando solucionar problemas...");

  if (portOccupied) {
    console.log("🔄 Deteniendo procesos Node.js...");
    killNodeProcesses();
  }

  if (!checkFile("src/lib/utils.ts")) {
    console.log("📝 Creando src/lib/utils.ts...");
    const utilsContent = `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`;

    // Crear directorio si no existe
    if (!fs.existsSync("src/lib")) {
      fs.mkdirSync("src/lib", { recursive: true });
    }

    fs.writeFileSync("src/lib/utils.ts", utilsContent);
    console.log("✅ src/lib/utils.ts creado");
  }
}

console.log("\n🚀 Iniciando servidor de desarrollo...");
console.log("📍 URL esperada: http://localhost:8080/");
console.log("⏳ Esperando que el servidor inicie...\n");

// Iniciar el servidor
try {
  execSync("npm run dev", { stdio: "inherit" });
} catch (error) {
  console.error("❌ Error al iniciar el servidor:", error.message);
  process.exit(1);
}
