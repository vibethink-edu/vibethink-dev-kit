# CANON — Visual Bug Triage (no-touch-first law · universal · agent-agnostic)

> **Scope:** every repo that has a UI (web SPA, mobile, desktop, terminal). Vendor-neutral, product-neutral, framework-neutral.
> **Status:** approved (fire-test passed: no product, vendor, framework, or methodology name appears here).
> **Home:** the dev-kit (supra-repo). Inherited by every repo as upstream → fork.
> **Family:** debugging discipline · companion of `CANON-TESTING-MINIMUM-BAR-001.md`.

## 1. Root principle

> **"It looks like a bug" is not evidence. A diff is.**

A visual bug appearing after a restore, checkout, deploy, branch switch, or session restart from a verified-working commit is **not automatically a code regression**. Code changes since the last green state can be enumerated mechanically. Touching code before that enumeration is **noise added to signal** — it adds a second source of error to a problem that already had one, and it makes the original cause harder to isolate.

## 2. The four-step triage (in order, never skipped)

When a visual bug appears after a state change (restore, checkout, deploy, branch switch, session restart, dev-server restart), triage **before touching any code**:

### Step 1 — DIFF FIRST

Run a diff between the current state and the last verified-working reference. Zero diff → **the code is not the problem**. Do NOT modify code. Move to Step 2.

If the diff is non-empty, the bug *may* be in the diff — but verify Step 2 first anyway, because client-side state can mask whether the code change actually caused the issue.

### Step 2 — Client-side check

Visual state often lives outside the code:
- Browser cache (HTML, JS, CSS) — hard refresh, clear cache.
- LocalStorage / SessionStorage (many libraries persist their own state).
- Service workers (intercept requests; can serve stale content for days).
- Browser extensions (ad blockers, theme injectors, DevTools experiments).
- Cookies (auth state, A/B test buckets).
- Incognito / private window (isolates from extensions + persisted state).

A bug that disappears in incognito or after hard refresh is a **client-state bug**, not a code bug.

### Step 3 — Build/runtime hygiene

If Step 2 doesn't resolve it:
- Restart the dev server (HMR can desync after long sessions or large changes).
- Clear the framework's cache directory (`.next/`, `.vite/`, `dist/`, etc.).
- Reinstall dependencies if a lockfile change is suspected (`npm ci`, `pnpm install --frozen-lockfile`, equivalent).
- Verify the runtime version (Node, Python, etc.) matches the project's declared version.

### Step 4 — Only THEN touch code

If Steps 1-3 are exhausted and the bug persists, code modification is justified. Even then:
- Reproduce in a minimal isolated case before editing source.
- Write a failing test for the bug before fixing it (regression coverage).
- Bind the fix to the smallest change that exercises the failing case.

## 3. The throughline

> **Order matters: verify ≠ assume. Code change is the last resort, not the first.**

A bug that "looks like" a code regression but is actually a client-state issue costs hours of code modification undoing changes that were never the problem. The diff-first rule prevents that failure mode by **proving the code is the problem before assuming it**.

## 4. What this canon does NOT do

- It does **not** apply to bugs that appear in a *new* feature being built — those are debugging within active development, not visual regression.
- It does **not** replace systematic debugging once code modification is justified (Step 4) — it gates *entry* to code modification, not the modification itself.
- It does **not** prescribe specific tools — the principle is order-of-operations, not tooling.

## 5. Per-repo binding

The discipline is universal; the concrete commands and paths are per-repo:
- Which cache directories to clear (`.next/`, `.vite/`, `dist/`, custom).
- Which restart command is canonical (`pnpm dev`, custom dev-up script, container restart).
- Which browser the team standardizes on for hard-refresh verification.
- Which review port the team uses (so verification doesn't accidentally hit a stale production port).

A repo's `AGENTS.md` or equivalent declares its bindings; this canon defines the discipline.

## 6. Inheritance

This kit is the **upstream** of governance. Each repo is a **fork** that inherits this canon. Per-repo bindings stay in that repo's own layer; they never flow into this neutral core.

## Fire-test

This document names no product, vendor, brand, framework, or methodology. Those bind at L2/L3.

## Provenance

Distilled from a real product-repo's rule that emerged after multiple incidents where agents modified code in response to "bug reports" that turned out to be client-side cache / localStorage / dev-server-stale state. The rule, codified locally, was generalized here on 2026-06-03 after the dev-kit-adoption audit identified it as agnostic.
