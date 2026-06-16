#!/usr/bin/env node
/**
 * check-feature-docs — makes CANON-DEVELOPMENT-PROCESS §5/§6 BITE for a repo's units.
 *
 * The finding that motivated this: the development-process canon DECLARES the artifact
 * set every unit carries (requirements, readiness plan, roadmap, append-only log,
 * per-unit changelog) and what a finding is (§6) — but shipped no templates and no
 * gate. So a repo could "follow the process" while every feature documented itself in
 * a different shape, and a missing artifact stayed invisible until someone went looking
 * (a feature coded with no durable docs sits undiscoverable in a branch for months).
 * Policy without a shape and a mechanism is a suggestion.
 *
 * This gate closes that for the FEATURE/unit-doc artifact type, in the same
 * config-driven, N-A-aware spirit as check-versioning / check-governance:
 *   - The per-repo L3 binding (the doc that maps roles → concrete filenames) exists.
 *   - Every dir under the declared feature root carries each required artifact
 *     (existing AND non-empty). A feature dir missing one is the silent-gap trap.
 *   - The declared findings location exists.
 *   - A field set to `null` is a CONSCIOUS N-A — reported, never a failure.
 *   - No config at all → the gate does not apply (the doctor skips it).
 *
 * It does NOT judge artifact CONTENT (a reviewer does that); it guarantees the
 * artifact is PRESENT — the precondition for review. Versioning is a different gate
 * (check-versioning); ADR bodies are the decision-disposition gate's job.
 *
 * Config (tools/feature-docs.config.json):
 *   {
 *     "binding": "AGENTS.md" | null,
 *     "featureScope": { "root": "docs/features" | null, "requiredArtifacts": ["ROADMAP.md","LOG.md","PLAN.md"] },
 *     "findings":     { "location": "docs/ai-coordination/comms" | null }
 *   }
 *
 * Usage:  node tools/check-feature-docs.mjs [config-path]   (default: tools/feature-docs.config.json)
 * Exit: 0 holds (carried or conscious N-A) · 1 a declared artifact is missing · 2 setup error.
 * Pure Node, zero deps.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { isAbsolute, join, relative } from "node:path";

const ROOT = process.cwd();
const configPath = process.argv[2] || "tools/feature-docs.config.json";
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;

function fail(msg) {
  console.error(`✗ check-feature-docs — ${msg}`);
  process.exit(2);
}

const abs = isAbsolute(configPath) ? configPath : join(ROOT, configPath);
if (!existsSync(abs))
  fail(
    `config not found: ${configPath} (a repo declares its feature-doc posture here — see tools/feature-docs.config.example.json)`
  );

let cfg;
try {
  cfg = JSON.parse(readFileSync(abs, "utf8"));
} catch (e) {
  fail(`config is not valid JSON: ${e.message}`);
}

console.log(`\ncheck-feature-docs · ${relative(ROOT, abs)}`);
console.log(`repo: ${ROOT}\n`);

let problems = 0;
let carried = 0;
let na = 0;

const resolve = (value) => (isAbsolute(value) ? value : join(ROOT, value));
const nonEmptyFile = (value) => {
  const p = resolve(value);
  return existsSync(p) && statSync(p).isFile() && statSync(p).size > 0;
};
const isDir = (value) => {
  const p = resolve(value);
  return existsSync(p) && statSync(p).isDirectory();
};

// 1. Per-repo L3 binding — the doc that maps artifact roles → concrete filenames.
const binding = cfg?.binding;
if (binding === null || binding === undefined) {
  na++;
  console.log(`  – binding                 N-A (no per-repo binding declared)`);
} else if (typeof binding !== "string" || !binding.trim()) {
  problems++;
  console.log(
    `  ${red("✗")} binding                 invalid value (expected a path string or null)`
  );
} else if (!nonEmptyFile(binding)) {
  problems++;
  console.log(
    `  ${red("✗")} binding                 declared "${binding}" but it is missing or empty`
  );
} else {
  carried++;
  console.log(`  ${green("✓")} binding                 ${binding}`);
}

// 2. Feature scope — every dir under the root carries each required artifact.
const scope = cfg?.featureScope ?? {};
if (!scope.root) {
  na++;
  console.log(`  – featureScope            N-A (no feature root declared)`);
} else if (!isDir(scope.root)) {
  problems++;
  console.log(`  ${red("✗")} featureScope            root "${scope.root}" is not a directory`);
} else {
  const required = Array.isArray(scope.requiredArtifacts)
    ? scope.requiredArtifacts.filter(Boolean)
    : [];
  if (required.length === 0) {
    problems++;
    console.log(
      `  ${red("✗")} featureScope            root "${scope.root}" declared but requiredArtifacts is empty (nothing would be enforced)`
    );
  } else {
    const dirs = readdirSync(resolve(scope.root), { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
    let missing = 0;
    for (const dir of dirs) {
      for (const art of required) {
        if (!nonEmptyFile(join(scope.root, dir, art))) {
          missing++;
          console.log(
            `  ${red("✗")} featureScope            ${join(scope.root, dir)} is missing "${art}"`
          );
        }
      }
    }
    if (missing === 0) {
      carried++;
      console.log(
        `  ${green("✓")} featureScope            ${dirs.length} unit(s) under ${scope.root} carry [${required.join(", ")}]`
      );
    } else {
      problems += missing;
    }
  }
}

// 3. Findings location — where out-of-scope findings are recorded (§6).
const findings = cfg?.findings ?? {};
if (findings.location === null || findings.location === undefined) {
  na++;
  console.log(`  – findings                N-A (no findings location declared)`);
} else if (typeof findings.location !== "string" || !findings.location.trim()) {
  problems++;
  console.log(
    `  ${red("✗")} findings                invalid value (expected a path string or null)`
  );
} else if (!isDir(findings.location)) {
  problems++;
  console.log(
    `  ${red("✗")} findings                declared location "${findings.location}" does not exist`
  );
} else {
  carried++;
  console.log(`  ${green("✓")} findings                ${findings.location}`);
}

console.log(`\n${bold("─".repeat(60))}`);
console.log(
  `${bold("Carried:")} ${green(String(carried))}   ${bold("N-A:")} ${na}   ${bold("Missing:")} ${problems ? red(String(problems)) : "0"}`
);
console.log(`${bold("─".repeat(60))}`);

if (problems) {
  console.log(
    `${red(bold(`\nRED — ${problems} declared feature-doc artifact(s) missing.`))} (add the artifact, or set the section null for a conscious N-A.)\n`
  );
  process.exit(1);
}
console.log(
  green(
    bold(
      "\nGREEN — every declared unit carries its documentation (CANON-DEVELOPMENT-PROCESS §5/§6).\n"
    )
  )
);
process.exit(0);
