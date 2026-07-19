# GOAL-TEMPLATE — the 8-field dispatch contract (define first, dispatch second)

> **What this is.** The goal-definition contract an operator fills **before** dispatching any
> unit of autonomous work — a headless executor run *or* an interactive chat session. The goal
> defines **what** is being built and **where it must stop**; the launch surface
> ([`RUNBOOK-LAUNCH-CODERS`](../../RUNBOOK-LAUNCH-CODERS.md)) defines *how* it runs. A goal with
> these 8 fields runs the plan in one stretch (`CANON-CODER-ORCHESTRATION-001` §8.1: a checkpoint
> is not a stop); a half-defined goal degrades into dispatch-and-nudge — the operator typing
> "continue" at every partial close.
>
> **Rule of gold:** every field left empty is a rework you pay later.

## Rule #0 — READINESS (first, above everything)

**Fully defined, or no dispatch.** If you cannot fill the 8 fields, the goal is not ready.
There is no "I'll define it on the way": **define first, dispatch second.**

> An empty field is the signal that a **decision of the authority** is missing — not work for
> the executor. The executor runs a plan; it does not guess the plan.

### The readiness check (advisory — it informs, it does not block)

Before dispatching, evaluate the draft goal on **two axes** (yourself, or by asking the very
session that will execute it — the evaluation loads its context for free; for a headless
dispatch, a non-executor PREP session does it):

- **Axis 1 — DEFINITION.** Score the 8 fields. For every weak/empty field, name the **exact
  missing decision** ("field 4: is cloud in or out?").
- **Axis 2 — SIZE.** One goal, or several in disguise? Split signals:
  - the scope bundles **units with no consumption relationship** between them — note a vertical
    slice through data + service + surface serving ONE deliverable is **one goal**; do not split
    by layer (layer-splits produce dependent pieces that can only queue);
  - a **human decision sits mid-plan** (slice 3 depends on reviewing slice 1) — the natural cut is there;
  - the plan **crosses a reserved border mid-way** (field 4) — what precedes the border is one goal, the border is another with its own GO;
  - "done" (field 3) bundles **several independent deliverables** — each can be its own goal;
  - the plan **exceeds one run or one reviewable PR** — a homogeneous bulk (many files, one
    pattern) splits by partition, not by layer.

**Verdict, one line:** `GO` · `DEFINE <what>` · `SPLIT <into which goals>`. It is advisory:
running anyway is a **conscious choice with named blind spots**, never an accident. Split goals
that are independent feed the fan-out evaluation (`CANON-CODER-ORCHESTRATION-001` §9.1) — they
may run as a wave instead of a queue.

## The 8 fields (copy and fill)

```
1. OBJECTIVE:    <one sentence, in USER language — what this goal delivers>

2. SCOPE (the plan):   <ordered slices that ARE in scope — this is what gets chained>
   [ ] slice 1
   [ ] slice 2

3. DONE:         complete deliverable + tests green (per the repo's testing policy) +
                 typecheck/build green + branch in its terminal state (PUSHED / READY-PR).

4. BORDERS (out of scope — each needs its OWN explicit GO):
                 cloud/production apply · destructive ops · secrets ·
                 <the repo's reserved boundaries — e.g. its protected-data domain>.
                 ← authority-gate stops; the FULL terminal list is §8.1 — never restate it

5. VOCABULARY:   user-facing terms = <what the person sees> · internal/storage names =
                 <schema/technical names — these NEVER surface in UI or user-facing text>

6. REUSE:        <existing contracts/services/components to build on — never duplicate>

7. GUARDRAILS:   the repo's code standard, named concretely (e.g.: authn/z first · scoping
                 of every query · input validation · i18n/localization · layering ·
                 zero secrets/hardcode). <bind the repo's concrete rules at L3>

8. MODE:         [by execution mode — see below]
```

### MODE by execution mode (the vendor mapping is L3)

*(Orthogonal to the runbook §3 runtime Classes 1/2 — that axis is invocation/guard; this one is
**turn behavior**. The same binary can be run-to-completion launched headless and interactive in a
chat — the mode belongs to the **dispatch surface**, not the runtime name.)*

- **Run-to-completion** (headless executor, or a harness that chains a full scope): execute the
  SCOPE in one stretch per `CANON-CODER-ORCHESTRATION-001` §8.1 — record, verify, continue;
  lockfile installs pre-authorized; correctable failures are diagnosed and retried; draft PR,
  never merge; **terminate only at a §8.1 terminal condition, never at a checkpoint** (the
  terminal list lives in §8.1 — do not restate it here).
- **Interactive-yield** (a chat that **yields the turn by design** after each unit): the yield
  cannot be removed by prompt text — shape it instead: **in-plan = continue; out-of-plan = stop
  and ask.** Batch a FULL slice (several commits) per turn, never yield after each small commit,
  and **never yield idle** — every return shows something done and committed, not an intention.
  A committed slice or a real question is a valid return; "I'll continue" is not. (§8.1 still
  governs — the yield changes delivery granularity, not the terminal conditions.)

## What the consuming repo binds (L3 — this template is the spine)

- The **concrete runtime names** and which execution mode each **dispatch surface** falls in.
- **Where a filled goal lives and how it reaches the executor** — embedded in the per-spec
  prompt, appended at the launch assembly (runbook §3 step 4), or pasted into the session.
- The **concrete borders** of field 4 — including any protected-subject data domain the repo
  reserves above all others, and who gives each GO.
- The **code-standard citations** of field 7 and the **testing policy** of field 3.
- **Worked examples** with product vocabulary, and any localized field labels.

The L3 binding points here; if it restates the fields or the mode rules, it drifts.

---

*Provenance: elevated from a consumer's live failure class — idle-yield turns and oversized,
under-defined dispatches that forced the operator into "continue, continue" — after the consumer
bound and used the concrete instance first. Elevated by authority decision (see the decision
register); the consumer's bound instance is the reference implementation.*
