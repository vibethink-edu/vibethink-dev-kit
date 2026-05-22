#!/usr/bin/env node

/**
 * Script de Demostración: Generación Automática de Resúmenes desde FAQs
 *
 * Este script demuestra cómo se pueden generar resúmenes automáticamente
 * desde FAQs estructuradas, creando documentación replicable y mantenible.
 */

const fs = require("fs");
const path = require("path");

class FAQSummaryGenerator {
  constructor() {
    this.faqs = [];
    this.summaries = {
      executive: [],
      technical: [],
      user: [],
      implementation: [],
    };
  }

  // Cargar FAQs desde el directorio
  loadFAQs() {
    const faqDir = path.join(__dirname, "../faqs");

    if (!fs.existsSync(faqDir)) {
      console.log("⚠️  Directorio de FAQs no encontrado. Creando estructura de ejemplo...");
      this.createExampleFAQs();
      return;
    }

    console.log("📁 Cargando FAQs desde:", faqDir);

    // Recorrer categorías
    const categories = fs.readdirSync(faqDir);

    categories.forEach((category) => {
      const categoryPath = path.join(faqDir, category);

      if (fs.statSync(categoryPath).isDirectory()) {
        console.log(`  📂 Categoría: ${category}`);

        const files = fs.readdirSync(categoryPath);

        files.forEach((file) => {
          if (file.endsWith(".md")) {
            const faq = this.parseFAQ(path.join(categoryPath, file), category);
            this.faqs.push(faq);
            console.log(`    ✅ ${file}`);
          }
        });
      }
    });

    console.log(`📊 Total de FAQs cargadas: ${this.faqs.length}`);
  }

  // Parsear FAQ individual
  parseFAQ(filePath, category) {
    const content = fs.readFileSync(filePath, "utf8");

    return {
      file: path.basename(filePath),
      category: category,
      question: this.extractQuestion(content),
      answer: this.extractAnswer(content),
      scope: this.extractScope(content),
      examples: this.extractExamples(content),
      cases: this.extractCases(content),
      metrics: this.extractMetrics(content),
    };
  }

  // Extraer pregunta
  extractQuestion(content) {
    const match = content.match(/\*\*P:\*\* (.+)/);
    return match ? match[1].trim() : "";
  }

  // Extraer respuesta
  extractAnswer(content) {
    const match = content.match(/\*\*A:\*\* (.+)/);
    return match ? match[1].trim() : "";
  }

  // Extraer alcance
  extractScope(content) {
    const automatic = [];
    const manual = [];

    const lines = content.split("\n");
    let inScope = false;

    lines.forEach((line) => {
      if (line.includes("### Alcance")) {
        inScope = true;
      } else if (inScope && line.includes("✅")) {
        automatic.push(line.replace("✅", "").replace("**", "").trim());
      } else if (inScope && line.includes("❌")) {
        manual.push(line.replace("❌", "").replace("**", "").trim());
      } else if (inScope && line.startsWith("##")) {
        inScope = false;
      }
    });

    return { automatic, manual };
  }

  // Extraer ejemplos
  extractExamples(content) {
    const examples = [];
    const codeBlocks = content.match(/```typescript\n([\s\S]*?)\n```/g);

    if (codeBlocks) {
      codeBlocks.forEach((block) => {
        examples.push(block.replace(/```typescript\n/, "").replace(/\n```/, ""));
      });
    }

    return examples;
  }

  // Extraer casos de uso
  extractCases(content) {
    const cases = [];
    const lines = content.split("\n");
    let inCases = false;

    lines.forEach((line) => {
      if (line.includes("### Casos de Uso")) {
        inCases = true;
      } else if (inCases && line.startsWith("- **")) {
        cases.push(line.replace("- **", "").replace("**:", ":"));
      } else if (inCases && line.startsWith("##")) {
        inCases = false;
      }
    });

    return cases;
  }

  // Extraer métricas
  extractMetrics(content) {
    const metrics = {};
    const lines = content.split("\n");
    let inMetrics = false;

    lines.forEach((line) => {
      if (line.includes("### MÉTRICAS")) {
        inMetrics = true;
      } else if (inMetrics && line.includes(":")) {
        const [key, value] = line.split(":").map((s) => s.trim());
        if (key && value) {
          metrics[key] = value;
        }
      } else if (inMetrics && line.startsWith("##")) {
        inMetrics = false;
      }
    });

    return metrics;
  }

  // Generar resumen ejecutivo
  generateExecutiveSummary() {
    console.log("📋 Generando resumen ejecutivo...");

    const overview = this.generateOverview();
    const principles = this.extractPrinciples();
    const scope = this.calculateOverallScope();
    const benefits = this.calculateBenefits();

    const summary = `# 📋 Resumen Ejecutivo del Sistema AI Pair

## 🎯 Visión General
${overview}

## 🤖 Principios Fundamentales
${principles}

## 📊 Alcance Definido
${scope}

## 🚀 Beneficios Esperados
${benefits}

## 📈 Métricas de Éxito
${this.generateMetricsSummary()}

---
**Generado automáticamente** desde ${this.faqs.length} FAQs el ${new Date().toLocaleDateString()}
**Versión**: 1.0.0
`;

    return summary;
  }

  // Generar resumen técnico
  generateTechnicalSummary() {
    console.log("🔧 Generando resumen técnico...");

    const architecture = this.extractArchitecture();
    const integrations = this.extractIntegrations();
    const apis = this.extractAPIs();

    const summary = `# 🔧 Resumen Técnico del Sistema AI Pair

## 🏗️ Arquitectura
${architecture}

## 🔄 Integraciones
${integrations}

## 🔧 APIs y Endpoints
${apis}

## 📊 Cobertura Técnica
${this.generateTechnicalCoverage()}

---
**Generado automáticamente** desde ${this.faqs.length} FAQs el ${new Date().toLocaleDateString()}
**Versión**: 1.0.0
`;

    return summary;
  }

  // Generar guía de usuario
  generateUserGuide() {
    console.log("👥 Generando guía de usuario...");

    const gettingStarted = this.extractGettingStarted();
    const features = this.extractFeatures();
    const workflows = this.extractWorkflows();

    const guide = `# 👥 Guía de Usuario del Sistema AI Pair

## 🚀 Primeros Pasos
${gettingStarted}

## 🎯 Funcionalidades Principales
${features}

## 🔄 Flujos de Trabajo
${workflows}

## 🔧 Solución de Problemas Comunes
${this.generateTroubleshooting()}

---
**Generado automáticamente** desde ${this.faqs.length} FAQs el ${new Date().toLocaleDateString()}
**Versión**: 1.0.0
`;

    return guide;
  }

  // Métodos auxiliares para generar contenido
  generateOverview() {
    const philosophyFAQs = this.faqs.filter((faq) => faq.category === "philosophy");

    if (philosophyFAQs.length > 0) {
      const mainFAQ = philosophyFAQs[0];
      return `El Sistema AI Pair es una plataforma SaaS empresarial que implementa la **filosofía de asistencia inteligente**, donde los agentes IA ayudan a los humanos a ser más eficientes sin reemplazarlos.

**Principio fundamental**: "${mainFAQ.answer}"

El sistema se basa en 4 principios cardinales que garantizan transparencia, control humano y asistencia progresiva.`;
    }

    return "El Sistema AI Pair es una plataforma de automatización empresarial basada en IA asistencial.";
  }

  extractPrinciples() {
    const principles = [
      "**Asistencia Progresiva**: Los agentes ayudan hasta donde pueden de forma segura",
      "**Automatización Inteligente**: Solo automatizan lo que es claro y seguro",
      "**Transparencia Total**: Siempre explican qué pueden y qué no pueden hacer",
      "**Control Humano**: El usuario siempre tiene el control final",
    ];

    return principles.map((p) => `- ${p}`).join("\n");
  }

  calculateOverallScope() {
    let totalAutomatic = 0;
    let totalManual = 0;

    this.faqs.forEach((faq) => {
      totalAutomatic += faq.scope.automatic.length;
      totalManual += faq.scope.manual.length;
    });

    const total = totalAutomatic + totalManual;
    const automaticPercentage = total > 0 ? Math.round((totalAutomatic / total) * 100) : 80;
    const manualPercentage = 100 - automaticPercentage;

    return `- **${automaticPercentage}% automatización** de tareas operativas
- **${manualPercentage}% intervención humana** en casos complejos
- **100% transparencia** en todas las operaciones
- **100% control** humano en decisiones críticas`;
  }

  calculateBenefits() {
    const benefits = {
      timeSavings: 0,
      errorReduction: 0,
      productivityImprovement: 0,
    };

    this.faqs.forEach((faq) => {
      if (faq.metrics["Tiempo"]) {
        const timeMatch = faq.metrics["Tiempo"].match(/(\d+)/);
        if (timeMatch) {
          benefits.timeSavings += Number.parseInt(timeMatch[1]);
        }
      }
      if (faq.metrics["Errores"]) {
        const errorMatch = faq.metrics["Errores"].match(/(\d+)/);
        if (errorMatch) {
          benefits.errorReduction += Number.parseInt(errorMatch[1]);
        }
      }
      if (faq.metrics["Productividad"]) {
        const prodMatch = faq.metrics["Productividad"].match(/(\d+)/);
        if (prodMatch) {
          benefits.productivityImprovement += Number.parseInt(prodMatch[1]);
        }
      }
    });

    return `- **Reducción del ${Math.min(benefits.timeSavings, 80)}%** en tareas repetitivas
- **Mejora del ${Math.min(benefits.productivityImprovement, 60)}%** en productividad
- **Reducción del ${Math.min(benefits.errorReduction, 90)}%** en errores operativos
- **Ahorro del 70%** en tiempo administrativo`;
  }

  generateMetricsSummary() {
    const categories = [...new Set(this.faqs.map((faq) => faq.category))];

    return categories
      .map((category) => {
        const categoryFAQs = this.faqs.filter((faq) => faq.category === category);
        return `### ${category.charAt(0).toUpperCase() + category.slice(1)}
- **FAQs**: ${categoryFAQs.length}
- **Alcance**: ${this.calculateCategoryScope(categoryFAQs)}% automático
- **Cobertura**: ${this.calculateCategoryCoverage(categoryFAQs)}%`;
      })
      .join("\n\n");
  }

  calculateCategoryScope(faqs) {
    let totalAutomatic = 0;
    let totalManual = 0;

    faqs.forEach((faq) => {
      totalAutomatic += faq.scope.automatic.length;
      totalManual += faq.scope.manual.length;
    });

    const total = totalAutomatic + totalManual;
    return total > 0 ? Math.round((totalAutomatic / total) * 100) : 80;
  }

  calculateCategoryCoverage(faqs) {
    // Simulación de cobertura basada en número de FAQs
    return Math.min(faqs.length * 25, 100);
  }

  extractArchitecture() {
    return `### Componentes Principales
- **Agente Universal**: Funcionalidades transversales para todos los empleados
- **Agentes Especializados**: Por departamento (Contabilidad, Ventas, RRHH)
- **Sistema de Detección de Incertidumbre**: Identificación automática de casos complejos
- **Integración Multi-servicio**: Google Workspace, Microsoft 365, herramientas específicas

### Patrones Arquitectónicos
- **Arquitectura Headless**: Separación de lógica y presentación
- **Microservicios**: Servicios independientes por funcionalidad
- **Event-Driven**: Comunicación asíncrona entre componentes
- **Multi-tenant**: Aislamiento por empresa`;
  }

  extractIntegrations() {
    return `### Servicios Universales
- **Google Workspace**: Gmail, Calendar, Drive, Meet, Docs
- **Microsoft 365**: Outlook, Teams, OneDrive, SharePoint, Word
- **Herramientas de comunicación**: Slack, Zoom, Cal.com

### Servicios Específicos por Departamento
- **Contabilidad**: Siigo, Contasol, Sage (Colombia); Contpaq, Aspel (México)
- **Ventas**: Salesforce, HubSpot, Pipedrive
- **Recursos Humanos**: Workday, Bamboo, Gusto`;
  }

  extractAPIs() {
    return `### APIs Principales
- **Chat API**: Endpoints para comunicación con agentes
- **Workflow API**: Gestión de flujos de trabajo
- **Analytics API**: Métricas y reportes
- **Integration API**: Conectores con servicios externos

### Webhooks
- **Event Notifications**: Notificaciones en tiempo real
- **Status Updates**: Actualizaciones de estado de tareas
- **Error Alerts**: Alertas de errores y excepciones`;
  }

  generateTechnicalCoverage() {
    const categories = [...new Set(this.faqs.map((faq) => faq.category))];

    return categories
      .map((category) => {
        const categoryFAQs = this.faqs.filter((faq) => faq.category === category);
        const examples = categoryFAQs.reduce((acc, faq) => acc + faq.examples.length, 0);

        return `### ${category.charAt(0).toUpperCase() + category.slice(1)}
- **FAQs técnicas**: ${categoryFAQs.length}
- **Ejemplos de código**: ${examples}
- **Casos de uso**: ${categoryFAQs.reduce((acc, faq) => acc + faq.cases.length, 0)}`;
      })
      .join("\n\n");
  }

  extractGettingStarted() {
    return `### 1. Configuración Inicial
- Crear cuenta en la plataforma
- Configurar integraciones con servicios existentes
- Definir parámetros de empresa y departamento

### 2. Primeros Pasos
- Configurar agente universal para tareas básicas
- Probar funcionalidades de transcripción y organización
- Validar integraciones con herramientas existentes

### 3. Adopción Gradual
- Comenzar con tareas simples y repetitivas
- Expandir a funcionalidades más complejas
- Personalizar según necesidades específicas`;
  }

  extractFeatures() {
    const features = [];

    this.faqs.forEach((faq) => {
      if (faq.scope.automatic.length > 0) {
        features.push(`### ${faq.question}
${faq.answer}

**Funcionalidades automáticas:**
${faq.scope.automatic.map((f) => `- ${f}`).join("\n")}`);
      }
    });

    return features.join("\n\n");
  }

  extractWorkflows() {
    return `### Flujo de Trabajo Estándar
1. **Recepción**: El agente recibe información (email, documento, etc.)
2. **Análisis**: Evalúa si puede procesar automáticamente
3. **Procesamiento**: Ejecuta la tarea o notifica para intervención manual
4. **Seguimiento**: Crea tareas y recordatorios según sea necesario

### Flujo de Detección de Incertidumbre
1. **Evaluación**: El agente analiza la complejidad del caso
2. **Detección**: Identifica factores de incertidumbre
3. **Notificación**: Informa al usuario sobre la necesidad de intervención
4. **Guía**: Proporciona instrucciones para el procesamiento manual`;
  }

  generateTroubleshooting() {
    return `### Problemas Comunes y Soluciones

#### El agente no procesa un documento
**Causa**: Documento fuera del alcance automático
**Solución**: Revisar manualmente y clasificar según las reglas establecidas

#### Error en integración con servicio externo
**Causa**: Problema de conectividad o configuración
**Solución**: Verificar credenciales y configuración de integración

#### Notificación de incertidumbre frecuente
**Causa**: Documentos no estándar o reglas no claras
**Solución**: Revisar y ajustar reglas de clasificación automática`;
  }

  // Crear FAQs de ejemplo si no existen
  createExampleFAQs() {
    console.log("📝 Creando FAQs de ejemplo...");

    const faqDir = path.join(__dirname, "../faqs");
    const philosophyDir = path.join(faqDir, "philosophy");

    // Crear directorios
    if (!fs.existsSync(faqDir)) {
      fs.mkdirSync(faqDir, { recursive: true });
    }
    if (!fs.existsSync(philosophyDir)) {
      fs.mkdirSync(philosophyDir, { recursive: true });
    }

    // Crear FAQ de ejemplo
    const exampleFAQ = `# FAQ: 001-¿Qué es AI Pair?

## 🎯 **PREGUNTA PRINCIPAL**
**P:** ¿Qué es un Agente AI Pair?

**A:** Un Agente AI Pair es un **compañero inteligente** que **te ayuda** a realizar tus tareas diarias de manera más eficiente.

## 📋 **DETALLES TÉCNICOS**
### Alcance
- ✅ **Asiste** en tareas operativas repetitivas
- ✅ **Automatiza** procesos claros y definidos
- ❌ **NO reemplaza** el juicio humano
- ❌ **NO toma** decisiones estratégicas

### Ejemplos Prácticos
\`\`\`typescript
const ejemplo = {
  accion: 'PROCESAR_FACTURA',
  resultado: 'Procesamiento automático',
  tiempoAhorrado: '5 minutos'
};
\`\`\`

### Casos de Uso
- **Caso A**: Factura estándar → Procesamiento automático
- **Caso B**: Caso complejo → Intervención manual

## 📊 **MÉTRICAS**
- **Alcance**: 80% automático, 20% manual
- **Tiempo**: 70% de ahorro
- **Productividad**: 60% de mejora
- **Errores**: 90% de reducción`;

    fs.writeFileSync(path.join(philosophyDir, "001-what-is-ai-pair.md"), exampleFAQ);
    console.log("  ✅ FAQ de ejemplo creada");

    // Recargar FAQs
    this.loadFAQs();
  }

  // Guardar resúmenes generados
  saveSummaries() {
    const summariesDir = path.join(__dirname, "../summaries");

    if (!fs.existsSync(summariesDir)) {
      fs.mkdirSync(summariesDir, { recursive: true });
    }

    const executiveSummary = this.generateExecutiveSummary();
    const technicalSummary = this.generateTechnicalSummary();
    const userGuide = this.generateUserGuide();

    fs.writeFileSync(path.join(summariesDir, "executive-summary.md"), executiveSummary);
    fs.writeFileSync(path.join(summariesDir, "technical-summary.md"), technicalSummary);
    fs.writeFileSync(path.join(summariesDir, "user-guide.md"), userGuide);

    console.log("💾 Resúmenes guardados en:", summariesDir);
  }

  // Ejecutar generación completa
  run() {
    console.log("🚀 Iniciando generación automática de resúmenes...\n");

    this.loadFAQs();

    if (this.faqs.length === 0) {
      console.log("❌ No se encontraron FAQs para procesar");
      return;
    }

    console.log("\n📊 Generando resúmenes...");
    this.saveSummaries();

    console.log("\n✅ Generación completada exitosamente!");
    console.log(`📈 Se procesaron ${this.faqs.length} FAQs`);
    console.log("📁 Los resúmenes están disponibles en: docs/foundation/summaries/");
  }
}

// Ejecutar el generador
const generator = new FAQSummaryGenerator();
generator.run();
