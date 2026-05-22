/**
 * @fileoverview Script de Tracking de Actualizaciones para Elementos Portados
 * @version 1.0.0
 * @author Marcelo Labs + AI Assistant
 * @date 2024-01-15
 * @team AI-Pair Collaboration
 *
 * @changelog
 * v1.0.0 (2024-01-15) - Marcelo + AI Assistant
 *   - Implementación inicial del sistema de tracking de actualizaciones
 *   - Verificación automática de nuevas versiones
 *   - Análisis de impacto de actualizaciones
 *   - Sistema de notificaciones y reportes
 */

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { execSync } = require("child_process");

class PorteUpdateTracker {
  constructor() {
    this.projectRoot = process.cwd();
    this.porteConfigPath = path.join(
      this.projectRoot,
      "docs/features/PORTE_STRATEGY_DOCUMENTATION.md"
    );
    this.updateHistoryPath = path.join(this.projectRoot, "docs/features/porte-update-history.json");
    this.porteConfig = this.loadPorteConfig();
    this.updateHistory = this.loadUpdateHistory();
  }

  /**
   * Carga la configuración de porte desde la documentación
   */
  loadPorteConfig() {
    try {
      const configContent = fs.readFileSync(this.porteConfigPath, "utf8");

      // Extrae información de proyectos portados
      const projects = [];
      const projectMatches = configContent.matchAll(/## 📋 **Implementación para ([^\n]+)/g);

      for (const match of projectMatches) {
        const projectName = match[1];
        const projectSection = this.extractProjectSection(configContent, projectName);

        if (projectSection) {
          projects.push({
            name: projectName,
            config: this.parseProjectConfig(projectSection),
          });
        }
      }

      return projects;
    } catch (error) {
      // TODO: log 'Error loading porte config:' error
      return [];
    }
  }

  /**
   * Extrae la sección de configuración de un proyecto específico
   */
  extractProjectSection(content, projectName) {
    const startMarker = `## 📋 **Implementación para ${projectName}`;
    const endMarker = "## 🚀 **Próximos Pasos";

    const startIndex = content.indexOf(startMarker);
    if (startIndex === -1) return null;

    const endIndex = content.indexOf(endMarker, startIndex);
    const sectionEnd = endIndex !== -1 ? endIndex : content.length;

    return content.substring(startIndex, sectionEnd);
  }

  /**
   * Parsea la configuración de un proyecto
   */
  parseProjectConfig(section) {
    const config = {};

    // Extrae versión original
    const versionMatch = section.match(/Versión.*?:\s*([^\n]+)/);
    if (versionMatch) config.originalVersion = versionMatch[1].trim();

    // Extrae repositorio
    const repoMatch = section.match(/Repositorio.*?:\s*([^\n]+)/);
    if (repoMatch) config.repository = repoMatch[1].trim();

    // Extrae licencia
    const licenseMatch = section.match(/Licencia.*?:\s*([^\n]+)/);
    if (licenseMatch) config.license = licenseMatch[1].trim();

    // Extrae configuración de actualizaciones
    const updateConfig = this.parseUpdateConfig(section);
    config.updateConfig = updateConfig;

    return config;
  }

  /**
   * Parsea la configuración de actualizaciones
   */
  parseUpdateConfig(section) {
    const config = {};

    // Extrae frecuencia de actualización
    const frequencyMatch = section.match(/Frecuencia.*?:\s*([^\n]+)/);
    if (frequencyMatch) config.frequency = frequencyMatch[1].trim();

    // Extrae política de breaking changes
    const breakingMatch = section.match(/Política de Breaking Changes.*?:\s*([^\n]+)/);
    if (breakingMatch) config.breakingChangesPolicy = breakingMatch[1].trim();

    // Extrae criterios de evaluación
    const criteria = this.extractEvaluationCriteria(section);
    config.evaluationCriteria = criteria;

    return config;
  }

  /**
   * Extrae criterios de evaluación
   */
  extractEvaluationCriteria(section) {
    const criteria = {};

    const criteriaSection = section.match(/#### \*\*Criterios de Evaluación\*\*([\s\S]*?)(?=##|$)/);
    if (criteriaSection) {
      const criteriaText = criteriaSection[1];

      // Extrae criterios específicos
      const compatibilityMatch = criteriaText.match(/Compatibilidad.*?:\s*([^\n]+)/);
      if (compatibilityMatch) criteria.compatibility = compatibilityMatch[1].trim();

      const performanceMatch = criteriaText.match(/Performance.*?:\s*([^\n]+)/);
      if (performanceMatch) criteria.performance = performanceMatch[1].trim();

      const securityMatch = criteriaText.match(/Seguridad.*?:\s*([^\n]+)/);
      if (securityMatch) criteria.security = securityMatch[1].trim();

      const complianceMatch = criteriaText.match(/Compliance.*?:\s*([^\n]+)/);
      if (complianceMatch) criteria.compliance = complianceMatch[1].trim();
    }

    return criteria;
  }

  /**
   * Carga el historial de actualizaciones
   */
  loadUpdateHistory() {
    try {
      if (fs.existsSync(this.updateHistoryPath)) {
        return JSON.parse(fs.readFileSync(this.updateHistoryPath, "utf8"));
      }
      return {
        lastCheck: null,
        projects: {},
        notifications: [],
      };
    } catch (error) {
      // TODO: log 'Error loading update history:' error
      return {
        lastCheck: null,
        projects: {},
        notifications: [],
      };
    }
  }

  /**
   * Guarda el historial de actualizaciones
   */
  saveUpdateHistory() {
    try {
      fs.writeFileSync(this.updateHistoryPath, JSON.stringify(this.updateHistory, null, 2));
    } catch (error) {
      // TODO: log 'Error saving update history:' error
    }
  }

  /**
   * Verifica actualizaciones disponibles para todos los proyectos
   */
  async checkAllUpdates() {
    // TODO: log '🔍 Checking for updates on ported projects...\n'

    const results = [];

    for (const project of this.porteConfig) {
      // TODO: log `📦 Checking ${project.name}...`

      try {
        const updateInfo = await this.checkProjectUpdate(project);
        results.push(updateInfo);

        if (updateInfo.hasUpdate) {
          // TODO: log `  ✅ Update available: ${updateInfo.currentVersion} → ${updateInfo.latestVersion}`
        } else {
          // TODO: log `  ℹ️  No updates available (current: ${updateInfo.currentVersion})`
        }
      } catch (error) {
        // TODO: log `  ❌ Error checking ${project.name}:` error.message
        results.push({
          name: project.name,
          error: error.message,
        });
      }
    }

    // Actualiza historial
    this.updateHistory.lastCheck = new Date().toISOString();
    this.updateHistory.projects = results.reduce((acc, result) => {
      acc[result.name] = result;
      return acc;
    }, {});

    this.saveUpdateHistory();

    return results;
  }

  /**
   * Verifica actualizaciones para un proyecto específico
   */
  async checkProjectUpdate(project) {
    const { name, config } = project;

    // Obtiene información del repositorio
    const repoInfo = this.extractRepoInfo(config.repository);
    if (!repoInfo) {
      throw new Error("Invalid repository URL");
    }

    // Verifica versión actual vs última disponible
    const currentVersion = config.originalVersion;
    const latestVersion = await this.getLatestVersion(repoInfo);

    const hasUpdate = this.compareVersions(currentVersion, latestVersion) < 0;

    return {
      name,
      currentVersion,
      latestVersion,
      hasUpdate,
      lastChecked: new Date().toISOString(),
      updateConfig: config.updateConfig,
      repository: config.repository,
    };
  }

  /**
   * Extrae información del repositorio
   */
  extractRepoInfo(repositoryUrl) {
    const githubMatch = repositoryUrl.match(/github\.com\/([^\/]+\/[^\/]+)/);
    if (githubMatch) {
      return {
        platform: "github",
        owner: githubMatch[1].split("/")[0],
        repo: githubMatch[1].split("/")[1],
      };
    }

    return null;
  }

  /**
   * Obtiene la última versión disponible
   */
  async getLatestVersion(repoInfo) {
    if (repoInfo.platform === "github") {
      try {
        const response = await axios.get(
          `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/releases/latest`,
          {
            headers: {
              "User-Agent": "AI-Pair-Porte-Tracker",
            },
          }
        );

        return response.data.tag_name.replace("v", "");
      } catch (error) {
        // Si no hay releases, intenta con tags
        try {
          const response = await axios.get(
            `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/tags`,
            {
              headers: {
                "User-Agent": "AI-Pair-Porte-Tracker",
              },
            }
          );

          if (response.data.length > 0) {
            return response.data[0].name.replace("v", "");
          }
        } catch (tagError) {
          // TODO: log 'Error fetching tags:' tagError.message
        }

        throw new Error("Could not fetch latest version");
      }
    }

    throw new Error("Unsupported repository platform");
  }

  /**
   * Compara versiones semánticas
   */
  compareVersions(version1, version2) {
    const v1 = version1.split(".").map(Number);
    const v2 = version2.split(".").map(Number);

    for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
      const num1 = v1[i] || 0;
      const num2 = v2[i] || 0;

      if (num1 < num2) return -1;
      if (num1 > num2) return 1;
    }

    return 0;
  }

  /**
   * Analiza el impacto de una actualización
   */
  async analyzeUpdateImpact(projectName, targetVersion) {
    const project = this.porteConfig.find((p) => p.name === projectName);
    if (!project) {
      throw new Error(`Project ${projectName} not found`);
    }

    const repoInfo = this.extractRepoInfo(project.config.repository);
    const changes = await this.getVersionChanges(
      repoInfo,
      project.config.originalVersion,
      targetVersion
    );

    return {
      projectName,
      currentVersion: project.config.originalVersion,
      targetVersion,
      changes,
      impact: this.assessImpact(changes, project.config.updateConfig.evaluationCriteria),
    };
  }

  /**
   * Obtiene cambios entre versiones
   */
  async getVersionChanges(repoInfo, fromVersion, toVersion) {
    if (repoInfo.platform === "github") {
      try {
        const response = await axios.get(
          `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/compare/v${fromVersion}...v${toVersion}`,
          {
            headers: {
              "User-Agent": "AI-Pair-Porte-Tracker",
            },
          }
        );

        return {
          commits: response.data.commits.length,
          files: response.data.files.length,
          additions: response.data.files.reduce((sum, file) => sum + (file.additions || 0), 0),
          deletions: response.data.files.reduce((sum, file) => sum + (file.deletions || 0), 0),
          breakingChanges: this.detectBreakingChanges(response.data.commits),
        };
      } catch (error) {
        // TODO: log 'Error fetching changes:' error.message
        return {
          error: error.message,
        };
      }
    }

    return { error: "Unsupported repository platform" };
  }

  /**
   * Detecta breaking changes en commits
   */
  detectBreakingChanges(commits) {
    const breakingKeywords = ["breaking", "major", "!:", "deprecate", "remove"];

    return commits.filter((commit) => {
      const message = commit.commit.message.toLowerCase();
      return breakingKeywords.some((keyword) => message.includes(keyword));
    }).length;
  }

  /**
   * Evalúa el impacto de una actualización
   */
  assessImpact(changes, criteria) {
    const impact = {
      level: "LOW",
      risks: [],
      recommendations: [],
    };

    // Evalúa breaking changes
    if (changes.breakingChanges > 0) {
      impact.level = "HIGH";
      impact.risks.push("Breaking changes detected");
      impact.recommendations.push("Manual review required");
    }

    // Evalúa cantidad de cambios
    if (changes.files > 100) {
      impact.level = impact.level === "LOW" ? "MEDIUM" : impact.level;
      impact.risks.push("Large number of files changed");
      impact.recommendations.push("Comprehensive testing required");
    }

    // Evalúa cambios en dependencias
    if (changes.files > 0) {
      const packageFiles = changes.files.filter(
        (file) =>
          file.filename &&
          (file.filename.includes("package.json") || file.filename.includes("yarn.lock"))
      );

      if (packageFiles.length > 0) {
        impact.risks.push("Dependency changes detected");
        impact.recommendations.push("Review dependency updates");
      }
    }

    return impact;
  }

  /**
   * Genera reporte de actualizaciones
   */
  generateUpdateReport() {
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalProjects: this.porteConfig.length,
        projectsWithUpdates: 0,
        projectsWithErrors: 0,
      },
      projects: this.updateHistory.projects,
      recommendations: [],
    };

    // Calcula estadísticas
    Object.values(this.updateHistory.projects).forEach((project) => {
      if (project.hasUpdate) report.summary.projectsWithUpdates++;
      if (project.error) report.summary.projectsWithErrors++;
    });

    // Genera recomendaciones
    if (report.summary.projectsWithUpdates > 0) {
      report.recommendations.push("Updates available - review recommended");
    }

    if (report.summary.projectsWithErrors > 0) {
      report.recommendations.push("Some projects have errors - manual check required");
    }

    return report;
  }

  /**
   * Ejecuta el proceso completo de verificación
   */
  async run() {
    // TODO: log '🚀 Starting AI-Pair Porte Update Tracker...\n'

    // Verifica actualizaciones
    const results = await this.checkAllUpdates();

    // Genera reporte
    const report = this.generateUpdateReport();

    // Guarda reporte
    const reportPath = path.join(this.projectRoot, "docs/features/porte-update-report.json");
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // TODO: log '\n📊 Update Check Summary:'
    // TODO: log `  Total Projects: ${report.summary.totalProjects}`
    // TODO: log `  Projects with Updates: ${report.summary.projectsWithUpdates}`
    // TODO: log `  Projects with Errors: ${report.summary.projectsWithErrors}`

    if (report.recommendations.length > 0) {
      // TODO: log '\n💡 Recommendations:'
      // TODO: log `  - ${rec}`
    }

    // TODO: log `\n📄 Report saved to: ${reportPath}`

    return report;
  }
}

// Ejecución del script
if (require.main === module) {
  const tracker = new PorteUpdateTracker();

  const command = process.argv[2];

  switch (command) {
    case "check":
      tracker.run();
      break;
    case "analyze":
      const projectName = process.argv[3];
      const targetVersion = process.argv[4];
      if (projectName && targetVersion) {
        tracker
          .analyzeUpdateImpact(projectName, targetVersion)
          .then((impact) => console.log("Impact Analysis:", JSON.stringify(impact, null, 2)))
          .catch((error) => console.error("Error:", error.message));
      } else {
        // TODO: log 'Usage: node porte-update-tracker.js analyze [PROJECT_NAME] [TARGET_VERSION]'
      }
      break;
    case "report":
      const report = tracker.generateUpdateReport();
      // TODO: log 'Update Report:' JSON.stringify(report, null, 2)
      break;
    default:
      // TODO: log 'AI-Pair Porte Update Tracker'
      // TODO: log 'Usage:'
      // TODO: log '  node porte-update-tracker.js check     - Check all projects for updates'
      // TODO: log '  node porte-update-tracker.js analyze   - Analyze update impact'
      // TODO: log '  node porte-update-tracker.js report    - Generate update report'
      break;
  }
}

module.exports = PorteUpdateTracker;
