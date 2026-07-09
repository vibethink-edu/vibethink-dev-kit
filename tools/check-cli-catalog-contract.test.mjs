#!/usr/bin/env node
/**
 * Tests for check-cli-catalog-contract.mjs.
 * Covers the honest gate cases: valid catalog, missing required field, duplicate ids,
 * docPath verification, command stdout parsing, and setup errors.
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TOOL = fileURLToPath(new URL("./check-cli-catalog-contract.mjs", import.meta.url));

let pass = 0;
let fail = 0;
const tmpdirs = [];

function test(name, fn) {
  try {
    fn();
    pass++;
    console.log(`  OK   ${name}`);
  } catch (error) {
    fail++;
    console.log(`  FAIL ${name}`);
    console.log(`       ${error.message}`);
  }
}

function makeDir() {
  const dir = mkdtempSync(path.join(os.tmpdir(), "cli-catalog-contract-"));
  tmpdirs.push(dir);
  return dir;
}

function write(dir, rel, content) {
  const full = path.join(dir, rel);
  mkdirSync(path.dirname(full), { recursive: true });
  writeFileSync(
    full,
    typeof content === "string" ? content : JSON.stringify(content, null, 2),
    "utf8"
  );
}

function validCatalog() {
  return {
    schemaVersion: "cli-catalog.schema:v1",
    schema: "setup/templates/cli-catalog/cli-catalog.schema.json",
    catalogVersion: "2026.07.09",
    project: "example",
    commands: [
      {
        id: "repo:health",
        group: "repo",
        script: "tools/repo-health.mjs",
        packageScript: "repo:health",
        docPath: "docs/cli/repo-health.md",
        description: "Run a read-only repository health diagnostic.",
        safety: "read-only",
        tags: ["repo", "diagnostic"],
        defaultArgs: [],
      },
    ],
  };
}

function run(dir, config) {
  write(dir, "tools/cli-catalog-contract.config.json", config);
  const result = spawnSync("node", [TOOL, "tools/cli-catalog-contract.config.json"], {
    cwd: dir,
    encoding: "utf8",
  });
  return { code: result.status ?? 1, out: `${result.stdout ?? ""}${result.stderr ?? ""}` };
}

test("valid catalog file with docPath check -> exit 0", () => {
  const dir = makeDir();
  write(dir, "tools/cli-catalog.json", validCatalog());
  write(dir, "docs/cli/repo-health.md", "# Repo Health\n");
  const { code, out } = run(dir, {
    catalog: "tools/cli-catalog.json",
    requireDocPaths: true,
  });
  assert.equal(code, 0, `expected 0, got ${code}\n${out}`);
  assert.match(out, /GREEN/);
});

test("missing required docPath -> exit 1", () => {
  const dir = makeDir();
  const catalog = validCatalog();
  catalog.commands[0].docPath = undefined;
  write(dir, "tools/cli-catalog.json", catalog);
  const { code, out } = run(dir, {
    catalog: "tools/cli-catalog.json",
    requireDocPaths: false,
  });
  assert.equal(code, 1, `expected 1, got ${code}\n${out}`);
  assert.match(out, /docPath/);
});

test("duplicate command ids -> exit 1", () => {
  const dir = makeDir();
  const catalog = validCatalog();
  catalog.commands.push({ ...catalog.commands[0] });
  write(dir, "tools/cli-catalog.json", catalog);
  const { code, out } = run(dir, {
    catalog: "tools/cli-catalog.json",
    requireDocPaths: false,
  });
  assert.equal(code, 1, `expected 1, got ${code}\n${out}`);
  assert.match(out, /duplicate command id/);
});

test("missing doc file when requireDocPaths=true -> exit 1", () => {
  const dir = makeDir();
  write(dir, "tools/cli-catalog.json", validCatalog());
  const { code, out } = run(dir, {
    catalog: "tools/cli-catalog.json",
    requireDocPaths: true,
  });
  assert.equal(code, 1, `expected 1, got ${code}\n${out}`);
  assert.match(out, /does not exist/);
});

test("catalogCommand stdout JSON -> exit 0", () => {
  const dir = makeDir();
  const exporter = [
    "const catalog = {",
    '  schemaVersion: "cli-catalog.schema:v1",',
    '  schema: "schema.json",',
    '  catalogVersion: "1",',
    '  project: "example",',
    "  commands: []",
    "};",
    "console.log(JSON.stringify(catalog));",
  ].join("\n");
  write(dir, "tools/export-catalog.mjs", exporter);
  const { code, out } = run(dir, {
    catalogCommand: ["node", "tools/export-catalog.mjs"],
    requireDocPaths: true,
  });
  assert.equal(code, 0, `expected 0, got ${code}\n${out}`);
  assert.match(out, /GREEN/);
});

test("catalog and catalogCommand together -> setup error exit 2", () => {
  const dir = makeDir();
  write(dir, "tools/cli-catalog.json", validCatalog());
  const { code, out } = run(dir, {
    catalog: "tools/cli-catalog.json",
    catalogCommand: ["node", "tools/export-catalog.mjs"],
  });
  assert.equal(code, 2, `expected 2, got ${code}\n${out}`);
  assert.match(out, /exactly one source/);
});

test("invalid command id -> exit 1", () => {
  const dir = makeDir();
  const catalog = validCatalog();
  catalog.commands[0].id = "Repo Health";
  write(dir, "tools/cli-catalog.json", catalog);
  const { code, out } = run(dir, {
    catalog: "tools/cli-catalog.json",
    requireDocPaths: false,
  });
  assert.equal(code, 1, `expected 1, got ${code}\n${out}`);
  assert.match(out, /must match/);
});

for (const dir of tmpdirs) {
  try {
    rmSync(dir, { recursive: true, force: true });
  } catch {
    /* best-effort cleanup */
  }
}

console.log(`\ncheck-cli-catalog-contract: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
