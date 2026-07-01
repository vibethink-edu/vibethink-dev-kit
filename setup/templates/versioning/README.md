# Versioning instrument (heritable)

> **What this is.** The copyable instrument for `CANON-VERSIONING-001`. The canon
> declared the models (CalVer for apps, SemVer for packages, the binding shape) but
> shipped no wiring — so a consumer could *declare* a model and sit frozen at one
> hand-typed version for weeks. **Policy without a mechanism is illusion.** This
> closes the gap the same way `governance-instruments/` did for the governance canon:
> a template you instantiate + a gate that verifies you actually wired it.

## The principle

> **A version that is COMPUTED cannot freeze. A version that is hand-typed will.**

The whole instrument exists to make the live version *derived*, not stored, and to
make a gate fail if you only *declared* a model without wiring a live source.

## What's here

| File | Role |
|---|---|
| `get-app-version.mjs` | Reference **live version source** — derives `YYYY.MM.DD+<shortSha>` from the HEAD commit. Computed every call, so it never goes stale. Importable + a CLI. |
| `.versioning.yaml.template` | The **per-repo binding** (canon §10) — one file that says how this repo bumps. |
| `VERSIONING-IMPACT-GATE.example.md` | L3 adoption example for the mandatory pre-implementation `VERSIONING: ...` verdict. |

The gate that makes it bite — `tools/check-versioning.mjs` — lives with the other
gates in the kit (it travels by copy like the rest), driven by
`tools/versioning.config.json`.

## Wire it (consumer steps)

1. **Copy the live source:** `setup/templates/versioning/get-app-version.mjs` →
   your repo's `tools/get-app-version.mjs`.
2. **Expose it at runtime:** have `/healthz` (or equivalent) return at least
   `{ version: getAppVersion(), commit }`. A stagnant number is now a visible defect,
   not a silence (canon §5, §11.6).
3. **Declare the binding:** copy `.versioning.yaml.template` → `.versioning.yaml`,
   fill in your posture (delete sections that are N-A for you).
4. **Declare it to the gate:** create `tools/versioning.config.json` (see
   `tools/versioning.config.example.json`) pointing `apps.versionSource` at the file
   you copied in step 1 and carrying the `impactGate` status vocabulary. `check-versioning`
   then confirms the source is **real**, not just named, and that the mandatory
   Versioning Impact preflight contract is declared. Set a model to `null` for a
   conscious N-A; do not set the impact gate N-A. Individual tasks use
   `VERSIONING: N/A` when appropriate.
5. **Run it:** `node tools/check-versioning.mjs` (or just `devkit-doctor`).
6. **Use it before implementation:** every task-readiness card / PR preflight carries:
   `VERSIONING: <status> — authority=<binding>; evidence=<paths/surfaces>; required=<artifact-or-reason>`.

## What the gate checks (and does not)

- **Checks:** a declared `apps.model` has a resolvable `versionSource`; a declared
  `packages.model` has a manifest with a real `version`; the binding exists when
  declared; the `impactGate` declares the canonical `VERSIONING: ...` statuses.
  `null` = conscious N-A for artifact models (reported, never a failure). No config → skipped.
- **Does NOT:** version your tools/scripts — that is a different artifact type
  (canon §6) with its own gate, `check-tool-versions.mjs`. It also does not run your
  release tooling or infer a PR diff; it verifies the wiring is present so the release
  can't be a no-op and local adapters have one canonical verdict vocabulary.

## Why `+<sha>` (and not only `-N`)

Canon §5's default is `YYYY.MM.DD-N` (a stateful per-day counter). For a stateless /
deploy-in-commit app, `YYYY.MM.DD+<shortSha>` pins the exact build with zero state —
`+<sha>` is SemVer build metadata (ignored for ordering). `get-app-version.mjs` uses
this form; pick whichever fits per repo.
