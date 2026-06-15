#!/usr/bin/env node
/**
 * Tests for graph-canon.mjs — the SUPRA-MAP generator.
 * Runs from the kit root (where the canons live). Asserts the committed map is FRESH
 * (`--check` exit 0 — a stale map would lie) and structurally sound (mermaid + nodes).
 * Pure Node, no deps. Run: node tools/graph-canon.test.mjs
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GEN = fileURLToPath(new URL("./graph-canon.mjs", import.meta.url));
const ROOT = dirname(dirname(GEN)); // tools/ → kit root
const MAP = join(ROOT, "knowledge", "SUPRA-MAP.md");

let pass = 0;
let fail = 0;
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

// 1. the committed SUPRA-MAP.md is FRESH (regenerating would not change it). A stale
//    map is a lie (AUDIT-PROTOCOL); this is also the freshness gate for CI.
test("committed SUPRA-MAP.md is up to date (--check)", () => {
  const r = spawnSync("node", [GEN, "--check"], { cwd: ROOT, encoding: "utf8" });
  assert.equal(r.status, 0, `stale map — run 'node tools/graph-canon.mjs' and commit.\n${r.stdout}${r.stderr}`);
});

// 2. it exists and is a Mermaid flowchart (renders as a picture on the forge)
test("SUPRA-MAP.md is a mermaid flowchart", () => {
  assert.ok(existsSync(MAP), "knowledge/SUPRA-MAP.md should exist");
  const m = readFileSync(MAP, "utf8");
  assert.match(m, /```mermaid/, "should contain a mermaid block");
  assert.match(m, /flowchart/, "should be a flowchart");
});

// 3. it has real content — many spines and at least some declared relationships
test("the map has nodes and edges", () => {
  const m = readFileSync(MAP, "utf8");
  const nodes = (m.match(/\["#?/g) || []).length;
  const edges = (m.match(/ --- /g) || []).length;
  assert.ok(nodes >= 20, `expected ≥20 canon nodes, got ${nodes}`);
  assert.ok(edges >= 10, `expected ≥10 declared relationships, got ${edges}`);
});

console.log(`\ngraph-canon: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
