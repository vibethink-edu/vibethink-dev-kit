# ROADMAP — DevKit next additions (architect position, chief-architect directed)

**From:** dev-kit architect (Fable session, 2026-07-01)
**Directive:** the chief architect — "deja en roadmap pero apliquemos lo que sea necesario hoy".
**Context:** follows the same-day maturity audit (Strong, APPROVE WITH FIXES — see `2026-07-01-AUDIT-DEVKIT-MATURITY-REVIEW-FABLE.md`) and the completed PR-1 (#214), PR-2 (#215), PR-3 (#195 sealed).

## Position (one line)

The kit's next quarter is **not more canon** — it is making the constitution something the machine **verifies and applies**: behavioral golden-tasks + machine-readable law. That is what separates Strong from Production-ready.

## The additions, in priority order

1. **Behavioral golden-tasks (the missing leg — do first).** The kit tests its tools (30/30) but never tests the constitution's EFFECT on agents. Ship a fixed battery of trap-tasks ("do X" where X tempts a canon violation: force-push, skip the baseline, invent a port, skip the routing card) run against a fresh agent whenever the kit changes; regressions in agent behavior become red tests, not incidents. Seals §8.1 outcome-conformance with its instrument.
2. **Machine-readable law (policy manifests).** Every sealed canon exports a small YAML manifest (id, MUSTs, NEVERs, the watching check). Prose for humans, manifest for machines, one seal. Kills interpretation-drift ("different results") and the token cost of re-reading prose law each session.
3. **Action-time policy engine (ALLOW/ASK/DENY).** Generalize the existing point-solution hooks into a thin engine that consumes the manifests (2) at PreToolUse-style interception points. "Force-push forbidden" stops being text an agent may not have read and becomes a physical no. (Own prior-art: the omnigent pattern in `ORCHESTRATION-PRIOR-ART-2026-05-25.md`.)
4. **The kit agent-native (CLI → agent surface → human UI, in that order).** Tools are already CLIs (correct order). Add a `devkit mcp serve` exposing doctor/upgrade/inbox/catalog as typed agent tools; a human cockpit only after that surface exists.
5. **Memory consolidation policy (Engram → pack → canon).** Capture exists; destination exists; the PROMOTION rule does not. Define: N repetitions or 1 burn → pack candidate; uncited in 90 days → decay. Closes the learning-loop already on the roadmap.
6. **Governance telemetry (local, no vendor).** JSONL counters per gate (hits, NOT-ROUTED rate, findings throughput) + a doctor lens. You cannot tune warn→block teeth without data.
7. Minor: derived-index lineage aligned to W3C PROV minimal fields; doctor mount-integrity check (audit F-11).

## Maturity read vs public SOTA (recorded)

Governance/heritable constitution: **ahead of public practice** (the moat). Enforcement at boundaries: strong post-PR-1; action-time missing (3). KDD: top-decile **idea** (authority-validated ACCEPTED baseline + freshness manifests — almost nobody has validation, everybody has retrieval), young implementation (retrieval evals, decay, promotion missing). Behavioral evals: the big gap — ours and the industry's (1). Honest risks: seal bus-factor on one named authority; doc weight vs agent budgets (managed); bespoke-ness (mitigated by bind-to-standards).

## Disposition

Items 1–2 are the next build fronts (fresh sessions, one PR each, tests + fire-test per the house pattern). 3 depends on 2. 4–7 opportunistic or behind 1–2. This file is the durable record; the chat is not.
