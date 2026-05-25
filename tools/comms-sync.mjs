#!/usr/bin/env node
/**
 * comms:sync — "traeme todo y mostrame qué tengo" for a multi-workstation operator.
 *
 * Dev-kit canonical source (inherited by consuming repos as a verbatim copy, per
 * ADR-20260524-supra-repo-inheritance-mechanism). One command for an operator who
 * works across machines (e.g. two workstations): it pulls origin, shows the inbox,
 * and — the point — WARNS if this machine has local work that has not left it yet
 * (committed-but-unpushed commits, or untracked/uncommitted comm files). That
 * removes the "did I remember to push from the other machine?" burden.
 *
 * It does NOT add a `workstation`/`host` field to comms: once a comm is pushed the
 * machine of origin is irrelevant (git is the bus), and `git log` already records
 * the committer for debugging. The real gap was visibility of *unpushed* local work
 * — which this surfaces.
 *
 * Usage: node tools/comms-sync.mjs <agent|human>
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TOOLS = dirname(fileURLToPath(import.meta.url));

function git(args) {
  try {
    // stderr ignored so expected failures (e.g. no upstream on a fresh branch) stay quiet.
    return execFileSync("git", args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

function resolveLane() {
  try {
    const cfg = JSON.parse(readFileSync(join(TOOLS, "inbox.config.json"), "utf8"));
    if (cfg.lanePath) return cfg.lanePath;
  } catch {
    /* default */
  }
  return "docs/ai-coordination/comms";
}

const recipient = process.argv.slice(2).find((a) => !a.startsWith("--")) || "human";
const lane = resolveLane();

// 1. PULL — bring origin into this machine.
console.log("⟳ comms:sync — pulling origin…");
try {
  execFileSync("git", ["pull", "--ff-only"], { encoding: "utf8", stdio: "pipe" });
  console.log("  ✓ up to date with origin\n");
} catch (err) {
  const first =
    String(err?.message ?? err)
      .split("\n")
      .find((l) => l.trim()) ?? "";
  console.log(
    `  ⚠ pull --ff-only failed (diverged or no upstream) — resolve manually:\n    ${first}\n`
  );
}

// 2. INBOX — show what this recipient has open.
try {
  process.stdout.write(
    execFileSync("node", [join(TOOLS, "inbox.mjs"), recipient], { encoding: "utf8" })
  );
} catch {
  console.log(`(could not read inbox for "${recipient}")`);
}

// 3. LOCAL-vs-ORIGIN — the point: warn about work that has not left this machine.
const branch = git(["branch", "--show-current"]) || "(detached)";
const ahead = git(["log", "--oneline", "@{u}..HEAD"]); // committed but unpushed
const dirtyComms = git(["status", "--porcelain", "--", lane]); // untracked/uncommitted in the lane

console.log("── sync status (this machine) ──");
let clean = true;
if (ahead) {
  clean = false;
  console.log(
    `  ⚠ ${ahead.split("\n").length} local commit(s) NOT pushed (branch ${branch}) → run: git push`
  );
}
if (dirtyComms) {
  clean = false;
  console.log("  ⚠ comm files not committed/pushed (live only on THIS machine):");
  for (const line of dirtyComms.split("\n")) console.log(`      ${line}`);
  console.log("    → send with comms:send (write + commit + push), not by hand.");
}
if (clean) console.log("  ✓ this machine is clean and in sync — nothing stuck locally.");
console.log("");
