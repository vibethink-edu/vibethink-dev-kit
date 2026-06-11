#!/usr/bin/env node
/**
 * check-catalog-sync — the Maintenance-rule gate for the adoption catalog.
 *
 * The catalog (setup/ADOPT-DEV-KIT.md) carries its own Maintenance rule:
 * "A new agnostic piece added to the kit (canon, ADR, engine) must add a
 * corresponding section here in the same PR." That rule was violated ~14
 * consecutive times before an audit caught it (2026-06-07 reconciliation) —
 * written-but-not-biting. This gate makes it bite:
 *
 *   Check 1 — catalog-coverage: every spine file in the knowledge dirs is
 *     referenced by the catalog (as a piece Home) or carries a declared
 *     exemption (with a reason) in the config. An uncatalogued spine is RED.
 *
 *   Check 2 — status-line: every spine declares a Status line whose first
 *     recognized token belongs to the controlled vocabulary (config
 *     statusTokens). This is the mechanical fix for "mixed status vocabulary
 *     breaks uniform grep" — the vocabulary is enforced going forward instead
 *     of cosmetically rewriting sealed headers.
 *
 * Config: tools/catalog-sync.config.json (this repo is the producer; the gate
 * is kit-only — consumers never run it).
 *
 * Usage: node tools/check-catalog-sync.mjs [config-path]
 * Pure Node, no deps. Exit codes: 0 in sync · 1 violation · 2 setup error.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;

const ROOT = process.cwd();
const configPath = path.resolve(ROOT, process.argv[2] || "tools/catalog-sync.config.json");

if (!existsSync(configPath)) {
  console.error(red(`FATAL: catalog-sync config not found: ${configPath}`));
  process.exit(2);
}
let cfg;
try {
  cfg = JSON.parse(readFileSync(configPath, "utf8"));
} catch (e) {
  console.error(red(`FATAL: config is not valid JSON: ${e.message}`));
  process.exit(2);
}

const catalogFile = path.resolve(ROOT, cfg.catalogFile || "setup/ADOPT-DEV-KIT.md");
if (!existsSync(catalogFile)) {
  console.error(red(`FATAL: catalog file not found: ${catalogFile}`));
  process.exit(2);
}
const catalog = readFileSync(catalogFile, "utf8");

const knowledgeDirs = cfg.knowledgeDirs || [];
const spineRe = new RegExp(cfg.spinePattern || "^CANON-.*\\.md$");
const exempt = new Map((cfg.exempt || []).map((e) => [e.file.replace(/\\/g, "/"), e.reason || ""]));
const statusTokens = cfg.statusTokens || [];
const alsoStatusCheck = cfg.alsoStatusCheck || [];

console.log(`\ncheck-catalog-sync · ${path.relative(ROOT, configPath)}`);
console.log(`catalog: ${path.relative(ROOT, catalogFile)}\n`);

let failed = 0;

// ── Check 1: catalog-coverage ────────────────────────────────────────────────
const spines = [];
for (const dir of knowledgeDirs) {
  const abs = path.resolve(ROOT, dir);
  if (!existsSync(abs)) {
    failed++;
    console.log(`  ${red("✗")} knowledge dir missing: ${dir}`);
    continue;
  }
  for (const f of readdirSync(abs)) {
    if (spineRe.test(f)) spines.push(`${dir.replace(/\\/g, "/")}/${f}`);
  }
}

let covered = 0;
const uncatalogued = [];
for (const spine of spines) {
  if (exempt.has(spine)) {
    console.log(`  ${yellow("–")} ${spine} — EXEMPT: ${exempt.get(spine)}`);
    continue;
  }
  // A spine is catalogued when the catalog cites its path (the Home line of a piece).
  if (catalog.includes(spine) || catalog.includes(path.basename(spine))) {
    covered++;
  } else {
    uncatalogued.push(spine);
  }
}
if (uncatalogued.length === 0) {
  console.log(`  ${green("✓")} catalog-coverage: ${covered} spine(s) catalogued, ${exempt.size} exempt, 0 missing`);
} else {
  failed++;
  for (const s of uncatalogued) {
    console.log(`  ${red("✗")} catalog-coverage: ${s} has NO piece in the catalog (Maintenance rule: add its section in the same PR, or declare an exemption with a reason)`);
  }
}

// Stale exemptions: an exemption pointing at a file that no longer exists.
for (const [file] of exempt) {
  if (!existsSync(path.resolve(ROOT, file))) {
    failed++;
    console.log(`  ${red("✗")} exemption points at a missing file: ${file} (remove the stale exemption)`);
  }
}

// ── Check 2: status-line (controlled vocabulary) ─────────────────────────────
if (statusTokens.length > 0) {
  const statusRe = /\*\*Status:?\*\*:?\s*(.+)/;
  const checkFiles = [...spines, ...alsoStatusCheck.map((f) => f.replace(/\\/g, "/"))];
  let okStatus = 0;
  for (const rel of checkFiles) {
    const abs = path.resolve(ROOT, rel);
    if (!existsSync(abs)) continue; // coverage/exemption checks already handle missing files
    const head = readFileSync(abs, "utf8").split(/\r?\n/).slice(0, 40);
    const statusLine = head.map((l) => l.match(statusRe)).find(Boolean);
    if (!statusLine) {
      failed++;
      console.log(`  ${red("✗")} status-line: ${rel} has no **Status:** line in its first 40 lines`);
      continue;
    }
    const value = statusLine[1].trim();
    const token = statusTokens.find((t) => value.toLowerCase().startsWith(t.toLowerCase()));
    if (token) {
      okStatus++;
    } else {
      failed++;
      console.log(`  ${red("✗")} status-line: ${rel} status "${value.slice(0, 60)}…" does not start with a controlled token (${statusTokens.join(" | ")})`);
    }
  }
  console.log(`  ${okStatus === checkFiles.filter((f) => existsSync(path.resolve(ROOT, f))).length ? green("✓") : yellow("–")} status-line: ${okStatus}/${checkFiles.length} files carry a controlled-vocabulary Status`);
}

// ── Verdict ──────────────────────────────────────────────────────────────────
console.log("");
if (failed > 0) {
  console.log(red(bold(`RED — ${failed} catalog-sync violation(s). The Maintenance rule must bite, not just be written.`)));
  process.exit(1);
}
console.log(green(bold("GREEN — catalog in sync with the spine inventory; status vocabulary holds.")));
process.exit(0);
