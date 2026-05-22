#!/usr/bin/env node

/**
 * Port Manager - Sistema inteligente de gestión de puertos
 * Detecta qué puertos están ocupados y gestiona servidores de desarrollo
 *
 * @author AI Assistant
 * @version 1.0.0
 * @date 2025-08-13
 */

const { exec, spawn } = require("child_process");
const { promisify } = require("util");
const execAsync = promisify(exec);

// Configuración de puertos fijos
const PORTS = {
  dashboard: 3001,
  admin: 3002,
  login: 3003,
  helpdesk: 3004,
  website: 3005,
  test: 3099,
};

// Colores para output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}📋 ${msg}${colors.reset}`),
  title: (msg) => console.log(`${colors.cyan}${colors.bold}🚀 ${msg}${colors.reset}`),
};

class PortManager {
  constructor() {
    this.isWindows = process.platform === "win32";
  }

  // Verificar si un puerto está ocupado
  async isPortBusy(port) {
    try {
      if (this.isWindows) {
        const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
        return stdout.trim().length > 0;
      } else {
        const { stdout } = await execAsync(`lsof -ti :${port}`);
        return stdout.trim().length > 0;
      }
    } catch (error) {
      return false;
    }
  }

  // Obtener el proceso que está usando un puerto
  async getPortProcess(port) {
    try {
      if (this.isWindows) {
        const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
        const lines = stdout.trim().split("\n");
        if (lines.length > 0) {
          const pid = lines[0].split(/\s+/).pop();
          const { stdout: processInfo } = await execAsync(`tasklist /FI "PID eq ${pid}" /FO CSV`);
          return processInfo.split("\n")[1] || `PID: ${pid}`;
        }
      } else {
        const { stdout } = await execAsync(`lsof -ti :${port} | head -1`);
        const pid = stdout.trim();
        if (pid) {
          const { stdout: processInfo } = await execAsync(`ps -p ${pid} -o comm=`);
          return processInfo.trim() || `PID: ${pid}`;
        }
      }
    } catch (error) {
      return "Desconocido";
    }
    return null;
  }

  // Matar proceso en un puerto específico
  async killPort(port) {
    try {
      if (this.isWindows) {
        const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
        const lines = stdout.trim().split("\n");
        for (const line of lines) {
          const pid = line.split(/\s+/).pop();
          if (pid && pid !== "0") {
            await execAsync(`taskkill /F /PID ${pid}`);
            log.success(`Puerto ${port} liberado (PID: ${pid})`);
          }
        }
      } else {
        await execAsync(`lsof -ti :${port} | xargs kill -9`);
        log.success(`Puerto ${port} liberado`);
      }
      return true;
    } catch (error) {
      log.error(`No se pudo liberar puerto ${port}: ${error.message}`);
      return false;
    }
  }

  // Verificar estado de todos los puertos
  async checkAllPorts() {
    log.title("ESTADO DE PUERTOS DEL SISTEMA");
    console.log("=".repeat(60));

    const results = {};

    for (const [name, port] of Object.entries(PORTS)) {
      const isBusy = await this.isPortBusy(port);
      const process = isBusy ? await this.getPortProcess(port) : null;

      results[name] = { port, isBusy, process };

      if (isBusy) {
        log.warning(
          `${name.toUpperCase().padEnd(12)} Puerto ${port} - ${colors.red}OCUPADO${colors.reset} (${process})`
        );
      } else {
        log.success(
          `${name.toUpperCase().padEnd(12)} Puerto ${port} - ${colors.green}LIBRE${colors.reset}`
        );
      }
    }

    console.log("=".repeat(60));

    const busyPorts = Object.values(results).filter((r) => r.isBusy).length;
    const freePorts = Object.values(results).length - busyPorts;

    log.info(
      `${colors.green}${freePorts} puertos libres${colors.reset} | ${colors.red}${busyPorts} puertos ocupados${colors.reset}`
    );

    return results;
  }

  // Iniciar servidor con detección inteligente
  async startServer(appName, targetPort = null) {
    const port = targetPort || PORTS[appName];

    if (!port) {
      log.error(`Aplicación '${appName}' no reconocida`);
      return false;
    }

    log.title(`INICIANDO ${appName.toUpperCase()} EN PUERTO ${port}`);

    // Verificar si el puerto está ocupado
    const isBusy = await this.isPortBusy(port);

    if (isBusy) {
      const process = await this.getPortProcess(port);
      log.warning(`Puerto ${port} ocupado por: ${process}`);

      // Preguntar si quiere liberar el puerto
      const readline = require("readline");
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      return new Promise((resolve) => {
        rl.question(`¿Liberar puerto ${port}? (s/N): `, async (answer) => {
          rl.close();

          if (answer.toLowerCase() === "s" || answer.toLowerCase() === "si") {
            const killed = await this.killPort(port);
            if (killed) {
              // Esperar un momento antes de iniciar
              setTimeout(() => {
                this.launchApp(appName, port);
                resolve(true);
              }, 1000);
            } else {
              resolve(false);
            }
          } else {
            log.info("Operación cancelada");
            resolve(false);
          }
        });
      });
    } else {
      log.success(`Puerto ${port} disponible`);
      this.launchApp(appName, port);
      return true;
    }
  }

  // Lanzar aplicación
  launchApp(appName, port) {
    const appPaths = {
      dashboard: "apps/dashboard",
      admin: "apps/admin",
      login: "apps/login",
      helpdesk: "apps/helpdesk",
      website: "apps/website",
    };

    const appPath = appPaths[appName];
    if (!appPath) {
      log.error(`Ruta no encontrada para ${appName}`);
      return;
    }

    log.info(`Ejecutando: cd ${appPath} && npm run dev -- -p ${port}`);

    // Spawn del proceso
    const child = spawn("npm", ["run", "dev", "--", "-p", port.toString()], {
      cwd: appPath,
      stdio: "inherit",
      shell: true,
    });

    child.on("error", (error) => {
      log.error(`Error iniciando ${appName}: ${error.message}`);
    });

    log.success(`${appName} iniciándose en http://localhost:${port}`);
  }

  // Comando para puerto de test especial
  async startTestServer() {
    log.title("🧪 SERVIDOR DE PRUEBAS - PUERTO 3099");

    const isBusy = await this.isPortBusy(PORTS.test);
    if (isBusy) {
      log.warning("Puerto de pruebas ocupado, liberando...");
      await this.killPort(PORTS.test);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    log.success("Puerto 3099 reservado para pruebas");
    log.info("Para conectar tu app de prueba, usa: --port 3099");
    log.info("URL de pruebas: http://localhost:3099");

    return true;
  }

  // Emergencia: limpiar todos los puertos
  async emergencyCleanup() {
    log.title("🚨 LIMPIEZA DE EMERGENCIA - LIBERANDO TODOS LOS PUERTOS");

    let cleaned = 0;

    for (const [name, port] of Object.entries(PORTS)) {
      const isBusy = await this.isPortBusy(port);
      if (isBusy) {
        log.warning(`Liberando ${name} (puerto ${port})...`);
        const success = await this.killPort(port);
        if (success) cleaned++;
      }
    }

    if (cleaned > 0) {
      log.success(`✅ ${cleaned} puertos liberados`);
      log.info("Esperando 2 segundos antes de continuar...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } else {
      log.success("Todos los puertos ya estaban libres");
    }

    return cleaned;
  }
}

// CLI Interface
async function main() {
  const portManager = new PortManager();
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "status":
    case "check":
      await portManager.checkAllPorts();
      break;

    case "start":
      const app = args[1];
      if (!app) {
        log.error("Especifica la aplicación: dashboard, admin, login, helpdesk, website");
        process.exit(1);
      }
      await portManager.startServer(app);
      break;

    case "test":
      await portManager.startTestServer();
      break;

    case "kill":
      const portToKill = args[1];
      if (!portToKill) {
        log.error("Especifica el puerto a liberar");
        process.exit(1);
      }
      await portManager.killPort(Number.parseInt(portToKill));
      break;

    case "emergency":
    case "cleanup":
      await portManager.emergencyCleanup();
      break;

    default:
      console.log(`
${colors.cyan}${colors.bold}🚀 PORT MANAGER - Gestión Inteligente de Puertos${colors.reset}

${colors.yellow}COMANDOS DISPONIBLES:${colors.reset}
  status              Verificar estado de todos los puertos
  start <app>         Iniciar aplicación con detección automática
  test                Reservar puerto 3099 para pruebas
  kill <puerto>       Liberar puerto específico
  emergency           Liberar todos los puertos (emergencia)

${colors.yellow}APLICACIONES:${colors.reset}
  dashboard (3001)    Admin (3002)      Login (3003)
  helpdesk (3004)     Website (3005)    Test (3099)

${colors.yellow}EJEMPLOS:${colors.reset}
  node port-manager.cjs status
  node port-manager.cjs start dashboard
  node port-manager.cjs test
  node port-manager.cjs emergency

${colors.dim}🎯 Soluciona el problema de "¿está arriba el servidor?" de una vez${colors.reset}
`);
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  main().catch((error) => {
    console.error("Error:", error.message);
    process.exit(1);
  });
}

module.exports = PortManager;
