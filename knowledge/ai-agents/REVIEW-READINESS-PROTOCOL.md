# Review Readiness Protocol (universal · agent-agnostic)

> **Scope:** every repo where an agent asks a human or another agent to review a
> UI, behavior, integration, deploy, or operational change.
> Vendor-neutral, product-neutral, tool-neutral.
> **Status:** process protocol, not canon-sealed. Future promotion target:
> `CANON-REVIEW-READINESS-001`, only after human approval and acceptance evidence.
> **Home:** the dev-kit (supra-repo). Inherited by every repo as upstream -> fork.
> **Family:** operational readiness discipline. Binds with
> `CANON-MULTI-AGENT-ORCHESTRATION.md` and references
> `CANON-VISUAL-BUG-TRIAGE-001.md` for the no-touch-first debugging discipline.

## 1. Root Principle

> **Test in the layer that gives the true signal, declare that layer, and show the
> evidence before asking for judgment.**

Review readiness is not "run everything everywhere." It is choosing the right
verification layer for the question at hand, proving that layer is healthy, and
stating what was not verified.

A human review is for judgment: taste, product fit, priority, acceptance, and
tradeoffs. A human review is not for discovering that a server is down, a route is
unreachable, a gate is red, a stale deployment is serving the wrong bundle, or an
authenticated route was never opened.

## 2. Existing Authority

This protocol does not replace the orchestration or visual-triage canons:

- `CANON-MULTI-AGENT-ORCHESTRATION.md` §2 and §3: machine-verifiable gates are
  watched by the blocked agent; judgment gates escalate to the human.
- `CANON-MULTI-AGENT-ORCHESTRATION.md` §6: red gates are read at the failing
  line before any decision.
- `CANON-VISUAL-BUG-TRIAGE-001.md`: a suspected visual regression after a state
  change is triaged before code is touched.
- `AGENTS_UNIVERSAL.md`: consuming repos must discover and use their operational
  scripts, registries, and bindings instead of guessing.

Decision on overlap: this protocol **references** visual bug triage. It does not
absorb it. Review readiness is the full review cycle; visual bug triage is the
specialized no-touch-first discipline when a visual symptom appears.

## 3. Layer Declaration

Before asking for review, the agent declares the verification layer used and why:

| Layer | True signal it gives |
|---|---|
| Local/workspace | source diff, local runtime, local route behavior, local UI/copy interaction |
| Integration | cross-package behavior, auth bootstrap, service/repository wiring, shared contracts |
| Remote/cloud | deployed bundle freshness, hosted auth/secrets, tenant data fidelity, edge/CDN behavior, scheduled/background behavior, webhook/OIDC behavior |
| Gate/CI | reproducible build/test/lint/security result under the repo's automated gate |

The default for UI/copy/control changes is local/workspace first, then gate, then
remote/cloud smoke after deploy. This is a default, not an absolute law.

## 4. Fire-Test Before PR

Before opening a pull request for a reviewable change, the agent performs a
fire-test at the layer that should reveal the failure fastest:

- start the surface with the repo's governed launcher or equivalent binding;
- open the exact route/screen/entry point under review;
- use the repo's governed auth/bootstrap path when the surface is authenticated;
- capture browser or equivalent UI evidence when the change is visual or
  interaction-facing;
- run the smallest meaningful automated checks for the changed behavior;
- record any missing precondition as a blocker instead of silently moving the
  review to another layer.

If the fire-test cannot run because the repo binding is missing or broken, the
state is a machine-verifiable blocker. The agent watches or fixes the gate if in
scope; otherwise it escalates as a judgment gate with exact missing inputs.

## 5. Evidence Package

Every review handoff names:

- branch/worktree or equivalent source reference;
- exact route/screen/task under review;
- validation commands or gates run;
- evidence artifact from the relevant viewer/browser/tool when applicable;
- remote revision or deployed identifier when remote/cloud was tested;
- what was not tested and why;
- any red or skipped gate with run id/job id/check id and failing line when
  available.

No phrase like "seems fine" substitutes for evidence. The evidence may be small,
but it must point to a reproducible signal.

## 6. Gate Watching

Machine gates are watched by the blocked agent, not by the human:

- If a check is queued/running, the agent reports the gate id and watches it.
- If a check fails, the agent reads the failing line before declaring the cause.
- If the failure predates the change, the agent proves that against the baseline.
- If the failure is unrelated and outside scope, the agent records it as a
  caveat/finding and keeps the review boundary explicit.
- The agent never launches duplicate gate runs just because a prior run is slow.

This is an application of `CANON-MULTI-AGENT-ORCHESTRATION.md` §2 and §6, not a
new state system.

## 7. Queue And Runner Discipline

SUPRA defines the principle; consuming repos define exact thresholds.

Recommended defaults for L3 bindings:

- PR/check gate queued for about 15 minutes: report as a watched machine gate.
- deploy/release gate queued for about 10 minutes: report as a watched machine
  gate.
- runner unavailable: a job is queued for the expected runner label **and** there
  are zero online runners matching that label, or the repo's equivalent runner
  inventory says no capacity.

Every queue report includes run id/job id/check id. The next action is to watch
the gate or escalate the real blocker, not to spam dispatches.

## 8. Remote/Cloud-First Exceptions

Local-first is a useful default, not a religion. Remote/cloud-first is justified
when remote/cloud is the only layer that can give the true signal, for example:

- deployed bundle freshness or stale-deploy diagnosis;
- edge/CDN behavior;
- scheduled/background execution;
- webhook or OIDC callback behavior;
- hosted secret/config behavior;
- tenant/data fidelity that only exists in the hosted environment;
- build-only or deploy-only errors that do not reproduce locally.

When choosing remote/cloud first, the agent says why local would not prove the
question and what post-fix local or gate validation still applies.

## 9. Manual Bypass Discipline

A manual bypass is exceptional. It is allowed only after a concrete diagnosis such
as stale deployment, stuck gate, unavailable runner, or a critical review blocker
that cannot wait for the normal lane.

A bypass must declare:

- why the normal lane is insufficient right now;
- the exact source revision or artifact deployed/applied;
- the command class or governed operation used, without leaking secrets;
- how the result was verified;
- whether the normal lane later caught up or remains broken.

Bypass evidence never turns the bypass into the new normal. If the bypass becomes
repeated pain, learn the practice and improve the normal lane later.

## 10. Handoff Shape

A review-ready handoff uses this compact shape:

```text
VERDICT: READY-REVIEW / READY-PR / READY-MERGE / BLOCKED / WAITING
LAYER TESTED: local / integration / remote-cloud / gate, and why
ARTEFACT: branch, PR, route, revision, evidence path
VALIDATION: commands/gates and pass/fail
NOT TESTED: explicit gaps
HUMAN ACTION: judgment requested, or "none"
NEXT AGENT ACTION: what the agent watches or does next
```

Use the consuming repo's approved status vocabulary. Do not invent a parallel
state taxonomy.

## 11. L3 Binding Requirements

Each consuming repo that inherits this protocol declares its concrete adapters:

- governed launcher and shutdown command;
- auth/bootstrap path for review sessions;
- browser-evidence or equivalent UI evidence tool;
- port or endpoint registry, if the repo uses one;
- cache/build hygiene commands;
- CI/gate names the agent watches;
- deploy/release gate and runner labels;
- threshold values for queue reporting;
- where evidence artifacts are stored;
- how to reference this protocol from the repo's `AGENTS.md` or equivalent.

The SUPRA layer owns the discipline. Product repos own the concrete tools,
thresholds, routes, secrets, runners, and evidence locations.

## Acceptance Before Canon Promotion

This protocol remains a process document until it passes at least:

- **fire-test:** one UI/copy/control change uses the protocol end to end;
- **single-source test:** no repo duplicates the SUPRA policy instead of binding
  adapters;
- **inheritance test:** at least one consuming repo references the protocol and
  declares its L3 adapters;
- **human approval:** the human owner explicitly approves promotion.

Only then may it be promoted to a `CANON-*` file. Promotion is a separate change.

## Fire-Test

This document names no product, vendor, framework, hosted provider, or tool as an
authority. Those bind at L3.
