#!/usr/bin/env node

/**
 * 🚀 Staging Deployment Script
 * VThink 1.0 - Deployment Automation
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Configuration
const config = {
  environment: "staging",
  dockerRegistry: process.env.DOCKER_REGISTRY || "registry.vibethink.com",
  imageName: "vibethink-orchestrator",
  tag: process.env.BUILD_TAG || "staging",
  namespace: "vibethink-staging",
  healthCheckUrl: process.env.STAGING_URL || "https://staging.vibethink.com",
  timeout: 300000, // 5 minutes
};

// Colors for console output
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

// Utility functions
const log = (message, color = colors.reset) => {
  // TODO: log `${color}${message}${colors.reset}`
};

const exec = (command, options = {}) => {
  try {
    log(`🔄 Executing: ${command}`, colors.blue);
    return execSync(command, {
      stdio: "inherit",
      timeout: config.timeout,
      ...options,
    });
  } catch (error) {
    log(`❌ Command failed: ${command}`, colors.red);
    throw error;
  }
};

const checkHealth = async (url, maxRetries = 10) => {
  log(`🏥 Checking health at: ${url}`, colors.yellow);

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url + "/health");
      if (response.ok) {
        log(`✅ Health check passed!`, colors.green);
        return true;
      }
    } catch (error) {
      log(`⏳ Health check attempt ${i + 1}/${maxRetries} failed, retrying...`, colors.yellow);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  throw new Error("Health check failed after maximum retries");
};

// Main deployment process
async function deployStaging() {
  const startTime = Date.now();

  try {
    log(`🚀 Starting ${config.environment} deployment...`, colors.bold + colors.blue);

    // Step 1: Pre-deployment checks
    log(`\n📋 Step 1: Pre-deployment checks`, colors.bold);

    // Check if we're in the right branch
    const currentBranch = exec("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim();
    if (currentBranch !== "main" && currentBranch !== "develop") {
      throw new Error(
        `Deployment only allowed from main/develop branches. Current: ${currentBranch}`
      );
    }

    // Check for uncommitted changes
    const hasChanges = exec("git status --porcelain", { encoding: "utf8" }).trim();
    if (hasChanges) {
      log(`⚠️  Warning: Uncommitted changes detected`, colors.yellow);
    }

    // Step 2: Build and test
    log(`\n🏗️  Step 2: Build and test`, colors.bold);

    exec("npm ci");
    exec("npm run lint");
    exec("npm run test:ci");
    exec("npm run build");

    // Step 3: Docker build
    log(`\n🐳 Step 3: Docker build`, colors.bold);

    const imageTag = `${config.dockerRegistry}/${config.imageName}:${config.tag}`;
    exec(`docker build -t ${imageTag} .`);

    // Step 4: Push to registry
    log(`\n📤 Step 4: Push to registry`, colors.bold);

    exec(`docker push ${imageTag}`);

    // Step 5: Deploy to Kubernetes
    log(`\n🚀 Step 5: Deploy to Kubernetes`, colors.bold);

    // Update deployment
    exec(
      `kubectl set image deployment/vibethink-orchestrator-staging app=${imageTag} -n ${config.namespace}`
    );

    // Wait for rollout
    exec(
      `kubectl rollout status deployment/vibethink-orchestrator-staging -n ${config.namespace} --timeout=300s`
    );

    // Step 6: Health check
    log(`\n🏥 Step 6: Health check`, colors.bold);

    await checkHealth(config.healthCheckUrl);

    // Step 7: Smoke tests
    log(`\n🧪 Step 7: Smoke tests`, colors.bold);

    exec("npm run test:smoke -- --base-url=" + config.healthCheckUrl);

    // Step 8: Performance test
    log(`\n📊 Step 8: Performance test`, colors.bold);

    exec("npm run test:performance -- --url=" + config.healthCheckUrl);

    // Success
    const duration = Math.round((Date.now() - startTime) / 1000);
    log(`\n🎉 Deployment completed successfully in ${duration}s!`, colors.bold + colors.green);

    // Send notification
    log(`📧 Sending success notification...`, colors.blue);
    exec("npm run notify:deployment-success");
  } catch (error) {
    log(`\n❌ Deployment failed: ${error.message}`, colors.bold + colors.red);

    // Rollback
    log(`🔄 Attempting rollback...`, colors.yellow);
    try {
      exec(`kubectl rollout undo deployment/vibethink-orchestrator-staging -n ${config.namespace}`);
      log(`✅ Rollback completed`, colors.green);
    } catch (rollbackError) {
      log(`❌ Rollback failed: ${rollbackError.message}`, colors.red);
    }

    // Send failure notification
    log(`📧 Sending failure notification...`, colors.blue);
    exec("npm run notify:deployment-failure");

    process.exit(1);
  }
}

// Run deployment
if (require.main === module) {
  deployStaging().catch((error) => {
    log(`💥 Fatal error: ${error.message}`, colors.bold + colors.red);
    process.exit(1);
  });
}

module.exports = { deployStaging, config };
