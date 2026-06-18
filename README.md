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
| *"Where was the rule about X written?"* | one **catalog** (37 pieces, each with *what you inherit · how · how to verify*) and a **one-page contract** — no archaeology across scattered docs. |
| *"What did we actually adopt, and what did we skip?"* | your repo carries a **status doc** with a strict vocabulary, and a validator rejects vague claims — adoption is declared, never folklore. |
| *"Can we deviate without breaking the model?"* | yes — the contract's **override clause**: declare the rule, your replacement, the reason. Visible deviation is legitimate; silent deviation is the only sin. |
| *"Did someone paste a secret into an agent-to-agent message?"* | the **comms security gate** scans every outbound message fail-closed before it ever travels. |
| *"How do I start a new repo with the same standards?"* | the 15-minute path below — and the new repo inherits future rule improvements automatically, because it points at the source instead of holding a copy. |
| *"Our docs say one thing and reality does another…"* | norms here ship **with their enforcement** — a rule that can't bite is treated as a defect of the kit itself (it's how this repo audits *itself*). |
| *"We switched IDE or model — do our rules still hold?"* | adapters are one-line pointers to a single root, verified on every PR; the neutral core names no vendor, so switching costs nothing. |

---

## The model in 90 seconds — what "supra" means here

This kit is a **supra-repo**: the governance layer that sits *above* every product
and repo you run. Your repos are **heirs** — they **point up** at the kit; they
don't copy it. If you only read one section, read this — it's the part people
(maintainers included) most often mix up.

**Three layers — who owns what:**

| Layer | What it is | Where it lives | Example |
|---|---|---|---|
| **L1 — neutral canon** | vendor/product-neutral law (naming, git hygiene, testing, orchestration…) | **here**, `knowledge/` | *"keep an append-only log of decisions"* |
| **L2 — house binding** | the kit owner's concrete instantiation of an L1 skeleton | **here**, marked L2 (e.g. VT-Method binds the L1 development process) | *"the gate questions are A–G"* |
| **L3 — consumer instantiation** | the concrete file names, accounts, thresholds a product fills in | **in that product's repo — never here** | *"our log is `ORCHESTRATION-LOG.md`"* |

> A canon prescribes the *role*; your repo picks the *name/value*. The canon says
> **what** and **why**; L3 binds the **which file / which account / which threshold**.

**Two ways things inherit — and they are different on purpose:**

- **Canon & docs → by reference.** Your repo *points* at the kit's doc; it never
  holds a copy. A copied canon is a second truth that rots. **Canon is NOT
  copy-parity-tracked** — adding a new canon needs no consumer change; heirs read it
  in place.
- **Runnables (scripts) → by verbatim copy + the copy-parity gate.** A script must
  run without the kit mounted, so it's copied — and the drift guard proves the copy
  still matches its source.

**How a rule becomes law — the seal:** a new canon lands as **DRAFT/proposed**. It
must be registered as a **piece** in the catalog ([`setup/ADOPT-DEV-KIT.md`](setup/ADOPT-DEV-KIT.md))
or the `catalog-sync` gate stays **red** (an uncatalogued law is the failure this
gate exists for). **Only the Principal Architect seals — and *merge = seal*:** when
the PR merges, the canon's status flips to `SEALED` and it becomes an adoptable
piece. No contributor (human or agent) widens the law alone; an agent can't even
loosen its own permission gates — the same least-privilege rule the canon preaches.

**A canon vs a piece vs a template:** the **canon** (`knowledge/CANON-*.md`) is the
law; the **piece** (a numbered section in `ADOPT-DEV-KIT.md`) is its adoptable entry
(*what you inherit · how · how to verify*); a **template/skeleton**
(`setup/templates/…`) is a copy-and-rename starter for the L3 instance.

> **Now — how do you actually *use* it?** → **[`setup/USING-THE-KIT.md`](setup/USING-THE-KIT.md)**:
> the adoption on-ramp that routes you by who you are (new dev · new repo · agent ·
> maintainer), with a worked example and the daily loop. A kit dies from
> *non-adoption*, not bad rules — that file is the antidote.

> **Want to *see* it?** → **[`knowledge/SUPRA-MAP.md`](knowledge/SUPRA-MAP.md)**: the canon
> constellation as one rendered diagram — every spine, grouped by domain, with the
> relationships each declares. Auto-generated (`tools/graph-canon.mjs`), kept fresh by CI.

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
| 34 | State mirror & decision register | Three governance instruments: a **present-mirror** (state on one page; if it's stale, reality wins), an **append-only log** (history), and a **decision register** (who authorized what, when, through which channel, with what evidence — distinct from the ADR). |
| 35 | Coder safe identity | An autonomous coder pushes as a **low-privilege bot** (propose-only, can't merge or bypass); a separate owner reviews and merges; they never share a credential in one session. The lock is real only if the executor is on the wrong side of it. |
| 36 | Coder orchestration | Run a coder long and autonomous **without stalling on permission prompts** (the prompt fires on matchability, not danger) **and without crossing the gates** (identity / destruction / secrets stay gated; boundary work presents its design first). |

### 🌿 Git and the lifecycle of work

| # | Rule | In one line |
|---|---|---|
| 22 | Git hygiene | Never start on a dirty tree; everything merges via PR; no silent hook-bypass; no junk at the repo root. |
| 23 | Branch & worktree lifecycle | Every branch is born through a gate and dies through a gate; 1 task = 1 unique branch; the main worktree is read-only; cleanup right after merge (squash-blindspot aware). |
| 4 | Session closeout + scan | Every branch touched ends declared: PUSHED / READY-PR / DISCARDED — and a scan hunts what was left hanging. |
| 7 | Paused work lifecycle | Paused work is either declared-with-intent or reapable after N days — nothing floats forever. |
| 10a | Development process (universal skeleton) | Governance precedes code: slice → decision gate → spec → governed execution → artifacts; **the plan carries a security section**; **suppressing a gate = a registered, expiring exemption**. |
| 10b | House methodology (L2 binding) | The kit owner's concrete instantiation of the skeleton (gate questions, spec pipeline). Non-house repos: declare N-A and bind 10a natively. |
| 37 | Change-path & decision classes | Two questions every change answers up front: **which path** (direct / spec-first / design-gate) and **whose approval** (authority-sealed / delegated-with-record / autonomous). Kills the "do I just do it, or spec it, or ask?" guesswork — and canon changes are always authority-sealed. |

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

> **Using Claude Code and tired of approving routine commands?** The harness adapter
> [`setup/CLAUDE-CODE-PERMISSIONS.md`](setup/CLAUDE-CODE-PERMISSIONS.md) shows how to
> set up your `settings.json` allowlist safely — and what to **never** allowlist
> (identity / destruction / secrets stay gated). It binds the agnostic allowlist-vs-gate
> canon to one harness; other harnesses apply the same principle to their own config.

**Any model, any vendor.** The neutral core names no model vendor — a CI check
enforces it. Swap models or providers tomorrow; your governance doesn't notice.

**Any platform.** The engines are pure Node (zero dependencies). Requirements:
Node 20+, git, and bash (for the optional shell helpers).

**Platform compatibility:**

| OS | Status | Evidence |
|---|---|---|
| **Linux** | ✅ Validated | the kit's own CI runs every engine on each PR |
| **Windows** | ✅ Validated | a consuming repo runs them daily |
| **macOS** | ✅ Validated | first Mac heir ran `devkit-upgrade` / `devkit-doctor` green (2026-06-17); the `.sh` parse-smoke now runs in CI (`shell-smoke.test.mjs`) |

> The core is cross-platform by construction (pure Node, `node:path`, LF/CRLF-neutral);
> the only OS-specific surface is the optional bash/PowerShell helper scripts. All three
> rows are **validated in practice** (Windows daily, macOS by the first heir's green run);
> CI itself runs Linux-only, so the `.sh` parse-smoke runs there while the `.ps1` path is
> exercised by hand — a Windows/macOS CI **runner matrix is deferred** (build-on-pain) and
> re-opened on report (issue #123 disposition).

---

## Adopt it in your repo — the 15-minute path

0. **Get the kit.** You need read access to this repo (it is currently
   private/invite-only — ask the maintainer). Then clone it **as a sibling** of
   your repo (`git clone <kit-url> ../_vibethink-dev-kit`): docs are read from
   there by reference, local guards find it there, and CI fetches it via the
   reusable workflow — nothing of the kit is vendored into your repo.
1. **Read the contract** (one page): [`setup/INHERITANCE-CONTRACT.md`](setup/INHERITANCE-CONTRACT.md)
   — how inheritance behaves: docs by reference · runnables by copy+parity ·
   declare everything · override visibly · never duplicate.
2. **Create your status doc** — copy
   [`setup/templates/DEV_KIT_INHERITANCE_STATUS.template.md`](setup/templates/DEV_KIT_INHERITANCE_STATUS.template.md)
   into your repo (suggested: `docs/DEV_KIT_INHERITANCE_STATUS.md`). It comes
   pre-filled with every catalog piece as `PENDING` — flip rows as you adopt.
   `N-A(reason)` is a perfectly good answer; silence is not.

   > **Greenfield repo (no rulebook yet)?** Create a root `AGENTS.md` with one
   > line — *"This repo inherits the universal root authority:
   > `<kit>/knowledge/ai-agents/AGENTS_UNIVERSAL.md` — rules below extend it,
   > never replace it"* — plus your repo-specific rules. Add a one-line
   > `CLAUDE.md` / `CODEX.md` / `.cursorrules` per agent you use, each pointing
   > at `AGENTS.md` (per-tool map: [`knowledge/ai-agents/AI_AGENT_COMPATIBILITY.md`](knowledge/ai-agents/AI_AGENT_COMPATIBILITY.md)).
3. **Wire your first gate** — the layering smoke, via the reusable workflow
   (no engine copied):

   ```yaml
   # .github/workflows/agent-context.yml (in YOUR repo)
   jobs:
     agent-context:
       uses: vibethink-edu/vibethink-dev-kit/.github/workflows/agent-context.yml@master
       with:
         config-path: tools/agent-context.config.json
   ```

   and declare your `tools/agent-context.config.json`. Minimal working example
   (edit the file names to yours):

   ```json
   {
     "rootRulesFile": "AGENTS.md",
     "canonFile": "../_vibethink-dev-kit/knowledge/ai-agents/CANON-CROSS-AGENT-CONTEXT-LAYERING.md",
     "agentsDir": ".",
     "agentBudgets": { "codex": 32768, "copilot": 32768, "windsurf": 32768, "claude": 1000000 },
     "adapters": [{ "agent": "claude", "file": "CLAUDE.md" }],
     "maxAdapterBytes": 6144,
     "requiredAnchorsInRoot": ["AGENTS_UNIVERSAL"]
   }
   ```

   Full field reference: [`setup/ADOPT-CROSS-AGENT-GOVERNANCE.md`](setup/ADOPT-CROSS-AGENT-GOVERNANCE.md).
4. **Run it** — `node ../_vibethink-dev-kit/tools/check-agent-context.mjs tools/agent-context.config.json`
   locally, or push and let CI run it. Expect: `GREEN — cross-agent layering holds`.
5. **Done — you're a declared heir.** Walk the catalog
   ([`setup/ADOPT-DEV-KIT.md`](setup/ADOPT-DEV-KIT.md)) at your own pace and
   adopt further pieces **when you feel the pain they solve** — never for
   symmetry.

---

## Am I actually governed? — one command

Saying "we inherit the kit" is a claim; this makes it a fact. **One command, one
screen** — verdict first, one line per gate, the exact fix for every red. Run it
from your repo's root (kit cloned as sibling):

```bash
node ../_vibethink-dev-kit/tools/devkit-doctor.mjs
```
```
  Dev-Kit Doctor · my-repo
  ──────────────────────────────────────────────────
  ✅ GREEN — 3/3 gates pass, nothing to fix
    ✓ cross-agent layering      all agents read the same intact rules
    ✓ copy-parity               every declared copy is in parity
    ✓ adoption claims honest    every catalog piece has an honest row
  skipped (no config here): no tenant contamination
```
Each gate runs only if its config exists in your repo (others are **skipped, never
silently absent**). A red prints the exact fix. Need the detail? `--verbose` streams
every gate's full output; `--json` is the CI-friendly form. Exit 0 = all green.

> **Under the hood** (the doctor just runs these for you — call them directly to debug
> one gate): `check-agent-context.mjs` (layering) · `check-copy-parity.mjs --upstream-root
> ../_vibethink-dev-kit` (copied runnables) · `check-inheritance-claims.mjs
> docs/DEV_KIT_INHERITANCE_STATUS.md` (claims) · `check-catalog-sync.mjs` (producer-side).

And four questions no script can answer for you (the contract's human half):

- [ ] Status doc exists and covers the **full** catalog — no silent skips.
- [ ] **Zero copied docs** from the kit in your tree (pointers only — a copied
      canon is a second truth that rots).
- [ ] Every deviation lives in an `## Overrides` entry or an `adapted`
      declaration — nothing diverges silently.
- [ ] The checks above run in **CI or a hook**, not only when someone remembers.

All green + four boxes ticked = governed. Anything else = you know precisely
what's missing — which is already better than believing you're governed.

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
  USING-THE-KIT.md                  ← the adoption on-ramp: who you are → how to use it
  INHERITANCE-CONTRACT.md           ← read first: the heir's one-page contract
  ADOPT-DEV-KIT.md                  ← the catalog: 37 pieces (Qué/Cómo/Verificar/Layer)
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

30 principle documents ("spines"), 37 catalogued pieces, every engine tested at
the source — consumers never re-test or fork an engine. (`ADOPT-DEV-KIT.md` is the
source of truth for the piece count — the `catalog-sync` gate keeps it honest.)

---

## The kit's own repo topology — don't delete a "duplicate" checkout

A subtle one that bites even maintainers: on one machine the kit may be **checked
out more than once — and that's by design, not clutter.** Each heir's copy-parity
resolves the kit as a **sibling** (e.g. `../_vibethink-dev-kit`), but heirs sit at
**different directory depths**, so each needs the sibling at *its* level. In this
family, for example, a top-level checkout (`_vibethink-dev-kit`) is the mount for a
top-level consumer, while a checkout nested one level down is the mount for a nested
consumer. **Both are load-bearing.**

- **Don't delete one as a "phantom duplicate."** Removing a consumer's mount breaks
  its drift guard — copy-parity fails closed (`upstreamRoot must exist`).
- **A stale checkout is not a phantom — it's just behind.** The symptom (false drift,
  or a tool that "isn't there") is fixed by syncing, not deleting:
  `git -C <checkout> fetch origin && git -C <checkout> merge --ff-only origin/master`.
- **Rule:** keep *every* checkout fast-forward-synced to `master`; consolidate to one
  only after repointing each consumer's `upstreamRoot` first.

---

## The gates that bite (this repo gates itself)

| Gate | What it catches | Where |
|---|---|---|
| **layering smoke** (8 checks) | truncated root rules, contradictory parallel rulebooks, brand names leaking into neutral docs, basic secret patterns | every PR — here and in every consumer that calls the reusable workflow |
| **catalog-sync** | a principle added without its catalog entry; a missing or off-vocabulary Status header; a contract nobody routes to | every PR, producer-side |
| **copy-parity** | a copied runnable drifting from its source — or an adaptation nobody declared | consumer-side (workflow input or pre-commit) |
| **comms security** | secrets in outbound agent-to-agent messages | the governed send path, fail-closed |
| **governance gate** | a declared governance instrument (mirror/log/register) that's missing or empty, or an undeclared decision-class binding (the "no silent default" rule) | `devkit-doctor` + the engine-tests CI job (config-driven; skips if not adopted) |
| **canon cross-references** | a markdown link to a missing file, or a "Piece #N" with no such catalog piece — link-rot across the canon web | `devkit-doctor` + CI (producer-side; scans `knowledge/` + `setup/`) |
| **tool versions** | a wired tool with no declared version (or a stale/malformed entry) in `tools/versions.json` — CANON-VERSIONING-001 §6 | `devkit-doctor` + CI (producer-side) |

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
  section in the same PR** — the `catalog-sync` gate makes that bite. (A DRAFT
  canon may instead carry a **declared exemption** in `tools/catalog-sync.config.json`
  until it's sealed; the exemption is removed and the piece added *at* the seal.)
- Principle docs carry a controlled `Status:` vocabulary (`SEALED / approved /
  CANON / DRAFT / PROPOSED / process protocol / BASELINE`) — also gated.
- **The seal flow:** a canon lands `proposed/DRAFT` → on approval, the same PR flips
  its status to `SEALED`, removes any exemption, and registers its catalog piece.
  **Only the Principal Architect seals, and *merge = seal*.** No one — human or
  agent — widens the law alone; the harness even refuses to let an agent loosen its
  own permission gates on a vague instruction (a human adds the rule explicitly).
- Sealed = committed + pushed (immutable).
- Engines are tested **once, here** (`npm run validate:agent-context`, plus
  each engine's `*.test.mjs`). Consumers call or copy them — never fork.

> **History note:** this repo previously held a v1 "Dev Kit" (stack-detection
> CLI, product UI packages, generated constitutions). That layer was reaped on
> 2026-05-23; the old content remains in git history.

---

## License

MIT — see [LICENSE](LICENSE).
