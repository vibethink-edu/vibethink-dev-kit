#!/usr/bin/env node
/**
 * feed — a chronological, read-only view of the WHOLE comms channel.
 *
 * The companion of inbox.mjs: where inbox filters open messages for one
 * recipient, feed shows everything (open AND closed) newest-first — the "river"
 * a human watches ambiently to keep visibility without being the transport
 * (CANON-MULTI-AGENT-ORCHESTRATION §4). Not a new store: it reads the same
 * channel files. Pure Node, no deps. Reuses inbox's front-matter parser.
 *
 * Usage:
 *   node tools/feed.mjs [--lane <dir>] [--limit N] [--json]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeRecipient, parseCommMeta } from "./inbox.mjs";

/** Read a lane directory into a chronological (newest-first) activity feed. */
export function collectFeed(laneDir, { limit, agents } = {}) {
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
    // Use the SAME normalizer as inbox; fall back to the raw prose `to:` only for
    // display when no routable token exists (e.g. a message addressed to a human).
    items.push({
      file,
      date: fm.date ?? "",
      from: fm.from ?? "?",
      to: normalizeRecipient(fm, { agents }) || String(fm.to ?? "?"),
      status: String(fm.status ?? "open").toLowerCase(),
      needs: fm.needs ?? "",
      title: fm.re ?? file.replace(/\.md$/, ""),
    });
  }
  items.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  return typeof limit === "number" ? items.slice(0, limit) : items;
}

// ── CLI ──────────────────────────────────────────────────────────────────────
function isMain() {
  return process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

if (isMain()) {
  const args = process.argv.slice(2);
  const laneArg = args.includes("--lane") ? args[args.indexOf("--lane") + 1] : null;
  const limitArg = args.includes("--limit") ? Number(args[args.indexOf("--limit") + 1]) : undefined;
  const asJson = args.includes("--json");

  let laneDir = laneArg;
  let agents;
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

  const items = collectFeed(laneDir, { limit: limitArg, agents });
  if (asJson) {
    console.log(JSON.stringify(items, null, 2));
    process.exit(0);
  }
  console.log(`\nfeed  ·  lane: ${laneDir}  ·  ${items.length} message(s)\n`);
  for (const it of items) {
    const st = it.status === "closed" ? "closed" : "open  ";
    const tag = it.needs === "human" ? " [needs:human]" : "";
    console.log(
      `  ${it.date.padEnd(10)} ${st}  ${String(it.from).padEnd(14)} → ${String(it.to).padEnd(8)} ${it.title}${tag}`
    );
  }
  console.log("");
  process.exit(0);
}
