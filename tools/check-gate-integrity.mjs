#!/usr/bin/env node
/**
 * check-gate-integrity.mjs — the gate that audits the gates. Makes
 * CANON-AUDIT-PROTOCOL §8.7(a) bite for a repo's own verifiers.
 *
 * §8.7: a gate is not "ready" until (a) it is DEMONSTRATED TO FAIL on a known-bad
 * input, and (b) it is required/blocking. (b) is an L3 concern — branch protection
 * is per-repo and per-forge, not portable, so a kit gate cannot read it. This gate
 * enforces the PORTABLE half, (a): every declared gate ships with a paired test that
 * proves it goes RED on a bad input. A gate whose test only exercises the happy path
 * has never been shown to catch the thing it exists to catch — it is false assurance,
 * the §8 root failure produced at install time.
 *
 * What it checks, per gate file in scope:
 *   1. a paired test exists  (no test → unprovable → RED)
 *   2. that test declares ≥1 known-bad case — an assertion that the gate FAILS
 *      (a non-zero exit, a failing verdict string, a non-empty error collection, or a
 *      test case labelled as a negative path). Happy-path-only → RED.
 * It verifies the falsifiability EVIDENCE is present; the runtime proof is the test
 * suite itself (which CI runs). Together: the suite proves the red runs; this gate
 * stops a gate from shipping WITHOUT such a test. It is itself a gate → it is itself
 * in scope (it has its own known-bad test): the rule applies to its enforcer too.
 *
 * Config-driven, skip-when-no-config (devkit-doctor skips it where no config exists).
 * Verdict-first. Exit: 0 = GREEN · 1 = RED (a gate is unprovable) · 2 = setup error
 * (missing/invalid config, or zero gates matched — a meta-gate that audits nothing is
 * itself false-green, §8.6). Pure Node, zero deps.
 *
 * Run: node tools/check-gate-integrity.mjs tools/gate-integrity.config.json
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const CWD = process.cwd();
const configRel = process.argv[2];

function die(code, msg) {
  console.log(msg);
  process.exit(code);
}

if (!configRel)
  die(2, "RED — setup error: no config path given (usage: check-gate-integrity <config>)");

const configPath = join(CWD, configRel);
if (!existsSync(configPath)) die(2, `RED — setup error: config not found at ${configRel}`);

let cfg;
try {
  cfg = JSON.parse(readFileSync(configPath, "utf8"));
} catch (e) {
  die(2, `RED — setup error: config not valid JSON (${e.message})`);
}

const auditDir = cfg.auditDir || "tools";
const testSuffix = cfg.testSuffix || ".test.mjs";
const exclude = new Set(cfg.exclude || []);
const pattern = new RegExp(cfg.gatePattern || "^check-.*\\.mjs$");

const dirPath = join(CWD, auditDir);
if (!existsSync(dirPath)) die(2, `RED — setup error: auditDir not found: ${auditDir}`);

// A known-bad case = the paired test asserts the gate FAILS. These match the real
// assertion idioms (a non-zero exit, a failing verdict, a non-empty error set, or a
// negative-path label). A gate whose test matches none has only happy-path coverage.
// Note: this is falsifiability EVIDENCE in the test, not a runtime proof — so it must
// be broad enough that every genuine negative test matches. A future test that fails
// to match should be NORMALISED to a recognised idiom, never allowlisted (§8.1).
const KNOWN_BAD = [
  /assert\.\w+\(\s*[\w.]*\b(?:code|status|exitcode)\b\s*,\s*[1-9]/i, // assert.equal(code, 1, ...)
  /\b(?:code|status|exitCode)\s*===?\s*[1-9]/, // code === 1
  /assert\.match\([^,]+,\s*\/[^/]*\b(?:FAIL|FAILED|RED|REFUSED|ERROR|INVALID|VIOLATION|MISSING|DRIFT)\b/i,
  /\b(?:errors|violations|problems|failures|offenders|leaks)\b[\s\S]{0,80}?\.length\s*,\s*[1-9]/i,
  /\bok\s*[,:]\s*false\b/,
  /\btest\(\s*[`'"][^`'"]*\b(?:refus|fail|invalid|missing|collis|reject|bad|error|drift|out of sync|exit\s*[1-9]|→\s*ref|→\s*fail)/i,
];
const provesFailure = (src) => KNOWN_BAD.some((re) => re.test(src));

const gates = readdirSync(dirPath)
  .filter((f) => pattern.test(f) && !f.endsWith(testSuffix) && !exclude.has(f))
  .sort();

if (gates.length === 0) {
  die(
    2,
    `RED — setup error: no gates matched ${pattern} in ${auditDir} — a meta-gate that audits nothing is false-green (§8.6). Fix the config.`
  );
}

const offenses = [];
for (const gate of gates) {
  const testName = gate.replace(/\.mjs$/, testSuffix);
  const testPath = join(dirPath, testName);
  if (!existsSync(testPath)) {
    offenses.push(
      `${gate}: no paired test (${testName}) — unprovable, never shown to fail (§8.7a)`
    );
    continue;
  }
  const src = readFileSync(testPath, "utf8");
  if (!provesFailure(src)) {
    offenses.push(
      `${gate}: ${testName} has no known-bad case — only happy-path; the gate has never been shown to go RED (§8.7a)`
    );
  }
}

if (offenses.length === 0) {
  console.log(
    `GREEN — gate integrity: ${gates.length} gate(s), each ships a test that proves it FAILS on a known-bad input (§8.7a). (Required/blocking, §8.7b, is an L3 branch-protection concern — not checked here.)`
  );
  process.exit(0);
}

console.log(
  `RED — gate integrity: ${offenses.length}/${gates.length} gate(s) are false assurance (§8.7a):`
);
for (const o of offenses) console.log(`  ✗ ${o}`);
console.log(
  "\nFix: give each gate a paired test with a known-bad case that asserts the gate fails (a non-zero exit / a failing verdict). A gate you cannot make fail is not a check."
);
process.exit(1);
