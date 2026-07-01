# CANON-SKILLS-OVER-ROLES — Composable skills replace specialized roles (universal · agent-agnostic)

> **Scope:** every repo that coordinates modern coding agents (and humans) on shared work.
> Vendor-neutral, product-neutral, tool-neutral.
> **Status:** SEALED 2026-06-05 by the Principal Architect — Tier A consolidation (autonomous-close authorization). **Re-sealed 2026-06-05 by the Principal Architect** — amendment §13 (the skill eval loop) confirmed.
> **Home:** the dev-kit (supra-repo). Inherited by every repo as upstream → fork.
> **Siblings:** `CANON-MULTI-AGENT-ORCHESTRATION` (how agents hand work between each other) · `CANON-AGENT-SCOPE-DISCIPLINE` (how an agent scopes a session) · `CANON-AGENT-COLLABORATION` (how an agent works with the human authority).

---

## §1 — Founding principle

> **Modern coding agents are executive generalists, not per-domain specialists. Forcing them into permanent role identities wastes capacity and adds bureaucracy without preventing errors. Giving them composable skills, invoked per task, respects their nature, produces better results, and scales.**

### §1.1 — The founding analogy: the hospital vs the carpenter

**Old model (a hospital of 35 specialists):** you hire 35 employees, each expert in one thing — hammer, saw, chisel. To hang a picture you call the hammer one, who can't help you measure because the ruler belongs to another. The 35 wait their turn, argue over who does what, write notes to coordinate. Any job takes 5× longer.

**New model (one carpenter with a toolbox):** you hire a carpenter. The carpenter owns the toolbox. To hang the picture they grab the hammer; to measure, the ruler; to cut, the saw. No consultation, no negotiation, no waiting. When done, they put the tools away. Next time, the same carpenter grabs whatever they need.

The only piece worth keeping from the first model is **the foreman** — the human authority who decides what work to do and in what order. They do not need 35 employees with 35 titles. They need one capable generalist with a good toolbox.

---

## §2 — What this model deprecates

The following **permanent** constructs are deprecated as agent identities:

- **Permanent per-domain roles** (one agent that "is" the security specialist, the database specialist, etc.)
- **Session-start greeting ceremony** ("agent-X reporting for duty")
- **Mandatory author siglas on every artifact** (the artifact no longer needs the author's role tag)
- **"Stay in your lane"** as an identity rule (scope is now defined by the *task*, not by a permanent role)
- **Role registries by sigla**

The agent identifier becomes simply the platform/person (e.g. one of the coding agents, or a human) — no specialty suffix. Scope per task is governed by `CANON-AGENT-SCOPE-DISCIPLINE` (the Scope Card declares *what you are working on*, not a permanent role).

---

## §3 — The skill format

> **A skill is a versioned folder in the repo that packages composable procedural knowledge. It contains a manifest file (metadata + instructions) plus the auxiliary files it needs (scripts, templates, validators, references).**

Canonical shape (the exact directory root is a tool-specific L3 detail):

```
{skills-root}/{skill-name}/
├── SKILL.md       ← manifest: metadata + instructions (required)
├── scripts/       ← executable code the agent can invoke (optional)
├── templates/     ← file templates (optional)
├── validators/    ← local validation scripts (optional)
└── references/    ← context-specific docs (optional)
```

The manifest declares, at minimum: `name`, `description`, `triggers` (and `not_triggers` where ambiguity is possible), `required_reading`, `version`. The body holds the pre-flight check, the core procedure, the lifecycle artifacts to update on completion, the scripts available, and the anti-patterns.

---

## §4 — Two-level authority

The role-based model's deep hierarchy collapses to two levels plus the human:

- **Tier 0 — Supreme authority (the human).** The only approver of canon and of external-technology adoption; decides priorities, direction, scope. **Not a role — a person.**
- **Tier 1 — Decision positions, occupied per task.** Positions such as "product owner" or "auditor" are **not permanent roles**. A generalist agent *occupies* a decision position for a task by invoking the related skills, then stops occupying it when the task ends. The position survives as a decision point, not as a permanent identity.
- **Tier 2 — Generalist execution.** Generalist agents with access to the skill library. Zero permanent titles. Each task's scope is defined by the task itself.

**Zero middle management.** This model explicitly forbids reintroducing permanent per-domain titles, specialists that "may only touch" one area, role-to-role handoff protocols, or coordination by role identity (agents coordinate by task, not by identity).

---

## §5 — Choosing a skill: progressive disclosure + three invocation modes

### §5.1 — Progressive disclosure (the three layers)

1. **Metadata index (cheap, always loaded).** The executor starts with every skill's `name` + `description` + `triggers` + `not_triggers` — a few hundred tokens total even for dozens of skills. Like seeing the spines of books on a shelf without opening any.
2. **Full skill (on demand).** When the task matches a trigger, the executor loads only that one manifest. The others stay metadata-only.
3. **Auxiliary files (on specific request).** Templates/scripts/validators are opened one at a time as needed — never the whole folder.

This lets a repo carry **hundreds of skills without saturating the context window.**

### §5.2 — The three invocation modes

- **Mode A — Coordinator specifies (critical tasks).** The coordinator launches the executor with an explicit skill ("use skill X — do not pick another"). Use when the task touches product identity (canon, vocabulary, architecture), when there is real risk of choosing wrong, on first use of a skill, or when the coordinator holds context the executor cannot infer.
- **Mode B — Executor chooses by triggers (the default, ~80%).** The coordinator describes the task; the executor reads the index, matches a trigger, loads only that skill. Use when the task is clear and triggers are well-designed.
- **Mode C — Composition (mixed tasks).** A task crossing several domains chains skills in order (e.g. table → route → vocabulary check), each invoked, applied, and closed in sequence — never all loaded at once.

**General rule:** the default is Mode B. The coordinator escalates to Mode A only for a concrete reason. Mode C emerges naturally when a task crosses domains. The coordinator is a **strategic supervisor, not a middle manager** — escalating to Mode A every time would recreate the very role this model removes.

---

## §6 — The four anti-contamination mechanisms

The risk: "if the executor loads the wrong skill, doesn't it get contaminated by irrelevant context?" Four mechanisms prevent it:

1. **Specific triggers, not generic.** ❌ "when working on API routes" (matches everything). ✅ "when adding an auth guard to a route that currently lacks one." `not_triggers` are equally important — they declare what must *not* fire the skill.
2. **A distinguishing description.** The metadata says what the skill is *not* ("…NOT for data seeding, NOT for schema queries"), so the executor discards fast.
3. **Evaluate-before-apply.** The executor may load a manifest, read it, realize it does not actually match, and **execute nothing** — returning to the index to choose another. Reading the wrong skill is cheap; *executing* the wrong skill is expensive.
4. **Coordinator override.** If the coordinator sees the executor choosing badly, it cuts in with an explicit Mode A. The safety net — used on detected drift, not always.

### §6.1 — Triggers are the skill's contract

Ambiguous triggers are a bug of the **skill**, not the executor. When a new skill is authorized, its triggers must be verified: non-overlapping with other skills, verifiable (the executor can tell whether they match), and carrying explicit `not_triggers` where ambiguity is possible.

---

## §7 — Lessons from the role-based experiment

A repo that ran a per-role model before adopting this one should preserve these lessons (not relitigate them):

1. **A pre-flight check is valid — but it belongs to the task, not the role.** "Before touching the DB, read the schema-lifecycle canon" stays necessary; tying it to a permanent role was the error. The pre-flight migrates into the skill.
2. **Ceremony adds friction without preventing errors.** A start-of-task greeting protocol prevented nothing — errors came from missing *verification*, not missing identity.
3. **Lifecycle tracking belongs to the feature, not the role.** "The DB role maintains the migration changelog" fails because a different agent did the migration. The *feature* knows what happened; the role does not. Each skill updates the touched feature's lifecycle artifacts on completion.
4. **Per-role pre-flight cards proliferate.** Too much surface to read before each task; most of it does not apply and gets lost in the noise.

---

## §8 — Anti-regression rule

This canon explicitly forbids reintroducing:

1. Permanent per-specialty titles as an agent's identity
2. Mandatory author siglas on artifacts
3. Start-of-task greeting protocols
4. Role-to-role handoff ceremony
5. "Stay in your lane" as an agent rule
6. Per-role pre-flight cards

If a future agent proposes reintroducing any of these, refer them to this canon — particularly §7 (lessons) and §1.1 (the hospital-vs-carpenter analogy). This applies **even to the human authority**: it is a structural rule, not an opinion — a new permanent role requires an explicit canon amendment, not an ad-hoc request.

---

## §9 — Validation cases

Any implementation of this model must pass:

- **The agent with no title.** A generalist receives "add a new table for X" and executes it without needing to "be the database specialist" — the relevant skill gives it everything.
- **Two tasks in parallel.** Two agents get different tasks (a route, a migration) and do not coordinate by role identity; they invoke different skills, update different lifecycle artifacts, and do not collide.
- **The ex-role that wants back.** An agent reads archived per-role material and proposes reinstating a role "to standardize X." Rejected, citing §8: the role's knowledge lives in a skill — invoke the skill.
- **The carpenter test.** Before proposing any new coordination rule, ask: *"does this keep the generalist carpenter with a better toolbox, or turn them into a specialist in a lab coat?"* If the latter, it is wrong by design.

---

## §10 — External lineage

This model follows the industry shift from "building agents" to "building skills" — composable, file-packaged procedural knowledge an agent loads on demand — and the harness/orchestration layer that runs sessions on top of generalist agents. The supra-repo tracks the specific external sources in its research notes; the consuming repo's L3 binding records which sources inspired its own adoption.

---

## §11 — When is something a skill? (three levels — settle this once, don't re-research)

Not every task warrants a skill. The state of the art is consistent on the boundary:

- **Level 1 — general programming → NO skill.** Writing CSS, Python, TypeScript, generic logic, generic architecture: the base model is already expert; a skill adds nothing. Do not wrap general coding in a skill.
- **Level 2 — *always*-relevant conventions → the always-loaded rules doc** (the agent's `CLAUDE.md`/`AGENTS.md`-equivalent), not a skill. Constitutional rules that apply to every task live here.
- **Level 3 — *sometimes*-relevant, repeatable, error-prone, project-specific procedure → SKILL** (on-demand, progressive disclosure). This is the only level where a skill earns its keep: a multi-step convention-heavy workflow the model would otherwise do inconsistently (e.g. "produce a compliant DB migration", "harden an API route to the project's auth/validation pattern", "interpret this repo's CI gate failures and run the pre-PR ritual").

**Evidence:** controlled evals across models show a consistent positive lift (roughly +10 to +23 points) when the *right* Level-3 skill is loaded — but only for the specialized/convention-heavy task, never for general coding. The model matters less than the skill you load *for that task*.

**Corollary — skills de-bloat the always-loaded rules doc.** When the rules doc grows past its host's context budget (and starts truncating), that is a signal that *sometimes*-relevant material is mis-filed as Level 2; move it to Level-3 skills (on-demand) to shrink the always-loaded surface.

---

## §12 — Inherit or build a skill? (extract-patterns)

When a skill is warranted, decide inherit-vs-build by **how constitutional its content is**:

- **Build** when the content is the repo's own constitution / conventions / product-DNA (its governance gates, its category vocabulary, its schema rules). No external skill can know your constitution — building it is the point. The more constitutional, the more you build.
- **Inherit** three things regardless, never reinvent them: (1) the **open skill format/standard** (the manifest spec the ecosystem shares); (2) **interaction patterns** proven elsewhere (e.g. reconnaissance-then-act for any check-then-fix skill); (3) a **skill-development / eval-and-benchmark** capability to *measure whether the skill actually works* — adopting a skill without an eval to validate it is how a skill silently rots.

Generic skills (a base code-review) lean toward inherit; constitutional/DNA skills lean toward build. The pattern is agnostic → it can live as a Dev-Kit template; the content is the consuming repo's (L3).

---

## §13 — Does the skill actually work? (the eval loop)

§11 decides *whether* to create a skill (a-priori criterion). §13 is the missing other half: **evidence** that a created skill earns its place (a-posteriori). A skill adopted on intuition, never measured, silently rots — it drifts from the task, bloats context, or was never load-bearing to begin with. The eval loop is the guardrail §12's third inherit-item points at, made concrete.

### §13.1 — The loop (five steps, provider-agnostic)

1. **Eval set** — a small, fixed set of representative tasks the skill is meant to help with (5–15 is enough), each with a **checkable success criterion** — a rubric, an expected artifact shape, a gate it must pass. This rubric is the skill's *contract*; treat it as a verification artifact, not prose.
2. **Baseline** — run the eval set with the skill **not** loaded; score against the rubric. This is the honest "what the bare model already does" number — the same discipline as measuring before optimizing.
3. **With-skill** — run the same set with the skill loaded; score against the same rubric.
4. **Lift** = with-skill − baseline. Adopt or keep the skill **only** when the lift is clearly positive and worth the context cost. Zero or negative lift → the skill is noise: cut it, or rewrite its triggers/body and re-run. "Sounds useful" is not adoption evidence; the lift is.
5. **Regression** — re-run the eval set on a trigger (skill edited, host model changed, periodic sweep). A skill that helped at adoption can decay; the eval set is its standing regression test.

### §13.2 — The eval is a verification contract, not a new mechanism

A skill's eval set is exactly a **canon-contract** in the verification taxonomy — a checkable rubric over representative inputs. It is owned by, and runs under, the repo's existing testing/verification gate; §13 does **not** invent a parallel test system. Where a verification gate already routes change-nature × stakes to a test type, "validate a skill" routes to *canon-contract eval*, and escalates to architecture review only when the skill itself encodes a high-stakes contract.

### §13.3 — Inherit the loop, never the dependency

The eval-loop *capability* (a viewer to inspect runs, a runner to execute the set, a benchmark to compare baseline vs with-skill) is a proven external pattern — **inherit the pattern, implement a minimal own version, do not take a runtime dependency** (§12). The eval set's *content* — which tasks, which rubric — is the consuming repo's (L3); the loop's *shape* is agnostic (this spine). A consuming repo binds §13 by naming where its eval sets live and which gate runs them.

### §13.4 — Floor

No hard ceremony for a one-off, low-stakes skill — but a skill that gates production behavior, governs a constitutional convention, or is loaded broadly **must** carry an eval set before it is treated as load-bearing. Unmeasured skills in that tier are a finding, not a default.
