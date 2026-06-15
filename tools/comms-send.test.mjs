#!/usr/bin/env node
/**
 * Tests for comms-send.mjs — the governed agent-to-agent send.
 * Integration style: runs the real CLI in throwaway git repos (it is a script that
 * commits/pushes, so we exercise it as it is actually used). Covers the SAFETY block,
 * create-only governance, validation, and — the regression this file most guards —
 * the §2.2.1 COMMITTED-LOCAL fallback (no remote / --no-push degrades, never exit-4).
 * Pure Node, no deps. Run: node tools/comms-send.test.mjs
 */
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SEND = fileURLToPath(new URL("./comms-send.mjs", import.meta.url));

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

function git(cwd, args) {
  execFileSync("git", args, { cwd, stdio: "pipe" });
}

/** A throwaway git repo with an initial commit and NO remote. */
function makeRepo() {
  const dir = mkdtempSync(path.join(os.tmpdir(), "comms-send-test-"));
  tmpdirs.push(dir);
  git(dir, ["init", "-q"]);
  git(dir, ["config", "user.email", "t@t.t"]);
  git(dir, ["config", "user.name", "Test"]);
  git(dir, ["config", "commit.gpgsign", "false"]);
  git(dir, ["commit", "-q", "--allow-empty", "-m", "init"]);
  return dir;
}

/** Run the CLI; return { code, out } (out = stdout+stderr, so warnings on stderr are
 *  captured too). spawnSync gives status + both streams on success AND failure. */
function send(cwd, args) {
  const r = spawnSync("node", [SEND, ...args], { cwd, encoding: "utf8" });
  return { code: r.status ?? 1, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

const baseArgs = (extra = []) => [
  "--to", "human", "--type", "note", "--re", "test subject", "--body", "a plain body", ...extra,
];

// 1. COMMITTED-LOCAL fallback — no remote configured → commit only, warn, exit 0
//    (NOT the old exit-4 hard failure). This is the §2.2.1 regression guard.
test("no remote → COMMITTED-LOCAL + warning, exit 0", () => {
  const repo = makeRepo();
  const { code, out } = send(repo, baseArgs());
  assert.equal(code, 0, `expected exit 0, got ${code}\n${out}`);
  assert.match(out, /COMMITTED-LOCAL/, "should declare COMMITTED-LOCAL state");
  assert.match(out, /no remote is configured/, "should name the no-remote reason");
  assert.match(out, /LOCAL ONLY/, "should carry the loud local-only warning");
  // and the file was actually committed (persistence held)
  const log = execFileSync("git", ["log", "--oneline", "-1"], { cwd: repo, encoding: "utf8" });
  assert.match(log, /docs\(comms\): test subject/, "the comm should be committed");
});

// 2. --no-push → deliberate COMMITTED-LOCAL, exit 0
test("--no-push → COMMITTED-LOCAL (deliberate), exit 0", () => {
  const repo = makeRepo();
  const { code, out } = send(repo, baseArgs(["--no-push"]));
  assert.equal(code, 0, `expected exit 0, got ${code}\n${out}`);
  assert.match(out, /COMMITTED-LOCAL/);
  assert.match(out, /deliberate/, "should name --no-push as the deliberate reason");
});

// 3. SAFETY first — a secret value blocks the send, nothing written, exit 1
test("secret value → BLOCKED, exit 1", () => {
  const repo = makeRepo();
  const { code, out } = send(repo, ["--to", "human", "--type", "note", "--re", "leak",
    "--body", "the key is sk-ABCDEF0123456789ghij"]);
  assert.equal(code, 1, `expected exit 1, got ${code}\n${out}`);
  assert.match(out, /BLOCKED/, "should block on the secret");
  // nothing committed beyond the initial commit
  const count = execFileSync("git", ["rev-list", "--count", "HEAD"], { cwd: repo, encoding: "utf8" }).trim();
  assert.equal(count, "1", "no comm should have been committed");
});

// 4. create-only governance — same subject twice → second is a conflict, exit 3
test("duplicate subject → create-only conflict, exit 3", () => {
  const repo = makeRepo();
  const first = send(repo, baseArgs());
  assert.equal(first.code, 0, `first send should succeed\n${first.out}`);
  const second = send(repo, baseArgs());
  assert.equal(second.code, 3, `expected exit 3 on duplicate, got ${second.code}\n${second.out}`);
  assert.match(second.out, /already exists|create-only/i);
});

// 5. validation — a missing required field → exit 2, nothing written
test("missing --re → validation error, exit 2", () => {
  const repo = makeRepo();
  const { code, out } = send(repo, ["--to", "human", "--type", "note", "--body", "x"]);
  assert.equal(code, 2, `expected exit 2, got ${code}\n${out}`);
  assert.match(out, /invalid|required/i);
});

for (const d of tmpdirs) {
  try {
    rmSync(d, { recursive: true, force: true });
  } catch {
    /* best-effort cleanup */
  }
}

console.log(`\ncomms-send: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
