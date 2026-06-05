# CANON-CONTEXT-HYGIENE — Managing an agent's context window (universal · agent-agnostic)

> **Scope:** every repo where coding agents (and the humans operating them) run sessions.
> Vendor-neutral, product-neutral, tool-neutral.
> **Status:** SEALED 2026-06-05 by Marcelo (Principal Architect) — agnostic-lift seal sweep ("SEAL DALE"). Fire-test passed.
> **Home:** the dev-kit (supra-repo). Inherited by every repo as upstream → fork.
> **Siblings (do not duplicate):** `CANON-CROSS-AGENT-CONTEXT-LAYERING` (which layered rules an agent *reads*) · `CANON-MULTI-AGENT-ORCHESTRATION` (§2.2 session closeout states · §2.3 handoff completeness — this canon **references** those for the close/handoff, it does not re-derive them). **This canon governs the third thing: how an agent keeps its own context window healthy *during* a session.**
> **SOTA-informed (`CANON-DEVELOPMENT-PROCESS §7`):** prior-art — context engineering as a first-class discipline (more context ≠ better; quality degrades past a fill threshold), fresh-context-per-phase to kill cross-phase drift, and progressive disclosure as the scalable answer to context bloat. Patterns extracted, not a tool adopted.

---

## §1 — Root principle

> **An agent's context window is not a free resource. More is not better. Past a fill threshold (~50%), answer quality degrades *silently*. Context discipline is as important as code discipline.**

The failure mode is specific and dangerous: the degradation is **invisible to the agent**. A long session accumulates context; attention to detail and verification quietly slip; the agent does not notice and keeps going. The errors are of *attention/verification*, not capability, and they correlate with accumulated context — so the cure is not a smarter agent, it is **less context**.

> *The brilliant assistant who forgets:* a modern coding agent is like a brilliant helper who, every time you tell it something new, forgets something old — and worst of all, does not always recognize that it has become confused.

---

## §2 — Thresholds and signals

### §2.1 — Numeric thresholds

| Context fill | Zone | Action |
|---|---|---|
| 0–40% | green | normal operation |
| 40–55% | amber | summarize + persist state before any critical task |
| 55–70% | red | **do not start new complex work**; close the current task, persist, suggest cutting the session |
| 70%+ | critical | **degradation likely** — stop, persist everything, cut the session now |

(The exact percentages are a sensible default; a consuming repo may tune them. The *shape* — escalating caution as the window fills — is the invariant.)

### §2.2 — Qualitative degradation signals

The agent must self-audit and report when it notices any of:

1. **Forgetting files already read** — "did I read this before?"
2. **Proposals contradicting recent decisions** — "I said A 30 minutes ago, now I propose B with no reason."
3. **Repeating work** already done earlier.
4. **Tool-use errors** — wrong paths, redundant commands.
5. **"Lost in the middle"** — re-reading early context feels like archaeology.

### §2.3 — The agent's response to a signal

On detecting a degradation signal, the agent: (1) **reports it explicitly** to the human (*"I'm noticing X; context is long; I recommend cutting and persisting state"*), (2) **does not proceed** until the human confirms continue-or-cut, (3) if told to continue, **records the warning** in the active work-log.

---

## §3 — Persistence (scratchpads)

> **Never let the context window be the only place an important decision lives. Anything that must survive the session goes to the filesystem, not the chat history.**

What to persist, continuously: sealed decisions → the decision store; work-in-progress → the feature's append-only log, at each substantive step; a live task list → the task tool; a session handoff → the handoff artifact before closing (the concrete paths/files are an L3 concern).

**The "if I cut now" test** — before closing or cutting: *"If I cut now and tomorrow a fresh agent starts from zero reading only the repo (not this chat), can it continue without losing important decisions?"* If **no**, persist what is missing before closing.

---

## §4 — In-session hygiene

- **§4.1 Fresh context per phase.** When a phase is *conceptually distinct* from the previous one, start a fresh session/task with only the needed artifacts, not the whole chat history. Classic boundaries: planning → implementation · research → decision (avoid research bias) · audit → fix (separate detection from remediation).
- **§4.2 Selectivity.** Do **not** pull in "everything that might be useful." Bring only what the current step needs. ✅ a specific read of the file you need now · ❌ a broad search "just in case" · ✅ a sub-agent with a narrow scope · ❌ "explore the whole repo and tell me everything."
- **§4.3 MCP-as-trap.** Each enabled tool-server loads its descriptors/schemas into the window passively, even when unused — see §6.
- **§4.4 Poisoning — don't steer back, cut.** When an early decision turns out wrong, the temptation is to *steer the agent back* within the same context. This is an anti-pattern: the bad context is still in memory and the negative patterns reappear by inertia. **Correct response:** persist the lesson, **cut the session**, restart fresh with only the persisted artifacts.
- **§4.5 Summarize + trim.** On crossing green→amber, summarizing and pruning is mandatory; the summary goes to a filesystem scratchpad, not the chat.

---

## §5 — Closing a session

When a session ends (naturally or by degradation), run the closeout. The **exit states** of every branch/worktree (`PUSHED` / `READY-PR` / `DISCARDED`) and the **handoff completeness** rubric live in `CANON-MULTI-AGENT-ORCHESTRATION` (§2.2, §2.3) — this canon does not duplicate them; it **adds the context-specific closeout checks**:

- [ ] decisions undocumented? → persist now
- [ ] uncommitted work? → commit+push or discard explicitly
- [ ] worktrees uncleaned? → clean or declare intentional
- [ ] pending tasks? → capture as backlog in the channel
- [ ] would a fresh agent understand the state from the repo alone? → if no, write the handoff (per ORCHESTRATION §2.3)
- [ ] does the operational-status doc reflect reality? → if drift, update
- [ ] feature lifecycle artifacts current? (`CANON-DEVELOPMENT-PROCESS §5`)

---

## §6 — Imported capability contaminates context (MCP) and judgment (external skills)

Two distinct mechanisms by which capability imported from *outside the repo* harms an agent. They share one principle: **no imported capability may carry more authority than the repo's canon.**

> **MCP/tool-servers contaminate the *context* (a quantity problem). External skills contaminate the *judgment* (a quality/direction problem).** The second is worse because it is invisible.

### §6.1 — Tool-servers: the quantity problem

Tool-servers consume context constantly — every exposed tool adds descriptors/schemas to the prompt. During dense-reasoning phases (governance, architecture, design), that "just in case" context competes with the "need it now" context. The deeper rule is the **reasoning-to-execution ratio**: governance ≈ 90% reasoning / 10% execution; polish ≈ 10% / 90%. Tool-servers shine when the ratio tips toward *execution* — and should be off during dense reasoning, *including* mid-construction moments (a subtle bug, an API contract, an architectural refactor). The rule is not "construction = servers on"; it is **"repetitive mechanical work = servers on."**

| Phase | Tool-servers |
|---|---|
| Governance / architecture / starting new work | ❌ off (clean context to reason) |
| Construction | ⚠️ only the ones the specific task needs |
| Polish / cosmetic / mechanical | ✅ on (tool use accelerates) |

**Where tool-servers are irreplaceable:** live connectivity to external systems, real-time data, and real-world actions. Anything that can live as static knowledge in the repo belongs in a skill, not a server.

### §6.2 — External skills: the direction problem

A skill imported from outside (marketplaces, IDE imports, "expert pack" bundles) is **not neutral — it carries opinions**, and those opinions did not come from the repo's authority.

- **Why worse than a server:** with a server you can list and evaluate each tool; with an external "expert" skill you import an *aggregate bias* of thousands of implicit decisions, invisible until it generates output that *looks right* but pushes the project in a different direction. It rarely violates an individual rule — it violates the **aggregate direction.**
- **The asymmetry of direction:** internal skills point toward *this product*; external skills point toward *industry consensus*. They agree ~70% — which is why external skills "seem useful" — but the ~30% where they diverge is exactly where the product has its own identity. Importing an external expert skill silently loses that 30%.
- **Three operating rules:** (1) **Direction** — every skill an agent uses must have a known direction: toward this repo (internal, versioned, authority-approved) or toward nothing (a mechanical task with no opinion). Skills with implicit industry opinion are forbidden on work that touches product identity. (2) **Author** — a skill lives in the repo only if written by the authority or an agent under its direct supervision; third-party skills may be studied or adapted-with-changes, never imported literally. (3) **Canon supreme** — if any skill's output contradicts canon, **canon wins**; the agent reports the contradiction, it does not "reconcile" the two.
- **When external skills are acceptable:** only when the task is mechanical and canon has no opinion (image compression, generic linters, regex, standard-format parsing, unit conversion). If the task touches identity, vocabulary, architecture, data model, or UX → forbidden.

---

## §7 — When to cut the session

**Cut if:** context crossed the red threshold · two verification errors in the last hour · the human corrected you twice on recent decisions · you are about to make a major architectural decision · the next task needs fresh reading of code you read hours ago · the session has run past its long-duration mark.

**Do NOT cut just because:** the conversation has been long but is coherent and the window is not saturated · you are mid-way through a *simple* task (finish it first, then cut).

> **The handoff is not abandonment — it is written continuity so the next session starts exactly where this one stopped. The room changes; the thread does not.** A keyword trigger (the consuming repo picks the word) that *either* party can invoke is a clean way to start the closeout; whoever calls it first is right without debate. The handoff doc itself follows `CANON-MULTI-AGENT-ORCHESTRATION §2.3`.

---

## §8 — Anti-regression

This canon forbids: (1) long sessions with no explicit context warning from the agent; (2) major architectural decisions taken above the red threshold; (3) tool-servers "always on" regardless of phase; (4) steering a contaminated context back instead of cutting (§4.4); (5) closing a session without the §5 checklist; (6) importing external "expert" skills onto identity-touching work (§6.2); (7) treating "industry best practice" as applying without verification against canon.

---

## §9 — Validation cases

- **Long session:** past the long-duration mark, the agent self-reports context state; near the limit, it suggests cutting; at the limit, it starts no new work.
- **Late architectural decision:** asked to decide something major deep into a session → *"this decision deserves fresh context; I propose closing, persisting what's decided, and starting fresh for it."*
- **Wrong approach discovered:** not "I changed my mind, now do X" — instead *"my approach was wrong; I persist the lesson, close, and restart fresh."*
- **Dense-phase servers:** opening a session to draft governance → the agent checks for active tool-servers and suggests disabling them first.
