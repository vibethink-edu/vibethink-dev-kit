#!/usr/bin/env node
/**
 * Tests for kdd-refresh.mjs — the KDD memory-manifest WRITER.
 *
 * It was the only tool with no co-located test (2026-07-01 maturity audit F-04) —
 * ironic for the tool whose output the freshness GATE trusts. These tests close the
 * loop end-to-end: the manifest kdd-refresh writes must be ACCEPTED by
 * check-knowledge-memory-freshness when sources are unchanged, and REJECTED when a
 * source changes after the manifest (the gate bites — REVIEW-CALL-CHECKLIST #4).
 *
 * Pure Node, no deps. Run: node tools/kdd-refresh.test.mjs
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REFRESH = path.join(HERE, "kdd-refresh.mjs");
const FRESHNESS = path.join(HERE, "check-knowledge-memory-freshness.mjs");

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

function run(tool, cwd, args = []) {
  try {
    const out = execFileSync("node", [tool, ...args], { cwd, encoding: "utf8" });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status ?? 1, out: `${e.stdout || ""}${e.stderr || ""}` };
  }
}

/** Minimal KDD repo: a knowledge root with one source doc + a config. */
function scaffold() {
  const root = mkdtempSync(path.join(os.tmpdir(), "kdd-refresh-test-"));
  tmpdirs.push(root);
  mkdirSync(path.join(root, "kb"), { recursive: true });
  mkdirSync(path.join(root, "tools"), { recursive: true });
  writeFileSync(path.join(root, "kb", "DOMAIN.md"), "# domain\naccepted knowledge v1\n");
  writeFileSync(
    path.join(root, "tools", "knowledge-memory.config.json"),
    JSON.stringify({
      knowledgeRoot: "kb",
      manifestPath: "kb/.kdd-memory-manifest.json",
      sourceExtensions: [".md"],
      indexes: [],
    })
  );
  return root;
}

// 1. happy path — refresh writes a manifest with the source fingerprint.
test("refresh → manifest written with sources + fingerprint, exit 0", () => {
  const root = scaffold();
  const r = run(REFRESH, root, ["tools/knowledge-memory.config.json"]);
  assert.equal(r.code, 0, `expected exit 0\n${r.out}`);
  const manifest = JSON.parse(readFileSync(path.join(root, "kb", ".kdd-memory-manifest.json"), "utf8"));
  assert.ok(manifest.sourceFingerprint || manifest.fingerprint, "manifest must carry a source fingerprint");
  const sources = manifest.sources || manifest.sourceFiles || [];
  assert.ok(Array.isArray(sources) && sources.length === 1, `manifest must list the 1 source doc\n${r.out}`);
});

// 2. round-trip — the freshness gate ACCEPTS the manifest refresh just wrote.
test("refresh → freshness gate passes (unchanged sources), exit 0", () => {
  const root = scaffold();
  assert.equal(run(REFRESH, root, ["tools/knowledge-memory.config.json"]).code, 0);
  const g = run(FRESHNESS, root, ["tools/knowledge-memory.config.json"]);
  assert.equal(g.code, 0, `freshness must accept a just-written manifest\n${g.out}`);
});

// 3. the gate bites — a source changed AFTER the manifest → stale, exit 1.
test("source changed after refresh → freshness gate exits 1 (stale)", () => {
  const root = scaffold();
  assert.equal(run(REFRESH, root, ["tools/knowledge-memory.config.json"]).code, 0);
  writeFileSync(path.join(root, "kb", "DOMAIN.md"), "# domain\naccepted knowledge v2 — CHANGED\n");
  const g = run(FRESHNESS, root, ["tools/knowledge-memory.config.json"]);
  assert.equal(g.code, 1, `freshness must flag a changed source as stale\n${g.out}`);
});

// 4. setup error — missing config → exit 2 (never a silent 0).
test("missing config → exit 2 (setup error, not silent)", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "kdd-refresh-test-"));
  tmpdirs.push(root);
  const r = run(REFRESH, root, ["tools/nope.config.json"]);
  assert.equal(r.code, 2, `expected setup-fail exit 2\n${r.out}`);
});

// 5. failing index refresh command → exit 1 (the failure is loud, not swallowed).
test("--run-indexes with failing refreshCommand → exit 1", () => {
  const root = scaffold();
  writeFileSync(
    path.join(root, "tools", "knowledge-memory.config.json"),
    JSON.stringify({
      knowledgeRoot: "kb",
      manifestPath: "kb/.kdd-memory-manifest.json",
      sourceExtensions: [".md"],
      indexes: [{ name: "broken", refreshCommand: "node -e \"process.exit(3)\"", artifacts: [] }],
    })
  );
  const r = run(REFRESH, root, ["tools/knowledge-memory.config.json", "--run-indexes"]);
  assert.equal(r.code, 1, `a failing index refresh must exit 1\n${r.out}`);
});

for (const d of tmpdirs) {
  try {
    rmSync(d, { recursive: true, force: true });
  } catch {
    /* best-effort */
  }
}

console.log(`\nkdd-refresh: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
