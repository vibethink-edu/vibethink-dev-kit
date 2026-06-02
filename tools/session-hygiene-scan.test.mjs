#!/usr/bin/env node
/**
 * Negative-regression tests for session-hygiene-scan.mjs.
 *
 * The scan is a non-mutating gate that flags fragile WIP (canon §2.2). A gate
 * must bite a known-bad case (REVIEW-CALL-CHECKLIST control #4). These tests
 * build throwaway git repos with controlled commit dates + working-tree state
 * and assert the scan's verdict (and exit code).
 *
 * Pure Node, no deps. Run: node tools/session-hygiene-scan.test.mjs
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCAN = path.join(path.dirname(fileURLToPath(import.meta.url)), "session-hygiene-scan.mjs");

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

function runScan(setup) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "session-hygiene-test-"));
  try {
    execFileSync("git", ["init", "-q", "-b", "main"], { cwd: dir });
    // Quiet git config (commits need a user)
    execFileSync("git", ["config", "user.email", "test@example.com"], { cwd: dir });
    execFileSync("git", ["config", "user.name", "Test"], { cwd: dir });
    setup(dir);
    let code = 0;
    let out = "";
    try {
      out = execFileSync("node", [SCAN], { cwd: dir, encoding: "utf8" });
    } catch (e) {
      code = e.status ?? 1;
      out = `${e.stdout || ""}${e.stderr || ""}`;
    }
    return { code, out };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function gitCommit(dir, message, dateIso) {
  const env = { ...process.env };
  if (dateIso) {
    env.GIT_AUTHOR_DATE = dateIso;
    env.GIT_COMMITTER_DATE = dateIso;
  }
  execFileSync("git", ["add", "-A"], { cwd: dir });
  execFileSync("git", ["commit", "-q", "-m", message], { cwd: dir, env });
}

function isoDaysAgo(days, hour = 12) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

// ── clean: no uncommitted, no unpushed → exit 0 ─────────────────────────────
test("clean worktree (no uncommitted, no upstream) → '✓ clean' + exit 0", () => {
  const { code, out } = runScan((dir) => {
    fs.writeFileSync(path.join(dir, "README.md"), "# repo\n");
    gitCommit(dir, "init", isoDaysAgo(0));
  });
  assert.match(out, /✓.*clean/, "must report clean");
  assert.match(out, /GREEN/, "must say GREEN");
  assert.equal(code, 0, "clean → exit 0");
});

// ── current: uncommitted but activity is TODAY → exit 0, not flagged ────────
test("uncommitted with same-day commit → 'current' + exit 0 (not stale)", () => {
  const { code, out } = runScan((dir) => {
    fs.writeFileSync(path.join(dir, "README.md"), "# repo\n");
    gitCommit(dir, "init today", isoDaysAgo(0));
    fs.writeFileSync(path.join(dir, "wip.txt"), "still working\n");
    // do NOT commit — leave as uncommitted
  });
  assert.match(out, /current/, "must report current (activity today)");
  assert.match(out, /GREEN/, "same-day WIP is allowed (must close before session end)");
  assert.equal(code, 0, "current → exit 0");
});

// ── STALE: uncommitted + last commit was yesterday → exit 1, flagged ────────
test("uncommitted + last commit yesterday → '✗ STALE' + exit 1", () => {
  const { code, out } = runScan((dir) => {
    fs.writeFileSync(path.join(dir, "README.md"), "# repo\n");
    gitCommit(dir, "init yesterday", isoDaysAgo(1));
    fs.writeFileSync(path.join(dir, "wip.txt"), "left from yesterday\n");
  });
  assert.match(out, /STALE/, "must flag STALE when activity < today");
  assert.match(out, /RED/, "must say RED");
  assert.equal(code, 1, "stale → exit 1 (the gate bites)");
});

// ── no-commits-yet: brand new worktree with uncommitted → NOT stale ─────────
test("uncommitted with NO commits yet → 'current' + exit 0 (not stale)", () => {
  const { code, out } = runScan((dir) => {
    fs.writeFileSync(path.join(dir, "wip.txt"), "fresh session, never committed\n");
  });
  assert.match(out, /current|clean/, "must NOT flag a brand-new worktree as stale");
  assert.equal(code, 0, "no commits yet → not stale (per honest scope)");
});

// ── --json mode: machine-readable output ────────────────────────────────────
test("--json mode emits parseable JSON with summary", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "session-hygiene-json-"));
  try {
    execFileSync("git", ["init", "-q", "-b", "main"], { cwd: dir });
    execFileSync("git", ["config", "user.email", "test@example.com"], { cwd: dir });
    execFileSync("git", ["config", "user.name", "Test"], { cwd: dir });
    fs.writeFileSync(path.join(dir, "README.md"), "# repo\n");
    gitCommit(dir, "init", isoDaysAgo(0));
    const out = execFileSync("node", [SCAN, "--json"], { cwd: dir, encoding: "utf8" });
    const parsed = JSON.parse(out);
    assert.equal(typeof parsed.today, "string", "must emit today");
    assert.ok(Array.isArray(parsed.results), "must emit results array");
    assert.equal(parsed.stale, 0, "clean repo → 0 stale");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
