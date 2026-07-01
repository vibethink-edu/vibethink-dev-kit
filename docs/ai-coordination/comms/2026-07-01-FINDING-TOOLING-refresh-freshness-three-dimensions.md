# FINDING — refresh conflates three freshness dimensions (operator gets "false-fresh")

**From:** ViTo (via Marcelo) → dev-kit
**Reviewed by:** Principal Architect (dev-kit owner)
**Date:** 2026-07-01
**Category:** TOOLING / ARCHITECTURE
**Suggested action:** FIX (retrofit the refresh mechanism + canon + docs, dev-kit as authority)

## What

A dev-kit refresh (`devkit-upgrade`) leaves the operator **feeling** current, but a provisioned operator tool's **derived artifact** can still be stale — e.g. `graphify-out/graph.json` days old — while the refresh reported "up to date". The refresh **conflates** what are really three orthogonal states.

## Where

`tools/devkit-upgrade.mjs` reports the kit pull (inheritance) and tool pin-drift (availability) but has **no** notion of a tool's derived-artifact freshness. `CANON-GIT-HYGIENE §2.8` (operator-tool freshness) gestures at it but does not name the three dimensions. The consumer refresh ritual (`CONTEXT-REFRESH-PROMPT`) inherits the same blind spot.

## Why it matters

A repo can be **fresh on inheritance + tools present, yet stale on the artifact** — the exact "false-fresh" trap. The operator acts on a stale code graph believing it is current.

## The three dimensions (do not conflate)

1. **Inheritance freshness** — the kit's rules/canons/tools are current in the consuming repo.
2. **External-tools availability** — the operator tool is installed and at pin.
3. **External-tools artifact freshness** — the tool's derived output (graph, index) is current.

## Proposed fix (dev-kit is authority; the conceptual change lives here first)

- The refresh mechanism **reports the three dimensions distinctly**, never collapsed into one "up to date".
- Artifact refresh is **explicit, scoped, opt-in** — a `--with-<tool> <scope>` flag (or the tool's own scoped command). **Never** an automatic `graphify update .` / full rebuild (upholds §2.8).
- A stale artifact is **session/tooling health, not a product blocker** — it never fails a build or gate (never changes the exit code).

## Constraints (from Marcelo, 2026-07-01)

Finding persisted first; dev-kit authority; no default full rebuild; explicit scoped opt-in; the three dimensions separated; stale = health not blocker; two PRs (dev-kit then ViTo); `CANON-GIT-HYGIENE §2.8` may stay PROPOSED until the diff is reviewed.

## Disposition

Retrofit in this dev-kit PR (separate commits): this finding → §2.8 sharpening (PROPOSED) → `EXTERNAL-TOOLS.md` → `devkit-upgrade.mjs` (three-dimension report + `--with-<tool> <scope>` + artifact descriptor in the tools lock). ViTo's `CONTEXT-REFRESH-PROMPT` adapts in a **separate** PR, after/against this one.
