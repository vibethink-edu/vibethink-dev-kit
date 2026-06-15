#!/usr/bin/env node
/**
 * check-governance — makes the governance prose BITE.
 *
 * Pieces #34 (state-mirror + append-only log + decision register) and #37
 * (change-path & decision classes) were canon-as-prose: a repo could *claim* the
 * instruments and have nothing. This gate closes that: if a repo declares it holds
 * an instrument, the file must EXIST and be NON-EMPTY; and its class→authority
 * binding must be DECLARED (no silent default — the §5/§6 rule of #37).
 *
 * Deliberately NOT bureaucratic:
 *   - config-driven — the canon prescribes the roles, the repo binds the concrete
 *     paths (CANON-CONTEXT-HYGIENE §3: "the concrete paths/files are an L3 concern");
 *   - a path set to `null` is a CONSCIOUS N-A — reported, never a failure, never silent;
 *   - no config at all → the gate does not apply (the doctor skips it).
 *   It checks that what you CLAIM is real — it does not invent process you didn't adopt.
 *
 * Config (tools/governance.config.json):
 *   {
 *     "instruments": {
 *       "presentMirror":    "ORCHESTRATION-DASHBOARD.md" | null,
 *       "appendOnlyLog":    "ORCHESTRATION-LOG.md"       | null,
 *       "decisionRegister": "doc/decisions/DECISION-REGISTER.md" | null
 *     },
 *     "decisionClasses": "AGENTS.md" | "doc/decision-classes.md" | null
 *   }
 *
 * Usage:  node check-governance.mjs [config-path]   (default: tools/governance.config.json)
 * Exit: 0 holds · 1 a declared instrument/binding is missing or empty · 2 setup error.
 * Pure Node, zero deps.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";

const ROOT = process.cwd();
const configPath = process.argv[2] || "tools/governance.config.json";
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;

function fail(msg) {
  console.error(`✗ check-governance — ${msg}`);
  process.exit(2);
}

const abs = isAbsolute(configPath) ? configPath : join(ROOT, configPath);
if (!existsSync(abs)) fail(`config not found: ${configPath} (a repo that adopts #34/#37 declares its instrument paths here)`);

let cfg;
try {
  cfg = JSON.parse(readFileSync(abs, "utf8"));
} catch (e) {
  fail(`config is not valid JSON: ${e.message}`);
}

console.log(`\ncheck-governance · ${relative(ROOT, abs)}`);
console.log(`repo: ${ROOT}\n`);

// The declared items: the three instruments + the decision-class binding. Each is a
// path (must exist + non-empty) or null (conscious N-A).
const items = [
  ["present-mirror", cfg?.instruments?.presentMirror],
  ["append-only log", cfg?.instruments?.appendOnlyLog],
  ["decision register", cfg?.instruments?.decisionRegister],
  ["decision-class binding", cfg?.decisionClasses],
];

let missing = 0;
let checked = 0;
let na = 0;

for (const [label, value] of items) {
  if (value === null || value === undefined) {
    na++;
    console.log(`  ${"–"} ${label.padEnd(24)} N-A (declared null — conscious skip)`);
    continue;
  }
  if (typeof value !== "string" || !value.trim()) {
    missing++;
    console.log(`  ${red("✗")} ${label.padEnd(24)} invalid value (expected a path string or null)`);
    continue;
  }
  const p = isAbsolute(value) ? value : join(ROOT, value);
  if (!existsSync(p)) {
    missing++;
    console.log(`  ${red("✗")} ${label.padEnd(24)} declared "${value}" but the file does not exist`);
    continue;
  }
  const size = statSync(p).size;
  if (size === 0) {
    missing++;
    console.log(`  ${red("✗")} ${label.padEnd(24)} "${value}" exists but is EMPTY (a declared-but-empty instrument is a lie)`);
    continue;
  }
  checked++;
  console.log(`  ${green("✓")} ${label.padEnd(24)} ${value}`);
}

console.log(`\n${bold("─".repeat(60))}`);
console.log(`${bold("Present:")} ${green(String(checked))}   ${bold("N-A:")} ${na}   ${bold("Missing/empty:")} ${missing ? red(String(missing)) : "0"}`);
console.log(`${bold("─".repeat(60))}`);

if (missing) {
  console.log(red(bold(`\nRED — ${missing} declared governance item(s) missing or empty.`)) + " (declare null for a conscious N-A, or create the file.)\n");
  process.exit(1);
}
console.log(green(bold("\nGREEN — every declared governance instrument exists and is non-empty.\n")));
process.exit(0);
