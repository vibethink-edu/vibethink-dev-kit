/**
 * policy-engine/telemetry-lens.mjs — the CONSUMPTION side of the S3 telemetry
 * emitter (roadmap item 6; REFERENCE-POLICY-ENGINE-001 §7, S3-P4): pure functions
 * that read the OTLP-named JSONL the engine/adapter appends and answer "what has
 * the law actually been deciding?".
 *
 * This is a LENS, not a gate and not a second source of verdicts: it never
 * evaluates policy, never alters state, and a missing/empty/corrupt log is a
 * reportable condition ("no data", "N malformed lines"), never a crash — the
 * same advisory posture as the emitter (telemetry.mjs fail-open).
 *
 * What it measures (each maps to a governance action):
 *   - volume + verdict mix (ALLOW/DENY/ASK) and emission window/freshness
 *       → is the wire alive? is friction growing?
 *   - DENY/ASK ranking by deciding rule
 *       → which law generates friction; candidates for prose/pattern review
 *   - friction streaks: ≥ threshold consecutive DENYs, same session+rule
 *       → an agent hitting a wall repeatedly (over-match suspect, or a flow
 *         that needs a governed grant) — worth a human look either way
 *   - never-fired enforceable rules (needs the manifest rule names)
 *       → deterrence or a dead pattern; prove which with a known-bad, never
 *         assume (CANON-AUDIT-PROTOCOL §8.7a)
 *
 * Pure Node (no I/O in this module — the caller reads files), zero deps.
 */

/**
 * Parse raw JSONL text into telemetry records. Never throws.
 * Returns { records, malformed } — a line that is not valid JSON, or has no
 * `attributes` object, counts as malformed and is excluded (the count is
 * surfaced, not swallowed).
 */
export function parseTelemetryLines(text) {
  const records = [];
  let malformed = 0;
  for (const line of String(text ?? "").split(/\r?\n/)) {
    if (line.trim() === "") continue;
    try {
      const rec = JSON.parse(line);
      if (typeof rec !== "object" || rec === null || typeof rec.attributes !== "object" || rec.attributes === null) {
        malformed++;
        continue;
      }
      records.push(rec);
    } catch {
      malformed++;
    }
  }
  return { records, malformed };
}

/**
 * Aggregate parsed records into the report summary.
 *
 * records — output of parseTelemetryLines (order preserved = append order).
 * opts.enforceableRuleNames — string[] of compiled rule names (manifest law +
 *   static floor) to cross for never-fired reporting; omit to skip that section.
 * opts.streakThreshold — consecutive DENYs (same session+rule) that count as a
 *   friction streak (default 3).
 * opts.nowMs — "now" for freshness math (caller-supplied, keeps this pure).
 */
export function summarizeTelemetry(records, { enforceableRuleNames, streakThreshold = 3, nowMs } = {}) {
  const byVerdict = { ALLOW: 0, DENY: 0, ASK: 0, OTHER: 0 };
  const byRule = new Map(); // rule -> { DENY, ASK }
  const sessions = new Map(); // session -> { total, deny }
  const streaks = [];
  const live = new Map(); // session -> { rule, length } current DENY run
  let firstMs = null;
  let lastMs = null;

  for (const rec of records) {
    const a = rec.attributes;
    const verdict = typeof a["policy.verdict"] === "string" ? a["policy.verdict"] : "OTHER";
    const rule = typeof a["policy.deciding"] === "string" ? a["policy.deciding"] : null;
    const session = typeof a["policy.session_id"] === "string" ? a["policy.session_id"] : "(none)";

    byVerdict[verdict in byVerdict ? verdict : "OTHER"]++;

    const tNano = Number(rec.timeUnixNano);
    if (Number.isFinite(tNano) && tNano > 0) {
      const ms = tNano / 1e6;
      if (firstMs === null || ms < firstMs) firstMs = ms;
      if (lastMs === null || ms > lastMs) lastMs = ms;
    }

    const s = sessions.get(session) ?? { total: 0, deny: 0 };
    s.total++;
    if (verdict === "DENY") s.deny++;
    sessions.set(session, s);

    if ((verdict === "DENY" || verdict === "ASK") && rule) {
      const r = byRule.get(rule) ?? { DENY: 0, ASK: 0 };
      r[verdict]++;
      byRule.set(rule, r);
    }

    // Friction streaks: consecutive DENYs of the same rule WITHIN a session's
    // own record sequence (the file interleaves sessions; per-session order is
    // still append order). Any other verdict for that session breaks its run.
    if (verdict === "DENY" && rule) {
      const run = live.get(session);
      if (run && run.rule === rule) run.length++;
      else live.set(session, { rule, length: 1 });
    } else {
      const run = live.get(session);
      if (run && run.length >= streakThreshold) streaks.push({ session, rule: run.rule, length: run.length });
      live.delete(session);
    }
  }
  for (const [session, run] of live)
    if (run.length >= streakThreshold) streaks.push({ session, rule: run.rule, length: run.length });

  const firedRules = new Set(byRule.keys());
  const neverFired = Array.isArray(enforceableRuleNames)
    ? enforceableRuleNames.filter((n) => !firedRules.has(n))
    : null;

  return {
    total: records.length,
    byVerdict,
    window: { firstMs, lastMs },
    lastAgeMs: lastMs !== null && Number.isFinite(nowMs) ? Math.max(0, nowMs - lastMs) : null,
    rules: [...byRule.entries()]
      .map(([rule, counts]) => ({ rule, ...counts }))
      .sort((x, y) => y.DENY + y.ASK - (x.DENY + x.ASK)),
    sessions: [...sessions.entries()]
      .map(([session, counts]) => ({ session, ...counts }))
      .sort((x, y) => y.deny - x.deny),
    streaks,
    neverFired,
  };
}

const fmtAge = (ms) => {
  if (ms == null) return "unknown";
  const m = Math.round(ms / 60000);
  if (m < 1) return "<1m";
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 6) / 10;
  if (h < 48) return `${h}h`;
  return `${Math.round(h / 24)}d`;
};

/**
 * Render the summary as the report text (verdict-first, kit house style).
 * summary — output of summarizeTelemetry. sources — string[] of file paths read.
 * malformed — total malformed line count across sources.
 */
export function renderReport(summary, { sources = [], malformed = 0 } = {}) {
  const out = [];
  if (summary.total === 0) {
    out.push(`policy-telemetry report — NO DATA (0 verdict records${malformed ? `, ${malformed} malformed line(s)` : ""})`);
    out.push(`  sources: ${sources.length ? sources.join(", ") : "(none found)"}`);
    out.push(
      "  A live PreToolUse wire emits on every governed tool call — no data means no governed session ran against these sources (or telemetry is off / another session dir)."
    );
    return out.join("\n");
  }
  const v = summary.byVerdict;
  const windowTxt =
    summary.window.firstMs !== null && summary.window.lastMs !== null
      ? `window ${new Date(summary.window.firstMs).toISOString()} → ${new Date(summary.window.lastMs).toISOString()}`
      : "window unknown";
  out.push(
    `policy-telemetry report — ${summary.total} verdict record(s), ${summary.sessions.length} session(s)${malformed ? `, ${malformed} malformed line(s)` : ""}`
  );
  out.push(`  ALLOW ${v.ALLOW} · DENY ${v.DENY} · ASK ${v.ASK}${v.OTHER ? ` · OTHER ${v.OTHER}` : ""} · last emission ${fmtAge(summary.lastAgeMs)} ago · ${windowTxt}`);
  out.push(`  sources: ${sources.join(", ")}`);

  if (summary.rules.length) {
    out.push("");
    out.push("  DENY/ASK by deciding rule (friction ranking):");
    for (const r of summary.rules)
      out.push(`    ${String(r.DENY + r.ASK).padStart(4)}×  ${r.rule}${r.ASK ? `  (${r.ASK} ASK)` : ""}`);
  }

  if (summary.streaks.length) {
    out.push("");
    out.push("  friction streaks (consecutive DENYs, same session+rule — over-match suspect or a flow needing a governed grant):");
    for (const s of summary.streaks)
      out.push(`    ${s.length}× ${s.rule}  [session ${s.session}]`);
  }

  if (summary.neverFired) {
    out.push("");
    if (summary.neverFired.length) {
      out.push("  never-fired enforceable rules (deterrence or dead pattern — prove which with a known-bad, never assume):");
      for (const n of summary.neverFired) out.push(`    ${n}`);
    } else {
      out.push("  never-fired enforceable rules: none — every compiled rule has fired at least once in this window.");
    }
  }

  return out.join("\n");
}
