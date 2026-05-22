#!/usr/bin/env node

const https = require("https");
const http = require("http");
const { URL } = require("url");

/**
 * Script de health check para verificar el estado de los servicios
 * Uso: node scripts/health-check.js [environment]
 */

class HealthChecker {
  constructor(environment = "production") {
    this.environment = environment;
    this.results = {};
    this.startTime = Date.now();

    // Configuración de endpoints por ambiente
    this.endpoints = {
      production: {
        frontend: "https://ai-pair.com/health",
        backend: "https://your-project.supabase.co/rest/v1/",
        database: "https://your-project.supabase.co/rest/v1/",
        storage: "https://your-project.supabase.co/storage/v1/",
      },
      staging: {
        frontend: "http://staging.ai-pair.com/health",
        backend: "https://staging-project.supabase.co/rest/v1/",
        database: "https://staging-project.supabase.co/rest/v1/",
        storage: "https://staging-project.supabase.co/storage/v1/",
      },
      development: {
        frontend: "http://dev.ai-pair.com/health",
        backend: "https://dev-project.supabase.co/rest/v1/",
        database: "https://dev-project.supabase.co/rest/v1/",
        storage: "https://dev-project.supabase.co/storage/v1/",
      },
    };
  }

  /**
   * Ejecuta el health check completo
   */
  async runHealthCheck() {
    // TODO: log `🏥 Iniciando health check para ambiente: ${this.environment.toUpperCase()}`

    const endpoints = this.endpoints[this.environment];
    if (!endpoints) {
      throw new Error(`Ambiente '${this.environment}' no configurado`);
    }

    const checks = [];

    // Health checks paralelos
    for (const [service, url] of Object.entries(endpoints)) {
      checks.push(this.checkService(service, url));
    }

    // Esperar todos los checks
    await Promise.allSettled(checks);

    // Generar reporte
    this.generateReport();

    // Retornar estado general
    return this.getOverallStatus();
  }

  /**
   * Verifica un servicio específico
   */
  async checkService(service, url) {
    try {
      // TODO: log `🔍 Verificando ${service}...`

      const result = await this.makeRequest(url);

      this.results[service] = {
        status: "healthy",
        responseTime: result.responseTime,
        statusCode: result.statusCode,
        timestamp: new Date().toISOString(),
        url: url,
      };

      // TODO: log `✅ ${service}: ${result.responseTime}ms (${result.statusCode})`
    } catch (error) {
      this.results[service] = {
        status: "unhealthy",
        error: error.message,
        timestamp: new Date().toISOString(),
        url: url,
      };

      // TODO: log `❌ ${service}: ${error.message}`
    }
  }

  /**
   * Realiza una petición HTTP/HTTPS
   */
  makeRequest(url) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const parsedUrl = new URL(url);
      const client = parsedUrl.protocol === "https:" ? https : http;

      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === "https:" ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: "GET",
        timeout: 10000, // 10 segundos
        headers: {
          "User-Agent": "Health-Check/1.0",
        },
      };

      const req = client.request(options, (res) => {
        const responseTime = Date.now() - startTime;

        // Verificar status code
        if (res.statusCode >= 200 && res.statusCode < 500) {
          resolve({
            statusCode: res.statusCode,
            responseTime: responseTime,
          });
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });

      req.on("error", (error) => {
        reject(new Error(`Connection failed: ${error.message}`));
      });

      req.on("timeout", () => {
        req.destroy();
        reject(new Error("Request timeout"));
      });

      req.end();
    });
  }

  /**
   * Genera el reporte de health check
   */
  generateReport() {
    const totalTime = Date.now() - this.startTime;
    const healthyServices = Object.values(this.results).filter(
      (r) => r.status === "healthy"
    ).length;
    const totalServices = Object.keys(this.results).length;
    const healthPercentage = Math.round((healthyServices / totalServices) * 100);

    // TODO: log '\n📊 REPORTE DE HEALTH CHECK'
    // TODO: log '=' .repeat(50)
    // TODO: log `Ambiente: ${this.environment.toUpperCase()}`
    // TODO: log `Timestamp: ${new Date().toISOString()}`
    // TODO: log `Tiempo total: ${totalTime}ms`
    // TODO: log `Servicios saludables: ${healthyServices}/${totalServices} (${healthPercentage}%)`
    // TODO: log ``

    // Detalles por servicio
    for (const [service, result] of Object.entries(this.results)) {
      const statusIcon = result.status === "healthy" ? "✅" : "❌";
      const statusText = result.status === "healthy" ? "SALUDABLE" : "PROBLEMA";

      // TODO: log `${statusIcon} ${service.toUpperCase()}: ${statusText}`

      if (result.status === "healthy") {
        // TODO: log `   Tiempo de respuesta: ${result.responseTime}ms`
        // TODO: log `   Status code: ${result.statusCode}`
      } else {
        // TODO: log `   Error: ${result.error}`
      }
      // TODO: log ``
    }

    // Estado general
    const overallStatus = this.getOverallStatus();
    // TODO: log `🎯 ESTADO GENERAL: ${overallStatus.toUpperCase()}`

    if (overallStatus === "healthy") {
      // TODO: log '✅ Todos los servicios están funcionando correctamente'
    } else {
      // TODO: log '⚠️ Se detectaron problemas en algunos servicios'
      this.printRecommendations();
    }
  }

  /**
   * Obtiene el estado general del sistema
   */
  getOverallStatus() {
    const unhealthyServices = Object.values(this.results).filter((r) => r.status === "unhealthy");

    if (unhealthyServices.length === 0) {
      return "healthy";
    } else if (unhealthyServices.length <= 1) {
      return "degraded";
    } else {
      return "unhealthy";
    }
  }

  /**
   * Imprime recomendaciones basadas en los problemas detectados
   */
  printRecommendations() {
    // TODO: log '\n🔧 RECOMENDACIONES:'

    for (const [service, result] of Object.entries(this.results)) {
      if (result.status === "unhealthy") {
        switch (service) {
          case "frontend":
            // TODO: log `- Verificar despliegue del frontend en ${this.environment}`
            // TODO: log `- Revisar logs del servidor web`
            // TODO: log `- Verificar configuración de DNS/CDN`
            break;

          case "backend":
            // TODO: log `- Verificar estado de Supabase en ${this.environment}`
            // TODO: log `- Revisar logs de la API`
            // TODO: log `- Verificar configuración de autenticación`
            break;

          case "database":
            // TODO: log `- Verificar conectividad a la base de datos`
            // TODO: log `- Revisar logs de PostgreSQL`
            // TODO: log `- Verificar políticas RLS`
            break;

          case "storage":
            // TODO: log `- Verificar estado del storage de Supabase`
            // TODO: log `- Revisar permisos de buckets`
            // TODO: log `- Verificar configuración de CORS`
            break;
        }
      }
    }
  }

  /**
   * Exporta resultados en formato JSON
   */
  exportResults() {
    const report = {
      environment: this.environment,
      timestamp: new Date().toISOString(),
      overallStatus: this.getOverallStatus(),
      services: this.results,
      summary: {
        totalServices: Object.keys(this.results).length,
        healthyServices: Object.values(this.results).filter((r) => r.status === "healthy").length,
        unhealthyServices: Object.values(this.results).filter((r) => r.status === "unhealthy")
          .length,
        healthPercentage: Math.round(
          (Object.values(this.results).filter((r) => r.status === "healthy").length /
            Object.keys(this.results).length) *
            100
        ),
      },
    };

    return report;
  }
}

/**
 * Función principal para ejecutar health check
 */
async function main() {
  const environment = process.argv[2] || "production";
  const checker = new HealthChecker(environment);

  try {
    const status = await checker.runHealthCheck();

    // Exportar resultados si se solicita
    if (process.argv.includes("--json")) {
      // TODO: log JSON.stringify(checker.exportResults(), null, 2)
    }

    // Exit code basado en el estado
    if (status === "unhealthy") {
      process.exit(1);
    } else if (status === "degraded") {
      process.exit(2);
    } else {
      process.exit(0);
    }
  } catch (error) {
    // TODO: log '❌ Error en health check:' error.message
    process.exit(1);
  }
}

/**
 * Función para health check específico de un servicio
 */
async function checkSpecificService(service, environment = "production") {
  const checker = new HealthChecker(environment);
  const endpoints = checker.endpoints[environment];

  if (!endpoints[service]) {
    throw new Error(`Servicio '${service}' no encontrado en ambiente '${environment}'`);
  }

  await checker.checkService(service, endpoints[service]);
  return checker.results[service];
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { HealthChecker, checkSpecificService };
