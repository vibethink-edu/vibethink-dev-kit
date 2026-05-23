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
 *   to_agent: <token> | any     — canonical, machine-clean recipient token
 *   to:       <prose>           — human-readable recipient ("codex-dev",
 *                                 "claude-DKS-dev", "Codex (...)"); a known agent
 *                                 token is extracted from it when to_agent is absent
 *   status:   open | closed     — missing = open
 *   needs:    human             — present when a judgment gate is reached
 *   from, priority, re, date    — context (prose ok)
 *
 * `to_agent` is the canonical normalized field (a clean token). The prose `to:`
 * is the human label; routing falls back to extracting a known agent token from it
 * (and from a bold-label `**To**:` body header, which the real lane also uses)
 * only when `to_agent` is absent. inbox and feed share ONE normalizer so they can
 * never disagree on who a message is for.
 *
 * An agent's inbox = messages where the normalized recipient is itself (or "any")
 * and open. The human's inbox = messages where needs == "human" and open.
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

/**
 * Bold-label header fields the real lane uses when there is no YAML block
 * (`**From**: claude-arq`, `**To**: codex-dev`, Spanish `**De:**` / `**Para:**`).
 * Maps a lowercased label to the canonical field. YAML always wins over these.
 */
const BODY_LABELS = {
  from: "from",
  de: "from",
  autor: "from",
  author: "from",
  to: "to",
  para: "to",
  to_agent: "to_agent",
  date: "date",
  fecha: "date",
  re: "re",
  asunto: "re",
  subject: "re",
  priority: "priority",
  prioridad: "priority",
  needs: "needs",
  status: "status",
  estado: "status",
};
// `**Key**: value` or `**Key:** value` — colon may sit inside or outside the bold.
const BOLD_LABEL_RE = /^\s*\*\*\s*([^*:]+?)\s*:?\s*\*\*\s*:?\s*(.+?)\s*$/;

/**
 * Parse a comm file's routing metadata. Reads the YAML front-matter, then fills
 * any missing fields from bold-label header lines in the body's top region — the
 * shape most real comm files use (they predate the YAML convention). YAML wins.
 */
export function parseCommMeta(text) {
  const fm = parseFrontMatter(text);
  const body = text.replace(/^---\n[\s\S]*?\n---/, "");
  const lines = body.split("\n");
  for (let i = 0; i < lines.length && i < 40; i++) {
    const line = lines[i];
    if (i > 0 && line.trim() === "---") break; // end of the header region
    const m = BOLD_LABEL_RE.exec(line);
    if (!m) continue;
    const key = BODY_LABELS[m[1].trim().toLowerCase()];
    if (!key || fm[key]) continue; // unknown label, or YAML already set it
    fm[key] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return fm;
}

const PRIORITY_RANK = { critical: 0, urgent: 0, high: 1, medium: 2, normal: 2, low: 3 };

/** Default known agent tokens the router can extract from a prose recipient. */
export const KNOWN_AGENTS = ["claude", "codex", "gemini", "copilot", "windsurf", "cursor"];

/** Is this parsed message open? Missing status counts as open. */
export function isOpen(fm) {
  return String(fm.status ?? "open").toLowerCase() !== "closed";
}

/**
 * Normalize a recipient to a clean routing token. Precedence:
 *   1. explicit `to_agent` (already a clean token) — used verbatim;
 *   2. else best-effort: the first known agent token (or "any") found in the
 *      prose `to:` / `re:` ("codex-dev" → codex, "claude-DKS-dev" → claude).
 * Returns "" when nothing routable is present (e.g. `to: Marcelo (...)`).
 * Shared by inbox and feed so they never disagree on routing.
 */
export function normalizeRecipient(fm, { agents = KNOWN_AGENTS } = {}) {
  const explicit = String(fm.to_agent ?? "")
    .trim()
    .toLowerCase();
  if (explicit) return explicit;
  const prose = `${fm.to ?? ""} ${fm.re ?? ""}`.toLowerCase();
  if (!prose.trim()) return "";
  if (/\bany\b/.test(prose)) return "any";
  for (const a of agents) {
    if (new RegExp(`\\b${a}\\b`).test(prose)) return a;
  }
  return "";
}

/** Does message `fm` belong in `recipient`'s inbox? */
export function matchesInbox(fm, recipient, opts) {
  if (!isOpen(fm)) return false;
  const r = recipient.toLowerCase();
  if (r === "human") return String(fm.needs ?? "").toLowerCase() === "human";
  const to = normalizeRecipient(fm, opts);
  return to === r || to === "any";
}

/** Read + filter a lane directory into the inbox items for `recipient`. */
export function collectInbox(laneDir, recipient, opts) {
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
      fm = parseCommMeta(fs.readFileSync(path.join(laneDir, file), "utf8"));
    } catch {
      continue;
    }
    if (!matchesInbox(fm, recipient, opts)) continue;
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
  let agents = KNOWN_AGENTS;
  {
    const cfgPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "inbox.config.json");
    try {
      const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
      if (!laneDir && cfg.lanePath) laneDir = cfg.lanePath;
      if (Array.isArray(cfg.agents) && cfg.agents.length) agents = cfg.agents;
    } catch {
      /* no config — fall back to defaults */
    }
  }
  if (!laneDir) laneDir = "docs/ai-coordination/comms";

  const items = collectInbox(laneDir, recipient, { agents });
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
