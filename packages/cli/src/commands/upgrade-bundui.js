const { Command } = require("commander");
const fs = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");
const chalk = require("chalk");

module.exports = (program) => {
  program
    .command("upgrade:bundui")
    .description("Syncs @vibethink/bundui-ui with the remote GitHub repository")
    .option("-r, --repo <url>", "GitHub repository URL (e.g., https://github.com/user/repo.git)")
    .option("-t, --token <token>", "GitHub Personal Access Token for private repos")
    .option("--dry-run", "Simulate the update without changing files")
    .action(async (options) => {
      const repoUrl = options.repo;
      const targetDir = path.resolve(__dirname, "../../../../packages/bundui-ui/src");
      const tempDir = path.resolve(__dirname, "../../../../.temp-bundui");

      if (!repoUrl) {
        console.error(chalk.red("Error: You must provide a repository URL using --repo <url>"));
        process.exit(1);
      }

      console.log(chalk.blue(`🚀 Starting BundUI Upgrade...`));
      console.log(chalk.gray(`Source: ${repoUrl}`));
      console.log(chalk.gray(`Target: ${targetDir}`));

      try {
        // 1. Clean temp dir
        if (fs.existsSync(tempDir)) {
          fs.removeSync(tempDir);
        }

        // 2. Clone Repo
        console.log(chalk.yellow("⬇️  Cloning repository..."));
        let gitCommand = `git clone --depth 1 ${repoUrl} "${tempDir}"`;

        // If token provided, inject into URL (basic implementation, careful with logs)
        if (options.token) {
          const urlWithAuth = repoUrl.replace("https://", `https://${options.token}@`);
          gitCommand = `git clone --depth 1 ${urlWithAuth} "${tempDir}"`;
        }

        if (options.dryRun) {
          console.log(chalk.cyan(`[DRY-RUN] Would execute: ${gitCommand}`));
        } else {
          execSync(gitCommand, { stdio: "inherit" });
        }

        // 3. Sync Files
        console.log(chalk.yellow("🔄 Syncing files..."));
        if (options.dryRun) {
          console.log(chalk.cyan(`[DRY-RUN] Would copy files from ${tempDir} to ${targetDir}`));
        } else {
          // Ensure target exists
          fs.ensureDirSync(targetDir);

          // Remove old content (optional: or just overwrite)
          // fs.emptyDirSync(targetDir); // Risky if we have local customizations

          // Copy src content from clone to package src
          // Assuming the repo HAS a src folder or IS the src folder.
          // Strategy: Copy everything except .git and package.json if it exists in root and conflicts.
          // For now, mirroring content.
          fs.copySync(tempDir, targetDir, {
            filter: (src) => !src.includes(".git"),
          });
        }

        // 4. Cleanup
        if (!options.dryRun) {
          fs.removeSync(tempDir);
        }

        console.log(chalk.green("✅ BundUI upgraded successfully!"));
      } catch (error) {
        console.error(chalk.red("❌ Upgrade failed:"), error.message);
        // Clean temp on fail
        if (fs.existsSync(tempDir)) fs.removeSync(tempDir);
        process.exit(1);
      }
    });
};
