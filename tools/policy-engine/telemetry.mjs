/**
 * policy-engine/telemetry.mjs — advisory OTLP-named local JSONL emitter for engine
 * verdicts (S3; seeds roadmap item 6, REFERENCE-POLICY-ENGINE-001 §7).
 *
 * Appends one JSON line per `evaluate()` outcome, using OTLP LogRecord FIELD NAMING
 * only (`timeUnixNano`, `severityText`, `body`, `attributes`) — it is NOT a full OTLP
 * payload: attributes are a plain JSON object (not OTLP KeyValue/AnyValue encoding)
 * and records are not wrapped in LogsData→ResourceLogs→ScopeLogs. No OTLP SDK, no
 * dependency, no network export; an exporter would need a mapping step. (S3 review
 * P3: say "OTLP-named", never "OTLP-compatible".)
 * This is INSTRUMENTATION, not governance: it
 * exists so a later "doctor"/dashboard lens can read a plain, standard-shaped log of
 * what the engine decided — never a second source of verdicts.
 *
 * Fail-open BY DESIGN, and only here: recordVerdict() NEVER throws to the caller. A
 * telemetry write failure (disk full, permissions, a bad path) must not change, delay,
 * or block a policy verdict the caller already computed — advisory instrumentation
 * cannot become a covert enforcement point. Contrast with the engine's own fail-closed
 * discipline (engine.mjs §6), which governs VERDICTS, not this sidecar.
 *
 * Usage:
 *   import { recordVerdict } from "./telemetry.mjs";
 *   recordVerdict("path/to/telemetry.jsonl", {
 *     point, tool, verdict, decidingPolicy, sessionId
 *   });
 *
 * Pure Node (node:fs only), zero deps.
 */
import { appendFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

/**
 * Append one OTLP-shaped LogRecord line for an engine verdict. Never throws.
 *
 * file — destination JSONL path (parent dir created recursively).
 * fields — { point, tool, verdict, decidingPolicy, sessionId } (all optional except
 *          verdict/point are expected to be meaningful — undefined attributes are
 *          simply omitted, never written as null/empty).
 */
export function recordVerdict(file, { point, tool, verdict, decidingPolicy, sessionId } = {}) {
  try {
    const attributes = {};
    if (point !== undefined) attributes["policy.point"] = point;
    if (tool !== undefined) attributes["policy.tool"] = tool;
    if (verdict !== undefined) attributes["policy.verdict"] = verdict;
    if (decidingPolicy !== undefined) attributes["policy.deciding"] = decidingPolicy;
    if (sessionId !== undefined) attributes["policy.session_id"] = sessionId;

    const record = {
      timeUnixNano: String(Date.now() * 1e6),
      severityText: verdict === "DENY" || verdict === "ASK" ? "WARN" : "INFO",
      body: `${verdict ?? "?"} ${decidingPolicy ?? "no-objection"}`,
      attributes,
    };

    mkdirSync(dirname(file), { recursive: true });
    appendFileSync(file, `${JSON.stringify(record)}\n`, "utf8");
  } catch {
    // Fail-open BY DESIGN (see file header): telemetry is advisory instrumentation,
    // never a policy — a write failure here must never surface to, delay, or change
    // the caller's already-computed verdict.
  }
}
