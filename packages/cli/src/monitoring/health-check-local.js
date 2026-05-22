#!/usr/bin/env node

/**
 * 🏥 Local Health Check Script
 * VThink 1.0 - Development Health Monitoring
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Configuration
const config = {
  port: 8080,
  host: "localhost",
  healthEndpoints: ["/health", "/api/health", "/dev-portal", "/"],
  services: [
    { name: "Vite Dev Server", port: 8080, path: "/" },
    { name: "Supabase Local", port: 54321, path: "/health" },
    { name: "Traefik", port: 8080, path: "/api/rawdata" },
  ],
};

// Colors for console output
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

// TODO: log `${color}${message}${colors.reset}`

// Check if port is in use
const checkPort = (port) => {
  try {
    execSync(`netstat -an | findstr :${port}`, { stdio: "pipe" });
    return true;
  } catch (error) {
    return false;
  }
};

// Check if service is responding
const checkService = async (service) => {
  try {
    const response = await fetch(`http://${config.host}:${service.port}${service.path}`);
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Check file system health
const checkFileSystem = () => {
  const criticalFiles = [
    "package.json",
    "vite.config.ts",
    "tsconfig.json",
    "tailwind.config.ts",
    "src/main.tsx",
    "src/App.tsx",
  ];

  const missingFiles = criticalFiles.filter((file) => !fs.existsSync(file));

  return {
    healthy: missingFiles.length === 0,
    missingFiles,
  };
};

// Check dependencies health
const checkDependencies = () => {
  try {
    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
    const nodeModulesExists = fs.existsSync("node_modules");
    const packageLockExists = fs.existsSync("package-lock.json");

    return {
      healthy: nodeModulesExists && packageLockExists,
      nodeModulesExists,
      packageLockExists,
      dependencies: Object.keys(packageJson.dependencies || {}).length,
      devDependencies: Object.keys(packageJson.devDependencies || {}).length,
    };
  } catch (error) {
    return { healthy: false, error: error.message };
  }
};

// Check build health
const checkBuildHealth = () => {
  try {
    const distExists = fs.existsSync("dist");
    const indexHtmlExists = fs.existsSync("dist/index.html");

    return {
      healthy: distExists && indexHtmlExists,
      distExists,
      indexHtmlExists,
    };
  } catch (error) {
    return { healthy: false, error: error.message };
  }
};

// Main health check function
async function performHealthCheck() {
  // TODO: log `🏥 Starting Local Health Check`

  const results = {
    timestamp: new Date().toISOString(),
    overall: true,
    checks: {},
  };

  try {
    // Check 1: File System
    // TODO: log `\n📁 Checking file system...`
    const fsHealth = checkFileSystem();
    results.checks.fileSystem = fsHealth;

    if (fsHealth.healthy) {
      // TODO: log `✅ File system healthy`
    } else {
      // TODO: log `❌ Missing files: ${fsHealth.missingFiles.join(', ')}`
      results.overall = false;
    }

    // Check 2: Dependencies
    // TODO: log `\n📦 Checking dependencies...`
    const depsHealth = checkDependencies();
    results.checks.dependencies = depsHealth;

    if (depsHealth.healthy) {
      // TODO: log `✅ Dependencies healthy (${depsHealth.dependencies} deps, ${depsHealth.devDependencies} dev deps)`
    } else {
      // TODO: log `❌ Dependencies unhealthy: ${depsHealth.error || 'Missing node_modules'}`
      results.overall = false;
    }

    // Check 3: Port Availability
    // TODO: log `\n🔌 Checking port availability...`
    const portHealth = checkPort(config.port);
    results.checks.portAvailability = { healthy: !portHealth, port: config.port };

    if (!portHealth) {
      // TODO: log `✅ Port ${config.port} available`
    } else {
      // TODO: log `⚠️  Port ${config.port} in use`
    }

    // Check 4: Services (if running)
    // TODO: log `\n🌐 Checking services...`
    const serviceChecks = [];

    for (const service of config.services) {
      const isRunning = checkPort(service.port);
      const isResponding = isRunning ? await checkService(service) : false;

      serviceChecks.push({
        name: service.name,
        port: service.port,
        running: isRunning,
        responding: isResponding,
        healthy: isRunning && isResponding,
      });

      if (isRunning && isResponding) {
        // TODO: log `✅ ${service.name} healthy`
      } else if (isRunning) {
        // TODO: log `⚠️  ${service.name} running but not responding`
      } else {
        // TODO: log `ℹ️  ${service.name} not running`
      }
    }

    results.checks.services = serviceChecks;

    // Check 5: Build Health
    // TODO: log `\n🏗️  Checking build health...`
    const buildHealth = checkBuildHealth();
    results.checks.build = buildHealth;

    if (buildHealth.healthy) {
      // TODO: log `✅ Build healthy`
    } else {
      // TODO: log `⚠️  Build not ready`
    }

    // Overall result
    // TODO: log `\n📊 Health Check Summary:`

    if (results.overall) {
      // TODO: log `✅ Overall Health: EXCELLENT`
    } else {
      // TODO: log `⚠️  Overall Health: NEEDS ATTENTION`
    }

    // Recommendations
    // TODO: log `\n💡 Recommendations:`

    if (!fsHealth.healthy) {
      // TODO: log `   • Run: npm run dev:setup`
    }

    if (!depsHealth.healthy) {
      // TODO: log `   • Run: npm install`
    }

    if (portHealth) {
      // TODO: log `   • Kill process on port ${config.port} or use different port`
    }

    if (!buildHealth.healthy) {
      // TODO: log `   • Run: npm run build`
    }

    // Save health report
    const reportPath = "health-report.json";
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    // TODO: log `\n📄 Health report saved to: ${reportPath}`

    return results;
  } catch (error) {
    // TODO: log `❌ Health check failed: ${error.message}`
    results.overall = false;
    results.error = error.message;
    return results;
  }
}

// Run health check
if (require.main === module) {
  performHealthCheck()
    .then((results) => {
      process.exit(results.overall ? 0 : 1);
    })
    .catch((error) => {
      // TODO: log `💥 Fatal error: ${error.message}`
      process.exit(1);
    });
}

module.exports = { performHealthCheck, config };
