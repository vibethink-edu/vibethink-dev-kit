# Orchestration prior-art — our spine vs the field (RESEARCH)

**Status:** RESEARCH / intelligence — *informs, does not decide* (per the research tier:
research never becomes canon directly; it's evaluated, then an ADR/canon may follow).
**Date:** 2026-05-25
**Why it exists:** Marcelo asked "are we ahead, or reinventing what's already built?" and
then: *"no me dejes luchar haciendo algo que ya está hecho."* This is the shield: an
**ADOPT / ALIGN / KEEP** verdict per component so we never re-build a solved problem.
**Note:** this is a *research* doc looked up on demand — not a context file loaded every
session — so it does not add to the per-session context-bloat the Gloaguen-2026 finding
warns about (below).

## Verdict (honest, no hype)

**We are mostly re-deriving things that are already built.** The multi-agent
coordination field matured in 2026. Almost every piece of our spine has an existing
standard. **The only piece that is genuinely ours is the thin human-reading UX layer
(the compass / status-message contracts).** Everything else: align or adopt.

## The map — what's already built, and the verdict

| Our piece | Already built by | Verdict |
|-----------|------------------|---------|
| **The dance** (git as bus; agents read/write files in a repo; no server; human + AI first-class) | **GNAP — Git-Native Agent Protocol** (RFC draft): a `.gnap/` dir with `version`, `agents.json` (id/role/`type: ai\|human`/status), `tasks/`, `runs/`, `messages/`; workflow = pull → read tasks/messages → work → commit → push; git log = audit | 🛑 **ALIGN, don't grow our own.** GNAP *is* our danza, formalized — incl. humans as first-class. Evaluate aligning our `inbox.config.json`/comms-lane file structure + naming to GNAP (it's an RFC draft → align/contribute, not blindly switch). |
| **Cross-agent comms over the wire** (future, if networked) | **A2A v1.0** (Linux Foundation, 150+ orgs, Google/MS/AWS): Agent Cards (capability advertisement), Tasks, transport HTTP/SSE/JSON-RPC | 🛑 **ADOPT if we ever go networked.** Don't invent a wire format. Our git-async model = GNAP; A2A is the wire standard for server-to-server agents. |
| **AGENTS.md + L1/L2/L3 layering** | **AGENTS.md** open community standard (+ MCP for data, A2A for comms) | 🟡 **Already on it — stay interoperable.** Don't grow a private dialect; keep our files valid AGENTS.md. |
| **VT-Method / canon-first / "constitution"** | **Spec-Driven Development** (SpecKit, "project constitution", supervision checkpoints) | 🟡 **Mostly done — we already use SpecKit.** Our flavor is fine; don't re-derive SDD theory. |
| Decision gate / judgment escalation | **Human-in-the-loop approval gates** (mainstream; LangGraph HITL checkpoints; the 5 patterns: sequential/parallel/hierarchical/handoff/loop) | 🛑 Established — adopt the pattern names. |
| ADR + fitness functions (decision→enforcement) | Nygard (ADR) / Neal Ford (fitness functions) | 🛑 Decades old — use as-is. |
| **The compass / status-message contracts** (§5.1, §5.1.A, §5.1.B — how a *human* reads agent output) | — (protocols cover machine↔machine, not human-reading UX) | 🟢 **KEEP — this is genuinely ours.** The one slice worth our effort. |
| **Handoff completeness** (a handoff that looks complete but isn't — §2.3) | **Closed-loop / read-back confirmation** (high-reliability comms: aviation, medicine) · **critic/verifier agent** (agentic-workflow pattern: a pass that hunts what's *missing*) · **"trust then verify" / the builder doesn't grade** (fresh-eval verification, Anthropic Claude Code best-practices) · **Definition of Done** checklists | 🛑 **ADOPT the patterns.** echo-back = read-back · completeness-critic = critic agent · fresh-context check = builder-doesn't-grade. **Ours** = applying them to the *handoff artifact* + the completeness rubric. Sealed into `CANON-MULTI-AGENT-ORCHESTRATION §2.3` (2026-06-05). |
| **Runtime governance as a policy-interception engine** (intercept every agent action at defined points; each yields ALLOW/ASK/DENY; composed across policies with precedence + session state; fail-closed) | **omnigent** (Apache-2.0, alpha) — a per-workflow `PolicyEngine` evaluates an ordered policy list at enforcement points (request / llm_request / tool_call / tool_result); **DENY short-circuits, ASK accumulates, ALLOW continues**; stateful (counts, risk score, cost, labels); 3-level stacking session>agent>server. See the dedicated entry below. | 🟡 **PARTIAL — the genuinely-new pattern.** Our canon has the *principle* (safety-boundary §3 = automate/escalate) and a *static* harness allowlist (`CANON-CODER-ORCHESTRATION §4/§7` + the `coder-permissions` instrument), but **not** a *runtime stateful engine*. Candidate to canonize as an agnostic pattern — **fold-in vs new spine is Marcelo's call** (analysis below). |

## The key evidence (backs "lean", not "more")

**Gloaguen et al. 2026** (138 real repos): LLM-generated context files **reduce agent task
success** and **raise inference cost >20%**; manual AGENTS.md files **go stale**. → More
canon/context is not better; it can be worse. Empirical backing for build-on-pain and the
anti-rooms discipline.

## The principle (the shield, reusable)

> **Prior-art check before building coordination/methodology.** Before building any
> orchestration, comms, or methodology piece, check the standards first — **GNAP, A2A,
> AGENTS.md, MCP, SDD/SpecKit**. If it exists: align or adopt. Build *only* the
> genuinely-missing connective tissue. (This is Rule-#28's "verify before declaring a
> blocker", applied to ideas: verify it's not already built before building it.)

## Recommendation (not yet decided — pending GO)

1. **Evaluate aligning the danza to GNAP** (file structure + naming + the `agents.json`
   shape). Biggest anti-reinvention win. → would become an ADR if GO.
2. **Keep the compass/status contracts** — they're ours; protocols don't cover them.
3. **Don't re-derive** SDD, AGENTS.md, HITL, ADR/fitness — adopt by name, stay interoperable.
4. **A2A** only matters if/when we go networked (server agents) — park until then.

## §7-provenance — handoff completeness (2026-06-05)

This row satisfies the **SOTA-informed seal gate** (`CANON-DEVELOPMENT-PROCESS §7.2`)
for the `CANON-MULTI-AGENT-ORCHESTRATION §2.3` amendment — the **first** method canon
authored under §7. Prior-art checked (≥2 independent leading sources), pattern
extracted not depended-on, sources registered here for the §7.3 watchlist sweep:

- **Closed-loop / read-back** (high-reliability domains) → the **echo-back** mechanism (receiver confirms understanding before acting).
- **Critic/verifier agent** (agentic-workflow pattern — a pass that asks "what's missing?") → the **completeness-critic** mechanism (author, before declaring ready).
- **Builder-doesn't-grade / fresh-eval** (Anthropic Claude Code best-practices) → the **fresh-context gap check** for high-stakes handoffs.
- **Definition of Done** (engineering practice) → the **completeness rubric**.

Extraction, not dependency: the patterns are reimplemented in our own terms against
our *handoff artifact* — no external tool adopted.

## omnigent — runtime policy-engine prior-art (added 2026-06-16, source-verified)

**Repo:** https://github.com/omnigent-ai/omnigent · **License:** Apache-2.0 · **Maturity:** alpha (~2.7k★).
**Evidence:** read at clone `HEAD 5a8fd16` (2026-06-16) — `omnigent/policies/{types,base}.py`,
`omnigent/runtime/policies/engine.py`, `omnigent/policies/builtins/*`, `docs/POLICIES.md`,
`docs/AGENT_YAML_SPEC.md`. Level-2 bitácora: `_upstream-bitacora/tools/omnigent.md`.
**What it is (one line):** a meta-orchestration layer over many agent runtimes whose strongest,
most-transferable piece is a **runtime policy engine** that governs agent behaviour by interception.

### The engine model (verified from source — not memory)

- **Two contracts cross the boundary** (`policies/types.py`): `EvaluationContext` (the caller hands the
  engine `phase`, `content`, resolved `tool_name`, plus injected `session_state` / `usage` / `model` /
  `actor` / `labels`) and `PolicyResult` (`action ∈ {ALLOW, ASK, DENY}`, `reason`, `data` = optional
  **replacement payload** — e.g. a PII-redacted version of the tool args, `state_updates`, `set_labels`).
- **Enforcement points (phases):** `request` (user text, pre-LLM) · `llm_request` (full prompt) ·
  `tool_call` (pre tool) · `tool_result` (post tool). A policy declares the phases it fires on; the
  engine skips the rest.
- **Composition (`runtime/policies/engine.py::PolicyEngine.evaluate`):** iterate policies **in
  declaration order**; for each, check phase-selector + a `condition:` label-gate, then dispatch.
  **DENY short-circuits** the chain · **ASK accumulates** (and *withholds* all label/state writes until
  the user approves — "a denied ASK must leave no trace") · **ALLOW continues**. The composed result
  names the `deciding_policy`.
- **Stateful by design:** the engine carries `session_state` (counters, risk score), cumulative `usage`
  (tokens + cost), a `labels` hot-cache (write-through, with enum + monotonic validation), and a
  per-user-per-UTC-day cost rollup. Policies read this and return `state_updates`
  (`SET/INCREMENT/DELETE/APPEND`). State persists across turns via the conversation store.
- **Fail-closed (`_fail_closed`):** a policy that throws → **DENY** by default; **ALLOW** only for a
  classifier-only spec (`action: [allow]`); **ASK** for an approval-gate spec. Returned actions are
  validated against the spec's declared action whitelist.
- **Stacking precedence (3 levels, `docs/POLICIES.md`):** **session** (user) → **agent-spec**
  (developer) → **server-wide** (admin), evaluated in that order, so a user-session policy can
  DENY-short-circuit before the spec/admin policies run.
- **Config-surface:** custom policies register via `policy_modules:` + a `POLICY_REGISTRY` whose entries
  carry a `params_schema` (JSON Schema) → **admin-UI auto-discovery**; runtime CRUD over a REST API.

### The builtin catalog (agnostic governance primitives — the value)

- **cost** — `cost_budget`: hard limit = **DENY while on an expensive model** (forces a `/model`
  downgrade, then ALLOWs) + soft thresholds = **ASK**; `user_daily_cost_budget` = the same per user per
  UTC-day. (Default "expensive" set names model tiers — vendor-specific in their code; the *pattern* is
  tier-based.)
- **routing** — `deny_trivial_to_expensive_model`: an LLM classifier tags the turn TRIVIAL/COMPLEX and
  **DENY**s a trivial turn on an expensive model (model-tier enforcement, mechanized).
- **risk_score** — accumulate points per tool-call + per sensitivity-label; once the session crosses a
  threshold, guarded tools **ASK/DENY**; per-actor starting offset.
- **working_dir** — `block_working_dir_changes`: gates `cd`/`pushd`/`git -C`/`git worktree` with an
  `allowed_dirs` allowlist (deny|ask). *This is literally our worktree discipline, expressed as a
  runtime policy.*
- **safety** — `max_tool_calls_per_session`, `ask_on_os_tools`, `ask_on_add_policy` (an agent **cannot
  silently install a policy**), `block_skills`, `enforce_sandbox` (injects sandbox config on agent
  start), `deny_pii_in_llm_request`.

### Contrast — what our agnostic canon already covers vs what is NEW

**Already covered (principle + static form):**
- The **automate-vs-escalate** principle behind ALLOW/ASK: `CANON-MULTI-AGENT-ORCHESTRATION §3` (safety
  boundary) + §4 (human keeps stop/redirect).
- A **static, harness-level allow/deny**: `CANON-CODER-ORCHESTRATION-001 §4` (prompt + allowlist), §7
  (the gates that bite — identity/destruction/secrets/arbitrary-exec NEVER allowlisted = a flat deny
  list), §10, plus the `setup/templates/coder-permissions/` instrument (a `settings.local.json`:
  broad-allow Bash + airtight deny).
- Model-tier discipline + worktree discipline exist as **prose rules** (and a pre-commit hook), not as
  programmable primitives.

**NEW (not in any sealed agnostic spine):**
1. ⭐ **A runtime, stateful policy ENGINE abstraction** — interception at typed enforcement points →
   `ALLOW/ASK/DENY`, composed across N policies with explicit precedence, carrying session state, with a
   `data` channel that can **transform** content (redaction), all **fail-closed**. Our deny-list is a
   static prefix-match in a harness file; this is a programmable evaluator chain with memory.
2. **ASK as a first-class, stateful approval-with-memory** (approve-once-per-threshold, no side effects
   on a denied ASK, approval shared across a spawn tree). Our model is binary prompt-vs-deny, stateless.
3. **Policy stacking precedence (session>agent>server)** as a *runtime* composition (distinct from our
   L1/L2/L3 *document* layering).
4. **Reusable policy primitives** for cost-downgrade-gate, model-tier, **risk-score accumulation**
   (no dev-kit equivalent at all), sandbox-enforcement, rate-limit.
5. **params_schema → UI auto-discovery** for policy config (a concrete config-surface-governance shape).

### Fold-in vs new spine (Marcelo's call — NOT assumed here)

The new pattern sits adjacent to two sealed spines but is covered by neither as a *runtime mechanism*:
- **Option A — fold-in:** amend `CANON-CODER-ORCHESTRATION-001` with a "runtime policy layer" section
  (it already owns the static allow/deny; this is its dynamic, stateful sibling).
- **Option B — new spine:** a dedicated agnostic canon (e.g. `CANON-RUNTIME-POLICY-ENGINE` /
  `CANON-AGENT-GOVERNANCE-RUNTIME`) for the engine pattern, with CODER-ORCHESTRATION referencing it.
- Lean (mine, not a decision): the *altitude* differs (CODER-ORCHESTRATION is about a human-launched
  coder's permission file; this is a runtime interception engine for any agent), which tilts toward
  **B**, but it is genuinely a judgment call and stays Marcelo's.

### Verdict

**👀 watching · extract-patterns-not-dependency.** Do **not** adopt omnigent (alpha/pre-1.0; it is the
*entire* orchestration layer ViTo/WB build with governance bound to their own model — adopting it would
cede the core). Apache-2.0 lets us read/extract freely. **Value:** it validates the thesis and is the
best source of a **runtime-governance pattern** the dev-kit does not yet name. The star pattern (#1) is a
strong L1 candidate; the builtin primitives (#4) are L1/L2 candidates. Next step on GO: an **ADR** that
(a) picks fold-in vs new spine and (b) selects which primitives to canonize.

## Sources

- omnigent (meta-orchestration + runtime policy engine), Apache-2.0, alpha — https://github.com/omnigent-ai/omnigent (read at HEAD `5a8fd16`, 2026-06-16; `docs/POLICIES.md`, `docs/AGENT_YAML_SPEC.md`, `omnigent/policies/*`, `omnigent/runtime/policies/engine.py`). Level-2 bitácora: `_upstream-bitacora/tools/omnigent.md`.
- GNAP (Git-Native Agent Protocol), RFC draft — https://github.com/farol-team/gnap
- A2A Protocol v1.0 (Linux Foundation) — https://a2a-protocol.org/latest/ · https://github.com/a2aproject/A2A
- AGENTS.md spec + Gloaguen 2026 finding — https://asdlc.io/practices/agents-md-spec/
- Spec-Driven Development — https://www.augmentcode.com/guides/what-is-spec-driven-development
- Multi-agent orchestration patterns 2026 — https://www.codebridge.tech/articles/mastering-multi-agent-orchestration-coordination-is-the-new-scale-frontier
- Human-in-the-loop 2026 — https://www.strata.io/blog/agentic-identity/practicing-the-human-in-the-loop/
