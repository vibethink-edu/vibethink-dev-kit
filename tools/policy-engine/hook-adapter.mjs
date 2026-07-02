#!/usr/bin/env node
/**
 * policy-engine/hook-adapter.mjs — the thin PreToolUse-style harness adapter
 * (CANON-RUNTIME-POLICY-ENGINE-001; design decision 3 of the item-3 handoff;
 * shipped by S2). The core stays harness-free; THIS file speaks one harness wire
 * shape — the de-facto pre/post tool-hook JSON: stdin
 * `{hook_event_name, tool_name, tool_input, session_id}` → stdout
 * `{hookSpecificOutput: {permissionDecision: allow|ask|deny, ...}}`. An L3 on a
 * different harness copies this file and rewrites ONLY the wire mapping.
 *
 * This closes the §3 approval loop with the harness's OWN permission prompt as
 * the real approval surface:
 *   - pre  (PreToolUse):  evaluate → ALLOW/DENY pass through; ASK → the verdict
 *          maps to the harness "ask" AND the withheld writes are parked in the
 *          session store under the action's key. Nothing has been applied.
 *   - post (PostToolUse): the tool RAN — that IS the human's approval — so the
 *          parked writes for this exact action are settled+applied (§11.4
 *          ask-once: an approval label in those writes prevents re-asking).
 *          A denied/timed-out ASK never reaches post → the pending is never
 *          applied → no side effects (§3).
 *
 * Fail-closed (§6): ANY internal failure emits a DENY decision, never silence.
 *
 * Usage (wired as a harness hook):
 *   node tools/policy-engine/hook-adapter.mjs [--policy-dir knowledge/policy]
 *        [--manifest <file> ...] [--session-dir <dir>]
 * The mode comes from stdin's hook_event_name (Pre... vs Post...); sessions
 * persist per session_id under --session-dir (default: .policy-sessions,
 * gitignore it).
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { compileManifest, evaluate } from "./engine.mjs";
import {
  loadSession,
  pendingKey,
  recordPending,
  saveSession,
  settlePending,
} from "./session-store.mjs";

const argv = process.argv.slice(2);
function flags(name) {
  const out = [];
  for (let i = 0; i < argv.length - 1; i++) if (argv[i] === name) out.push(argv[i + 1]);
  return out;
}
const flag = (name) => flags(name)[0] ?? null;

function emit(decision, reason, extra = {}) {
  process.stdout.write(
    `${JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: decision,
        permissionDecisionReason: reason,
        ...extra,
      },
    })}\n`
  );
}

try {
  const input = JSON.parse(readFileSync(0, "utf8") || "{}");
  const eventName = String(input.hook_event_name ?? "PreToolUse");
  const toolName = String(input.tool_name ?? "");
  const toolInput = input.tool_input;
  // The action's content: a shell-ish tool contributes its command line; anything
  // else is matched against its serialized input (declarative shape, never NLP).
  const content =
    typeof toolInput === "string"
      ? toolInput
      : (toolInput?.command ?? JSON.stringify(toolInput ?? {}));
  const tool = /bash|shell|powershell|terminal/i.test(toolName) ? "bash" : toolName.toLowerCase();
  const event = { point: "tool-call", tool, content };

  const sessionDir = flag("--session-dir") ?? ".policy-sessions";
  const sessionFile = join(sessionDir, `${String(input.session_id ?? "default")}.json`);
  const session = loadSession(sessionFile);

  if (/^post/i.test(eventName)) {
    // The tool ran → the human approved the ASK (if one was parked) → apply.
    const settled = settlePending(session, pendingKey(event), { approve: true });
    if (settled) saveSession(sessionFile, session);
    process.stdout.write("{}\n");
    process.exit(0);
  }

  let manifestFiles = flags("--manifest");
  if (manifestFiles.length === 0) {
    const dir = flag("--policy-dir") ?? "knowledge/policy";
    manifestFiles = existsSync(dir)
      ? readdirSync(dir)
          .filter((f) => f.endsWith(".policy.json"))
          .sort()
          .map((f) => join(dir, f))
      : [];
  }
  if (manifestFiles.length === 0)
    throw new Error("no policy manifests found (law is required, §6)");
  const policies = manifestFiles.flatMap((f) =>
    compileManifest(JSON.parse(readFileSync(f, "utf8")))
  );

  const result = evaluate(event, session.state, policies);
  if (result.verdict === "ASK") {
    const key = pendingKey(event);
    recordPending(session, key, { asks: result.asks, withheldUpdates: result.withheldUpdates });
    saveSession(sessionFile, session);
    emit("ask", `${result.reason ?? "policy approval required"} [pending:${key}]`);
  } else {
    saveSession(sessionFile, session); // ALLOW/DENY applied their writes (§4)
    emit(
      result.verdict === "DENY" ? "deny" : "allow",
      result.verdict === "DENY"
        ? `${result.decidingPolicy}: ${result.reason}`
        : "no policy objected"
    );
  }
  process.exit(0);
} catch (e) {
  emit("deny", `policy hook failed closed (§6): ${e?.message ?? e}`);
  process.exit(0);
}
