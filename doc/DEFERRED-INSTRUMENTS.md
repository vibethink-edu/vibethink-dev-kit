# Deferred Instruments — build-on-pain backlog (tracked, NOT forgotten)

> Instruments (gates / tools / automations) we **deliberately did not build yet** because the
> manual rule is the floor and the pain that would justify the automation has not materialized
> (`CANON-AUDIT-PROTOCOL` §8.4 self-triggered cadence + the over-engineering boundary). They are
> recorded here with an **explicit, falsifiable trigger** so a good idea is **neither built
> prematurely nor lost in the "box of memories."** Review this list at a hygiene / "what's next" pass.

## Discipline
- **One row per deferred instrument:** *what · origin · why deferred · TRIGGER to build · status.*
- A row **leaves** this list only when **(a) built** (→ a `DECISION-REGISTER` row + the canon/instrument),
  or **(b) dropped** (the need disappeared — record why).
- The **trigger is falsifiable** — a concrete condition you can observe, not "someday." When the
  trigger fires, the deferral is over: build it.

---

## Review Protocol: dead, alive, or family

Use this protocol for attractive ideas, external standards, helper tools, and candidate instruments that
are **not yet proven enough** to become part of the inherited kit. The goal is to avoid both mistakes:
shipping a fashionable surface too early, and losing a useful seed in an untracked memory box.

### State vocabulary

- **DORMANT:** the idea is documented and safe to revisit, but no real consumer demand exists yet.
  It must have a named wake-up trigger. No template/canon surface is added while dormant.
- **ALIVE-GUARDRAIL:** the idea produced a safety rule, test, or guardrail that is valuable even if
  the original idea never graduates. Keep the guardrail; do not imply product adoption.
- **FAMILY-CANDIDATE:** a real consumer need has fired, the benefit is measured against a baseline,
  and at least one consuming repo can use it without confusing authority boundaries.
- **ADOPTED-FAMILY:** the instrument/profile is now part of the inherited kit. This requires the
  normal authority path: decision record, docs/templates/tooling, tests, and adoption guidance.
- **DROPPED:** the idea is harmful, superseded, or the named trigger expired without demand. Record
  the reason so the same proposal does not restart from zero.

### Evidence ladder

- **E0 - Interesting idea:** source seen, no local proof.
- **E1 - Primary-source fit:** source/spec reviewed; fit and mismatch named.
- **E2 - Mechanical safety:** guardrails/tests exist for authority, drift, freshness, or security risks.
- **E3 - Real behavior test:** a realistic task shows better agent behavior than the baseline.
- **E4 - Observed demand:** at least one real consumer asks for it or hits the named trigger.
- **E5 - Repeatable adoption:** two independent contexts or one high-leverage family use case need
  the same surface, with docs and tests ready.

### Review questions

1. What real event triggered the review?
2. Is this an import need, an export/share need, a guardrail, or a new tool?
3. What does it replace, and what would become duplicated?
4. Which file or system remains the source of authority?
5. How could an agent confuse a descriptive field with accepted truth?
6. Was the benefit measured against the existing baseline?
7. What is the cheapest useful residue if the idea stays dormant?
8. What concrete event wakes it up, and what concrete event kills it?

### Graduation rule

Do not graduate from **DORMANT** to **FAMILY-CANDIDATE** on elegance, vendor momentum, or a single
self-administered demo. Graduation needs a fired trigger plus evidence that the consumer's actual
workflow improved without weakening the kit's authority model.

---

## Backlog

### KDD exchange profile / OKF-compatible frontmatter
- **What:** an optional exchange/profile surface for KDD Knowledge Packs using descriptive Markdown
  frontmatter (`type`, `title`, `description`, `tags`, `timestamp`) and OKF-compatible navigation
  only when a real sharing/import workflow needs it. Authority remains single-source in
  `PACK-METADATA.md`; descriptive fields never confer KDD acceptance.
- **Origin:** 2026-07-02 KDD/OKF spike and reviews (Cole Medin bundle + Google OKF primary sources),
  followed by hardened guardrails, an external-bundle behavior test, Opus adversarial review, D-056
  baseline-health clarification, and Fable methodology review.
- **Why deferred:** safety is solved, demand is not. The behavior benefit was shown for consuming a
  large external bundle, which the current guardrail already supports as `raw-input`. Exporting KDD
  packs as OKF-like bundles is the template-support case, and no real consumer has requested it.
  A KDD pack also has ten fixed, self-descriptive files; navigation is not its bottleneck.
- **TRIGGER to build:** build an exchange-profile PR when either (a) a real Knowledge Reconstruction
  Sprint imports an external OKF bundle and needs repeatable kit support, (b) an external consumer
  requests a KDD Knowledge Pack as a portable bundle, or (c) two independent repos need the same
  KDD exchange surface and a behavior test shows improved context selection over the plain pack.
- **KILL / DROP trigger:** drop the OKF-specific shape if the format changes incompatibly, another
  exchange profile supersedes it, or any real use confuses OKF/descriptive conformance with KDD
  authority. Keep any independent guardrails that still protect KDD.
- **Status:** DORMANT template adoption; ALIVE-GUARDRAIL retained - 2026-07-02.

### fan-out-readiness check
- **What:** a config-driven check that surfaces fan-out candidates **by machine** — each unit
  declares a **structured `surface` field** (NOT mined from prose, which the pilot found fragile),
  and the check crosses declared surfaces to flag **≥2 ready + independent units** at session start /
  "what's next" / post-dispatch, so the wave is proposed without relying on an agent remembering.
- **Origin:** consumer elevation (a vertical's pilot) → `CANON-CODER-ORCHESTRATION-001` §9.1 (the
  Fan-Out Gate, D-040). The **manual gate** shipped; this is its **level-3 automation**.
- **Why deferred:** the live failure was **behavioral** (the wave was not *evaluated*) → the manual
  gate (§9.1) fixes it. The automation adds a **structured-surface adoption cost** to every unit;
  build-on-pain says manual first.
- **TRIGGER to build:** the §9.1 **manual gate demonstrably fails** — ready, independent units are
  still missed (the human still has to push for the wave) **despite** the gate. Then build the check
  + the structured-`surface` field.
- **Status:** DEFERRED — 2026-06-19.

### external-tools pin integrity check
- **What:** a check that each pin in `setup/external-tools.lock.json` is **internally consistent
  and resolvable** — the `package` field **matches what `EXTERNAL-TOOLS.md` declares**, and (online)
  the `package`+`pin` actually **resolves on its registry** (pip/npm). Catches a pin whose package
  name is wrong/typo'd so a consumer following the kit's refresh suggestion does not silently fail.
- **Origin:** a wrong pin — `package: "graphify"` when the PyPI package is **`graphifyy`** (the CLI
  is `graphify`, the package is `graphifyy`; D-024 conflated them, D-044 reverted). A consumer
  caught it empirically (refresh → `pip install graphify` fails).
- **Why deferred:** the doc (`EXTERNAL-TOOLS.md`) already had it right; the lock drifted from its own
  doc. The fix is a 1-field correction; a checker is heavier (the registry-resolve half needs network
  / CI). Build-on-pain: a manual lock↔doc read is the floor.
- **TRIGGER to build:** pin-name drift **recurs** (another lock pin diverges from `EXTERNAL-TOOLS.md`,
  or another refresh fails on a bad pin). Then build the consistency check (offline: lock `package` ==
  doc; online/CI: `package==pin` resolves).
- **Status:** DEFERRED — 2026-06-19.
