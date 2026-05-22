#!/usr/bin/env node

/**
 * 🧹 Daily Rules Cleanup
 * Automatically fixes common rules degradation issues
 *
 * Run: npm run cleanup:rules-daily
 */

const fs = require("fs");
const path = require("path");

class RulesCleanupDaily {
  constructor() {
    this.actions = [];
    this.moved = [];
    this.deleted = [];
    this.errors = [];
  }

  /**
   * Main cleanup entry point
   */
  async cleanup() {
    console.log("🧹 Daily Rules Cleanup\n");
    console.log("━".repeat(50));

    this.ensureDirectories();
    this.cleanupRootDirectory();
    this.cleanupDuplicateValidations();
    this.cleanupEmptyFiles();

    this.printReport();

    return this.errors.length === 0;
  }

  /**
   * Ensure required directories exist
   */
  ensureDirectories() {
    const requiredDirs = [
      "docs/reports/implementation",
      "docs/reports/validation",
      "docs/reports/status",
      "docs/ai-coordination",
      "temp",
    ];

    requiredDirs.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        this.actions.push(`Created directory: ${dir}`);
      }
    });
  }

  /**
   * Clean up forbidden files in root directory
   */
  cleanupRootDirectory() {
    console.log("\n📁 Cleaning root directory...");

    const forbiddenFiles = [
      "ECOMMERCE_CHALLENGE_COMPLETED.md",
      "ROOT_CLEANUP_DIAGNOSTIC_REPORT.md",
      "ROOT_CLEANUP_SUCCESS_REPORT.md",
      "THEME_CUSTOMIZER_STATUS.md",
    ];

    const moveToImplementation = [
      "ECOMMERCE_CHALLENGE_COMPLETED.md",
      "ROOT_CLEANUP_DIAGNOSTIC_REPORT.md",
      "ROOT_CLEANUP_SUCCESS_REPORT.md",
    ];

    const moveToStatus = ["THEME_CUSTOMIZER_STATUS.md"];

    // Move implementation-related files
    moveToImplementation.forEach((file) => {
      if (fs.existsSync(file)) {
        try {
          const dest = `docs/reports/implementation/${file}`;
          fs.renameSync(file, dest);
          this.moved.push(`${file} → ${dest}`);
        } catch (error) {
          this.errors.push(`Failed to move ${file}: ${error.message}`);
        }
      }
    });

    // Move status files
    moveToStatus.forEach((file) => {
      if (fs.existsSync(file)) {
        try {
          const dest = `docs/reports/status/${file}`;
          fs.renameSync(file, dest);
          this.moved.push(`${file} → ${dest}`);
        } catch (error) {
          this.errors.push(`Failed to move ${file}: ${error.message}`);
        }
      }
    });

    // Handle special cases
    this.handleSpecialFiles();
  }

  /**
   * Handle special files in root
   */
  handleSpecialFiles() {
    // AI_CONSENSUS_FRAMEWORK.md - check if empty, move or delete
    if (fs.existsSync("AI_CONSENSUS_FRAMEWORK.md")) {
      try {
        const content = fs.readFileSync("AI_CONSENSUS_FRAMEWORK.md", "utf8").trim();
        if (content.length === 0 || content.length < 50) {
          // Empty or nearly empty - delete
          fs.unlinkSync("AI_CONSENSUS_FRAMEWORK.md");
          this.deleted.push("AI_CONSENSUS_FRAMEWORK.md (empty file)");
        } else {
          // Has content - move to ai-coordination
          const dest = "docs/ai-coordination/AI_CONSENSUS_FRAMEWORK.md";
          fs.renameSync("AI_CONSENSUS_FRAMEWORK.md", dest);
          this.moved.push(`AI_CONSENSUS_FRAMEWORK.md → ${dest}`);
        }
      } catch (error) {
        this.errors.push(`Failed to handle AI_CONSENSUS_FRAMEWORK.md: ${error.message}`);
      }
    }

    // CLAUDE_CODE_HANDOFF_BUNDUI_SIDEBAR.md - move to ai-coordination
    if (fs.existsSync("CLAUDE_CODE_HANDOFF_BUNDUI_SIDEBAR.md")) {
      try {
        const dest = "docs/ai-coordination/CLAUDE_CODE_HANDOFF_BUNDUI_SIDEBAR.md";
        fs.renameSync("CLAUDE_CODE_HANDOFF_BUNDUI_SIDEBAR.md", dest);
        this.moved.push(`CLAUDE_CODE_HANDOFF_BUNDUI_SIDEBAR.md → ${dest}`);
      } catch (error) {
        this.errors.push(`Failed to move CLAUDE_CODE_HANDOFF_BUNDUI_SIDEBAR.md: ${error.message}`);
      }
    }
  }

  /**
   * Clean up duplicate validation files
   */
  cleanupDuplicateValidations() {
    console.log("\n📊 Cleaning duplicate validation files...");

    const validationDirs = ["docs/reports/quality", "docusaurus-dev/docs/reports/quality"];

    // Find duplicates by name pattern
    const seenFiles = new Map();

    validationDirs.forEach((dir) => {
      if (!fs.existsSync(dir)) return;

      const files = fs.readdirSync(dir).filter((f) => f.includes("validation"));

      files.forEach((file) => {
        const key = file.replace(/^\d{4}-\d{2}-\d{2}-/, ""); // Remove date prefix
        const fullPath = path.join(dir, file);

        if (seenFiles.has(key)) {
          // This is a duplicate - check which is newer
          const existingPath = seenFiles.get(key);
          const existingStat = fs.statSync(existingPath);
          const currentStat = fs.statSync(fullPath);

          if (currentStat.mtime > existingStat.mtime) {
            // Current file is newer - remove the old one
            try {
              fs.unlinkSync(existingPath);
              this.deleted.push(`${existingPath} (older duplicate)`);
              seenFiles.set(key, fullPath);
            } catch (error) {
              this.errors.push(`Failed to delete duplicate ${existingPath}: ${error.message}`);
            }
          } else {
            // Existing file is newer - remove current
            try {
              fs.unlinkSync(fullPath);
              this.deleted.push(`${fullPath} (older duplicate)`);
            } catch (error) {
              this.errors.push(`Failed to delete duplicate ${fullPath}: ${error.message}`);
            }
          }
        } else {
          seenFiles.set(key, fullPath);
        }
      });
    });

    // Keep only the latest 5 validation reports of each type
    this.keepLatestValidationFiles();
  }

  /**
   * Keep only the latest validation files
   */
  keepLatestValidationFiles() {
    const validationDir = "docs/reports/quality";
    if (!fs.existsSync(validationDir)) return;

    const files = fs
      .readdirSync(validationDir)
      .filter((f) => f.includes("validation") && f.match(/^\d{4}-\d{2}-\d{2}-/))
      .map((f) => ({
        name: f,
        type: f.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, ""),
        path: path.join(validationDir, f),
        stat: fs.statSync(path.join(validationDir, f)),
      }));

    // Group by type
    const byType = new Map();
    files.forEach((file) => {
      if (!byType.has(file.type)) {
        byType.set(file.type, []);
      }
      byType.get(file.type).push(file);
    });

    // Keep only latest 3 of each type
    byType.forEach((typeFiles, type) => {
      if (typeFiles.length > 3) {
        // Sort by modification time (newest first)
        typeFiles.sort((a, b) => b.stat.mtime - a.stat.mtime);

        // Delete oldest files
        typeFiles.slice(3).forEach((file) => {
          try {
            fs.unlinkSync(file.path);
            this.deleted.push(`${file.name} (keeping only latest 3 of type "${type}")`);
          } catch (error) {
            this.errors.push(`Failed to delete old validation ${file.name}: ${error.message}`);
          }
        });
      }
    });
  }

  /**
   * Clean up empty or near-empty files
   */
  cleanupEmptyFiles() {
    console.log("\n🗑️  Cleaning empty files...");

    const checkPaths = [".", "docs", "docs/reports", "docs/ai-coordination"];

    checkPaths.forEach((dirPath) => {
      if (!fs.existsSync(dirPath)) return;

      const files = fs.readdirSync(dirPath);

      files.forEach((file) => {
        const fullPath = path.join(dirPath, file);

        if (!file.endsWith(".md")) return;
        if (!fs.statSync(fullPath).isFile()) return;

        try {
          const content = fs.readFileSync(fullPath, "utf8").trim();

          // Delete if empty or just whitespace
          if (content.length === 0) {
            fs.unlinkSync(fullPath);
            this.deleted.push(`${fullPath} (empty file)`);
          }
          // Delete if very short and looks like placeholder
          else if (
            content.length < 50 &&
            (content.includes("TODO") ||
              content.includes("placeholder") ||
              content.includes("coming soon") ||
              content === "#")
          ) {
            fs.unlinkSync(fullPath);
            this.deleted.push(`${fullPath} (placeholder file)`);
          }
        } catch (error) {
          // Skip files we can't read
        }
      });
    });
  }

  /**
   * Print cleanup report
   */
  printReport() {
    console.log("\n" + "━".repeat(50));
    console.log("📊 CLEANUP REPORT");
    console.log("━".repeat(50));

    if (this.actions.length > 0) {
      console.log("\n🏗️  Actions:");
      this.actions.forEach((action, i) => {
        console.log(`  ${i + 1}. ${action}`);
      });
    }

    if (this.moved.length > 0) {
      console.log("\n📦 Files moved:");
      this.moved.forEach((move, i) => {
        console.log(`  ${i + 1}. ${move}`);
      });
    }

    if (this.deleted.length > 0) {
      console.log("\n🗑️  Files deleted:");
      this.deleted.forEach((file, i) => {
        console.log(`  ${i + 1}. ${file}`);
      });
    }

    if (this.errors.length > 0) {
      console.log("\n❌ Errors:");
      this.errors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
    }

    console.log("\n" + "━".repeat(50));

    if (this.errors.length === 0) {
      console.log(`✅ Cleanup completed successfully!`);
      console.log(`   ${this.moved.length} files moved, ${this.deleted.length} files deleted`);
    } else {
      console.log(`⚠️  Cleanup completed with ${this.errors.length} errors`);
    }

    console.log('\n💡 Next: Run "npm run validate:rules-degradation" to see improvements');
    console.log("━".repeat(50));
  }
}

// Run cleanup
if (require.main === module) {
  const cleanup = new RulesCleanupDaily();
  cleanup.cleanup().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = RulesCleanupDaily;
