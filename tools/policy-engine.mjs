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
 *        [--policy-dir <dir>] [--state <file.json>] [--session <file.json>]
 *        [--telemetry <file.jsonl>]
 *   node tools/policy-engine.mjs approve --session <file.json> --key <pending-key>
 *   node tools/policy-engine.mjs deny    --session <file.json> --key <pending-key>
 *
 * Policy source: every --manifest file, or every *.policy.json under --policy-dir
 * (default: knowledge/policy under the cwd when present). Rules without `enforce`
 * are judgment law — they are reported by `policies` as not mechanically enforced,
 * never guessed at runtime. --state seeds the per-session state (§5), e.g.
 * {"labels":{"declaredPorts":[4000,4100]}}; --content - reads stdin.
 *
 * Sessions (S2, §3/§5): --session persists state across calls (one JSON per
 * session). An ASK parks its withheld writes as a PENDING under the action's key
 * (printed with the verdict); `approve` is the ONLY path that applies them,
 * `deny` drops them unapplied — a denied ASK leaves no side effects.
 *
 * Grants (S2 review P1): --grant <name> (repeatable) attaches a CALL-TIME grant
 * to the event (event.labels) for `unlessGrant` exemptions. A grant is the
 * governed invoker's provenance — it is never read from (or written to) the
 * session file, which an agent with shell access could forge.
 *
 * Telemetry (S3, advisory — never alters a verdict): --telemetry <file.jsonl>
 * (or env POLICY_ENGINE_TELEMETRY as a fallback) appends one OTLP-shaped LogRecord
 * per eval to the given file (tools/policy-engine/telemetry.mjs). Omit both to skip
 * telemetry entirely — it is opt-in, not a silent default.
 *
 * Verdict-first. Exit: 0 = ALLOW · 1 = DENY · 3 = ASK (a human approval is
 * required — the caller withholds all writes until it happens) · 2 = setup error.
 * Pure Node, zero deps.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import {
  POINTS,
  STATIC_FLOOR,
  compileManifest,
  createSessionState,
  evaluate,
} from "./policy-engine/engine.mjs";
import {
  loadSession,
  pendingKey,
  recordPending,
  saveSession,
  settlePending,
} from "./policy-engine/session-store.mjs";
import { recordVerdict } from "./policy-engine/telemetry.mjs";

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
if (!mode || !["eval", "policies", "approve", "deny"].includes(mode))
  die(
    2,
    "SETUP — usage: policy-engine <eval|policies|approve|deny> [--point p --tool t --content c] [--manifest f ...] [--policy-dir d] [--state f] [--session f] [--key k]"
  );

/* ─────────────── settle a pending ASK (§3 — the approval surface) ─────────────── */

if (mode === "approve" || mode === "deny") {
  const sessionFile = flag("--session");
  const key = flag("--key");
  if (!sessionFile || !key)
    die(2, `SETUP — ${mode} needs --session <file> and --key <pending-key>`);
  if (!existsSync(sessionFile)) die(2, `SETUP — session file not found: ${sessionFile}`);
  const session = loadSession(sessionFile);
  const settled = settlePending(session, key, { approve: mode === "approve" });
  if (!settled) die(2, `SETUP — no pending ASK under key "${key}" in ${sessionFile}`);
  saveSession(sessionFile, session);
  console.log(
    settled.approved
      ? green(bold(`APPROVED — ${settled.updates} withheld update(s) applied to the session (§3)`))
      : yellow(
          bold(
            `DENIED — ${settled.updates} withheld update(s) dropped unapplied (§3: no side effects)`
          )
        )
  );
  process.exit(0);
}

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

const sessionFile = flag("--session");
const session = sessionFile ? loadSession(sessionFile) : null;
const state = session ? session.state : createSessionState();
const stateFile = flag("--state");
if (stateFile) {
  try {
    Object.assign(state, JSON.parse(readFileSync(stateFile, "utf8")));
  } catch (e) {
    die(2, `SETUP — --state ${stateFile} unreadable/invalid (${e.message})`);
  }
}

const grants = Object.fromEntries(flags("--grant").map((g) => [g, true]));
const event = {
  point,
  tool: flag("--tool") ?? undefined,
  content,
  ...(Object.keys(grants).length ? { labels: grants } : {}),
};
const result = evaluate(event, state, policies);

// Telemetry (S3, advisory — recorded AFTER the verdict, never influences it).
// sessionId = the --session file's basename without extension, when present.
const telemetryFile = flag("--telemetry") ?? process.env.POLICY_ENGINE_TELEMETRY ?? null;
if (telemetryFile) {
  recordVerdict(telemetryFile, {
    point,
    tool: event.tool,
    verdict: result.verdict,
    decidingPolicy: result.decidingPolicy ?? undefined,
    sessionId: sessionFile ? basename(sessionFile).replace(/\.[^.]+$/, "") : undefined,
  });
}

if (result.verdict === "DENY") {
  if (session) saveSession(sessionFile, session); // §4: a DENY applied the accumulated writes
  console.log(red(bold(`DENY — ${result.decidingPolicy}`)));
  console.log(`  ${result.reason ?? "(no reason returned)"}`);
  process.exit(1);
}
if (result.verdict === "ASK") {
  let key = null;
  if (session) {
    key = pendingKey(event);
    recordPending(session, key, { asks: result.asks, withheldUpdates: result.withheldUpdates });
    saveSession(sessionFile, session); // pendings parked; state untouched (§3)
  }
  console.log(
    yellow(
      bold(`ASK — ${result.asks.length} approval(s) required; ALL writes withheld until approved`)
    )
  );
  for (const a of result.asks) console.log(`  ${a.policy}: ${a.reason ?? "(no reason)"}`);
  if (key)
    console.log(
      `  pending key: ${key}  (policy-engine approve --session ${sessionFile} --key ${key})`
    );
  process.exit(3);
}
if (session) saveSession(sessionFile, session); // ALLOW applied its writes (§4)
console.log(
  green(
    bold(
      `ALLOW — no policy objected (${policies.length} manifest polic${policies.length === 1 ? "y" : "ies"} + static floor consulted)`
    )
  )
);
process.exit(0);
