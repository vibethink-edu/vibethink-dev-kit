#!/usr/bin/env node
/**
 * devkit-doctor — the one-screen health board for a repo's dev-kit inheritance.
 *
 * Human view: VERDICT first, one line per gate, the exact fix for any red.
 * Everything controlled underneath: `--verbose` streams each engine's full output.
 * The problem this solves: the individual gates are honest but VERBOSE — a wall of
 * ✓/◆ lines where a human has to hunt for the one thing that matters. This is the
 * plain decision layer on top (compass: outcome first, depth on demand).
 *
 * Runs FROM the kit (the check-*.mjs engines are its siblings); cwd = the repo under
 * check. Works both in the kit itself (producer self-check) and in any consuming repo
 * — each gate runs only if its config/target exists in the cwd, else it is SKIPPED
 * (a skip never fails the board; it is reported, never silent).
 *
 * Usage:
 *   node <kit>/tools/devkit-doctor.mjs            # the simple board
 *   node <kit>/tools/devkit-doctor.mjs --verbose  # + each engine's full output
 *   node <kit>/tools/devkit-doctor.mjs --json     # machine-readable (CI)
 *
 * Exit: 0 = every gate that ran passed · 1 = a gate failed. Skips never fail.
 * Pure Node, zero deps.
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const KIT_TOOLS = dirname(fileURLToPath(import.meta.url));
const CWD = process.cwd();
const argv = process.argv.slice(2);
const VERBOSE = argv.includes("--verbose") || argv.includes("-v");
const JSON_OUT = argv.includes("--json");

const stripAnsi = (s) => s.replace(/\x1b\[[0-9;]*m/g, "");
const cap = (s, n) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

// Each gate: the engine, candidate target paths (first existing wins — config file
// or, for the claims gate, the status doc), a human label, and the one-line fix
// shown when it is red. Add a gate here when a new check-*.mjs ships.
const GATES = [
  {
    label: "cross-agent layering",
    engine: "check-agent-context.mjs",
    targets: ["tools/agent-context.config.json"],
    fix: "a root-rules file drifted or an adapter points elsewhere — --verbose names it",
  },
  {
    label: "copy-parity (copied runnables)",
    engine: "check-copy-parity.mjs",
    targets: ["tools/copy-parity.config.json"],
    fix: "re-copy the flagged file from the kit, then re-run (a copy drifted from source)",
  },
  {
    label: "catalog ↔ spines",
    engine: "check-catalog-sync.mjs",
    targets: ["tools/catalog-sync.config.json"],
    fix: "a new canon has no catalog piece, or a Status header is off-vocabulary — add it or exempt it",
  },
  {
    label: "adoption claims honest",
    engine: "check-inheritance-claims.mjs",
    targets: ["docs/DEV_KIT_INHERITANCE_STATUS.md", "DEV_KIT_INHERITANCE_STATUS.md"],
    fix: "a status-doc row is vague or cites a mechanism that does not exist",
  },
  {
    label: "no tenant contamination",
    engine: "check-tenant-contamination.mjs",
    targets: ["tools/tenant-contamination.config.json"],
    fix: "a tenant/product name leaked into a neutral core file — --verbose names file:line",
  },
  {
    label: "governance instruments",
    engine: "check-governance.mjs",
    targets: ["tools/governance.config.json"],
    fix: "a declared instrument (mirror/log/register) or the decision-class binding is missing/empty — create it, or set it null for a conscious N-A",
  },
  {
    label: "canon cross-references",
    engine: "check-canon-links.mjs",
    targets: ["knowledge"],
    fix: "a markdown link points at a missing file, or a 'Piece #N' has no such catalog piece — --verbose names it",
  },
  {
    label: "tool versions",
    engine: "check-tool-versions.mjs",
    targets: ["tools/versions.json"],
    fix: "a wired tool has no version in tools/versions.json (or a stale/malformed entry) — add or fix it",
  },
];

function firstExisting(paths) {
  for (const p of paths) if (existsSync(join(CWD, p))) return p;
  return null;
}

function summarize(out) {
  const lines = stripAnsi(out)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  // Prefer the engine's final GREEN/RED verdict line; fall back to the last line.
  const verdict = [...lines].reverse().find((l) => /\b(GREEN|RED)\b/.test(l));
  const line = verdict || lines[lines.length - 1] || "(no output)";
  return cap(line.replace(/^\W*(GREEN|RED)\b\s*[—:-]?\s*/i, "").trim() || line, 64);
}

const results = [];
for (const g of GATES) {
  const target = firstExisting(g.targets);
  if (!target) {
    results.push({ label: g.label, status: "skip", reason: "no config/target in this repo" });
    continue;
  }
  const enginePath = join(KIT_TOOLS, g.engine);
  if (!existsSync(enginePath)) {
    results.push({ label: g.label, status: "skip", reason: "engine missing at the kit mount" });
    continue;
  }
  let out = "";
  let code = 0;
  try {
    out = execFileSync("node", [enginePath, target], {
      cwd: CWD,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (err) {
    code = err.status ?? 1;
    out = `${err.stdout ?? ""}${err.stderr ?? ""}`;
  }
  results.push({
    label: g.label,
    status: code === 0 ? "pass" : "fail",
    essence: summarize(out),
    fix: g.fix,
    raw: out,
  });
}

const ran = results.filter((r) => r.status !== "skip");
const failed = ran.filter((r) => r.status === "fail");
const passed = ran.filter((r) => r.status === "pass");
const skipped = results.filter((r) => r.status === "skip");
const ok = failed.length === 0;

if (JSON_OUT) {
  console.log(
    JSON.stringify(
      {
        verdict: ok ? "GREEN" : "RED",
        passed: passed.length,
        failed: failed.length,
        ran: ran.length,
        gates: results.map(({ raw, ...r }) => r),
      },
      null,
      2
    )
  );
  process.exit(ok ? 0 : 1);
}

const out = [];
out.push("");
out.push(`  Dev-Kit Doctor · ${basename(CWD)}`);
out.push(`  ${"─".repeat(50)}`);
out.push(
  `  ${ok ? "✅ GREEN" : "❌ RED"} — ${passed.length}/${ran.length} gates pass` +
    (failed.length ? `, ${failed.length} to fix` : ", nothing to fix")
);
out.push("");
for (const r of ran) {
  const mark = r.status === "pass" ? "✓" : "✗";
  out.push(`    ${mark} ${r.label.padEnd(32)} ${r.essence}`);
  if (r.status === "fail") out.push(`        fix → ${r.fix}`);
}
out.push("");
if (failed.length) {
  out.push(`  ${failed.length} gate${failed.length > 1 ? "s" : ""} need attention — re-run with --verbose to see exactly what.`);
} else {
  out.push(`  All clear.${VERBOSE ? "" : " Run with --verbose for the full per-gate output."}`);
}
if (skipped.length) {
  out.push(`  skipped (no config here): ${skipped.map((s) => s.label).join(" · ")}`);
}
out.push("");
console.log(out.join("\n"));

if (VERBOSE) {
  for (const r of results) {
    if (r.status === "skip") {
      console.log(`\n── ${r.label} · skipped (${r.reason}) ──`);
      continue;
    }
    console.log(`\n── ${r.label} · ${r.status.toUpperCase()} ──`);
    console.log((r.raw || "").trimEnd());
  }
}

process.exit(ok ? 0 : 1);
