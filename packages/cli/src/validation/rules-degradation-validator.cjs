#!/usr/bin/env node

/**
 * 🛡️ Rules Degradation Validator
 * Prevents the accumulation of scattered rule files
 *
 * Run: npm run validate:rules-degradation
 */

const fs = require("fs");
const path = require("path");

// Configuration
const CONFIG = {
  maxRootFiles: 10,
  maxRuleFiles: 10,
  allowedRootFiles: [
    "README.md",
    "CLAUDE.md",
    "AI_UNIVERSAL_STANDARDS.md",
    "UI_MASTER_GUIDE.md",
    "RULES_NAVIGATION.md",
    "FILE_PLACEMENT_QUICK_REFERENCE.md",
    "RULES_DEGRADATION_PREVENTION.md",
    "LICENSE",
    "CHANGELOG.md",
    "CONTRIBUTING.md",
    "CODE_OF_CONDUCT.md",
    "SECURITY.md",
  ],
  forbiddenPatterns: [
    /^TEMP_/i,
    /^TEST_/i,
    /^QUICK_FIX_/i,
    /_STATUS\.md$/i,
    /_REPORT\.md$/i,
    /_COMPLETED\.md$/i,
    /_HANDOFF\.md$/i,
    /^scratch/i,
  ],
  validationReportDirs: [
    "docs/reports/validation",
    "docs/reports/quality",
    "docusaurus-dev/docs/validation",
    "docusaurus-dev/docs/reports",
  ],
};

class RulesDegradationValidator {
  constructor() {
    this.violations = [];
    this.warnings = [];
    this.metrics = {
      rootFiles: 0,
      totalRuleFiles: 0,
      duplicateRules: 0,
      unindexedFiles: 0,
      temporaryFiles: 0,
      validationFiles: 0,
    };
  }

  /**
   * Main validation entry point
   */
  async validate() {
    console.log("🛡️  Rules Degradation Validator\n");
    console.log("━".repeat(50));

    this.checkRootDirectory();
    this.checkValidationFiles();
    this.checkDuplicateRules();
    this.checkUnindexedFiles();
    this.checkTemporaryFiles();

    this.printReport();

    // Return exit code based on violations
    return this.violations.length > 0 ? 1 : 0;
  }

  /**
   * Check root directory for unauthorized files
   */
  checkRootDirectory() {
    console.log("\n📁 Checking root directory...");

    const rootFiles = fs
      .readdirSync(".")
      .filter((file) => file.endsWith(".md") && fs.statSync(file).isFile());

    this.metrics.rootFiles = rootFiles.length;

    rootFiles.forEach((file) => {
      if (!CONFIG.allowedRootFiles.includes(file)) {
        // Check if it matches forbidden patterns
        const isForbidden = CONFIG.forbiddenPatterns.some((pattern) => pattern.test(file));

        if (isForbidden) {
          this.violations.push({
            type: "FORBIDDEN_ROOT_FILE",
            file: file,
            message: `Forbidden file in root: ${file}`,
            fix: `Move to appropriate directory or delete`,
          });
        } else {
          this.warnings.push({
            type: "UNAUTHORIZED_ROOT_FILE",
            file: file,
            message: `Unauthorized file in root: ${file}`,
            fix: `Consider moving to docs/ or appropriate directory`,
          });
        }
      }
    });

    if (rootFiles.length > CONFIG.maxRootFiles) {
      this.violations.push({
        type: "TOO_MANY_ROOT_FILES",
        count: rootFiles.length,
        message: `Too many files in root: ${rootFiles.length} (max: ${CONFIG.maxRootFiles})`,
        fix: "Move non-essential files to appropriate directories",
      });
    }
  }

  /**
   * Check for scattered validation files
   */
  checkValidationFiles() {
    console.log("\n📊 Checking validation files...");

    let validationFiles = [];

    CONFIG.validationReportDirs.forEach((dir) => {
      if (fs.existsSync(dir)) {
        const files = this.getAllFiles(dir).filter(
          (f) => f.includes("validation") || f.includes("VALIDATION")
        );
        validationFiles = validationFiles.concat(files);
      }
    });

    this.metrics.validationFiles = validationFiles.length;

    if (validationFiles.length > 20) {
      this.violations.push({
        type: "TOO_MANY_VALIDATION_FILES",
        count: validationFiles.length,
        message: `Too many validation files: ${validationFiles.length}`,
        fix: "Consolidate into master validation reports",
        files: validationFiles.slice(0, 10), // Show first 10
      });
    }
  }

  /**
   * Check for duplicate rule definitions
   */
  checkDuplicateRules() {
    console.log("\n🔍 Checking for duplicate rules...");

    const rulePatterns = [
      /^#.*RULES?.*$/gm,
      /^##.*MANDATORY.*$/gm,
      /^##.*FORBIDDEN.*$/gm,
      /^##.*MUST.*$/gm,
      /^##.*NEVER.*$/gm,
    ];

    const ruleLocations = new Map();

    // Scan all markdown files
    const allMdFiles = this.getAllFiles(".", ".md");

    allMdFiles.forEach((file) => {
      if (file.includes("node_modules") || file.includes(".git")) return;

      try {
        const content = fs.readFileSync(file, "utf8");

        rulePatterns.forEach((pattern) => {
          const matches = content.match(pattern);
          if (matches) {
            matches.forEach((match) => {
              const rule = match.trim();
              if (!ruleLocations.has(rule)) {
                ruleLocations.set(rule, []);
              }
              ruleLocations.get(rule).push(file);
            });
          }
        });
      } catch (error) {
        // Skip files that can't be read
      }
    });

    // Find duplicates
    let duplicateCount = 0;
    ruleLocations.forEach((locations, rule) => {
      if (locations.length > 1) {
        duplicateCount++;
        if (duplicateCount <= 5) {
          // Only report first 5
          this.warnings.push({
            type: "DUPLICATE_RULE",
            rule: rule.substring(0, 50) + "...",
            locations: locations,
            message: `Duplicate rule found in ${locations.length} files`,
            fix: "Consolidate into single master file",
          });
        }
      }
    });

    this.metrics.duplicateRules = duplicateCount;
  }

  /**
   * Check for unindexed rule files
   */
  checkUnindexedFiles() {
    console.log("\n📚 Checking for unindexed files...");

    // Read RULES_NAVIGATION.md
    let navigationContent = "";
    try {
      navigationContent = fs.readFileSync("RULES_NAVIGATION.md", "utf8");
    } catch (error) {
      this.violations.push({
        type: "MISSING_NAVIGATION",
        message: "RULES_NAVIGATION.md not found",
        fix: "Create or restore RULES_NAVIGATION.md",
      });
      return;
    }

    // Find all rule-like files
    const ruleFiles = this.getAllFiles(".", ".md").filter(
      (file) =>
        (file.includes("RULE") ||
          file.includes("STANDARD") ||
          file.includes("GUIDE") ||
          file.includes("POLICY")) &&
        !file.includes("node_modules") &&
        !file.includes(".git")
    );

    // Check if indexed
    let unindexedCount = 0;
    ruleFiles.forEach((file) => {
      const fileName = path.basename(file);
      if (!navigationContent.includes(fileName)) {
        unindexedCount++;
        if (unindexedCount <= 5) {
          // Only report first 5
          this.warnings.push({
            type: "UNINDEXED_FILE",
            file: file,
            message: `Rule file not indexed: ${file}`,
            fix: "Add to RULES_NAVIGATION.md or consolidate",
          });
        }
      }
    });

    this.metrics.unindexedFiles = unindexedCount;
  }

  /**
   * Check for old temporary files
   */
  checkTemporaryFiles() {
    console.log("\n🗑️  Checking temporary files...");

    const tempPatterns = [/temp/i, /tmp/i, /scratch/i, /test/i, /backup/i, /old/i, /copy/i];

    const tempFiles = this.getAllFiles(".", ".md").filter((file) => {
      const fileName = path.basename(file);
      return tempPatterns.some((pattern) => pattern.test(fileName));
    });

    this.metrics.temporaryFiles = tempFiles.length;

    if (tempFiles.length > 0) {
      this.warnings.push({
        type: "TEMPORARY_FILES",
        count: tempFiles.length,
        message: `Found ${tempFiles.length} temporary files`,
        fix: "Delete or move to proper location",
        files: tempFiles.slice(0, 5), // Show first 5
      });
    }
  }

  /**
   * Get all files recursively
   */
  getAllFiles(dir, extension = "") {
    const files = [];

    try {
      const items = fs.readdirSync(dir);

      items.forEach((item) => {
        const fullPath = path.join(dir, item);

        try {
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory() && !item.startsWith(".") && item !== "node_modules") {
            files.push(...this.getAllFiles(fullPath, extension));
          } else if (stat.isFile() && (!extension || item.endsWith(extension))) {
            files.push(fullPath);
          }
        } catch (error) {
          // Skip inaccessible files
        }
      });
    } catch (error) {
      // Skip inaccessible directories
    }

    return files;
  }

  /**
   * Print validation report
   */
  printReport() {
    console.log("\n" + "━".repeat(50));
    console.log("📊 VALIDATION REPORT");
    console.log("━".repeat(50));

    // Metrics
    console.log("\n📈 Metrics:");
    console.log(
      `  Root files: ${this.metrics.rootFiles} ${this.getStatusIcon(this.metrics.rootFiles, CONFIG.maxRootFiles)}`
    );
    console.log(
      `  Validation files: ${this.metrics.validationFiles} ${this.getStatusIcon(this.metrics.validationFiles, 20)}`
    );
    console.log(
      `  Duplicate rules: ${this.metrics.duplicateRules} ${this.getStatusIcon(this.metrics.duplicateRules, 5)}`
    );
    console.log(
      `  Unindexed files: ${this.metrics.unindexedFiles} ${this.getStatusIcon(this.metrics.unindexedFiles, 5)}`
    );
    console.log(
      `  Temporary files: ${this.metrics.temporaryFiles} ${this.getStatusIcon(this.metrics.temporaryFiles, 5)}`
    );

    // Violations
    if (this.violations.length > 0) {
      console.log("\n❌ Violations:");
      this.violations.forEach((v, i) => {
        console.log(`\n  ${i + 1}. ${v.type}`);
        console.log(`     ${v.message}`);
        console.log(`     Fix: ${v.fix}`);
        if (v.files) {
          console.log(`     Files: ${v.files.slice(0, 3).join(", ")}...`);
        }
      });
    }

    // Warnings
    if (this.warnings.length > 0) {
      console.log("\n⚠️  Warnings:");
      this.warnings.forEach((w, i) => {
        console.log(`\n  ${i + 1}. ${w.type}`);
        console.log(`     ${w.message}`);
        console.log(`     Fix: ${w.fix}`);
        if (w.files) {
          console.log(`     Files: ${w.files.slice(0, 3).join(", ")}...`);
        }
      });
    }

    // Summary
    console.log("\n" + "━".repeat(50));
    if (this.violations.length === 0 && this.warnings.length === 0) {
      console.log("✅ No degradation detected - Rules are well organized!");
    } else {
      console.log(
        `📋 Summary: ${this.violations.length} violations, ${this.warnings.length} warnings`
      );

      if (this.violations.length > 0) {
        console.log("\n🔧 To fix violations, run:");
        console.log("   npm run cleanup:rules-daily");
      }
    }
    console.log("━".repeat(50));
  }

  /**
   * Get status icon based on value and threshold
   */
  getStatusIcon(value, threshold) {
    if (value === 0) return "✅";
    if (value <= threshold) return "🟡";
    return "🔴";
  }
}

// Run validator
if (require.main === module) {
  const validator = new RulesDegradationValidator();
  validator.validate().then((exitCode) => {
    process.exit(exitCode);
  });
}

module.exports = RulesDegradationValidator;
