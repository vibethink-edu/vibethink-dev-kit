#!/usr/bin/env node
/**
 * inbox — a read-only view over the shared comms channel (orchestration canon).
 *
 * NOT a new protocol or store: it reads the same comm files the channel already
 * holds and filters them for one recipient. The channel is the truth; this is a
 * surface. See CANON-MULTI-AGENT-ORCHESTRATION.md.
 *
 * Usage:
 *   node tools/inbox.mjs <recipient> [--lane <dir>] [--json]
 *     recipient: an agent token (claude|codex|gemini|...) or "human"
 *     --lane:   directory of comm files (default: from inbox.config.json or
 *               docs/ai-coordination/comms)
 *     --json:   machine output instead of the table
 *
 * Routing model (front-matter fields the channel carries):
 *   to_agent: <token> | any     — who the message is for
 *   status:   open | closed     — missing = open
 *   needs:    human             — present when a judgment gate is reached
 *   from, priority, re, date    — context (prose ok)
 *
 * An agent's inbox = messages where to_agent is itself (or "any") and open.
 * The human's inbox = messages where needs == "human" and open.
 *
 * Pure Node, no deps. Core logic is exported for unit testing.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Parse a leading `--- ... ---` YAML-ish front-matter block into a flat object. */
export function parseFrontMatter(text) {
  const m = /^---\n([\s\S]*?)\n---/.exec(text);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i === -1) continue;
    const key = line.slice(0, i).trim();
    let val = line.slice(i + 1).trim();
    if (!key) continue;
    val = val.replace(/^["']|["']$/g, "");
    if (val.startsWith("#"))
      val = ""; // a bare comment, no value
    else val = val.replace(/\s+#.*$/, ""); // strip trailing inline comment
    out[key] = val.trim();
  }
  return out;
}

const PRIORITY_RANK = { critical: 0, urgent: 0, high: 1, medium: 2, normal: 2, low: 3 };

/** Is this parsed message open? Missing status counts as open. */
export function isOpen(fm) {
  return String(fm.status ?? "open").toLowerCase() !== "closed";
}

/** Does message `fm` belong in `recipient`'s inbox? */
export function matchesInbox(fm, recipient) {
  if (!isOpen(fm)) return false;
  const r = recipient.toLowerCase();
  if (r === "human") return String(fm.needs ?? "").toLowerCase() === "human";
  const to = String(fm.to_agent ?? "").toLowerCase();
  return to === r || to === "any";
}

/** Read + filter a lane directory into the inbox items for `recipient`. */
export function collectInbox(laneDir, recipient) {
  let files;
  try {
    files = fs.readdirSync(laneDir).filter((f) => f.endsWith(".md"));
  } catch {
    return [];
  }
  const items = [];
  for (const file of files) {
    let fm;
    try {
      fm = parseFrontMatter(fs.readFileSync(path.join(laneDir, file), "utf8"));
    } catch {
      continue;
    }
    if (!matchesInbox(fm, recipient)) continue;
    items.push({
      file,
      from: fm.from ?? "?",
      priority: fm.priority ?? "normal",
      date: fm.date ?? "",
      needs: fm.needs ?? "",
      title: fm.re ?? file.replace(/\.md$/, ""),
    });
  }
  items.sort((a, b) => {
    const pr =
      (PRIORITY_RANK[a.priority?.toLowerCase()] ?? 2) -
      (PRIORITY_RANK[b.priority?.toLowerCase()] ?? 2);
    if (pr !== 0) return pr;
    return String(b.date).localeCompare(String(a.date)); // newest first
  });
  return items;
}

// ── CLI ──────────────────────────────────────────────────────────────────────
function isMain() {
  return process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

if (isMain()) {
  const args = process.argv.slice(2);
  const recipient = args.find((a) => !a.startsWith("--"));
  const laneArg = args.includes("--lane") ? args[args.indexOf("--lane") + 1] : null;
  const asJson = args.includes("--json");

  if (!recipient) {
    console.error("usage: node tools/inbox.mjs <recipient> [--lane <dir>] [--json]");
    process.exit(2);
  }

  let laneDir = laneArg;
  if (!laneDir) {
    const cfgPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "inbox.config.json");
    try {
      laneDir = JSON.parse(fs.readFileSync(cfgPath, "utf8")).lanePath;
    } catch {
      laneDir = "docs/ai-coordination/comms";
    }
  }

  const items = collectInbox(laneDir, recipient);
  if (asJson) {
    console.log(JSON.stringify(items, null, 2));
    process.exit(0);
  }
  console.log(`\ninbox: ${recipient}  ·  lane: ${laneDir}  ·  ${items.length} open\n`);
  if (items.length === 0) {
    console.log("  (empty)\n");
    process.exit(0);
  }
  for (const it of items) {
    const tag = it.needs === "human" ? "[needs:human] " : "";
    console.log(`  • ${it.priority.padEnd(8)} ${it.date.padEnd(10)} ${tag}${it.title}`);
    console.log(`    from ${it.from} — ${it.file}`);
  }
  console.log("");
  process.exit(0);
}
