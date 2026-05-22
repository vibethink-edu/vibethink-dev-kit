/**
 * 🚀 DEMOSTRACIÓN DEL SISTEMA DE MATERIAL COMERCIAL
 *
 * Este script demuestra cómo el sistema transforma FAQs en material comercial
 * personalizado para diferentes industrias y audiencias.
 *
 * @author Equipo AI Pair
 * @version 1.0.0
 * @date 2024-12-19
 */

const { CommercialMaterialGenerator, CONFIG } = require("./commercial-material-generator");
const fs = require("fs");
const path = require("path");

/**
 * 🎯 DEMOSTRACIÓN COMPLETA DEL SISTEMA
 */
class CommercialSystemDemo {
  constructor() {
    this.generator = new CommercialMaterialGenerator();
    this.demoResults = [];
  }

  /**
   * Ejecuta la demostración completa
   */
  async runFullDemo() {
    console.log("🚀 INICIANDO DEMOSTRACIÓN DEL SISTEMA DE MATERIAL COMERCIAL");
    console.log("=".repeat(80));

    // 1. Demostración por industria
    await this.demoByIndustry();

    // 2. Demostración por audiencia
    await this.demoByAudience();

    // 3. Demostración por tamaño de empresa
    await this.demoByCompanySize();

    // 4. Demostración de personalización avanzada
    await this.demoAdvancedCustomization();

    // 5. Generar reporte final
    await this.generateFinalReport();

    console.log("\n🎉 DEMOSTRACIÓN COMPLETADA EXITOSAMENTE!");
    console.log("📊 Revisa los archivos generados en: ./demo-output/");
  }

  /**
   * Demostración por industria
   */
  async demoByIndustry() {
    console.log("\n🏭 DEMOSTRACIÓN POR INDUSTRIA");
    console.log("-".repeat(50));

    const industries = Object.keys(CONFIG.industries);

    for (const industry of industries) {
      console.log(`\n📊 Generando material para: ${CONFIG.industries[industry].name}`);

      const config = {
        industry: industry,
        audience: "c-level",
        companySize: "sme",
      };

      const material = this.generator.generateAllMaterial(config);

      // Guardar material
      const outputDir = `./demo-output/industry/${industry}`;
      this.generator.saveMaterial(material, outputDir);

      // Mostrar resumen
      this.showMaterialSummary(material, `Industria: ${CONFIG.industries[industry].name}`);

      this.demoResults.push({
        type: "industry",
        industry: industry,
        material: material,
      });
    }
  }

  /**
   * Demostración por audiencia
   */
  async demoByAudience() {
    console.log("\n👥 DEMOSTRACIÓN POR AUDIENCIA");
    console.log("-".repeat(50));

    const audiences = Object.keys(CONFIG.audiences);

    for (const audience of audiences) {
      console.log(`\n📊 Generando material para: ${CONFIG.audiences[audience].name}`);

      const config = {
        industry: "manufacturing",
        audience: audience,
        companySize: "sme",
      };

      const material = this.generator.generateAllMaterial(config);

      // Guardar material
      const outputDir = `./demo-output/audience/${audience}`;
      this.generator.saveMaterial(material, outputDir);

      // Mostrar resumen
      this.showMaterialSummary(material, `Audiencia: ${CONFIG.audiences[audience].name}`);

      this.demoResults.push({
        type: "audience",
        audience: audience,
        material: material,
      });
    }
  }

  /**
   * Demostración por tamaño de empresa
   */
  async demoByCompanySize() {
    console.log("\n🏢 DEMOSTRACIÓN POR TAMAÑO DE EMPRESA");
    console.log("-".repeat(50));

    const companySizes = Object.keys(CONFIG.companySizes);

    for (const size of companySizes) {
      console.log(`\n📊 Generando material para: ${CONFIG.companySizes[size].name}`);

      const config = {
        industry: "manufacturing",
        audience: "c-level",
        companySize: size,
      };

      const material = this.generator.generateAllMaterial(config);

      // Guardar material
      const outputDir = `./demo-output/company-size/${size}`;
      this.generator.saveMaterial(material, outputDir);

      // Mostrar resumen
      this.showMaterialSummary(material, `Tamaño: ${CONFIG.companySizes[size].name}`);

      this.demoResults.push({
        type: "company-size",
        size: size,
        material: material,
      });
    }
  }

  /**
   * Demostración de personalización avanzada
   */
  async demoAdvancedCustomization() {
    console.log("\n🎨 DEMOSTRACIÓN DE PERSONALIZACIÓN AVANZADA");
    console.log("-".repeat(50));

    // Caso 1: Startup de educación
    console.log("\n📊 Caso 1: Startup de Educación");
    const config1 = {
      industry: "education",
      audience: "c-level",
      companySize: "startup",
    };
    const material1 = this.generator.generateAllMaterial(config1);
    this.generator.saveMaterial(material1, "./demo-output/custom/education-startup");
    this.showMaterialSummary(material1, "Startup de Educación");

    // Caso 2: Enterprise de salud
    console.log("\n📊 Caso 2: Enterprise de Salud");
    const config2 = {
      industry: "healthcare",
      audience: "it",
      companySize: "enterprise",
    };
    const material2 = this.generator.generateAllMaterial(config2);
    this.generator.saveMaterial(material2, "./demo-output/custom/healthcare-enterprise");
    this.showMaterialSummary(material2, "Enterprise de Salud");

    // Caso 3: SME de servicios financieros
    console.log("\n📊 Caso 3: SME de Servicios Financieros");
    const config3 = {
      industry: "financial",
      audience: "finance",
      companySize: "sme",
    };
    const material3 = this.generator.generateAllMaterial(config3);
    this.generator.saveMaterial(material3, "./demo-output/custom/financial-sme");
    this.showMaterialSummary(material3, "SME de Servicios Financieros");

    this.demoResults.push(
      { type: "custom", case: "education-startup", material: material1 },
      { type: "custom", case: "healthcare-enterprise", material: material2 },
      { type: "custom", case: "financial-sme", material: material3 }
    );
  }

  /**
   * Muestra resumen del material generado
   */
  showMaterialSummary(material, title) {
    console.log(`  📋 ${title}`);
    console.log(`  📊 Presentación: ${material.presentation.title}`);
    console.log(`  📱 Posts de marketing: ${material.marketing.length}`);
    console.log(`  📧 Email: ${material.email.subject}`);
    console.log(`  💰 ROI: ${material.roi.outputs.summary.roi}`);
    console.log(`  📈 Leads: ${material.dashboard.leads.totalLeads}`);
  }

  /**
   * Genera reporte final
   */
  async generateFinalReport() {
    console.log("\n📊 GENERANDO REPORTE FINAL");
    console.log("-".repeat(50));

    const report = {
      generatedAt: new Date().toISOString(),
      totalMaterials: this.demoResults.length,
      summary: this.generateSummary(),
      statistics: this.generateStatistics(),
      recommendations: this.generateRecommendations(),
    };

    // Guardar reporte
    const reportPath = "./demo-output/demo-report.json";
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Mostrar resumen
    console.log("\n📈 RESUMEN DE LA DEMOSTRACIÓN:");
    console.log(`  📊 Total de materiales generados: ${report.totalMaterials}`);
    console.log(`  🏭 Industrias cubiertas: ${Object.keys(CONFIG.industries).length}`);
    console.log(`  👥 Audiencias objetivo: ${Object.keys(CONFIG.audiences).length}`);
    console.log(`  🏢 Tamaños de empresa: ${Object.keys(CONFIG.companySizes).length}`);
    console.log(`  📁 Archivos generados: ${this.countGeneratedFiles()}`);
    console.log(`  💾 Reporte guardado en: ${reportPath}`);
  }

  /**
   * Genera resumen ejecutivo
   */
  generateSummary() {
    const industryCount = Object.keys(CONFIG.industries).length;
    const audienceCount = Object.keys(CONFIG.audiences).length;
    const sizeCount = Object.keys(CONFIG.companySizes).length;

    return {
      totalCombinations: industryCount * audienceCount * sizeCount,
      industries: industryCount,
      audiences: audienceCount,
      companySizes: sizeCount,
      materialsGenerated: this.demoResults.length,
      averageROI: this.calculateAverageROI(),
      averageSavings: this.calculateAverageSavings(),
    };
  }

  /**
   * Genera estadísticas
   */
  generateStatistics() {
    const stats = {
      byIndustry: {},
      byAudience: {},
      byCompanySize: {},
      roiDistribution: {
        low: 0, // 0-200%
        medium: 0, // 200-400%
        high: 0, // 400%+
      },
    };

    this.demoResults.forEach((result) => {
      const roi = Number.parseFloat(result.material.roi.outputs.summary.roi);

      if (roi < 200) stats.roiDistribution.low++;
      else if (roi < 400) stats.roiDistribution.medium++;
      else stats.roiDistribution.high++;

      if (result.industry) {
        stats.byIndustry[result.industry] = (stats.byIndustry[result.industry] || 0) + 1;
      }
      if (result.audience) {
        stats.byAudience[result.audience] = (stats.byAudience[result.audience] || 0) + 1;
      }
      if (result.size) {
        stats.byCompanySize[result.size] = (stats.byCompanySize[result.size] || 0) + 1;
      }
    });

    return stats;
  }

  /**
   * Genera recomendaciones
   */
  generateRecommendations() {
    return [
      {
        type: "optimization",
        title: "Optimización de ROI",
        description: "Los materiales para empresas enterprise muestran ROI más alto",
        action: "Enfocar esfuerzos comerciales en empresas enterprise",
      },
      {
        type: "content",
        title: "Contenido por Industria",
        description: "La industria manufacturera genera más engagement",
        action: "Desarrollar más casos de uso para manufactura",
      },
      {
        type: "audience",
        title: "Audiencia C-Level",
        description: "Las presentaciones para C-Level tienen mayor conversión",
        action: "Priorizar contenido ejecutivo en campañas",
      },
      {
        type: "customization",
        title: "Personalización Avanzada",
        description: "Los materiales personalizados muestran mejor performance",
        action: "Implementar sistema de personalización automática",
      },
    ];
  }

  /**
   * Calcula ROI promedio
   */
  calculateAverageROI() {
    const rois = this.demoResults.map((result) =>
      Number.parseFloat(result.material.roi.outputs.summary.roi)
    );
    return rois.reduce((sum, roi) => sum + roi, 0) / rois.length;
  }

  /**
   * Calcula ahorros promedio
   */
  calculateAverageSavings() {
    const savings = this.demoResults.map((result) =>
      Number.parseFloat(result.material.roi.outputs.summary.annualSavings.replace(/[$,]/g, ""))
    );
    return savings.reduce((sum, saving) => sum + saving, 0) / savings.length;
  }

  /**
   * Cuenta archivos generados
   */
  countGeneratedFiles() {
    let count = 0;
    const countFiles = (dir) => {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        files.forEach((file) => {
          const filePath = path.join(dir, file);
          if (fs.statSync(filePath).isDirectory()) {
            countFiles(filePath);
          } else {
            count++;
          }
        });
      }
    };

    countFiles("./demo-output");
    return count;
  }
}

/**
 * 🎯 DEMOSTRACIÓN INTERACTIVA
 */
class InteractiveDemo {
  constructor() {
    this.generator = new CommercialMaterialGenerator();
  }

  /**
   * Ejecuta demostración interactiva
   */
  async runInteractiveDemo() {
    console.log("🎮 DEMOSTRACIÓN INTERACTIVA DEL SISTEMA");
    console.log("=".repeat(60));

    // Simular entrada del usuario
    const userInput = this.simulateUserInput();

    console.log("\n👤 CONFIGURACIÓN DEL USUARIO:");
    console.log(`  🏭 Industria: ${userInput.industry}`);
    console.log(`  👥 Audiencia: ${userInput.audience}`);
    console.log(`  🏢 Tamaño: ${userInput.companySize}`);

    // Generar material personalizado
    console.log("\n🚀 GENERANDO MATERIAL PERSONALIZADO...");
    const material = this.generator.generateAllMaterial(userInput);

    // Mostrar resultados
    this.showInteractiveResults(material, userInput);

    // Guardar material
    const outputDir = `./demo-output/interactive/${userInput.industry}-${userInput.audience}-${userInput.companySize}`;
    this.generator.saveMaterial(material, outputDir);

    console.log(`\n✅ Material guardado en: ${outputDir}`);
  }

  /**
   * Simula entrada del usuario
   */
  simulateUserInput() {
    const industries = Object.keys(CONFIG.industries);
    const audiences = Object.keys(CONFIG.audiences);
    const sizes = Object.keys(CONFIG.companySizes);

    return {
      industry: industries[Math.floor(Math.random() * industries.length)],
      audience: audiences[Math.floor(Math.random() * audiences.length)],
      companySize: sizes[Math.floor(Math.random() * sizes.length)],
    };
  }

  /**
   * Muestra resultados interactivos
   */
  showInteractiveResults(material, config) {
    const industry = CONFIG.industries[config.industry];
    const audience = CONFIG.audiences[config.audience];
    const size = CONFIG.companySizes[config.companySize];

    console.log("\n📊 RESULTADOS GENERADOS:");
    console.log("=".repeat(40));

    console.log(`\n📋 PRESENTACIÓN:`);
    console.log(`  Título: ${material.presentation.title}`);
    console.log(`  Diapositivas: ${material.presentation.slides.length}`);
    console.log(
      `  Duración total: ${this.calculatePresentationDuration(material.presentation.slides)} minutos`
    );

    console.log(`\n📱 MARKETING:`);
    console.log(`  Posts generados: ${material.marketing.length}`);
    console.log(`  Plataforma: ${material.marketing[0].platform}`);
    console.log(`  Hashtags: ${material.marketing[0].hashtags.join(", ")}`);

    console.log(`\n📧 EMAIL:`);
    console.log(`  Asunto: ${material.email.subject}`);
    console.log(`  CTA: ${material.email.cta.text}`);

    console.log(`\n💰 ROI CALCULATOR:`);
    console.log(`  Ahorro anual: ${material.roi.outputs.summary.annualSavings}`);
    console.log(`  ROI: ${material.roi.outputs.summary.roi}`);
    console.log(`  Payback: ${material.roi.outputs.summary.paybackMonths} meses`);

    console.log(`\n📈 DASHBOARD:`);
    console.log(`  Leads totales: ${material.dashboard.leads.totalLeads}`);
    console.log(`  Tasa de conversión: ${material.dashboard.conversions.conversionRate}%`);
    console.log(
      `  Revenue mensual: $${material.dashboard.revenue.monthlyRevenue.toLocaleString()}`
    );
  }

  /**
   * Calcula duración de presentación
   */
  calculatePresentationDuration(slides) {
    return slides.reduce((total, slide) => {
      const duration = Number.parseInt(slide.duration) || 0;
      return total + duration;
    }, 0);
  }
}

/**
 * 🎯 FUNCIÓN PRINCIPAL
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--interactive")) {
    const interactiveDemo = new InteractiveDemo();
    await interactiveDemo.runInteractiveDemo();
  } else {
    const fullDemo = new CommercialSystemDemo();
    await fullDemo.runFullDemo();
  }
}

// Exportar para uso en otros módulos
module.exports = {
  CommercialSystemDemo,
  InteractiveDemo,
  main,
};

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(console.error);
}
