# CANON — Naming Conventions (universal · agent-agnostic)

> **Scope:** every repo that uses git + has conventional artifacts (commits, branches, files, decisions, packages). Vendor-neutral, product-neutral, language-neutral.
> **Status:** approved (fire-test passed: no product, vendor, brand, framework, or methodology name appears here).
> **Home:** the dev-kit (supra-repo). Inherited by every repo as upstream → fork.
> **Family:** traceability discipline · binds with `CANON-VERSIONING-001.md` (versioning of code/canons/ADRs) and `CANON-DECISION-DISPOSITION-FOR-GRAPH-INDEXING.md` (ADR filename pattern).

## 1. Root principle

> **A name carries authority, ownership, and traceability. Naming inconsistency = silent loss of provenance.**

When a branch, commit, file, ADR, or canon is named ad-hoc, three signals are lost:
1. **Authority** — who created it (human, which AI agent, which system).
2. **Ownership** — who is responsible for cleaning it up.
3. **Traceability** — what kind of change it represents, when it happened.

Convention restores those signals at the **lowest cost possible**: pattern compliance at creation time, mechanically verifiable.

## 2. The nine conventions

| Artifact | Pattern | Required parts | Forbidden |
|---|---|---|---|
| **Identifiers** (schema · routes/slugs · file/dir names · config/env keys) | one declared identifier language; data/UI language stays in values & strings | a single identifier language across **every** surface | mixing the identifier language with the data/UI language; enforcing the rule on one surface only |
| **Branches** | `{author}/{type}-{description}` | author tag · type · slug | bare names (`feature-x`); spaces; date-only prefixes |
| **Commits** | Conventional Commits (`type(scope): description`) | type · description | unrelated message; "wip"; "fix"; "update" alone |
| **Files (docs)** | `{TYPE}_{slug}_{YYYY-MM-DD}.md` (when dated) OR `{TOPIC}-{slug}.md` | type prefix · slug · date (when temporal) | no prefix; ambiguous casing mixing |
| **ADRs** | `ADR-YYYYMMDD-slug.md` | immutable date prefix · slug | sequential numbers without date; renaming after creation |
| **Canons** | `CANON-{DOMAIN}-{TOPIC}-NNN.md` | `CANON-` prefix · domain · topic · sequential number | reusing a retired number; numbers without domain |
| **DB tables** | `<plural_or_singular>_per_repo_convention` with `created_at` + `updated_at` | tenant key (in multi-tenant) · timestamps | guessing the convention; mixing singular and plural in same schema |
| **Env vars** | `UPPER_SNAKE_CASE` with project prefix when ambiguous | uppercase · snake case · namespaced when needed | mixed case; concatenated words; no project prefix where collision possible |
| **Scripts in `package.json`** | `verb:scope` (e.g. `build:web`, `test:unit`, `lint:fix`) | verb · scope | name without scope when multiple variants exist |

## 3. Branch pattern — detail

`{author}/{type}-{description}`

- **`{author}`** — agent token (e.g. an AI agent's short identifier) or `feat`/`fix`/`docs`/`chore` for human/unattributed branches. The list of recognized agent tokens is **per-repo binding** (declared in the repo's `tools/inbox.config.json` or equivalent).
- **`{type}`** — `feat` · `fix` · `docs` · `chore` · `refactor` · `test` · `style` · `perf`. Same set as Conventional Commits §4 — keeps branch types and commit types aligned.
- **`{description}`** — kebab-case slug, ≤6 words, describing the change. Never use issue numbers as the only descriptor (`fix-123`) — include the description (`fix-auth-redirect-loop-123`).

Worktrees follow the same pattern: `wt-<feature>` or `wt-<author>-<feature>` per-repo binding.

## 4. Conventional Commits — the universal contract

All commits in any inherited repo use the [Conventional Commits 1.0](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <short description>

[optional body]

[optional footer(s)]
```

- **`type`** — `feat` / `fix` / `docs` / `chore` / `refactor` / `test` / `style` / `perf` / `build` / `ci`.
- **`scope`** — optional but strongly recommended; matches the change's surface (e.g. `auth`, `ui`, `db`).
- **Breaking change** — append `!` after type/scope: `feat(api)!: replace v1 endpoint with v2`. **REQUIRED, not optional.** A breaking change without `!` is non-compliant and may be rejected by CI.

Conventional Commits drives the **versioning bump trigger** declared in `CANON-VERSIONING-001.md`. Skip the convention → break the auto-bump.

## 5. File naming — when to date a doc

A doc filename includes a date prefix or suffix when:
- The doc is a **time-bound artifact** (review, audit, status report, finding, snapshot).
- The doc is meant to be **archived in chronological order** for later retrieval.

A doc does NOT include a date when:
- The doc is **canonical and living** (README, canon file, runbook, ADR — which uses date as the *immutable identifier*, not as decoration).
- The doc's identity is its topic, not its time.

Per-repo binding declares the date format (`YYYY-MM-DD` recommended, `YYYYMMDD` for ADRs by tradition); this canon establishes the principle that "date in filename" is a deliberate choice, not random.

## 6. ADR pattern — detail

`ADR-YYYYMMDD-slug.md`

- **Date is the immutable identifier.** It is the day the decision was *made*, not the day the file was last edited. An ADR keeps its filename forever.
- **Slug** is kebab-case, ≤6 words. Slug exists so humans can scan the directory; the date is what machines key on.
- **No sequential numbers.** Sequential ADR numbers (`ADR-001`, `ADR-002`) collide across teams and branches; dates do not. (Repos that have legacy `ADR-NNN-slug` files keep them by traceability rule; new ADRs use `ADR-YYYYMMDD-slug`.)
- **Status changes only after creation.** Body is immutable after `ACCEPTED`; status header transitions to `SUPERSEDED-BY ADR-YYYY` or `DEPRECATED` are the only allowed edits. See `CANON-VERSIONING-001.md` §lifecycle.

## 7. Canon pattern — detail

`CANON-{DOMAIN}-{TOPIC}-NNN.md`

- **`DOMAIN`** — the broad area the canon governs (e.g. `NAMING`, `VERSIONING`, `TESTING`, `DEVELOPMENT-PROCESS`, `CROSS-AGENT-CONTEXT-LAYERING`).
- **`TOPIC`** — when needed for disambiguation (e.g. a domain with multiple related canons). Omitted when domain is unique.
- **`NNN`** — sequential within the domain. **Never reused after retirement**: once a number is retired (the canon is deleted, superseded by a different domain, or formally removed), its slot stays dead. This protects historical references.

This canon itself is `CANON-NAMING-CONVENTIONS-001.md` — the first canon in the `NAMING-CONVENTIONS` domain.

## 8. Identifier language — detail *(SEALED 2026-06-17 by the Principal Architect — "go"; from a consumer's identifier-language gate finding · PR #144 · D-012)*

> **Identifiers are written in one declared language; the natural/local language of the data lives only in data values and user-facing strings — never in identifiers.**

An *identifier* is a name the machine keys on: a table/column name, a route or URL slug, a file or directory name, a config/env key, a code symbol. A *value* is content the machine carries: a row's data, a translated label, a rendered string. Mixing the two languages **in identifiers** is the drift this convention prevents — a schema in one language and route slugs in another, or identifiers that switch language by whoever wrote them, lose the single-language searchability and review consistency that keep a codebase legible to every contributor and tool.

- **One declared identifier language.** The repo declares the single language all identifiers use (English is the de-facto default for source identifiers across most ecosystems; the repo may declare otherwise). Every identifier surface uses it.
- **The data/UI language is orthogonal.** A product serving a local-language audience keeps that language where it belongs — in **data values** and **user-facing strings** (driven by the i18n layer) — and out of identifiers. A product whose audience reads language X still has identifier-language table/column/route/file names; language X lives in the rows and the rendered copy, not in the schema or the URLs.
- **The rule is surface-complete, or it lies.** Identifiers live on more than one surface — at minimum: **schema** (tables/columns) · **route/URL slugs** · **file/dir names** · **config/env keys**. A gate that enforces the identifier language on *one* surface (commonly the schema) while another surface drifts in a second language reports a GREEN it did not verify. The per-repo binding (§10) declares the **full set of identifier surfaces** the gate scans; a surface left unscanned is declared out of scope, **not** assumed clean. (This is the naming-domain instance of the cross-cutting coverage rule in `CANON-AUDIT-PROTOCOL` §8.6.)

## 9. The "never" list (mechanical violations)

A repo's CI (or a smoke test) MAY enforce these mechanically:

- **NEVER bare branch names.** `feature-x` is non-compliant; `feat/feature-x` is.
- **NEVER reuse a retired canon number.** Once `CANON-X-NNN` is removed/superseded, the slot is dead.
- **NEVER edit an ADR body after `ACCEPTED`.** New ADR supersedes; old body stays.
- **NEVER rename an ADR file after creation.** Its filename is the immutable identifier.
- **NEVER commit with a message that doesn't follow Conventional Commits.** No `wip`, `fix typo` (without scope), `update` alone, etc.
- **NEVER hardcode magic identifiers** when a registry/canon defines them (ports, secrets, tenant keys, etc.).
- **NEVER write an identifier in the data/UI natural language** (§8). Table/column/route/file/config names use the declared identifier language; the local language belongs in data values and rendered strings.
- **NEVER name a coordination/handoff slot by a product/agent name.** Handoff and closeout slots are **role-named** (`auditor` / `reviewer` / `advisor` / `executor` — `CANON-MULTI-AGENT-ORCHESTRATION` §5.1); agent/vendor tokens are legitimate only in the **symmetric branch-author roster** (§3), never as the name of a role slot.

## 10. Per-repo binding

A consuming repo declares:
- The recognized agent tokens for branch naming (e.g. which AI agents work in this repo).
- The Conventional Commits scopes valid in this repo (matches its module structure).
- The date format (`YYYY-MM-DD` vs `YYYYMMDD`).
- Whether to enforce mechanically (CI / pre-commit hook) or advisory.
- The canon domain prefix for L3 canons (e.g. `CANON-{REPO}-{TOPIC}-NNN`) that the repo authors locally.
- The DB table convention (plural vs singular; required timestamp columns; multi-tenant key field).
- The declared **identifier language** (§8) **and** the full set of **identifier surfaces** the gate scans — at minimum schema · route/URL slugs · file/dir names · config/env keys. Surfaces not listed are out of scope, not assumed clean (`CANON-AUDIT-PROTOCOL` §8.6).

## 11. Inheritance

This kit is the **upstream** of governance. Each repo is a **fork** that inherits this canon. Per-repo bindings stay in that repo's own layer; they never flow into this neutral core.

## Fire-test

This document names no product, vendor, brand, framework, language, or methodology. Those bind at L2/L3.

## Provenance

Distilled from a real product-repo's branch-naming rule (which had codified the `{agent}/{type}-{description}` pattern after multiple incidents of branch collision and lost ownership) and generalized to the eight artifact types on 2026-06-03 after the dev-kit-adoption audit identified branch naming as agnostic.
