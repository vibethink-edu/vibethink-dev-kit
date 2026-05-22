#!/usr/bin/env node

/**
 * 🚀 Optimized Development Script
 * VThink 1.0 - Local Development Enhancement
 */

const { execSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

// Configuration
const config = {
  port: 8080,
  host: "localhost",
  watchMode: true,
  autoRestart: true,
  healthCheck: true,
  performanceMonitoring: true,
  memoryLimit: "2GB",
  cpuLimit: "50%",
};

// Colors for console output
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

// TODO: log `${color}${message}${colors.reset}`

const exec = (command, options = {}) => {
  try {
    // TODO: log `🔄 ${command}`, colors.blue
    return execSync(command, {
      stdio: "inherit",
      ...options,
    });
  } catch (error) {
    // TODO: log `❌ ${command} failed`, colors.red
    throw error;
  }
};

// Health check function
const checkHealth = async () => {
  try {
    const response = await fetch(`http://${config.host}:${config.port}/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Performance monitoring
const monitorPerformance = () => {
  const startTime = Date.now();
  const memoryUsage = process.memoryUsage();

  return {
    uptime: Date.now() - startTime,
    memory: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024) + "MB",
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + "MB",
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + "MB",
    },
  };
};

// Main development process
async function startOptimizedDev() {
  // TODO: log `🚀 Starting Optimized Development Environment`, colors.bold + colors.green

  try {
    // Step 1: Pre-flight checks
    // TODO: log `\n📋 Step 1: Pre-flight checks`, colors.bold

    // Check Node.js version
    const nodeVersion = exec("node --version", { encoding: "utf8" }).trim();
    // TODO: log `✅ Node.js: ${nodeVersion}`, colors.green

    // Check npm version
    const npmVersion = exec("npm --version", { encoding: "utf8" }).trim();
    // TODO: log `✅ npm: ${npmVersion}`, colors.green

    // Check available memory
    const memInfo = require("os").freemem();
    const memGB = Math.round((memInfo / 1024 / 1024 / 1024) * 100) / 100;
    // TODO: log `✅ Available memory: ${memGB}GB`, colors.green

    // Step 2: Clean environment
    // TODO: log `\n🧹 Step 2: Clean environment`, colors.bold

    // Kill existing processes
    try {
      exec("taskkill /f /im node.exe 2>nul", { stdio: "ignore" });
      // TODO: log `✅ Killed existing Node.js processes`, colors.green
    } catch (error) {
      // TODO: log `ℹ️  No existing processes to kill`, colors.yellow
    }

    // Clear cache
    exec("npm run clean:cache");
    // TODO: log `✅ Cleared npm cache`, colors.green

    // Step 3: Install dependencies
    // TODO: log `\n📦 Step 3: Install dependencies`, colors.bold

    exec("npm ci");
    // TODO: log `✅ Dependencies installed`, colors.green

    // Step 4: Type checking
    // TODO: log `\n🔍 Step 4: Type checking`, colors.bold

    exec("npm run type-check");
    // TODO: log `✅ TypeScript validation passed`, colors.green

    // Step 5: Linting
    // TODO: log `\n🎨 Step 5: Code quality check`, colors.bold

    exec("npm run lint");
    // TODO: log `✅ ESLint passed`, colors.green

    // Step 6: Start development server
    // TODO: log `\n🚀 Step 6: Starting development server`, colors.bold

    const devProcess = spawn("npm", ["run", "dev"], {
      stdio: "inherit",
      env: {
        ...process.env,
        NODE_ENV: "development",
        VITE_DEV_MODE: "optimized",
        VITE_PERFORMANCE_MONITORING: "true",
      },
    });

    // Step 7: Health monitoring
    // TODO: log `\n🏥 Step 7: Health monitoring`, colors.bold

    let healthCheckInterval;
    let performanceInterval;

    // Start health monitoring after 10 seconds
    setTimeout(async () => {
      healthCheckInterval = setInterval(async () => {
        const isHealthy = await checkHealth();
        if (isHealthy) {
          // TODO: log `✅ Health check passed`, colors.green
        } else {
          // TODO: log `⚠️  Health check failed`, colors.yellow
        }
      }, 30000); // Every 30 seconds

      // Performance monitoring
      performanceInterval = setInterval(() => {
        const perf = monitorPerformance();
        // TODO: log `📊 Performance: ${perf.memory.heapUsed} heap, ${perf.memory.rss} total`, colors.cyan
      }, 60000); // Every minute
    }, 10000);

    // Step 8: Auto-restart on file changes
    if (config.autoRestart) {
      // TODO: log `\n🔄 Step 8: Auto-restart enabled`, colors.bold

      // Watch for critical file changes
      const criticalFiles = [
        "package.json",
        "vite.config.ts",
        "tailwind.config.ts",
        "tsconfig.json",
      ];

      criticalFiles.forEach((file) => {
        if (fs.existsSync(file)) {
          fs.watchFile(file, (curr, prev) => {
            if (curr.mtime > prev.mtime) {
              // TODO: log `🔄 Critical file changed: ${file}`, colors.magenta
              // TODO: log `🔄 Restarting development server...`, colors.magenta
              devProcess.kill("SIGTERM");
            }
          });
        }
      });
    }

    // Step 9: Development tips
    // TODO: log `\n💡 Development Tips:`, colors.bold
    // TODO: log `   • Press Ctrl+C to stop the server`, colors.cyan
    // TODO: log `   • Use npm run test:watch for continuous testing`, colors.cyan
    // TODO: log `   • Use npm run build:watch for continuous building`, colors.cyan
    // TODO: log `   • Check http://localhost:8080 for the app`, colors.cyan
    // TODO: log `   • Check http://localhost:8080/dev-portal for dev tools`, colors.cyan

    // Handle process termination
    process.on("SIGINT", () => {
      // TODO: log `\n🛑 Shutting down development environment...`, colors.yellow

      if (healthCheckInterval) clearInterval(healthCheckInterval);
      if (performanceInterval) clearInterval(performanceInterval);

      devProcess.kill("SIGTERM");
      process.exit(0);
    });

    // Handle process errors
    devProcess.on("error", (error) => {
      // TODO: log `❌ Development server error: ${error.message}`, colors.red
      process.exit(1);
    });

    devProcess.on("exit", (code) => {
      if (code !== 0) {
        // TODO: log `❌ Development server exited with code ${code}`, colors.red
        process.exit(code);
      }
    });
  } catch (error) {
    // TODO: log `❌ Failed to start optimized development: ${error.message}`, colors.red
    process.exit(1);
  }
}

// Run development
if (require.main === module) {
  startOptimizedDev().catch((error) => {
    // TODO: log `💥 Fatal error: ${error.message}`, colors.red
    process.exit(1);
  });
}

module.exports = { startOptimizedDev, config };
