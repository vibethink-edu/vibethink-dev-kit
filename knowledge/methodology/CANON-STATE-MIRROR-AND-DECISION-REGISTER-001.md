# CANON-STATE-MIRROR-AND-DECISION-REGISTER-001 — Governance instruments: present-mirror, append-only log, decision register

**Status:** SEALED 2026-06-15 by the Principal Architect — fire-tested on a vertical's multi-wave delivery (state mirror + history log + approval ledger run across several agent/human waves).
**Date:** 2026-06-15
**Scope:** Every repo where one or more contributors — human or agent — hold governance state across sessions: the live state of who is doing what, the history of why the work reached its current shape, and the record of authority approvals. Vendor-neutral, product-neutral, tool-neutral, harness-neutral.
**Home:** the dev-kit (supra-repo). Inherited by every repo as upstream → fork.
**Companion canons:** [`CANON-AGENT-COLLABORATION`](./CANON-AGENT-COLLABORATION.md) (§1 *the repo is the only persistent memory* — the root this canon instruments; §8 the lesson-canonization close ritual this canon's operational close step runs alongside) · [`CANON-DEVELOPMENT-PROCESS`](./CANON-DEVELOPMENT-PROCESS.md) (§5 owns the **ADR** and the **append-only log of decisions** concepts this canon names but does not re-derive) · [`CANON-CONTEXT-HYGIENE`](../ai-agents/CANON-CONTEXT-HYGIENE.md) (§3 persistence-to-filesystem + *"the concrete paths/files are an L3 concern"* — the open gap this canon closes by publishing a reusable L3 skeleton; §5 the session-closeout checklist this canon's close step feeds) · [`CANON-AUDIT-PROTOCOL`](./CANON-AUDIT-PROTOCOL.md) (§4 the audit-finding disposition ledger — a sibling ledger, not duplicated here).

---

## §1 — Principle

`CANON-AGENT-COLLABORATION` §1 seals the root: *"The repo is the only persistent memory — what is not in the repo does not exist."* This canon concretizes that root into the **three governance instruments** the principle implies but does not itself publish, and a **close ritual** that keeps them honest.

Three distinct failure modes follow from leaving governance state in chat history or in an agent's volatile memory:

- **No single present.** State scattered across heads, windows, and sessions means no contributor can answer *"what is happening right now, and what is the next action?"* without reconstructing it — and reconstruction drifts.
- **Unrecorded authority.** An approval, a "go ahead", or a seal granted through an ephemeral channel leaves **no durable trace**. Later, *"who authorized this, when, and on what evidence?"* is unanswerable — the decision cannot be audited, only re-litigated.
- **Lost history.** The *why we got here* — the sequence of moves and the reasoning behind them — evaporates, so the next session repeats settled debates.

The instruments exist so that governance state is **auditable and bites**: a rule or a state that is not written where it survives the session does not govern anything.

> **What "bites" means.** A present-mirror that nobody trusts as current, an approval that lives only in someone's recollection, and a history nobody appends to are decorative. These instruments are load-bearing only if the **close ritual** (§7) keeps them synchronized with reality.

---

## §2 — Relationship to the companion spines (no duplication)

| Concern | Owner | This canon |
|---|---|---|
| The repo is the only persistent memory | **`CANON-AGENT-COLLABORATION`** §1 | does **not** restate; §1 cites it as the root these instruments serve |
| Lesson-canonization at session close ("what did I learn that must survive?") | **`CANON-AGENT-COLLABORATION`** §8 | does **not** restate; §7 names the **operational** close step (sync the three instruments) that runs alongside the lesson ritual |
| The **ADR** (the *why* behind a design/contract decision) + the **append-only log of decisions over time** + the **decision store** by layer | **`CANON-DEVELOPMENT-PROCESS`** §5 | does **not** re-derive; §5 names the append-only log as one of the three instruments, and §6 **distinguishes** the decision register from the ADR |
| Persist to filesystem, not chat; *"the concrete paths/files are an L3 concern"* | **`CANON-CONTEXT-HYGIENE`** §3 | does **not** restate; §8 **closes the open gap** by publishing a reusable L3 skeleton the consumer copies and renames |
| Session-closeout checklist (uncommitted work, worktrees, doc drift) | **`CANON-CONTEXT-HYGIENE`** §5 | does **not** restate; §7's close step is the governance-instrument arm of that checklist |
| Audit-finding disposition ledger (FIXED/OPEN/WAIVED…) | **`CANON-AUDIT-PROTOCOL`** §4 | does **not** restate; that is a sibling ledger for *audit findings*, distinct from the *authority-approval* register of §6 |

This canon **owns** what had no agnostic home: the **present-mirror role** and its mirror-wins-reality rule, the **authority-approval register** as an object distinct from the ADR, the **three-instrument model** as a set, the **operational close ritual** that synchronizes them, and a **publishable L3 skeleton** for all three.

---

## §3 — The three instrument roles

A consuming repo holds governance state in three artifacts with **distinct mutabilities and distinct questions they answer**. The roles are canon; the file names are L3 (§8).

| Instrument | Role — the question it answers | Mutability |
|---|---|---|
| **Present-mirror** | *"What is happening right now? Who owns what? What is the single next action?"* — the whole state on one page | **overwritable** — it is the present, not a log |
| **Append-only log** | *"How did we get here? Why was each move made?"* — the history | **append-only** — entries are added below, never edited away |
| **Decision register** | *"Who authorized this, when, through what channel, on what evidence?"* — the ledger of authority approvals | **append-only** — each approval is one immutable row |

The three are **not interchangeable**. Collapsing the mirror into the log loses the single-present view; collapsing the register into the log loses the auditable provenance of *who said go*; collapsing the register into the ADR conflates the *authorization event* with the *design rationale* (§6).

---

## §4 — The present-mirror (mirror-wins-reality)

The present-mirror is the live state on **one page**: who is doing what, the next action for each thread, and what is still missing.

- **It is a mirror, not a ceremony.** If the mirror and reality disagree, **reality wins** and the mirror is corrected — never the other way around. A mirror that is trusted as current but is stale is worse than no mirror.
- **The close obligation:** *if you did not update the present-mirror, you did not close.* A session (human or agent) that changed the state and left the mirror stale has left invisible debt for the next contributor (the working-floor parallel of `CANON-CONTEXT-HYGIENE` §5).
- **It is overwritable on purpose.** The mirror carries no history — it is replaced as the present moves. History lives in the append-only log (§5); authorizations live in the register (§6).

The present-mirror is distinct from the per-unit **status roadmap** named in `CANON-DEVELOPMENT-PROCESS` §5: the roadmap tracks a unit's lifecycle; the mirror is the **cross-thread present** of the whole effort.

---

## §5 — The append-only log (history)

The append-only log is the narrative of *why the work reached its current shape* — added to at each substantive step, never rewritten.

`CANON-DEVELOPMENT-PROCESS` §5 owns the concept of *"an append-only log of decisions over time"* and the ADR/decision-store layering; this canon does **not** re-derive them. It only names the log as one of the three instruments and binds it to the close ritual (§7): the log is where a session records *what it did and why* before it ends, so the reasoning survives even when the mirror that reflected it has already been overwritten.

---

## §6 — The decision register (authority approvals — distinct from the ADR)

The decision register is an **append-only ledger of authority approvals**: every decision of an authority class (a "go ahead", an approval to proceed, a seal) recorded the moment it is granted.

**Minimum fields (each row):**

| Field | What it captures |
|---|---|
| **who proposed** | the contributor (human or agent) who put the decision forward |
| **authority** | who granted it (the approving authority) |
| **when** | timestamp, in a declared timezone |
| **what** | the decision, in one auditable line |
| **channel** | where it was granted (especially ephemeral channels — chat, a call — that leave no other trace) |
| **evidence** | the durable link that backs it (a commit, a PR, an ADR, a verification artifact) |

**Why the register is distinct from the ADR.** `CANON-DEVELOPMENT-PROCESS` §5 already owns the **ADR** — *the why behind a design/contract/behaviour decision*. The register is a **different object**: it captures the **authorization event and its provenance**, not the design rationale. The sharpest case it exists for is the approval **granted through an ephemeral channel** ("yes, go ahead") that leaves no durable artifact of its own — the register is where that "go" becomes auditable: *who said it, when, through what channel, and what evidence backs it.*

- An ADR answers *why this design.* A register row answers *who authorized acting on it, and how do we know.*
- They **cross-link**: a register row's *evidence* field points at the ADR (or commit/PR) that the approval set in motion; the ADR need not restate the approval provenance.
- **Append-only and immediate.** The row is added **the moment the approval is granted**, not reconstructed later. A reconstructed approval is a recollection, not a record.
- Approvals self-documented elsewhere (e.g. a merge recorded by the forge) are **still listed** so the register is one continuous timeline.

The register is **distinct, too, from the audit-finding disposition ledger** of `CANON-AUDIT-PROTOCOL` §4: that ledger carries *findings* to closure; this register carries *authority approvals*. A repo may run both.

---

## §7 — The close ritual (synchronize, or you did not close)

Every session — human or agent — closes by synchronizing the instruments to reality:

1. **Update the present-mirror** to the true current state (§4). *If you did not update it, you did not close.*
2. **Append to the log** what this session did and why (§5).
3. **Add a register row** if an authority decision was granted this session (§6).

This is the **operational** close step. It runs **alongside** — not instead of — the lesson-canonization ritual of `CANON-AGENT-COLLABORATION` §8 ("what did I learn that deserves to survive?") and the closeout checklist of `CANON-CONTEXT-HYGIENE` §5 (uncommitted work, worktrees, handoff). Those ask *what survives* and *is the floor clean*; this asks *are the three instruments true.*

> **Anti-pattern:** closing a session that moved the state without touching the mirror, or that received a "go ahead" without a register row. Both leave the next contributor reconstructing what should have been recorded — the exact failure §1 exists to prevent.

---

## §8 — L3 binding (what the consuming repo owns)

Honoring `CANON-CONTEXT-HYGIENE` §3 (*"the concrete paths/files are an L3 concern"*), this canon prescribes the **roles**, not the file names. The consuming repo binds:

- the **concrete file names/paths** for the three instruments (the present-mirror page, the append-only log, the decision register) — the dev-kit publishes a **reusable skeleton** the consumer copies and renames (`setup/templates/governance-instruments/`); it does **not** mandate the names.
- the repo's **authority classes** — which decisions require a register row (e.g. cross-boundary, security, data-sensitivity, spend, public-facing) and which are delegated.
- the **channels** the register recognizes as valid sources of an approval, and the **timezone** stamped in the *when* field.
- the **evidence conventions** — what counts as a durable backing link in this repo.
- whether the present-mirror is one page or partitioned by area, and where it lives relative to the repo root.

The L3 binding **points at this canon as the spine** — it instantiates the three instruments; it does not re-write the roles, the mirror-wins rule, the register's field set, or the close ritual. If it repeats them, it drifts.

---

## §9 — What this canon does NOT do

- It does **NOT** re-derive the **ADR**, the decision store, or the append-only-log *concept* — those are `CANON-DEVELOPMENT-PROCESS` §5.
- It does **NOT** own the **lesson-canonization** close ritual or the *repo-is-only-memory* root — those are `CANON-AGENT-COLLABORATION` §8 and §1.
- It does **NOT** own the **closeout checklist** (uncommitted work, worktrees) — that is `CANON-CONTEXT-HYGIENE` §5.
- It does **NOT** own the **audit-finding disposition** ledger — that is `CANON-AUDIT-PROTOCOL` §4 (a sibling ledger for a different object).
- It does **NOT** prescribe file names, directory layout, the timezone, the authority classes, or the tooling — all L3.
- It does **NOT** require the register to duplicate an ADR's rationale, or the mirror to carry history — each instrument keeps its single role (§3).

---

## Provenance

First assembled while running a vertical's multi-wave delivery across several agent and human sessions, where each instrument was forced by a concrete bump, not invented ahead of need (Rule: build on real pain):

- state scattered across sessions with no single "what is happening now" view → the **present-mirror**, §4;
- approvals granted by chat ("go ahead") that left no durable, auditable trace of *who/when/channel/evidence* → the **decision register**, §6 — recognized as a **distinct object** from the ADR once it became clear the ADR captured *why the design* but never *who authorized acting and how we know*;
- the recurring loss of *why we got here* between sessions → naming the **append-only log** (already a `CANON-DEVELOPMENT-PROCESS` §5 concept) as one of the three instruments and binding it to close;
- mirrors and registers going stale because nothing forced their update → the **close ritual**, §7, and the *"if you did not update the mirror, you did not close"* rule.

**Coverage-check:** `CANON-AGENT-COLLABORATION` §1 sealed the root (repo is the only memory) but published no instruments; §8 owned lesson-canonization but not the operational sync of present/history/approval state. `CANON-DEVELOPMENT-PROCESS` §5 owned the ADR + append-only-log concepts but neither the present-mirror role nor the authority-approval register as a distinct object. `CANON-CONTEXT-HYGIENE` §3 explicitly left the concrete paths/files an L3 concern and published **no reusable skeleton**, so each vertical reinvented the instruments. `CANON-AUDIT-PROTOCOL` §4 owned the *findings* ledger but not the *approvals* ledger. This canon fills that gap, references the companions rather than duplicating them, and publishes the L3 skeleton (§8); consuming repos keep only the concrete bindings.

**Fire-test:** vendor/product/agent/tool-neutral — names no product, vendor, agent harness, school, person, or concrete file. PASS.

**SEALED 2026-06-15 by the Principal Architect (merge = seal).**
