#!/usr/bin/env node
/**
 * Tests for check-policy-manifests.mjs — the projection gate of machine-readable law.
 * Integration style: run the gate for real over throwaway repos in tmp dirs.
 * Known-bad discipline (§8.7a): every drift class is demonstrated to go RED —
 * status out-claiming the prose, a rule with no § anchor, a dangling watch ref,
 * an undeclared unwatched rule, a coverage-ratchet hole.
 * Pure Node, no deps. Run: node tools/check-policy-manifests.test.mjs
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TOOL = fileURLToPath(new URL("./check-policy-manifests.mjs", import.meta.url));

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

function makeRepo() {
  const dir = mkdtempSync(path.join(os.tmpdir(), "polman-"));
  tmpdirs.push(dir);
  return dir;
}

function write(dir, rel, content) {
  const full = path.join(dir, rel);
  mkdirSync(path.dirname(full), { recursive: true });
  writeFileSync(full, typeof content === "string" ? content : JSON.stringify(content, null, 2));
}

function run(dir, cfg) {
  write(dir, "cfg.json", cfg);
  const r = spawnSync("node", [TOOL, "cfg.json"], { cwd: dir, encoding: "utf8" });
  return { code: r.status ?? 1, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

const CANON = "# CANON-EXAMPLE-001 — Example law\n\n**Status:** SEALED 2026-07-01 by the named authority\n\n## §1 — Rule\n\nDeclared things only.\n";
const CFG = { policyDir: "policy", canonRoots: ["canon"], requireFor: ["canon/CANON-EXAMPLE-001.md"] };
const GOOD_RULE = {
  id: "EX-MUST-DECLARE",
  level: "MUST",
  cite: "§1",
  rule: "Declare before use.",
  watch: { kind: "gate", ref: "gate.mjs" },
};
function manifest(over = {}, ruleOver = {}) {
  return {
    $schema: "VIBETHINK_POLICY_MANIFEST_V1",
    id: "CANON-EXAMPLE-001",
    source: "canon/CANON-EXAMPLE-001.md",
    status: "SEALED",
    layer: "L1",
    summary: "example",
    rules: [{ ...GOOD_RULE, ...ruleOver }],
    ...over,
  };
}
function seed(dir, m) {
  write(dir, "canon/CANON-EXAMPLE-001.md", CANON);
  write(dir, "gate.mjs", "// a watching gate");
  write(dir, "policy/canon-example-001.policy.json", m);
}

console.log("check-policy-manifests.test.mjs\n");

test("faithful projection → GREEN, exit 0", () => {
  const dir = makeRepo();
  seed(dir, manifest());
  const { code, out } = run(dir, CFG);
  assert.equal(code, 0, out);
  assert.match(out, /GREEN/);
});

test("status drift (manifest out-claims prose) → RED, exit 1", () => {
  const dir = makeRepo();
  seed(dir, manifest());
  write(dir, "canon/CANON-EXAMPLE-001.md", CANON.replace("SEALED 2026-07-01 by the named authority", "DRAFT"));
  const { code, out } = run(dir, CFG);
  assert.equal(code, 1, out);
  assert.match(out, /status drift/i);
});

test("rule without § anchor (new law, not projection) → RED, exit 1", () => {
  const dir = makeRepo();
  seed(dir, manifest({}, { cite: "somewhere" }));
  const { code, out } = run(dir, CFG);
  assert.equal(code, 1, out);
  assert.match(out, /no § section/i);
});

test("dangling watch ref → RED, exit 1", () => {
  const dir = makeRepo();
  seed(dir, manifest({}, { watch: { kind: "gate", ref: "no-such-gate.mjs" } }));
  const { code, out } = run(dir, CFG);
  assert.equal(code, 1, out);
  assert.match(out, /does not exist/i);
});

test("unwatched without a note (silent omission) → RED, exit 1", () => {
  const dir = makeRepo();
  seed(dir, manifest({}, { watch: { kind: "none" } }));
  const { code, out } = run(dir, CFG);
  assert.equal(code, 1, out);
  assert.match(out, /conscious declaration/i);
});

test("coverage-ratchet hole (requireFor without manifest) → RED, exit 1", () => {
  const dir = makeRepo();
  seed(dir, manifest());
  const { code, out } = run(dir, {
    ...CFG,
    requireFor: [...CFG.requireFor, "canon/CANON-OTHER-001.md"],
  });
  assert.equal(code, 1, out);
  assert.match(out, /ratchet/i);
});

test("sealed-but-unmanifested canon → reported as frontier, still GREEN", () => {
  const dir = makeRepo();
  seed(dir, manifest());
  write(dir, "canon/CANON-FRONTIER-001.md", CANON.replace("CANON-EXAMPLE-001", "CANON-FRONTIER-001"));
  const { code, out } = run(dir, CFG);
  assert.equal(code, 0, out);
  assert.match(out, /frontier: 1 sealed canon/);
});

test("empty policyDir → setup error, exit 2 (meta-gate auditing nothing)", () => {
  const dir = makeRepo();
  write(dir, "policy/.keep", "");
  write(dir, "canon/CANON-EXAMPLE-001.md", CANON);
  const { code, out } = run(dir, CFG);
  assert.equal(code, 2, out);
});

// The real repo's manifests must themselves pass the gate (dogfood).
test("the kit's own manifests → GREEN against the real config", () => {
  const kitRoot = path.dirname(path.dirname(TOOL));
  const r = spawnSync("node", [TOOL, "tools/policy-manifests.config.json"], {
    cwd: kitRoot,
    encoding: "utf8",
  });
  assert.equal(r.status, 0, `${r.stdout}${r.stderr}`);
});

for (const d of tmpdirs) rmSync(d, { recursive: true, force: true });
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
