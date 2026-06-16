#!/usr/bin/env node
/**
 * Tests for check-versioning.mjs — makes CANON-VERSIONING-001 bite for apps/packages.
 * Integration style: the gate reads a config and resolves paths against cwd, so we
 * run it for real over throwaway configs/files in tmp dirs. Pure Node, no deps.
 * Run: node tools/check-versioning.test.mjs
 *
 * Guards the anti-freeze teeth: a declared model with no LIVE source fails (that is
 * how an app freezes at one hand-typed version); a wired model passes; null is a
 * conscious N-A; a missing config is a setup error, not a silent pass.
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TOOL = fileURLToPath(new URL("./check-versioning.mjs", import.meta.url));

let pass = 0;
let fail = 0;
const tmpdirs = [];
function test(name, fn) {
  try {
    fn();
    pass++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    fail++;
    console.log(`  ✗ ${name}\n    ${e.message}`);
  }
}

function makeDir() {
  const dir = mkdtempSync(path.join(os.tmpdir(), "versioning-test-"));
  tmpdirs.push(dir);
  return dir;
}

/** Write dir/<rel> (JSON-stringifying objects). */
function write(dir, rel, content) {
  writeFileSync(
    path.join(dir, rel),
    typeof content === "string" ? content : JSON.stringify(content),
    "utf8"
  );
}

/** Write dir/versioning.config.json and run the gate with cwd=dir. */
function run(dir, config) {
  write(dir, "versioning.config.json", config);
  const r = spawnSync("node", [TOOL, "versioning.config.json"], { cwd: dir, encoding: "utf8" });
  return { code: r.status ?? 1, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

// 1. All-null → conscious N-A → GREEN.
test("all models null → N-A, exit 0", () => {
  const dir = makeDir();
  const { code, out } = run(dir, {
    binding: null,
    apps: { model: null },
    packages: { model: null },
  });
  assert.equal(code, 0, `expected exit 0, got ${code}\n${out}`);
  assert.match(out, /GREEN/);
});

// 2. App model declared but NO versionSource → the frozen-version trap → RED.
test("app model declared, no versionSource → exit 1", () => {
  const dir = makeDir();
  const { code, out } = run(dir, { apps: { model: "calver" } });
  assert.equal(code, 1, `expected exit 1, got ${code}\n${out}`);
  assert.match(out, /no versionSource|freezes/i);
});

// 3. App versionSource points at a missing file → RED.
test("app versionSource missing on disk → exit 1", () => {
  const dir = makeDir();
  const { code, out } = run(dir, {
    apps: { model: "calver", versionSource: "tools/get-app-version.mjs" },
  });
  assert.equal(code, 1, `expected exit 1, got ${code}\n${out}`);
  assert.match(out, /does not exist/);
});

// 4. App versionSource exists → WIRED → GREEN.
test("app versionSource exists → wired, exit 0", () => {
  const dir = makeDir();
  write(dir, "version.mjs", "export const v = 1;\n");
  const { code, out } = run(dir, { apps: { model: "calver", versionSource: "version.mjs" } });
  assert.equal(code, 0, `expected exit 0, got ${code}\n${out}`);
  assert.match(out, /GREEN/);
});

// 5. Package model declared but manifest missing → RED.
test("package model declared, manifest missing → exit 1", () => {
  const dir = makeDir();
  const { code, out } = run(dir, { packages: { model: "semver-2.0", manifest: "package.json" } });
  assert.equal(code, 1, `expected exit 1, got ${code}\n${out}`);
  assert.match(out, /missing/);
});

// 6. Package manifest with a version → WIRED → GREEN.
test("package manifest with version → wired, exit 0", () => {
  const dir = makeDir();
  write(dir, "package.json", { name: "x", version: "1.2.3" });
  const { code, out } = run(dir, { packages: { model: "semver-2.0", manifest: "package.json" } });
  assert.equal(code, 0, `expected exit 0, got ${code}\n${out}`);
  assert.match(out, /GREEN/);
});

// 7. Binding declared but missing → RED.
test("binding declared but missing → exit 1", () => {
  const dir = makeDir();
  const { code, out } = run(dir, {
    binding: ".versioning.yaml",
    apps: { model: null },
    packages: { model: null },
  });
  assert.equal(code, 1, `expected exit 1, got ${code}\n${out}`);
  assert.match(out, /missing or empty/);
});

// 8. No config file at all → setup error (exit 2), not a silent pass.
test("no config file → setup error, exit 2", () => {
  const dir = makeDir();
  const r = spawnSync("node", [TOOL, "versioning.config.json"], { cwd: dir, encoding: "utf8" });
  assert.equal(r.status, 2, `expected exit 2, got ${r.status}`);
  assert.match(`${r.stdout ?? ""}${r.stderr ?? ""}`, /config not found/);
});

for (const d of tmpdirs) {
  try {
    rmSync(d, { recursive: true, force: true });
  } catch {
    /* best-effort cleanup */
  }
}

console.log(`\ncheck-versioning: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
