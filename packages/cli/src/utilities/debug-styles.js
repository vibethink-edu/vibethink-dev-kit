/**
 * Debug Styles Script
 * 
 * Script para diagnosticar problemas de estilos CSS
 * 
 * @author AI Pair Platform - Backend Team
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function debugStyles() {
  // TODO: log '🎨 Debugging CSS Styles...\n'
  // TODO: log '='.repeat(60)
  
  // 1. Verificar archivos CSS
  // TODO: log '\n📁 CSS Files Check:'
  // TODO: log '='.repeat(30)
  
  const cssFiles = [
    'src/index.css',
    'src/App.css',
    'tailwind.config.ts',
    'postcss.config.js',
    'vite.config.ts'
  ];
  
  cssFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      // TODO: log `✅ ${file} (${stats.size} bytes)`
    } else {
      // TODO: log `❌ ${file} (missing)`
    }
  });
  
  // 2. Verificar configuración de Tailwind
  // TODO: log '\n🎯 Tailwind Configuration:'
  // TODO: log '='.repeat(30)
  
  try {
    const tailwindConfig = fs.readFileSync(path.join(__dirname, '..', 'tailwind.config.ts'), 'utf8');
    const hasContent = tailwindConfig.includes('content:');
    const hasPlugins = tailwindConfig.includes('plugins:');
    const hasTheme = tailwindConfig.includes('theme:');
    
    // TODO: log `✅ Content paths: ${hasContent ? 'Configured' : 'Missing'}`
    // TODO: log `✅ Plugins: ${hasPlugins ? 'Configured' : 'Missing'}`
    // TODO: log `✅ Theme: ${hasTheme ? 'Configured' : 'Missing'}`
    
    // Verificar rutas de contenido
    const contentMatch = tailwindConfig.match(/content:\s*\[([\s\S]*?)\]/);
    if (contentMatch) {
      // TODO: log '📋 Content paths found:'
      const paths = contentMatch[1].match(/"[^"]*"/g);
      paths?.forEach(path => // TODO: log `   ${path}`
      );
    }
  } catch (error) {
    // TODO: log `❌ Error reading tailwind.config.ts: ${error.message}`
  }
  
  // 3. Verificar PostCSS
  // TODO: log '\n🔧 PostCSS Configuration:'
  // TODO: log '='.repeat(30)
  
  try {
    const postcssConfig = fs.readFileSync(path.join(__dirname, '..', 'postcss.config.js'), 'utf8');
    const hasTailwind = postcssConfig.includes('tailwindcss');
    const hasAutoprefixer = postcssConfig.includes('autoprefixer');
    
    // TODO: log `✅ Tailwind CSS: ${hasTailwind ? 'Configured' : 'Missing'}`
    // TODO: log `✅ Autoprefixer: ${hasAutoprefixer ? 'Configured' : 'Missing'}`
  } catch (error) {
    // TODO: log `❌ Error reading postcss.config.js: ${error.message}`
  }
  
  // 4. Verificar Vite
  // TODO: log '\n⚡ Vite Configuration:'
  // TODO: log '='.repeat(30)
  
  try {
    const viteConfig = fs.readFileSync(path.join(__dirname, '..', 'vite.config.ts'), 'utf8');
    const hasReact = viteConfig.includes('@vitejs/plugin-react');
    const hasCss = viteConfig.includes('css');
    
    // TODO: log `✅ React Plugin: ${hasReact ? 'Configured' : 'Missing'}`
    // TODO: log `✅ CSS Support: ${hasCss ? 'Configured' : 'Missing'}`
  } catch (error) {
    // TODO: log `❌ Error reading vite.config.ts: ${error.message}`
  }
  
  // 5. Verificar package.json
  // TODO: log '\n📦 Dependencies Check:'
  // TODO: log '='.repeat(30)
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};
    
    const requiredPackages = [
      'tailwindcss',
      'postcss',
      'autoprefixer',
      'tailwindcss-animate'
    ];
    
    requiredPackages.forEach(pkg => {
      const version = dependencies[pkg] || devDependencies[pkg];
      if (version) {
        // TODO: log `✅ ${pkg}: ${version}`
      } else {
        // TODO: log `❌ ${pkg}: Missing`
      }
    });
  } catch (error) {
    // TODO: log `❌ Error reading package.json: ${error.message}`
  }
  
  // 6. Verificar archivo CSS principal
  // TODO: log '\n🎨 Main CSS File:'
  // TODO: log '='.repeat(30)
  
  try {
    const indexCss = fs.readFileSync(path.join(__dirname, '..', 'src', 'index.css'), 'utf8');
    const hasTailwindDirectives = indexCss.includes('@tailwind');
    const hasCustomStyles = indexCss.includes('@layer');
    const hasVariables = indexCss.includes('--background');
    
    // TODO: log `✅ Tailwind directives: ${hasTailwindDirectives ? 'Present' : 'Missing'}`
    // TODO: log `✅ Custom layers: ${hasCustomStyles ? 'Present' : 'Missing'}`
    // TODO: log `✅ CSS variables: ${hasVariables ? 'Present' : 'Missing'}`
    
    // Verificar directivas específicas
    const directives = ['@tailwind base', '@tailwind components', '@tailwind utilities'];
    directives.forEach(directive => {
      const hasDirective = indexCss.includes(directive);
      // TODO: log `   ${hasDirective ? '✅' : '❌'} ${directive}`
    });
  } catch (error) {
    // TODO: log `❌ Error reading src/index.css: ${error.message}`
  }
  
  // 7. Recomendaciones
  // TODO: log '\n💡 Troubleshooting Steps:'
  // TODO: log '='.repeat(30)
  // TODO: log '1. Clear browser cache and reload'
  // TODO: log '2. Check browser console for CSS errors'
  // TODO: log '3. Verify Tailwind classes are being applied'
  // TODO: log '4. Check if CSS is being loaded in Network tab'
  // TODO: log '5. Try adding a test class like "bg-red-500"'
  // TODO: log '6. Restart the development server'
  
  // TODO: log '\n🔧 Quick Fix Commands:'
  // TODO: log '='.repeat(30)
  // TODO: log 'npm run dev -- --force'
  // TODO: log 'npm run build'
  // TODO: log 'rm -rf node_modules && npm install'
  
  // TODO: log '\n' + '='.repeat(60)
  // TODO: log '🎨 CSS DEBUG COMPLETED'
  // TODO: log '='.repeat(60)
}

debugStyles(); 