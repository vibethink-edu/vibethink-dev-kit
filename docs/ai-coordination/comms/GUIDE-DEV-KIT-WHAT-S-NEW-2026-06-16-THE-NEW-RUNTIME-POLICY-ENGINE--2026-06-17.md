---
type: guide
from: claude
to_agent: rodrigo
to: Rodrigo
repo: vibethink-dev-kit
status: open
needs: agent
priority: normal
date: 2026-06-17
re: dev-kit: what's new (2026-06-16) + the new runtime-policy-engine canon
---
# Dev-kit — what's new (2026-06-16) + the new canon — for Rodrigo

## The dev-kit in one line
The governance layer **above** all our products (ViTo / WorkBench / Campus): agnostic
rules + shared tools that each repo **inherits**, instead of each one reinventing them.
Markdown + CLI, no runtime. Mental model: **constitution + shared toolbox**.

---

## What changed YESTERDAY (2026-06-16) — three blocks

### 1) Self-service tools (this is your daily loop)
- **`devkit-upgrade` (NEW)** → one command: `pull --ff-only` + re-sync the copied tools +
  install any missing tools (pin-respecting) + report drift. The "get me to the latest kit"
  in one shot. → `node tools/devkit-upgrade.mjs`
- **`devkit-doctor --adoption` (NEW)** → inventory: which pieces you've inherited.
- **`devkit-doctor`** → fix: now finds the status-doc at `doc/` (singular), not only `docs/`.
- **`USING-THE-KIT.md` §1.6** → a developer command cheat-sheet.
- *Your green `devkit-upgrade` run on macOS closes issue #123 (test coverage of the shell/PS
  tools on Mac — you're the kit's first non-Windows heir).*

### 2) New instruments (a rule + a copyable template + a gate that enforces it)
- **Versioning** (`setup/templates/versioning/` + `check-versioning`): how to version apps/
  packages, with a gate that catches a "frozen version". (D-005)
- **Feature-docs** (`setup/templates/feature-docs/` + `check-feature-docs`): every feature is
  documented the same way (requirements / plan / roadmap / log + finding), enforced by a gate. (D-008)
- **Coder-permissions** (`setup/templates/coder-permissions/`): how to launch coders without
  stalling at every prompt, with an airtight deny (identity / destruction / secrets). (D-006)
- Common idea: *"a policy without a mechanism is illusion"* → now each rule **bites**.

### 3) New canon + onboarding
- **NEW canon: runtime-policy-engine** (catalog piece **#40**) — see below.
- **§5.7** — verify references **before** moving/renaming a file (anti-break-refs).
- **NEW glossary** (`knowledge/GLOSSARY.md`) — any term (L1/L2/L3, instrument, gate) in one place.

> Full, auditable detail: `doc/decisions/DECISION-REGISTER.md` (D-005 → D-010).

---

## The new canon, explained: the "bouncer" (runtime-policy-engine)

`CANON-RUNTIME-POLICY-ENGINE-001` (piece #40) names a pattern: a **bouncer at runtime**.

**What it is, plain:** a bouncer between the agent and what it's about to do. At defined
moments (before a tool runs, before the model call) it says **ALLOW / ASK / DENY** — and it
**remembers** things (budget spent, accumulated risk).

**Why it's new (vs what you saw):** yesterday's `coder-permissions` deny-list is **static**
— it blocks command shapes (`rm -rf`, force-push). The bouncer is its **live sibling**: it
sees the whole session + context.
- static deny-list = the fixed harness floor
- runtime bouncer = the smart membrane on top (with memory + ASK)

**3 examples of how it decides:**
- An agent burns budget on an expensive model tier → **DENY** "switch to a cheaper tier".
- A session keeps accumulating risky actions → **ASK** before the next one.
- A tool is about to send personal data to the model → **ALLOW** but redacts it.

**The key thing (don't worry):**
1. The dev-kit **only names the pattern** (the blueprint + 6 worked examples in §11). It runs nothing.
2. The **engine is built by each product** (ViTo / WB) in code, **when it hurts** — not preemptive. "Build-on-pain."
3. It came from studying an OSS project (omnigent), but we **don't depend on it** — we read the idea and wrote our own, agnostic.

Read it: `knowledge/ai-agents/CANON-RUNTIME-POLICY-ENGINE-001.md` (§11 = the concrete cases).

---

## Where to start (in this order, ~5 min)
1. `knowledge/START-HERE.md` — the door (how we work, in 2 min)
2. `knowledge/GLOSSARY.md` — any term you don't know (L1/L2/L3, instrument, gate…)
3. `setup/USING-THE-KIT.md` — how to adopt it in your repo, with an example
4. Run `node tools/devkit-upgrade.mjs` then `node tools/devkit-doctor.mjs` — sync + self-check.

**Summary:** yesterday the kit went from "rules as prose you ignore" → "rules with an
instrument + a gate + self-service tools to self-diagnose and update yourself." The bouncer
canon is the one *design pattern* (a blueprint for later), distinct from the *instruments*
(ready to use now).
