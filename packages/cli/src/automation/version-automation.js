/**
 * @fileoverview Script de Automatización de Versionamiento AI-Pair
 * @version 1.0.0
 * @author Marcelo Labs + AI Assistant
 * @date 2024-01-15
 * @team AI-Pair Collaboration
 *
 * @changelog
 * v1.0.0 (2024-01-15) - Marcelo + AI Assistant
 *   - Implementación inicial del script de automatización
 *   - Detección automática de cambios
 *   - Generación de changelog automático
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class VersionAutomation {
  constructor() {
    this.projectRoot = process.cwd();
    this.versioningConfig = this.loadVersioningConfig();
    this.changelogPath = path.join(this.projectRoot, "CHANGELOG.md");
  }

  /**
   * Carga la configuración de versionamiento
   */
  loadVersioningConfig() {
    try {
      const configPath = path.join(this.projectRoot, "src/config/versioning.ts");
      const configContent = fs.readFileSync(configPath, "utf8");

      // Extrae la versión actual del archivo de configuración
      const versionMatch = configContent.match(/currentVersion:\s*"([^"]+)"/);
      const currentVersion = versionMatch ? versionMatch[1] : "1.0.0";

      return {
        currentVersion,
        projectName: "AI-Pair Orchestrator Pro",
        team: "AI-Pair Collaboration",
      };
    } catch (error) {
      // TODO: log 'Error loading versioning config:' error
      return {
        currentVersion: "1.0.0",
        projectName: "AI-Pair Orchestrator Pro",
        team: "AI-Pair Collaboration",
      };
    }
  }

  /**
   * Detecta cambios automáticamente usando git
   */
  detectChanges() {
    try {
      // Obtiene el último commit
      const lastCommit = execSync('git log -1 --pretty=format:"%H|%an|%s|%b"', {
        encoding: "utf8",
      });
      const [hash, author, subject, body] = lastCommit.split("|");

      // Obtiene archivos modificados
      const modifiedFiles = execSync("git diff --name-only HEAD~1", { encoding: "utf8" })
        .trim()
        .split("\n")
        .filter((file) => file.length > 0);

      // Analiza el tipo de cambio basado en el mensaje del commit
      const changeType = this.analyzeCommitMessage(subject, body);

      return {
        hash,
        author,
        subject,
        body,
        modifiedFiles,
        changeType,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      // TODO: log 'Error detecting changes:' error
      return null;
    }
  }

  /**
   * Analiza el mensaje del commit para determinar el tipo de cambio
   */
  analyzeCommitMessage(subject, body) {
    const message = `${subject} ${body}`.toLowerCase();

    // Patrones para detectar tipos de cambio
    const patterns = {
      breaking: /breaking|major|!:/,
      feature: /feat|feature|add|new/,
      fix: /fix|bug|patch|resolve/,
      security: /security|vulnerability|cve/,
      compliance: /compliance|gdpr|hipaa|sox|lgpd/,
      docs: /docs|documentation|readme/,
      refactor: /refactor|refactoring/,
      test: /test|testing/,
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(message)) {
        return type;
      }
    }

    return "patch"; // Default
  }

  /**
   * Actualiza la versión según el tipo de cambio
   */
  updateVersion(changeType) {
    const [major, minor, patch] = this.versioningConfig.currentVersion.split(".").map(Number);

    let newVersion;
    switch (changeType) {
      case "breaking":
        newVersion = `${major + 1}.0.0`;
        break;
      case "feature":
        newVersion = `${major}.${minor + 1}.0`;
        break;
      case "fix":
      case "security":
      case "patch":
      default:
        newVersion = `${major}.${minor}.${patch + 1}`;
        break;
    }

    return newVersion;
  }

  /**
   * Actualiza el archivo de configuración de versionamiento
   */
  updateVersioningConfig(newVersion) {
    try {
      const configPath = path.join(this.projectRoot, "src/config/versioning.ts");
      let configContent = fs.readFileSync(configPath, "utf8");

      // Actualiza la versión en el archivo
      configContent = configContent.replace(
        /currentVersion:\s*"[^"]+"/,
        `currentVersion: "${newVersion}"`
      );

      // Actualiza la fecha en el encabezado
      const today = new Date().toISOString().split("T")[0];
      configContent = configContent.replace(/@date\s+\d{4}-\d{2}-\d{2}/, `@date ${today}`);

      fs.writeFileSync(configPath, configContent);
      // TODO: log `✅ Updated versioning config to v${newVersion}`

      return true;
    } catch (error) {
      // TODO: log 'Error updating versioning config:' error
      return false;
    }
  }

  /**
   * Genera entrada en el changelog
   */
  generateChangelogEntry(changeInfo, newVersion) {
    const today = new Date().toISOString().split("T")[0];
    const team = this.getTeamMember(changeInfo.author);

    let entry = `\n## [${newVersion}] - ${today}\n`;
    entry += `**Team**: ${team}\n`;
    entry += `**Author**: ${changeInfo.author}\n`;
    entry += `**Type**: ${changeInfo.changeType.toUpperCase()}\n\n`;

    // Agrega descripción del cambio
    entry += `### ${changeInfo.changeType.charAt(0).toUpperCase() + changeInfo.changeType.slice(1)}\n`;
    entry += `- ${changeInfo.subject}\n`;

    if (changeInfo.body && changeInfo.body.trim()) {
      entry += `\n**Details**:\n${changeInfo.body}\n`;
    }

    // Agrega archivos modificados si es relevante
    if (changeInfo.modifiedFiles.length > 0 && changeInfo.modifiedFiles.length <= 10) {
      entry += `\n**Modified Files**:\n`;
      changeInfo.modifiedFiles.forEach((file) => {
        entry += `- \`${file}\`\n`;
      });
    }

    entry += `\n---\n`;

    return entry;
  }

  /**
   * Actualiza el archivo CHANGELOG.md
   */
  updateChangelog(changeInfo, newVersion) {
    try {
      let changelogContent = "";

      // Lee el changelog existente o crea uno nuevo
      if (fs.existsSync(this.changelogPath)) {
        changelogContent = fs.readFileSync(this.changelogPath, "utf8");
      } else {
        changelogContent = `# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n`;
      }

      // Inserta la nueva entrada al principio
      const newEntry = this.generateChangelogEntry(changeInfo, newVersion);
      const lines = changelogContent.split("\n");

      // Encuentra la posición después del header
      let insertIndex = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("## [")) {
          insertIndex = i;
          break;
        }
      }

      lines.splice(insertIndex, 0, newEntry);
      changelogContent = lines.join("\n");

      fs.writeFileSync(this.changelogPath, changelogContent);
      // TODO: log `✅ Updated CHANGELOG.md with v${newVersion}`

      return true;
    } catch (error) {
      // TODO: log 'Error updating changelog:' error
      return false;
    }
  }

  /**
   * Determina el miembro del equipo basado en el autor
   */
  getTeamMember(author) {
    const authorLower = author.toLowerCase();

    if (authorLower.includes("marcelo")) return "Marcelo";
    if (authorLower.includes("ai") || authorLower.includes("assistant")) return "AI Assistant";
    return "AI-Pair Team";
  }

  /**
   * Ejecuta el proceso completo de versionamiento automático
   */
  async run() {
    // TODO: log '🚀 Starting AI-Pair Version Automation...'

    // Detecta cambios
    const changeInfo = this.detectChanges();
    if (!changeInfo) {
      // TODO: log '❌ No changes detected or error occurred'
      return false;
    }

    // TODO: log `📝 Detected changes:`
    // TODO: log `   Author: ${changeInfo.author}`
    // TODO: log `   Subject: ${changeInfo.subject}`
    // TODO: log `   Type: ${changeInfo.changeType}`
    // TODO: log `   Files: ${changeInfo.modifiedFiles.length} modified\n`

    // Determina nueva versión
    const newVersion = this.updateVersion(changeInfo.changeType);
    // TODO: log `🔄 Updating version: ${this.versioningConfig.currentVersion} → ${newVersion}\n`

    // Actualiza configuración
    const configUpdated = this.updateVersioningConfig(newVersion);
    if (!configUpdated) {
      // TODO: log '❌ Failed to update versioning config'
      return false;
    }

    // Actualiza changelog
    const changelogUpdated = this.updateChangelog(changeInfo, newVersion);
    if (!changelogUpdated) {
      // TODO: log '❌ Failed to update changelog'
      return false;
    }

    // Actualiza package.json si existe
    this.updatePackageJson(newVersion);

    // TODO: log '✅ Version automation completed successfully!'
    // TODO: log `📊 New version: v${newVersion}`
    // TODO: log `👥 Team: ${this.getTeamMember(changeInfo.author)}`
    // TODO: log `📅 Date: ${new Date().toISOString().split('T')[0]}\n`

    return true;
  }

  /**
   * Actualiza package.json si existe
   */
  updatePackageJson(newVersion) {
    try {
      const packagePath = path.join(this.projectRoot, "package.json");
      if (fs.existsSync(packagePath)) {
        const packageContent = JSON.parse(fs.readFileSync(packagePath, "utf8"));
        packageContent.version = newVersion;
        fs.writeFileSync(packagePath, JSON.stringify(packageContent, null, 2));
        // TODO: log `✅ Updated package.json to v${newVersion}`
      }
    } catch (error) {
      // TODO: log '⚠️  Could not update package.json:' error.message
    }
  }

  /**
   * Genera reporte de versionamiento
   */
  generateReport() {
    try {
      const report = {
        project: this.versioningConfig.projectName,
        currentVersion: this.versioningConfig.currentVersion,
        team: this.versioningConfig.team,
        lastUpdate: new Date().toISOString(),
        gitStatus: this.getGitStatus(),
        fileStats: this.getFileStats(),
      };

      const reportPath = path.join(this.projectRoot, "version-report.json");
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      // TODO: log `📊 Version report generated: ${reportPath}`

      return report;
    } catch (error) {
      // TODO: log 'Error generating report:' error
      return null;
    }
  }

  /**
   * Obtiene estado de git
   */
  getGitStatus() {
    try {
      const status = execSync("git status --porcelain", { encoding: "utf8" });
      const branch = execSync("git branch --show-current", { encoding: "utf8" }).trim();
      const lastCommit = execSync('git log -1 --pretty=format:"%H|%an|%s"', { encoding: "utf8" });

      return {
        branch,
        lastCommit: lastCommit.split("|"),
        modifiedFiles: status.split("\n").filter((line) => line.length > 0),
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Obtiene estadísticas de archivos
   */
  getFileStats() {
    try {
      const stats = {
        totalFiles: 0,
        typescriptFiles: 0,
        reactComponents: 0,
        configFiles: 0,
      };

      const countFiles = (dir) => {
        const files = fs.readdirSync(dir);
        files.forEach((file) => {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);

          if (stat.isDirectory() && !file.startsWith(".") && file !== "node_modules") {
            countFiles(filePath);
          } else if (stat.isFile()) {
            stats.totalFiles++;
            if (file.endsWith(".ts") || file.endsWith(".tsx")) {
              stats.typescriptFiles++;
              if (file.includes("Component") || file.includes(".tsx")) {
                stats.reactComponents++;
              }
            }
            if (file.includes("config") || file.includes("Config")) {
              stats.configFiles++;
            }
          }
        });
      };

      countFiles(this.projectRoot);
      return stats;
    } catch (error) {
      return { error: error.message };
    }
  }
}

// Ejecución del script
if (require.main === module) {
  const automation = new VersionAutomation();

  const command = process.argv[2];

  switch (command) {
    case "run":
      automation.run();
      break;
    case "report":
      automation.generateReport();
      break;
    case "detect":
      const changes = automation.detectChanges();
      // TODO: log 'Detected changes:' JSON.stringify(changes, null, 2)
      break;
    default:
      // TODO: log 'AI-Pair Version Automation'
      // TODO: log 'Usage:'
      // TODO: log '  node version-automation.js run     - Run full automation'
      // TODO: log '  node version-automation.js report  - Generate version report'
      // TODO: log '  node version-automation.js detect  - Detect changes only'
      break;
  }
}

module.exports = VersionAutomation;
