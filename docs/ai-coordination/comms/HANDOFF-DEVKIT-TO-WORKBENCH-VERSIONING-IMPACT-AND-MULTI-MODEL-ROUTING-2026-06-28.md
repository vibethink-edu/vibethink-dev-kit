# HANDOFF — DevKit authority for Versioning Impact + Multi-Model Routing

**Date:** 2026-06-28  
**From:** devkit-architect  
**To:** Workbench architect / PR #610 owner  
**Status:** ready for L3 adoption once this dev-kit PR merges

## What changed in DevKit

DevKit now owns two L1/L2 contracts that Workbench should consume as L3:

1. **Versioning Impact gate**
   - Canon: `knowledge/methodology/CANON-VERSIONING-001.md` §10.1
   - Decision-gate link: `knowledge/methodology/CANON-CHANGE-PATH-AND-DECISION-CLASSES-001.md` §3.2
   - Instrument/example: `setup/templates/versioning/VERSIONING-IMPACT-GATE.example.md`
   - Mechanical declaration check: `tools/check-versioning.mjs` validates `impactGate` canonical statuses.

2. **Multi-Model Agent Routing**
   - Canon: `knowledge/ai-agents/CANON-MULTI-AGENT-ORCHESTRATION.md` §3.2
   - Compatibility note: `knowledge/ai-agents/AI_AGENT_COMPATIBILITY.md`
   - L3 example: `setup/templates/multi-model-routing/README.md`

## Exact text Workbench should cite in #610

Use this in the PR description or implementation note:

> Workbench implements the L3 adapter for DevKit's Versioning Impact gate. The
> authority is `CANON-VERSIONING-001` §10.1, linked into the Decision Gate by
> `CANON-CHANGE-PATH-AND-DECISION-CLASSES-001` §3.2. Every task/PR must carry one
> pre-implementation verdict:
> `VERSIONING: <canonical verdict> — authority=<binding>; evidence=<paths/surfaces>; required=<artifact-or-reason>`.
> Workbench's `versioning_impact` classifier is local implementation only; the
> canonical statuses and conflict semantics live in DevKit.

For multi-model launches:

> Workbench implements the L3 adapter for DevKit's Multi-Model Agent Routing
> contract in `CANON-MULTI-AGENT-ORCHESTRATION` §3.2. A model route is not just a
> model name: it must separate `role`, `adapter`, `model`, `auth_mode`,
> `capability`, `gates`, `evidence`, `review_policy`, and `human_approval`.
> Workbench may choose the concrete models and launch adapters locally, but it must
> not bypass decision, versioning, safe-identity, review, or human-approval gates.

## Validation expected in Workbench

- The task-readiness gate reads Workbench's local versioning binding first.
- Missing or conflicting local authority returns `VERSIONING: BLOCKED-CONFLICT`.
- Packages/libraries/adapters/plugins route to SemVer/changeset impact.
- Deployed apps/runtime services route to CalVer/deploy impact.
- Canon changes require amendment/approval authority.
- Accepted ADR changes are status-only; body edits require supersession.
- Tool/script/CLI changes require tool-version impact.
- Multi-model launch records carry route/gates/evidence/review/human approval before spawning.
- Product CI may stay non-blocking when local tooling is missing, but local/session/preflight output must be loud.

## Boundary

Do not import Workbench implementation into DevKit without review. Workbench #610 is
a consumer implementation and useful reference; DevKit now owns the neutral contract.
