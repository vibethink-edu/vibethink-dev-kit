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

## Backlog

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
