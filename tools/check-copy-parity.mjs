#!/usr/bin/env node
/**
 * check-copy-parity — the drift guard for copy-distributed runnables.
 *
 * ADR-20260524 (supra-repo inheritance mechanism) §3.1: a runnable inherited by
 * verbatim copy "must carry the parity check that proves it is byte-identical
 * to the upstream (modulo line endings) — without it, the copy silently rots."
 * This engine IS that check. It runs in the CONSUMING repo, comparing each
 * declared local copy against the kit source.
 *
 * Config (in the consuming repo), e.g. tools/copy-parity.config.json:
 *   {
 *     "$schema": "VIBETHINK_COPY_PARITY_V1",
 *     "upstreamRoot": "_devkit",
 *     "copies": [
 *       { "local": "scripts/inbox.mjs", "upstream": "tools/inbox.mjs" },
 *       { "local": "scripts/feed.mjs",  "upstream": "tools/feed.mjs",
 *         "adapted": { "reason": "consumer-specific lane filter", "since": "2026-06-01" } },
 *       { "localDir": "packages/rich-editor/src", "upstreamDir": "packages/rich-editor/src",
 *         "exclude": ["node_modules", "dist"] }
 *     ]
 *   }
 *
 * An entry is either a FILE pair ({local, upstream}) or a DIRECTORY-SET
 * ({localDir, upstreamDir, exclude?}). A dir entry mirrors a whole tree as ONE
 * declaration: the file SET must match exactly (missing locally = rot; extra
 * locally = undeclared drift) and every shared file must be byte-identical. Use
 * it for shared packages so files added upstream later cannot silently escape
 * the guard (which per-file enumeration would miss).
 *
 * Rules:
 *   - Comparison is byte-identity over LF-normalized content (CRLF/LF neutral).
 *   - An undeclared mismatch is DRIFT → exit 1 (the failure this guard exists for).
 *   - An entry with `adapted` (reason required) is a declared bounded adaptation
 *     (upstream-protocol canon §6.1): reported visibly as ADAPTED, never compared
 *     silently, never a failure. Drift must be loud; adaptation must be declared.
 *   - A missing local or upstream file is a failure (a copy pointing at nothing
 *     is rot, not parity).
 *   - upstreamRoot resolves from (in order): --upstream-root flag, config value,
 *     DEVKIT_ROOT env var. It must exist — fail-closed (exit 2) otherwise.
 *
 * Usage:
 *   node check-copy-parity.mjs [config-path] [--upstream-root <path>]
 * Defaults: config-path = tools/copy-parity.config.json
 *
 * Pure Node, no deps. Exit codes: 0 parity holds · 1 drift/rot · 2 setup error.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const cyan = (s) => `\x1b[36m${s}\x1b[0m`;

// ── Args ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
let configPath = "tools/copy-parity.config.json";
let upstreamRootFlag = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--upstream-root") upstreamRootFlag = args[++i];
  else if (!args[i].startsWith("--")) configPath = args[i];
}

const ROOT = process.cwd();
configPath = path.resolve(ROOT, configPath);

if (!existsSync(configPath)) {
  console.error(red(`FATAL: copy-parity config not found: ${configPath}`));
  console.error("A repo that invokes the parity check must declare its copies.");
  process.exit(2);
}

let cfg;
try {
  cfg = JSON.parse(readFileSync(configPath, "utf8"));
} catch (e) {
  console.error(red(`FATAL: config is not valid JSON: ${e.message}`));
  process.exit(2);
}

const copies = Array.isArray(cfg.copies) ? cfg.copies : [];
const upstreamRoot = path.resolve(
  ROOT,
  upstreamRootFlag || cfg.upstreamRoot || process.env.DEVKIT_ROOT || ""
);

console.log(`\ncheck-copy-parity · ${path.relative(ROOT, configPath) || configPath}`);
console.log(`repo: ${ROOT}`);
console.log(`upstream root: ${upstreamRoot}\n`);

if (copies.length === 0) {
  console.log(yellow("No copies declared; nothing to check."));
  console.log("Declare each copy-distributed runnable in the config (ADR-20260524 §3.1).");
  process.exit(0);
}

if (!upstreamRootFlag && !cfg.upstreamRoot && !process.env.DEVKIT_ROOT) {
  console.error(
    red("FATAL: no upstream root (flag --upstream-root, config upstreamRoot, or DEVKIT_ROOT env).")
  );
  process.exit(2);
}
if (!existsSync(upstreamRoot)) {
  console.error(red(`FATAL: upstream root does not exist: ${upstreamRoot}`));
  console.error(
    "In CI, check the kit out first (see the reusable workflow); locally, point at the kit checkout/mount."
  );
  process.exit(2);
}

// ── Compare ──────────────────────────────────────────────────────────────────
// Byte identity over LF-normalized content (the ADR's "modulo line endings").
const lfHash = (file) =>
  createHash("sha256").update(readFileSync(file, "utf8").replace(/\r\n/g, "\n")).digest("hex");

// Recursively list a directory's files as sorted POSIX-relative paths, skipping
// any path whose segments include an excluded name (e.g. node_modules, dist).
const walkRel = (root, excludeSet) => {
  const out = [];
  const rec = (dir) => {
    for (const name of readdirSync(dir).sort()) {
      const abs = path.join(dir, name);
      const rel = path.relative(root, abs).split(path.sep).join("/");
      if (rel.split("/").some((seg) => excludeSet.has(seg))) continue;
      if (statSync(abs).isDirectory()) rec(abs);
      else out.push(rel);
    }
  };
  if (existsSync(root)) rec(root);
  return out.sort();
};

let drifted = 0;
let adapted = 0;
let ok = 0;

// Directory-set parity: one entry mirrors a whole tree (e.g. a shared package).
// The file SET must match exactly — a file present upstream but missing locally
// is rot; a file present locally but absent upstream is undeclared drift; and
// every shared file must be byte-identical (modulo line endings). This lets a
// package be declared as ONE entry instead of enumerating every file (which
// would silently miss files added upstream later).
function checkDir(entry) {
  const localRel = entry.localDir;
  const upstreamRel = entry.upstreamDir;
  const label = `${localRel}/ ⇄ ${upstreamRel}/`;

  if (!localRel || !upstreamRel) {
    drifted++;
    console.log(
      `  ${red("✗")} malformed dir entry (needs localDir + upstreamDir): ${JSON.stringify(entry)}`
    );
    return;
  }

  const localAbs = path.resolve(ROOT, localRel);
  const upstreamAbs = path.resolve(upstreamRoot, upstreamRel);

  if (entry.adapted) {
    if (!entry.adapted.reason) {
      drifted++;
      console.log(`  ${red("✗")} ${label} — "adapted" without a reason (upstream-protocol §6.1)`);
      return;
    }
    adapted++;
    console.log(
      `  ${yellow("◆")} ${label} — ADAPTED (declared): ${entry.adapted.reason}${entry.adapted.since ? ` (since ${entry.adapted.since})` : ""}`
    );
    return;
  }
  if (!existsSync(upstreamAbs)) {
    drifted++;
    console.log(`  ${red("✗")} ${label} — upstream dir MISSING (renamed/removed upstream?)`);
    return;
  }
  if (!existsSync(localAbs)) {
    drifted++;
    console.log(`  ${red("✗")} ${label} — local dir MISSING (declared but absent)`);
    return;
  }

  const excludeSet = new Set(entry.exclude || []);
  const upFiles = walkRel(upstreamAbs, excludeSet);
  const locFiles = walkRel(localAbs, excludeSet);
  const locSet = new Set(locFiles);
  const upSet = new Set(upFiles);
  const problems = [];

  for (const rel of upFiles) {
    if (!locSet.has(rel)) {
      problems.push(`local MISSING: ${rel}`);
    } else if (lfHash(path.join(localAbs, rel)) !== lfHash(path.join(upstreamAbs, rel))) {
      problems.push(`DRIFT: ${rel}`);
    }
  }
  for (const rel of locFiles) {
    if (!upSet.has(rel)) problems.push(`extra local (absent upstream): ${rel}`);
  }

  if (problems.length === 0) {
    ok++;
    console.log(`  ${green("✓")} ${label} (${upFiles.length} files)`);
  } else {
    drifted++;
    console.log(`  ${red("✗")} ${label} — ${problems.length} file(s) out of parity:`);
    for (const p of problems.slice(0, 20)) console.log(`      ${red("·")} ${p}`);
    if (problems.length > 20) console.log(`      … and ${problems.length - 20} more`);
    console.log(`      sync shape: copy the upstream dir over the local one, then re-run.`);
  }
}

for (const entry of copies) {
  if (entry.localDir || entry.upstreamDir) {
    checkDir(entry);
    continue;
  }
  const localRel = entry.local || "";
  const upstreamRel = entry.upstream || "";
  const localAbs = path.resolve(ROOT, localRel);
  const upstreamAbs = path.resolve(upstreamRoot, upstreamRel);
  const label = `${localRel} ⇄ ${upstreamRel}`;

  if (!localRel || !upstreamRel) {
    drifted++;
    console.log(`  ${red("✗")} malformed entry (needs local + upstream): ${JSON.stringify(entry)}`);
    continue;
  }
  if (!existsSync(localAbs)) {
    drifted++;
    console.log(`  ${red("✗")} ${label} — local copy MISSING (declared but absent)`);
    continue;
  }
  if (!existsSync(upstreamAbs)) {
    drifted++;
    console.log(
      `  ${red("✗")} ${label} — upstream source MISSING (copy points at nothing: renamed/removed upstream?)`
    );
    continue;
  }

  if (entry.adapted) {
    if (!entry.adapted.reason) {
      drifted++;
      console.log(
        `  ${red("✗")} ${label} — "adapted" without a reason (a bounded adaptation must declare why; upstream-protocol §6.1)`
      );
      continue;
    }
    adapted++;
    console.log(
      `  ${yellow("◆")} ${label} — ADAPTED (declared): ${entry.adapted.reason}${entry.adapted.since ? ` (since ${entry.adapted.since})` : ""}`
    );
    continue;
  }

  if (lfHash(localAbs) === lfHash(upstreamAbs)) {
    ok++;
    console.log(`  ${green("✓")} ${label}`);
  } else {
    drifted++;
    console.log(`  ${red("✗")} ${label} — DRIFT (content differs beyond line endings)`);
    console.log(
      `      diff hint: git diff --no-index "${path.relative(ROOT, upstreamAbs)}" "${localRel}"`
    );
  }
}

// ── Verdict ──────────────────────────────────────────────────────────────────
console.log("");
console.log(bold("─".repeat(70)));
console.log(`${bold("Copies in parity:")}   ${green(String(ok))}`);
console.log(`${bold("Declared adapted:")}   ${adapted ? yellow(String(adapted)) : "0"}`);
console.log(`${bold("Drifted / rotten:")}   ${drifted ? red(String(drifted)) : green("0")}`);
console.log(bold("─".repeat(70)));

if (drifted > 0) {
  console.log(`\n${red(bold("RED — copied runnable(s) drifted from upstream."))}`);
  console.log(
    "Re-sync the copy (or declare a bounded adaptation with its reason — never let it rot silently)."
  );
  console.log(
    `Sync shape: copy the upstream file over the local one, byte-for-byte, in its own PR (upstream-protocol §12).`
  );
  process.exit(1);
}
console.log(
  `\n${green(bold("GREEN — every declared copy is in parity (or visibly adapted)."))} ${cyan("(ADR-20260524 §3.1 holds.)")}`
);
process.exit(0);
