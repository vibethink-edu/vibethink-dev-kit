#!/usr/bin/env node
/**
 * comms:sync — "traeme todo y mostrame qué tengo" for a multi-workstation operator.
 *
 * Dev-kit canonical source (inherited by consuming repos as a verbatim copy, per
 * ADR-20260524-supra-repo-inheritance-mechanism). One command for an operator who
 * works across machines / multiple per-repo agent chats. It:
 *   1. pulls origin into this machine;
 *   2. shows a FILTERED inbox — recency hard gate + top-N, so old/low-priority comms
 *      don't drown the current ones (priority is NOT a freshness signal);
 *   3. WARNS about (a) the wrong-chat guard (comms whose `repo` ≠ this session's repo)
 *      and (b) local work that hasn't left this machine (unpushed commits / untracked
 *      comm files).
 *
 * The recency/top-N filter lives here (consumer side); the inbox engine (inbox.mjs)
 * stays raw so it remains byte-identical across repos.
 *
 * Usage: node tools/comms-sync.mjs <agent|human> [--recency <days>] [--top <N>]
 */
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { collectInbox, matchesInbox, parseCommMeta } from "./inbox.mjs";

const TOOLS = dirname(fileURLToPath(import.meta.url));
const ARGV = process.argv.slice(2);

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

function flag(name, fallback) {
  const i = ARGV.indexOf(name);
  return i !== -1 && ARGV[i + 1] ? ARGV[i + 1] : fallback;
}

const cfg = readConfig();
const recipient = ARGV.find((a) => !a.startsWith("--")) || "human";
const lane = cfg.lanePath || "docs/ai-coordination/comms";
const root = git(["rev-parse", "--show-toplevel"]) || process.cwd();
const laneDir = join(root, lane);
const currentRepo = cfg.repo || basename(root);
const agents = Array.isArray(cfg.agents) && cfg.agents.length ? cfg.agents : undefined;
const RECENCY_DAYS = Number(flag("--recency", 21)) || 21;
const TOP_N = Number(flag("--top", 12)) || 12;

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

// 2. INBOX — recency hard gate + top-N (old / low-prio don't drown the current ones).
let items = [];
try {
  items = collectInbox(laneDir, recipient, agents ? { agents } : undefined);
} catch {
  /* lane missing */
}
const withinRecency = (d) => {
  if (!d) return false;
  const days = (Date.now() - Date.parse(`${d}T00:00:00Z`)) / 86400000;
  return Number.isFinite(days) && days >= 0 && days <= RECENCY_DAYS;
};
const recent = items.filter((it) => withinRecency(it.date));
const shown = recent.slice(0, TOP_N);
const hidden = items.length - shown.length;
const moreNote = hidden > 0 ? ` · +${hidden} older/low-prio hidden` : "";
console.log(
  `inbox: ${recipient} · ${shown.length} of ${items.length} (recency ${RECENCY_DAYS}d, top ${TOP_N})${moreNote}\n`
);
for (const it of shown) {
  const tag = it.needs === "human" ? "[needs:human] " : "";
  console.log(
    `  • ${String(it.priority).padEnd(8)} ${String(it.date).padEnd(10)} ${tag}${it.title}`
  );
  console.log(`    from ${it.from} — ${it.file}`);
}
console.log(shown.length === 0 ? "  (nothing recent)\n" : "");

// 2b. WRONG-CHAT GUARD — comms in THIS inbox whose `repo` ≠ the repo we're in.
const mismatched = [];
try {
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

// 3. SYNC STATUS — wrong-repo comms + work that hasn't left this machine.
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
    `    → you are in "${currentRepo}". If meant for another repo, act in THAT repo's chat.`
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
