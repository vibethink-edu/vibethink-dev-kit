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
