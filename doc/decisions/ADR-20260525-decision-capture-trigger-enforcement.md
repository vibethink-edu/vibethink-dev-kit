# ADR-20260525-decision-capture-trigger-enforcement

**Status:** ACCEPTED
**Date:** 2026-05-25
**Decider:** Marcelo

## Decision

Every inherited repo must treat architecture, contract, behavior, AI-assisted /
model-driven behavior, dependency, runtime, and supply-chain decisions as
capture-triggering events before implementation proceeds.

## Why

The universal methodology already says "no decision without capture", but that
principle can still fail if the agent only records a finding after the human asks
whether the decision needs an ADR. The human should not have to say "make this an
ADR" every time.

The trigger must live in the supra-repo because it is cross-product methodology,
not a product-specific memory patch. Product repos bind it to their own decision
stores, but the reflex is universal.

## Trigger

Before implementing or expanding any of the following, the agent must stop and
classify whether an ADR or canon update is required:

- production dependency;
- runtime framework or render library;
- CDN, font source, browser script/style source, or public asset provider;
- architecture pattern;
- contract shape or schema;
- cross-tenant behavior;
- security, data, auth, or privacy boundary;
- AI-assisted / model-driven behavior, including a worker, assistant flow,
  extraction flow, or model-chosen action;
- behavior standard that future agents must remember.

If the answer is yes, the agent writes the decision record first, in the
appropriate repo/layer, and only then continues.

## Alternatives rejected

- **Finding only** - findings surface risk, but do not create an indexable
  architecture decision or an enforcement target.
- **Product-only patch** - misses the failure class in the next repo because the
  methodology lives upstream.
- **Rely on human reminders** - repeats the failure being fixed.

## Consequences

- Agents must perform a decision-capture check before implementation when a
  trigger appears.
- Product repos inherit the reflex and bind it to their local ADR/canon store.
- Governance gates can later detect dependency/runtime diffs without an ADR
  reference.
- Product repos can bind this supra trigger to their own checks; ViTo's
  `ADR-031` #3 is the product-side binding for the future governance validation
  check.
- A finding may still be used for anomalies, but it does not replace a decision
  record when a rule or architecture choice is being made.

## Evidence

- Originating product incident: XMS render supply-chain governance discussion on
  2026-05-25, where Marcelo had to prompt that a finding was not enough and that
  the methodology should have pushed the agent to formalize the decision.
- Related product ADR: `ADR-032-xms-render-supply-chain-governance`.
