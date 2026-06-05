# CANON-AGENT-SCOPE-DISCIPLINE — Scope lock, layer boundaries & drift prevention (universal · agent-agnostic)

> **Scope:** every repo where one or more agents (AI or human) edit a shared codebase organized across multiple domains.
> Vendor-neutral, product-neutral, tool-neutral.
> **Status:** DRAFT — awaiting human-authority seal.
> **Home:** the dev-kit (supra-repo). Inherited by every repo as upstream → fork.
> **Siblings:** `CANON-AGENT-COLLABORATION` (how an agent works with the human authority) · `CANON-MULTI-AGENT-ORCHESTRATION` (how agents hand work between each other) · `CANON-CROSS-AGENT-CONTEXT-LAYERING` (how agents read the rule layers).

---

## §1 — The drift problem

Agents drift. An agent assigned to one module finds a bug in another and starts editing it; a connector gets rewritten; a third module is touched without authorization. By session end the original task is half-done and the blast radius is three modules wide.

Scope discipline eliminates drift by making scope **explicit, measurable, and enforced at the file-edit boundary** — not discovered at session end. The mechanism below is the universal contract; the concrete module/layer names a given repo uses are declared in that repo's L3 binding.

---

## §2 — The Scope Card (mandatory before any edit)

Every session begins with a **Scope Card** declared before the first file edit:

```
ROLE:    {agent}-{domain}-{role}
DOMAIN:  {registry sigla}
SCOPE:   {module / front}
LAYER:   {vertical | horizontal}
FILES:   {glob the agent may edit}
```

**Rules:**

1. The Scope Card is declared in the **first message** after reading the repo's operational-state doc.
2. If the human does not specify a scope, the agent **asks** ("what module/front am I working on this session?") — it never guesses.
3. The agent may **not** edit files outside the declared `FILES` glob without explicit human authorization.
4. If the human extends scope ("also fix X in Y"), the agent **updates** the Scope Card to include Y.
5. The `ROLE`/`DOMAIN` format follows the repo's role registry (an L3 concern).

---

## §3 — The two-dimensional layer model

A codebase organizes into two kinds of unit:

- **Verticals** — user-facing modules a user interacts with directly.
- **Horizontals** — transversal platform services the verticals consume (auth, notifications/signals, billing, governance, external connectors). Horizontals have no user-facing surface of their own; they are infrastructure.

The **concrete list** of verticals and horizontals is repo-specific (declared in the L3 binding, typically as a table mapping each unit to its file paths). The **model and its boundary rule are universal.**

### §3.1 — The boundary rule

> A vertical agent never edits horizontal files.
> A horizontal agent never edits vertical files.
> They communicate through **tasks**, not direct edits.

---

## §4 — Cross-boundary work: the Task Protocol

When an agent needs a change in another layer or module, it does **not** fix it itself. It writes a task in the repo's coordination lane:

```
TASK-{layer}-{description}
- From: {agent} working on {module}
- To: {target layer/module owner}
- Priority / Date
## What I need
## Why  (context from my module — why I can't proceed without it)
## Suggested approach  (optional — the owner decides)
## Files likely involved  (optional — hints for the owner)
```

The layer owner reads the task, branches, implements, reports completion, opens a PR; the requesting agent then consumes the change. The **message-passing mechanics** (branch naming, delivery/done reporting, the architect↔executor dance) are governed by `CANON-MULTI-AGENT-ORCHESTRATION` — this canon governs only the *discipline of not crossing the boundary yourself*.

---

## §5 — Out-of-scope discoveries: the Finding Protocol

When an agent discovers a bug, risk, or opportunity **outside its scope**, it does **not** fix it. It writes a finding in the coordination lane:

```
FINDING-{module}-{description}
- Found by: {agent} while working on {my module}
- Affects / Severity / Date
## What I found
## How I found it  (what I was doing when I stumbled on it)
## Evidence  (error message, log, file:line, screenshot path)
```

Then the agent **continues its own work** — it does not wait for the finding to be resolved. The finding's category taxonomy and escalation routing are an L3 concern.

---

## §6 — Assignment registry

The repo's operational-state doc carries an **Assignment Registry**: which agent is on which module, in which role, on which branch, with what status. Before starting work, an agent checks it:

1. Is someone else assigned to this module? → If yes, do **not** start; ask the human.
2. If no → add yourself to the registry.
3. When done → update your status (or remove your row).

---

## §7 — The pre-work gate (mandatory before every file edit)

```
1. Did I declare my Scope Card?
2. Is this file inside my declared FILES glob?
3. If no → is the human explicitly asking me to edit it?
4. If the human did not ask → write a TASK or FINDING instead.
5. Is another agent assigned to this module?
6. If yes → STOP. Write a TASK.
```

If **any** check fails, the agent does not edit the file.

---

## §8 — Mid-session drift check

After every **N** commits (default 3), the agent re-reads its touched-files list against its declared `SCOPE`:

```
Am I still inside my declared SCOPE?
Files touched: [...]
Files outside scope: [...]
```

Any file outside scope → **pause and ask the human**: "I drifted to {module}. Continue, or write a TASK for the owner?"

### §8.1 — Topic-shift rule

If the live conversation moves into another front, domain, or constitutional concern, the agent **says so explicitly** ("we are now entering another front / another topic") and decides one of:

1. the current branch/worktree still fits, or
2. a new front must be opened.

**No silent topic expansion is allowed.**

---

## §9 — Session-end and strategic decisions (delegated to the collaboration spine)

Two disciplines that scope work depends on are **already governed** by `CANON-AGENT-COLLABORATION` and are not redefined here:

- **Session-end discipline** (commit/push or discard, update the state doc, write outstanding TASK/FINDING, clean branches) → `CANON-AGENT-COLLABORATION` §8 (session-close ritual). This canon adds exactly **one** session-end item: update the Assignment Registry (§6).
- **Canon-not-memory** → `CANON-AGENT-COLLABORATION` §1 (the repo is the only persistent memory). A strategic, philosophical, or product-defining decision from the human authority is written as a committed canon doc **immediately**, never left in volatile agent memory. The agent says *"I'll canonize that,"* never *"I'll remember that."*

---

## §10 — Rules summary

1. **SCOPE CARD** — declare before editing anything.
2. **LAYER BOUNDARY** — verticals and horizontals never edit each other.
3. **TASK PROTOCOL** — need another layer? Write a TASK, don't fix it.
4. **FINDING PROTOCOL** — found something outside scope? Write a FINDING, keep working.
5. **ASSIGNMENT REGISTRY** — check before starting, update when done.
6. **PRE-WORK GATE** — the 6-point check before every edit.
7. **DRIFT CHECK** — after N commits, verify no drift.
8. **NO SILENT TOPIC SHIFT** — name the front change.
9. **SESSION-END + CANON-NOT-MEMORY** — per `CANON-AGENT-COLLABORATION` §8 / §1.
