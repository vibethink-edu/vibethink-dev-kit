# CANON — Multi-Agent Orchestration & Handoff (universal · agent-agnostic)

> **Scope:** every repo where more than one AI agent (and a human) collaborate.
> Vendor-neutral, product-neutral.
> **Status:** approved (fire-test passed: no product, vendor, or agent brand names appear here).
> **Home:** the dev-kit (supra-repo). Inherited by every repo as upstream → fork.
> **Sibling:** `CANON-CROSS-AGENT-CONTEXT-LAYERING.md` (how agents read rules);
> this canon is how agents *hand work between each other and the human*.

## 1. Root principle

> **The human is not the message bus.**

When a human copies output from one agent's window into another's, the human has
become the transport layer between agents. That is the failure mode this canon
removes. The human's value is **judgment and direction**, not relay. Automate the
relay; keep the human for the decisions only a human can make.

## 2. Three classes of transition

Every "what happens next" falls into one of three lanes. Route it by its class.

| Transition | Resolved by | Human role |
|------------|-------------|------------|
| **Machine-verifiable gate** (CI, tests, build, lint, a deploy state) | the **blocked agent watches the source of truth itself** and proceeds when the condition is met | none |
| **Agent → agent handoff** | an **addressed message in the shared channel**; the recipient pulls its inbox at session start | none (it appears in the feed) |
| **Judgment gate** (approval, scope change, conflict between agents, prioritization, "is this worth doing", a blocker only a human can clear) | a **typed escalation signal** routed to the human's single inbox | **decides** |

- "I'll wait for it to go green and tell you when" is wrong. It becomes: *the
  blocked agent watches the gate itself and continues when green* — no relay.
- A fact one agent knows and another needs is **written to the shared channel**
  (a status entry), or both agents check the same source. Never hand-carried.

## 3. The safety boundary

> **Automate where the condition is verifiable by a machine. Escalate where it
> needs judgment. An agent never auto-decides a judgment gate.**

- Auto-proceeding is safe only for facts a machine can confirm (a check is green,
  a file exists, a count matches). It is never safe for "should we do this".
- If you cannot name the machine check that confirms a condition, it is a
  judgment gate — escalate it, do not assume it.

## 4. Visibility & interrupt (non-negotiable)

Removing the human from **transport** must never remove the human from
**visibility** or **control**.

- A **read-only activity feed** keeps the human informed ambiently — the human
  watches the flow, does not carry it. (The low percentage of runs a human
  redirects depends entirely on being able to see the flow.)
- The human retains **stop / redirect authority at all times**. Automation
  handles the boring relay; the human keeps the override.
- Because judgment gates still wait for the human, and the feed surfaces even the
  auto-proceeding lanes, drift remains catchable.

## 5. Signal conventions (machine-readable routing)

Messages in the shared channel carry front-matter a machine can route on — not
just prose a human must read:

| Field | Purpose |
|-------|---------|
| `from` | author agent |
| `to` | normalized recipient token (one of the known agents, or `any`) |
| `status` | `open` \| `closed` |
| `re` | the message this threads from |
| `priority` | ordering hint |
| `needs` | `human` when a judgment gate is reached, else absent |

- An agent's **inbox** = messages where `to:` is itself (or `any`) and `status: open`.
- The **human's inbox** = messages where `needs: human`. The human pulls one
  place instead of being polled across every window.
- A prose `to:`/description may accompany the normalized field for humans, but the
  normalized field is what routing depends on.

## 6. Red-gate discipline

A red machine gate is **read, not assumed**, before any decision:

- Read the **specific failure line**, not the summary wrapper.
- Do not declare a failure "pre-existing" without confirming it against the
  baseline (it existed before this change and this change does not touch it).
- **Infrastructure flakes** (timeouts, cancellations, runner/billing noise) are
  re-run, not merged-around. A symptom message is not a diagnosis.
- Escalate to the human only a **real blocker that needs judgment** — never an
  unread red, and never a flake.

## 7. Inheritance

This kit is the **upstream** of governance. Each repo is a **fork** that inherits
this protocol. Routing tokens, channel location, inbox/feed tooling, and the set
of known agents are declared per repo; the principles here never change. Anything
specific to a product, a vendor, or a methodology stays in that repo's own layer —
it never flows into this neutral core.
