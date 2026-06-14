# CANON-VERTICAL-UI-INHERITANCE-001 — How a vertical inherits the supra's look & assistant

> **Status:** DRAFT (pending Principal Architect seal)
> **Layer:** L2 (house — VibeThink platform governance)
> **Source:** authored 2026-06-13, distilled from the first vertical's UI contract
> (`vibethink-campus/docs/UI-FOUNDATION.md`) and the visual-parity Ola. It is the
> normative companion to `CANON-VERTICAL-BOUNDARY-001` (the data/duty boundary,
> §"Platform-first") and binds with `CANON-NAMING-CONVENTIONS-001` (D-6, code in
> English).

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

## Gates

vendor/copy-parity (no fork/drift, kit piece #31) · D-6 (code in English) ·
cross-agent layering · build/test green · declared responsive breakpoints (e.g.
380px + desktop). A PR that forks the design system or hardcodes visible strings
is returned, not patched.

## Binding (how a vertical declares adoption)

The canon lives in the dev-kit (supra). Each vertical:

1. Declares its **binding** in `docs/UI-FOUNDATION.md`: names the real UI package,
   the theme, the shell, the **language set**, and the **Assist backend state**.
2. Keeps the vendor/copy-parity gate as the enforcing mechanism (no drift).

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
