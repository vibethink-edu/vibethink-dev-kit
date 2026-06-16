# Feature-documentation instrument (heritable)

> **What this is.** The copyable instrument for the **documentation a unit of work
> carries** — the artifact set defined by `CANON-DEVELOPMENT-PROCESS` §5 (lifecycle
> artifacts) and §6 (findings). The canon declared *which* artifacts every unit must
> carry and *what* a finding is; it shipped no templates and no gate — so a repo could
> "follow the process" while every feature documented itself in a different shape, and
> a missing artifact was invisible until someone went looking. **A rule with no shape
> and no gate is a suggestion.** This closes the gap the same way `versioning/` and
> `governance-instruments/` did for their canons: templates you instantiate + a gate
> that verifies you actually carry them.

## The principle

> **The same unit, documented the same way, every time — and a gate that fails when
> an artifact is missing rather than when someone notices it is missing.**

The cost of an undeclared documentation shape is *re-learning*: a feature coded with
no durable requirements / plan / log / roadmap / changelog is undiscoverable months
later (the code sits in a branch nobody remembers). The artifacts exist so the unit's
history survives any single session or agent — and the gate exists so "we have the
artifacts" is a fact on disk, not a hope.

## What's here

| File | Maps to (`CANON-DEVELOPMENT-PROCESS`) | Role | Mutability |
|---|---|---|---|
| `REQUIREMENTS.template.md` | §5 *requirements record* | what + why (the levantamiento) | revised as scope firms |
| `READINESS-PLAN.template.md` | §5 *readiness/deployment plan* + **§5.2 security-concerns** | how it ships + the security gate before approval | revised until approved |
| `ROADMAP.template.md` | §5 *status roadmap* | phases · % progress · what's next | overwritable (current state) |
| `LOG.template.md` | §5 *append-only log* | the history / why we got here | **append-only** |
| `CHANGELOG.template.md` | §5 *per-unit changelog* | what changed, per unit, tied to versioning | append on each change |
| `FINDING.template.md` | §6 *findings* | an out-of-scope anomaly/risk/opportunity | one file per finding |

**ADRs are NOT re-templated here.** A *decision* is an ADR in the decision store —
owned by `CANON-DECISION-DISPOSITION-FOR-GRAPH-INDEXING` (filename, immutability,
disposition) and `CANON-VERSIONING-001` §8 (lifecycle). This instrument *points* at
that store (see the map below); it does not re-derive it.

The gate that makes it bite — `tools/check-feature-docs.mjs` — lives with the other
gates in the kit and is driven by `tools/feature-docs.config.json`.

## Discoverability map — "where do I read, which canon governs this?"

The single thing a fresh agent needs: which canon dictates each part, and where the
concrete instance lives. Bind the right-hand column to your repo (L3).

| Concern | Governing canon (L1, in the kit) | Concrete instance (L3, your repo) |
|---|---|---|
| What artifacts a unit carries | `CANON-DEVELOPMENT-PROCESS` §5 | the files instantiated from this folder |
| Findings (structure + escalation) | `CANON-DEVELOPMENT-PROCESS` §6 | `FINDING.template.md` → your findings location |
| Worked examples are first-class | `CANON-DEVELOPMENT-PROCESS` §5.1 | examples inside each artifact |
| Decisions (ADRs) | `CANON-DECISION-DISPOSITION-FOR-GRAPH-INDEXING` | your decision store (`docs/decisions/` or equiv.) |
| **Release / artifact versioning** | **`CANON-VERSIONING-001`** | **your `.versioning.yaml` + `versioning/` instrument** |
| Filenames of all the above | `CANON-NAMING-CONVENTIONS-001` | your repo's casing convention |
| Live governance state (who/why/approvals) | `CANON-STATE-MIRROR-AND-DECISION-REGISTER-001` | your `governance-instruments/` instances |

> **Versioning is part of documenting a unit, not a separate world.** The per-unit
> `CHANGELOG` is where the two meet: each entry follows Conventional Commits and maps
> to a SemVer/CalVer bump per `CANON-VERSIONING-001` §3. Document the change *and* its
> version in the same place. This instrument links to the versioning rules; it never
> restates them.

## Wire it (consumer steps)

1. **Copy the templates** into your repo and **rename** each to your convention. The
   canon prescribes the *roles*, never the file names (L3 concern). A common binding:
   per-feature dir `{features-root}/{name}/` holding the requirements/plan/roadmap/log,
   a per-package/app `CHANGELOG`, and findings in your coordination lane.
2. **Declare the binding** in your `AGENTS.md` (or equivalent): one line per artifact
   role → the concrete filename you chose, plus where findings and decisions live.
3. **Declare it to the gate:** create `tools/feature-docs.config.json` (see
   `tools/feature-docs.config.example.json`) — point `featureScope.root` at where your
   per-feature dirs live and list the `requiredArtifacts` filenames. Set any section to
   `null` for a conscious N-A.
4. **Run it:** `node tools/check-feature-docs.mjs` (or just `devkit-doctor`). A feature
   dir missing a required artifact is now a RED gate, not a silent gap.

## What the gate checks (and does not)

- **Checks:** the declared L3 binding doc exists and is non-empty; every dir under the
  declared feature root carries each `requiredArtifact` (existing + non-empty); the
  declared findings location exists. `null` = conscious N-A (reported, never a failure).
  No config → skipped.
- **Does NOT:** read the *content quality* of an artifact (a human/reviewer judges
  whether the requirements are good — the gate guarantees the artifact is *present*, the
  precondition for review). It does not version anything (that is `check-versioning`) and
  does not validate ADR bodies (that is the decision-disposition gate).
