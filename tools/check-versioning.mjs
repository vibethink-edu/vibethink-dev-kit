#!/usr/bin/env node
/**
 * check-versioning — makes CANON-VERSIONING-001 BITE for apps & packages.
 *
 * The finding that motivated this (WorkBench → dev-kit, #103): the versioning
 * canon DECLARES the models (CalVer for apps, SemVer for packages) but shipped no
 * copyable instrument and no gate — so a consumer could declare "CalVer" and sit
 * FROZEN at one hand-typed version for weeks. Policy without mechanism is illusion.
 *
 * This gate closes that for the artifact types the canon's §5/§4 cover, in the same
 * config-driven, N-A-aware spirit as check-governance / check-tool-versions:
 *   - A declared model must be WIRED to a LIVE version source, not just named.
 *     For an app, that means a resolvable version SOURCE (a script/command that
 *     EMITS the version — e.g. derives YYYY.MM.DD+<sha> from git) exists on disk.
 *     A model declared with no live source is exactly the frozen-version trap.
 *   - For a package, the declared manifest must exist and carry a `version` field.
 *   - The per-repo binding (canon §10) must exist and be non-empty when declared.
 *   - A field set to `null` is a CONSCIOUS N-A — reported, never a failure.
 *   - No config at all → the gate does not apply (the doctor skips it).
 *
 * Tool/script versioning is a DIFFERENT artifact type (canon §6) with its own gate,
 * check-tool-versions.mjs — this one does not touch it.
 *
 * Config (tools/versioning.config.json):
 *   {
 *     "binding": ".versioning.yaml" | null,
 *     "apps":     { "model": "calver"|"semver"|null, "versionSource": "tools/get-app-version.mjs"|null, "pattern": "YYYY.MM.DD+sha" },
 *     "packages": { "model": "semver-2.0"|null, "manifest": "package.json" }
 *   }
 *
 * Usage:  node tools/check-versioning.mjs [config-path]   (default: tools/versioning.config.json)
 * Exit: 0 holds (wired or conscious N-A) · 1 a declared model is not wired · 2 setup error.
 * Pure Node, zero deps.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { isAbsolute, join, relative } from "node:path";

const ROOT = process.cwd();
const configPath = process.argv[2] || "tools/versioning.config.json";
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;

function fail(msg) {
  console.error(`✗ check-versioning — ${msg}`);
  process.exit(2);
}

const abs = isAbsolute(configPath) ? configPath : join(ROOT, configPath);
if (!existsSync(abs))
  fail(
    `config not found: ${configPath} (a repo that ships an app/package declares its versioning posture here)`
  );

let cfg;
try {
  cfg = JSON.parse(readFileSync(abs, "utf8"));
} catch (e) {
  fail(`config is not valid JSON: ${e.message}`);
}

console.log(`\ncheck-versioning · ${relative(ROOT, abs)}`);
console.log(`repo: ${ROOT}\n`);

let problems = 0;
let wired = 0;
let na = 0;

const onDisk = (value) => existsSync(isAbsolute(value) ? value : join(ROOT, value));
const nonEmpty = (value) => {
  const p = isAbsolute(value) ? value : join(ROOT, value);
  return existsSync(p) && statSync(p).size > 0;
};

// 1. Per-repo binding (canon §10) — declares the posture so one file answers "how do I bump?".
const binding = cfg?.binding;
if (binding === null || binding === undefined) {
  na++;
  console.log(`  – binding                 N-A (no per-repo binding declared)`);
} else if (typeof binding !== "string" || !binding.trim()) {
  problems++;
  console.log(
    `  ${red("✗")} binding                 invalid value (expected a path string or null)`
  );
} else if (!nonEmpty(binding)) {
  problems++;
  console.log(
    `  ${red("✗")} binding                 declared "${binding}" but it is missing or empty`
  );
} else {
  wired++;
  console.log(`  ${green("✓")} binding                 ${binding}`);
}

// 2. Apps — a declared model must point at a LIVE version source (the anti-freeze teeth).
const apps = cfg?.apps ?? {};
if (!apps.model) {
  na++;
  console.log(`  – apps                    N-A (no app model declared)`);
} else {
  const src = apps.versionSource;
  if (!src || typeof src !== "string" || !src.trim()) {
    problems++;
    console.log(
      `  ${red("✗")} apps                    model "${apps.model}" declared but NO versionSource — a version that cannot refresh is how an app freezes (policy without mechanism)`
    );
  } else if (!onDisk(src)) {
    problems++;
    console.log(
      `  ${red("✗")} apps                    versionSource "${src}" does not exist — wire the live version source (e.g. a script that emits ${apps.pattern || "the version"})`
    );
  } else {
    wired++;
    console.log(`  ${green("✓")} apps                    ${apps.model} via ${src}`);
  }
}

// 3. Packages — a declared model must have a manifest that actually carries a version.
const pkgs = cfg?.packages ?? {};
if (!pkgs.model) {
  na++;
  console.log(`  – packages                N-A (no package model declared)`);
} else {
  const manifest = pkgs.manifest || "package.json";
  const p = isAbsolute(manifest) ? manifest : join(ROOT, manifest);
  if (!existsSync(p)) {
    problems++;
    console.log(
      `  ${red("✗")} packages                model "${pkgs.model}" declared but manifest "${manifest}" is missing`
    );
  } else {
    let version;
    try {
      version = JSON.parse(readFileSync(p, "utf8")).version;
    } catch {
      /* non-JSON manifest — leave version undefined */
    }
    if (!version) {
      problems++;
      console.log(`  ${red("✗")} packages                "${manifest}" has no \`version\` field`);
    } else {
      wired++;
      console.log(`  ${green("✓")} packages                ${pkgs.model} · ${manifest}@${version}`);
    }
  }
}

console.log(`\n${bold("─".repeat(60))}`);
console.log(
  `${bold("Wired:")} ${green(String(wired))}   ${bold("N-A:")} ${na}   ${bold("Not wired:")} ${problems ? red(String(problems)) : "0"}`
);
console.log(`${bold("─".repeat(60))}`);

if (problems) {
  console.log(
    `${red(bold(`\nRED — ${problems} declared versioning model(s) not wired to a live source.`))} (wire the source, or set the model null for a conscious N-A.)\n`
  );
  process.exit(1);
}
console.log(
  green(
    bold(
      "\nGREEN — every declared versioning model is wired to a live source (CANON-VERSIONING-001).\n"
    )
  )
);
process.exit(0);
