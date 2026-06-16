#!/usr/bin/env node
/**
 * Tests for check-inheritance-claims.mjs — the reference claims validator
 * (INHERITANCE-CONTRACT §2: reject vague claims, verify cited mechanisms exist).
 * Integration style: the tool is a CLI that reads a status doc and resolves cited
 * files against the cwd, so we run it for real over throwaway docs/files in a tmp
 * dir. Pure Node, no deps. Run: node tools/check-inheritance-claims.test.mjs
 *
 * Guards both duties of the validator:
 *   - REJECT vague/invalid: empty parens, missing cited file, short N-A reason,
 *     ADOPTED-NATIVE with no named binding, a doc with no claim rows.
 *   - ACCEPT valid: strict vocabulary + every cited file present → exit 0.
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TOOL = fileURLToPath(new URL("./check-inheritance-claims.mjs", import.meta.url));

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

/** A throwaway dir; returns its path. */
function makeDir() {
  const dir = mkdtempSync(path.join(os.tmpdir(), "claims-test-"));
  tmpdirs.push(dir);
  return dir;
}

/** Write a status doc into dir/STATUS.md and run the validator with cwd=dir. */
function run(dir, doc) {
  const docPath = path.join(dir, "STATUS.md");
  writeFileSync(docPath, doc, "utf8");
  const r = spawnSync("node", [TOOL, docPath], { cwd: dir, encoding: "utf8" });
  return { code: r.status ?? 1, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

// 1. A fully valid status doc → exit 0 (strict vocabulary + cited files exist).
test("valid doc with existing cited files → exit 0", () => {
  const dir = makeDir();
  mkdirSync(path.join(dir, "tools"), { recursive: true });
  mkdirSync(path.join(dir, ".github", "workflows"), { recursive: true });
  writeFileSync(path.join(dir, "tools", "real.mjs"), "// real", "utf8");
  writeFileSync(path.join(dir, ".github", "workflows", "x.yml"), "name: x", "utf8");
  const doc = [
    "| Piece | Status | Note |",
    "|---|---|---|",
    "| ci | WIRED-CI(.github/workflows/x.yml:smoke) | |",
    "| script | WIRED-SCRIPT(tools/real.mjs) | |",
    "| native | ADOPTED-NATIVE | uses native git hooks directly |",
    "| later | PENDING | |",
    "| na | N-A(this repo ships no database layer) | |",
  ].join("\n");
  const { code, out } = run(dir, doc);
  assert.equal(code, 0, `expected exit 0, got ${code}\n${out}`);
  assert.match(out, /VALID/);
});

// 2. Vague claim — empty parens is the canonical "looks declared, says nothing".
test("empty-parens claim → exit 1 (vague/malformed)", () => {
  const dir = makeDir();
  const { code, out } = run(dir, "| x | WIRED-CI() | |\n");
  assert.equal(code, 1, `expected exit 1, got ${code}\n${out}`);
  assert.match(out, /vague|malformed/i);
});

// 3. A cited file that does not exist → exit 1 (the mechanism must be real).
test("cited file missing → exit 1", () => {
  const dir = makeDir();
  const { code, out } = run(dir, "| x | WIRED-SCRIPT(tools/ghost.mjs) | |\n");
  assert.equal(code, 1, `expected exit 1, got ${code}\n${out}`);
  assert.match(out, /does not exist/);
});

// 4. No claim rows at all → exit 1 (silence is not declaration).
test("no claim rows → exit 1", () => {
  const dir = makeDir();
  const { code, out } = run(dir, "# A title\n\njust prose, no status table.\n");
  assert.equal(code, 1, `expected exit 1, got ${code}\n${out}`);
  assert.match(out, /no claim rows/i);
});

// 5. N-A with a non-reason → exit 1 (the reason travels with the claim).
test("N-A with too-short reason → exit 1", () => {
  const dir = makeDir();
  const { code, out } = run(dir, "| x | N-A(no) | |\n");
  assert.equal(code, 1, `expected exit 1, got ${code}\n${out}`);
  assert.match(out, /non-reason|reason/i);
});

// 6. ADOPTED-NATIVE with no binding named in the row → exit 1.
test("ADOPTED-NATIVE without a named binding → exit 1", () => {
  const dir = makeDir();
  const { code, out } = run(dir, "| x | ADOPTED-NATIVE | |\n");
  assert.equal(code, 1, `expected exit 1, got ${code}\n${out}`);
  assert.match(out, /native binding/i);
});

for (const d of tmpdirs) {
  try {
    rmSync(d, { recursive: true, force: true });
  } catch {
    /* best-effort cleanup */
  }
}

console.log(`\ncheck-inheritance-claims: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
