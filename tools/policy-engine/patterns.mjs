/**
 * policy-engine/patterns.mjs — the canon's §7 policy-pattern menu as code
 * (CANON-RUNTIME-POLICY-ENGINE-001 §7 · worked examples §11.1/§11.2), shipped by
 * S2. These are the CONTEXTUAL policies a flat allowlist structurally cannot
 * express: they read and update per-session state (cost, risk, counters).
 *
 * Factories, not policy objects: the kit ships the PATTERN; every threshold,
 * tier name, and point value is the CALLER's (L3) — per §7's rule the kit never
 * hard-codes a tier and NOTHING here gates on a vendor model id.
 *
 * Zero deps, pure (no filesystem): state persistence is the session store's job.
 */

/**
 * §11.1 — cost / capability-tier downgrade-gate. Past `hardUsd` on an expensive
 * tier → DENY with a steer (switch tier and retry); crossing an unapproved soft
 * threshold → ASK once (the approval label rides the withheld updates, §11.4).
 */
export function costDowngradeGate({
  name = "cost-downgrade-gate",
  hardUsd,
  softUsd = [],
  expensiveTiers = [],
}) {
  if (typeof hardUsd !== "number") throw new TypeError(`${name}: hardUsd (number) is required`);
  return {
    name,
    role: "approval-gate",
    on: ["pre-model"],
    verdicts: ["ALLOW", "ASK", "DENY"],
    evaluate(ev, state) {
      const cost = Number(state?.cost_usd) || 0;
      if (cost >= hardUsd && expensiveTiers.includes(ev.model))
        return {
          verdict: "DENY",
          reason: `budget hit ($${cost} >= $${hardUsd}) on an expensive tier — switch to a cheaper tier and retry (§11.1 steer)`,
        };
      const crossed = softUsd.find((t) => cost >= t && !state?.labels?.[`approved:budget:${t}`]);
      if (crossed !== undefined)
        return {
          verdict: "ASK",
          reason: `session spend crossed $${crossed} — continue?`,
          stateUpdates: [{ op: "SET", key: `labels.approved:budget:${crossed}`, value: true }],
        };
      return { verdict: "ALLOW" };
    },
  };
}

/**
 * §11.2 — risk-score accumulation + escalation. Points accrue per tool call and
 * per sensitive label seen in results; past `threshold`, guarded tools ASK.
 */
export function riskScore({
  name = "risk-score",
  points = {},
  resultLabels = {},
  threshold,
  guardedTools = [],
}) {
  if (typeof threshold !== "number") throw new TypeError(`${name}: threshold (number) is required`);
  return {
    name,
    role: "approval-gate",
    on: ["tool-call", "tool-result"],
    verdicts: ["ALLOW", "ASK"],
    evaluate(ev, state) {
      if (
        ev.point === "tool-call" &&
        guardedTools.includes(ev.tool) &&
        (Number(state?.risk) || 0) >= threshold
      )
        return {
          verdict: "ASK",
          reason: `elevated session risk (${state.risk} >= ${threshold}) — approve this ${ev.tool} action?`,
        };
      if (ev.point === "tool-call" && points[ev.tool])
        return {
          verdict: "ALLOW",
          stateUpdates: [{ op: "INCREMENT", key: "risk", value: points[ev.tool] }],
        };
      if (ev.point === "tool-result") {
        const hit = Object.keys(resultLabels).find((label) =>
          String(ev.content ?? "").includes(label)
        );
        if (hit)
          return {
            verdict: "ALLOW",
            stateUpdates: [{ op: "INCREMENT", key: "risk", value: resultLabels[hit] }],
          };
      }
      return { verdict: "ALLOW" };
    },
  };
}

/**
 * §7 rate-limit — cap actions per session. Every matching tool-call increments a
 * counter; past `maxPerSession` the call is DENIED (a cap is a hard stop, not a
 * conversation).
 */
export function rateLimit({ name = "rate-limit", maxPerSession, tools = null }) {
  if (typeof maxPerSession !== "number")
    throw new TypeError(`${name}: maxPerSession (number) is required`);
  return {
    name,
    on: ["tool-call"],
    verdicts: ["ALLOW", "DENY"],
    evaluate(ev, state) {
      if (Array.isArray(tools) && !tools.includes(ev.tool)) return { verdict: "ALLOW" };
      const used = Number(state?.counters?.tool_calls) || 0;
      if (used >= maxPerSession)
        return {
          verdict: "DENY",
          reason: `session rate limit reached (${used}/${maxPerSession} tool calls) — §7 rate-limit`,
        };
      return {
        verdict: "ALLOW",
        stateUpdates: [{ op: "INCREMENT", key: "counters.tool_calls", value: 1 }],
      };
    },
  };
}
