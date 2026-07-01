# Versioning Impact Gate — L3 Adoption Example

> Bind this to `CANON-VERSIONING-001` §10.1 and
> `CANON-CHANGE-PATH-AND-DECISION-CLASSES-001` §3.2.
> This is an example shape for a consumer task-readiness / PR preflight adapter.

## Authority

- Versioning binding: `.versioning.yaml`
- Mechanical config: `tools/versioning.config.json`
- Local classifier: `<repo-specific task-readiness gate or PR preflight>`

## Required Verdict

Every task / PR carries exactly one line before implementation:

```text
VERSIONING: <canonical verdict> — authority=<binding>; evidence=<paths/surfaces>; required=<artifact-or-reason>
```

Canonical verdicts:

- `VERSIONING: N/A`
- `VERSIONING: DECLARED-NO-BUMP`
- `VERSIONING: REQUIRES-CHANGESET`
- `VERSIONING: REQUIRES-CALVER-DEPLOY`
- `VERSIONING: REQUIRES-CANON-AMENDMENT`
- `VERSIONING: REQUIRES-ADR-STATUS-ONLY`
- `VERSIONING: REQUIRES-TOOL-VERSION`
- `VERSIONING: BLOCKED-CONFLICT`

## Routing Table

| Touched surface | Verdict |
|---|---|
| No versioned artifact | `VERSIONING: N/A` |
| Versioned area but no shipped/contract/deploy/tool/canon/ADR impact | `VERSIONING: DECLARED-NO-BUMP` |
| Package, library, adapter, plugin, SDK, publishable surface | `VERSIONING: REQUIRES-CHANGESET` |
| Deployed app, runtime service, worker, route, deployable UI | `VERSIONING: REQUIRES-CALVER-DEPLOY` |
| Canon/law/inheritance spine | `VERSIONING: REQUIRES-CANON-AMENDMENT` |
| Accepted ADR | `VERSIONING: REQUIRES-ADR-STATUS-ONLY` |
| Tool/script/CLI args, output, exit code, behavior contract | `VERSIONING: REQUIRES-TOOL-VERSION` |
| Missing or conflicting local authority | `VERSIONING: BLOCKED-CONFLICT` |

## Minimum Agent Checklist

- Read `.versioning.yaml` or declared equivalent.
- Name touched surfaces and file paths.
- Select one verdict; list secondary obligations if multiple surfaces are touched.
- If local authority conflicts, stop with `VERSIONING: BLOCKED-CONFLICT`.
- Add the required artifact before implementation or declare why no artifact is required.
