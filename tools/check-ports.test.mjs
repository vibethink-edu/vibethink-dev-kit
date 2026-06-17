#!/usr/bin/env node
/**
 * Tests for check-ports.mjs — makes CANON-PORT-ASSIGNMENT-001 bite.
 * Integration style: the gate reads a config + the declaration and resolves paths
 * against cwd, so we run it for real over throwaway files in tmp dirs. Pure Node, no deps.
 * Run: node tools/check-ports.test.mjs
 *
 * Guards the fail-closed teeth: a repo that deploys but declares no ports is REFUSED;
 * deploys:false is a conscious N-A; the recommended form rejects a shared port; a custom
 * form is existence-only; a missing config is a setup error, not a silent pass.
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TOOL = fileURLToPath(new URL("./check-ports.mjs", import.meta.url));

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
  const dir = mkdtempSync(path.join(os.tmpdir(), "ports-test-"));
  tmpdirs.push(dir);
  return dir;
}

function write(dir, rel, content) {
  const full = path.join(dir, rel);
  mkdirSync(path.dirname(full), { recursive: true });
  writeFileSync(full, typeof content === "string" ? content : JSON.stringify(content), "utf8");
}

function run(dir, config) {
  write(dir, "ports.config.json", config);
  const r = spawnSync("node", [TOOL, "ports.config.json"], { cwd: dir, encoding: "utf8" });
  return { code: r.status ?? 1, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

// 1. deploys:false → conscious N-A → GREEN.
test("deploys:false → N-A, exit 0", () => {
  const dir = makeDir();
  const { code, out } = run(dir, { deploys: false, declaration: null });
  assert.equal(code, 0, `expected 0, got ${code}\n${out}`);
  assert.match(out, /GREEN/);
});

// 2. deploys:true + no declaration named → REFUSED.
test("deploys:true + declaration null → refused, exit 1", () => {
  const dir = makeDir();
  const { code, out } = run(dir, { deploys: true, declaration: null });
  assert.equal(code, 1, `expected 1, got ${code}\n${out}`);
  assert.match(out, /REFUSED/);
});

// 3. deploys:true + declaration named but file missing → REFUSED.
test("deploys:true + declaration missing → refused, exit 1", () => {
  const dir = makeDir();
  const { code, out } = run(dir, {
    deploys: true,
    declaration: "ports.json",
    format: "recommended",
  });
  assert.equal(code, 1, `expected 1, got ${code}\n${out}`);
  assert.match(out, /missing or empty/);
});

// 4. deploys:true + recommended form, no collision → carried, GREEN.
test("recommended form, no collision → carried, exit 0", () => {
  const dir = makeDir();
  write(dir, "ports.json", {
    systems: { app: { web: "3000-3099", db: "54321" }, jobs: { worker: "3200" } },
  });
  const { code, out } = run(dir, {
    deploys: true,
    declaration: "ports.json",
    format: "recommended",
  });
  assert.equal(code, 0, `expected 0, got ${code}\n${out}`);
  assert.match(out, /GREEN/);
  assert.match(out, /no-collision/);
});

// 5. deploys:true + recommended form WITH a shared port → REFUSED.
test("recommended form, port collision → refused, exit 1", () => {
  const dir = makeDir();
  write(dir, "ports.json", { systems: { app: { web: "3000" }, other: { web: "3000" } } });
  const { code, out } = run(dir, {
    deploys: true,
    declaration: "ports.json",
    format: "recommended",
  });
  assert.equal(code, 1, `expected 1, got ${code}\n${out}`);
  assert.match(out, /collision/);
});

// 6. deploys:true + custom form, present → existence-only → GREEN.
test("custom form, present → carried, exit 0", () => {
  const dir = makeDir();
  write(dir, "PORTS.env", "WEB_PORT=3000\n");
  const { code, out } = run(dir, { deploys: true, declaration: "PORTS.env", format: "custom" });
  assert.equal(code, 0, `expected 0, got ${code}\n${out}`);
  assert.match(out, /GREEN/);
});

// 7. deploys:true + recommended but the declaration is not valid JSON → REFUSED.
test("recommended form, invalid JSON → refused, exit 1", () => {
  const dir = makeDir();
  write(dir, "ports.json", "{ not json");
  const { code, out } = run(dir, {
    deploys: true,
    declaration: "ports.json",
    format: "recommended",
  });
  assert.equal(code, 1, `expected 1, got ${code}\n${out}`);
  assert.match(out, /not valid JSON/);
});

// 8. zero-byte declaration counts as missing → REFUSED.
test("zero-byte declaration → refused, exit 1", () => {
  const dir = makeDir();
  write(dir, "ports.json", "");
  const { code, out } = run(dir, {
    deploys: true,
    declaration: "ports.json",
    format: "recommended",
  });
  assert.equal(code, 1, `expected 1, got ${code}\n${out}`);
  assert.match(out, /missing or empty/);
});

// 9. deploys not a boolean → setup error (exit 2).
test("deploys not boolean → setup error, exit 2", () => {
  const dir = makeDir();
  const { code, out } = run(dir, { declaration: "ports.json" });
  assert.equal(code, 2, `expected 2, got ${code}\n${out}`);
  assert.match(out, /must be a boolean/);
});

// 10. No config file at all → setup error (exit 2), not a silent pass.
test("no config file → setup error, exit 2", () => {
  const dir = makeDir();
  const r = spawnSync("node", [TOOL, "ports.config.json"], { cwd: dir, encoding: "utf8" });
  assert.equal(r.status, 2, `expected 2, got ${r.status}`);
  assert.match(`${r.stdout ?? ""}${r.stderr ?? ""}`, /config not found/);
});

for (const d of tmpdirs) {
  try {
    rmSync(d, { recursive: true, force: true });
  } catch {
    /* best-effort cleanup */
  }
}

console.log(`\ncheck-ports: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
