# CANON-PRODUCTION-SAFETY — What the production artifact must not contain (universal · agent-agnostic)

**Status:** SEALED 2026-06-06 by the Principal Architect — agnostic-lift A#18
**Date:** 2026-06-06
**Scope:** Every repo that ships a production artifact — a web page, an app bundle, a service image, a binary. Cross-product (agnostic).
**Companion canons:** [`CANON-DEV-MODE-DISCIPLINE`](./CANON-DEV-MODE-DISCIPLINE.md) (how to operate *while* pre-production — tempo; this canon governs the *boundary* of what ships, independent of mode) · [`CANON-GIT-HYGIENE`](./CANON-GIT-HYGIENE.md) (dev-session hygiene) · [`CANON-ARCHITECTURE-REVIEW`](../ai-agents/CANON-ARCHITECTURE-REVIEW.md) (a production-visible diagnostic is a product feature it reviews).

---

## §1 — Principle

**The production artifact is not the development artifact.** What helps you *build* the thing — debug panels, inspectors, dev shortcuts, config backdoors — must not ship inside the thing the user receives. A production build that carries development affordances is both a **safety** surface (a user can break their own runtime) and an **exposure** surface (internal config, endpoints, secrets, session state leak to whoever opens the artifact).

> **Iron rule:** in production, development affordances do not exist — not hidden behind a flag, **absent**.

This axis is **mode-independent**: it is not about *whether you are in development mode* (`CANON-DEV-MODE-DISCIPLINE`) — it is about what the **shipped artifact contains**, which is true in every mode.

---

## §2 — No development affordances in production

The shipped production artifact MUST contain **zero** of the following:

- **Debug / inspector UI** — panels, overlays, state inspectors, error timelines, fixed dev bars.
- **Developer shortcuts** — key combinations that toggle dev tooling or conflict with the user's own.
- **Config / runtime backdoors** — any path (URL parameter, hidden global, console command) that lets the runtime's configuration be read or edited outside the product's own governed UI.
- **Dev-only global APIs** — objects/functions exposed for development that a production user could call.
- **Output intercepts** — capture of logs/console/telemetry into a user-reachable surface.

"Zero" means **not created**, not "created but hidden" — no DOM, no listeners, no globals.

---

## §3 — Gate at the build / host boundary, not a runtime flag

The exclusion is enforced **where the artifact is produced or where it runs**, in a way the end user cannot flip:

- **Build-time elimination** (the dev code is tree-shaken / compiled out of the production bundle), **or**
- **A host/origin check that fails closed in production** (the affordance self-disables off a trusted-host signal, exposing a no-op surface so dependents do not break).

It is **NOT** a runtime toggle a user can enable. **No backdoor** — no `?debug=…`-style override survives into production. A gate with an override is not a gate.

---

## §4 — Production-visible diagnostics are a product feature, not debug tooling

If production users genuinely need diagnostics (connection quality, sync status, a health indicator), that is a **designed, reviewed product feature** — named, scoped, built as a real UI component, governed like any feature (`CANON-ARCHITECTURE-REVIEW`). It does **not** reuse the debug infrastructure and does **not** become a backdoor. The need for prod diagnostics is satisfied by *building a feature*, never by *leaving debug tooling on*.

### §4.1 — The diagnosability floor: a system that cannot explain why it blocks is not production-ready *(SEALED 2026-06-11 by the Principal Architect — "SEAL DALE", agnostic-lift batch G→Z)*

§2 removes what must not ship; this is the floor of what **must**: the production artifact can **explain its own denials deterministically**, or every blocked user becomes hours of artisanal debugging.

- **Reason codes, not silence.** Every blocking decision (auth, data state, config, runtime failure) emits a stable, machine-readable reason code with **PII-safe evidence** — never a bare denial.
- **Severity taxonomy.** Diagnoses classify as *blocker / warning / info*, separating technical failure, missing business state, incomplete configuration, and placeholder surfaces — without the separation, everything feels like a bug and the wrong people debug it.
- **Trace correlation.** A request-scoped trace id flows through every layer and into every structured log line, so one identifier reconstructs the full path of a denial.
- **Read-only diagnosis.** The diagnosis surface **observes and explains; it never mutates, never enforces, never repairs** — enforcement stays in the guards, fixes stay explicit. (This keeps it from becoming the §3 backdoor.)

The concrete taxonomy, endpoint shape, and trace-id format are L3 binding. The floor is the *capability*: blocked → explained → actionable, in minutes, not hours.

---

## §5 — Enforced, not trusted

The exclusion is verified by an **automated gate** (CI and/or a pre-merge/pre-push hook) that **fails closed**: if a development affordance can reach the production artifact, the gate blocks the merge with an actionable message. Discipline that depends on every author remembering decays; the gate is what makes §2–§4 real. (The concrete scanner and its rules are L3.)

---

## §6 — No exceptions

The rule is **absolute**. There is no "just this once", no "behind a flag for staging-in-prod", no "only the team knows the shortcut". An apparent exception is always one of two things: a **product feature** to be designed (§4), or a **gap in the gate** to be closed (§5) — never a backdoor.

---

## §7 — L3 binding (what the consuming repo owns)

- The concrete **exclusion mechanism** for its stack (build flag / env var / bundler tree-shaking / trusted-host check) and the **no-op surface** shape.
- The **gate tool** and its scan rules (what file patterns / signatures it checks), and where it runs (CI job, pre-push hook).
- The **artifact types** in scope (which pages / apps / bundles / services).
- **Worked examples** and the **originating incident** (what leaked, or nearly did, before the gate).

The L3 binding points at this canon as the spine; it does not restate the principle.

---

## §8 — What this canon does NOT do

- It does **NOT** prescribe the stack mechanism (hostname check vs build flag vs bundler config) — that is L3 (§7).
- It does **NOT** govern pre-production **tempo** (delete-by-default, no-ceremony) — that is `CANON-DEV-MODE-DISCIPLINE`.
- It does **NOT** design the product-feature replacement for a genuine prod diagnostic (§4) — that is normal feature work under `CANON-ARCHITECTURE-REVIEW`.

---

## Provenance

Lifted from a product-side `CANON-DEBUG-GOVERNANCE-001` ("Zero Footprint Debug Tooling", CANONICAL 2026-03-20), whose agnostic substance — *the production artifact carries no development affordances; the exclusion is gated at the build/host boundary with no backdoor; enforced by CI; a real prod diagnostic is a product feature* — was buried under product-specific binding (the dev-host list, the IIFE / `window.DebugPanel` no-op pattern, the `process.env.NODE_ENV` React pattern, the `validate:debug-gate` scanner, the file-name scan rules, the worked example).

**Coverage-check (agnostic-lift A#18):** the principle is **mode-independent** (it constrains the shipped artifact in every mode), so it does not fit `CANON-DEV-MODE-DISCIPLINE` (which governs *tempo while pre-production*); `CANON-GIT-HYGIENE` is dev-session hygiene; no production-safety / release-hardening home existed. This thin spine creates that home — designed to **grow** as further production-hardening rules are lifted. The product-side canon restructures to a thin L3 binding pointing here.

**SEALED 2026-06-06 by the Principal Architect** (Rule #4 — Principal Architect approval given).
