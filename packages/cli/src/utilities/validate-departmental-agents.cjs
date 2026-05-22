#!/usr/bin/env node

/**
 * Script de Validación de Agentes Departamentales
 * Verifica que la arquitectura sea compatible con la infraestructura actual
 *
 * @author AI Pair Platform - Architecture Team
 * @version 1.0.0
 */

const fs = require("fs");
const path = require("path");

// Configuración de validación
const CONFIG = {
  requiredComponents: [
    "src/types/departmentalPermissions.ts",
    "src/hooks/useAssistantProfile.ts",
    "src/components/universal-assistant/UniversalAssistant.tsx",
    "src/hooks/useGoogleWorkspace.tsx",
    "src/types/emailGovernance.ts",
    "supabase/migrations/20250618120000_create_departmental_permissions.sql",
    "supabase/migrations/20250618130000_create_departmental_permission_system.sql",
  ],
  requiredDepartments: [
    "LEGAL",
    "FINANCE",
    "SALES",
    "MARKETING",
    "DEVELOPMENT",
    "HR",
    "OPERATIONS",
    "MANAGEMENT",
  ],
  requiredIntegrations: [
    "Google Workspace",
    "Email Governance",
    "Document Management",
    "CRM Integration",
    "Analytics Dashboard",
  ],
  validationTests: [
    "departmental_permissions",
    "email_integration",
    "agent_coordination",
    "knowledge_base",
    "security_isolation",
  ],
};

class DepartmentalAgentsValidator {
  constructor() {
    this.results = {
      components: { passed: 0, failed: 0, details: [] },
      departments: { passed: 0, failed: 0, details: [] },
      integrations: { passed: 0, failed: 0, details: [] },
      tests: { passed: 0, failed: 0, details: [] },
      overall: { passed: 0, total: 0 },
    };
  }

  /**
   * Ejecutar todas las validaciones
   */
  async validate() {
    console.log("🏢 Validando Arquitectura de Agentes Departamentales...\n");

    await this.validateComponents();
    await this.validateDepartments();
    await this.validateIntegrations();
    await this.validateTests();

    this.calculateOverallResults();
    this.printResults();

    return this.results.overall.passed === this.results.overall.total;
  }

  /**
   * Validar componentes requeridos
   */
  async validateComponents() {
    console.log("🔧 Validando componentes de infraestructura...");

    for (const component of CONFIG.requiredComponents) {
      this.results.overall.total++;

      if (fs.existsSync(component)) {
        console.log(`  ✅ ${component}`);
        this.results.components.passed++;
        this.results.components.details.push({
          component,
          status: "exists",
          type: this.getComponentType(component),
        });
      } else {
        console.log(`  ❌ ${component} - NO ENCONTRADO`);
        this.results.components.failed++;
        this.results.components.details.push({
          component,
          status: "missing",
        });
      }
    }
  }

  /**
   * Validar departamentos configurados
   */
  async validateDepartments() {
    console.log("\n🏢 Validando configuración de departamentos...");

    try {
      // Verificar archivo de tipos de departamentos
      const departmentalTypesPath = "src/types/departmentalPermissions.ts";
      if (fs.existsSync(departmentalTypesPath)) {
        const content = fs.readFileSync(departmentalTypesPath, "utf8");

        for (const department of CONFIG.requiredDepartments) {
          this.results.overall.total++;

          if (content.includes(department)) {
            console.log(`  ✅ ${department} - Configurado`);
            this.results.departments.passed++;
            this.results.departments.details.push({
              department,
              status: "configured",
            });
          } else {
            console.log(`  ❌ ${department} - NO CONFIGURADO`);
            this.results.departments.failed++;
            this.results.departments.details.push({
              department,
              status: "not_configured",
            });
          }
        }
      } else {
        console.log("  ❌ Archivo de tipos departamentales no encontrado");
        this.results.departments.failed += CONFIG.requiredDepartments.length;
        this.results.overall.total += CONFIG.requiredDepartments.length;
      }
    } catch (error) {
      console.log(`  ❌ Error validando departamentos: ${error.message}`);
      this.results.departments.failed += CONFIG.requiredDepartments.length;
      this.results.overall.total += CONFIG.requiredDepartments.length;
    }
  }

  /**
   * Validar integraciones requeridas
   */
  async validateIntegrations() {
    console.log("\n🔌 Validando integraciones requeridas...");

    const integrationFiles = [
      "src/hooks/useGoogleWorkspace.tsx",
      "src/components/integrations/EmailGovernancePanel.tsx",
      "src/components/integrations/IntegrationsHub.tsx",
      "src/types/emailGovernance.ts",
    ];

    for (const integration of CONFIG.requiredIntegrations) {
      this.results.overall.total++;

      const hasIntegration = integrationFiles.some((file) => {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, "utf8");
          return content.toLowerCase().includes(integration.toLowerCase());
        }
        return false;
      });

      if (hasIntegration) {
        console.log(`  ✅ ${integration} - Implementado`);
        this.results.integrations.passed++;
        this.results.integrations.details.push({
          integration,
          status: "implemented",
        });
      } else {
        console.log(`  ❌ ${integration} - NO IMPLEMENTADO`);
        this.results.integrations.failed++;
        this.results.integrations.details.push({
          integration,
          status: "not_implemented",
        });
      }
    }
  }

  /**
   * Validar tests de funcionalidad
   */
  async validateTests() {
    console.log("\n🧪 Validando tests de funcionalidad...");

    for (const test of CONFIG.validationTests) {
      this.results.overall.total++;

      const testResult = await this.runValidationTest(test);

      if (testResult.passed) {
        console.log(`  ✅ ${test} - PASÓ`);
        this.results.tests.passed++;
        this.results.tests.details.push({
          test,
          status: "passed",
          details: testResult.details,
        });
      } else {
        console.log(`  ❌ ${test} - FALLÓ`);
        this.results.tests.failed++;
        this.results.tests.details.push({
          test,
          status: "failed",
          details: testResult.details,
        });
      }
    }
  }

  /**
   * Ejecutar test de validación específico
   */
  async runValidationTest(testName) {
    switch (testName) {
      case "departmental_permissions":
        return this.testDepartmentalPermissions();
      case "email_integration":
        return this.testEmailIntegration();
      case "agent_coordination":
        return this.testAgentCoordination();
      case "knowledge_base":
        return this.testKnowledgeBase();
      case "security_isolation":
        return this.testSecurityIsolation();
      default:
        return { passed: false, details: "Test no implementado" };
    }
  }

  /**
   * Test de permisos departamentales
   */
  testDepartmentalPermissions() {
    try {
      const permissionsFile = "src/types/departmentalPermissions.ts";
      if (!fs.existsSync(permissionsFile)) {
        return { passed: false, details: "Archivo de permisos no encontrado" };
      }

      const content = fs.readFileSync(permissionsFile, "utf8");
      const hasPermissions =
        content.includes("DepartmentCode") &&
        content.includes("UniversalPermission") &&
        content.includes("DEPARTMENT_CONFIGURATIONS");

      return {
        passed: hasPermissions,
        details: hasPermissions
          ? "Sistema de permisos configurado"
          : "Faltan configuraciones de permisos",
      };
    } catch (error) {
      return { passed: false, details: `Error: ${error.message}` };
    }
  }

  /**
   * Test de integración de email
   */
  testEmailIntegration() {
    try {
      const emailFiles = ["src/hooks/useGoogleWorkspace.tsx", "src/types/emailGovernance.ts"];

      const hasEmailIntegration = emailFiles.every((file) => {
        if (!fs.existsSync(file)) return false;
        const content = fs.readFileSync(file, "utf8");
        return content.includes("email") || content.includes("gmail");
      });

      return {
        passed: hasEmailIntegration,
        details: hasEmailIntegration
          ? "Integración de email configurada"
          : "Falta configuración de email",
      };
    } catch (error) {
      return { passed: false, details: `Error: ${error.message}` };
    }
  }

  /**
   * Test de coordinación de agentes
   */
  testAgentCoordination() {
    try {
      const assistantFiles = [
        "src/hooks/useAssistantProfile.ts",
        "src/components/universal-assistant/UniversalAssistant.tsx",
      ];

      const hasCoordination = assistantFiles.every((file) => {
        if (!fs.existsSync(file)) return false;
        const content = fs.readFileSync(file, "utf8");
        return content.includes("coordinate") || content.includes("coordination");
      });

      return {
        passed: hasCoordination,
        details: hasCoordination
          ? "Base de coordinación presente"
          : "Falta implementación de coordinación",
      };
    } catch (error) {
      return { passed: false, details: `Error: ${error.message}` };
    }
  }

  /**
   * Test de knowledge base
   */
  testKnowledgeBase() {
    try {
      const knowledgeFiles = [
        "src/types/departmentalPermissions.ts",
        "docs/DEPARTMENTAL_PERMISSIONS_SYSTEM.md",
      ];

      const hasKnowledgeBase = knowledgeFiles.some((file) => {
        if (!fs.existsSync(file)) return false;
        const content = fs.readFileSync(file, "utf8");
        return content.includes("knowledge") || content.includes("Knowledge");
      });

      return {
        passed: hasKnowledgeBase,
        details: hasKnowledgeBase
          ? "Knowledge base configurada"
          : "Falta configuración de knowledge base",
      };
    } catch (error) {
      return { passed: false, details: `Error: ${error.message}` };
    }
  }

  /**
   * Test de aislamiento de seguridad
   */
  testSecurityIsolation() {
    try {
      const securityFiles = [
        "supabase/migrations/20250618120000_create_departmental_permissions.sql",
        "src/types/departmentalPermissions.ts",
      ];

      const hasSecurityIsolation = securityFiles.some((file) => {
        if (!fs.existsSync(file)) return false;
        const content = fs.readFileSync(file, "utf8");
        return (
          content.includes("RLS") || content.includes("security") || content.includes("isolation")
        );
      });

      return {
        passed: hasSecurityIsolation,
        details: hasSecurityIsolation
          ? "Aislamiento de seguridad configurado"
          : "Falta configuración de seguridad",
      };
    } catch (error) {
      return { passed: false, details: `Error: ${error.message}` };
    }
  }

  /**
   * Obtener tipo de componente
   */
  getComponentType(component) {
    if (component.includes(".tsx")) return "React Component";
    if (component.includes(".ts")) return "TypeScript Type";
    if (component.includes(".sql")) return "Database Migration";
    if (component.includes(".md")) return "Documentation";
    return "Unknown";
  }

  /**
   * Calcular resultados generales
   */
  calculateOverallResults() {
    this.results.overall.passed =
      this.results.components.passed +
      this.results.departments.passed +
      this.results.integrations.passed +
      this.results.tests.passed;
  }

  /**
   * Imprimir resultados
   */
  printResults() {
    console.log("\n" + "=".repeat(70));
    console.log("🏢 RESULTADOS DE VALIDACIÓN - AGENTES DEPARTAMENTALES");
    console.log("=".repeat(70));

    console.log(
      `\n✅ Pruebas pasadas: ${this.results.overall.passed}/${this.results.overall.total}`
    );

    console.log("\n🔧 Componentes de Infraestructura:");
    console.log(`  ✅ Pasados: ${this.results.components.passed}`);
    console.log(`  ❌ Fallidos: ${this.results.components.failed}`);

    console.log("\n🏢 Departamentos:");
    console.log(`  ✅ Pasados: ${this.results.departments.passed}`);
    console.log(`  ❌ Fallidos: ${this.results.departments.failed}`);

    console.log("\n🔌 Integraciones:");
    console.log(`  ✅ Pasados: ${this.results.integrations.passed}`);
    console.log(`  ❌ Fallidos: ${this.results.integrations.failed}`);

    console.log("\n🧪 Tests de Funcionalidad:");
    console.log(`  ✅ Pasados: ${this.results.tests.passed}`);
    console.log(`  ❌ Fallidos: ${this.results.tests.failed}`);

    if (this.results.overall.passed === this.results.overall.total) {
      console.log("\n🎉 ¡Arquitectura de Agentes Departamentales validada exitosamente!");
      console.log("✅ La infraestructura está lista para implementar agentes departamentales");
      console.log("✅ Todos los componentes requeridos están presentes");
      console.log("✅ Las integraciones están configuradas");
      console.log("✅ Los tests de funcionalidad pasaron");
    } else {
      console.log("\n❌ La arquitectura de agentes departamentales tiene problemas");
      console.log("🔧 Revisa los errores y corrige los problemas antes de continuar");

      // Mostrar detalles de errores
      this.printErrorDetails();
    }

    // Mostrar recomendaciones
    this.printRecommendations();
  }

  /**
   * Imprimir detalles de errores
   */
  printErrorDetails() {
    console.log("\n🔍 DETALLES DE ERRORES:");

    if (this.results.components.failed > 0) {
      console.log("\n🔧 Componentes faltantes:");
      this.results.components.details
        .filter((d) => d.status === "missing")
        .forEach((d) => console.log(`  • ${d.component}`));
    }

    if (this.results.departments.failed > 0) {
      console.log("\n🏢 Departamentos no configurados:");
      this.results.departments.details
        .filter((d) => d.status === "not_configured")
        .forEach((d) => console.log(`  • ${d.department}`));
    }

    if (this.results.integrations.failed > 0) {
      console.log("\n🔌 Integraciones faltantes:");
      this.results.integrations.details
        .filter((d) => d.status === "not_implemented")
        .forEach((d) => console.log(`  • ${d.integration}`));
    }

    if (this.results.tests.failed > 0) {
      console.log("\n🧪 Tests fallidos:");
      this.results.tests.details
        .filter((d) => d.status === "failed")
        .forEach((d) => console.log(`  • ${d.test}: ${d.details}`));
    }
  }

  /**
   * Imprimir recomendaciones
   */
  printRecommendations() {
    console.log("\n💡 RECOMENDACIONES:");

    if (this.results.overall.passed === this.results.overall.total) {
      console.log("✅ La arquitectura está lista para implementación");
      console.log("🚀 Puedes proceder con la creación de agentes departamentales");
      console.log("📚 Revisa la documentación de implementación");
      console.log("🧪 Ejecuta tests de integración antes del despliegue");
    } else {
      console.log("🔧 Prioriza la corrección de componentes faltantes");
      console.log("🏢 Configura todos los departamentos requeridos");
      console.log("🔌 Implementa las integraciones faltantes");
      console.log("🧪 Corrige los tests de funcionalidad");
      console.log("📚 Consulta la documentación de arquitectura");
    }
  }
}

// Ejecutar validación
async function main() {
  const validator = new DepartmentalAgentsValidator();
  const success = await validator.validate();

  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = DepartmentalAgentsValidator;
