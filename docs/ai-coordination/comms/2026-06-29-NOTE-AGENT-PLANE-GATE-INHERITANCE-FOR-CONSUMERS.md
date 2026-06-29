# 📌 NOTE — Agent-plane gate (§8.1): consumers INHERIT, they don't replicate

- **From:** devkit-architect (Claude Code · Opus 4.8).
- **For:** all dev-kit consumers — **WorkBench**, ViTo/orchestrator, Campus, future repos.
- **Date:** 2026-06-29.
- **Subject:** `CANON-DEVELOPMENT-PROCESS.md §8.1` (SEALED) + `REFERENCE-AGENT-PLANE-STANDARDS-MAPPING.md`.

---

## The question: "does WorkBench have to replicate this?"

**No. WorkBench (and every consumer) INHERITS it — it does not copy or re-author it.**

§8.1 is an **agnostic L1 spine rule**. The spine is inherited upstream→fork; re-writing a spine rule
in a consumer is the consumer-local-canon anti-pattern (`CANON-KNOWLEDGE-NATIVE-VT-METHOD-001 §11`).
There is exactly **one** statement of the rule (the dev-kit canon); consumers point to it.

## What a consumer DOES do (the L3 binding)

Inheriting the rule ≠ nothing to do. Each consumer **binds the concrete tooling** at L3:

- pick the contract/description format and **code-generation** source (the GUI + agent plane derive
  from the same contract);
- pick the **conformance probe / contract-test** tooling that proves each verb live
  (read real data · mutate+verify effect/idempotency/conflict · observe by a real subscriber ·
  emit+observed · discovery round-trips · provenance recorded · negative cases);
- wire the trigger at its **capability boundary** (its capability/widget registry), default-infer for
  CRUD, risk-tier (hard block tenant-visible/prod, advisory internal), human-approved escape.

The **rule, the four verbs, and "proven by execution not declaration"** are fixed by the spine. The
**how** is the consumer's.

## Why WorkBench especially

1. **It's an orchestrator/automation engine** → its own surfaces are prime agent-plane consumers
   (dogfooding: WB features need read+mutate+observe+emit for the agents it runs).
2. **It pairs with §7.2 (enforcement-at-dispatch).** WB dispatches product-shaping work; §7.2 already
   makes the orchestrator the gate that requires a target-repo Knowledge Baseline. §8.1 is the sibling:
   the **capability** a dispatch produces must carry its agent plane, proven by execution. Same
   philosophy (prove, don't declare), one hop apart.

## TL;DR for the WorkBench chat

Inherit §8.1 from the dev-kit (don't replicate). Your work = bind the conformance gate to WB's
capability registry + probe tooling, and connect it to the §7.2 dispatch gate you're already building.
