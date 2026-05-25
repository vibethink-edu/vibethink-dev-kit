#!/usr/bin/env node
/**
 * comms:sync — "traeme todo y mostrame qué tengo" for a multi-workstation operator.
 *
 * Dev-kit canonical source (inherited by consuming repos as a verbatim copy, per
 * ADR-20260524-supra-repo-inheritance-mechanism). One command for an operator who
 * works across machines / multiple per-repo agent chats: it pulls origin, shows the
 * inbox, and WARNS about (a) local work that has not left this machine
 * (committed-but-unpushed commits, or untracked/uncommitted comm files) and
 * (b) the **wrong-chat guard**: comms in this inbox whose `repo` ≠ the repo this
 * session is in (i.e. "you pasted a comm into the chat of the wrong repo").
 *
 * It does NOT add workstation/host metadata: once pushed the machine of origin is
 * irrelevant (git is the bus) and git log records the committer.
 *
 * Usage: node tools/comms-sync.mjs <agent|human>
 */
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { matchesInbox, parseCommMeta } from "./inbox.mjs";

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

function readConfig() {
  try {
    return JSON.parse(readFileSync(join(TOOLS, "inbox.config.json"), "utf8"));
  } catch {
    return {};
  }
}

const cfg = readConfig();
const recipient = process.argv.slice(2).find((a) => !a.startsWith("--")) || "human";
const lane = cfg.lanePath || "docs/ai-coordination/comms";
const root = git(["rev-parse", "--show-toplevel"]) || process.cwd();
const currentRepo = cfg.repo || basename(root);

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

// 2b. WRONG-CHAT GUARD — comms in THIS inbox whose `repo` ≠ the repo we're in.
const mismatched = [];
try {
  const laneDir = join(root, lane);
  for (const f of readdirSync(laneDir)) {
    if (!f.endsWith(".md")) continue;
    let fm;
    try {
      fm = parseCommMeta(readFileSync(join(laneDir, f), "utf8"));
    } catch {
      continue;
    }
    if (!matchesInbox(fm, recipient)) continue;
    if (fm.repo && currentRepo && fm.repo !== currentRepo) mismatched.push({ f, repo: fm.repo });
  }
} catch {
  /* lane dir missing — nothing to check */
}

// 3. SYNC STATUS — warn about work that hasn't left this machine + wrong-repo comms.
const branch = git(["branch", "--show-current"]) || "(detached)";
const ahead = git(["log", "--oneline", "@{u}..HEAD"]); // committed but unpushed
const dirtyComms = git(["status", "--porcelain", "--", lane]); // untracked/uncommitted in the lane

console.log(`── sync status · repo: ${currentRepo} ──`);
let clean = true;
if (mismatched.length) {
  clean = false;
  console.log(
    `  ⚠ ${mismatched.length} comm(s) in this inbox target a DIFFERENT repo (wrong chat?):`
  );
  for (const m of mismatched) console.log(`      [${m.repo}] ${m.f}`);
  console.log(
    `    → you are in "${currentRepo}". If it was meant for another repo, act in THAT repo's chat.`
  );
}
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
