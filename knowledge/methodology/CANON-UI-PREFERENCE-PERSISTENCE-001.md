# CANON-UI-PREFERENCE-PERSISTENCE-001 — Personal UI preference is client state, not governed config (universal · agent-agnostic)

> **Scope:** every repo that serves a UI and persists any per-user view choice (filter default, panel open/closed, view density, last-selected tab, sort direction).
> Vendor-neutral, product-neutral, tool-neutral.
> **Status:** DRAFT / PROPOSED — awaiting seal by the Principal Architect. Not yet binding.
> **Home:** the dev-kit (supra-repo). Inherited by every repo as upstream → fork once sealed.
> **Siblings:** `CANON-CONFIGURATION-DISCIPLINE` (governs where *governed* configuration lives — values that vary by deployment/operator/served-group and are audited; **this canon governs the other side of that boundary**: values that vary only by individual person and are disposable) · `CANON-PRODUCTION-SAFETY` (no dev-affordance/runtime backdoors in the shipped artifact).

---

## §1 — Root principle

> **A per-user, cosmetic, disposable UI preference is client-side state. It persists in the browser (cookie or equivalent), never in the governed configuration/settings store, and never in code.**

`CANON-CONFIGURATION-DISCIPLINE` says: if a value varies by deployment, operator, or served group, it lives in a layered, audited config store — not in code. This canon names the **complement**: a value that varies only by *one individual's view*, carries no governance weight, and would be acceptable to lose, does **not** belong in that governed store either. It is personal browser state.

Putting personal view-state into the governed config store is the mirror-image bug of hardcoding: it pollutes the audited surface, leaks one person's choice across browsers/sessions/users it should not, and pays storage + migration + RLS cost for something disposable.

## §2 — The boundary test (one question, before you persist anything)

> *"If this value were wrong for the next person, would anyone need to **audit**, **administer**, or **explain** it?"*

- **Yes** → it is governed configuration. Route it through `CANON-CONFIGURATION-DISCIPLINE` (config store, admin surface, layered resolution, audit columns).
- **No — it is only this person's view, disposable, per-browser** → it is a UI preference. Persist it client-side per §3.

Worked examples that are **UI preference** (client): default-open vs collapsed panel, which filter chips are active by default, table density, last tab, sort direction.
Worked examples that are **governed config** (store): feature availability, tenant theme/branding, quotas, the active provider, anything another operator could legitimately need set differently and audited.

## §3 — Persistence + hydration discipline

1. **Storage:** one cookie (or equivalent client store) per preference, `path=/`, bounded `max-age`, `samesite=lax`. Per-browser by definition.
2. **Never** place in the client preference store: secrets, tokens, tenant identifiers, or any governed config value. (Inverse of §1: as personal state must not enter the governed store, governed/sensitive values must not enter the client store.)
3. **Read post-hydration, never at SSR render.** The server renders with the *system default*; the client synchronizes from the cookie in the first effect after mount. This prevents the hydration-mismatch class of bug: server HTML and first client paint agree on the default, then the client reconciles. (Same discipline as a locale/i18n provider.)
4. **Default lives in code, value lives in the cookie.** The system default is a genuine invariant (it is the same for everyone until a person overrides it), so it is an allowed code constant per `CANON-CONFIGURATION-DISCIPLINE §7`. Only the *override* is persisted.

## §4 — Namespace neutrality

The key/prefix namespace of the client preference store is **brand- and product-neutral**. A preference cookie carries no system or vendor brand in its name — a value persisted inside system B must not bear system A's brand. (Originating incident: a `vit_pref_*` prefix carried the ViTo brand into a sibling product, a vocabulary leak across the system boundary; neutralized to `vt_pref_`.) Generalize: choose a namespace that names the *kind* of value (a UI preference), not the *system* that happens to host it.

## §5 — L3 binding (what the consuming repo owns)

- The concrete client mechanism (cookie prefix, `max-age`, `samesite`) and the read/write helper module.
- The hydration helper / pattern that enforces §3.3 (post-mount read).
- The catalogue of which preferences qualify as client UI state (the boundary call, per §2).
- Any mechanical enforcement (a lint/scanner that flags personal view-state written to the governed config store, or a branded namespace).
- The originating incident.

The L3 binding points at this canon as the spine; it does not restate the principle, the boundary test, or the hydration order.

## §6 — What this canon does NOT do

- It does **NOT** govern where audited/varying configuration lives — that is `CANON-CONFIGURATION-DISCIPLINE`.
- It does **NOT** mandate cookies specifically; any per-browser client store that satisfies §3 (bounded lifetime, no secrets, post-hydration read) qualifies.
- It does **NOT** authorize persisting any value that fails the §2 boundary test client-side as a shortcut to avoid building an admin surface.

---

## Provenance

DRAFT lifted from a product-side pattern in a school-management vertical (Campus, spec 068 "informe editor"): filter defaults for the report editor were persisted as per-browser preference cookies, with a documented policy (`apps/web/src/lib/ui-prefs.ts`) mirroring the i18n provider's post-hydration read. Two agnostic substances surfaced as worth canonizing: (1) the **storage-layer boundary** between personal disposable UI state and governed audited config — the complement that `CANON-CONFIGURATION-DISCIPLINE` implies but does not name; and (2) the **namespace-neutrality** rule, surfaced when the `vit_pref_` prefix leaked the ViTo brand into Campus and was neutralized to `vt_pref_` (Campus PR #291, 2026-06-24). Coverage-check: `CONFIGURATION-DISCIPLINE` owns the governed side only; `PRODUCTION-SAFETY` owns artifact posture; no existing spine owned the personal-UI-state side of the boundary or the hydration discipline.
