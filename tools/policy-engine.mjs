#!/usr/bin/env node
/**
 * policy-engine — CLI surface of the kit's reference runtime policy engine
 * (CANON-RUNTIME-POLICY-ENGINE-001; core: tools/policy-engine/engine.mjs).
 *
 * Evaluates ONE action against machine-readable law (the `enforce` blocks of
 * knowledge/policy/*.policy.json — REFERENCE-POLICY-MANIFESTS-001) plus the
 * built-in shared static floor, and answers with a verdict. This is what turns
 * "force-push forbidden" from prose an agent may not have read into a physical
 * no: a harness adapter (a PreToolUse-style hook, a command gateway) calls this
 * before the side effect and honors the exit code.
 *
 * Usage:
 *   node tools/policy-engine.mjs policies [--manifest <file> ... | --policy-dir <dir>]
 *   node tools/policy-engine.mjs eval --point <request|pre-model|tool-call|tool-result>
 *        [--tool <name>] --content <text|-> [--manifest <file> ...]
 *        [--policy-dir <dir>] [--state <file.json>]
 *
 * Policy source: every --manifest file, or every *.policy.json under --policy-dir
 * (default: knowledge/policy under the cwd when present). Rules without `enforce`
 * are judgment law — they are reported by `policies` as not mechanically enforced,
 * never guessed at runtime. --state seeds the per-session state (§5), e.g.
 * {"labels":{"declaredPorts":[4000,4100]}}; --content - reads stdin.
 *
 * Verdict-first. Exit: 0 = ALLOW · 1 = DENY · 3 = ASK (a human approval is
 * required — the caller withholds all writes until it happens) · 2 = setup error.
 * Pure Node, zero deps.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  POINTS,
  STATIC_FLOOR,
  compileManifest,
  createSessionState,
  evaluate,
} from "./policy-engine/engine.mjs";

const argv = process.argv.slice(2);
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;

function die(code, msg) {
  console.log(msg);
  process.exit(code);
}

function flags(name) {
  const out = [];
  for (let i = 0; i < argv.length - 1; i++) if (argv[i] === name) out.push(argv[i + 1]);
  return out;
}
const flag = (name) => flags(name)[0] ?? null;

const mode = argv[0];
if (!mode || !["eval", "policies"].includes(mode))
  die(
    2,
    "SETUP — usage: policy-engine <eval|policies> [--point p --tool t --content c] [--manifest f ...] [--policy-dir d] [--state f]"
  );

/* ───────────────────────────── load the law ───────────────────────────── */

let manifestFiles = flags("--manifest");
if (manifestFiles.length === 0) {
  const dir = flag("--policy-dir") ?? "knowledge/policy";
  if (!existsSync(dir))
    die(
      2,
      `SETUP — no law to consume: pass --manifest <file> (repeatable) or --policy-dir <dir> (default knowledge/policy not found here)`
    );
  manifestFiles = readdirSync(dir)
    .filter((f) => f.endsWith(".policy.json"))
    .sort()
    .map((f) => join(dir, f));
  if (manifestFiles.length === 0) die(2, `SETUP — no *.policy.json under ${dir}`);
}

const policies = [];
let enforceable = 0;
let judgment = 0;
for (const file of manifestFiles) {
  let m;
  try {
    m = JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    die(2, `SETUP — ${file} is not valid JSON (${e.message})`);
  }
  let compiled;
  try {
    compiled = compileManifest(m);
  } catch (e) {
    die(2, `SETUP — ${file}: ${e.message}`);
  }
  policies.push(...compiled);
  enforceable += compiled.length;
  judgment += (m.rules ?? []).length - compiled.length;
}

if (mode === "policies") {
  console.log(
    bold(
      `policy-engine — ${enforceable} mechanically-enforced polic${enforceable === 1 ? "y" : "ies"} from ${manifestFiles.length} manifest(s) + static floor (${STATIC_FLOOR.length}); ${judgment} judgment rule(s) stay watched by gates/golden-tasks/review\n`
    )
  );
  for (const p of policies) console.log(`  ${p.name}  [${p.on.join(", ")}]`);
  for (const p of STATIC_FLOOR)
    console.log(`  ${p.name}  [${p.on.join(", ")}]  (non-removable backstop)`);
  process.exit(0);
}

/* ─────────────────────────────── evaluate ─────────────────────────────── */

const point = flag("--point");
if (!POINTS.includes(point)) die(2, `SETUP — --point must be one of: ${POINTS.join(", ")}`);
let content = flag("--content");
if (content == null) die(2, "SETUP — eval needs --content <text|->");
if (content === "-") content = readFileSync(0, "utf8");

const state = createSessionState();
const stateFile = flag("--state");
if (stateFile) {
  try {
    Object.assign(state, JSON.parse(readFileSync(stateFile, "utf8")));
  } catch (e) {
    die(2, `SETUP — --state ${stateFile} unreadable/invalid (${e.message})`);
  }
}

const result = evaluate({ point, tool: flag("--tool") ?? undefined, content }, state, policies);

if (result.verdict === "DENY") {
  console.log(red(bold(`DENY — ${result.decidingPolicy}`)));
  console.log(`  ${result.reason ?? "(no reason returned)"}`);
  process.exit(1);
}
if (result.verdict === "ASK") {
  console.log(
    yellow(
      bold(`ASK — ${result.asks.length} approval(s) required; ALL writes withheld until approved`)
    )
  );
  for (const a of result.asks) console.log(`  ${a.policy}: ${a.reason ?? "(no reason)"}`);
  process.exit(3);
}
console.log(
  green(
    bold(
      `ALLOW — no policy objected (${policies.length} manifest polic${policies.length === 1 ? "y" : "ies"} + static floor consulted)`
    )
  )
);
process.exit(0);
