# Glossary — the dev-kit vocabulary

> Every word this kit (and its heirs) leans on, in one place. One line each. Look it up
> **on demand** — this is not loaded every session. When a term has a home doc, it's
> named in `code`.

## The layering (how governance inherits)

- **L1 — neutral core.** The agnostic principle/skeleton, with **no brand / product / vendor / methodology name**. Lives in the dev-kit. The universal truth.
- **L2 — house binding.** The **VibeThink** instantiation of an L1 (branded on purpose), shared by all VibeThink products. Lives in the dev-kit. e.g. **VT-Method**.
- **L3 — product-specific.** Everything particular to ONE product — file names, accounts, thresholds, domain vocabulary. Lives in **that product's repo**, and **never rises to the kit**.
- **Fire-test.** The check that an L1 doc names no product/vendor/brand/framework/methodology. If it fails the fire-test, it isn't L1.
- **Upstream → fork.** The kit is the **upstream** of governance; each product is a **fork** that inherits L1+L2 and adds its own L3.
- **By reference vs by copy.** Canon/knowledge is inherited **by reference** (point at the kit, never copy the doc). Runnable scripts travel **by copy + a parity gate**.

## Governance artifacts

- **Canon.** A constitutional rule (`CANON-{DOMAIN}-{TOPIC}-NNN.md`): what is and isn't allowed. Sealed only by the single named authority.
- **Canon lifecycle.** `DRAFT → PROPOSED → ACCEPTED → SEALED → AMENDED → SUPERSEDED-BY | DEPRECATED`.
- **Sealed.** In effect and immutable without an amendment marker. **Seal = committed + pushed** by the authority — a PR **merge can be the seal**.
- **ADR** (`ADR-YYYYMMDD-slug.md`). A decision record — *why this design*. Body is **immutable after ACCEPTED**; supersede with a new ADR, never edit it.
- **The three governance instruments** (`CANON-STATE-MIRROR-AND-DECISION-REGISTER-001`): **present-mirror** (the whole state on one page · overwritable) · **append-only log** (the history / why · never edited away) · **decision register** (the ledger of authority approvals).
- **DECISION-REGISTER.** The dev-kit's own decision register (`doc/decisions/DECISION-REGISTER.md`) — every authority seal, recorded the moment it is granted.
- **Piece / catalog.** A unit of inheritable governance, numbered in the catalog `setup/ADOPT-DEV-KIT.md`. A consumer declares its adoption per piece.
- **Finding.** An out-of-scope anomaly / risk / opportunity, recorded (category · location · why · suggested action) — never silently fixed, never lost.

## Mechanisms (how a rule actually "bites")

- **Instrument.** A copyable template set that turns a canon into something usable (e.g. `setup/templates/versioning/`, `setup/templates/feature-docs/`).
- **Gate.** A `check-*.mjs` that mechanically enforces a rule. **Config-driven** — it **skips** when a repo has no config for it (a skip is reported, never a silent or false fail).
- **`devkit-doctor`.** The one-screen health board — runs every gate against a repo, verdict first.
- **`devkit-doctor --adoption`.** The inventory lens — *what* a repo has adopted from the kit (distinct from gate health).
- **`devkit-upgrade`.** One-shot: pull (ff-only) + re-sync copied runnables + provision missing tools + report drift.
- **Copy-parity.** The gate that keeps a copied runnable byte-identical to its kit source.
- **Inheritance status board** (`DEV_KIT_INHERITANCE_STATUS.md`). A consumer's per-piece adoption declaration. **Status vocabulary:** `WIRED-CI(file:job)` · `WIRED-HOOK(file:hook)` · `WIRED-SCRIPT(file)` · `DECLARED-ONLY(file)` · `ADOPTED-NATIVE` · `PENDING` · `N-A(reason)`. **Silence is not declaration.**

## Method & roles

- **VT-Method** (`knowledge/methodology/VT-METHOD.md`). The VibeThink dev method (L2): slice → decision gate → specify → execute (governed) → leave the trail → findings.
- **Slice.** The smallest change that ships and stands on its own (one boundary, one owner, independently verifiable).
- **Decision gate.** The checkpoint that picks how much spec ceremony a slice needs — **presented, waits for an explicit GO**, never self-cleared.
- **The dance.** Architect ↔ executor handoff carried over **git** (no person is the message bus).
- **Architect / executor / coder.** Architect = directs + verifies. Executor / coder = implements + opens a **draft PR** (proposes; never self-merges).
- **The compass.** The human-facing message shape: **verdict first, plain first, depth on demand**; every message answers *where I stand · what happened · what's missing*; never close open-ended.

## Mantras (the principles you'll hear repeated)

- **Governance first.** No code without passing the decision gate.
- **Build on pain.** No machinery — or canon — ahead of demonstrated need.
- **Learn before you automate.** Do it by hand until you understand it; automate only the learned, mechanical part — judgment stays with the human.
- **Extract patterns, not dependencies.** Read an external tool, copy the *idea*, never inherit the dependency.
- **Fail-closed.** A broken guard denies by default.
- **No silent default / no silent skip.** A skipped check, an N-A, or a dropped item is **stated**, never hidden.

---

*New here? The door is `knowledge/START-HERE.md`. The map of all canons is `knowledge/SUPRA-MAP.md`. The on-ramp ("how do I adopt this") is `setup/USING-THE-KIT.md`.*
