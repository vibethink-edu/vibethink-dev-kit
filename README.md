# Dev-Kit — engineering governance you inherit, not copy

[![AGENTS.md](https://img.shields.io/badge/AGENTS-md-blue)](https://agents.md)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![agent-context](https://github.com/vibethink-edu/vibethink-dev-kit/actions/workflows/agent-context.yml/badge.svg)](.github/workflows/agent-context.yml)

**One set of engineering norms — naming, git hygiene, testing floors, agent
collaboration, upstream tracking — written once, inherited by every repo you
run, and enforced by CI gates instead of memory.**

You point at the rules instead of copying them (so they never go stale in your
repo), you adopt them piece by piece (nothing is all-or-nothing), and when a
rule doesn't fit your repo you override it **visibly** — there's a contract for
that.

---

## What you stop worrying about

If your repo inherits this kit, these problems stop being yours to remember:

| You stop asking… | Because… |
|---|---|
| *"Did an agent (or a teammate) quietly break our working rules?"* | the **layering smoke** runs on every PR: all agents and humans read the same root rules — no truncated copies, no contradictory parallel rulebooks. |
| *"Is this copied script three months stale?"* | the **copy-parity gate** compares every copied runnable against its source and goes red on silent drift — you find out at commit time, not in an incident. |
| *"Where was the rule about X written?"* | one **catalog** (31 pieces, each with *what you inherit · how · how to verify*) and a **one-page contract** — no archaeology across scattered docs. |
| *"What did we actually adopt, and what did we skip?"* | your repo carries a **status doc** with a strict vocabulary, and a validator rejects vague claims — adoption is declared, never folklore. |
| *"Can we deviate without breaking the model?"* | yes — the contract's **override clause**: declare the rule, your replacement, the reason. Visible deviation is legitimate; silent deviation is the only sin. |
| *"Did someone paste a secret into an agent-to-agent message?"* | the **comms security gate** scans every outbound message fail-closed before it ever travels. |
| *"How do I start a new repo with the same standards?"* | the 15-minute path below — and the new repo inherits future rule improvements automatically, because it points at the source instead of holding a copy. |
| *"Our docs say one thing and reality does another…"* | norms here ship **with their enforcement** — a rule that can't bite is treated as a defect of the kit itself (it's how this repo audits *itself*). |
| *"We switched IDE or model — do our rules still hold?"* | adapters are one-line pointers to a single root, verified on every PR; the neutral core names no vendor, so switching costs nothing. |

---

## The rules, in plain words — the whole catalog, one line each

Every rule below was distilled from a real incident, not theory — and each one
names its enforcement (the catalog entry tells you how to verify it's in use).
Full detail per rule: [`setup/ADOPT-DEV-KIT.md`](setup/ADOPT-DEV-KIT.md).

### 🏠 House basics

| # | Rule | In one line |
|---|---|---|
| 1 | Universal root authority | ONE root rulebook; every repo extends it, never replaces it. |
| 2 | Context layering + smoke | Every agent (any vendor) reads the SAME rules via one-line pointers — a robot verifies on each PR that none reads a truncated or contradictory version. |
| 13 | Naming conventions | How everything is named: branches `{author}/{type}-{description}`, conventional commits, dated ADRs, canon IDs. Never bare names. |
| 11 | Port assignment scheme | Production <5000, review ≥5000 (prod+2000), all in one registry — never an invented port. |
| 16 | Versioning | Each artifact type (package, app, canon, ADR, tool) has ITS declared version model; breaking changes marked. |

### 🤝 How agents work — with you and with each other

| # | Rule | In one line |
|---|---|---|
| 17 | Agent ↔ human collaboration | The repo is the only persistent memory; read the human's intent — but **a direct instruction executes whole, first time**; preflight before proposing against canon; session-close ritual. |
| 3 | Multi-agent orchestration | Agents talk to each other through git (inbox/comms), not through the human — the human relays signals, never content. |
| 8 | Governed dispatch | Every agent-to-agent message goes through the governed send with a fail-closed secret scanner. |
| 18 | Scope discipline | Each session declares WHAT it will touch; another module's problem isn't fixed — it becomes a TASK/FINDING to its owner. |
| 19 | Skills over roles | Generalist agents with a toolbox of skills, not 35 permanently-titled specialists; skills are measured (eval loop). |
| 20 | Context hygiene | An agent's memory degrades silently as it fills: persist to disk, cut the session in time, never steer a poisoned context back. |
| 21 | Pre-production discipline | Before the first real user: deletion is the default, ceremony is a bug — but safety gates never switch off. |

### 🌿 Git and the lifecycle of work

| # | Rule | In one line |
|---|---|---|
| 22 | Git hygiene | Never start on a dirty tree; everything merges via PR; no silent hook-bypass; no junk at the repo root. |
| 23 | Branch & worktree lifecycle | Every branch is born through a gate and dies through a gate; 1 task = 1 unique branch; the main worktree is read-only; cleanup right after merge (squash-blindspot aware). |
| 4 | Session closeout + scan | Every branch touched ends declared: PUSHED / READY-PR / DISCARDED — and a scan hunts what was left hanging. |
| 7 | Paused work lifecycle | Paused work is either declared-with-intent or reapable after N days — nothing floats forever. |
| 10a | Development process (universal skeleton) | Governance precedes code: slice → decision gate → spec → governed execution → artifacts; **the plan carries a security section**; **suppressing a gate = a registered, expiring exemption**. |
| 10b | House methodology (L2 binding) | The kit owner's concrete instantiation of the skeleton (gate questions, spec pipeline). Non-house repos: declare N-A and bind 10a natively. |

### ✅ Quality: testing and review

| # | Rule | In one line |
|---|---|---|
| 15 | Testing minimum bar | Every new function with logic: 1 happy-path + 1 failure test, same PR. **And the toolchain must be ALIVE** — an orphaned runner is a fake green. |
| 26 | Testing gate | Tests aren't yes/no — they're WHICH TYPE by the change's nature × stakes (unit, contract, smoke, UAT, eval for AI). No global coverage %. |
| 27 | Ephemeral test users | E2E tests NEVER touch real accounts: create a throwaway user, delete it after. (Born from a real two-hour lockout.) |
| 14 | Visual bug triage | "It looks broken" is not evidence: DIFF first → cache/client side → only then touch code. |
| 9 | Review-call checklist | The second architect's 10 controls before a seal: reality over fixtures, gates must bite, honest close. |
| 24 | Architecture review | How an advisor judges the whole system: 4 lenses (gaps / drift / contradiction / **over-engineering**) and hard-drop — a finding with no real value is discarded, not noted. |
| 25 | Audit protocol | An audit asks "does it LIE?", not "is it built?" — and every finding carries a disposition until closed; nothing stays "acknowledged but idle". |
| 28 | Gap report | When asked "what's missing?": read the plan, read the REAL code, report verified — diagnosis, never execution without a go-ahead. |

### 📜 Decisions and external code

| # | Rule | In one line |
|---|---|---|
| 5 | Decisions as ADRs | Every architecture decision is written down, indexable, with its why and alternatives — so it's never re-litigated. |
| 6 | Decision-capture reflex | About to add a dependency / framework / contract / security boundary? STOP and write the ADR first. |
| 29 | Upstream protocol | All external code is governed: a 6-step protocol before adopting, license rules (strong copyleft never enters as a fork), an inventory with cadence, and external providers graded A/B/C/F (F = blocked). |

### 📦 What ships, and configuration

| # | Rule | In one line |
|---|---|---|
| 30 | Production safety | NO dev shortcut ships to production (not even behind a flag) — and what runs in prod must be able to **explain why it blocks** (reason codes + trace id, never a mute 403). |
| 32 | Configuration discipline | Code defines behavior, not values: anything that can differ per deployment/group goes to layered config; secrets never fall to a code default; "look where the code looks". |
| 31 | Copy-parity | Every tool copied from the kit carries an anti-rot guard: undeclared drift = red; deliberate adaptation = declared and visible. |
| 12 | Agent-hook engines | The small reusable engines (keyword reminders, skill sync) that copy with their parity check. |

---

## Works with your agents and your models

**Any AI coding agent / IDE.** The root rulebook follows the open
[AGENTS.md](https://agents.md) standard, and one-line adapters ship for the
common harnesses (e.g. Claude Code, Codex, Copilot, Windsurf; Cursor via its
rules file — the verified per-tool map is
[`knowledge/ai-agents/AI_AGENT_COMPATIBILITY.md`](knowledge/ai-agents/AI_AGENT_COMPATIBILITY.md)).
Adding a new agent is a one-line pointer file. The layering smoke **verifies on
every PR** that all adapters point at the same root and none contradicts it —
multi-agent support is gated, not promised.

**Any model, any vendor.** The neutral core names no model vendor — a CI check
enforces it. Swap models or providers tomorrow; your governance doesn't notice.

**Any platform.** The engines are pure Node (zero dependencies), validated
cross-platform: the kit's own CI runs them on Linux on every PR, and consuming
repos run them daily on Windows. Requirements: Node 20+ and git.

---

## Adopt it in your repo — the 15-minute path

1. **Read the contract** (one page): [`setup/INHERITANCE-CONTRACT.md`](setup/INHERITANCE-CONTRACT.md)
   — how inheritance behaves: docs by reference · runnables by copy+parity ·
   declare everything · override visibly · never duplicate.
2. **Create your status doc** — copy
   [`setup/templates/DEV_KIT_INHERITANCE_STATUS.template.md`](setup/templates/DEV_KIT_INHERITANCE_STATUS.template.md)
   into your repo (suggested: `docs/DEV_KIT_INHERITANCE_STATUS.md`). It comes
   pre-filled with every catalog piece as `PENDING` — flip rows as you adopt.
   `N-A(reason)` is a perfectly good answer; silence is not.
3. **Wire your first gate** — the layering smoke, via the reusable workflow
   (no engine copied):

   ```yaml
   # .github/workflows/agent-context.yml (in YOUR repo)
   jobs:
     agent-context:
       uses: vibethink-edu/vibethink-dev-kit/.github/workflows/agent-context.yml@main
       with:
         config-path: tools/agent-context.config.json
   ```

   and declare your `tools/agent-context.config.json` (which file is your root
   rulebook, which files are per-agent pointers — see
   [`setup/ADOPT-CROSS-AGENT-GOVERNANCE.md`](setup/ADOPT-CROSS-AGENT-GOVERNANCE.md)).
4. **Run it** — locally or in CI. Expect: `GREEN — cross-agent layering holds`.
5. **Done — you're a declared heir.** Walk the catalog
   ([`setup/ADOPT-DEV-KIT.md`](setup/ADOPT-DEV-KIT.md)) at your own pace and
   adopt further pieces **when you feel the pain they solve** — never for
   symmetry.

---

## The rules of inheritance (the contract in five lines)

1. **Docs by reference** — your repo points at the kit; copying a doc creates a
   second truth that rots.
2. **Runnables by verbatim copy + parity check** — scripts must run without the
   kit present, so they're copied, and the parity gate guards the copy.
3. **Declare your adoption** — every piece gets a row: wired, declared,
   native-equivalent, pending, or N-A with a reason.
4. **Override visibly** — an `## Overrides` section names the rule, your
   replacement, the reason, and whether it's temporary. Each override also
   tells the maintainer (maybe the rule needs your case).
5. **Silent deviation is a violation** — everything else is negotiable.

Full text: [`setup/INHERITANCE-CONTRACT.md`](setup/INHERITANCE-CONTRACT.md).

---

## Adoption tiers — start small

| Tier | What you take | Right for |
|---|---|---|
| **Minimum** | contract + status doc + the layering smoke | any repo, day one, ~15 min |
| **Standard** | + the universal pieces: naming conventions, git hygiene, testing floor, versioning, visual-bug triage | a team that wants shared engineering hygiene |
| **Full** | the whole catalog: agent orchestration (inbox/feed), governed dispatch, decision capture, audit & review protocols, upstream tracking, production safety… | multi-agent / multi-repo organizations |

---

## What's inside

```
setup/
  INHERITANCE-CONTRACT.md           ← read first: the heir's one-page contract
  ADOPT-DEV-KIT.md                  ← the catalog: 31 pieces (Qué/Cómo/Verificar/Layer)
  ADOPT-CROSS-AGENT-GOVERNANCE.md   ← step-by-step runbook for the agent-governance pieces
  templates/                        ← copy-paste starters (status doc, …)
knowledge/
  ai-agents/                        ← agent collaboration, context layering, orchestration,
                                      skills-over-roles, architecture review, context hygiene…
  methodology/                      ← development process, testing gate & floor, git hygiene,
                                      branch/worktree lifecycle, naming, versioning, audits…
  architecture/                     ← decision capture (ADRs as graph nodes), upstream protocol
tools/                              ← engines (pure Node, zero deps) + their tests + configs
.github/workflows/                  ← the reusable gates (call them from your repo)
doc/decisions/                      ← this repo's own ADRs (it eats its own cooking)
```

23 principle documents ("spines"), 31 catalogued pieces, every engine tested at
the source — consumers never re-test or fork an engine.

---

## The gates that bite (this repo gates itself)

| Gate | What it catches | Where |
|---|---|---|
| **layering smoke** (8 checks) | truncated root rules, contradictory parallel rulebooks, brand names leaking into neutral docs, basic secret patterns | every PR — here and in every consumer that calls the reusable workflow |
| **catalog-sync** | a principle added without its catalog entry; a missing or off-vocabulary Status header; a contract nobody routes to | every PR, producer-side |
| **copy-parity** | a copied runnable drifting from its source — or an adaptation nobody declared | consumer-side (workflow input or pre-commit) |
| **comms security** | secrets in outbound agent-to-agent messages | the governed send path, fail-closed |

A norm without a gate is how governance dies politely. This repo's own
maintenance rule was violated 14 times in a row while it was prose — zero times
since it became a gate. That lesson is baked into everything here.

---

## What this is NOT

- **Not a framework.** It never touches your runtime, build, or app code.
- **Not stack- or vendor-opinionated.** The neutral core names no product, no
  brand, no model vendor — a CI check enforces that.
- **Not all-or-nothing.** Adopt three pieces and declare the rest `PENDING` or
  `N-A` — that's a fully compliant heir.
- **Not a replacement for your judgment.** Pieces are adopted on real pain,
  never for symmetry (that rule is itself part of the kit).

---

## For maintainers (producer side)

- A new agnostic piece (canon, ADR, engine) **must land with its catalog
  section in the same PR** — the `catalog-sync` gate makes that bite.
- Principle docs carry a controlled `Status:` vocabulary (`SEALED / approved /
  CANON / DRAFT / PROPOSED / process protocol / BASELINE`) — also gated.
- Only the named authority seals canon. Sealed = committed + pushed.
- Engines are tested **once, here** (`npm run validate:agent-context`, plus
  each engine's `*.test.mjs`). Consumers call or copy them — never fork.

> **History note:** this repo previously held a v1 "Dev Kit" (stack-detection
> CLI, product UI packages, generated constitutions). That layer was reaped on
> 2026-05-23; the old content remains in git history.

---

## License

MIT — see [LICENSE](LICENSE).
