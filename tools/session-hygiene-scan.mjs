#!/usr/bin/env node
/**
 * session-hygiene-scan — session-start non-mutating sweep (CANON-MULTI-AGENT-ORCHESTRATION §2.2).
 *
 * Flags any registered git worktree that ends a session with FRAGILE WIP — i.e.
 * uncommitted or unpushed work whose last commit is OLDER than today (local date).
 * The operator decides what to rescue, push, or discard. This script NEVER mutates.
 *
 * Decision states for closeout (canon §2.2): every touched branch/worktree must
 * end in PUSHED, READY-PR, or DISCARDED. The scan only DETECTS the failure mode;
 * the human (or the next-session agent) acts on the report.
 *
 * Usage:
 *   node tools/session-hygiene-scan.mjs           # scan worktrees of the repo at cwd
 *   node tools/session-hygiene-scan.mjs --json    # machine-readable output
 *
 * Exit: 0 = all worktrees clean OR only same-day WIP; 1 = at least one STALE worktree.
 *
 * Honest scope: "stale" is defined as (uncommitted OR unpushed) AND last commit
 * date < today (system local date). This is a proxy — a worktree that has had
 * no commits yet but accumulated uncommitted files today is NOT flagged (it is
 * indistinguishable from a brand-new working session). The scan also does not
 * stat file mtimes individually. It is early DETECTION, not a forensic tool.
 *
 * No dependencies — pure Node + git.
 */
import { execFileSync } from "node:child_process";
import process from "node:process";

const args = process.argv.slice(2);
const asJson = args.includes("--json");

function git(cwd, ...gitArgs) {
  try {
    return execFileSync("git", gitArgs, {
      cwd,
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch {
    return "";
  }
}

function todayLocalISODate() {
  // System local YYYY-MM-DD (not UTC) — "today" is the operator's day.
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseWorktreeList(porcelain) {
  // git worktree list --porcelain emits blocks separated by blank lines:
  //   worktree <path>
  //   HEAD <sha>
  //   branch refs/heads/<name>   (or 'detached')
  //   bare                       (for bare repos)
  const blocks = porcelain.split(/\r?\n\r?\n/).filter(Boolean);
  const worktrees = [];
  for (const block of blocks) {
    const wt = { path: "", head: "", branch: "", detached: false, bare: false };
    for (const line of block.split(/\r?\n/)) {
      if (line.startsWith("worktree ")) wt.path = line.slice("worktree ".length);
      else if (line.startsWith("HEAD ")) wt.head = line.slice("HEAD ".length);
      else if (line.startsWith("branch ")) {
        const ref = line.slice("branch ".length);
        wt.branch = ref.replace(/^refs\/heads\//, "");
      } else if (line === "detached") wt.detached = true;
      else if (line === "bare") wt.bare = true;
    }
    if (wt.path) worktrees.push(wt);
  }
  return worktrees;
}

function inspect(wt, today) {
  if (wt.bare) return { wt, kind: "skip", reason: "bare" };

  const status = git(wt.path, "status", "--porcelain");
  const uncommittedCount = status ? status.split(/\r?\n/).filter(Boolean).length : 0;

  // Unpushed commits: only meaningful if the branch has an upstream.
  let unpushedCount = 0;
  let upstreamState = "unknown";
  const upstream = git(wt.path, "rev-parse", "--abbrev-ref", "@{u}");
  if (upstream) {
    upstreamState = "tracked";
    const unpushed = git(wt.path, "log", "@{u}..HEAD", "--format=%H");
    unpushedCount = unpushed ? unpushed.split(/\r?\n/).filter(Boolean).length : 0;
  } else {
    upstreamState = wt.detached ? "detached" : "no-upstream";
  }

  // Last commit date (YYYY-MM-DD local) — proxy for "is this worktree from today?"
  const lastCommitIso = git(wt.path, "log", "-1", "--format=%cs"); // %cs = short ISO date
  const hasDirty = uncommittedCount > 0 || unpushedCount > 0;
  let kind = "clean";
  let reason = "";

  if (!hasDirty) {
    kind = "clean";
  } else if (!lastCommitIso) {
    // No commits yet — likely a brand-new working session; not stale per definition.
    kind = "current";
    reason = "no-commits-yet";
  } else if (lastCommitIso < today) {
    kind = "stale";
    reason = `last commit ${lastCommitIso} < today ${today}`;
  } else {
    kind = "current";
    reason = "activity today";
  }

  return {
    wt,
    kind,
    reason,
    uncommittedCount,
    unpushedCount,
    upstreamState,
    lastCommitIso,
  };
}

function main() {
  const root = git(process.cwd(), "rev-parse", "--show-toplevel") || process.cwd();
  const porcelain = git(root, "worktree", "list", "--porcelain");
  if (!porcelain) {
    if (asJson) console.log(JSON.stringify({ ok: false, error: "not a git repo or no worktrees" }));
    else console.log("✗ session-hygiene-scan: not a git repo (or no worktrees found).");
    process.exit(1);
  }
  const today = todayLocalISODate();
  const worktrees = parseWorktreeList(porcelain);
  const results = worktrees.map((wt) => inspect(wt, today));

  if (asJson) {
    const summary = {
      today,
      total: results.length,
      stale: results.filter((r) => r.kind === "stale").length,
      current: results.filter((r) => r.kind === "current").length,
      clean: results.filter((r) => r.kind === "clean").length,
      results,
    };
    console.log(JSON.stringify(summary, null, 2));
  } else {
    console.log(`\nsession-hygiene-scan (CANON-MULTI-AGENT-ORCHESTRATION §2.2)`);
    console.log(`today: ${today}  ·  worktrees: ${results.length}\n`);
    for (const r of results) {
      const mark = r.kind === "stale" ? "✗" : r.kind === "current" ? "·" : r.kind === "skip" ? "–" : "✓";
      const label = r.wt.branch || (r.wt.detached ? "(detached)" : "(no branch)");
      const detail =
        r.kind === "stale"
          ? `STALE — uncommitted=${r.uncommittedCount}, unpushed=${r.unpushedCount}, ${r.reason}`
          : r.kind === "current"
            ? `current — uncommitted=${r.uncommittedCount}, unpushed=${r.unpushedCount} (${r.reason})`
            : r.kind === "skip"
              ? `skip (${r.reason})`
              : `clean`;
      console.log(`  ${mark} ${r.wt.path}  [${label}]  ${detail}`);
    }
    console.log("");
    const stale = results.filter((r) => r.kind === "stale");
    if (stale.length === 0) {
      console.log("GREEN — no stale WIP. (Same-day WIP is allowed; close it in PUSHED / READY-PR / DISCARDED before ending the session — canon §2.2.)\n");
      process.exit(0);
    } else {
      console.log(`RED — ${stale.length} worktree(s) with stale WIP. Rescue, push, or discard them before continuing. The scan does not mutate.\n`);
      process.exit(1);
    }
  }
}

main();
