# Operator command expanders — adapter templates

These are **optional example adapters** for `REFERENCE-OPERATOR-COMMAND-CATALOG` (the source of truth). No repo or operator is required to install an expander; absence just means you type the asks by hand.

## Authority order

1. The **catalog** (`knowledge/methodology/REFERENCE-OPERATOR-COMMAND-CATALOG.md`) is the source of truth.
2. These adapter files are **examples / generated outputs**.
3. If an adapter diverges from the catalog, **regenerate it** — the catalog wins.

## Install / refresh (additive — never destructive)

The catalog's `ops-sync` command is the install path. Say it (or type its trigger) and an agent regenerates the adapter **for your tool** from the catalog:

> Read the dev-kit operator command catalog and create/update my command expander **additively**. Detect my expander (Espanso / VS Code snippets / Raycast / other) or ask. Do **not** delete or replace my existing snippets; on a trigger clash, report it and propose an alias; validate **prefix-safety** (no trigger an exact prefix of another) before writing; validate the tool can load the result (restart + read the log if available). Report evidence (files, triggers added, conflicts) and how to test `:commands-help`. Close with a RECOMMENDATION.

**Rules the generator MUST honour:** additive only · report-and-alias on clash · prefix-safe before publish · one-shot bodies · evidence labels · actionable close (see catalog §2).

## Which adapter reaches where

| Adapter | Reach |
|---|---|
| **Espanso** | system-wide — editor, terminal, browser, chat/webview inputs. The most portable default. |
| **VS Code snippets** | inside the editor only — **not** guaranteed in extension chat webviews. |
| **Raycast / Alfred** | macOS. **TextExpander** — cross-platform (paid). |

If you type triggers into an IDE-extension chat input, prefer **Espanso** — editor-scoped snippets do not fire there.

## Files here

- `operator-commands.example.yml` — Espanso example (neutral; uses `<placeholders>` for product commands + a shared `preamble` variable so the one-shot/evidence block is defined once). Carries the **v2 inherited rules** (declared execution + the referenced-work/creds/comms floor, catalog rules 9–12) in its `preamble`. **⚠ It is a 16-command DEMO, not the baseline — never sync/compare your adapter against it; the authority is the catalog (`REFERENCE-OPERATOR-COMMAND-CATALOG` §4), which `ops-sync` reconciles against.**
- `vscode-snippets.example.json` — VS Code snippets example (secondary adapter). **Pre-v2 illustrative subset — structure only; it does NOT yet carry the v2 inherited rules (9–12). Regenerate via `ops-sync` for the full rule set.**
- `operator-catalog.config.example.json` — config for the `check-operator-catalog` gate (§5.1): copy to `tools/operator-catalog.config.json` and point `adapter` at your local file to lint it.

Both adapters are **neutral seeds**. Your real adapter is **L3**: it fills the concrete command bodies (your package-manager scripts, tool paths, canon names). The binding rule set is the catalog's §2 (rules 1–12), not these examples. Never commit a product-named adapter into the kit.
