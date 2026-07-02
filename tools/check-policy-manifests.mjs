#!/usr/bin/env node
/**
 * check-policy-manifests — makes REFERENCE-POLICY-MANIFESTS-001 bite: machine-readable
 * law stays a faithful PROJECTION of the sealed prose, never a second legislature.
 *
 * The manifests (knowledge/policy/*.policy.json) give agents and policy engines the
 * MUSTs/NEVERs of a canon without re-reading prose each session (roadmap item 2:
 * kills interpretation drift + the token cost of prose law). The drift risk is the
 * manifest itself: edited without the prose, citing sections that moved, claiming a
 * seal the prose does not carry, or naming a watching instrument that no longer
 * exists. This gate holds the projection honest. Per manifest:
 *
 *   1. shape        — required fields; level ∈ {MUST, NEVER}; rule ids unique;
 *                     every rule cites the prose section it derives from (a rule
 *                     with no § citation is new law, not a projection).
 *   2. source       — the canon file exists and its H1/title carries the id.
 *   3. status parity— the manifest's status token appears on the canon's
 *                     **Status:** line (a manifest cannot out-claim its prose).
 *   4. watch        — every rule declares its watching instrument: an existing
 *                     gate/golden-task file, or an explicit {kind:"none", note}
 *                     (unwatched is a conscious declaration, never an omission);
 *                     a golden-task watch must name a task id that exists in the
 *                     battery.
 *   5. coverage     — every canon listed in config.requireFor has a manifest
 *                     (the ratchet: coverage grows canon-by-canon, never slides
 *                     back); remaining sealed canons without one are REPORTED as
 *                     the open frontier, not failed.
 *   6. enforce      — an OPTIONAL per-rule `enforce` block (the policy engine's
 *                     food — CANON-RUNTIME-POLICY-ENGINE-001) must be well-formed:
 *                     point(s) in the canon's §2 range, verdict in the §3 range,
 *                     a match.pattern that compiles as a RegExp (with a capturing
 *                     group when captureNotInStateLabel is declared; a non-empty
 *                     label when unlessStateLabel declares a governed exemption).
 *                     Only MECHANICALLY-DECIDABLE rules carry enforce; judgment
 *                     rules stay watched by gates / golden tasks / review.
 *
 * Config (tools/policy-manifests.config.json):
 *   { "policyDir": "knowledge/policy",
 *     "canonRoots": ["knowledge/ai-agents", "knowledge/methodology", "knowledge/architecture"],
 *     "requireFor": ["knowledge/methodology/CANON-GIT-HYGIENE.md", ...] }
 *
 * Verdict-first. Exit: 0 = projection faithful · 1 = drift/malformed/coverage hole
 * · 2 = setup error (no config → the doctor skips; empty policyDir → a meta-gate
 * auditing nothing is false-green, §8.6). Pure Node, zero deps.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const configPath = process.argv[2] || "tools/policy-manifests.config.json";
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;

function die(code, msg) {
  console.log(msg);
  process.exit(code);
}

const absCfg = join(ROOT, configPath);
if (!existsSync(absCfg)) die(2, `RED — setup error: config not found at ${configPath}`);
let cfg;
try {
  cfg = JSON.parse(readFileSync(absCfg, "utf8"));
} catch (e) {
  die(2, `RED — setup error: config not valid JSON (${e.message})`);
}

const policyDir = cfg.policyDir || "knowledge/policy";
const canonRoots = Array.isArray(cfg.canonRoots) ? cfg.canonRoots : [];
const requireFor = Array.isArray(cfg.requireFor) ? cfg.requireFor : [];

const policyAbs = join(ROOT, policyDir);
if (!existsSync(policyAbs)) die(2, `RED — setup error: policyDir not found: ${policyDir}`);
const manifestFiles = readdirSync(policyAbs)
  .filter((f) => f.endsWith(".policy.json"))
  .sort();
if (manifestFiles.length === 0)
  die(
    2,
    `RED — setup error: no *.policy.json in ${policyDir} — a projection gate with nothing to audit is false-green (§8.6)`
  );

const LEVELS = new Set(["MUST", "NEVER"]);
const WATCH_KINDS = new Set(["gate", "golden-task", "none"]);
// The enforcement-point and verdict ranges mirror CANON-RUNTIME-POLICY-ENGINE-001
// §2/§3 — the SEALED canon is the source of these sets, not the engine code.
const ENFORCE_POINTS = new Set(["request", "pre-model", "tool-call", "tool-result"]);
const ENFORCE_VERDICTS = new Set(["ALLOW", "ASK", "DENY"]);
const problems = [];
const sourcesWithManifest = new Set();

// Battery task ids, for golden-task watch refs (lazy — only if some rule uses one).
let batteryTasks = null;
async function loadBattery() {
  if (batteryTasks) return batteryTasks;
  try {
    const { TASKS } = await import(new URL("./golden-tasks/battery.mjs", import.meta.url));
    batteryTasks = TASKS;
  } catch {
    batteryTasks = [];
  }
  return batteryTasks;
}

// A cited §N(.M) must anchor to real prose: a heading carrying that section number
// (with or without the § glyph — sealed titles predate one convention) or an inline
// §N reference. A cite that anchors nowhere is dangling law (PR #218 review P1).
function sectionAnchored(prose, num) {
  const esc = num.replace(/\./g, "\\.");
  return (
    new RegExp(`^#{1,6}\\s+(?:§\\s*)?${esc}(?:[.\\s—:-]|$)`, "m").test(prose) ||
    new RegExp(`§\\s*${esc}(?![\\d.])`).test(prose)
  );
}

for (const file of manifestFiles) {
  const rel = `${policyDir}/${file}`;
  let m;
  try {
    m = JSON.parse(readFileSync(join(policyAbs, file), "utf8"));
  } catch (e) {
    problems.push(`${rel}: not valid JSON (${e.message})`);
    continue;
  }

  // 1. shape
  for (const field of ["id", "source", "status", "rules"])
    if (!m[field]) problems.push(`${rel}: missing required field "${field}"`);
  if (!Array.isArray(m.rules) || m.rules.length === 0) {
    problems.push(`${rel}: "rules" must be a non-empty array`);
    continue;
  }

  // 2. source + 3. status parity (prose loaded first — the rules loop cites into it)
  let prose = null;
  if (m.source) {
    const srcAbs = join(ROOT, m.source);
    if (!existsSync(srcAbs)) {
      problems.push(`${rel}: source "${m.source}" does not exist`);
    } else {
      sourcesWithManifest.add(m.source.replace(/\\/g, "/"));
      prose = readFileSync(srcAbs, "utf8");
      const h1 = (prose.match(/^#\s+(.+)$/m) || [])[1] || "";
      // The id may live in the H1 or in the filename — the filename IS canonical
      // identity for spines whose (sealed) title predates the -00N id convention.
      const srcBase = m.source.replace(/\\/g, "/").split("/").pop();
      if (m.id && !h1.includes(m.id) && !srcBase.includes(m.id))
        problems.push(
          `${rel}: id "${m.id}" found neither in the canon's title ("${h1.slice(0, 60)}…") nor in its filename (${srcBase})`
        );
      const statusLine = (prose.match(/^.*\*\*Status:\*\*.*$/m) || [])[0] || "";
      // Exact-token parity, not substring: "PROPOSED — not SEALED yet" must NOT
      // satisfy a manifest claiming SEALED (PR #218 review P1). The prose token is
      // the first word after **Status:** (markdown emphasis stripped).
      const afterTag = statusLine.split(/\*\*Status:\*\*/)[1] ?? "";
      const proseToken =
        (afterTag
          .replace(/[*_`>]/g, "")
          .trim()
          .match(/^[A-Za-z-]+/) || [])[0] || "";
      if (!statusLine)
        problems.push(`${rel}: source has no **Status:** line — parity unverifiable`);
      else if (m.status && proseToken !== m.status)
        problems.push(
          `${rel}: status drift — manifest claims "${m.status}" but the prose status token is "${proseToken}" (line: ${statusLine.replace(/\*\*/g, "").trim().slice(0, 70)})`
        );
    }
  }

  const seen = new Set();
  for (const r of m.rules) {
    const tag = `${rel} rule "${r.id ?? "?"}"`;
    for (const field of ["id", "level", "cite", "rule", "watch"])
      if (!r[field]) problems.push(`${tag}: missing "${field}"`);
    if (r.id) {
      if (seen.has(r.id)) problems.push(`${tag}: duplicate rule id`);
      seen.add(r.id);
    }
    if (r.level && !LEVELS.has(r.level))
      problems.push(`${tag}: level "${r.level}" not in {MUST, NEVER}`);
    const citeNums = [...String(r.cite ?? "").matchAll(/§\s*(\d+(?:\.\d+)*)/g)].map((x) => x[1]);
    if (r.cite && citeNums.length === 0)
      problems.push(
        `${tag}: cite carries no § section — a rule without a prose anchor is new law, not a projection`
      );
    if (prose)
      for (const num of citeNums)
        if (!sectionAnchored(prose, num))
          problems.push(
            `${tag}: cite §${num} anchors to no heading or § reference in ${m.source} — dangling citation (the section moved, or the rule is new law)`
          );
    // 4. watch — existence is not enough: the watcher must DECLARE a relationship
    // to this law (its source cites the canon id / the battery task lists the law),
    // or any existing file could pose as a rule's "watcher" (PR #218 review P1).
    const w = r.watch;
    if (w && typeof w === "object") {
      if (!WATCH_KINDS.has(w.kind))
        problems.push(`${tag}: watch.kind "${w.kind}" not in {gate, golden-task, none}`);
      else if (w.kind === "none") {
        if (!w.note || !String(w.note).trim())
          problems.push(
            `${tag}: watch none requires a note — unwatched is a conscious declaration`
          );
      } else if (!w.ref || !existsSync(join(ROOT, w.ref))) {
        problems.push(`${tag}: watch.ref "${w.ref}" does not exist`);
      } else if (w.kind === "gate") {
        const watcherSrc = readFileSync(join(ROOT, w.ref), "utf8");
        if (m.id && !watcherSrc.includes(m.id))
          problems.push(
            `${tag}: watcher ${w.ref} never cites ${m.id} — no declared relationship to this law (an existing-but-unrelated file is a false watch)`
          );
      } else if (w.kind === "golden-task") {
        const battery = await loadBattery();
        const task = battery.find((t) => t.id === w.task);
        if (!task)
          problems.push(
            `${tag}: watch golden-task names task "${w.task}" which is not in the battery`
          );
        else if (m.id && ![...(task.laws ?? []), ...(task.lawFiles ?? [])].join(" ").includes(m.id))
          problems.push(
            `${tag}: battery task "${w.task}" does not declare ${m.id} among its laws — a trap for another law is a false watch`
          );
      }
    }
    // 6. enforce — optional; when present it feeds the runtime policy engine, so a
    // malformed block is a policy that silently never fires (fail-open by typo).
    if (r.enforce !== undefined) {
      const e = r.enforce;
      if (!e || typeof e !== "object" || Array.isArray(e)) {
        problems.push(`${tag}: enforce must be an object`);
      } else {
        const pts = Array.isArray(e.point) ? e.point : [e.point];
        if (pts.length === 0 || !pts.every((p) => ENFORCE_POINTS.has(p)))
          problems.push(
            `${tag}: enforce.point "${pts.join(", ")}" not in the §2 range {${[...ENFORCE_POINTS].join(", ")}}`
          );
        if (!ENFORCE_VERDICTS.has(e.verdict))
          problems.push(
            `${tag}: enforce.verdict "${e.verdict}" not in the §3 range {${[...ENFORCE_VERDICTS].join(", ")}}`
          );
        if (!e.match || typeof e.match !== "object" || typeof e.match.pattern !== "string") {
          problems.push(
            `${tag}: enforce.match.pattern (string) is required — a mechanical rule matches the action's shape, never NLP`
          );
        } else {
          let compiled = null;
          try {
            compiled = new RegExp(e.match.pattern);
          } catch (err) {
            problems.push(
              `${tag}: enforce.match.pattern does not compile as a RegExp (${err.message})`
            );
          }
          if (
            e.match.tool !== undefined &&
            (typeof e.match.tool !== "string" || !e.match.tool.trim())
          )
            problems.push(`${tag}: enforce.match.tool must be a non-empty string when present`);
          if (e.match.captureNotInStateLabel !== undefined) {
            if (
              typeof e.match.captureNotInStateLabel !== "string" ||
              !e.match.captureNotInStateLabel.trim()
            )
              problems.push(
                `${tag}: enforce.match.captureNotInStateLabel must be a non-empty string`
              );
            if (compiled && !/\((?!\?[:!=<])/.test(e.match.pattern))
              problems.push(
                `${tag}: captureNotInStateLabel declared but the pattern has no capturing group — nothing to look up in session state`
              );
          }
          if (
            e.match.unlessStateLabel !== undefined &&
            (typeof e.match.unlessStateLabel !== "string" || !e.match.unlessStateLabel.trim())
          )
            problems.push(
              `${tag}: enforce.match.unlessStateLabel must be a non-empty string — a governed exemption names its label explicitly`
            );
        }
      }
    }
  }
}

// 5. coverage ratchet — BIDIRECTIONAL (PR #218 review P1: a one-way list is not a
// ratchet). requireFor ⇒ manifest exists; manifest ⇒ its canon is in requireFor.
// So shrinking coverage cannot happen by deleting one file: it always takes a
// visible two-file diff (manifest + config), which review governance owns.
for (const canon of requireFor) {
  if (!sourcesWithManifest.has(canon.replace(/\\/g, "/")))
    problems.push(
      `coverage: ${canon} is in requireFor but has no manifest in ${policyDir} (the ratchet never slides back)`
    );
}
for (const src of sourcesWithManifest) {
  if (!requireFor.map((c) => c.replace(/\\/g, "/")).includes(src))
    problems.push(
      `coverage: ${src} has a manifest but is not in requireFor — the ratchet grows with every manifest (add it to tools/policy-manifests.config.json)`
    );
}
let frontier = 0;
for (const root of canonRoots) {
  const rootAbs = join(ROOT, root);
  if (!existsSync(rootAbs)) continue;
  for (const f of readdirSync(rootAbs)) {
    if (!/^CANON-.*\.md$/.test(f)) continue;
    const rel = `${root}/${f}`;
    if (sourcesWithManifest.has(rel)) continue;
    const text = readFileSync(join(rootAbs, f), "utf8");
    if (/\*\*Status:\*\*[^\n]*SEALED/.test(text)) frontier++;
  }
}

if (problems.length === 0) {
  console.log(
    green(
      bold(
        `GREEN — policy manifests: ${manifestFiles.length} manifest(s) are faithful projections of their sealed prose (shape · source · status parity · watched-or-declared · coverage ratchet).`
      )
    )
  );
  if (frontier > 0)
    console.log(
      `  frontier: ${frontier} sealed canon(s) not yet manifested — coverage grows canon-by-canon (add to requireFor as they land).`
    );
  process.exit(0);
}

console.log(red(bold(`RED — policy manifests: ${problems.length} problem(s):`)));
for (const p of problems) console.log(`  ✗ ${p}`);
console.log(
  "\nFix: the prose is the law — align the manifest to it (or amend the prose through its own seal path first). A manifest never out-claims, out-runs, or outlives its canon."
);
process.exit(1);
