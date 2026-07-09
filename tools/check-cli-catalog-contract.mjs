#!/usr/bin/env node
/**
 * check-cli-catalog-contract — validates a repo's portable executable CLI catalog.
 *
 * The kit owns the JSON contract; the consuming repo owns the actual commands.
 * This gate checks discovery metadata only. It never executes catalog entries.
 *
 * Config (tools/cli-catalog-contract.config.json):
 *   {
 *     "catalog": "tools/cli-catalog.json",
 *     "requireDocPaths": true
 *   }
 *
 * Or:
 *   {
 *     "catalogCommand": ["node", "tools/cli.mjs", "export", "--project", "local"],
 *     "requireDocPaths": true
 *   }
 *
 * Usage: node tools/check-cli-catalog-contract.mjs [config-path]
 * Exit: 0 valid · 1 contract violation · 2 setup error.
 * Pure Node, zero deps.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { isAbsolute, join, relative } from "node:path";

const ROOT = process.cwd();
const configPath = process.argv[2] || "tools/cli-catalog-contract.config.json";
const absConfig = isAbsolute(configPath) ? configPath : join(ROOT, configPath);

function setupError(message) {
  console.error(`check-cli-catalog-contract setup error: ${message}`);
  process.exit(2);
}

function readJsonFile(pathForRead, label) {
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(pathForRead, "utf8"));
  } catch (error) {
    setupError(`${label} is not valid JSON (${error.message})`);
  }
  return parsed;
}

if (!existsSync(absConfig)) {
  setupError(
    `config not found: ${configPath} (see setup/templates/cli-catalog/cli-catalog-contract.config.example.json)`
  );
}

const cfg = readJsonFile(absConfig, "config");
const hasCatalog = Boolean(typeof cfg.catalog === "string" && cfg.catalog.trim());
const hasCatalogCommand = Array.isArray(cfg.catalogCommand);
if (hasCatalog === hasCatalogCommand) {
  setupError('declare exactly one source: "catalog" or "catalogCommand"');
}

function readCatalog() {
  if (hasCatalog) {
    const catalogPath = isAbsolute(cfg.catalog) ? cfg.catalog : join(ROOT, cfg.catalog);
    if (!existsSync(catalogPath) || !statSync(catalogPath).isFile()) {
      setupError(`catalog file not found: ${cfg.catalog}`);
    }
    return { catalog: readJsonFile(catalogPath, "catalog"), source: cfg.catalog };
  }

  const argv = cfg.catalogCommand;
  if (!argv.length || argv.some((part) => typeof part !== "string" || !part.trim())) {
    setupError('"catalogCommand" must be a non-empty argv array of strings');
  }
  const result = spawnSync(argv[0], argv.slice(1), {
    cwd: ROOT,
    encoding: "utf8",
    shell: false,
  });
  if (result.error) setupError(`catalogCommand failed to start: ${result.error.message}`);
  if ((result.status ?? 1) !== 0) {
    setupError(
      `catalogCommand exited ${result.status ?? 1}: ${`${result.stdout ?? ""}${result.stderr ?? ""}`.trim()}`
    );
  }
  try {
    return { catalog: JSON.parse(result.stdout), source: argv.join(" ") };
  } catch (error) {
    setupError(`catalogCommand stdout is not valid JSON (${error.message})`);
  }
}

const { catalog, source } = readCatalog();
const problems = [];
const carried = [];

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function pathExists(relPath) {
  const p = isAbsolute(relPath) ? relPath : join(ROOT, relPath);
  return existsSync(p) && statSync(p).isFile();
}

function requireString(obj, key, at) {
  if (typeof obj[key] !== "string" || !obj[key].trim()) {
    problems.push(`${at}.${key} must be a non-empty string`);
    return false;
  }
  return true;
}

console.log("");
console.log(`check-cli-catalog-contract · ${source}`);
console.log(`repo: ${ROOT}`);
console.log("");

if (!isObject(catalog)) {
  problems.push("catalog must be a JSON object");
} else {
  for (const key of ["schemaVersion", "schema", "catalogVersion", "project"]) {
    requireString(catalog, key, "catalog");
  }
  if (catalog.schemaVersion !== "cli-catalog.schema:v1") {
    problems.push('catalog.schemaVersion must be "cli-catalog.schema:v1"');
  }
  if (!Array.isArray(catalog.commands)) {
    problems.push("catalog.commands must be an array");
  } else {
    carried.push(`commands array present (${catalog.commands.length})`);
    const ids = new Set();
    catalog.commands.forEach((command, index) => {
      const at = `commands[${index}]`;
      if (!isObject(command)) {
        problems.push(`${at} must be an object`);
        return;
      }
      const allowed = new Set([
        "id",
        "group",
        "script",
        "packageScript",
        "docPath",
        "description",
        "safety",
        "tags",
        "defaultArgs",
      ]);
      for (const key of Object.keys(command)) {
        if (!allowed.has(key)) problems.push(`${at}.${key} is not part of the portable contract`);
      }
      for (const key of ["id", "group", "script", "docPath", "description", "safety"]) {
        requireString(command, key, at);
      }
      if (typeof command.id === "string") {
        if (!/^[a-z0-9][a-z0-9:-]*$/.test(command.id)) {
          problems.push(`${at}.id must match ^[a-z0-9][a-z0-9:-]*$`);
        }
        if (ids.has(command.id)) problems.push(`duplicate command id: ${command.id}`);
        ids.add(command.id);
      }
      if (!(typeof command.packageScript === "string" || command.packageScript === null)) {
        problems.push(`${at}.packageScript must be a string or null`);
      }
      if (
        !Array.isArray(command.tags) ||
        command.tags.some((tag) => typeof tag !== "string" || !tag.trim())
      ) {
        problems.push(`${at}.tags must be an array of non-empty strings`);
      }
      if (
        !Array.isArray(command.defaultArgs) ||
        command.defaultArgs.some((arg) => typeof arg !== "string")
      ) {
        problems.push(`${at}.defaultArgs must be an array of strings`);
      }
      if (
        cfg.requireDocPaths === true &&
        typeof command.docPath === "string" &&
        !pathExists(command.docPath)
      ) {
        problems.push(`${at}.docPath does not exist: ${command.docPath}`);
      }
    });
    if (ids.size === catalog.commands.length) carried.push("command ids unique");
  }
}

for (const item of carried) console.log(`  OK   ${item}`);
for (const problem of problems) console.log(`  FAIL ${problem}`);

console.log("");
if (problems.length) {
  console.log(`RED - ${problems.length} executable CLI catalog contract problem(s).`);
  process.exit(1);
}

const displaySource = isAbsolute(source) ? relative(ROOT, source) : source;
console.log(`GREEN - executable CLI catalog contract holds (${displaySource}).`);
process.exit(0);
