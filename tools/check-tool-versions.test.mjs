#!/usr/bin/env node
/**
 * Tests for check-tool-versions.mjs — the tool-versioning gate (#16 §6).
 * Pure Node, no deps. Run: node tools/check-tool-versions.test.mjs
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GATE = fileURLToPath(new URL("./check-tool-versions.mjs", import.meta.url));

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
function repo(toolFiles, manifest) {
  const d = mkdtempSync(path.join(os.tmpdir(), "tv-test-"));
  tmpdirs.push(d);
  mkdirSync(path.join(d, "tools"), { recursive: true });
  for (const f of toolFiles) writeFileSync(path.join(d, "tools", f), "// tool\n");
  if (manifest !== undefined) writeFileSync(path.join(d, "tools", "versions.json"), JSON.stringify(manifest));
  return d;
}
function run(cwd) {
  const r = spawnSync("node", [GATE], { cwd, encoding: "utf8" });
  return { code: r.status ?? 1, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

// 1. every tool versioned (tests excluded) → GREEN, exit 0
test("all tools versioned → GREEN, exit 0", () => {
  const d = repo(["a.mjs", "b.mjs", "a.test.mjs"], { tools: { "a.mjs": "1.0", "b.mjs": "2.3" } });
  const { code, out } = run(d);
  assert.equal(code, 0, `expected 0, got ${code}\n${out}`);
  assert.match(out, /GREEN/);
});

// 2. a tool with no manifest entry → RED, exit 1
test("unversioned tool → RED, exit 1", () => {
  const d = repo(["a.mjs", "b.mjs"], { tools: { "a.mjs": "1.0" } });
  const { code, out } = run(d);
  assert.equal(code, 1, `expected 1, got ${code}\n${out}`);
  assert.match(out, /b\.mjs has no version/);
});

// 3. a stale manifest entry (no such tool) → RED, exit 1
test("stale manifest entry → RED, exit 1", () => {
  const d = repo(["a.mjs"], { tools: { "a.mjs": "1.0", "gone.mjs": "1.0" } });
  const { code, out } = run(d);
  assert.equal(code, 1, `expected 1, got ${code}\n${out}`);
  assert.match(out, /gone\.mjs.*no longer exists/);
});

// 4. malformed version (not MAJOR.MINOR) → RED, exit 1
test("malformed version → RED, exit 1", () => {
  const d = repo(["a.mjs"], { tools: { "a.mjs": "1" } });
  const { code, out } = run(d);
  assert.equal(code, 1, `expected 1, got ${code}\n${out}`);
  assert.match(out, /not MAJOR\.MINOR/);
});

// 5. no manifest → setup error, exit 2
test("no manifest → exit 2", () => {
  const d = repo(["a.mjs"], undefined);
  const { code, out } = run(d);
  assert.equal(code, 2, `expected 2, got ${code}\n${out}`);
  assert.match(out, /manifest not found/);
});

for (const d of tmpdirs) {
  try {
    rmSync(d, { recursive: true, force: true });
  } catch {
    /* best-effort */
  }
}

console.log(`\ncheck-tool-versions: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
