#!/usr/bin/env node
/**
 * Tests for check-coder-launch-readiness.mjs — makes
 * CANON-CHANGE-PATH-AND-DECISION-CLASSES-001 §3.1 (F2 readiness) bite.
 * Integration style: run the gate for real over throwaway surfaces in tmp dirs.
 * Pure Node, no deps. Run: node tools/check-coder-launch-readiness.test.mjs
 *
 * Guards the teeth (known-bad cases, §8.7a): a missing launch script is REFUSED, an
 * empty settings file is REFUSED, an undeclared bot-token env-var is REFUSED, a
 * declared-but-missing prompt dir is REFUSED; a complete surface passes; a missing
 * config is a setup error, not a silent pass.
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TOOL = fileURLToPath(new URL("./check-coder-launch-readiness.mjs", import.meta.url));

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
  const dir = mkdtempSync(path.join(os.tmpdir(), "coder-ready-"));
  tmpdirs.push(dir);
  return dir;
}

function write(dir, rel, content) {
  const full = path.join(dir, rel);
  mkdirSync(path.dirname(full), { recursive: true });
  writeFileSync(full, typeof content === "string" ? content : JSON.stringify(content), "utf8");
}

function run(dir, config) {
  write(dir, "coder-launch-readiness.config.json", config);
  const r = spawnSync("node", [TOOL, "coder-launch-readiness.config.json"], {
    cwd: dir,
    encoding: "utf8",
  });
  return { code: r.status ?? 1, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

const FULL = {
  launchScript: "ops/launch-coder.ps1",
  sessionSettings: "ops/settings.local.json",
  botTokenEnvVar: "GH_TOKEN",
};
function standUpSurface(dir) {
  write(dir, "ops/launch-coder.ps1", "# launch script\n");
  write(dir, "ops/settings.local.json", '{ "permissions": {} }\n');
}

// 1. complete surface → READY → GREEN.
test("complete surface → ready, exit 0", () => {
  const dir = makeDir();
  standUpSurface(dir);
  const { code, out } = run(dir, FULL);
  assert.equal(code, 0, `expected 0, got ${code}\n${out}`);
  assert.match(out, /GREEN/);
  assert.match(out, /forge confirmation/);
});

// 2. missing launch script → NOT ready → REFUSED.
test("missing launch script → not ready, exit 1", () => {
  const dir = makeDir();
  write(dir, "ops/settings.local.json", '{ "permissions": {} }\n');
  const { code, out } = run(dir, FULL);
  assert.equal(code, 1, `expected 1, got ${code}\n${out}`);
  assert.match(out, /RED/);
  assert.match(out, /launchScript/);
});

// 3. empty (zero-byte) settings file counts as missing → REFUSED.
test("empty settings file → not ready, exit 1", () => {
  const dir = makeDir();
  write(dir, "ops/launch-coder.ps1", "# launch\n");
  write(dir, "ops/settings.local.json", "");
  const { code, out } = run(dir, FULL);
  assert.equal(code, 1, `expected 1, got ${code}\n${out}`);
  assert.match(out, /sessionSettings/);
});

// 4. no bot-token env-var declared → REFUSED (identity is unverifiable).
test("no bot-token env-var → not ready, exit 1", () => {
  const dir = makeDir();
  standUpSurface(dir);
  const { code, out } = run(dir, {
    launchScript: "ops/launch-coder.ps1",
    sessionSettings: "ops/settings.local.json",
  });
  assert.equal(code, 1, `expected 1, got ${code}\n${out}`);
  assert.match(out, /botTokenEnvVar/);
});

// 5. prompt dir declared but missing → REFUSED.
test("declared prompt dir missing → not ready, exit 1", () => {
  const dir = makeDir();
  standUpSurface(dir);
  const { code, out } = run(dir, { ...FULL, promptDir: "ops/prompts" });
  assert.equal(code, 1, `expected 1, got ${code}\n${out}`);
  assert.match(out, /promptDir/);
});

// 6. complete surface WITH a present prompt dir → READY.
test("complete surface + prompt dir → ready, exit 0", () => {
  const dir = makeDir();
  standUpSurface(dir);
  mkdirSync(path.join(dir, "ops/prompts"), { recursive: true });
  const { code, out } = run(dir, { ...FULL, promptDir: "ops/prompts" });
  assert.equal(code, 0, `expected 0, got ${code}\n${out}`);
  assert.match(out, /GREEN/);
});

// 7. no config arg → setup error (exit 2).
test("no config arg → setup error, exit 2", () => {
  const r = spawnSync("node", [TOOL], { cwd: makeDir(), encoding: "utf8" });
  assert.equal(r.status, 2, `expected 2, got ${r.status}`);
  assert.match(`${r.stdout ?? ""}${r.stderr ?? ""}`, /no config path/);
});

// 8. invalid JSON config → setup error (exit 2).
test("invalid JSON config → setup error, exit 2", () => {
  const dir = makeDir();
  const { code, out } = run(dir, "{ not json");
  assert.equal(code, 2, `expected 2, got ${code}\n${out}`);
  assert.match(out, /not valid JSON/);
});

for (const d of tmpdirs) {
  try {
    rmSync(d, { recursive: true, force: true });
  } catch {
    /* best-effort cleanup */
  }
}

console.log(`\ncheck-coder-launch-readiness: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
