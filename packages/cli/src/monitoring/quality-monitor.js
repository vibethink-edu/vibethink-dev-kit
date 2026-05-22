#!/usr/bin/env node

/**
 * 📊 Quality Monitor Script
 * VThink 1.0 - Development Quality Monitoring
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Configuration
const config = {
  qualityThresholds: {
    testCoverage: 80,
    codeComplexity: 10,
    maxFileSize: 500, // KB
    maxFunctions: 50,
    maxLines: 500,
  },
  checkInterval: 300000, // 5 minutes
  generateReport: true,
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
const log = (message, color = colors.reset) => {
  console.log(`${color}${message}${colors.reset}`);
};

const exec = (command, options = {}) => {
  try {
    return execSync(command, {
      encoding: "utf8",
      ...options,
    });
  } catch (error) {
    return null;
  }
};

// Quality check functions
const checkCodeCoverage = () => {
  log(`\n📊 Checking code coverage...`, colors.cyan);

  try {
    const coverage = exec("npm run test:coverage");
    if (coverage) {
      // Extract coverage percentage from output
      const match = coverage.match(/All files\s+\|\s+(\d+)/);
      if (match) {
        const percentage = Number.parseInt(match[1]);
        const isHealthy = percentage >= config.qualityThresholds.testCoverage;

        log(
          `${isHealthy ? "✅" : "⚠️"} Coverage: ${percentage}%`,
          isHealthy ? colors.green : colors.yellow
        );

        return { percentage, healthy: isHealthy };
      }
    }
  } catch (error) {
    log(`❌ Coverage check failed`, colors.red);
  }

  return { percentage: 0, healthy: false };
};

const checkCodeComplexity = () => {
  log(`\n🔍 Checking code complexity...`, colors.cyan);

  try {
    const complexity = exec("npx eslint . --format=json");
    if (complexity) {
      const results = JSON.parse(complexity);
      const complexFiles = results.filter((result) =>
        result.messages.some(
          (msg) =>
            msg.ruleId === "complexity" &&
            Number.parseInt(msg.message.match(/\d+/)[0]) > config.qualityThresholds.codeComplexity
        )
      );

      if (complexFiles.length === 0) {
        log(`✅ Code complexity within limits`, colors.green);
        return { healthy: true, complexFiles: 0 };
      } else {
        log(`⚠️  ${complexFiles.length} files exceed complexity threshold`, colors.yellow);
        return { healthy: false, complexFiles: complexFiles.length };
      }
    }
  } catch (error) {
    log(`❌ Complexity check failed`, colors.red);
  }

  return { healthy: false, complexFiles: 0 };
};

const checkFileSizes = () => {
  log(`\n📁 Checking file sizes...`, colors.cyan);

  const largeFiles = [];

  const checkDirectory = (dir) => {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory() && !file.startsWith(".") && file !== "node_modules") {
        checkDirectory(filePath);
      } else if (stat.isFile() && file.match(/\.(ts|tsx|js|jsx)$/)) {
        const sizeKB = stat.size / 1024;
        if (sizeKB > config.qualityThresholds.maxFileSize) {
          largeFiles.push({ file: filePath, size: sizeKB });
        }
      }
    });
  };

  try {
    checkDirectory("src");

    if (largeFiles.length === 0) {
      log(`✅ All files within size limits`, colors.green);
      return { healthy: true, largeFiles: 0 };
    } else {
      log(`⚠️  ${largeFiles.length} files exceed size limit`, colors.yellow);
      largeFiles.forEach((file) => {
        log(`   • ${file.file}: ${file.size.toFixed(1)}KB`, colors.yellow);
      });
      return { healthy: false, largeFiles: largeFiles.length };
    }
  } catch (error) {
    log(`❌ File size check failed`, colors.red);
    return { healthy: false, largeFiles: 0 };
  }
};

const checkDependencies = () => {
  log(`\n📦 Checking dependencies...`, colors.cyan);

  try {
    const outdated = exec("npm outdated --json");
    const audit = exec("npm audit --json");

    let issues = 0;

    if (outdated) {
      const outdatedCount = Object.keys(JSON.parse(outdated)).length;
      if (outdatedCount > 0) {
        log(`⚠️  ${outdatedCount} outdated dependencies`, colors.yellow);
        issues += outdatedCount;
      }
    }

    if (audit) {
      const auditData = JSON.parse(audit);
      const vulnerabilities = auditData.metadata?.vulnerabilities || {};
      const totalVulns = Object.values(vulnerabilities).reduce((sum, count) => sum + count, 0);

      if (totalVulns > 0) {
        log(`⚠️  ${totalVulns} security vulnerabilities`, colors.red);
        issues += totalVulns;
      }
    }

    if (issues === 0) {
      log(`✅ Dependencies healthy`, colors.green);
      return { healthy: true, issues: 0 };
    } else {
      return { healthy: false, issues };
    }
  } catch (error) {
    log(`❌ Dependency check failed`, colors.red);
    return { healthy: false, issues: 0 };
  }
};

const checkBuildHealth = () => {
  log(`\n🏗️  Checking build health...`, colors.cyan);

  try {
    const buildResult = exec("npm run build", { stdio: "pipe" });

    if (buildResult !== null) {
      log(`✅ Build successful`, colors.green);
      return { healthy: true };
    } else {
      log(`❌ Build failed`, colors.red);
      return { healthy: false };
    }
  } catch (error) {
    log(`❌ Build check failed`, colors.red);
    return { healthy: false };
  }
};

const checkPerformance = () => {
  log(`\n⚡ Checking performance...`, colors.cyan);

  try {
    const bundleSize = exec("npm run build:analyze", { stdio: "pipe" });

    if (bundleSize) {
      log(`✅ Bundle analysis available`, colors.green);
      return { healthy: true };
    } else {
      log(`⚠️  Bundle analysis failed`, colors.yellow);
      return { healthy: false };
    }
  } catch (error) {
    log(`❌ Performance check failed`, colors.red);
    return { healthy: false };
  }
};

// Main quality monitoring function
async function monitorQuality() {
  log(`📊 Starting Quality Monitor`, colors.bold + colors.blue);

  const results = {
    timestamp: new Date().toISOString(),
    overall: true,
    checks: {},
  };

  try {
    // Run all quality checks
    results.checks.coverage = checkCodeCoverage();
    results.checks.complexity = checkCodeComplexity();
    results.checks.fileSizes = checkFileSizes();
    results.checks.dependencies = checkDependencies();
    results.checks.build = checkBuildHealth();
    results.checks.performance = checkPerformance();

    // Calculate overall health
    const allChecks = Object.values(results.checks);
    const failedChecks = allChecks.filter((check) => !check.healthy);

    results.overall = failedChecks.length === 0;
    results.summary = {
      total: allChecks.length,
      passed: allChecks.length - failedChecks.length,
      failed: failedChecks.length,
    };

    // Display results
    log(`\n📋 Quality Report Summary:`, colors.bold);

    if (results.overall) {
      log(`✅ Overall Quality: EXCELLENT`, colors.bold + colors.green);
    } else {
      log(`⚠️  Overall Quality: NEEDS ATTENTION`, colors.bold + colors.yellow);
      log(`   Failed checks: ${failedChecks.length}`, colors.yellow);
    }

    // Recommendations
    log(`\n💡 Quality Recommendations:`, colors.bold);

    if (!results.checks.coverage.healthy) {
      log(`   • Improve test coverage to ${config.qualityThresholds.testCoverage}%`, colors.cyan);
    }

    if (!results.checks.complexity.healthy) {
      log(
        `   • Refactor complex functions (max ${config.qualityThresholds.codeComplexity})`,
        colors.cyan
      );
    }

    if (!results.checks.fileSizes.healthy) {
      log(`   • Split large files (max ${config.qualityThresholds.maxFileSize}KB)`, colors.cyan);
    }

    if (!results.checks.dependencies.healthy) {
      log(`   • Update dependencies and fix vulnerabilities`, colors.cyan);
    }

    if (!results.checks.build.healthy) {
      log(`   • Fix build issues`, colors.cyan);
    }

    // Save quality report
    if (config.generateReport) {
      const reportPath = "quality-report.json";
      fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
      log(`\n📄 Quality report saved to: ${reportPath}`, colors.blue);
    }

    return results;
  } catch (error) {
    log(`❌ Quality monitoring failed: ${error.message}`, colors.red);
    results.overall = false;
    results.error = error.message;
    return results;
  }
}

// Continuous monitoring
function startContinuousMonitoring() {
  log(`🔄 Starting continuous quality monitoring`, colors.bold + colors.blue);
  log(`   Check interval: ${config.checkInterval / 1000}s`, colors.cyan);

  const runMonitor = () => {
    monitorQuality().then((results) => {
      if (!results.overall) {
        log(`⚠️  Quality issues detected!`, colors.yellow);
      }
    });
  };

  // Run immediately
  runMonitor();

  // Run periodically
  setInterval(runMonitor, config.checkInterval);
}

// Run quality monitor
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes("--continuous") || args.includes("-c")) {
    startContinuousMonitoring();
  } else {
    monitorQuality()
      .then((results) => {
        process.exit(results.overall ? 0 : 1);
      })
      .catch((error) => {
        log(`💥 Fatal error: ${error.message}`, colors.red);
        process.exit(1);
      });
  }
}

module.exports = { monitorQuality, startContinuousMonitoring, config };
