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
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compileManifest, evaluate } from "./policy-engine/engine.mjs";

const SEND = fileURLToPath(new URL("./comms-send.mjs", import.meta.url));
const GIT_HYGIENE_MANIFEST = fileURLToPath(
  new URL("../knowledge/policy/canon-git-hygiene.policy.json", import.meta.url)
);

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

/** A throwaway git repo WITH a bare remote wired up and tracking configured, so a
 *  real `git push` (the S3 governed self-check's actual push path) can travel. */
function makeRepoWithRemote() {
  const bareDir = mkdtempSync(path.join(os.tmpdir(), "comms-send-test-bare-"));
  tmpdirs.push(bareDir);
  git(bareDir, ["init", "-q", "--bare"]);

  const dir = mkdtempSync(path.join(os.tmpdir(), "comms-send-test-"));
  tmpdirs.push(dir);
  git(dir, ["init", "-q"]);
  git(dir, ["config", "user.email", "t@t.t"]);
  git(dir, ["config", "user.name", "Test"]);
  git(dir, ["config", "commit.gpgsign", "false"]);
  git(dir, ["remote", "add", "origin", bareDir]);
  git(dir, ["commit", "-q", "--allow-empty", "-m", "init"]);
  git(dir, ["push", "-q", "-u", "origin", "HEAD"]);
  return dir;
}

/** Run the CLI; return { code, out } (out = stdout+stderr, so warnings on stderr are
 *  captured too). spawnSync gives status + both streams on success AND failure. */
function send(cwd, args) {
  const r = spawnSync("node", [SEND, ...args], { cwd, encoding: "utf8" });
  return { code: r.status ?? 1, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

const baseArgs = (extra = []) => [
  "--to",
  "human",
  "--type",
  "note",
  "--re",
  "test subject",
  "--body",
  "a plain body",
  ...extra,
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
  const { code, out } = send(repo, [
    "--to",
    "human",
    "--type",
    "note",
    "--re",
    "leak",
    "--body",
    "the key is sk-ABCDEF0123456789ghij",
  ]);
  assert.equal(code, 1, `expected exit 1, got ${code}\n${out}`);
  assert.match(out, /BLOCKED/, "should block on the secret");
  // nothing committed beyond the initial commit
  const count = execFileSync("git", ["rev-list", "--count", "HEAD"], {
    cwd: repo,
    encoding: "utf8",
  }).trim();
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

// Governance comms (task/review/audit) require a Recipient Self-Check with CONTENT,
// not just a heading (#23.3 — a blank heading used to pass). branch + target repo/layer.
const govArgs = (body, extra = []) => [
  "--to",
  "codex",
  "--type",
  "task",
  "--re",
  "gov subject",
  "--target-layer",
  "product-L3",
  "--ref-branch",
  "main",
  "--body",
  body,
  ...extra,
];

// 6. Governance comm whose Self-Check is a bare heading → validation error, exit 2.
test("governance comm with empty Self-Check → exit 2", () => {
  const repo = makeRepo();
  const { code, out } = send(repo, govArgs("intro line\n\n## Recipient Self-Check\n"));
  assert.equal(code, 2, `expected exit 2, got ${code}\n${out}`);
  assert.match(out, /Self-Check.*content|content.*Self-Check/i);
});

// 7. Self-Check has content but never names the branch → exit 2 (must orient the recipient).
test("governance Self-Check missing the branch → exit 2", () => {
  const repo = makeRepo();
  const body = "## Recipient Self-Check\n- this pertains to the repo at layer product-L3\n";
  const { code, out } = send(repo, govArgs(body));
  assert.equal(code, 2, `expected exit 2, got ${code}\n${out}`);
  assert.match(out, /branch/i);
});

// 8. A proper Self-Check (branch + target repo/layer) → governance passes, comm sends.
test("governance comm with a complete Self-Check → exit 0", () => {
  const repo = makeRepo();
  const body =
    "## Recipient Self-Check\n- branch: main\n- target repo vibethink-dev-kit, layer product-L3\n";
  const { code, out } = send(repo, govArgs(body));
  assert.equal(code, 0, `expected exit 0, got ${code}\n${out}`);
  assert.match(out, /COMMITTED-LOCAL/);
});

// 9. S3 self-governance — the governed push flow still travels end-to-end when a
//    real remote exists: comms-send's own call-time `commLane` grant must ALLOW its
//    push through the git-hygiene policy engine (existing tests above only exercise
//    the no-remote COMMITTED-LOCAL path, which never reaches the self-check).
test("governed push flow (real remote) → grant still allows, exit 0 pushed", () => {
  const repo = makeRepoWithRemote();
  const { code, out } = send(repo, baseArgs());
  assert.equal(code, 0, `expected exit 0, got ${code}\n${out}`);
  assert.match(out, /committed \+ pushed/);
  const remoteBranch = execFileSync("git", ["branch", "--show-current"], {
    cwd: repo,
    encoding: "utf8",
  }).trim();
  const remoteLog = execFileSync("git", ["log", "--oneline", "-1", `origin/${remoteBranch}`], {
    cwd: repo,
    encoding: "utf8",
  });
  assert.match(remoteLog, /docs\(comms\): test subject/, "the push must have actually travelled");
});

// 10. Unit-style: the SAME push content the self-check builds, evaluated directly
//     against the engine — WITHOUT the commLane grant it is DENY, WITH it ALLOW.
//     No real push needed; this pins the exemption shape the self-check depends on.
test("push-to-main content: DENY without commLane grant, ALLOW with it", () => {
  const manifest = JSON.parse(readFileSync(GIT_HYGIENE_MANIFEST, "utf8"));
  const policies = compileManifest(manifest);
  const content = "git push origin main --no-verify";

  const ungranted = evaluate({ point: "tool-call", tool: "bash", content }, {}, policies);
  assert.equal(ungranted.verdict, "DENY", JSON.stringify(ungranted));
  assert.match(ungranted.decidingPolicy, /GIT-MUST-ALL-VIA-PR/);

  const granted = evaluate(
    { point: "tool-call", tool: "bash", content, labels: { commLane: true } },
    {},
    policies
  );
  assert.equal(granted.verdict, "ALLOW", JSON.stringify(granted));
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
