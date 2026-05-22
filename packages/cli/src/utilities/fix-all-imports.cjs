const fs = require("fs");
const path = require("path");
const glob = require("glob");

console.log("🔧 Fixing ALL import paths...");

// Patterns to fix
const replacements = [
  {
    from: /from ["']@\/components\/ui\//g,
    to: 'from "@/shared/components/bundui-premium/components/ui/',
  },
  {
    from: /from ["']@\/lib\/utils["']/g,
    to: 'from "@/shared/lib/utils"',
  },
];

// Find all TypeScript/JavaScript files
const files = glob.sync("src/**/*.{ts,tsx,js,jsx}", {
  cwd: process.cwd(),
  absolute: true,
});

console.log(`Found ${files.length} files to check...`);

let fixedFiles = 0;

files.forEach((filePath) => {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    let modified = false;

    replacements.forEach(({ from, to }) => {
      if (from.test(content)) {
        content = content.replace(from, to);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
      fixedFiles++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\n🎉 Fixed ${fixedFiles} files with import issues!`);
