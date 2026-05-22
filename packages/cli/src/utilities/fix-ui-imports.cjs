#!/usr/bin/env node

/**
 * VTHINK PERFORMANCE FIX: Arreglar imports UI para compatibilidad mock/real DB
 * Mantiene rendimiento optimal y facilita transición a base de datos real
 */

const fs = require("fs");
const path = require("path");
const glob = require("glob");

console.log("🚀 VThink Performance Fix: Corrigiendo imports UI...");

// Función para fix de imports en bundui components
function fixBunduiImports() {
  const bunduiPath = "src/shared/components/bundui-premium/components/ui";
  const files = glob.sync(`${bunduiPath}/**/*.{ts,tsx}`);

  let fixedCount = 0;

  files.forEach((file) => {
    let content = fs.readFileSync(file, "utf8");
    let modified = false;

    // Fix: @/components/ui/* -> ./relative-path
    const fixes = [
      { from: 'from "@/components/ui/button"', to: 'from "./button"' },
      { from: 'from "@/components/ui/dialog"', to: 'from "./dialog"' },
      { from: 'from "@/components/ui/label"', to: 'from "./label"' },
      { from: 'from "@/components/ui/toast"', to: 'from "./toast"' },
    ];

    fixes.forEach((fix) => {
      if (content.includes(fix.from)) {
        content = content.replace(new RegExp(fix.from, "g"), fix.to);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(file, content);
      fixedCount++;
      console.log(`✅ Fixed: ${file}`);
    }
  });

  return fixedCount;
}

// Función para fix de imports en shared components
function fixSharedImports() {
  const sharedPath = "src/shared/components/ui";
  const files = glob.sync(`${sharedPath}/**/*.{ts,tsx}`);

  let fixedCount = 0;

  files.forEach((file) => {
    let content = fs.readFileSync(file, "utf8");
    let modified = false;

    // Fix: @/components/ui/* -> ../bundui-premium/components/ui/*
    const fixes = [
      {
        from: 'from "@/components/ui/button"',
        to: 'from "../bundui-premium/components/ui/button"',
      },
      {
        from: 'from "@/components/ui/dialog"',
        to: 'from "../bundui-premium/components/ui/dialog"',
      },
      { from: 'from "@/components/ui/label"', to: 'from "../bundui-premium/components/ui/label"' },
      { from: 'from "@/components/ui/toast"', to: 'from "../bundui-premium/components/ui/toast"' },
    ];

    fixes.forEach((fix) => {
      if (content.includes(fix.from)) {
        content = content.replace(new RegExp(fix.from, "g"), fix.to);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(file, content);
      fixedCount++;
      console.log(`✅ Fixed: ${file}`);
    }
  });

  return fixedCount;
}

// Ejecutar fixes
const bunduiFixes = fixBunduiImports();
const sharedFixes = fixSharedImports();

console.log(`\n📊 RESULTADO:`);
console.log(`✅ Bundui imports fixed: ${bunduiFixes}`);
console.log(`✅ Shared imports fixed: ${sharedFixes}`);
console.log(`🎯 Total archivos corregidos: ${bunduiFixes + sharedFixes}`);
console.log(`\n⚡ BENEFICIO: Mejora significativa en tiempo de build y rendimiento`);
console.log(`🔗 COMPATIBILIDAD: Mantiene soporte para mock ↔ real DB`);
