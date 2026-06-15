#!/usr/bin/env node
/**
 * check-tool-versions — every wired tool declares a version (CANON-VERSIONING-001 §6).
 *
 * §6 says each internal runnable declares its version (a VERSION constant OR a
 * manifest). The kit uses a manifest (tools/versions.json) so adding a version costs
 * no per-engine edit — important because several tools are copy-distributed to
 * consumers (a source edit would ripple their copy-parity). This gate makes §6 BITE:
 *   - every tools/*.mjs (excluding *.test.mjs) has an entry in the manifest;
 *   - every manifest entry points at a tool that exists (no stale entries);
 *   - every version is SemVer-lite (MAJOR.MINOR).
 *
 * Usage:  node tools/check-tool-versions.mjs [manifest]   (default tools/versions.json)
 * Exit: 0 all versioned · 1 a tool lacks a version / a stale or malformed entry · 2 setup error.
 * Pure Node, zero deps.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { isAbsolute, join, relative } from "node:path";

const ROOT = process.cwd();
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;

const manifestPath = process.argv[2] || "tools/versions.json";
const mAbs = isAbsolute(manifestPath) ? manifestPath : join(ROOT, manifestPath);
if (!existsSync(mAbs)) {
  console.error(`✗ check-tool-versions — manifest not found: ${manifestPath}`);
  process.exit(2);
}
let manifest;
try {
  manifest = JSON.parse(readFileSync(mAbs, "utf8"));
} catch (e) {
  console.error(`✗ check-tool-versions — manifest is not valid JSON: ${e.message}`);
  process.exit(2);
}
const versions = manifest.tools || {};

// Wired runnables live in tools/ (the .mjs engines) and setup/ (the .sh/.ps1 helpers).
// A runnable is any .mjs / .sh / .ps1 in those dirs, excluding *.test.mjs. Keyed by basename.
const toolsDir = join(ROOT, "tools");
if (!existsSync(toolsDir)) {
  console.error("✗ check-tool-versions — no tools/ directory (run from the kit root).");
  process.exit(2);
}
const isRunnable = (f) =>
  (f.endsWith(".mjs") && !f.endsWith(".test.mjs")) || f.endsWith(".sh") || f.endsWith(".ps1");
const onDisk = [];
for (const dir of ["tools", "setup"]) {
  const abs = join(ROOT, dir);
  if (existsSync(abs)) for (const f of readdirSync(abs)) if (isRunnable(f)) onDisk.push(f);
}

const SEMVER_LITE = /^\d+\.\d+$/;
const missing = []; // tool on disk, no manifest entry
const malformed = []; // entry not MAJOR.MINOR
const stale = []; // manifest entry, no tool on disk

for (const f of onDisk) {
  if (!(f in versions)) missing.push(f);
  else if (!SEMVER_LITE.test(String(versions[f]))) malformed.push(`${f} = "${versions[f]}"`);
}
for (const k of Object.keys(versions)) {
  if (!onDisk.includes(k)) stale.push(k);
}

console.log(`\ncheck-tool-versions · ${relative(ROOT, mAbs)}\nrepo: ${ROOT}\n`);

if (!missing.length && !malformed.length && !stale.length) {
  console.log(green(`  ✓ all ${onDisk.length} wired tools declare a SemVer-lite version`));
  console.log(green(bold("\nGREEN — every wired tool is versioned (CANON-VERSIONING-001 §6).\n")));
  process.exit(0);
}

for (const f of missing) console.log(`  ${red("✗")} ${f} has no version in the manifest (add it to tools/versions.json)`);
for (const f of malformed) console.log(`  ${red("✗")} ${f} version is not MAJOR.MINOR`);
for (const k of stale) console.log(`  ${red("✗")} manifest entry "${k}" points at a tool that no longer exists (remove it)`);
console.log(red(bold(`\nRED — ${missing.length} unversioned · ${malformed.length} malformed · ${stale.length} stale.`)) + "\n");
process.exit(1);
