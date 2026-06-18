# Identifier-language gate (the mechanism for CANON-NAMING-CONVENTIONS-001 §8)

§8 (the rule: identifiers in one declared language) and §8.6 (surface-complete: the rule
spans **every** identifier surface, not just one) were sealed without a mechanism. This is
the mechanism — a **vocabulary-allowlist** gate, lifted agnostic from a consumer's proven CI.

## Why a vocabulary, not a forbidden-word list

Enumerating the *forbidden* language is freeze-at-N — it only catches words someone already
thought of, and a single new leak slips through. Instead every identifier token must be a
**consciously-admitted** vocabulary entry. A leak in another language is, by definition, a
token nobody admitted → it fails. The vocabulary grows only by reviewed PR additions. Self-
maintaining, and it classifies by the real condition (`CANON-AUDIT-PROTOCOL` §8.1).

## Files

| File | Role |
|---|---|
| `tools/check-identifier-language.mjs` (in the kit) | the **agnostic engine** — knows no product, language, or layout |
| `tools/identifier-language.config.json` (this binding) | **every** locale/layout fact: declared language, surfaces, column types, vocabulary, exceptions |

## Adopt in three steps

1. **Copy the binding.** `tools/identifier-language.config.example.json` → `tools/identifier-language.config.json`. Set:
   - `declaredLanguage` (e.g. `"en"`).
   - `schemaDirs` — your DDL `.sql` dirs (identifiers extracted: table/column/function/index).
   - `columnTypes` — the SQL type keywords your engine uses (anchors column-definition lines).
   - `slugSurfaces` — dir trees whose **child dir names** are identifiers (route slugs, feature dirs, …): `{ "dir": "...", "recursive": true|false, "skip": ["api"] }`. `_*` / `(..)` / `[..]` folders are always excluded.
2. **Seed the vocabulary.** `node tools/check-identifier-language.mjs --seed` regenerates `allow` from your current surfaces. **REVIEW the diff in the PR** — any token that is not a declared-language / technical / domain term is a leak: **rename the identifier**, do not admit it. Put domain acronyms in `exceptions` with a reason.
3. **Wire it.** Run `node tools/check-identifier-language.mjs` in CI / pre-push. Exit 1 = an unknown token (leak or un-admitted term). `devkit-doctor` runs it too (skip-when-no-config).

## What stays yours

The declared language, the surfaces, the column types, the vocabulary, the exceptions — all
per-repo (L3). The engine owns only the discipline: **one declared language, every declared
surface, admit-don't-denylist.** A surface you don't declare is **out of scope, not assumed
clean** (§8.6) — declare every surface where an identifier lives.
