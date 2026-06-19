#!/usr/bin/env node
/**
 * Tests for check-gate-integrity.mjs — makes CANON-AUDIT-PROTOCOL §8.7(a) bite.
 * Integration style: run the gate for real over throwaway gate-suites in tmp dirs.
 * Pure Node, no deps. Run: node tools/check-gate-integrity.test.mjs
 *
 * Guards the teeth (and dogfoods §8.7a on this very gate): a gate whose paired test
 * only checks the happy path is REFUSED; a gate with no test is REFUSED; a gate whose
 * test proves a RED passes; a misconfigured meta-gate that would audit nothing is a
 * setup error, not a silent pass.
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TOOL = fileURLToPath(new URL("./check-gate-integrity.mjs", import.meta.url));

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
  const dir = mkdtempSync(path.join(os.tmpdir(), "gate-integ-"));
  tmpdirs.push(dir);
  return dir;
}

function write(dir, rel, content) {
  const full = path.join(dir, rel);
  mkdirSync(path.dirname(full), { recursive: true });
  writeFileSync(full, typeof content === "string" ? content : JSON.stringify(content), "utf8");
}

function run(dir, config) {
  write(dir, "gate-integrity.config.json", config);
  const r = spawnSync("node", [TOOL, "gate-integrity.config.json"], { cwd: dir, encoding: "utf8" });
  return { code: r.status ?? 1, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

const CFG = {
  auditDir: "g",
  gatePattern: "^check-.*\\.mjs$",
  testSuffix: ".test.mjs",
  exclude: [],
};
// A test that proves a RED (the recognised known-bad idiom).
const GOOD_TEST =
  'assert.equal(code, 1, "should refuse");\ntest("bad input → refused, exit 1", () => {});';
// A test that only checks the happy path — never shown to go red.
const HAPPY_ONLY_TEST =
  'assert.equal(code, 0, "ok");\ntest("valid input → green, exit 0", () => {});';

// 1. gate with a paired test that proves a RED → GREEN.
test("gate proves it fails → green, exit 0", () => {
  const dir = makeDir();
  write(dir, "g/check-foo.mjs", "// gate");
  write(dir, "g/check-foo.test.mjs", GOOD_TEST);
  const { code, out } = run(dir, CFG);
  assert.equal(code, 0, `expected 0, got ${code}\n${out}`);
  assert.match(out, /GREEN/);
});

// 2. gate whose test is happy-path-only → REFUSED (the core §8.7a teeth).
test("happy-path-only gate → red, exit 1", () => {
  const dir = makeDir();
  write(dir, "g/check-bar.mjs", "// gate");
  write(dir, "g/check-bar.test.mjs", HAPPY_ONLY_TEST);
  const { code, out } = run(dir, CFG);
  assert.equal(code, 1, `expected 1, got ${code}\n${out}`);
  assert.match(out, /RED/);
  assert.match(out, /no known-bad case/);
});

// 3. gate with no paired test at all → REFUSED.
test("gate with no test → red, exit 1", () => {
  const dir = makeDir();
  write(dir, "g/check-orphan.mjs", "// gate");
  const { code, out } = run(dir, CFG);
  assert.equal(code, 1, `expected 1, got ${code}\n${out}`);
  assert.match(out, /no paired test/);
});

// 4. mix: one good, one bad → REFUSED, names only the offender.
test("mixed suite → red, exit 1, names the offender", () => {
  const dir = makeDir();
  write(dir, "g/check-ok.mjs", "// gate");
  write(dir, "g/check-ok.test.mjs", GOOD_TEST);
  write(dir, "g/check-weak.mjs", "// gate");
  write(dir, "g/check-weak.test.mjs", HAPPY_ONLY_TEST);
  const { code, out } = run(dir, CFG);
  assert.equal(code, 1, `expected 1, got ${code}\n${out}`);
  assert.match(out, /check-weak/);
  assert.doesNotMatch(out, /✗ check-ok/);
});

// 5. zero gates matched → setup error (exit 2), not a silent pass.
test("no gates matched → setup error, exit 2", () => {
  const dir = makeDir();
  mkdirSync(path.join(dir, "g"), { recursive: true });
  const { code, out } = run(dir, CFG);
  assert.equal(code, 2, `expected 2, got ${code}\n${out}`);
  assert.match(out, /no gates matched/);
});

// 6. no config path → setup error (exit 2).
test("no config arg → setup error, exit 2", () => {
  const r = spawnSync("node", [TOOL], { cwd: makeDir(), encoding: "utf8" });
  assert.equal(r.status, 2, `expected 2, got ${r.status}`);
  assert.match(`${r.stdout ?? ""}${r.stderr ?? ""}`, /no config path/);
});

// 7. config not valid JSON → setup error (exit 2).
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

console.log(`\ncheck-gate-integrity: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
