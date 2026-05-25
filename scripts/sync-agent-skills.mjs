#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function repoRoot() {
  try {
    return execFileSync("git", ["rev-parse", "--show-toplevel"], {
      encoding: "utf8",
    }).trim();
  } catch {
    return process.cwd();
  }
}

const ROOT = repoRoot();
const argv = process.argv.slice(2);

function usage() {
  console.log(`sync-agent-skills

Usage:
  node scripts/sync-agent-skills.mjs [--check] [--source <dir>] [--target <dir>]

Defaults:
  --source .agents/skills
  --target .claude/skills

Options:
  --check   report drift and exit non-zero without copying anything
`);
}

function optionValue(flag, fallback) {
  const index = argv.indexOf(flag);
  if (index === -1) return fallback;
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) {
    console.error(`Missing value for ${flag}`);
    process.exit(1);
  }
  return value;
}

if (argv.includes("--help") || argv.includes("-h")) {
  usage();
  process.exit(0);
}

const checkOnly = argv.includes("--check");
const sourceArg = optionValue("--source", ".agents/skills");
const targetArg = optionValue("--target", ".claude/skills");
const sourceDir = path.resolve(ROOT, sourceArg);
const targetDir = path.resolve(ROOT, targetArg);

function toDisplay(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, "/");
}

function assertDirectory(dir, label) {
  if (!fs.existsSync(dir)) {
    console.error(`[fail] ${label} not found: ${toDisplay(dir)}`);
    process.exit(1);
  }
  if (!fs.statSync(dir).isDirectory()) {
    console.error(`[fail] ${label} is not a directory: ${toDisplay(dir)}`);
    process.exit(1);
  }
}

function listFiles(dir) {
  if (!fs.existsSync(dir)) return new Map();
  const files = new Map();
  const stack = [dir];

  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else if (entry.isFile()) {
        const rel = path.relative(dir, fullPath).replace(/\\/g, "/");
        files.set(rel, fs.readFileSync(fullPath));
      }
    }
  }

  return files;
}

function compareTrees(sourceFiles, targetFiles) {
  const missing = [];
  const changed = [];
  const extra = [];

  for (const [rel, sourceBody] of sourceFiles) {
    const targetBody = targetFiles.get(rel);
    if (!targetBody) {
      missing.push(rel);
    } else if (!sourceBody.equals(targetBody)) {
      changed.push(rel);
    }
  }

  for (const rel of targetFiles.keys()) {
    if (!sourceFiles.has(rel)) extra.push(rel);
  }

  return { missing, changed, extra };
}

function reportDrift(drift) {
  const total = drift.missing.length + drift.changed.length + drift.extra.length;
  if (total === 0) {
    console.log(`[ok] ${toDisplay(targetDir)} is in sync with ${toDisplay(sourceDir)}`);
    return;
  }

  console.error(`[fail] ${toDisplay(targetDir)} is out of sync with ${toDisplay(sourceDir)}`);
  for (const [label, files] of Object.entries(drift)) {
    if (files.length === 0) continue;
    console.error(`\n${label}:`);
    for (const file of files) console.error(`  - ${file}`);
  }
}

function removePath(targetPath) {
  if (!fs.existsSync(targetPath)) return;
  fs.rmSync(targetPath, { recursive: true, force: true });
}

function copyTree(source, target) {
  removePath(target);
  fs.mkdirSync(target, { recursive: true });

  const stack = [source];
  while (stack.length > 0) {
    const current = stack.pop();
    const relDir = path.relative(source, current);
    const targetCurrent = path.join(target, relDir);
    fs.mkdirSync(targetCurrent, { recursive: true });

    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const sourcePath = path.join(current, entry.name);
      const targetPath = path.join(targetCurrent, entry.name);
      if (entry.isDirectory()) {
        stack.push(sourcePath);
      } else if (entry.isFile()) {
        fs.copyFileSync(sourcePath, targetPath);
      }
    }
  }
}

assertDirectory(sourceDir, "source skills directory");

const sourceFiles = listFiles(sourceDir);
const targetFiles = listFiles(targetDir);
const drift = compareTrees(sourceFiles, targetFiles);
const driftCount = drift.missing.length + drift.changed.length + drift.extra.length;

if (checkOnly) {
  reportDrift(drift);
  process.exit(driftCount === 0 ? 0 : 1);
}

if (driftCount === 0) {
  console.log(`[ok] ${toDisplay(targetDir)} is already in sync with ${toDisplay(sourceDir)}`);
  process.exit(0);
}

copyTree(sourceDir, targetDir);
console.log(
  `[ok] synced ${sourceFiles.size} file(s) from ${toDisplay(sourceDir)} to ${toDisplay(targetDir)}`
);
