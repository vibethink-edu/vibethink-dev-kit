#!/usr/bin/env node
/**
 * Tests for check-catalog-sync.mjs — the Maintenance-rule gate.
 *
 * A gate must bite a known-bad case (REVIEW-CALL-CHECKLIST control #4): these
 * tests build throwaway kit trees (knowledge dirs + catalog) and assert verdict
 * + exit code for: in-sync, uncatalogued spine, valid exemption, stale
 * exemption, missing status line, off-vocabulary status, missing config.
 *
 * Pure Node, no deps. Run: node tools/check-catalog-sync.test.mjs
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ENGINE = path.join(path.dirname(fileURLToPath(import.meta.url)), "check-catalog-sync.mjs");

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

const SEALED = "> **Status:** SEALED 2026-01-01 by the Principal Architect\n\nbody\n";

function run({ spines = {}, catalog = "", config = {}, extraFiles = {} }) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "catalog-sync-test-"));
  fs.mkdirSync(path.join(root, "knowledge", "methodology"), { recursive: true });
  fs.mkdirSync(path.join(root, "setup"), { recursive: true });
  fs.mkdirSync(path.join(root, "tools"), { recursive: true });
  for (const [name, content] of Object.entries(spines)) {
    fs.writeFileSync(path.join(root, "knowledge", "methodology", name), content);
  }
  for (const [rel, content] of Object.entries(extraFiles)) {
    const p = path.join(root, rel);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, content);
  }
  fs.writeFileSync(path.join(root, "setup", "ADOPT-DEV-KIT.md"), catalog);
  fs.writeFileSync(
    path.join(root, "tools", "catalog-sync.config.json"),
    JSON.stringify({
      catalogFile: "setup/ADOPT-DEV-KIT.md",
      knowledgeDirs: ["knowledge/methodology"],
      spinePattern: "^CANON-.*\\.md$",
      statusTokens: ["SEALED", "approved", "CANON"],
      exempt: [],
      alsoStatusCheck: [],
      ...config,
    })
  );
  let code = 0;
  let out = "";
  try {
    out = execFileSync("node", [ENGINE, "tools/catalog-sync.config.json"], { cwd: root, encoding: "utf8" });
  } catch (e) {
    code = e.status ?? 1;
    out = `${e.stdout || ""}${e.stderr || ""}`;
  }
  fs.rmSync(root, { recursive: true, force: true });
  return { code, out };
}

console.log("\ncheck-catalog-sync tests\n");

test("spine catalogued + sealed status → GREEN, exit 0", () => {
  const { code, out } = run({
    spines: { "CANON-EXAMPLE.md": SEALED },
    catalog: "### 1 — Example\n**Home:** `knowledge/methodology/CANON-EXAMPLE.md`.\n",
  });
  assert.equal(code, 0, out);
  assert.match(out, /GREEN/);
});

test("spine with NO catalog piece → RED, exit 1, names the spine + the rule", () => {
  const { code, out } = run({
    spines: { "CANON-ORPHAN.md": SEALED },
    catalog: "### 1 — Something else\n**Home:** `knowledge/methodology/CANON-OTHER.md`.\n",
  });
  assert.equal(code, 1, out);
  assert.match(out, /CANON-ORPHAN\.md has NO piece/);
  assert.match(out, /Maintenance rule/);
});

test("uncatalogued spine WITH declared exemption → GREEN, exemption visible", () => {
  const { code, out } = run({
    spines: { "CANON-INTERNAL.md": SEALED },
    catalog: "(no pieces)\n",
    config: {
      exempt: [{ file: "knowledge/methodology/CANON-INTERNAL.md", reason: "producer-internal, not adoptable" }],
    },
  });
  assert.equal(code, 0, out);
  assert.match(out, /EXEMPT: producer-internal/);
});

test("stale exemption (file gone) → RED, exit 1", () => {
  const { code, out } = run({
    spines: {},
    catalog: "(no pieces)\n",
    config: { exempt: [{ file: "knowledge/methodology/CANON-GONE.md", reason: "old" }] },
  });
  assert.equal(code, 1, out);
  assert.match(out, /stale exemption/);
});

test("spine missing its Status line → RED, exit 1", () => {
  const { code, out } = run({
    spines: { "CANON-NOSTATUS.md": "# Title\n\nno status here\n" },
    catalog: "**Home:** `knowledge/methodology/CANON-NOSTATUS.md`.\n",
  });
  assert.equal(code, 1, out);
  assert.match(out, /no \*\*Status:\*\* line/);
});

test("status outside the controlled vocabulary → RED, exit 1", () => {
  const { code, out } = run({
    spines: { "CANON-WEIRD.md": "> **Status:** vibing\n\nbody\n" },
    catalog: "**Home:** `knowledge/methodology/CANON-WEIRD.md`.\n",
  });
  assert.equal(code, 1, out);
  assert.match(out, /does not start with a controlled token/);
});

test("contract exists + catalog cites it → GREEN", () => {
  const { code, out } = run({
    catalog: "See [INHERITANCE-CONTRACT.md](INHERITANCE-CONTRACT.md) first.\n",
    config: { contractFile: "setup/INHERITANCE-CONTRACT.md" },
    extraFiles: { "setup/INHERITANCE-CONTRACT.md": "# Contract\n" },
  });
  assert.equal(code, 0, out);
  assert.match(out, /contract: .* exists and the catalog routes heirs to it/);
});

test("contract declared but file missing → RED, exit 1", () => {
  const { code, out } = run({
    catalog: "INHERITANCE-CONTRACT.md mentioned\n",
    config: { contractFile: "setup/INHERITANCE-CONTRACT.md" },
  });
  assert.equal(code, 1, out);
  assert.match(out, /does NOT exist/);
});

test("contract exists but catalog never cites it → RED, exit 1 (heirs not routed)", () => {
  const { code, out } = run({
    catalog: "no routing here\n",
    config: { contractFile: "setup/INHERITANCE-CONTRACT.md" },
    extraFiles: { "setup/INHERITANCE-CONTRACT.md": "# Contract\n" },
  });
  assert.equal(code, 1, out);
  assert.match(out, /never cites/);
});

test("missing config → setup error, exit 2", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "catalog-sync-test-"));
  let code = 0;
  let out = "";
  try {
    out = execFileSync("node", [ENGINE, "tools/catalog-sync.config.json"], { cwd: root, encoding: "utf8" });
  } catch (e) {
    code = e.status ?? 1;
    out = `${e.stdout || ""}${e.stderr || ""}`;
  }
  fs.rmSync(root, { recursive: true, force: true });
  assert.equal(code, 2, out);
  assert.match(out, /config not found/);
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
