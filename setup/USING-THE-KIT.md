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
| **A dev joining a repo that already inherits the kit** | understand the rules you're now under | [`knowledge/START-HERE.md`](../knowledge/START-HERE.md) (2-min door) | run **`devkit-doctor`** (the one-command health board) to see what's actually wired |
| **Starting a NEW repo** (or adding the kit to an existing one) | become a declared heir | README → **"Adopt it — the 15-minute path"** | clone the kit as a sibling, create your status doc, wire the layering smoke |
| **An AI agent landing in a repo** | work under the shared method | [`knowledge/START-HERE.md`](../knowledge/START-HERE.md) → the 3 things + hard rules | check your inbox, read the root `AGENTS.md`, declare your scope |
| **A maintainer of the kit itself** | add/seal a piece | README **"For maintainers"** + the model section | land the canon + its catalog piece in one PR; only the Principal Architect seals |

> **If you read one thing first:** the README section **"The model in 90 seconds"** —
> it's the mental model (supra-repo · L1/L2/L3 · inherit by reference vs copy ·
> the seal). Everything below assumes it.

---

## 1.5 Fresh clone vs update — the two entry situations

Two distinct situations, two short recipes. Both keep the kit as a **sibling**
checkout next to your repo (`../_vibethink-dev-kit`) — never vendored inside it.

**A) Fresh clone — you don't have the kit yet (a new machine, or a brand-new repo):**

```bash
# 1. get the kit as a sibling of your repo (read access required — ask the maintainer)
git clone <kit-url> ../_vibethink-dev-kit
# 2. confirm you're on the real default branch
git -C ../_vibethink-dev-kit rev-parse --abbrev-ref HEAD   # expect: master
```
Then follow **§2 (the first hour)**: status doc → wire the layering smoke →
run the doctor.

**B) Update — you already inherit the kit and want the latest law:**

> **One shot:** `node ../_vibethink-dev-kit/tools/devkit-upgrade.mjs` does the whole
> recipe below (pull → re-sync copied runnables → report tool drift). The manual steps
> are kept here so you know what it does. Use `--dry-run` to preview.

```bash
# pull the latest sealed canon + engines (fast-forward only — no local kit edits)
git -C ../_vibethink-dev-kit fetch origin && git -C ../_vibethink-dev-kit merge --ff-only origin/master
```
Because **canon inherits by reference, an update is mostly free** — your rules are
now the latest the moment the kit is pulled; you re-sync nothing. After pulling,
do these three checks (each ~10s):

1. **Copied runnables still match?** → run copy-parity. If a script changed
   upstream, parity goes **red** → re-copy that one file (it's the only thing that
   needs a manual re-copy on update). `node ../_vibethink-dev-kit/tools/check-copy-parity.mjs tools/copy-parity.config.json --upstream-root ../_vibethink-dev-kit`
2. **New pieces to consider?** → skim the catalog tail / the README "rules in plain
   words" for entries above your last adopted number. Adopt one only if you feel its
   pain — never for symmetry. Add a `PENDING`/`N-A` row for each new piece so your
   status doc has no silent gaps.
3. **More than one kit checkout on this machine?** → fast-forward **each** to
   `master` (a stale mount causes *false drift*, not a real problem — see the
   README "repo topology"). Never delete one as a "duplicate".

> **Rule of thumb:** *clone once per machine; pull to update; re-copy only the
> runnables parity flags; declare any new piece.* The law travels by reference — you
> chase it, it doesn't chase you.

> **After an update, see what moved:** `node ../_vibethink-dev-kit/tools/devkit-doctor.mjs --adoption`
> (the inventory lens) shows your pieces (wired / declared-only / N-A) **and** your
> default tools with installed-vs-pin drift — so a stale tool or an undeclared new
> piece is visible, not silent. To move a default tool to its pin, re-run the
> provisioner (below); version-forward of a pin is a deliberate PR to the lock.

---

## 1.6 Command cheat-sheet (what you actually run)

All paths assume the kit is a sibling at `../_vibethink-dev-kit`. Everything here is
**read-only** except the provisioner (installs tools) and `comms-send` (commits).

**See your state (run anytime):**
```bash
node ../_vibethink-dev-kit/tools/devkit-doctor.mjs              # HEALTH — are my gates green? (+ --verbose / --json)
node ../_vibethink-dev-kit/tools/devkit-doctor.mjs --adoption   # INVENTORY — what have I adopted / what tools do I use?
node ../_vibethink-dev-kit/tools/inbox.mjs <you|human>          # your comms inbox
node ../_vibethink-dev-kit/tools/comms-sync.mjs <you|human>     # pull + filtered inbox + "is anything stuck on my machine?"
```

**Default operator tools (graphify, rtk, …):**
```bash
bash ../_vibethink-dev-kit/setup/install-external-tools.sh      # macOS/Linux — install to pin (idempotent, non-blocking)
pwsh  ../_vibethink-dev-kit/setup/install-external-tools.ps1     # Windows
# presence + drift is shown by `devkit-doctor --adoption`; the pins live in setup/external-tools.lock.json
```

**Update to the latest kit (one shot):**
```bash
node ../_vibethink-dev-kit/tools/devkit-upgrade.mjs            # pull --ff-only + re-sync copied runnables + report tool drift
node ../_vibethink-dev-kit/tools/devkit-upgrade.mjs --dry-run  # preview first (it APPLIES by default)
```
It does the §1.5 steps as one command. It does NOT auto-install global tools or move a
pin (that stays an evidence-PR to the lock) — it re-syncs your copied runnables and
prints the exact command for any tool behind its pin.

**Send a governed comm (write path — commits + pushes):**
```bash
node ../_vibethink-dev-kit/tools/comms-send.mjs --to <agent|human> --type <task|finding|note|…> \
  --re "<subject>" --body "<text>"   # safety-scanned, create-only; governance types need --target-layer/--ref-branch
```

**Launch autonomous coders:** follow [`RUNBOOK-LAUNCH-CODERS.md`](RUNBOOK-LAUNCH-CODERS.md);
the per-session permissions instance is [`templates/coder-permissions/`](templates/coder-permissions/)
(broad-allow Bash + airtight deny; the Claude-Code scope is pinned in that folder's
`CLAUDE-CODE-SCOPE.md`).

**Versioning instrument** (apps/packages, so a version can't freeze): the live source +
binding live in [`templates/versioning/`](templates/versioning/); `check-versioning`
verifies a declared model points at a real source. See `CANON-VERSIONING-001`.

---

## 2. The first hour (becoming a real heir, concretely)

> **Shortcut — don't assemble by hand.** Starting a new repo? Copy the bundle in
> [`templates/heir-bootstrap/`](templates/heir-bootstrap/) (AGENTS.md, the two configs,
> the CI workflow, a first-agent prompt), fill the `<slots>`, run the doctor. It's the
> path below, pre-wired.

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
4. **Run the doctor** — `node ../_vibethink-dev-kit/tools/devkit-doctor.mjs` → one
   screen: verdict first, one line per gate, the exact fix for any red (`--verbose`
   for the detail). Green + the contract's 4 boxes = you are *governed*, not just
   claiming it.
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
  (Claude Code users: set up your allowlist safely via [`CLAUDE-CODE-PERMISSIONS.md`](CLAUDE-CODE-PERMISSIONS.md).)
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
