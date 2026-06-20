# CANON-CODER-ORCHESTRATION-001 — Running an autonomous executor without stalling and without crossing the gates

**Status:** SEALED 2026-06-15 by the Principal Architect — fire-tested across a vertical's executor waves (sequential identity/access waves + a fan-out wiring wave), command-hygiene evolved over five iterations from watching real executor sessions.
**Date:** 2026-06-15
**Scope:** Every repo where AI agents ("coders"/executors) run long autonomous sessions under a harness with a **per-command permission gate**. Vendor-neutral, product-neutral, harness-neutral, forge-neutral.
**Home:** the dev-kit (supra-repo). Inherited by every repo as upstream → fork.
**Companion canons:** [`CANON-CODER-SAFE-IDENTITY-001`](./CANON-CODER-SAFE-IDENTITY-001.md) (§8 owns the **permission-scoping policy** — scope the relaxation, guard even in bypass, deny secrets — and §9 the **PREP** launch surface this canon's command hygiene rides on; this canon does **not** restate them) · [`CANON-MULTI-AGENT-ORCHESTRATION`](./CANON-MULTI-AGENT-ORCHESTRATION.md) (§2 the architect↔executor dance, exit-state vocabulary, handoff completeness this canon's gate and wave shape produce) · [`CANON-BRANCH-WORKTREE-LIFECYCLE`](../methodology/CANON-BRANCH-WORKTREE-LIFECYCLE.md) (§5/§7 worktree isolation + one-branch-per-worker + shared-foundation order the wave shape consumes; the `git -C` operation rule §5 already implies) · [`CANON-GIT-HYGIENE`](../methodology/CANON-GIT-HYGIENE.md) (§2/§4 the clean-floor / all-via-PR discipline the executor exits to) · [`CANON-STATE-MIRROR-AND-DECISION-REGISTER-001`](../methodology/CANON-STATE-MIRROR-AND-DECISION-REGISTER-001.md) (the governance instruments the executor reports to but does not own) · [`CANON-SKILLS-OVER-ROLES`](./CANON-SKILLS-OVER-ROLES.md) (PREP and verification are skills, not standing roles).

---

## §1 — Principle

An autonomous executor is only useful if it can run a long session **without stalling on a permission prompt at every step** — and only safe if it **still stops at the gates** that protect identity, destruction, secrets, and sensitive design. Those two goals look opposed; they are not, once you see *why* the prompt fires.

> **The prompt fires not because of risk, but because the command is not statically analyzable.** A per-command gate auto-allows a command only if it can **prefix-match** it against an allowlist. A command that uses variable expansion, a heredoc, a pipe, a loop, a command substitution, or a tool outside the allowlist **cannot be matched** — so it prompts, regardless of how safe it is. Conversely, a genuinely dangerous command that *does* match would be auto-allowed. **Matchability, not danger, is what the auto-allow decides on.**

Two consequences shape this canon:

- **Reducing prompts is a craft of writing matchable commands** (§3–§6), plus an allowlist that covers the routine (the *policy* for which is owned by `CANON-CODER-SAFE-IDENTITY-001` §8).
- **The gates are a separate, deliberate boundary** (§7–§8) — they are *not* a missing allowlist entry to be filled, but lines the executor must not cross: identity change, destruction, secret reads (§7), and writing boundary-class design without review (§8).

---

## §2 — Relationship to the companion spines (no duplication)

| Concern | Owner | This canon |
|---|---|---|
| Permission-scoping **policy** (scope to session not global; guard even in bypass; deny secrets) | **`CANON-CODER-SAFE-IDENTITY-001`** §8 | does **not** restate; §4/§7 reference it for *which* relaxations are legitimate |
| The executor's **identity**, auth gate, per-session credential, PREP launch surface | **`CANON-CODER-SAFE-IDENTITY-001`** §3–§6/§9 | does **not** restate; the launch surface PREP emits is where the allowlist (§4) lives |
| Architect↔executor **dance**, handoff completeness, exit-state vocabulary | **`CANON-MULTI-AGENT-ORCHESTRATION`** §2 | does **not** restate; §8 (design gate) and §9 (wave shape) produce into it |
| **Worktree** isolation, one-branch-per-worker, shared-foundation order | **`CANON-BRANCH-WORKTREE-LIFECYCLE`** §5/§7 | does **not** restate; §6's `git -C` rule and §9's wave shape build on it |
| Clean working floor, **all-via-PR**, pre-push preflight | **`CANON-GIT-HYGIENE`** §2/§4 | does **not** restate; the executor's exit states (§8) resolve to it |
| The **present-mirror / log / decision register** the executor reports to | **`CANON-STATE-MIRROR-AND-DECISION-REGISTER-001`** | does **not** restate; §8 names what the executor may **not** touch (the architect's instruments) |

This canon **owns** what had no agnostic home: the **command-hygiene model** (why the prompt fires + the trigger→fix table paired with clean forms + worked examples), the **design gate** (stop-and-present vs autonomous), the **wave shape** (sequential vs fan-out), and the **expectation-of-use vs gate-of-correction** distinction.

---

## §3 — Why the prompt fires (the two axes)

A per-command gate auto-allows on a literal **prefix-match**. A command escapes the match — and therefore prompts — for one of two reasons:

- **Un-analyzable construction.** The command is not a static literal: it leads with a directory change, a variable assignment, or an env-prefix; it expands a variable (`simple_expansion`); it contains a heredoc, a pipe, a loop, or a command substitution; or it carries a token the parser reads as a glob *even inside quotes*. None of these can be prefix-matched, by design (conservative = safe).
- **Tool outside the allowlist.** The command's tool simply is not listed (a read-only utility the allowlist never covered).

Both are **content/structure** problems, not danger problems. This is why a "don't ask again for `<tool>`" choice often fails to silence a recurring prompt: that choice keys on the **leading tool token**, but the gate flagged the command on its **content** (an expandable string, a glob token, a second statement) — so no prefix rule can cover it (§6).

---

## §4 — The two levers

Reducing prompts has exactly two levers; use both.

- **(a) The prompt teaches the executor to write matchable commands.** The executor's launch prompt carries a "command hygiene" section (the trigger→fix table of §5). This is the lever with no ceiling — a clean command never prompts.
- **(b) The allowlist covers the routine.** The launch surface's per-session settings (emitted by PREP, `CANON-CODER-SAFE-IDENTITY-001` §9) auto-allow the routine work: version control, the package manager, the forge's read/PR commands, read-only shell utilities, and the file tools. The *policy* for how far this may go — **scoped to the session, never global, never committed, with a guard even under bypass** — is owned by `CANON-CODER-SAFE-IDENTITY-001` §8 and is **not** restated here.

> **The allowlist has a ceiling (lever b alone is not enough).** Any expandable, looped, or substituted command falls outside a literal prefix-match by design. When an effort runs on **its own trusted worktrees**, the larger lever is the harness's **bypass mode** for those sessions — but bypass keeps the deny-guard (§7) and, critically, must not dissolve the identity gate (`CANON-CODER-SAFE-IDENTITY-001` §5). The allowlist is the **middle ground**: silent for the routine, still prompting for what changes identity or destroys.

---

## §5 — The trigger→fix table (each anti-pattern paired with its clean form)

> **The iron rule of this table:** a rule that says *"NEVER do X"* without giving *"do Y instead"* is ignored. Every trigger is paired with the clean form that replaces it.

| Trigger (prompts) | Why it cannot be matched | Clean form (do this instead) |
|---|---|---|
| `cd "<dir>" && <cmd>` | leads with `cd`, not the allowlisted token; the gate also flags dir-change-then-command as possible untrusted-hook execution — **no allowlist overrides it** | point the tool at the path with a literal flag (e.g. version control's `-C "<literal-path>"`); the worktree is already the working dir. For non-VC commands needing the worktree, do **not** chain them with VC on one line |
| `name="…"; cmd "$name"` · `VAR=x cmd` · any `$VAR`/`$?`/`$(…)` | variable assignment leads the statement (so the tool token is no longer first) **and** the expansion is not statically resolvable (`simple_expansion`) | put the **literal value in each statement** so every statement starts with the allowlisted token; avoid env-prefix and substitutions in commands you want silent |
| expandable string with an embedded expression (a status-echo like `; "EXIT=$code"` appended after a command) | the gate flags it by **content** (a dynamic expression), not by prefix — so no "don't-ask-again for `<tool>`" can cover it (§6) | omit the status-echo entirely — the runner already reports the exit, and a pipe discards the real one anyway; if a code is truly needed, put it on its **own line without quoting**, or prefer the POSIX shell |
| heredoc `<<'EOF'` · pipe `\| <filter>` · loop · `$(…)` | cannot be analyzed statically as a whole construction | feed a **file** to the tool (e.g. apply SQL with a `-f file` flag, commit with a `-F file` flag) rather than a heredoc; let a long command finish and **read its output with the file tools** instead of piping to a filter |
| recurring loop / health-check (`for …; do … curl …; done`) | loops and substitutions are never prefix-matchable; allowlisting the inner command does not help (the gate evaluates the whole construction) | encapsulate the recurring logic in **one versioned script** at a **stable absolute path**, and allowlist that **exact invocation** — the loop lives inside the script, the gate sees only the call |
| interpreter heredoc to read an API (`<interpreter> - <<'EOF' … EOF`) | an interpreter heredoc is **arbitrary code execution** → always prompts; allowlisting the interpreter would open arbitrary exec | provide a **read-only (GET) CLI client** with auth/base parameterized and allowlist its exact path; mutations stay on the existing governed tool |
| a read-only utility outside the allowlist (a list/inspect command) | simply not listed | add it to the allowlist **only if read-only and safe** (file recon is better done with the harness's file tools, which need no shell at all) |
| glob-like tokens in a string (`<->`, `<N-M>`, `*`, `?`, `[..]`, `{a,b}`) — e.g. inside a commit message | the parser detects them as a **glob even inside quotes** (a numeric-range/character glob), independent of how the tool treats the text | for messages with special characters use **commit-from-file** (a `-F file` flag, covered by the VC allowlist), never an inline message flag; and avoid ASCII glob-like tokens in prose (write words, not `A<->B` / `=>`) |

**Cross-cutting:** prefer the harness's **file tools** (read/edit/write/glob/grep) over shell file utilities — they need no prefix-match at all. Prefer the POSIX shell over a shell whose **expandable strings** turn ordinary status-echoes into dynamic expressions.

---

## §6 — Two worked examples (why "don't ask again" does not always silence it)

These are the two cases that **recurred even after the rule was in the prompt** — included because each teaches a generalization for the table above.

**Example A — a status-echo appended after a pipeline.** A typecheck piped to a "last-N-lines" filter, with a second statement echoing an exit-code expression appended after it, kept prompting.
- *Why the "don't ask again for `<package-manager>`" choice did not silence it:* the command is **not** the package manager alone — it is a pipeline **plus** a second statement containing an expandable string with an embedded expression. The gate flagged it **by content** (the dynamic string), not by leading token → **no prefix allowlist can cover it.**
- *Clean form:* do **not** append the status-echo. The runner already reports the exit; and the pipe to the filter discards the tool's real exit code anyway, so the echo is doubly useless. Run only the command; if the code is genuinely needed, put it on its own line unquoted, or prefer the POSIX shell.
- *Generalization (already in §5):* pair every "NEVER append a status-echo with an embedded expression" with the clean "run only the command."

**Example B — glob-like tokens in a commit message.** A commit whose message body contained a `<->` sequence (meant as "from-A-to-B") prompted with a numeric-range-glob detection.
- *Why:* `<->` **is** a numeric-range glob token to the parser, which detects it as a glob **even inside quotes** and even though the VC tool treats the message as literal text. Same family: `<N-M>`, `*`, `?`, `[..]`, `{a,b}`.
- *Clean form:* multi-line or special-character messages → **commit-from-file** (a `-F file` flag, covered by the VC allowlist), never an inline message flag; and avoid ASCII glob-like tokens in prose (write "A to B" / "derives into", not `A<->B` / `=>`).

> **The shared lesson:** the auto-allow decides on **structure/content**, so the fix is always *change the command's shape*, never *find the right allowlist rule*. And a "NEVER X" rule is only obeyed when paired with the concrete "do Y instead."

---

## §7 — What is NEVER allowlisted (the gates that bite)

The allowlist covers the **routine**; it must **never** cover what changes identity, destroys, or exposes secrets. These stay prompted (or denied) **on purpose** — they are the boundary, not a gap:

- **Identity change** — the forge CLI's login/switch. Auto-allowing it would dissolve the per-session identity gate (`CANON-CODER-SAFE-IDENTITY-001` §5). **Never allowlisted.**
- **Destruction** — recursive delete, force-push, hard reset. **Denied or prompted even under bypass** (the guard of `CANON-CODER-SAFE-IDENTITY-001` §8).
- **Secret reads** — reading secret/credential files. **Denied.**
- **Arbitrary-execution wildcards** — never allowlist an interpreter or a shell with a wildcard (`<interpreter> *`, `<shell> *`, `eval`, remote-shell, a raw forge-API wildcard, a task-runner wildcard). If a recurring script needs one, give it a fixed name and allowlist that **exact** invocation (§5).

This is the same defense-in-depth as `CANON-CODER-SAFE-IDENTITY-001`: the asymmetry contains *any* executor error, hostile or honest. The allowlist is the middle ground chosen over full bypass precisely because full bypass would silence these too.

---

## §8 — The design gate (stop-and-present vs autonomous)

Not every task is equally autonomous. The executor runs free on mechanical work and **stops at one line** for boundary-class work.

| Class of work | Pre-gate | Autonomy | Final verification |
|---|---|---|---|
| **Boundary** (identity, access control, security, sensitive-data handling) | **a design gate**: the executor produces its plan / data-model / task breakdown and **presents them to the coordinator before writing the sensitive code** | proceeds **after** the coordinator's approval | the coordinator verifies the PR against the acceptance criteria; the merge is an authority seal (recorded in the decision register) |
| **Mechanical** (wiring, reports, UI surfaces) | none (a quick canary, then run) | autonomous after the canary | the coordinator verifies the PR; merge delegated |

- **The design gate is not redundant prompting** — it is the **one line the executor does not cross**: writing access-control or sensitive-data logic without the architect's sight. Everything else is autonomous. (This rides on the architect↔executor handoff of `CANON-MULTI-AGENT-ORCHESTRATION` §2.)
- **Realization depends on the execution mode:** an interactive executor stops live and presents; a **non-interactive (headless) executor has no live pause**, so the gate is realized as a **two-phase plan-then-go launch** (plan-only run → human GO → implementation run) — the mechanics are an L3 launch concern (the launch runbook). Either way the invariant holds: **the plan is approved before the sensitive code is written** — never only the draft PR after it.
- **The executor proposes, it does not dispose:** it opens a draft PR, never merges, never self-approves. Merge is the coordinator's (delegated) or the authority's (boundary). It does **not** edit the architect's governance instruments — the present-mirror, the decision register (`CANON-STATE-MIRROR-AND-DECISION-REGISTER-001`); it reports to the coordination channel and may append to the history log.

---

## §9 — Wave shape (sequential vs fan-out)

- **Sequential** — when the pieces **depend** on each other (a later piece consumes an earlier one's contract). One executor at a time, along the dependency spine.
- **Fan-out** — when the pieces are **independent**. N executors in parallel, **one per piece, each in its own worktree**, not coordinating. Dependent executors create their worktree from the **latest integration branch at launch time** so they inherit the merged foundation rather than duplicating it (`CANON-BRANCH-WORKTREE-LIFECYCLE` §7's shared-foundation rule).
- **Rule:** depend → sequential; independent → fan-out.

Before scaffolding any piece, **fetch and re-check the current integration branch and in-flight branches/PRs** in that area — branching from a stale head risks duplicating (and degrading) work another executor already landed.

### §9.1 — The Fan-Out Gate (evaluate the wave, don't leave it to memory) *(SEALED 2026-06-19 by the Principal Architect; from a consumer elevation — the wave was described but not forced, so it depended on an agent remembering, and a human had to push with ready independent units.)*

§9 says *which* shape fits; this gate forces the **evaluation** at the dispatch point — the wave is **chosen, not assumed**. Before launching work as a single sequential thread, the executor/coordinator asks one mandatory question:

> **Are there ≥2 units READY and INDEPENDENT? → fan out by default. If not, name the one blocker.**

A unit joins the wave when **all six** hold: **(1) ready** (its spec/inputs exist, no missing design gate) · **(2) independent** (consumes no in-flight output of another unit in the batch) · **(3) no required order** · **(4) integrated base** (branches from the latest integration head → inherits, not duplicates, §7) · **(5) owner** (an executor has capacity) · **(6) human-cost acceptable** (the parallel review/merge load the authority accepts).

When the test passes, **default to the wave — the human should not have to push for it.** Present it as a decision (the wave + the launch set) and proceed on GO — the same present-the-choice discipline as `CANON-CHANGE-PATH-AND-DECISION-CLASSES-001` §3.1. Sequencing is the **exception** (a real dependency), declared — never the lazy default.

> **Automation is deferred (build-on-pain) — but tracked, not forgotten.** A `fan-out-readiness` check that surfaces candidates **by machine** (each unit declaring a **structured surface**, the check crossing declared surfaces for independence — prose-mining is fragile, the pilot found) is this gate's **level-3 automation**. **Build it when this manual gate demonstrably fails** (ready, independent units still missed despite §9.1). It is registered with that trigger in `doc/DEFERRED-INSTRUMENTS.md`; until the trigger fires, the manual gate is the floor.

---

## §10 — Expectation-of-use vs gate-of-correction

A tooling expectation ("use this by default when provisioned") is **not** the same as a correctness gate ("CI fails without it"). Keep them separate:

- **Use-by-default (diligence):** when a tool is provisioned, the executor uses it by default; if the environment cannot provide it, the executor proceeds **without** it and **documents why** (never a silent skip).
- **Gate-of-correction (prohibition):** a required CI/merge check. A use-expectation must **not** be hardened into a required gate unless deliberately decided as one.

Conflating the two turns a helpful default into a brittle blocker. The decision to promote a default into a gate is an authority decision (decision register).

---

## §11 — L3 binding (what the consuming repo owns)

- the **concrete allowlist** content (which tools, which read-only utilities) and the **per-session settings** file the launch surface emits — within the §7 boundary and the policy of `CANON-CODER-SAFE-IDENTITY-001` §8.
- the **launch prompt** text (including its command-hygiene section, §4a) and the **per-spec** prompts.
- which spec **classes** are boundary vs mechanical (§8), and the repo's **design-gate** convention.
- the **stable absolute path** for shared scripts (§5) and the **read-only CLI client** for API reads.
- the **canary** definition for mechanical work and the **acceptance-criteria** verification convention.

The L3 binding **points at this canon as the spine**; it does not re-derive why the prompt fires, the trigger→fix forms, the gate, or the wave shape. If it repeats them, it drifts.

---

## §12 — What this canon does NOT do

- It does **NOT** own the permission-scoping **policy**, the identity model, the auth gate, or PREP — those are `CANON-CODER-SAFE-IDENTITY-001`.
- It does **NOT** own the architect↔executor **dance**, handoff completeness, or exit-state vocabulary — that is `CANON-MULTI-AGENT-ORCHESTRATION`.
- It does **NOT** own **worktree** lifecycle mechanics — that is `CANON-BRANCH-WORKTREE-LIFECYCLE`.
- It does **NOT** own **all-via-PR** / session hygiene — that is `CANON-GIT-HYGIENE`.
- It does **NOT** own the **governance instruments** — those are `CANON-STATE-MIRROR-AND-DECISION-REGISTER-001`.
- It does **NOT** name the harness, the forge, the shell, the package manager, or any tool — all L3.

---

## Provenance

Assembled from the command-hygiene findings sealed 2026-06-13 (F1–F9) and the executor-orchestration practice matured across a vertical's delivery waves. The command hygiene evolved over five iterations, each forced by watching real executor sessions stall on a prompt (Rule: build on real pain):

- a `cd`-then-VC chain prompting on every operation → the `git -C` row + the dir-change trigger (§5);
- variable/env-prefixed commands never auto-allowed → the literal-value row (§5);
- an expandable status-echo that no "don't-ask-again" could silence → Example A (§6);
- a numeric-range glob token in a commit message, detected even inside quotes → Example B (§6);
- recurring health-check loops and interpreter heredocs → the script-with-stable-path and read-only-CLI rows (§5);
- the recurring need to keep identity/destruction/secrets prompted while silencing the routine → the gates (§7) and the two-lever model (§4);
- boundary work (access control over sensitive data) that must not be written unseen → the design gate (§8).

**Coverage-check:** the command-hygiene findings doc (sealed 2026-06-13) proposed a "Command Hygiene §" in `CANON-MULTI-AGENT-ORCHESTRATION` and an amendment to `CANON-BRANCH-WORKTREE-LIFECYCLE`; that canonization was never executed. This canon is the **consolidated home** — it keeps command hygiene, the design gate, and the wave shape together, references the companion spines rather than splitting the material across them, and supersedes the findings doc's *suggested* destination (the finding's disposition is updated to point here). `CANON-CODER-SAFE-IDENTITY-001` already owned the identity model and the permission-scoping *policy*; this canon owns the *craft* of writing matchable commands and the orchestration shape, and references §8 rather than restating it.

**Fire-test:** vendor/product/agent/tool/forge-neutral — names no product, vendor, agent harness, shell, package manager, or forge. PASS.

**SEALED 2026-06-15 by the Principal Architect (merge = seal).**
