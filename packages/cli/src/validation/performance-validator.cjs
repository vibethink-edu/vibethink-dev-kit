#!/usr/bin/env node

/**
 * Performance Validator - VibeThink Orchestrator
 * Validates performance metrics and optimization standards
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class PerformanceValidator {
  constructor() {
    this.projectRoot = process.cwd();
    this.errors = [];
    this.warnings = [];
    this.success = [];
    this.metrics = {};
  }

  async validate() {
    console.log("🚀 Iniciando validación de performance...\n");

    try {
      await this.checkBundleSize();
      await this.checkDependencySize();
      await this.checkImageOptimization();
      await this.checkCodeSplitting();
      await this.checkCachingStrategy();
      await this.checkPerformanceConfig();
      await this.generateReport();

      this.printResults();
      return this.errors.length === 0;
    } catch (error) {
      console.error("❌ Error durante validación:", error.message);
      return false;
    }
  }

  async checkBundleSize() {
    console.log("📦 Analizando tamaño de bundles...");

    try {
      // Verificar si existe build
      const nextPath = path.join(this.projectRoot, ".next");
      if (!fs.existsSync(nextPath)) {
        this.warnings.push("⚠️ Build de Next.js no encontrado - ejecutar npm run build");
        return;
      }

      // Analizar archivos de build
      const staticPath = path.join(nextPath, "static");
      if (fs.existsSync(staticPath)) {
        const bundleInfo = this.analyzeBundleSize(staticPath);
        this.metrics.bundleSize = bundleInfo;

        if (bundleInfo.totalSize < 1024 * 1024) {
          // < 1MB
          this.success.push(`✅ Bundle total: ${this.formatBytes(bundleInfo.totalSize)} (óptimo)`);
        } else if (bundleInfo.totalSize < 3 * 1024 * 1024) {
          // < 3MB
          this.warnings.push(
            `⚠️ Bundle total: ${this.formatBytes(bundleInfo.totalSize)} (aceptable)`
          );
        } else {
          this.errors.push(
            `❌ Bundle total: ${this.formatBytes(bundleInfo.totalSize)} (muy grande)`
          );
        }

        // Verificar chunks individuales
        const largeChunks = bundleInfo.chunks.filter((chunk) => chunk.size > 500 * 1024);
        if (largeChunks.length > 0) {
          this.warnings.push(`⚠️ ${largeChunks.length} chunks grandes detectados`);
        } else {
          this.success.push("✅ Tamaños de chunks dentro de límites recomendados");
        }
      }
    } catch (error) {
      this.warnings.push("⚠️ No se pudo analizar el tamaño del bundle");
    }
  }

  analyzeBundleSize(staticPath) {
    const chunks = [];
    let totalSize = 0;

    const scanDirectory = (dirPath) => {
      const items = fs.readdirSync(dirPath);

      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
          scanDirectory(itemPath);
        } else if (item.endsWith(".js") || item.endsWith(".css")) {
          chunks.push({
            name: item,
            size: stat.size,
            type: item.endsWith(".js") ? "javascript" : "css",
          });
          totalSize += stat.size;
        }
      }
    };

    scanDirectory(staticPath);

    return { chunks, totalSize };
  }

  async checkDependencySize() {
    console.log("📚 Analizando tamaño de dependencias...");

    const packageJsonPath = path.join(this.projectRoot, "package.json");
    if (!fs.existsSync(packageJsonPath)) {
      this.errors.push("❌ package.json no encontrado");
      return;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const dependencies = packageJson.dependencies || {};

    // Dependencias pesadas conocidas
    const heavyDependencies = {
      "@tiptap/starter-kit": "Editor de texto rico",
      recharts: "Librería de gráficos",
      swiper: "Carrusel/slider",
      "@fullcalendar/core": "Calendario",
    };

    let heavyCount = 0;
    for (const [dep, description] of Object.entries(heavyDependencies)) {
      if (dependencies[dep]) {
        this.warnings.push(`⚠️ Dependencia pesada: ${dep} (${description})`);
        heavyCount++;
      }
    }

    if (heavyCount === 0) {
      this.success.push("✅ No se detectaron dependencias pesadas conocidas");
    }

    // Verificar número total de dependencias
    const depCount = Object.keys(dependencies).length;
    if (depCount < 30) {
      this.success.push(`✅ Número de dependencias óptimo: ${depCount}`);
    } else if (depCount < 50) {
      this.warnings.push(`⚠️ Número de dependencias moderado: ${depCount}`);
    } else {
      this.warnings.push(`⚠️ Número alto de dependencias: ${depCount} - considerar optimización`);
    }

    this.metrics.dependencyCount = depCount;
  }

  async checkImageOptimization() {
    console.log("🖼️ Verificando optimización de imágenes...");

    const publicPath = path.join(this.projectRoot, "public");
    if (!fs.existsSync(publicPath)) {
      this.warnings.push("⚠️ Directorio public/ no encontrado");
      return;
    }

    const imageInfo = this.analyzeImages(publicPath);
    this.metrics.images = imageInfo;

    if (imageInfo.unoptimized.length > 0) {
      this.warnings.push(`⚠️ ${imageInfo.unoptimized.length} imágenes sin optimizar detectadas`);
    } else {
      this.success.push("✅ Todas las imágenes parecen estar optimizadas");
    }

    if (imageInfo.totalSize > 5 * 1024 * 1024) {
      // > 5MB
      this.warnings.push(`⚠️ Tamaño total de imágenes: ${this.formatBytes(imageInfo.totalSize)}`);
    } else {
      this.success.push(`✅ Tamaño total de imágenes: ${this.formatBytes(imageInfo.totalSize)}`);
    }

    // Verificar Next.js Image component usage
    this.checkImageComponentUsage();
  }

  analyzeImages(publicPath) {
    const images = [];
    const unoptimized = [];
    let totalSize = 0;

    const scanDirectory = (dirPath) => {
      const items = fs.readdirSync(dirPath);

      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
          scanDirectory(itemPath);
        } else if (/\.(jpg|jpeg|png|gif|svg|webp)$/i.test(item)) {
          const imageInfo = {
            name: item,
            size: stat.size,
            path: itemPath,
          };

          images.push(imageInfo);
          totalSize += stat.size;

          // Verificar si la imagen es muy grande
          if (stat.size > 500 * 1024 && !item.endsWith(".svg")) {
            // > 500KB
            unoptimized.push(imageInfo);
          }
        }
      }
    };

    scanDirectory(publicPath);

    return { images, unoptimized, totalSize };
  }

  checkImageComponentUsage() {
    const srcPath = path.join(this.projectRoot, "src");
    const appsPath = path.join(this.projectRoot, "apps");

    let nextImageUsage = 0;
    let regularImgUsage = 0;

    const scanForImages = (dirPath) => {
      if (!fs.existsSync(dirPath)) return;

      const items = fs.readdirSync(dirPath);

      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory() && !item.startsWith(".") && item !== "node_modules") {
          scanForImages(itemPath);
        } else if (item.endsWith(".tsx") || item.endsWith(".jsx")) {
          const content = fs.readFileSync(itemPath, "utf8");

          if (content.includes("next/image")) {
            nextImageUsage++;
          }

          const imgMatches = content.match(/<img[^>]*>/g) || [];
          regularImgUsage += imgMatches.length;
        }
      }
    };

    scanForImages(srcPath);
    scanForImages(appsPath);

    if (nextImageUsage > regularImgUsage) {
      this.success.push(
        `✅ Uso predominante de Next.js Image component (${nextImageUsage} vs ${regularImgUsage})`
      );
    } else if (regularImgUsage > 0) {
      this.warnings.push(
        `⚠️ ${regularImgUsage} tags <img> detectados - considerar usar Next.js Image`
      );
    }
  }

  async checkCodeSplitting() {
    console.log("✂️ Verificando code splitting...");

    const srcPath = path.join(this.projectRoot, "src");
    const appsPath = path.join(this.projectRoot, "apps");

    let lazyImports = 0;
    let dynamicImports = 0;

    const scanForSplitting = (dirPath) => {
      if (!fs.existsSync(dirPath)) return;

      const items = fs.readdirSync(dirPath);

      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory() && !item.startsWith(".") && item !== "node_modules") {
          scanForSplitting(itemPath);
        } else if (item.endsWith(".tsx") || item.endsWith(".ts")) {
          const content = fs.readFileSync(itemPath, "utf8");

          if (content.includes("React.lazy") || content.includes("lazy(")) {
            lazyImports++;
          }

          if (content.includes("import(")) {
            dynamicImports++;
          }
        }
      }
    };

    scanForSplitting(srcPath);
    scanForSplitting(appsPath);

    if (lazyImports > 0 || dynamicImports > 0) {
      this.success.push(
        `✅ Code splitting implementado: ${lazyImports} lazy, ${dynamicImports} dynamic`
      );
    } else {
      this.warnings.push("⚠️ No se detectó code splitting - considerar para mejorar performance");
    }

    this.metrics.codeSplitting = { lazyImports, dynamicImports };
  }

  async checkCachingStrategy() {
    console.log("🗄️ Verificando estrategia de cache...");

    const nextConfigPath = path.join(this.projectRoot, "next.config.js");
    const nextConfigMjsPath = path.join(this.projectRoot, "next.config.mjs");

    let hasNextConfig = false;
    let cacheConfig = null;

    if (fs.existsSync(nextConfigPath)) {
      hasNextConfig = true;
      const content = fs.readFileSync(nextConfigPath, "utf8");
      cacheConfig = this.analyzeCacheConfig(content);
    } else if (fs.existsSync(nextConfigMjsPath)) {
      hasNextConfig = true;
      const content = fs.readFileSync(nextConfigMjsPath, "utf8");
      cacheConfig = this.analyzeCacheConfig(content);
    }

    if (hasNextConfig) {
      this.success.push("✅ Configuración de Next.js encontrada");

      if (cacheConfig.hasHeaders) {
        this.success.push("✅ Headers de cache configurados");
      } else {
        this.warnings.push("⚠️ Headers de cache no configurados en next.config");
      }
    } else {
      this.warnings.push("⚠️ next.config.js no encontrado - cache por defecto");
    }

    // Verificar service worker
    const swPath = path.join(this.projectRoot, "public", "sw.js");
    if (fs.existsSync(swPath)) {
      this.success.push("✅ Service Worker detectado");
    } else {
      this.warnings.push("⚠️ Service Worker no encontrado - considerar para cache offline");
    }
  }

  analyzeCacheConfig(content) {
    return {
      hasHeaders: content.includes("headers") && content.includes("Cache-Control"),
      hasCompression: content.includes("compress"),
      hasOptimization: content.includes("optimization"),
    };
  }

  async checkPerformanceConfig() {
    console.log("⚙️ Verificando configuración de performance...");

    const packageJsonPath = path.join(this.projectRoot, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    // Verificar scripts de build optimizados
    const buildScript = packageJson.scripts?.build || "";
    if (buildScript.includes("build")) {
      this.success.push("✅ Script de build configurado");
    } else {
      this.warnings.push("⚠️ Script de build no encontrado");
    }

    // Verificar configuración de TypeScript
    const tsconfigPath = path.join(this.projectRoot, "tsconfig.json");
    if (fs.existsSync(tsconfigPath)) {
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf8"));

      if (
        tsconfig.compilerOptions?.target === "es2017" ||
        tsconfig.compilerOptions?.target === "es2018" ||
        tsconfig.compilerOptions?.target === "es2020"
      ) {
        this.success.push("✅ Target de TypeScript optimizado");
      } else {
        this.warnings.push("⚠️ Target de TypeScript puede optimizarse");
      }
    }

    // Verificar configuración de Tailwind
    const tailwindConfigPath = path.join(this.projectRoot, "tailwind.config.ts");
    if (fs.existsSync(tailwindConfigPath)) {
      const content = fs.readFileSync(tailwindConfigPath, "utf8");

      if (content.includes("purge") || content.includes("content")) {
        this.success.push("✅ Purging de CSS configurado en Tailwind");
      } else {
        this.warnings.push("⚠️ Purging de CSS no configurado en Tailwind");
      }
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  async generateReport() {
    const reportPath = path.join(this.projectRoot, "docs", "reports", "quality");

    if (!fs.existsSync(reportPath)) {
      fs.mkdirSync(reportPath, { recursive: true });
    }

    const timestamp = new Date().toISOString().split("T")[0];
    const reportFile = path.join(reportPath, `${timestamp}-performance-validation.md`);

    const report = `# Performance Validation Report - ${timestamp}

## 📊 Resumen
- ✅ Validaciones exitosas: ${this.success.length}
- ⚠️ Advertencias: ${this.warnings.length}  
- ❌ Errores críticos: ${this.errors.length}

## 📈 Métricas de Performance
${this.generateMetricsSection()}

## ✅ Validaciones Exitosas
${this.success.map((item) => `- ${item}`).join("\n")}

## ⚠️ Advertencias
${this.warnings.map((item) => `- ${item}`).join("\n")}

## ❌ Errores Críticos
${this.errors.map((item) => `- ${item}`).join("\n")}

## 🎯 Recomendaciones de Optimización

### Bundle Size
- Mantener bundles principales < 1MB
- Usar code splitting para rutas
- Lazy loading para componentes pesados

### Imágenes
- Usar Next.js Image component
- Formato WebP cuando sea posible
- Optimizar imágenes > 500KB

### Caching
- Configurar headers de cache en next.config.js
- Implementar service worker para cache offline
- Usar ISR (Incremental Static Regeneration) cuando sea apropiado

### Dependencies
- Auditar dependencias pesadas regularmente
- Usar tree shaking para eliminar código no usado
- Considerar alternativas más ligeras

---
*Generado automáticamente por VibeThink Orchestrator Performance Validator*
`;

    fs.writeFileSync(reportFile, report);
    console.log(`📄 Reporte generado: ${reportFile}`);
  }

  generateMetricsSection() {
    const sections = [];

    if (this.metrics.bundleSize) {
      sections.push(`### Bundle Size
- **Total**: ${this.formatBytes(this.metrics.bundleSize.totalSize)}
- **Chunks**: ${this.metrics.bundleSize.chunks.length}
- **JavaScript**: ${this.metrics.bundleSize.chunks.filter((c) => c.type === "javascript").length}
- **CSS**: ${this.metrics.bundleSize.chunks.filter((c) => c.type === "css").length}`);
    }

    if (this.metrics.dependencyCount) {
      sections.push(`### Dependencies
- **Total**: ${this.metrics.dependencyCount} paquetes`);
    }

    if (this.metrics.images) {
      sections.push(`### Images
- **Total**: ${this.metrics.images.images.length} archivos
- **Size**: ${this.formatBytes(this.metrics.images.totalSize)}
- **Unoptimized**: ${this.metrics.images.unoptimized.length}`);
    }

    if (this.metrics.codeSplitting) {
      sections.push(`### Code Splitting
- **Lazy Imports**: ${this.metrics.codeSplitting.lazyImports}
- **Dynamic Imports**: ${this.metrics.codeSplitting.dynamicImports}`);
    }

    return sections.join("\n\n");
  }

  printResults() {
    console.log("\n📊 Resultados de Validación de Performance:");
    console.log(`✅ Validaciones exitosas: ${this.success.length}`);
    console.log(`⚠️ Advertencias: ${this.warnings.length}`);
    console.log(`❌ Errores críticos: ${this.errors.length}`);

    if (this.errors.length === 0) {
      console.log("\n✅ Performance dentro de estándares VibeThink Orchestrator");
    } else {
      console.log("\n❌ Se encontraron problemas críticos de performance");
    }
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const validator = new PerformanceValidator();
  validator
    .validate()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("Error fatal:", error);
      process.exit(1);
    });
}

module.exports = PerformanceValidator;
