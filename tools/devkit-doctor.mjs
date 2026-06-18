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
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const KIT_TOOLS = dirname(fileURLToPath(import.meta.url));
const CWD = process.cwd();
const argv = process.argv.slice(2);
const VERBOSE = argv.includes("--verbose") || argv.includes("-v");
const JSON_OUT = argv.includes("--json");
const ADOPTION = argv.includes("--adoption");

const ESC = String.fromCharCode(27); // ANSI escape; built via fromCharCode so no control char sits in a regex literal
const stripAnsi = (s) => s.replace(new RegExp(`${ESC}\\[[0-9;]*m`, "g"), "");
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
    targets: [
      "doc/DEV_KIT_INHERITANCE_STATUS.md",
      "docs/DEV_KIT_INHERITANCE_STATUS.md",
      "DEV_KIT_INHERITANCE_STATUS.md",
    ],
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
  {
    label: "app/package versioning",
    engine: "check-versioning.mjs",
    targets: ["tools/versioning.config.json"],
    fix: "a declared app/package model has no live version source (the frozen-version trap) — wire it, or set the model null for a conscious N-A",
  },
  {
    label: "feature documentation",
    engine: "check-feature-docs.mjs",
    targets: ["tools/feature-docs.config.json"],
    fix: "a declared unit is missing a required artifact (requirements/plan/roadmap/log/changelog) — add it, or set the section null for a conscious N-A",
  },
  {
    label: "port assignment",
    engine: "check-ports.mjs",
    targets: ["tools/ports.config.json"],
    fix: "a repo that deploys carries no canonical port declaration (fail-closed refusal), or the recommended form shares a port — declare your ports (CANON-PORT-ASSIGNMENT-001 §3), or set deploys:false for a conscious N-A",
  },
  {
    label: "identifier language",
    engine: "check-identifier-language.mjs",
    targets: ["tools/identifier-language.config.json"],
    fix: "an identifier token (schema / route slug / feature dir) is not in the declared vocabulary — rename the leak or admit the term (CANON-NAMING-CONVENTIONS-001 §8, surface-complete §8.6); or remove the config for a conscious N-A",
  },
];

function firstExisting(paths) {
  for (const p of paths) if (existsSync(join(CWD, p))) return p;
  return null;
}

// ── Adoption lens (`--adoption`) ──────────────────────────────────────────────
// A SECOND lens, distinct from the gate-health board: an INVENTORY of what this
// repo has adopted from the kit. doctor (default) answers "are my gates green?";
// --adoption answers "what do I have / use?". Data comes from sources that already
// exist (no new source of truth): the kit's catalog (the roster of pieces), this
// repo's DEV_KIT_INHERITANCE_STATUS.md (what it declared), the kit's
// external-tools.lock.json (the default tools), and the gate configs present here.
function readMaybe(p) {
  try {
    return readFileSync(p, "utf8");
  } catch {
    return null;
  }
}

function runAdoption() {
  const KIT_ROOT = dirname(KIT_TOOLS);
  // 1. The roster of pieces, from the kit's catalog (`### N — Title`).
  const catalogText = readMaybe(join(KIT_ROOT, "setup", "ADOPT-DEV-KIT.md")) || "";
  const roster = [];
  for (const line of catalogText.split(/\r?\n/)) {
    const m = /^###\s+(\d+)\s+[—-]\s+(.+?)\s*$/.exec(line);
    if (m) roster.push({ n: Number(m[1]), title: m[2] });
  }

  // 2. This repo's declared adoption, from its status doc (if any).
  const statusRel = firstExisting([
    "doc/DEV_KIT_INHERITANCE_STATUS.md",
    "docs/DEV_KIT_INHERITANCE_STATUS.md",
    "DEV_KIT_INHERITANCE_STATUS.md",
  ]);
  const statusText = statusRel ? readMaybe(join(CWD, statusRel)) : null;
  const STATUS_KW =
    /\b(WIRED-CI|WIRED-HOOK|WIRED-SCRIPT|DECLARED-ONLY|ADOPTED-NATIVE|PENDING|N-A)\b/;
  const buckets = { wired: 0, declared: 0, na: 0, pending: 0, rows: 0 };
  if (statusText) {
    for (const line of statusText.split(/\r?\n/)) {
      if (!line.trim().startsWith("|")) continue;
      const claim = (line.match(STATUS_KW) || [])[1];
      if (!claim) continue;
      buckets.rows++;
      if (claim === "DECLARED-ONLY") buckets.declared++;
      else if (claim === "N-A") buckets.na++;
      else if (claim === "PENDING") buckets.pending++;
      else buckets.wired++; // WIRED-* / ADOPTED-NATIVE
    }
  }

  // 3. The kit's default external tools + a best-effort presence probe.
  const lock = JSON.parse(readMaybe(join(KIT_ROOT, "setup", "external-tools.lock.json")) || "{}");
  const tools = (lock.tools || []).map((t) => {
    let present = null;
    try {
      const r = spawnSync(t.cli, ["--version"], {
        encoding: "utf8",
        timeout: 4000,
        stdio: ["ignore", "pipe", "ignore"],
      });
      const out = (r.stdout || "").trim().split(/\r?\n/)[0];
      if ((r.status === 0 || out) && !r.error) present = out ? out.slice(0, 40) : "present";
    } catch {
      /* not on PATH → present stays null */
    }
    return { name: t.name, cli: t.cli, pin: t.pin, class: t.class, present };
  });

  // 4. Gates wired here (reuses the gate-config detection — health is the doctor's job).
  const gatesWired = GATES.filter((g) => firstExisting(g.targets)).length;

  const isUpstream = !statusText && CWD === KIT_ROOT;
  const result = {
    repo: basename(CWD),
    role: isUpstream
      ? "upstream (the kit itself)"
      : statusText
        ? "consumer"
        : "no adoption declared",
    pieces: { catalog: roster.length, ...buckets },
    tools: tools.map(({ cli, ...t }) => t),
    gatesWired: `${gatesWired}/${GATES.length}`,
  };

  if (JSON_OUT) {
    console.log(JSON.stringify(result, null, 2));
    return 0;
  }

  const out = [];
  out.push("");
  out.push(`  Dev-Kit Adoption · ${result.repo}`);
  out.push(`  ${"─".repeat(50)}`);
  if (isUpstream) {
    out.push(`  📦 UPSTREAM — the kit itself · ${roster.length} pieces in the catalog`);
    out.push(
      "     (a consumer's board reads its DEV_KIT_INHERITANCE_STATUS.md; the kit is the source)"
    );
  } else if (statusText) {
    out.push(
      `  ✅ CONSUMER — ${buckets.wired} wired · ${buckets.declared} declared-only · ${buckets.na} N-A · ${buckets.pending} pending  (of ${roster.length} in catalog)`
    );
  } else {
    out.push(`  ◌ NO ADOPTION DECLARED — no DEV_KIT_INHERITANCE_STATUS.md here`);
    out.push(
      `     (the catalog has ${roster.length} pieces available; add a status doc to declare adoption)`
    );
  }
  out.push("");
  out.push(`  Tools (kit defaults · ${"external-tools.lock.json"})`);
  if (tools.length === 0) out.push("    (none registered)");
  for (const t of tools) {
    const mark = t.present ? "✓" : "✗";
    const detail = t.present ? `present (${t.present})` : `not on PATH — pinned ${t.pin}`;
    out.push(`    ${mark} ${t.name.padEnd(12)} [${t.class}]  ${detail}`);
  }
  out.push("");
  out.push(`  Gates wired here   ${result.gatesWired}   (run \`devkit-doctor\` for their health)`);
  if (statusText && buckets.declared > 0) {
    out.push("");
    out.push(
      `  ${buckets.declared} piece(s) DECLARED-ONLY — declared but not yet wired to a mechanism.`
    );
  }
  out.push("");
  console.log(out.join("\n"));
  return 0;
}

if (ADOPTION) process.exit(runAdoption());

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
  `  ${ok ? "✅ GREEN" : "❌ RED"} — ${passed.length}/${ran.length} gates pass${failed.length ? `, ${failed.length} to fix` : ", nothing to fix"}`
);
out.push("");
for (const r of ran) {
  const mark = r.status === "pass" ? "✓" : "✗";
  out.push(`    ${mark} ${r.label.padEnd(32)} ${r.essence}`);
  if (r.status === "fail") out.push(`        fix → ${r.fix}`);
}
out.push("");
if (failed.length) {
  out.push(
    `  ${failed.length} gate${failed.length > 1 ? "s" : ""} need attention — re-run with --verbose to see exactly what.`
  );
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
