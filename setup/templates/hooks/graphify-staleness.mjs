#!/usr/bin/env node
/**
 * graphify-staleness.mjs — SessionStart code-graph freshness nudge (TEMPLATE · agnostic).
 *
 * STATUS: SEALED 2026-06-27 (Principal Architect) — reference template for the operator-tooling
 * freshness standard (setup/EXTERNAL-TOOLS.md § Graphify · Freshness & activación).
 *
 * WHY: operator-tools get skipped when their artifact goes stale silently — an agent queries
 * the code graph, sees outdated code, concludes "useless", and stops using it. A passive
 * "reach for it" note is easy to skip. This is an ACTIVE nudge: at session start it detects a
 * stale root graph and redirects to the SCOPED pattern (graphify update <subdir>, ~seconds),
 * NOT a whole-repo rebuild (graphify update . measured >9 min, all-or-nothing, on a large repo).
 *
 * It never auto-rebuilds (expensive) — it only reminds + gives the scoped command. fs-only
 * (reads one mtime), always exits 0, never blocks session start.
 *
 * SAFETY: graphify runs LOCAL (no-LLM) by default. Do NOT set GEMINI_API_KEY / GOOGLE_API_KEY
 * for graphify unless you intend to send source code to an external LLM for semantic
 * extraction — that would exfiltrate proprietary code.
 *
 * Per-repo binding: STALE_DAYS and the example <subdir> in the message; everything else is
 * agnostic. Wire into .claude/settings.json under hooks.SessionStart (a "command" hook).
 */
import fs from "node:fs";
import path from "node:path";

const STALE_DAYS = 3;
const graph = path.join(process.cwd(), "graphify-out", "graph.json");

try {
  // No root graph → this repo does not use a root graph here; stay silent (no nag).
  if (!fs.existsSync(graph)) process.exit(0);

  const days = Math.floor((Date.now() - fs.statSync(graph).mtimeMs) / 86_400_000);
  if (days > STALE_DAYS) {
    console.log(
      `🕸️ graphify: the root code graph is ${days}d stale. Do NOT read/query it as current. To trace/audit an area, update first with \`graphify update <subdir>\` (~seconds) and query that fresh scoped graph. Do NOT rebuild the monorepo by default (\`graphify update .\` measured >9min on a large repo). Local by default — without GEMINI/GOOGLE_API_KEY no code leaves the machine.`
    );
  }
} catch (_) {
  // never block session start
}

process.exit(0);
