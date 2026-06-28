# CANON — Cross-Agent Context Layering (universal · agent-agnostic)

> **Scope:** every repo that more than one AI agent works in. Vendor-neutral, product-neutral.
> **Status:** approved (fire-test passed: no product or vendor brand names appear here). **Amendment 2026-06-05: §9 the startup text and its wiring levels (lifted from a product L3 canon).**
> **Home:** the dev-kit (supra-repo). Inherited by every repo as upstream → fork.

## 1. Root principle

> **The most restrictive agent on your team defines the context budget — and that is
> verified, not assumed.**

Each agent's harness loads rule context differently (different files, byte limits, and
load triggers). What loads fully for one agent may truncate or be ignored by another,
**silently**. Declaring a repo "multi-agent" is not the same as verifying every agent
receives the rules.

## 2. The layer model

| Layer | Holds | Budget |
|-------|-------|--------|
| **Root rules file** | Constitution + risk cores (security, methodology, ownership, safety) — anything that must apply regardless of working directory | **Under the most restrictive agent's limit** |
| **Subdirectory rules files** | Domain / operational detail | loaded only when the agent's working dir is under it |
| **Per-agent adapters** | One file per agent — **pointers to the root, never copies** | tiny |
| **Per-agent override** | Raise a strict agent's limit as a **guardrail while layering holds** — never an excuse to let root grow back | — |

## 3. Loading reality (why root carries the weight)

Agents build their rule chain at session start, by **working directory** — some walk up
the tree, some read root→cwd, some only load on explicit read. Therefore:

- **Critical, safety, methodology and authority rules live in the root** — in full or as a
  self-sufficient core. Never only in a subdirectory (a subdir file may never load).
- Subdirectory rules are a **bonus** for sessions scoped to that directory, not the base.
- **Size budget is a routing problem, not a skip permission.** When the inherited generic
  rulebook is large, the agent must use focused reads/search/ranges to load the relevant
  sections. It may not downgrade the inherited rulebook to "optional" or fall back to
  local habits because a wholesale read is too large.
- **If reachable, extract the core.** A constrained agent that cannot load the whole
  inherited rulebook must still extract: Dev Tooling Baseline; NO BRAIN, NO WORK; Duty
  to Flag; inheritance/layering rules; tool availability/reporting rules.
- **If unreachable, stop.** A genuinely missing/inaccessible inherited rulebook is a
  louder local-health failure than a missing operator tool: no brain, no work.

## 4. Cross-repo artifact isolation

An agent working from repo **A** on intelligence about product **B** MUST NOT leave
artifacts of B inside repo A, nor inside the agent's memory namespace bound to A.

- Product intelligence (state, tools, roadmap, research, rules) lives **committed in that
  product's own repo** — never in another repo nor in a memory namespace bound to a
  different project.
- Agent memory is bound to the working directory. Researching B from a session running in
  A deposits B-sediment in A's memory — that is contamination even if no file is committed.
- Output of cross-repo research is **paste-ready text for B's repo**, not memory in A.
- **Exception:** rules about *how the agent operates* (research mode, honest verdict,
  no-execute-in-active-repos) are agent discipline — they may live in any namespace.

## 5. One source, many dialects

The root rules file is the **single source of truth**. Per-agent adapters point to it; they
never hold a second copy. A parallel constitution for any single agent (its own rules tree
that diverges from the source) is prohibited — a low-use agent's private copy drifts
silently and the agent enters out of context exactly when nobody is watching.

## 6. The smoke test (`check-agent-context`)

A repo is **not** "multi-agent" until this passes — before adding a second agent and on
every hygiene pass:

- root rules file **< the most restrictive agent's budget**
- every per-agent adapter exists and **points to the source** (no copy)
- agent configs are **tracked** (untracked = does not travel between machines)
- rule sequence intact (no gaps, no duplicates)
- **no critical rule orphaned** (lost from both root and its declared destination)
- **no parallel constitution** for any agent
- **no secret values** committed (tokens, keys, connection strings) — checked before any push

## 7. Inheritance (upstream / fork)

This kit is the **upstream** of governance. Each repo is a **fork** that inherits the vanilla
state (root rules skeleton + adapters + smoke test) and declares its inherited version.
The kit evolves; repos re-sync. Rules specific to a product, a vendor, or a methodology stay
in their own layer — they never flow into this neutral core.

The step-by-step procedure for a repo to **adopt / validate / activate** this governance
(declare the config, run the smoke, wire the CI gate and the inbox) lives in the kit's
`setup/ADOPT-CROSS-AGENT-GOVERNANCE.md`.

## 8. Levels (what belongs where)

Keep three levels distinct; do not let a lower level leak into a higher one:

| Level | Holds | Lives in |
|-------|-------|----------|
| **1 — Universal / vendor-neutral** | this canon; the layer model; the smoke test | the neutral core of this kit |
| **2 — Org / methodology** | your org's methodology and brand | a clearly labelled methodology layer, not the neutral core |
| **3 — Product** | a single product's rules, vocabulary, stack | that product's own repo |

The fire-test for level 1: it must read clean of any product name, vendor brand, or
methodology name. If one appears, it is a leak from level 2 or 3 — remove it.

## 9. The startup text and its wiring levels

A repo gives every agent a **canonical startup text** — the minimal *"read these, in
this order; obey these rules; close a session this way"* an agent needs before its
first action. The **content** of that text (which docs, which rules) is an L2/L3
concern; this section governs only that the text **exists** and **how it is
delivered**.

The text is delivered at **escalating wiring levels** — each higher level reduces the
reliance on an agent remembering to read:

| Level | Mechanism | Reliance |
|-------|-----------|----------|
| **1 — Committed bootstrap files (the floor)** | the startup text lives in the repo's agent-bootstrap files, loaded by working directory (§3) | the agent must actually load the layer |
| **2 — System prompt** | the same text is pasted as the agent's system prompt | always present for that agent, but per-agent setup |
| **3 — Session hooks (automation)** | a session-start hook injects or links the text automatically | none — no memory or per-agent setup needed |

**The floor is level 1** — committed, so the text survives any single agent or
session. Levels 2 and 3 are progressive enhancement, not prerequisites; build the
hook (level 3) only when the manual levels demonstrably fail (build-on-pain). A repo
declares which level it operates at; raising the level is an adoption decision, not a
default.
