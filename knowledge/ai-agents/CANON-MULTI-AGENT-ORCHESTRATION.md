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
| **Agent → agent handoff** | an **addressed message in the shared channel**; the recipient pulls its inbox at session start **and on demand** (§2.1) | none (it appears in the feed) |
| **Judgment gate** (approval, scope change, conflict between agents, prioritization, "is this worth doing", a blocker only a human can clear) | a **typed escalation signal** routed to the human's single inbox | **decides** |

- "I'll wait for it to go green and tell you when" is wrong. It becomes: *the
  blocked agent watches the gate itself and continues when green* — no relay.
- A fact one agent knows and another needs is **written to the shared channel**
  (a status entry), or both agents check the same source. Never hand-carried.

## 2.1 Pull modes — persistent vs fresh sessions

The handoff row above says "pulls its inbox at session start." That is necessary
but not sufficient: **operators run long-lived sessions, not one session per task.**
A startup pull is a one-time snapshot — it does not keep a running session current,
so messages that land after it began will not surface on their own. The inbox is
therefore pulled two ways:

- **Startup check** — a one-time view when a session begins (where the harness
  supports it). A snapshot, not a live feed.
- **In-session refresh** — an idempotent command a running agent executes **on
  demand** to see what arrived since. This is the **floor, not a fallback**: in a
  long-lived session it is the primary way work is picked up.

A human relaying a one-line "check your inbox" is an acceptable **wake signal** — it
does not make the human the message bus (§1), because the content still travels
through the channel; only the *signal* is relayed. A live poll or push notification
(so a running agent detects new items without the human signal) is **deferred until
the manual signal demonstrably hurts** — coordination machinery is not built
preemptively.

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
| `to_agent` | **canonical** normalized recipient token (one known agent, or `any`) — what routing depends on |
| `to` | human-readable recipient prose (`<agent-token>-dev`, `<agent-token>-<role>`, `<Agent> (...)`) — a known agent token is extracted from it only as a fallback when `to_agent` is absent |
| `status` | `open` \| `closed` |
| `re` | the message this threads from |
| `priority` | ordering hint |
| `needs` | `human` when a judgment gate is reached, else absent |

- An agent's **inbox** = messages whose normalized recipient is itself (or `any`)
  and `status: open`.
- The **human's inbox** = messages where `needs: human`. The human pulls one
  place instead of being polled across every window.
- `to_agent` is the clean token routing depends on; the prose `to:` (and a
  bold-label `**To**:` body header, which predates the YAML convention) is the
  human label. The router prefers `to_agent` and falls back to extracting a known
  agent token from the prose only when `to_agent` is absent — so legacy messages
  still route while new ones use the canonical field. inbox and feed share **one**
  normalizer so they can never disagree on who a message is for.

## 5.1 Human-actionable shape — the orientation contract

§5 routes messages for *machines*. This section makes the same messages
**actionable for a human** — so a human reading an inbox that mixes projects and
repos can act **without opening the thread, reconstructing context, or asking
"what does this even mean?"**

> **The human is the navigator, not the investigator.**
> A message must orient the human; it must never force the human to dig to
> understand it.

### The compass (every human-facing message answers three questions)

A human who is lost must be able to ask for — and always receive — the same three
orientation answers. This triad is the compass:

| Compass question | Answered by |
|------------------|-------------|
| **Where do I stand?** | `project` · `repo` · current `state` |
| **What has happened?** | a one-line, jargon-free summary (`tldr`) |
| **What is missing / what do I do?** | the `action` + the literal next step |

These three are the floor. A message that cannot answer them is not ready to send
to a human. "Tell me where I'm standing, what happened, and what's missing" is a
request any agent must be able to satisfy on demand, for any piece of work.

### Two layers (plain first, complete on demand)

Every human-facing message carries **two layers**:

1. **Plain layer (always visible)** — the compass answers + the one action, in
   non-technical language. Short. No vendor, tool, or implementation jargon. This
   is what a tired human reads at a glance to decide.
2. **Complete layer (on demand)** — everything: references (PR/branch/doc),
   technical detail, links. Folded or linked, never forced. The human opens it
   only if they choose to.

The plain layer is the contract; the complete layer is the backup. **Never invert
them** — do not lead with technical detail and bury the decision.

### The card (plain-layer shape)

```
🧭 WHERE     <project> · <repo>   ·   state: <waiting-you | blocked | fyi | done>
📋 HAPPENED  <one line, no jargon — what this is>
🎯 DO        choose: A (recommended) / B / C   →   <literal next step, paste-able>
⚖️ HEADS-UP  if you choose wrong: <reversible | irreversible>  ·  if you don't reply: <what happens>
📄 FULL      <link / fold to the complete layer>   (cost · confidence · thread live here)
```

### Decision aids (when the message is a decision gate)

A decision gate is neither a bare command nor a neutral menu. When a human must
choose, the plain layer carries three aids so the human decides **fast and safe**:

1. **Options + a recommendation with its reason.** Present the real choices, say
   which one you recommend, and why — in one line. Never a bare imperative; never
   options laid out neutrally with no recommendation. The author already did the
   thinking; surface it.
2. **Consequence of silence.** State what happens if the human does not respond —
   auto-proceeds, blocks, or expires (and when). Silence is a valid input only when
   its effect is known.
3. **Reversibility.** Say whether a wrong choice can be undone. Reversible → the
   human can decide quickly; irreversible → the human is told to slow down. This is
   the safety boundary (§3) made visible to the decider.

Keep these **folded into the existing lines — plug, do not stack.** The card must
stay glanceable; the moment it becomes a form, the human is an investigator again.
Secondary context (effort/cost, the agent's confidence + evidence, the prior thread
this continues) lives in the **complete layer**, never on the plain card.

### Backing fields (machine layer — extends §5, additive & backward-compatible)

The card is rendered from front-matter fields. New fields are **additive**: a
parser that does not know them ignores them, so v1 messages keep working.

| Field | Feeds | Notes |
|-------|-------|-------|
| `project` | WHERE | human project name; **auto-resolved** from the repo's inbox config, not typed per message |
| `repo` | WHERE | git repo to act in; auto-resolved from config |
| `action` | DO | one of `decide` \| `review` \| `implement` \| `handoff` \| `fyi` |
| `tldr` | HAPPENED | one jargon-free line |
| `reversible` | HEADS-UP | `yes` \| `no` — whether a wrong choice can be undone |
| `on_no_reply` | HEADS-UP | what happens if the human stays silent (proceeds / blocks / expires + when) |
| `ref_pr` / `ref_branch` / `ref_doc` / `ref_spec` | FULL | **flat keys** — the front-matter parser is flat; nested maps are not supported |
| `protocol` | — | schema version marker (e.g. `cross-agent-comm/v2`) |

`project` and `repo` are **per-repo data supplied by the consuming repo's config —
never product vocabulary baked into this neutral core.**

### Routing of roles

A role suffix (`-arq`, `-dev`, `-rev`) is a **hint about which hat to wear, not a
separate inbox.** Routing normalizes a role-suffixed recipient token to its base
agent token (`codex-rev` → `codex`) so a role-addressed message still reaches the
agent's base inbox; the role travels as displayed metadata. An agent picks up its
inbox regardless of the hat it is asked to wear.

### Implementation note (contract vs engine)

This section is the **contract**. Authoring the fields (the consuming repo's send
tool fills `project`/`repo` from its config) is the zero-risk first step and needs
no engine change. Rendering the card in the inbox/feed listing, and normalizing
role suffixes, are engine changes — made **test-first** in this kit, then inherited
verbatim by every repo (§8). No repo forks the engine.

## 6. Red-gate discipline

A red machine gate is **read, not assumed**, before any decision:

- Read the **specific failure line**, not the summary wrapper.
- Do not declare a failure "pre-existing" without confirming it against the
  baseline (it existed before this change and this change does not touch it).
- **Infrastructure flakes** (timeouts, cancellations, runner/billing noise) are
  re-run, not merged-around. A symptom message is not a diagnosis.
- Escalate to the human only a **real blocker that needs judgment** — never an
  unread red, and never a flake.

## 7. Review-call discipline

When work is handed to a second architect (an **advisor**) before it is sealed, the
advisor validates **what the author can prove, not what the author asserts** —
against real data, with negative cases, distinguishing *"passes today"* from
*"correct by design"*. The advisor returns **GO** (with the evidence it actually
ran) or **BLOCKED** (with the specific failing control + file/line) — never an
unread green.

The living, operational checklist of concrete controls (reality over fixtures,
recall *and* precision, gates that bite, boundaries grepped not asserted, enforcement
not authorship, honest close, …) lives in `REVIEW-CALL-CHECKLIST.md` and grows as new
failure modes are found. This principle stays stable.

## 8. Inheritance

This kit is the **upstream** of governance. Each repo is a **fork** that inherits
this protocol. Routing tokens, channel location, inbox/feed tooling, and the set
of known agents are declared per repo; the principles here never change. Anything
specific to a product, a vendor, or a methodology stays in that repo's own layer —
it never flows into this neutral core.

The step-by-step procedure for a repo to **adopt / validate / activate** this
governance lives in the kit's `setup/ADOPT-CROSS-AGENT-GOVERNANCE.md`.
