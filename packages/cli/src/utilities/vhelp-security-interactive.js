/**
 * VHELP Interactive Security System
 * Handles user confirmations, warnings, and safety prompts
 *
 * @author AI Assistant
 * @version 1.0.0
 * @date 2025-01-27
 */

import readline from "readline";
import {
  RISK_LEVELS,
  dangerStyling,
  getRiskLevel,
  getSecurityInfo,
  requiresConfirmation,
  riskStyling,
} from "./vhelp-security-config.js";

// Colors for output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  bright_red: "\x1b[91m",
};

/**
 * Interactive confirmation system
 */
export class SecurityInteractive {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  /**
   * Display security warning for a command
   */
  displaySecurityWarning(command) {
    const risk = getRiskLevel(command);
    const securityInfo = getSecurityInfo(command);
    const riskStyle = riskStyling[risk];

    console.log("\n" + "=".repeat(60));
    console.log(
      `${colors.bold}${colors.bright_red}🚨 ANÁLISIS DE SEGURIDAD DEL COMANDO${colors.reset}`
    );
    console.log("=".repeat(60));

    // Command info
    console.log(
      `${colors.bold}📋 Comando:${colors.reset} ${colors.cyan}npm run ${command}${colors.reset}`
    );

    // Risk level
    console.log(
      `${colors.bold}🎯 Nivel de Riesgo:${colors.reset} ${riskStyle.emoji} ${riskStyle.color}${riskStyle.label}${colors.reset}`
    );

    if (securityInfo) {
      // Description
      console.log(`${colors.bold}📝 Descripción:${colors.reset} ${securityInfo.description}`);

      // Warning
      if (securityInfo.warning) {
        console.log(`\n${securityInfo.warning}`);
      }

      // What it affects
      if (securityInfo.affects && securityInfo.affects.length > 0) {
        console.log(`\n${colors.bold}📂 Archivos/Procesos Afectados:${colors.reset}`);
        securityInfo.affects.forEach((item) => {
          console.log(`   ${colors.yellow}▶${colors.reset} ${item}`);
        });
      }

      // Recovery information
      if (securityInfo.canRecover && securityInfo.recoverySteps) {
        console.log(
          `\n${colors.bold}🔄 Recuperación Posible:${colors.reset} ${colors.green}SÍ${colors.reset}`
        );
        console.log(`${colors.bold}📋 Pasos para Recuperar:${colors.reset}`);
        securityInfo.recoverySteps.forEach((step, index) => {
          console.log(`   ${colors.cyan}${index + 1}.${colors.reset} ${step}`);
        });
      }

      // Estimated time
      if (securityInfo.estimatedTime) {
        console.log(
          `\n${colors.bold}⏱️  Tiempo Estimado:${colors.reset} ${securityInfo.estimatedTime}`
        );
      }

      // Danger level indicator
      if (securityInfo.dangerLevel) {
        const danger = dangerStyling[securityInfo.dangerLevel];
        console.log(
          `\n${colors.bold}⚡ Nivel de Peligro:${colors.reset} ${danger.emoji} ${danger.color}${securityInfo.dangerLevel}${colors.reset}`
        );
      }
    }

    console.log("\n" + "=".repeat(60));
  }

  /**
   * Ask for user confirmation
   */
  async askConfirmation(command, defaultAnswer = "n") {
    const risk = getRiskLevel(command);
    const securityInfo = getSecurityInfo(command);

    // Different prompts based on risk level
    let prompt;
    let warningPrefix = "";

    switch (risk) {
      case RISK_LEVELS.DANGEROUS:
        warningPrefix = `${colors.bright_red}🚨 COMANDO PELIGROSO${colors.reset}`;
        prompt = `${warningPrefix}\n¿Estás COMPLETAMENTE SEGURO de ejecutar este comando? (sí/NO): `;
        break;
      case RISK_LEVELS.MODERATE:
        warningPrefix = `${colors.yellow}⚠️  COMANDO MODERADO${colors.reset}`;
        prompt = `${warningPrefix}\n¿Proceder con este comando? (s/N): `;
        break;
      default:
        prompt = `¿Ejecutar comando? (S/n): `;
        break;
    }

    return new Promise((resolve) => {
      this.rl.question(prompt, (answer) => {
        const normalizedAnswer = answer.toLowerCase().trim();

        // For dangerous commands, require explicit "sí" or "yes"
        if (risk === RISK_LEVELS.DANGEROUS) {
          const confirmed =
            normalizedAnswer === "sí" || normalizedAnswer === "yes" || normalizedAnswer === "si";
          resolve(confirmed);
        } else {
          // For moderate/safe commands, use standard y/n logic
          if (normalizedAnswer === "") {
            resolve(defaultAnswer === "y");
          } else {
            const confirmed =
              normalizedAnswer === "y" ||
              normalizedAnswer === "s" ||
              normalizedAnswer === "yes" ||
              normalizedAnswer === "sí" ||
              normalizedAnswer === "si";
            resolve(confirmed);
          }
        }
      });
    });
  }

  /**
   * Display safety tips
   */
  displaySafetyTips(command) {
    const risk = getRiskLevel(command);

    if (risk === RISK_LEVELS.DANGEROUS) {
      console.log(`\n${colors.bold}💡 CONSEJOS DE SEGURIDAD:${colors.reset}`);
      console.log(
        `   ${colors.cyan}▶${colors.reset} Haz un backup antes si tienes cambios importantes`
      );
      console.log(
        `   ${colors.cyan}▶${colors.reset} Asegúrate de que no hay servidores críticos ejecutándose`
      );
      console.log(`   ${colors.cyan}▶${colors.reset} Ten a mano los comandos de recuperación`);
      console.log(
        `   ${colors.cyan}▶${colors.reset} Considera usar ${colors.yellow}--dry-run${colors.reset} si está disponible`
      );
    }
  }

  /**
   * Main security check workflow
   */
  async performSecurityCheck(command) {
    const needsConfirmation = requiresConfirmation(command);
    const risk = getRiskLevel(command);

    // Always show warning for moderate and dangerous commands
    if (risk !== RISK_LEVELS.SAFE) {
      this.displaySecurityWarning(command);

      if (risk === RISK_LEVELS.DANGEROUS) {
        this.displaySafetyTips(command);
      }
    }

    // Ask for confirmation if needed
    if (needsConfirmation) {
      const confirmed = await this.askConfirmation(command);

      if (!confirmed) {
        console.log(`\n${colors.green}✅ Operación cancelada por el usuario${colors.reset}`);
        console.log(
          `${colors.dim}💡 Puedes ejecutar ${colors.cyan}npm run vhelp${colors.reset}${colors.dim} para ver comandos más seguros${colors.reset}\n`
        );
        return false;
      }
    }

    // Show final confirmation for dangerous commands
    if (risk === RISK_LEVELS.DANGEROUS) {
      console.log(`\n${colors.yellow}⚡ Ejecutando comando peligroso...${colors.reset}`);
      console.log(
        `${colors.dim}🔄 Recuerda los pasos de recuperación si algo sale mal${colors.reset}\n`
      );
    }

    return true;
  }

  /**
   * Close the readline interface
   */
  close() {
    this.rl.close();
  }
}

/**
 * Quick security check for scripts (non-interactive)
 */
export function getQuickSecurityInfo(command) {
  const risk = getRiskLevel(command);
  const riskStyle = riskStyling[risk];
  const securityInfo = getSecurityInfo(command);

  return {
    risk,
    riskEmoji: riskStyle.emoji,
    riskLabel: riskStyle.label,
    riskColor: riskStyle.color,
    requiresConfirmation: requiresConfirmation(command),
    warning: securityInfo?.warning || null,
    dangerLevel: securityInfo?.dangerLevel || null,
    estimatedTime: securityInfo?.estimatedTime || null,
    canRecover: securityInfo?.canRecover || true,
  };
}

/**
 * Display minimal security badge for vhelp output
 */
export function displaySecurityBadge(command) {
  const info = getQuickSecurityInfo(command);
  return `${info.riskEmoji} ${info.riskColor}${info.riskLabel}${colors.reset}`;
}
