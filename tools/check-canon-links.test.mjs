#!/usr/bin/env node
/**
 * Tests for check-canon-links.mjs — the cross-reference integrity gate.
 * Pure Node, no deps. Run: node tools/check-canon-links.test.mjs
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GATE = fileURLToPath(new URL("./check-canon-links.mjs", import.meta.url));

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
function repo(files) {
  const d = mkdtempSync(path.join(os.tmpdir(), "links-test-"));
  tmpdirs.push(d);
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

// 1. all links resolve → GREEN, exit 0
test("resolving links → GREEN, exit 0", () => {
  const d = repo({ "knowledge/a.md": "see [b](./b.md)\n", "knowledge/b.md": "hi\n" });
  const { code, out } = run(d);
  assert.equal(code, 0, `expected 0, got ${code}\n${out}`);
  assert.match(out, /GREEN/);
});

// 2. a broken relative link → RED, exit 1
test("broken link → RED, exit 1", () => {
  const d = repo({ "knowledge/a.md": "see [gone](./missing.md)\n" });
  const { code, out } = run(d);
  assert.equal(code, 1, `expected 1, got ${code}\n${out}`);
  assert.match(out, /broken link/);
  assert.match(out, /missing\.md/);
});

// 3. a "Piece #N" that does not exist → RED, exit 1
test("dangling Piece #N → RED, exit 1", () => {
  const d = repo({
    "setup/ADOPT-DEV-KIT.md": "### 1 — Real piece\n",
    "knowledge/a.md": "refers to Piece #99 which is fake\n",
  });
  const { code, out } = run(d);
  assert.equal(code, 1, `expected 1, got ${code}\n${out}`);
  assert.match(out, /dangling/);
  assert.match(out, /Piece #99/);
});

// 4. false-positive guard: code-block links, externals, and placeholders are NOT flagged
test("code-block / external / placeholder links are not flagged", () => {
  const d = repo({
    "knowledge/a.md":
      "real [ok](./b.md)\n\n```\nexample [x](./does-not-exist.md)\n```\n" +
      "external [g](https://example.com/nope.md) and placeholder [p](<kit>/x.md) and [q](./a-*.md)\n",
    "knowledge/b.md": "hi\n",
  });
  const { code, out } = run(d);
  assert.equal(code, 0, `expected 0 (no false positives), got ${code}\n${out}`);
  assert.match(out, /GREEN/);
});

// 5. no docs at all → setup error, exit 2
test("no docs → exit 2", () => {
  const d = mkdtempSync(path.join(os.tmpdir(), "links-test-"));
  tmpdirs.push(d);
  const { code } = run(d);
  assert.equal(code, 2, `expected 2, got ${code}`);
});

for (const d of tmpdirs) {
  try {
    rmSync(d, { recursive: true, force: true });
  } catch {
    /* best-effort */
  }
}

console.log(`\ncheck-canon-links: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
