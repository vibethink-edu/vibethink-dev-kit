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
import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { detectExternalTools, formatExternalToolsHuman } from "./external-tools-health.mjs";

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
    fix: "a declared app/package model has no live version source, or the mandatory Versioning Impact gate vocabulary is missing — wire it, or set artifact models null for a conscious N-A",
  },
  {
    label: "feature documentation",
    engine: "check-feature-docs.mjs",
    targets: ["tools/feature-docs.config.json"],
    fix: "a declared unit is missing a required artifact (requirements/plan/roadmap/log/changelog) — add it, or set the section null for a conscious N-A",
  },
  {
    label: "knowledge packs",
    engine: "check-knowledge-pack.mjs",
    targets: ["tools/knowledge-pack.config.json"],
    fix: "a Knowledge Pack is structurally incomplete, the Knowledge Memory Adapter is undeclared, or a product-shaping/complex feature lacks a retrieved+cited Accepted Knowledge Baseline — add/validate the pack, declare the adapter, or mark the feature N-A",
  },
  {
    label: "KDD memory freshness",
    engine: "check-knowledge-memory-freshness.mjs",
    targets: ["tools/knowledge-memory.config.json"],
    fix: "accepted knowledge changed or a declared memory/graph index is missing/stale — refresh Graphify/Engram/other declared indexes, then run kdd-refresh to update the manifest",
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
  {
    label: "gate integrity",
    engine: "check-gate-integrity.mjs",
    targets: ["tools/gate-integrity.config.json"],
    fix: "a gate ships with no test, or a test that only checks the happy path — it has never been shown to go RED, so it is false assurance (CANON-AUDIT-PROTOCOL §8.7a); add a known-bad case that asserts the gate fails; or remove the config for a conscious N-A",
  },
  {
    label: "coder launch readiness",
    engine: "check-coder-launch-readiness.mjs",
    targets: ["tools/coder-launch-readiness.config.json"],
    fix: "the coder launch-surface is incomplete (missing launch script / per-session settings / declared bot-token env-var) — an agent cannot self-verify readiness, so it falls to the human (CANON-CHANGE-PATH-AND-DECISION-CLASSES-001 §3.1, F2); stand the surface up (RUNBOOK-LAUNCH-CODERS §1–§3); or remove the config for a conscious N-A (a repo that does not launch coders)",
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

const REQUIRED_BRAIN_SECTIONS = [
  { id: "dev-tooling-baseline", label: "Dev Tooling Baseline", pattern: /Dev Tooling Baseline/i },
  { id: "no-brain-no-work", label: "NO BRAIN, NO WORK", pattern: /NO BRAIN,\s*NO WORK/i },
  { id: "duty-to-flag", label: "Duty to Flag", pattern: /Duty to Flag/i },
  { id: "inheritance-layering", label: "inheritance/layering", pattern: /Inheritance Model|Cross-Agent Context Layering/i },
  {
    id: "tool-availability-reporting",
    label: "tool availability/reporting",
    pattern: /tool availability|never silent|RED\/WARN|loud fallback/i,
  },
];

function detectInheritedBrain() {
  const KIT_ROOT = dirname(KIT_TOOLS);
  const universalPath = join(KIT_ROOT, "knowledge", "ai-agents", "AGENTS_UNIVERSAL.md");
  const layeringPath = join(
    KIT_ROOT,
    "knowledge",
    "ai-agents",
    "CANON-CROSS-AGENT-CONTEXT-LAYERING.md"
  );
  const rootAgentsPath = join(CWD, "AGENTS.md");
  const universal = readMaybe(universalPath);
  const layering = readMaybe(layeringPath);
  const rootAgents = readMaybe(rootAgentsPath);

  const checks = [];
  const remediation = [];

  checks.push({
    id: "universal-rulebook",
    status: universal ? "ok" : "error",
    path: universalPath,
    message: universal
      ? "inherited universal rulebook reachable"
      : "inherited universal rulebook missing or inaccessible",
  });
  if (!universal) {
    remediation.push(
      "mount or clone the dev-kit so knowledge/ai-agents/AGENTS_UNIVERSAL.md is readable; then restart the session"
    );
  }

  checks.push({
    id: "layering-canon",
    status: layering ? "ok" : "error",
    path: layeringPath,
    message: layering
      ? "cross-agent layering canon reachable"
      : "cross-agent layering canon missing or inaccessible",
  });
  if (!layering) {
    remediation.push(
      "restore knowledge/ai-agents/CANON-CROSS-AGENT-CONTEXT-LAYERING.md in the dev-kit mount"
    );
  }

  if (CWD === KIT_ROOT && !rootAgents) {
    checks.push({
      id: "root-agents",
      status: "ok",
      path: rootAgentsPath,
      message: "upstream kit checkout; heir root AGENTS.md is not expected here",
    });
  } else if (rootAgents) {
    const pointsToUniversal = /AGENTS_UNIVERSAL\.md|inherits? the dev-kit|inherited generic/i.test(
      rootAgents
    );
    checks.push({
      id: "root-agents",
      status: pointsToUniversal ? "ok" : "warn",
      path: rootAgentsPath,
      message: pointsToUniversal
        ? "root AGENTS.md is reachable and points to inherited authority"
        : "root AGENTS.md is reachable but does not clearly point to AGENTS_UNIVERSAL.md",
    });
    if (!pointsToUniversal) {
      remediation.push(
        "add an explicit AGENTS_UNIVERSAL.md inheritance pointer to the repo root AGENTS.md"
      );
    }
  } else {
    checks.push({
      id: "root-agents",
      status: "warn",
      path: rootAgentsPath,
      message: "repo root AGENTS.md missing; agent cannot start from the local root rulebook",
    });
    remediation.push(
      "create repo root AGENTS.md from setup/templates/heir-bootstrap/AGENTS.md and point it to AGENTS_UNIVERSAL.md"
    );
  }

  const requiredSections = REQUIRED_BRAIN_SECTIONS.map((section) => ({
    ...section,
    present: Boolean(universal && section.pattern.test(universal)),
  }));
  for (const section of requiredSections) {
    checks.push({
      id: section.id,
      status: section.present ? "ok" : "error",
      message: section.present
        ? `${section.label} section findable`
        : `${section.label} section missing from inherited rulebook`,
    });
  }
  const missingSections = requiredSections.filter((s) => !s.present);
  if (missingSections.length) {
    remediation.push(
      `restore or repair required inherited sections: ${missingSections.map((s) => s.label).join(", ")}`
    );
  }

  const status = checks.some((c) => c.status === "error")
    ? "RED"
    : checks.some((c) => c.status === "warn")
      ? "WARN"
      : "OK";

  return {
    status,
    blocking: false,
    summary:
      status === "OK"
        ? "inherited rulebook reachable"
        : "inherited brain degraded; missing brain is louder than missing dev tools",
    checks,
    requiredSections: requiredSections.map(({ pattern, ...s }) => s),
    remediation,
  };
}

function formatInheritedBrainHuman(brain) {
  const mark = brain.status === "OK" ? "✓" : brain.status === "WARN" ? "⚠" : "✗";
  const lines = [`${mark} inherited brain: ${brain.status} — ${brain.summary}`];
  if (brain.status !== "OK") {
    lines.push("  Size limit is not a skip: use focused reads/search before claiming unavailable.");
  }
  for (const c of brain.checks) {
    if (c.status === "ok") continue;
    const cmark = c.status === "warn" ? "⚠" : "✗";
    lines.push(`  ${cmark} ${c.message}`);
    if (c.path) lines.push(`      path: ${c.path}`);
  }
  for (const fix of brain.remediation) lines.push(`  fix: ${fix}`);
  return lines.join("\n");
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

  // 3. The kit's default external tools + the same health probe doctor uses.
  const external = detectExternalTools({ cwd: CWD });
  const tools = external.tools.map((t) => ({
    name: t.name,
    pin: t.pin,
    class: t.class,
    state: t.state,
    severity: t.severity,
    present: t.severity === "ok" ? `${t.cli} ${t.version || ""}`.trim() : null,
  }));

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
    externalToolsStatus: external.status,
    tools,
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
  out.push(`  Tools (kit defaults · ${"external-tools.lock.json"} · health ${external.status})`);
  if (tools.length === 0) out.push("    (none registered)");
  for (const t of tools) {
    const mark = t.severity === "ok" ? "✓" : t.severity === "warn" ? "⚠" : "✗";
    const detail = t.present ? `present (${t.present})` : `${t.state} — pinned ${t.pin}`;
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
const externalTools = detectExternalTools({ cwd: CWD });
const inheritedBrain = detectInheritedBrain();
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
        externalTools,
        inheritedBrain,
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
  `  ${ok ? "✅ GREEN" : "❌ RED"} — ${passed.length}/${ran.length} gates pass${failed.length ? `, ${failed.length} to fix` : ", nothing to fix"} · external tools ${externalTools.status} · inherited brain ${inheritedBrain.status}`
);
out.push("");
out.push("  Inherited Brain");
for (const line of formatInheritedBrainHuman(inheritedBrain).split(/\r?\n/)) {
  out.push(`    ${line}`);
}
out.push("");
out.push("  External Tools");
for (const line of formatExternalToolsHuman(externalTools).split(/\r?\n/)) {
  out.push(`    ${line}`);
}
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
