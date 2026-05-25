---
type: task
from: codex
to_agent: opus
to: opus
repo: vibethink-dev-kit
status: open
needs: agent
priority: high
date: 2026-05-25
re: VT-Method exhaustive methodology audit
summary: "Opus must audit VT-Method for methodology holes, rules without teeth, and missing enforcement."
---
# TASK - OPUS VT-Method Exhaustive Methodology Audit

to_agent: opus-arq
status: open
priority: high
date: 2026-05-25
from: Marcelo via codex-arq
repo: vibethink-dev-kit

## Mission

Run an exhaustive, auditable review of VT-Method and the supra-repo governance
spine. The goal is to find methodological holes before they become product drift.
This review must strengthen VT-Method, not merely approve the current documents.

## Recipient Self-Check

Before reviewing anything, verify you are in the correct repo:

- Target repo: `vibethink-dev-kit`
- Target path: `C:/IA Marcelo Labs/_vibethink-dev-kit`
- Target branch: `codex/docs-decision-trigger-enforcement-2026-05-25`

If you picked this up from a product repo inbox, switch to the dev-kit repo and
branch first. Do not audit the ViTo product repo as the primary target. ViTo is
only the incident context that exposed the methodology gap.

## Trigger / Background

During XMS Ovitality Framer Motion work in the product repo, Marcelo identified a
methodology failure: an architecture/supply-chain concern was first recorded as a
finding, and only became an ADR after Marcelo challenged whether a finding was
enough. The methodology should have pushed the agent to classify and capture the
decision earlier.

Codex added a first correction in this branch:

- `doc/decisions/ADR-20260525-decision-capture-trigger-enforcement.md`
- `knowledge/methodology/VT-METHOD.md`
- `knowledge/architecture/CANON-DECISION-DISPOSITION-FOR-GRAPH-INDEXING.md`
- `knowledge/ai-agents/AGENTS_UNIVERSAL.md`

Opus must review this correction and the wider methodology for adjacent holes.

## Scope

Review at minimum:

- `knowledge/START-HERE.md`
- `knowledge/methodology/CANON-DEVELOPMENT-PROCESS.md`
- `knowledge/methodology/VT-METHOD.md`
- `knowledge/architecture/CANON-DECISION-DISPOSITION-FOR-GRAPH-INDEXING.md`
- `knowledge/ai-agents/AGENTS_UNIVERSAL.md`
- `knowledge/ai-agents/AGENTS_METHODOLOGY_VIBETHINK.md`
- `knowledge/ai-agents/CANON-CROSS-AGENT-CONTEXT-LAYERING.md`
- `knowledge/ai-agents/CANON-MULTI-AGENT-ORCHESTRATION.md`
- `knowledge/ai-agents/REVIEW-CALL-CHECKLIST.md`
- `doc/decisions/*.md`
- `doc/INBOX-FEED-ROADMAP.md`
- `setup/ADOPT-CROSS-AGENT-GOVERNANCE.md`
- relevant `tools/*.mjs` if a proposed rule claims enforcement already exists.

Target layer for this review:

- Primary: SUPRA / L1-L2 methodology in `vibethink-dev-kit`.
- Secondary: product-repo binding points only, to verify that VT-Method clearly
  tells product repos what must stay local at L3.
- Non-primary: do not audit a product repo's local Method as if it were the
  supra-repo methodology.

## Audit Questions

Answer with evidence, not impressions:

1. Where does VT-Method still rely on human memory instead of agent-triggered
   detection?
2. Which rules say "must" but have no checklist, gate, task template, or
   enforcement path?
3. Which decisions are documented in more than one normative place and can drift?
4. Which rules exist only in L2/L3 when they should be inherited from SUPRA?
5. Which rules are too abstract for an agent to execute without asking Marcelo?
6. Which parts are discipline-only today but should become lint/check/gate later?
7. Is the new decision-capture trigger correctly placed in SUPRA, or does it need
   another binding layer?
8. Does the methodology distinguish correctly between finding, ADR, canon, task,
   research, strategy, and implementation?
9. Are cross-agent review tasks auditable enough for a future graph/indexer?
10. Are there missing "stop and classify" triggers for DB, security, auth,
    dependencies, supply chain, UI/public render, AI-assisted behavior, or
    cross-tenant behavior?
11. Does every cross-agent governance task declare whether the target is SUPRA
    L1/L2, product L3, or both, so the receiving agent does not review the wrong
    Method layer?

## Required Output

Produce a review report in `doc/REVIEW-OPUS-VT-METHOD-AUDIT-2026-05-25.md` with:

| Field | Requirement |
|---|---|
| Verdict | `PASS`, `PASS-WITH-FINDINGS`, or `BLOCKED` |
| Findings | Ordered by severity: `P0`, `P1`, `P2`, `P3` |
| Evidence | File path + line/section reference for every finding |
| Risk | What failure class this would cause in real work |
| Fix | Concrete doc/tool/check/template change |
| Enforcement | Existing check, proposed check, or explicit `DISCIPLINE-ONLY` |
| Ownership | SUPRA, product repo, or both |

Also include:

- a "methodology gap matrix";
- a list of "rules without teeth";
- a list of "good patterns to preserve";
- a short adoption plan: immediate docs patch, follow-up tooling, product-repo
  sync points.

## Review Standard

Be exhaustive and skeptical. Do not accept "the rule exists" as enough. A strong
methodology must answer:

- where an agent reads the rule;
- when the agent is forced to apply it;
- what artifact proves it happened;
- what check catches failure;
- who owns the next correction.

## Non-Scope

- Do not implement product-specific ViTo/XMS fixes here.
- Do not rewrite the whole methodology.
- Do not mark canon/ADR as sealed unless Marcelo explicitly approves.
- Do not add heavy tooling unless the report first justifies the gap.

## Acceptance

This task is complete when:

1. the review report exists;
2. every finding has evidence and a proposed correction;
3. the report explicitly says whether the current branch can merge as-is;
4. any urgent P0/P1 gaps are either patched in the same branch or split into
   named follow-up tasks.
