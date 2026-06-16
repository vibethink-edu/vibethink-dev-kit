#!/usr/bin/env node
/**
 * Tests for devkit-doctor.mjs — the one-screen health board.
 * Integration style: runs the real CLI (it shells out to the gate engines), so we
 * exercise it as used. Covers: all-skip → GREEN, --json shape, and a forced gate
 * failure → RED + exit 1 + a fix hint. Pure Node, no deps. Run: node tools/devkit-doctor.test.mjs
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DOCTOR = fileURLToPath(new URL("./devkit-doctor.mjs", import.meta.url));

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
function tmp() {
  const d = mkdtempSync(path.join(os.tmpdir(), "doctor-test-"));
  tmpdirs.push(d);
  return d;
}
function doctor(cwd, args = []) {
  const r = spawnSync("node", [DOCTOR, ...args], { cwd, encoding: "utf8" });
  return { code: r.status ?? 1, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

// 1. No config anywhere → every gate SKIPPED → GREEN, exit 0, skips reported (never silent)
test("empty repo → all gates skipped, GREEN, exit 0", () => {
  const { code, out } = doctor(tmp());
  assert.equal(code, 0, `expected exit 0, got ${code}\n${out}`);
  assert.match(out, /GREEN/, "should be GREEN when nothing failed");
  assert.match(out, /skipped/i, "skips must be reported, never silently absent");
});

// 2. --json → machine-readable shape (verdict + counts + gates[])
test("--json → valid shape", () => {
  const { code, out } = doctor(tmp(), ["--json"]);
  assert.equal(code, 0);
  const j = JSON.parse(out);
  assert.equal(j.verdict, "GREEN");
  assert.equal(typeof j.failed, "number");
  assert.ok(Array.isArray(j.gates), "gates must be an array");
});

// 3. A gate that FAILS → RED + exit 1 + the fix hint. Force it: a copy-parity config
//    whose upstreamRoot does not exist makes check-copy-parity exit non-zero.
test("a failing gate → RED, exit 1, with a fix hint", () => {
  const repo = tmp();
  mkdirSync(path.join(repo, "tools"), { recursive: true });
  writeFileSync(path.join(repo, "x.txt"), "local\n");
  writeFileSync(
    path.join(repo, "tools", "copy-parity.config.json"),
    JSON.stringify({
      upstreamRoot: "./does-not-exist",
      copies: [{ local: "x.txt", upstream: "x.txt" }],
    })
  );
  const { code, out } = doctor(repo);
  assert.equal(code, 1, `expected exit 1 on a failing gate, got ${code}\n${out}`);
  assert.match(out, /RED/, "should be RED when a gate fails");
  assert.match(out, /fix →/, "a red gate must print its fix hint");
});

// 4. --adoption → the inventory lens (distinct from the health board). A bare temp
//    repo has no status doc → "no adoption declared"; the JSON still carries the
//    catalog roster (read from the kit) + the tools list + a gatesWired count.
test("--adoption --json → inventory shape, exit 0", () => {
  const { code, out } = doctor(tmp(), ["--adoption", "--json"]);
  assert.equal(code, 0, `expected exit 0, got ${code}\n${out}`);
  const j = JSON.parse(out);
  assert.equal(j.role, "no adoption declared", "a bare repo declares no adoption");
  assert.ok(j.pieces.catalog > 0, "the catalog roster should be read from the kit");
  assert.ok(Array.isArray(j.tools), "tools must be an array");
  assert.match(j.gatesWired, /^\d+\/\d+$/, "gatesWired is an x/y count");
});

// 5. --adoption (text) → leads with the verdict line, one section per lens.
test("--adoption (text) → verdict-first board", () => {
  const { code, out } = doctor(tmp(), ["--adoption"]);
  assert.equal(code, 0);
  assert.match(out, /Dev-Kit Adoption/);
  assert.match(out, /NO ADOPTION DECLARED/);
  assert.match(out, /Tools \(kit defaults/);
  assert.match(out, /Gates wired here/);
});

for (const d of tmpdirs) {
  try {
    rmSync(d, { recursive: true, force: true });
  } catch {
    /* best-effort */
  }
}

console.log(`\ndevkit-doctor: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
