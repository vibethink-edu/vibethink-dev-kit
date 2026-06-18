<!--
TEMPLATE / MAP — Diátaxis · standard: https://diataxis.fr
Bound by CANON-DOCUMENTATION-ARTIFACT-STANDARDS-001 §2 (Organize ALL docs). Diátaxis is the META
taxonomy: every doc belongs in exactly ONE of four quadrants. Copy this map into your docs root to
decide where each doc goes (the biggest SOTA gap today).
-->

# Documentation map — Diátaxis

Every document serves **one** of four distinct user needs. Put it in the right quadrant; don't mix two in one doc.

| Quadrant | Serves | When the reader is… | Lives in |
|---|---|---|---|
| **Tutorials** | learning-oriented | new, wants to *learn by doing* | `docs/tutorials/` |
| **How-to guides** | task-oriented | working, wants to *accomplish a goal* | `docs/how-to/` |
| **Reference** | information-oriented | working, wants to *look up* exact facts | `docs/reference/` |
| **Explanation** | understanding-oriented | studying, wants to *understand why* | `docs/explanation/` |

## The two axes

- **Action ↔ Cognition:** tutorials/how-to are about *doing*; reference/explanation are about *knowing*.
- **Acquisition ↔ Application:** tutorials/explanation serve *study*; how-to/reference serve *work*.

## Quick test ("where does this doc go?")

- Teaching a beginner a skill step-by-step → **Tutorial**.
- Steps to achieve a specific real-world goal → **How-to guide**.
- Dry, complete, accurate facts (API, config, CLI) → **Reference**.
- Background, rationale, trade-offs, "why it's like this" → **Explanation**.

## Where the other artifacts sit

Diátaxis organizes *product/user documentation*. The governance artifacts (ADR, RFC, PRR, Changelog,
Postmortem, Runbook — see `CANON-DOCUMENTATION-ARTIFACT-STANDARDS-001` §2) keep their own homes; a
Runbook reads as **how-to**, an Explanation may link an ADR for the "why".
