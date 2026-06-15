# Using the kit — the adoption on-ramp (start here to actually *use* it)

> **Why this file exists.** The kit's biggest risk isn't a bad rule — it's **no
> adoption**: impeccable governance nobody knows how to *use*. The README tells you
> *what* and *why*; the catalog ([`ADOPT-DEV-KIT.md`](ADOPT-DEV-KIT.md)) is the
> reference; the contract ([`INHERITANCE-CONTRACT.md`](INHERITANCE-CONTRACT.md)) is
> the rules. **This file is the on-ramp:** who you are → your exact path → a worked
> example → how you live with it day to day. Read the 3 lines for *your* row and go.

---

## 1. Who are you? (read only your row)

| You are… | Your goal | Start here | First move |
|---|---|---|---|
| **A dev joining a repo that already inherits the kit** | understand the rules you're now under | [`knowledge/START-HERE.md`](../knowledge/START-HERE.md) (2-min door) | run the **60-second self-test** (README) to see what's actually wired |
| **Starting a NEW repo** (or adding the kit to an existing one) | become a declared heir | README → **"Adopt it — the 15-minute path"** | clone the kit as a sibling, create your status doc, wire the layering smoke |
| **An AI agent landing in a repo** | work under the shared method | [`knowledge/START-HERE.md`](../knowledge/START-HERE.md) → the 3 things + hard rules | check your inbox, read the root `AGENTS.md`, declare your scope |
| **A maintainer of the kit itself** | add/seal a piece | README **"For maintainers"** + the model section | land the canon + its catalog piece in one PR; only the Principal Architect seals |

> **If you read one thing first:** the README section **"The model in 90 seconds"** —
> it's the mental model (supra-repo · L1/L2/L3 · inherit by reference vs copy ·
> the seal). Everything below assumes it.

---

## 2. The first hour (becoming a real heir, concretely)

This is the **15-minute path** from the README, expanded with what each step *gets
you* — do them in order; stop when you've got value, not when you've done all 37.

1. **Mount the kit as a sibling** (`git clone <kit-url> ../_vibethink-dev-kit`).
   → Now docs resolve by reference and local guards find the kit. Nothing is copied
   into your repo.
2. **Create your status doc** from `setup/templates/DEV_KIT_INHERITANCE_STATUS.template.md`.
   → It lists *every* piece as `PENDING`. This is your adoption ledger — flip rows as
   you go. `N-A(reason)` is a complete answer; **silence is the only wrong one.**
3. **Wire the first gate** (the cross-agent layering smoke, via the reusable
   workflow — no engine copied). → Now a robot proves, on every PR, that all your
   agents read the same intact root rules.
4. **Run the 60-second self-test** (README). → Every red line names exactly what to
   fix. Green + the contract's 4 boxes = you are *governed*, not just claiming it.
5. **Adopt further pieces only when you feel the pain they solve** — never for
   symmetry. The catalog is a menu, not a checklist to clear.

> **Adoption is incremental and legitimate at any depth.** Three pieces adopted +
> the rest honestly `PENDING`/`N-A` is a fully compliant heir. The tiers
> (Minimum / Standard / Full) in the README tell you sensible stopping points.

---

## 3. A worked example — adopt AND use one piece end-to-end

Telling isn't showing. Here is one piece, from "I have the pain" to "it's part of
my daily loop." (Generic on purpose — substitute your repo's real names.)

**The pain:** a teammate's change broke logic that had no test; you found out in
production. → that's exactly **Piece #15, Testing minimum bar.**

1. **Read its catalog entry** (`ADOPT-DEV-KIT.md` → Piece #15): *Qué* (every new
   function with logic carries 1 happy-path + 1 failure test, same PR; the toolchain
   must be *alive* — an orphaned runner is a fake green), *Cómo*, *Verificar*.
2. **Bind the L3 specifics:** which dirs are in scope, which test runner you use.
   (The canon says *what*; you bind *which tool*.)
3. **Flip the status-doc row** #15 from `PENDING` → `ADOPTED`, noting the runner +
   in-scope dirs.
4. **Use it (the daily part):** from now, every PR that adds logic carries its two
   tests; review rejects the PR if it doesn't; the verification in the catalog entry
   is the thing a reviewer checks. The *rule* is now a *habit your gates enforce* —
   which is the whole point. A norm without a gate dies politely.

That loop — *feel the pain → read Qué/Cómo/Verificar → bind L3 → declare → let the
gate enforce it* — is the same for **every** piece. Once you've done it once, you've
done all 37.

---

## 4. The daily loop (what using it actually feels like)

Once adopted, the kit is mostly invisible — it shows up at these moments:

- **Session start (agents):** check the inbox (`inbox <you>`) — Piece #3.
- **Before code:** pass the decision gate; pick the **change path** (direct /
  spec-first / design-gate) and its **decision class** — Pieces #10a / #37.
- **While working:** clean tree, one branch per task, `git -C` not `cd && git`,
  matchable commands so the permission gate doesn't stall you — Pieces #22 / #23 / #36.
- **On every PR:** the gates run (layering smoke, copy-parity, catalog-sync,
  comms-security) — green or they name what to fix.
- **At session close:** declare each branch (PUSHED / READY-PR / DISCARDED), update
  the present-mirror + log, add a decision-register row if an authority approved
  something — Pieces #4 / #34.
- **When you deviate:** write the `## Overrides` entry — visible deviation is
  legitimate; silent is the only sin.

---

## 5. Why kits die without adoption — and the antidotes baked in here

If you've seen a "standards repo" rot, it failed one of these. The kit is designed
against each:

| Failure mode | Antidote in this kit |
|---|---|
| **"I don't know where to start."** | this on-ramp's persona router (§1) + the 15-min path |
| **"37 rules, all-or-nothing, so I adopt none."** | incremental adoption; `N-A(reason)` is valid; tiers give stopping points |
| **"We copied the docs and they went stale."** | docs inherit **by reference**, never copied; a copied canon is a flagged anti-pattern |
| **"We said we adopted it but nobody really did."** | the status doc + a claims validator + the 60-second self-test turn the claim into a checkable fact |
| **"The rule was written but never enforced."** | every piece ships **with its gate**; a rule that can't bite is treated as a defect of the kit |
| **"Nobody knew the rule changed."** | inherit by reference → improvements arrive automatically; you never re-sync a doc |

> **The one-sentence test of adoption:** *can a robot (or the 60-second self-test)
> prove you're governed, without anyone's memory?* If yes, it's adopted. If it lives
> only in someone's good intentions, it isn't — and that's the death this file fights.

---

## Where to go next

- **The mental model:** README → "The model in 90 seconds".
- **The rules of inheritance:** [`INHERITANCE-CONTRACT.md`](INHERITANCE-CONTRACT.md).
- **The full menu:** [`ADOPT-DEV-KIT.md`](ADOPT-DEV-KIT.md) (37 pieces, each Qué/Cómo/Verificar).
- **Agent-governance detail:** [`ADOPT-CROSS-AGENT-GOVERNANCE.md`](ADOPT-CROSS-AGENT-GOVERNANCE.md).
- **Operational how-tos:** [`RUNBOOK-NEW-MACHINE-BOOTSTRAP.md`](RUNBOOK-NEW-MACHINE-BOOTSTRAP.md) · [`RUNBOOK-LAUNCH-CODERS.md`](RUNBOOK-LAUNCH-CODERS.md).
