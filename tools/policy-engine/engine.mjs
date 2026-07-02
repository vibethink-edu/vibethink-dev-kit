/**
 * policy-engine/engine.mjs — the kit's zero-dependency REFERENCE implementation of
 * CANON-RUNTIME-POLICY-ENGINE-001 (SEALED): runtime governance by policy
 * interception. Every action is evaluated against the live session and receives a
 * verdict — ALLOW, ASK, or DENY — composed across policies in declared order,
 * carrying state, failing closed.
 *
 * This module is the PURE CORE: no filesystem, no process, no harness — a single
 * exported `evaluate(event, state, policies)` plus the manifest compiler that turns
 * a policy manifest's `enforce` blocks (REFERENCE-POLICY-MANIFESTS-001) into
 * policies. Harness adapters (hooks, CLI wrappers) live OUTSIDE this file and stay
 * thin; the core is tested without any harness (L1 fire-test discipline).
 *
 * Contract conformance (the canon's § in parentheses):
 *   - typed enforcement points, a policy declares where it fires (§2)
 *   - verdict ∈ {ALLOW, ASK, DENY}; ALLOW may carry a replacement payload (§3)
 *   - declared-order composition: DENY short-circuits (and applies the writes
 *     accumulated so far); ASK accumulates and WITHHOLDS ALL WRITES until
 *     approval; ALLOW continues. The composed result names the deciding policy (§4)
 *   - per-session state policies read and update: counters, risk, cost, labels (§5)
 *   - fail-closed: a policy that throws (or returns a verdict outside its declared
 *     set, or is malformed) DENIES — except a declared advisory policy fails to
 *     ALLOW and a declared approval-gate fails to ASK (§6)
 *   - the shared static floor (identity / destruction / secrets / arbitrary-exec,
 *     CANON-CODER-ORCHESTRATION-001 §7) is a built-in, NON-REMOVABLE backstop:
 *     no caller-supplied policy list can dissolve it (§8, anti-pattern §10)
 *
 * Never gate on a vendor model id — gate on tier/capability (§7). This file names
 * no vendor, model, or harness.
 */

export const POINTS = Object.freeze(["request", "pre-model", "tool-call", "tool-result"]);
export const VERDICTS = Object.freeze(["ALLOW", "ASK", "DENY"]);

/** Fresh per-session state (§5). The L3/adapter owns where it is stored. */
export function createSessionState(seed = {}) {
  return { counters: {}, risk: 0, cost_usd: 0, labels: {}, ...seed };
}

function getPath(obj, key) {
  return String(key)
    .split(".")
    .reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

function setPath(obj, key, value) {
  const parts = String(key).split(".");
  let o = obj;
  for (const k of parts.slice(0, -1)) {
    if (o[k] == null || typeof o[k] !== "object") o[k] = {};
    o = o[k];
  }
  o[parts[parts.length - 1]] = value;
}

/**
 * Apply SET / INCREMENT / APPEND updates to session state (§5, canon §11 shape).
 * Exported so an adapter can apply a returned `withheldUpdates` AFTER a human
 * approves an ASK — never before (§3: a denied/timed-out ASK leaves no side effects).
 */
export function applyUpdates(state, updates) {
  for (const u of updates ?? []) {
    if (!u || typeof u.key !== "string") continue;
    if (u.op === "SET") setPath(state, u.key, u.value);
    else if (u.op === "INCREMENT")
      setPath(
        state,
        u.key,
        (Number(getPath(state, u.key)) || 0) + (u.value === undefined ? 1 : Number(u.value))
      );
    else if (u.op === "APPEND") {
      const cur = getPath(state, u.key);
      setPath(state, u.key, Array.isArray(cur) ? [...cur, u.value] : [u.value]);
    }
  }
  return state;
}

/** Fail-closed resolution (§6): DENY by default; advisory → ALLOW; approval-gate → ASK. */
function failClosed(policy, why) {
  if (policy?.role === "advisory")
    return { verdict: "ALLOW", reason: `advisory policy failed open by design (§6): ${why}` };
  if (policy?.role === "approval-gate")
    return { verdict: "ASK", reason: `approval-gate policy failed to ASK (§6): ${why}` };
  return { verdict: "DENY", reason: `fail-closed (§6): ${why}` };
}

/**
 * The shared static floor (CANON-CODER-ORCHESTRATION-001 §7, expressed at the
 * engine's tool-call point per CANON-RUNTIME-POLICY-ENGINE-001 §8): identity change,
 * destruction, secret reads, arbitrary execution. Always evaluated as the LAST
 * policies in every chain — the backstop under the membrane — and `evaluate` offers
 * no way to remove them: a runtime engine that lets these through is the §10
 * "dissolving the shared floor" anti-pattern. Conservative patterns on purpose:
 * the floor catches the unambiguous shapes; nuanced rules belong to real policies.
 */
function floorPolicy(cls, label, pattern) {
  return Object.freeze({
    name: `static-floor/${cls}: ${label}`,
    on: ["tool-call"],
    verdicts: ["ALLOW", "DENY"],
    evaluate(ev) {
      return pattern.test(String(ev.content ?? ""))
        ? {
            verdict: "DENY",
            reason: `shared static floor — ${cls} (${label}) never passes (CANON-CODER-ORCHESTRATION-001 §7 · CANON-RUNTIME-POLICY-ENGINE-001 §8)`,
          }
        : { verdict: "ALLOW" };
    },
  });
}

export const STATIC_FLOOR = Object.freeze([
  floorPolicy("identity", "forge identity change", /\bgh\s+auth\s+(login|logout|switch)\b/i),
  floorPolicy(
    "destruction",
    "force-push",
    /\bgit\b[^\n]*\bpush\b(?=[^\n]*(?:--force(?:-with-lease|-if-includes)?\b|\s-f\b|\s\+\S+))/
  ),
  floorPolicy("destruction", "hard reset", /\bgit\b[^\n]*\breset\b[^\n]*--hard\b/),
  floorPolicy(
    "destruction",
    "recursive delete",
    /\brm\b(?=[^\n|;&]*\s-[a-z]*r)(?=[^\n|;&]*\s-[a-z]*f)|\bremove-item\b(?=[^\n]*-recurse\b)(?=[^\n]*-force\b)/i
  ),
  floorPolicy(
    "secrets",
    "secret-file read",
    /\b(cat|type|less|more|head|tail|get-content|gc)\s+[^\s|;&]*\.env(\.[\w.]+)?\b/i
  ),
  floorPolicy(
    "arbitrary-exec",
    "pipe-to-shell",
    /\b(curl|wget|iwr|invoke-webrequest)\b[^|\n]*\|\s*(sh|bash|zsh|node|python3?|pwsh|powershell|iex)\b/i
  ),
]);

/**
 * Evaluate one action against the session (the canon's §1 root principle).
 *
 * event    — { point, content, tool?, model?, usage?, actor?, labels? } (§11 shape)
 * state    — mutable per-session state (createSessionState); updated per §4/§5
 * policies — array in DECLARED ORDER (§4; the caller owns the precedence layers:
 *            session → agent-spec → server). The static floor is appended by the
 *            engine itself and cannot be omitted.
 *
 * Returns { verdict, decidingPolicy, reason, asks, content, withheldUpdates? }:
 *   - DENY  → decidingPolicy names the denier; writes accumulated so far ARE
 *             applied (§4); nothing after the denier ran.
 *   - ASK   → asks[] carries every accumulated ask; ALL writes are withheld and
 *             returned as withheldUpdates — apply them via applyUpdates ONLY after
 *             the human approves (§3).
 *   - ALLOW → all accumulated writes applied; content carries any §3 replacement
 *             payload (e.g. a redaction) threaded through the chain.
 */
export function evaluate(event, state, policies = []) {
  if (!event || !POINTS.includes(event.point))
    throw new TypeError(`event.point must be one of: ${POINTS.join(", ")}`);
  const chain = [...policies, ...STATIC_FLOOR];
  let content = event.content;
  const pending = [];
  const asks = [];
  for (const policy of chain) {
    const on = Array.isArray(policy?.on) ? policy.on : null;
    let result;
    if (!on || typeof policy?.evaluate !== "function") {
      // A malformed policy cannot even declare its points — it fails closed at
      // every point rather than silently vanishing from the chain (§6).
      result = failClosed(policy, "malformed policy (missing on[] or evaluate())");
    } else {
      if (!on.includes(event.point)) continue;
      try {
        result = policy.evaluate({ ...event, content }, state) ?? {};
      } catch (e) {
        result = failClosed(policy, `policy threw (${e?.message ?? e})`);
      }
      const declared = Array.isArray(policy.verdicts) ? policy.verdicts : VERDICTS;
      if (!VERDICTS.includes(result.verdict) || !declared.includes(result.verdict))
        result = failClosed(
          policy,
          `returned verdict "${result.verdict}" outside the declared set`
        );
    }
    const name = policy?.name ?? "(unnamed policy)";
    if (Array.isArray(result.stateUpdates)) pending.push(...result.stateUpdates);
    if (result.verdict === "DENY") {
      applyUpdates(state, pending);
      return {
        verdict: "DENY",
        decidingPolicy: name,
        reason: result.reason ?? null,
        asks,
        content,
      };
    }
    if (result.verdict === "ASK") {
      asks.push({ policy: name, reason: result.reason ?? null });
      continue;
    }
    if (result.data !== undefined) content = result.data;
  }
  if (asks.length > 0)
    return {
      verdict: "ASK",
      decidingPolicy: asks[0].policy,
      reason: asks[0].reason,
      asks,
      content,
      withheldUpdates: pending,
    };
  applyUpdates(state, pending);
  return { verdict: "ALLOW", decidingPolicy: null, reason: null, asks, content };
}

/**
 * Compile a policy manifest's `enforce` blocks (REFERENCE-POLICY-MANIFESTS-001)
 * into engine policies — the engine CONSUMING machine-readable law. Only rules
 * carrying `enforce` compile; judgment rules stay watched by gates / golden tasks /
 * review and MUST NOT be forced into matchers.
 *
 * enforce = { point: <§2 point or array>, verdict: <§3 verdict>,
 *             match: { pattern, tool?, captureNotInStateLabel?, unlessStateLabel? } }
 *
 * The matcher is declarative over the action's SHAPE — never NLP at runtime.
 * `captureNotInStateLabel` makes membership mechanical: the pattern's first
 * capture is looked up in state.labels[<label>] (an array the adapter feeds, e.g.
 * the ports a repo declares); a member → ALLOW, anything else — including a
 * MISSING label — takes the rule's verdict. That absence path is deliberate
 * fail-closed (e.g. CANON-PORT-ASSIGNMENT-001 §3: no declaration → refuse).
 * `unlessStateLabel` (S2) is the GOVERNED-EXEMPTION shape for rules whose prose
 * declares one lawful exception (e.g. GIT-HYGIENE §7's create-only comm lane):
 * a truthy state.labels[<label>] — set by the governed flow itself, never by the
 * tempted agent's prose — abstains the rule; absent, the verdict applies. The
 * label mechanizes the exception WITHOUT weakening the default (fail-closed).
 */
export function compileManifest(manifest) {
  const policies = [];
  for (const rule of manifest?.rules ?? []) {
    const enf = rule?.enforce;
    if (!enf) continue;
    // Fail-closed compiler: EVERY declared point must be in range. Filtering the
    // bad ones out would silently narrow where a policy fires (a mixed
    // ["tool-call","bad-point"] must refuse to compile, not degrade — S1 review P2).
    const points = Array.isArray(enf.point) ? enf.point : [enf.point];
    if (
      points.length === 0 ||
      !points.every((p) => POINTS.includes(p)) ||
      !VERDICTS.includes(enf.verdict) ||
      typeof enf.match?.pattern !== "string"
    )
      throw new Error(
        `${manifest?.id ?? "?"} ${rule?.id ?? "?"}: malformed enforce block (check-policy-manifests validates the shape before the engine ever sees it)`
      );
    const re = new RegExp(enf.match.pattern);
    const notInLabel = enf.match.captureNotInStateLabel;
    const unlessLabel = enf.match.unlessStateLabel;
    policies.push({
      name: `${manifest.id}/${rule.id}`,
      on: points,
      verdicts: [enf.verdict, "ALLOW"],
      evaluate(ev, state) {
        if (enf.match.tool && ev.tool !== enf.match.tool) return { verdict: "ALLOW" };
        if (unlessLabel && state?.labels?.[unlessLabel]) return { verdict: "ALLOW" };
        const m = re.exec(String(ev.content ?? ""));
        if (!m) return { verdict: "ALLOW" };
        if (notInLabel) {
          const captured = m.slice(1).find((g) => g !== undefined);
          const declared = state?.labels?.[notInLabel];
          if (
            captured !== undefined &&
            Array.isArray(declared) &&
            declared.map(String).includes(String(captured))
          )
            return { verdict: "ALLOW" };
        }
        return {
          verdict: enf.verdict,
          reason: `${manifest.id} ${rule.id} (${rule.cite}): ${rule.rule}`,
        };
      },
    });
  }
  return policies;
}
