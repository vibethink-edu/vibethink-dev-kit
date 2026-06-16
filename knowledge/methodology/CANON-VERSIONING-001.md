# CANON — Versioning (state-of-the-art · universal · agent-agnostic)

> **Scope:** every repo that ships artifacts (code, docs, decisions, runtime). Vendor-neutral, product-neutral, framework-neutral, language-neutral.
> **Status:** approved (fire-test passed: no product, vendor, brand, framework, language, or methodology name appears here).
> **Home:** the dev-kit (supra-repo). Inherited by every repo as upstream → fork.
> **Family:** `CANON-NAMING-CONVENTIONS-001.md` (filename patterns including ADRs), `CANON-DECISION-DISPOSITION-FOR-GRAPH-INDEXING.md` (ADR lifecycle), `CANON-DEVELOPMENT-PROCESS.md` (governance precedes code).

## 1. Root principle

> **Every artifact has its versioning model declared and traceable. Versioning is not inferred — it is enforced.**

When versioning is implicit, three failure modes appear:
1. **Silent breaking changes** — consumers update and break without warning.
2. **Lost history** — what changed between version X and Y is undiscoverable.
3. **Coordination chaos** — multiple repos producing artifacts in different unannounced cadences.

A single declared model per artifact type closes all three at the smallest cost: declaration at the source, enforcement at the boundary.

## 2. Five artifact types, five models

| Artifact type | Model | Manager / driver | Bump trigger | Reference standard |
|---|---|---|---|---|
| **Code packages** (libraries, SDKs, npm/PyPI/equivalent publishables) | **SemVer 2.0** | Changesets · Semantic Release · or equivalent | Conventional Commits + manual review | semver.org |
| **Deployed apps** (services, sites, runtimes) | **CalVer** (`YYYY.MM.DD-N`) OR SemVer if the app exposes a versioned API | Release Please · Semantic Release · manual | CI on merge to release branch | calver.org |
| **Canon docs** (constitutional rules) | **Sequential `NNN` + status lifecycle** | Manual + sealed-by-architect | New canon = +1 in its domain; amendments = same number + amendment marker | this canon |
| **ADRs** (decision records) | **Immutable filename + status transitions only** | Manual + reviewer-approved | Created once at decision date; only status transitions after | `CANON-DECISION-DISPOSITION-FOR-GRAPH-INDEXING.md` |
| **Tools / scripts** (internal runnables) | **SemVer-lite (`MAJOR.MINOR`)** | Manual changelog | Manual when CLI args / return shape / behavior contract changes | this canon §6 |

## 3. The universal driver — Conventional Commits

Every commit in any inherited repo uses [Conventional Commits 1.0](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>
```

Bump mapping (when the artifact is a code package and an automatic versioning tool consumes the commit history):

| Commit prefix | SemVer bump | Notes |
|---|---|---|
| `feat(scope):` | **MINOR** | new functionality, backwards-compatible |
| `fix(scope):` | **PATCH** | bug fix, backwards-compatible |
| `feat(scope)!:` or `BREAKING CHANGE:` footer | **MAJOR** | breaking change. **REQUIRED, not optional** — a breaking change without `!` is non-compliant |
| `docs:` · `chore:` · `style:` · `test:` · `refactor:` · `build:` · `ci:` · `perf:` | none (no bump) | bookkeeping or non-shipping changes |

A repo MAY enforce this mechanically via `commitlint` (or equivalent) in a pre-commit hook or CI gate; this is **strongly recommended** for repos that publish packages, **advisory** for legacy repos until migration is complete.

## 4. Code packages (SemVer 2.0) — detail

- **Each package has its own `version`** in its manifest (`package.json`, `pyproject.toml`, etc.).
- **Pre-release tags** follow SemVer 2.0: `1.2.0-alpha.0`, `1.2.0-beta.0`, `1.2.0-rc.0`. Pre-release versions sort before the corresponding stable: `1.2.0-rc.5 < 1.2.0`.
- **Git tags** key on `<package>@<version>` (e.g. `@acme/utils@1.3.0`) per package — never a single global tag for a monorepo with multiple publishable packages.
- **Internal monorepo dependencies** use **exact pins** (no floating `^`, `~`, `>=` ranges). Floating versions in a monorepo are silent breakage waiting to happen.
- **Yanked / deprecated versions** declare it explicitly in the changelog with a one-line reason (`# 1.2.4 [DEPRECATED — security advisory CVE-XYZ]`).
- **Changeset (or equivalent intent declaration)** is REQUIRED for any PR that modifies a publishable package. PR without changeset → blocked.

## 5. Deployed apps — CalVer vs SemVer

- **Default: CalVer** for apps that are not consumed by external APIs. Pattern: `YYYY.MM.DD-N` (e.g. `2026.06.03-1`) or `YYYY.WW-N` (week-based; e.g. `2026.23-2`).
- **Stateless / deploy-in-commit apps** MAY instead use `YYYY.MM.DD+<shortSha>` (e.g. `2026.06.16+a1b2c3d`), where `+<shortSha>` is SemVer build metadata (ignored for ordering). It pins the exact build with **zero state** — no per-day counter to maintain — and is the form a *derived* version source emits. A version that is computed cannot freeze; a hand-typed one will. The reference instrument is `setup/templates/versioning/` (a live version source + the per-repo binding), enforced by `check-versioning`.

> **Amended 2026-06-16 §5:** added the `YYYY.MM.DD+<shortSha>` build-metadata form for stateless/deploy-in-commit apps (the `-N` counter remains the default). Motivated by a consuming repo that sat frozen on a hand-typed version for weeks — a derived `+<sha>` version is always fresh by construction. Shipped together with the heritable instrument (`setup/templates/versioning/`) and the `check-versioning` gate that fails a declared model with no live source.
- **Alternative: SemVer** for apps that expose a stable versioned API to other apps, mobile clients, or third parties. Then the app's API version follows SemVer, and the build version may still be CalVer.
- **Deployment manifest** declares the version at the deploy boundary (`version.json` at runtime, `/healthz` endpoint, equivalent).
- **Health endpoint returns the version.** A request to `/healthz` or equivalent returns at minimum the deployed version + git commit hash. This is the runtime-side counterpart to the deploy-time tag.

## 6. Tools / scripts — SemVer-lite

- **Pattern: `MAJOR.MINOR`** (patch is omitted; if there's a bug fix to a tool, just ship it).
- **MAJOR bump** = breaking change to the tool's CLI args, return shape, exit codes, or documented behavior contract.
- **MINOR bump** = new functionality, backwards-compatible (new flag, new option, expanded output).
- **Each tool declares its version** in a `VERSION` constant in the source OR in a manifest (`package.json`) when the tool is part of a publishable package.
- **Changelog per tool** is recommended; mandatory when the tool is consumed by other repos by copy (per `ADR-20260524-supra-repo-inheritance-mechanism.md` §3.1 — parity-check applies).

## 7. Canon docs — sequential + lifecycle

### 7.1 Filename pattern

`CANON-{DOMAIN}-{TOPIC}-NNN.md` (see `CANON-NAMING-CONVENTIONS-001.md` §7).

- **NNN sequential within domain.** This canon (`CANON-VERSIONING-001`) is the first in the `VERSIONING` domain.
- **Never reuse a retired number.** Once a canon is removed, superseded, or formally retired, its slot stays dead. This protects historical references to that canon by number.

### 7.2 Status lifecycle

```
DRAFT → PROPOSED → ACCEPTED → SEALED ─┬→ AMENDED (with marker)
                                       └→ SUPERSEDED-BY CANON-X-NNN | DEPRECATED
```

- **`DRAFT`** — being authored. Not yet open for review.
- **`PROPOSED`** — ready for review by the architect.
- **`ACCEPTED`** — architect approved, in effect, BUT may receive editorial amendments (typos, clarifications) without status change.
- **`SEALED`** — in effect, no edits without a formal amendment marker. The body is otherwise immutable.
- **`AMENDED`** — modified after SEALED, with an explicit amendment marker preserving history:
  ```
  > **Amended YYYY-MM-DD §X:** original text replaced by ...
  ```
- **`SUPERSEDED-BY CANON-X-NNN`** — replaced by a different canon. The old canon stays readable; new authors use the replacement.
- **`DEPRECATED`** — formally retired, no replacement. Kept for historical reference.

### 7.3 Approver

A single named authority approves canon transitions per repo. The authority is declared in the consuming repo's binding (the L3 declaration never bubbles up to this neutral core). There is no alternative approver path.

## 8. ADRs — immutable + status only

### 8.1 Filename pattern

`ADR-YYYYMMDD-slug.md` (see `CANON-DECISION-DISPOSITION-FOR-GRAPH-INDEXING.md`).

- **Date is the immutable identifier.** The day the decision was made, not the day the file was edited.
- **Never renamed** after creation.

### 8.2 Status lifecycle

```
PROPOSED → ACCEPTED ──┬→ SUPERSEDED-BY ADR-YYYYMMDD-slug
                       └→ DEPRECATED
```

- **`PROPOSED`** — drafted, under review.
- **`ACCEPTED`** — decision is in effect. **Body is immutable after this state.**
- **`SUPERSEDED-BY ADR-YYYYMMDD-slug`** — a new ADR replaces this one. The new ADR cites the old one; the old one is kept readable.
- **`DEPRECATED`** — decision no longer applies; no replacement.

**The body of an ADR never changes after `ACCEPTED`.** If a decision needs revision, a **new ADR** supersedes it. This is the core invariant that distinguishes ADRs from canons (which may receive amendments).

## 9. Anti-patterns (the never-do list)

- **NEVER bump major silently.** A `feat(scope)!:` or `BREAKING CHANGE:` footer is REQUIRED for any breaking change. A breaking change without explicit declaration is non-compliant.
- **NEVER use floating versions** (`^X.Y.Z`, `~X.Y.Z`, `>=X.Y.Z`) for internal monorepo dependencies — exact pins only.
- **NEVER edit an ADR body after `ACCEPTED`.** Supersede with a new ADR instead.
- **NEVER reuse a retired canon number.** Once a slot is dead, it stays dead.
- **NEVER ship a publishable package without a changelog entry** in the same PR.
- **NEVER ship an app to deployment without a version + commit hash exposed at `/healthz` or equivalent.**
- **NEVER tag a release without the corresponding changelog being committed in the same diff.**

## 10. Per-repo binding

Each consuming repo declares its versioning binding in a single per-repo file (e.g. `.versioning.yaml`) or its `AGENTS.md`. The binding includes at minimum:

```yaml
inherits: CANON-VERSIONING-001
packages:
  model: semver-2.0
  manager: changesets       # | semantic-release | manual
  conventional_commits: required   # | advisory | not-enforced
  internal_dep_pinning: exact
apps:
  model: calver             # | semver
  pattern: YYYY.MM.DD-N
  health_endpoint: /healthz
canons:
  numbering: sequential
  approver: <named-authority>
  domain_prefix_required: true   # CANON-{DOMAIN}-{TOPIC}-NNN
  amendments_allowed_after_sealed: true
adrs:
  folder: docs/decisions    # | doc/decisions | docs/adr
  pattern: ADR-YYYYMMDD-slug
  body_immutable_after_accepted: true
tools:
  model: semver-lite
  changelog_recommended: true
```

The fields are illustrative; the **principle** is that each consuming repo declares its versioning posture explicitly, so a fresh agent or contributor can read one file and know how to bump.

## 11. CI enforcement (what bites)

A repo MAY (and is strongly recommended to) wire mechanical enforcement for:

1. **Commitlint** (or equivalent) — blocks commits that don't follow Conventional Commits.
2. **Changeset bot** — blocks PRs to publishable packages without a changeset.
3. **Canon header check** — smoke test validates that every `CANON-*.md` has a valid `Status` header.
4. **ADR immutability check** — diff over `doc/decisions/` (or equivalent) allows only Status header changes; body diffs are blocked.
5. **Changelog mandatory** — PR touching a publishable package without `CHANGELOG.md` update → blocked.
6. **Health endpoint version check** — CI deploy step verifies `/healthz` returns the expected version + commit hash.
7. **App/package versioning wired** — `check-versioning` verifies a declared app/package model points at a *live* version source (a derived version, not a hand-typed literal that can freeze), not merely that the model is named. The instrument it checks ships at `setup/templates/versioning/`.

Each gate is per-repo enabled in the binding; this canon defines the menu, not the choices.

## 12. The throughline

> **Declare the model. Enforce at the boundary. Never assume.**

A repo where versioning is declared is a repo where the next change can be planned. A repo where versioning is implicit is a repo where the next change becomes an incident. The state of the art is not in choosing the "best" model — it is in choosing **a model**, declaring it, and **enforcing it at the smallest boundary that catches the failure**.

## 13. Per-repo binding (revisited)

The discipline is universal; the choices are per-repo:
- Which packages exist and what their model is.
- Which CI gates are wired.
- The single named approver.
- The decision-folder location and ADR pattern.
- The tool-changelog policy.

A consuming repo's `AGENTS.md` (or equivalent) declares its bindings; this canon defines the discipline.

## 14. Inheritance

This kit is the **upstream** of governance. Each repo is a **fork** that inherits this canon. Per-repo bindings stay in that repo's own layer; they never flow into this neutral core.

## Fire-test

This document names no product, vendor, brand, framework, language, or methodology. Those bind at L2/L3. (References to "Conventional Commits", "SemVer", "CalVer", "Changesets", "Release Please", "Semantic Release", "commitlint" are **public open standards or open-source tool names**, not vendor/brand markers — they pass the L1 fire-test by being industry-standard nomenclature.)

## Provenance

Drafted 2026-06-03 as a state-of-the-art baseline for the dev-kit, in response to a consuming-repo identifying that it had no declared versioning rule. Synthesizes Conventional Commits 1.0, SemVer 2.0, CalVer, and the ADR / canon lifecycle patterns established in the dev-kit's own canon family.
