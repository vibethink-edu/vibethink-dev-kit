# CANON-RUNTIME-POLICY-ENGINE-001 — Runtime governance by policy interception (ALLOW / ASK / DENY)

**Status:** PROPOSED 2026-06-16 — drafted by the dev-kit architect from the orchestration prior-art per `ADR-20260616-runtime-policy-engine` (ACCEPTED · `DECISION-REGISTER` D-009). **Seal = the Principal Architect's merge.**
**Date:** 2026-06-16
**Scope:** Every repo running AI agents whose actions (tool calls, model requests) warrant runtime governance **beyond a static permission file**. Vendor-neutral, product-neutral, harness-neutral, model-neutral.
**Home:** the dev-kit (supra-repo). Inherited by every repo as upstream → fork. The kit names the **contract**; the **engine is L3** (each product builds it on its own pain).
**Companion canons:** [`CANON-CODER-ORCHESTRATION-001`](./CANON-CODER-ORCHESTRATION-001.md) (the **static** harness allow/deny — this canon's runtime sibling; §7's "never allowlisted" floor is **shared**, not restated here) · [`CANON-MULTI-AGENT-ORCHESTRATION`](./CANON-MULTI-AGENT-ORCHESTRATION.md) (§3 the safety boundary — *automate the machine-verifiable, escalate judgment* — the principle this canon mechanizes; §4 the human keeps stop/redirect) · [`CANON-DEVELOPMENT-PROCESS`](../methodology/CANON-DEVELOPMENT-PROCESS.md) (§6 findings — a recurring DENY/ASK is a finding, not a silent friction).

## 1. Root principle

> **Govern an agent at runtime by intercepting each action and returning a verdict — ALLOW, ASK, or DENY — composed across policies, carrying state, failing closed.**

A static permission file (`CANON-CODER-ORCHESTRATION-001` §4) answers *"is this command shape allowed?"* once, statelessly, at the harness. It cannot see **accumulated** context — cost burned, risk built up, which model tier is active, how many calls so far. Runtime governance can: it evaluates each action against the **live session**, so a rule may depend on *what has happened*, not just the command's shape.

## 2. Enforcement points

A policy declares which point(s) it fires on; the engine skips the rest:

- **request** — a user/turn input, before the model runs.
- **pre-model** — the assembled model request (instructions + messages + tool schemas).
- **tool-call** — before a tool/command executes.
- **tool-result** — after a tool returns (gate on what came back).

The names are illustrative; an L3 engine maps them to its harness. The principle is **typed enforcement points**, not ad-hoc scattered hooks.

## 3. The verdict

Every policy returns exactly one of:

- **ALLOW** — proceed. May carry a **replacement payload** the site substitutes for the original content (e.g. a redacted version of the tool arguments or result).
- **ASK** — pause for a human approval (an elicitation). **Approval is stateful**: approve once per threshold; a **denied or timed-out ASK leaves no side effects** (writes withheld).
- **DENY** — block, with a human-readable reason. May **steer** (e.g. "switch to a cheaper tier and retry") rather than hard-stop.

## 4. Composition & precedence

Policies evaluate **in declared order**:

- a **DENY short-circuits** the chain (and applies the writes accumulated by earlier ALLOWs);
- an **ASK accumulates** — its reason is collected and **all writes are withheld** until approval;
- an **ALLOW continues**.

The composed result names the **deciding policy** (for observability and per-policy approval timeouts).

**Stacking (precedence layers):** **session (the user) → agent-spec (the developer) → server/admin**, evaluated in that order — so a user-session policy can DENY-short-circuit before the spec/admin policies run. An L3 binds which layers it exposes.

## 5. Session state

The engine carries per-session state that policies **read and update**: counters, an accumulated **risk score**, cumulative **cost / token usage**, and **labels**. State persists across turns where the L3 stores it. This is what makes a rule **contextual** (a budget, a risk threshold) instead of a flat per-call check.

## 6. Fail-closed

A policy that throws **DENIES by default**. The only exceptions:

- a policy declared **advisory / classifier-only** fails to **ALLOW** (it never blocks by design);
- a declared **approval-gate** policy fails to **ASK** (never silently ALLOW).

A broken guard **never fails open**. Returned verdicts are validated against the policy's declared verdict set; a mismatch takes the same fail-closed path.

## 7. Reusable policy patterns (the menu, not the choices)

Agnostic primitives an L3 may implement (each is a **pattern**; the concrete thresholds/tiers are L3):

- **cost / capability-tier downgrade-gate** — past a hard budget, DENY an expensive tier (forcing a downgrade) and/or ASK at soft thresholds; optionally a per-principal-per-day variant.
- **tier routing** — DENY trivial work on an expensive tier.
- **risk-score escalation** — accumulate points per action (and on sensitive results); ASK/DENY guarded actions past a threshold.
- **working-dir / worktree gate** — gate directory-change / worktree operations against an allowlist.
- **sandbox enforcement** — require/inject a sandbox profile before spawning a sub-process.
- **rate-limit** — cap actions per session or per turn.
- **sensitive-content** — redact or deny secrets / sensitive data in a request or result.

> **Never gate on a vendor model id** — gate on **tier/capability**. A brand-coupled threshold rots and fails the fire-test.

## 8. Relationship to the static allow/deny (`CANON-CODER-ORCHESTRATION-001`)

This canon does **not** replace the static permission file — it is its **runtime, stateful sibling**:

- The **static allowlist / deny** (CODER-ORCHESTRATION §4/§7) is the **harness-level floor**: fast, stateless, prefix-matched. The airtight deny it owns — **identity / destruction / secrets / arbitrary-exec** — is the **shared floor** both layers express.
- The **runtime engine** (this canon) is the layer above: **stateful, composable**, with the **ASK** verdict and the contextual policies a flat list structurally cannot express.

A repo may run either or both. Where both run, the static deny is the **backstop**; the engine is the **membrane**. Neither may dissolve the shared floor (§7 of CODER-ORCHESTRATION).

## 9. Layering — what the kit owns vs the product

- **L1 (this canon):** the **contract** — enforcement points, the verdict set, composition + precedence, fail-closed, the state model, and the pattern menu.
- **L3 (each product):** the **engine implementation** (code), the concrete policies + thresholds, the harness mapping, and the storage of session state.

The kit ships **no runtime**. It names the pattern so a product builds its engine against a **known target** instead of scattered per-route guards and prose rules — and so the same governance reads the same way across products.

## 10. Anti-patterns (the never-do list)

- **Fail-open.** A broken policy that ALLOWs (§6).
- **A flat list pretending to be stateful.** Budget/risk logic in a prefix-match — it cannot see accumulation. Use the engine.
- **Vendor-coupling.** Gating on a model brand id instead of a tier/capability (fire-test).
- **Silent ASK side effects.** Applying writes before the human approves (§3).
- **Dissolving the shared floor.** A runtime engine that lets identity / destruction / secrets / arbitrary-exec through that the static deny (CODER-ORCHESTRATION §7) blocks.

## 11. Worked examples (for the L3 implementer)

These are **agnostic** worked examples — an L3 maps them to its harness, tiers, and
domain (a product version would name its own concrete records/paths/tiers; the canon
stays brand-free per the fire-test). They exist so a developer building the engine has
a concrete target, not just the contract.

**The shape a policy implements** (pseudo — bind types in L3):

```
policy = {
  name,
  on: [ enforcement points it fires on ],          # §2
  evaluate(event, state) -> result                 # called only on its points
}
event  = { point, content, tool_name?, model?, usage?, actor?, labels? }   # engine fills it
state  = { mutable per-session: counters, risk, cost_usd, labels }          # §5
result = { verdict: ALLOW | ASK | DENY,            # §3
           reason?,                                 # shown on ASK, logged on DENY
           data?,                                   # replacement payload on ALLOW
           state_updates? }                         # SET/INCREMENT/APPEND on `state`
```

The engine runs the policies **in order** and composes them per §4 (DENY short-circuits ·
ASK accumulates + withholds writes · ALLOW continues).

---

**11.1 — Budget runaway → force a tier downgrade**
*Goal:* stop an agent burning the budget on an expensive tier for cheap work.
```
cost_downgrade_gate(hard_usd, soft_usd[], expensive_tiers[]):
  on: [pre-model]
  evaluate(e, s):
    if s.cost_usd >= hard_usd and e.model in expensive_tiers:
        return DENY("budget hit on an expensive tier — switch to a cheaper tier and retry")
    if crossed_unapproved_soft(s.cost_usd, soft_usd):
        return ASK("spend crossed $X — continue?", state_updates=[record approved threshold])
    return ALLOW
```
*Walk-through:* cost = $8, model = expensive, hard = $5 → **DENY** with a steer. The agent
switches tier and retries → next eval `e.model` is cheap → **ALLOW**. (The prose rule
"mechanical work → cheaper tier" now *bites* at runtime.)

**11.2 — A session turning risky → escalate**
*Goal:* catch "this whole session is getting dangerous" — which a flat deny-list can't see.
```
risk_score(points{tool->n}, sensitive_labels{label->n}, threshold, guarded_tools[]):
  on: [tool-call, tool-result]
  evaluate(e, s):
    if e.point == tool-call and e.tool_name in guarded_tools and s.risk >= threshold:
        return ASK("elevated session risk — approve this action?")
    if e.point == tool-call and points[e.tool_name]:
        return ALLOW(state_updates=[INCREMENT risk by points[e.tool_name]])
    if e.point == tool-result and label_in(e.content) :
        return ALLOW(state_updates=[INCREMENT risk by sensitive_labels[label]])
    return ALLOW   # abstain
```
*Walk-through:* the session reads a sensitive file (+30), then runs a broad search (+10)
→ `risk = 40 ≥ threshold`. The next guarded tool → **ASK**. The static deny-list saw each
command in isolation and let them pass; the engine saw the *accumulation*.

**11.3 — An agent leaving its working directory**
*Goal:* keep an agent inside its sandboxed worktree (the runtime form of the worktree discipline).
```
working_dir_gate(allowed_dirs[], action=deny):
  on: [tool-call]
  evaluate(e, s):
    if e.tool_name in shell_tools and parses_a_dir_change(e.content):
        if target not under allowed_dirs: return DENY|ASK("stay inside your worktree")
    return ALLOW
```
*Walk-through:* the agent runs `cd /other/repo && …` or `worktree add …` outside
`allowed_dirs` → **DENY**. (Enforces "git -C, not cd" + the read-only main rule at
runtime — not only at the pre-commit hook.)

**11.4 — Ask the human ONCE (stateful approval)**
*Goal:* a sensitive action needs human sign-off, but don't re-prompt forever, and never half-apply on a "no".
```
gate_sensitive(): on:[tool-call]
  evaluate(e, s):
    if is_sensitive(e) and not s.labels["approved:<key>"]:
        return ASK("approve this sensitive action?", state_updates=[SET approved:<key> on approve])
    return ALLOW
```
*Walk-through:* a migration-apply → **ASK**. The human approves → the approval is recorded
(routed to the spawn-tree root, §4) → a sub-agent later hitting the same key **does not
re-ask**. Had the human declined, the ASK's `state_updates` were **withheld** — nothing
was applied (§3).

**11.5 — Personal data about to reach the model → redact, don't block (ALLOW + replacement)**
*Goal:* let the work continue but keep sensitive data out of the model request / logs.
```
sensitive_content(patterns[]): on:[pre-model, tool-result]
  evaluate(e, s):
    masked = redact(e.content, patterns)
    if masked != e.content: return ALLOW(data=masked)   # substitute the safe version
    return ALLOW
```
*Walk-through:* a tool returns a record with a phone + email; before it enters the prompt,
the policy returns **ALLOW with a redacted `data`** → the engine substitutes the masked
content. The agent keeps working; the raw PII never travels.

**11.6 — The user's session policy beats the server's (precedence)**
*Goal:* a per-session intent overrides a standing server allowance.
*Setup:* server policy `allow_web_search` (ALLOW). User adds a session policy
`no_external_calls_today` (DENY on network tools). *Order:* **session → … → server**.
*Walk-through:* on a web-search tool-call, the **session** policy evaluates first and
returns **DENY** → short-circuits before the server's ALLOW ever runs. The user's intent
wins, with no change to the global config.

> **And always — fail-closed (§6):** if any of these policies *throws*, the engine returns
> **DENY** by default (an advisory-only policy → ALLOW; an approval-gate policy → ASK). A
> crashed guard never silently lets the action through.

## Fire-test

This document names no product, vendor, brand, model, or framework. (`ALLOW`/`ASK`/`DENY`, "policy", "sandbox", "PII" are generic governance/security nomenclature, not brand markers.) The motivating prior-art (an OSS meta-harness) is cited as **research**, not depended on.

## Provenance

Drafted 2026-06-16 from the orchestration prior-art (`knowledge/research/ORCHESTRATION-PRIOR-ART-2026-05-25.md` — the omnigent entry, source-verified at the upstream's `HEAD 5a8fd16`) per `doc/decisions/ADR-20260616-runtime-policy-engine.md` (ACCEPTED · D-009). **Extract-patterns-not-dependency:** the pattern is reimplemented in our own terms; no external tool is adopted. On seal, register the catalog piece in `setup/ADOPT-DEV-KIT.md` and remove the `catalog-sync` exemption.
