#!/usr/bin/env node

/**
 * VHelp Interactive Example - Demostración del sistema de confirmaciones
 * Simula la ejecución de comandos con diferentes niveles de riesgo
 *
 * @author AI Assistant
 * @version 1.0.0
 * @date 2025-01-27
 */

const readline = require("readline");

// Colores para output
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

class SecurityDemo {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  async demonstrateSecurityLevels() {
    console.log(
      `${colors.cyan}${colors.bold}\n🛡️  DEMOSTRACIÓN DEL SISTEMA DE SEGURIDAD VHELP${colors.reset}`
    );
    console.log("=".repeat(60));

    // Ejemplo 1: Comando SEGURO
    await this.demoSafeCommand();

    // Ejemplo 2: Comando MODERADO
    await this.demoModerateCommand();

    // Ejemplo 3: Comando PELIGROSO
    await this.demoDangerousCommand();

    console.log(`\n${colors.green}✅ Demostración completada${colors.reset}`);
    console.log(`${colors.dim}El sistema está listo para proteger tu trabajo${colors.reset}\n`);

    this.rl.close();
  }

  async demoSafeCommand() {
    console.log(`\n${colors.bold}🟢 EJEMPLO 1: COMANDO SEGURO${colors.reset}`);
    console.log(`${colors.dim}Los comandos seguros se ejecutan sin restricciones${colors.reset}\n`);

    console.log(`${colors.cyan}$ npm run validate:quick${colors.reset}`);
    console.log(`${colors.green}✅ Ejecutando validación rápida...${colors.reset}`);
    console.log(`${colors.dim}   ✓ Arquitectura válida`);
    console.log(`   ✓ Sin violaciones críticas`);
    console.log(`   ✓ Listo para continuar${colors.reset}`);

    await this.pause();
  }

  async demoModerateCommand() {
    console.log(`\n${colors.bold}🟡 EJEMPLO 2: COMANDO MODERADO${colors.reset}`);
    console.log(
      `${colors.dim}Los comandos moderados muestran información antes de ejecutar${colors.reset}\n`
    );

    console.log(`${colors.cyan}$ npm run fix:npm-duplications${colors.reset}`);
    console.log(
      `${colors.yellow}⚠️  COMANDO MODERADO: Modificará archivos package.json${colors.reset}`
    );
    console.log(`${colors.dim}📂 Archivos afectados: package.json en root y apps${colors.reset}`);
    console.log(`${colors.dim}🔄 Recuperación: git restore para revertir cambios${colors.reset}`);

    const proceed = await this.askYesNo("\n¿Proceder con este comando? (s/N): ", false);

    if (proceed) {
      console.log(`${colors.green}✅ Ejecutando corrección de duplicaciones...${colors.reset}`);
      console.log(`${colors.dim}   ✓ Analizando dependencias duplicadas`);
      console.log(`   ✓ Consolidando package.json`);
      console.log(`   ✓ Operación completada${colors.reset}`);
    } else {
      console.log(`${colors.yellow}⏹️  Operación cancelada por el usuario${colors.reset}`);
    }

    await this.pause();
  }

  async demoDangerousCommand() {
    console.log(`\n${colors.bold}🔴 EJEMPLO 3: COMANDO PELIGROSO${colors.reset}`);
    console.log(
      `${colors.dim}Los comandos peligrosos requieren confirmación explícita${colors.reset}\n`
    );

    console.log(`${colors.cyan}$ npm run clean:force${colors.reset}`);

    // Mostrar warning completo
    this.displayFullSecurityWarning();

    const proceed = await this.askDangerousConfirmation();

    if (proceed) {
      console.log(`\n${colors.yellow}⚡ Ejecutando comando peligroso...${colors.reset}`);
      console.log(
        `${colors.dim}🔄 Recuerda los pasos de recuperación si algo sale mal${colors.reset}`
      );
      console.log(`${colors.green}✅ Limpieza forzada completada${colors.reset}`);
      console.log(`${colors.dim}   ✓ Procesos Node terminados`);
      console.log(`   ✓ Archivos .next eliminados`);
      console.log(`   ✓ node_modules limpio${colors.reset}`);
    } else {
      console.log(`\n${colors.green}✅ Operación cancelada por el usuario${colors.reset}`);
      console.log(
        `${colors.dim}💡 Puedes usar comandos más seguros como 'npm run clean:next'${colors.reset}`
      );
    }

    await this.pause();
  }

  displayFullSecurityWarning() {
    console.log("\n" + "=".repeat(60));
    console.log(
      `${colors.bold}${colors.bright_red}🚨 ANÁLISIS DE SEGURIDAD DEL COMANDO${colors.reset}`
    );
    console.log("=".repeat(60));

    console.log(
      `${colors.bold}📋 Comando:${colors.reset} ${colors.cyan}npm run clean:force${colors.reset}`
    );
    console.log(
      `${colors.bold}🎯 Nivel de Riesgo:${colors.reset} 🔴 ${colors.red}PELIGROSO${colors.reset}`
    );
    console.log(
      `${colors.bold}📝 Descripción:${colors.reset} Limpieza forzada (mata procesos Node)`
    );

    console.log(`\n🚨🚨 MUY PELIGROSO: Matará procesos Node + limpieza completa`);

    console.log(`\n${colors.bold}📂 Archivos/Procesos Afectados:${colors.reset}`);
    console.log(`   ${colors.yellow}▶${colors.reset} Todos los procesos Node.js activos`);
    console.log(`   ${colors.yellow}▶${colors.reset} Servidores de desarrollo en ejecución`);
    console.log(`   ${colors.yellow}▶${colors.reset} Archivos de build y dependencias`);

    console.log(
      `\n${colors.bold}🔄 Recuperación Posible:${colors.reset} ${colors.green}SÍ${colors.reset}`
    );
    console.log(`${colors.bold}📋 Pasos para Recuperar:${colors.reset}`);
    console.log(
      `   ${colors.cyan}1.${colors.reset} Ejecutar "npm install" para restaurar dependencias`
    );
    console.log(`   ${colors.cyan}2.${colors.reset} Reiniciar servidores de desarrollo`);
    console.log(`   ${colors.cyan}3.${colors.reset} Regenerar builds si es necesario`);

    console.log(`\n${colors.bold}⏱️  Tiempo Estimado:${colors.reset} 3-7 minutos`);
    console.log(
      `\n${colors.bold}⚡ Nivel de Peligro:${colors.reset} 🚨🚨 ${colors.bright_red}CRITICAL${colors.reset}`
    );

    console.log("\n" + "=".repeat(60));

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

  async askDangerousConfirmation() {
    return new Promise((resolve) => {
      const prompt = `${colors.bright_red}🚨 COMANDO PELIGROSO${colors.reset}\n¿Estás COMPLETAMENTE SEGURO de ejecutar este comando? (sí/NO): `;

      this.rl.question(prompt, (answer) => {
        const normalizedAnswer = answer.toLowerCase().trim();
        const confirmed =
          normalizedAnswer === "sí" || normalizedAnswer === "yes" || normalizedAnswer === "si";
        resolve(confirmed);
      });
    });
  }

  async askYesNo(prompt, defaultAnswer = false) {
    return new Promise((resolve) => {
      this.rl.question(prompt, (answer) => {
        const normalizedAnswer = answer.toLowerCase().trim();

        if (normalizedAnswer === "") {
          resolve(defaultAnswer);
        } else {
          const confirmed =
            normalizedAnswer === "y" ||
            normalizedAnswer === "s" ||
            normalizedAnswer === "yes" ||
            normalizedAnswer === "sí" ||
            normalizedAnswer === "si";
          resolve(confirmed);
        }
      });
    });
  }

  async pause() {
    return new Promise((resolve) => {
      this.rl.question(`\n${colors.dim}Presiona Enter para continuar...${colors.reset}`, () => {
        resolve();
      });
    });
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  const demo = new SecurityDemo();
  demo.demonstrateSecurityLevels().catch((error) => {
    console.error("Error en la demostración:", error);
    process.exit(1);
  });
}

module.exports = SecurityDemo;
