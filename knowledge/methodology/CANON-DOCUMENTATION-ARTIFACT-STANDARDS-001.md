# CANON-DOCUMENTATION-ARTIFACT-STANDARDS-001 — One standard per doc artifact, bound to a recognized external standard (universal · agent-agnostic)

> **Status:** SEALED 2026-06-18 by the Principal Architect ("quitarlo" + seal) — D-019. The one open decision (the work-journal, §5) is resolved: **removed**. Fire-test passed (binds to public/recognized external standards; names no product/vendor/house-invention).
> **Scope:** every repo that produces documentation artifacts (proposals, decisions, specs, changelogs, runbooks, postmortems, architecture docs).
> **Home:** the dev-kit (supra-repo). Inherited by every repo as upstream → fork.
> **Family:** documentation discipline · binds with `CANON-VERSIONING-001.md`, `CANON-NAMING-CONVENTIONS-001.md` (ADR filename pattern), `CANON-DEVELOPMENT-PROCESS.md` (feature-doc instrument), and `CANON-DECISION-DISPOSITION-FOR-GRAPH-INDEXING.md`.

## §1 — Principle

> **Tie every documentation artifact to the recognized external standard a developer already knows. Do not invent a house format where a SOTA standard exists, and do not make a developer learn a bespoke thing.**

The cost of a house-invented doc format is paid twice: once writing it, once every time a new contributor (human or agent) has to learn it. Where a widely-recognized standard exists, the kit **binds to it**; the only house artifacts that survive are the few for which **no external standard exists** (§4), kept minimal and justified.

## §2 — The canonical artifact set (each bound to its standard)

| Stage | Instrument | Answers | Bound standard | Template |
|---|---|---|---|---|
| Propose | **RFC / Design Doc** | what I propose + why (pre-decision) | RFC (IETF/Rust) · RFD (Oxide) | `setup/templates/rfc/` |
| Decide | **ADR** | what was decided + consequences | **MADR** (adr.github.io) | `setup/templates/adr/` |
| Define product | **PRD** | what we build & for whom | PRD (generic; opt. *Working Backwards*) | *(convention)* |
| Specify | **Spec** (spec/plan/tasks) | how, step by step | **SDD / SpecKit** | *(shipped — spec-kit)* |
| Track feature | **Roadmap** | what stage we're at | `now/next/later` *(house, §4)* | `setup/templates/feature-docs/` |
| Record changes | **Changelog** | what changed in the code | **Keep a Changelog 1.0.0** | `setup/templates/feature-docs/` |
| Version | **SemVer/CalVer + Conventional Commits** | what version & why it bumped | SemVer 2.0 · CalVer · Conventional Commits 1.0 | `setup/templates/versioning/` |
| Ship to prod | **PRR** (Production Readiness Review) | ready for prod? + rollback | **Google SRE PRR** | `setup/templates/prr/` |
| Learn from failure | **Postmortem** | what failed & how to prevent it | **Blameless postmortem (SRE)** | `setup/templates/postmortem/` |
| Operate | **Runbook** | how to operate / recover this | **SRE runbook** | `setup/templates/runbook/` |
| Organize ALL docs | **Diátaxis** (meta) | where each doc goes | **Diátaxis** | `setup/templates/diataxis/` |
| Architecture | **C4 / arc42** | how the system is built | C4 model · arc42 | `setup/templates/architecture/` |
| Repo onboarding | **README** | what is this & how to start | Standard-Readme | *(convention)* |
| Forks | **UPSTREAM** | where it came from & what changed | *(house, §4 — license practice)* | `setup/templates/feature-docs/` |

The kit ships the **template** for each row that needs one; the consuming repo binds the same names/templates (§6).

## §3 — Supersede / rename directives (the "don't invent" deltas)

- **`PRDI` → `PRR`.** A "Plan de Revisión, Despliegue e Implementación" is a Production Readiness Review. Rename + align sections to PRR: **state → gap → plan → validation → rollback** (the rollback section is the part a house PRDI usually misses).
- **ADR → MADR.** Adopt the MADR template + **one** naming convention across consumers (resolve `ADR-YYYYMMDD-slug` vs `TOPIC-YYYYMMDD-slug` — the kit's `CANON-NAMING-CONVENTIONS-001` §6 owns the ADR filename pattern; align to it).
- **Adopt Diátaxis** as the taxonomy for `docs/` (tutorial / how-to / reference / explanation) — the biggest SOTA gap today.
- **New slots:** RFC/RFD, Postmortem, Runbook, C4/arc42 — adopt the standard, ship the template.

## §4 — House-legitimate artifacts (no external standard exists — keep minimal)

These have **no** SOTA standard; they are kept because they serve a real need, minimal and consistent — not inventions to fix:
- **Roadmap** (`now/next/later`).
- **UPSTREAM** (fork license-compliance practice).

A house artifact is legitimate **only** when no recognized external standard covers its job. The default is always: bind to the standard.

## §5 — The work-journal is REMOVED *(decided 2026-06-18 by the Principal Architect — "quitarlo")*

The **work-journal** (`BITACORA` / `LOG`) has **no** SOTA standard — no developer "already knows" it — and its content is covered by **Changelog** (deltas) + **ADR** (decisions) + **git history**. It is therefore **removed**, folded into those three — the purest application of §1 (don't invent where a standard already covers it). This is the cuadro's only *remove*, not *rename*.

- **No `BITACORA` / `LOG` artifact** in the kit's standard set. Narrative that used to go there: deltas → Changelog; decisions/why → ADR (MADR); chronology → git history.
- **Kit reconciliations (this seal):** the feature-docs instrument no longer ships `LOG.template.md`; its README + config example drop it; `CANON-DEVELOPMENT-PROCESS` §5 notes the removal.
- **Consumer reconciliation (their lane, after seal):** a consumer that mandated a per-feature work-journal (a product-side `CANON-FEATURE-LIFECYCLE-TRACKING` / Rule #22) updates that rule on re-bind; WorkBench drops `LOG.md`.

## §6 — Consumer-binding rule

The kit defines the standard; **each consumer binds to the same names/templates** so teams and agents document identically. Divergences to unify on re-bind (consumer's own lane, after seal):
- one **docs root** convention; one **ADR** naming (MADR); one **decisions home**; the **work-journal** per §5; templates come from the shipped `setup/templates/` files, not embedded copies.

## §7 — Per-repo binding (L3)

Each consuming repo declares: its docs root, its ADR/decisions location + naming, which templates it has adopted, and (per §5) its work-journal posture. The concrete locations are L3; the **standard per artifact** is L1.

## §8 — Inheritance

This kit is the **upstream** of governance. Each repo is a **fork** that inherits this canon and binds the same standards/templates. Per-repo locations stay in that repo's layer.

## Fire-test

This document names no **product, vendor, or house-invented format** as a standard. The standards it binds to are **public, recognized, external** (MADR, Keep a Changelog, SemVer, Conventional Commits, Google SRE PRR/postmortem/runbook, Diátaxis, C4, arc42, RFC/RFD) — naming them is the canon's *purpose* (bind, don't invent), the opposite of lock-in. The only house artifacts (§4) are the ones for which no external standard exists.

## Provenance

From a cross-consumer review (dev-kit + consumers vs SOTA, 2026-06-18) that found the doc methodology partly SOTA-aligned, partly house-invented, inconsistent across consumers (`BITACORA` vs `LOG`, `ADR-*` vs `TOPIC-*`). Marcelo's principle: *"prefiero estar ligado a estándares para no inventar o decirle a un developer que aprenda otra cosa que ya maneja."* The fix lives in the supra: one standard per artifact, bound to SOTA; consumers re-bind to the same.
