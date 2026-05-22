const fs = require("fs");
const path = require("path");
const { glob } = require("glob");

// Función para corregir imports en un archivo
function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  let modified = false;

  // Correcciones de imports
  const replacements = [
    // UI components
    [
      /from ["']@\/components\/ui\/([^"']+)["']/g,
      'from "@/shared/components/bundui-premium/components/ui/$1"',
    ],

    // Lib utils
    [/from ["']@\/lib\/utils["']/g, 'from "@/shared/lib/utils"'],
    [/from ["']@\/lib\/themes["']/g, 'from "@/shared/lib/themes"'],

    // Hooks
    [
      /from ["']@\/hooks\/use-mobile["']/g,
      'from "@/shared/components/bundui-premium/hooks/use-mobile"',
    ],
    [/from ["']@\/hooks\/([^"']+)["']/g, 'from "@/shared/components/bundui-premium/hooks/$1"'],

    // Active theme
    [
      /from ["']@\/components\/active-theme["']/g,
      'from "@/shared/components/bundui-premium/components/active-theme"',
    ],

    // Theme customizer
    [/from ["']@\/components\/theme-customizer\/index["']/g, 'from "./index"'],

    // Hook name changes
    [/useIsMobile/g, "useMobile"],
  ];

  // Aplicar reemplazos
  replacements.forEach(([pattern, replacement]) => {
    const newContent = content.replace(pattern, replacement);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  });

  // Guardar si se modificó
  if (modified) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`✅ Fixed: ${filePath}`);
    return true;
  }

  return false;
}

// Función principal
async function fixAllImports() {
  console.log("🔧 Fixing Bundui Premium imports...\n");

  // Buscar todos los archivos TypeScript/JavaScript en bundui-premium
  const files = await glob("src/shared/components/bundui-premium/**/*.{ts,tsx}", {
    cwd: process.cwd(),
    absolute: true,
  });

  let fixedCount = 0;

  files.forEach((filePath) => {
    if (fixImportsInFile(filePath)) {
      fixedCount++;
    }
  });

  console.log(`\n🎉 Fixed ${fixedCount} files with import issues!`);

  if (fixedCount === 0) {
    console.log("✨ No files needed fixing - all imports are correct!");
  }
}

// Ejecutar script
fixAllImports().catch(console.error);
