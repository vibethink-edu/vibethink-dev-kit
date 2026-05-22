#!/usr/bin/env node

/**
 * Dashboard Consistency Validator
 *
 * Comprehensive validation for:
 * - Sidebar consistency (universal DashboardLayout only)
 * - Layout standardization (proper imports and structure)
 * - Runtime HTML violations (nested buttons, etc.)
 * - Padding conflicts (DashboardLayout p-4 vs content p-6)
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const DASHBOARDS_PATH = path.join(__dirname, "../../apps/dashboard/app");
const COLORS = {
  RED: "\x1b[31m",
  GREEN: "\x1b[32m",
  YELLOW: "\x1b[33m",
  BLUE: "\x1b[34m",
  RESET: "\x1b[0m",
  BOLD: "\x1b[1m",
};

function log(color, message) {
  console.log(`${color}${message}${COLORS.RESET}`);
}

function logHeader(message) {
  console.log("\n" + "=".repeat(60));
  log(COLORS.BOLD + COLORS.BLUE, message);
  console.log("=".repeat(60));
}

function validateSidebarConsistency() {
  logHeader("🔍 DASHBOARD CONSISTENCY VALIDATION");

  const violations = [];
  const validDashboards = [];

  // Get all dashboard directories
  const dashboards = fs
    .readdirSync(DASHBOARDS_PATH, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  log(COLORS.BLUE, `\n📋 Analyzing ${dashboards.length} dashboards...`);

  for (const dashboard of dashboards) {
    const dashboardPath = path.join(DASHBOARDS_PATH, dashboard);
    log(COLORS.YELLOW, `\n🔍 Checking: ${dashboard}`);

    // Check for prohibited patterns
    const sidebarViolations = checkForSidebarViolations(dashboardPath, dashboard);
    const layoutViolations = checkForLayoutViolations(dashboardPath, dashboard);
    const runtimeViolations = checkForRuntimeViolations(dashboardPath, dashboard);

    if (
      sidebarViolations.length > 0 ||
      layoutViolations.length > 0 ||
      runtimeViolations.length > 0
    ) {
      violations.push({
        dashboard,
        sidebarViolations,
        layoutViolations,
        runtimeViolations,
      });
      log(COLORS.RED, `  ❌ VIOLATIONS FOUND`);
    } else {
      validDashboards.push(dashboard);
      log(COLORS.GREEN, `  ✅ VALID`);
    }
  }

  // Report Results
  logHeader("📊 VALIDATION RESULTS");

  if (violations.length === 0) {
    log(
      COLORS.GREEN,
      `\n🎉 SUCCESS: All ${dashboards.length} dashboards follow sidebar consistency patterns!`
    );
    return true;
  }

  log(
    COLORS.RED,
    `\n🚨 VIOLATIONS FOUND: ${violations.length}/${dashboards.length} dashboards have issues`
  );

  // Detail violations
  for (const violation of violations) {
    log(COLORS.RED, `\n❌ ${violation.dashboard.toUpperCase()}:`);

    if (violation.sidebarViolations.length > 0) {
      log(COLORS.RED, "  Sidebar Violations:");
      violation.sidebarViolations.forEach((v) => {
        log(COLORS.RED, `    - ${v}`);
      });
    }

    if (violation.layoutViolations.length > 0) {
      log(COLORS.RED, "  Layout Violations:");
      violation.layoutViolations.forEach((v) => {
        log(COLORS.RED, `    - ${v}`);
      });
    }

    if (violation.runtimeViolations.length > 0) {
      log(COLORS.RED, "  Runtime Violations:");
      violation.runtimeViolations.forEach((v) => {
        log(COLORS.RED, `    - ${v}`);
      });
    }
  }

  // Show valid dashboards
  if (validDashboards.length > 0) {
    log(COLORS.GREEN, `\n✅ VALID DASHBOARDS (${validDashboards.length}):`);
    validDashboards.forEach((dashboard) => {
      log(COLORS.GREEN, `  ✓ ${dashboard}`);
    });
  }

  log(COLORS.YELLOW, "\n🔧 FIX REQUIRED: Update violating dashboards to follow CRM pattern");
  return false;
}

function checkForSidebarViolations(dashboardPath, dashboardName) {
  const violations = [];

  try {
    // Check for prohibited sidebar patterns
    const prohibitedPatterns = [
      { pattern: /\w+Sidebar.*>/g, description: "App-specific sidebar component" },
      { pattern: /<.*Sidebar[^>]*>/g, description: "Sidebar element (other than DashboardLayout)" },
      { pattern: /import.*Sidebar.*from.*components/g, description: "App-specific sidebar import" },
    ];

    // Scan all files in dashboard
    const files = getAllFiles(dashboardPath, [".tsx", ".ts"]);

    for (const file of files) {
      // Skip DashboardLayout files (they're allowed to have sidebar)
      if (file.includes("DashboardLayout") || file.includes("layout")) {
        continue;
      }

      const content = fs.readFileSync(file, "utf8");

      for (const { pattern, description } of prohibitedPatterns) {
        const matches = content.match(pattern);
        if (matches) {
          violations.push(`${description} in ${path.relative(dashboardPath, file)}: ${matches[0]}`);
        }
      }
    }
  } catch (error) {
    violations.push(`Error scanning ${dashboardName}: ${error.message}`);
  }

  return violations;
}

function checkForLayoutViolations(dashboardPath, dashboardName) {
  const violations = [];

  try {
    const pageFile = path.join(dashboardPath, "page.tsx");

    if (!fs.existsSync(pageFile)) {
      violations.push("Missing page.tsx file");
      return violations;
    }

    const content = fs.readFileSync(pageFile, "utf8");

    // Check for required DashboardLayout import
    if (!content.includes("import DashboardLayout from")) {
      violations.push("Missing DashboardLayout import");
    }

    // Check for prohibited layout imports
    if (content.includes("BunduiCompleteLayout")) {
      violations.push("Using BunduiCompleteLayout instead of DashboardLayout");
    }

    // Check for proper layout structure
    if (!content.includes("<DashboardLayout>")) {
      violations.push("Not using DashboardLayout component");
    }

    // Check for proper content structure (no p-6 to avoid conflict with DashboardLayout p-4)
    if (!content.includes("space-y-6")) {
      violations.push("Missing standard content structure (space-y-6)");
    }

    // Check for forbidden padding patterns that conflict with DashboardLayout
    if (content.includes("space-y-6 p-6")) {
      violations.push("Using conflicting padding pattern (p-6) - should use only space-y-6");
    }
  } catch (error) {
    violations.push(`Error checking layout in ${dashboardName}: ${error.message}`);
  }

  return violations;
}

function checkForRuntimeViolations(dashboardPath, dashboardName) {
  const violations = [];

  try {
    // Scan all files in dashboard for runtime issues
    const files = getAllFiles(dashboardPath, [".tsx", ".ts"]);

    for (const file of files) {
      const content = fs.readFileSync(file, "utf8");
      const relativeFile = path.relative(dashboardPath, file);

      // Check for nested button violations (TooltipTrigger without asChild containing Button)
      const nestedButtonPattern = /<TooltipTrigger(?![^>]*asChild)[^>]*>[\s\S]*?<Button/g;
      const nestedButtonMatches = content.match(nestedButtonPattern);
      if (nestedButtonMatches) {
        violations.push(
          `Nested button violation in ${relativeFile}: TooltipTrigger without asChild containing Button`
        );
      }

      // Check for other interactive element nesting issues
      const badNestingPatterns = [
        { pattern: /<button[^>]*>[\s\S]*?<button/g, description: "Nested button elements" },
        { pattern: /<a[^>]*>[\s\S]*?<button/g, description: "Button inside link element" },
        { pattern: /<button[^>]*>[\s\S]*?<a/g, description: "Link inside button element" },
      ];

      for (const { pattern, description } of badNestingPatterns) {
        const matches = content.match(pattern);
        if (matches) {
          violations.push(`${description} in ${relativeFile}`);
        }
      }
    }
  } catch (error) {
    violations.push(`Error checking runtime issues in ${dashboardName}: ${error.message}`);
  }

  return violations;
}

function getAllFiles(dir, extensions) {
  let files = [];

  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);

      if (item.isDirectory()) {
        files = files.concat(getAllFiles(fullPath, extensions));
      } else if (extensions.some((ext) => item.name.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }

  return files;
}

// Run validation
if (require.main === module) {
  const isValid = validateSidebarConsistency();
  process.exit(isValid ? 0 : 1);
}

module.exports = { validateSidebarConsistency };
