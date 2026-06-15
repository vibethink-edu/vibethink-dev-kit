#!/usr/bin/env node
/**
 * Tests for check-governance.mjs — the governance gate (#34/#37).
 * Pure Node, no deps. Run: node tools/check-governance.test.mjs
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GATE = fileURLToPath(new URL("./check-governance.mjs", import.meta.url));

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
function repoWith(config, files = {}) {
  const d = mkdtempSync(path.join(os.tmpdir(), "gov-test-"));
  tmpdirs.push(d);
  mkdirSync(path.join(d, "tools"), { recursive: true });
  if (config !== undefined) {
    writeFileSync(path.join(d, "tools", "governance.config.json"), JSON.stringify(config));
  }
  for (const [rel, body] of Object.entries(files)) {
    const p = path.join(d, rel);
    mkdirSync(path.dirname(p), { recursive: true });
    writeFileSync(p, body);
  }
  return d;
}
function run(cwd) {
  const r = spawnSync("node", [GATE], { cwd, encoding: "utf8" });
  return { code: r.status ?? 1, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

// 1. all declared instruments exist + non-empty (null = N-A) → GREEN, exit 0
test("declared instruments present (+ null N-A) → GREEN, exit 0", () => {
  const repo = repoWith(
    { instruments: { presentMirror: null, appendOnlyLog: "LOG.md", decisionRegister: "doc/REG.md" }, decisionClasses: "AGENTS.md" },
    { "LOG.md": "history\n", "doc/REG.md": "| D-001 |\n", "AGENTS.md": "classes\n" }
  );
  const { code, out } = run(repo);
  assert.equal(code, 0, `expected exit 0, got ${code}\n${out}`);
  assert.match(out, /GREEN/);
  assert.match(out, /N-A/, "a null instrument is reported as N-A, not failed");
});

// 2. a declared instrument that does NOT exist → RED, exit 1
test("declared-but-missing instrument → RED, exit 1", () => {
  const repo = repoWith(
    { instruments: { presentMirror: "BOARD.md", appendOnlyLog: "LOG.md", decisionRegister: null }, decisionClasses: "AGENTS.md" },
    { "LOG.md": "x\n", "AGENTS.md": "x\n" } // BOARD.md missing on purpose
  );
  const { code, out } = run(repo);
  assert.equal(code, 1, `expected exit 1, got ${code}\n${out}`);
  assert.match(out, /RED/);
  assert.match(out, /does not exist/);
});

// 3. a declared instrument that exists but is EMPTY → RED, exit 1 (empty = a lie)
test("declared-but-empty instrument → RED, exit 1", () => {
  const repo = repoWith(
    { instruments: { presentMirror: null, appendOnlyLog: "LOG.md", decisionRegister: null }, decisionClasses: null },
    { "LOG.md": "" }
  );
  const { code, out } = run(repo);
  assert.equal(code, 1, `expected exit 1 on empty file, got ${code}\n${out}`);
  assert.match(out, /EMPTY/i);
});

// 4. no config → setup error, exit 2 (the doctor skips before this; direct call fails clean)
test("no config → exit 2", () => {
  const d = mkdtempSync(path.join(os.tmpdir(), "gov-test-"));
  tmpdirs.push(d);
  const { code, out } = run(d);
  assert.equal(code, 2, `expected exit 2, got ${code}\n${out}`);
  assert.match(out, /config not found/i);
});

for (const d of tmpdirs) {
  try {
    rmSync(d, { recursive: true, force: true });
  } catch {
    /* best-effort */
  }
}

console.log(`\ncheck-governance: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
