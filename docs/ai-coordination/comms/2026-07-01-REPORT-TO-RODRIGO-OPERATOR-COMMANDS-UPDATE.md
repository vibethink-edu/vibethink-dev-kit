# REPORT — Operator command catalog: what's new + how to update

**From:** dev-kit architect (via Marcelo)
**To:** Rodrigo
**Date:** 2026-07-01
**Re:** New in the dev-kit — an agnostic operator command catalog. How to update your setup.

## What's new (1 minute)

The dev-kit now ships an **operator command catalog**: a set of short, repeatable "operator commands" (like `:repo-health`, `:git-scope`, `:handoff-local`) that expand into stable, one-shot prompts for an agent, each with a known output contract.

**The key idea:** the reusable value is **the catalog** (command ids + output contracts + rules), **not** any one text-expander tool. Espanso, VS Code snippets, Raycast, etc. are just **adapters**. The catalog is the source of truth; adapters are generated from it.

Source of truth: `knowledge/methodology/REFERENCE-OPERATOR-COMMAND-CATALOG.md` (SEALED 2026-07-01). Adapter examples: `setup/templates/operator-command-expanders/`.

## Why it's worth adopting

- Health checks / handoffs / closeouts become **repeatable** instead of ad-hoc.
- Every command carries an **anti-hallucination evidence contract** (the agent must separate what it *ran* from what it only *read* or *inferred*).
- Commands are **one-shot** — they never permanently change the agent's persona/language/mode.
- Every command **closes with an actionable recommendation** ("run :xxx next").

## The 7 rules (what makes a command valid)

1. **One-shot** — never changes persona/language/mode/future responses.
2. **Evidence discipline** — labels every claim `EXECUTED / VERIFIED / INFERENCE / NOT-VERIFIED`; never "I ran X" if X was only found in files.
3. **Actionable close** — ends with a recommendation + literal next command.
4. **Tool-agnostic** — the catalog is truth; expanders are adapters; no tool is required.
5. **Language-agnostic** — stable English ids; localized prompts allowed, but never set a permanent language.
6. **Prefix-safe** — no trigger may be an exact prefix of another (else the short one fires first).
7. **Additive adapter** — installing never deletes/overwrites your existing snippets; on a clash, alias.

## How to update — 2 steps

**1) Update your dev-kit** (the catalog is inherited by reference, so a pull brings it):
```
# from your repo (paths per your own layout):
node <path-to-dev-kit>/tools/devkit-upgrade.mjs --dry-run   # preview
node <path-to-dev-kit>/tools/devkit-upgrade.mjs             # apply
```
The upgrade report now also separates three freshness dimensions (kit inheritance / tool availability / tool-artifact freshness) — don't confuse "tool installed" with "index fresh".

**2) Set up your operator commands** — one-time, via the `ops-sync` meta-command. Say this to your agent (or trigger `:ops-sync` once you have it):
> Read the dev-kit operator command catalog and create/update my command expander **additively**. Detect my expander (Espanso / VS Code / other) or ask. Do not delete or replace my existing snippets; on a trigger clash, report it and propose an alias; validate prefix-safety before writing; validate the tool can load the result. Report evidence and how to test `:commands-help`. Close with a recommendation.

Your agent generates the adapter **for your tool**, additively. Re-run it anytime the catalog changes.

## Which tool (practical)

- **Espanso** — recommended default: system-wide, fires in editor, terminal, browser, and IDE-extension chat inputs.
- **VS Code snippets** — editor only; **does not** fire in extension chat webviews.
- **Raycast / Alfred** — macOS. **TextExpander** — cross-platform (paid).

## One thing to know

Your **local adapter is yours (L3)** — it can carry your real, product-specific commands (your package scripts, paths). Only the **example** shipped in the kit is neutralized. So `ops-sync` seeds you from the neutral catalog; you then fill in your concrete command bodies locally.

---

**Bottom line:** pull the dev-kit, run `ops-sync` for your expander, and you have the same repeatable, evidence-contracted operator commands — on whatever tool you use.
