# CANON-VERTICAL-UI-INHERITANCE-001 — How a vertical inherits the supra's look & assistant

> **Status:** DRAFT (pending Principal Architect seal)
> **Layer:** L2 (house — VibeThink platform governance)
> **Source:** authored 2026-06-13, distilled from the first vertical's UI contract
> (`vibethink-campus/docs/UI-FOUNDATION.md`) and the visual-parity Ola. It is the
> normative companion to `CANON-VERTICAL-BOUNDARY-001` (the data/duty boundary,
> §"Platform-first") and binds with `CANON-NAMING-CONVENTIONS-001` (D-6, code in
> English).

> **Amendment (proposed 2026-06-20):** adds **Terminology (tenant-overridable, Rule 6)**
> + the **i18n-string machine gate (Rule 7)** — a consumer elevation: a vertical (Campus)
> shipped hardcoded user-visible strings to main with **no machine gate** catching them,
> and the tenant-overridable terminology layer (the "tenant context") was unbound. Seals
> together with the canon.

## The thesis

**One design system, inherited — never forked. A vertical COMPOSES screens from
shared primitives; it does not redesign.**

Inconsistency between verticals = brand erosion + duplicated maintenance. The
supra **owns** the design system; verticals **consume** it. "Make it look good"
is never "redesign it": it is **replicating the supra's pattern** with primitives
already provided. This is the UI face of `CANON-VERTICAL-BOUNDARY-001`'s
Platform-first rule — if the platform ships a UI system, the vertical CONSUMES or
EXTENDS it, it does not rebuild a parallel one.

## What a vertical inherits (the layers)

| Layer | What | Source | How |
|---|---|---|---|
| **Design-system package** | primitives (buttons, tables, cards…), providers, icons | the supra's UI package | **vendored** into the vertical; **parity-gated** (no drift, no fork) |
| **Theme tokens** | color / radius / typography (OKLCH) | the supra's theme tokens | imported into the vertical's global styles |
| **App shell** | sidebar + nav + topbar (search, locale, theme) + breadcrumb | the supra's layout components | **adopted**; the vertical supplies its own nav items |
| **Screen pattern** | list/table surface + filters + states (loading / empty / error) | a reference surface of the supra (e.g. the People/Relations page) | **composed** with the vertical's entities |
| **Assist / AI surface** | assistant panel composed from the chat primitive | the supra's chat component | **inherited surface**; the **AI backend is wired per-vertical** (mock until wired) |
| **Terminology (tenant-overridable)** | short business labels a tenant may rename (e.g. "guardian" → its local word) | the supra's terminology layer (stable ConceptIDs + an override chain) | **inherited**; the override is resolved from the **tenant in session context** — a tenant renames a term, never a code fork |

## Rules

1. **Compose, don't fork.** Never edit the vendored design-system package. The
   **vendor/copy-parity gate** must stay GREEN. A new *generic* component goes
   **upstream** to the supra (everyone inherits it); a vertical-*specific* screen
   is **composed** from primitives — never a third path.
2. **Code in English (D-6).** Routes, folders, identifiers, i18n keys = English;
   visible text travels through i18n **values**.
3. **i18n is per-vertical.** Each vertical declares its own language set (e.g.
   Campus = **en/es**); it does NOT inherit the supra's full language set unless
   it needs to.
4. **Assistant: surface now, backend later.** The Assist UI is inherited like any
   surface; the real AI agent is wired per vertical in a separate phase
   (mock / "AI at wire").
5. **Vertical-specific screens are composed** from primitives + the shell — they
   are not parallel design systems.
6. **Business vocabulary = tenant-overridable terminology, never hardcode.** Full
   UI phrases go through i18n **values** (Rule 2); **short business labels** (entity
   / term names a tenant may rename) resolve through the platform's **terminology
   layer** — stable ConceptIDs + an override chain (`base → … → tenant-override`)
   keyed by the **tenant from session context** (never the user id). A tenant
   (e.g. a school renaming "guardian" to its local word) overrides via terminology,
   **not a code fork**. Neither phrases nor labels are ever a hardcoded string.
7. **No-hardcode is machine-gated, not reviewed.** Rules 2 and 6 (every
   user-visible string lives in i18n / terminology, none hardcoded) MUST be
   enforced by a **machine gate that fails the build** — never left to a reviewer
   to catch. Self-report ("the coder's report says i18n ok") and "returned on
   review" silently drift: a hardcoded string ships and nothing fires. Each
   vertical **binds the gate** (Binding) in its declared language set.

## Gates

vendor/copy-parity (no fork/drift, kit piece #31) · D-6 (code in English) ·
**i18n-string gate (machine — Rule 7: no user-visible string outside i18n /
terminology; fails the build, not a review catch)** · cross-agent layering ·
build/test green · declared responsive breakpoints (e.g. 380px + desktop). A PR
that forks the design system or hardcodes visible strings is **caught by the gate
before review**, not returned-on-read. D-6 governs code *identifiers*; the
i18n-string gate governs *user-visible labels* — they are different gates and a
vertical needs **both**.

## Binding (how a vertical declares adoption)

The canon lives in the dev-kit (supra). Each vertical:

1. Declares its **binding** in `docs/UI-FOUNDATION.md`: names the real UI package,
   the theme, the shell, the **language set**, and the **Assist backend state**.
2. Keeps the vendor/copy-parity gate as the enforcing mechanism (no drift).
3. Wires its **i18n-string gate** (machine, Rule 7) into pre-commit + CI, and
   declares its **terminology binding** (the ConceptID set + the tenant-override
   source). These are the two pieces that make the presentation layer *inherit*
   Rules 2/6/7 — not merely claim them in prose.

> **Worked binding (Campus):** package `@vibethink/ui` (vendored from the
> orchestrator), tokens `theme-tokens.css` (OKLCH), shell `app-sidebar`/`nav-main`,
> languages **en/es**, Assist = surface **yes** / AI backend = **"at wire"**. The
> orchestrator's **People/Relations** module is the table pattern that Campus
> screens (enrollment, etc.) replicate.

## Enforcement

vendor/copy-parity CI/hook (no fork/drift) + the per-vertical `UI-FOUNDATION.md`
binding + this canon. Amendments only by ADR sealed by the Principal Architect.
When "make it pretty" and "don't fork" appear to conflict, **don't-fork wins**:
every parallel UI observed in the wild became permanent maintenance until someone
paid to reconcile it.
