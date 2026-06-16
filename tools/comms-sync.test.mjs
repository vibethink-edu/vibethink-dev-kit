#!/usr/bin/env node
/**
 * Tests for comms-sync.mjs — "traeme todo y mostrame qué tengo" for a
 * multi-workstation operator (pull · filtered inbox · sync-status warnings).
 * Integration style: the tool runs git + reads the lane, so we exercise it in
 * throwaway git repos with hand-written comm files. It reads the KIT's
 * inbox.config.json (lane = docs/ai-coordination/comms, repo = vibethink-dev-kit),
 * which the assertions below account for. Pure Node, no deps.
 * Run: node tools/comms-sync.test.mjs
 *
 * Guards the unique consumer-side logic the inbox engine does NOT cover:
 *   - the recency hard gate + top-N (old comms hidden, current ones shown);
 *   - the sync-status warnings (uncommitted comm files live only on this machine);
 *   - the wrong-chat guard (a comm whose repo ≠ this session's repo);
 *   - it degrades cleanly with no remote (pull --ff-only fails → warn, never crash).
 */
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TOOL = fileURLToPath(new URL("./comms-sync.mjs", import.meta.url));
const LANE = "docs/ai-coordination/comms";
const KIT_REPO = "vibethink-dev-kit"; // from the kit's inbox.config.json
const TODAY = new Date().toISOString().slice(0, 10);

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
  const dir = mkdtempSync(path.join(os.tmpdir(), "comms-sync-test-"));
  tmpdirs.push(dir);
  git(dir, ["init", "-q"]);
  git(dir, ["config", "user.email", "t@t.t"]);
  git(dir, ["config", "user.name", "Test"]);
  git(dir, ["config", "commit.gpgsign", "false"]);
  mkdirSync(path.join(dir, LANE), { recursive: true });
  git(dir, ["commit", "-q", "--allow-empty", "-m", "init"]);
  return dir;
}

/** Write a comm file into the lane. fields → YAML front-matter. */
function writeComm(dir, name, fields) {
  const fm = Object.entries(fields)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
  writeFileSync(path.join(dir, LANE, name), `---\n${fm}\n---\n\nbody\n`, "utf8");
}

function commitAll(dir, msg) {
  git(dir, ["add", "-A"]);
  git(dir, ["commit", "-q", "-m", msg]);
}

/** Run comms:sync for the human inbox with cwd=dir. */
function run(dir, args = ["human"]) {
  const r = spawnSync("node", [TOOL, ...args], { cwd: dir, encoding: "utf8" });
  return { code: r.status ?? 1, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

const humanComm = (extra = {}) => ({
  to: "human",
  needs: "human",
  from: "tester",
  priority: "high",
  repo: KIT_REPO,
  ...extra,
});

// 1. Fresh repo, no remote → no crash, exit 0, shows the inbox + sync-status sections.
test("no remote → runs clean, exit 0, prints inbox + sync status", () => {
  const repo = makeRepo();
  const { code, out } = run(repo);
  assert.equal(code, 0, `expected exit 0, got ${code}\n${out}`);
  assert.match(out, /comms:sync/);
  assert.match(out, /inbox: human/);
  assert.match(out, /sync status/);
  assert.match(out, /clean and in sync/);
});

// 2. A recent human comm appears in the filtered inbox.
test("recent human comm → shown in inbox", () => {
  const repo = makeRepo();
  writeComm(repo, "2099-recent.md", humanComm({ date: TODAY, re: "Recent subject" }));
  commitAll(repo, "add recent comm");
  const { out } = run(repo);
  assert.match(out, /Recent subject/, "the recent comm should be listed");
});

// 3. Recency hard gate — an old comm is counted but hidden behind the top-N/recency note.
test("old comm hidden by recency gate (recent shown, old hidden)", () => {
  const repo = makeRepo();
  writeComm(repo, "2099-recent.md", humanComm({ date: TODAY, re: "Recent subject" }));
  writeComm(repo, "2020-old.md", humanComm({ date: "2020-01-01", re: "Ancient subject" }));
  commitAll(repo, "add two comms");
  const { out } = run(repo);
  assert.match(out, /1 of 2/, "should count 2 but show 1 within recency");
  assert.match(out, /older.*hidden/, "should note the hidden older comm");
});

// 4. An uncommitted comm in the lane → warned as living only on this machine.
test("uncommitted comm in lane → sync-status warns it is local-only", () => {
  const repo = makeRepo();
  writeComm(repo, "2099-draft.md", humanComm({ date: TODAY, re: "Draft" }));
  // deliberately NOT committed
  const { out } = run(repo);
  assert.match(out, /live only on THIS machine/i, "should warn the comm is local-only");
});

// 5. Wrong-chat guard — a comm whose repo ≠ this session's repo is flagged.
test("comm for a DIFFERENT repo → wrong-chat guard fires", () => {
  const repo = makeRepo();
  writeComm(
    repo,
    "2099-elsewhere.md",
    humanComm({ date: TODAY, re: "Other repo", repo: "some-other-repo" })
  );
  commitAll(repo, "add foreign comm");
  const { out } = run(repo);
  assert.match(out, /DIFFERENT repo/, "should flag the wrong-repo comm");
  assert.match(out, /some-other-repo/);
});

for (const d of tmpdirs) {
  try {
    rmSync(d, { recursive: true, force: true });
  } catch {
    /* best-effort cleanup */
  }
}

console.log(`\ncomms-sync: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
