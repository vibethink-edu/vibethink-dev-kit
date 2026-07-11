# REFERENCE-OPERATOR-COMMAND-CATALOG — agnostic operator commands for agents

**Status:** **SEALED 2026-07-01 by the named authority** — the **rules** (§2) are binding; the catalog set (§4) is a curated reference. Adapter examples ship as optional templates (`setup/templates/operator-command-expanders/`). **v2 amendment DRAFT 2026-07-10 (D-065) — pending seal** (rules 8–12, the §5.1 gate, four new commands; see §7).
**Date:** 2026-07-01 (v2 amendment 2026-07-10)
**Scope:** Any repo where a human operator drives agents through short, repeatable operational asks. Vendor-neutral, product-neutral, tool-neutral, language-neutral.
**Home:** the dev-kit (supra-repo). Inherited by every repo as upstream → fork.
**Companion:** binds the operator surface to existing spine — `CANON-GIT-HYGIENE §2.6` (actionable close-out), the evidence discipline in `REVIEW-READINESS-PROTOCOL` / `REVIEW-CALL-CHECKLIST`, `CANON-AGENT-COLLABORATION` (one-shot / no persistent-mode drift), `CANON-MULTI-AGENT-ORCHESTRATION §2.2/§2.3` (closeout + handoff). This reference does **not** re-derive them; each command **points** at its governing canon.

---

## §0 — What this is (and is not)

An **operator command** is a short trigger (e.g. `:repo-health`) that expands into a **stable, one-shot prompt** asking an agent for a common operational task with a known output contract. The reusable artifact is **the catalog** — command id, intent, output contract, evidence rules, aliases, related commands — **not** any one expander tool. Espanso, VS Code snippets, Raycast, Alfred, TextExpander are **adapters**.

It is **not** a convenience snippet pack: it is a thin operational interface to the methodology — it makes health checks repeatable, reduces forgotten gates, standardises the evidence contract, and turns "what do I do now?" into an explicit recommendation.

---

## §1 — Authority order

1. **This catalog is the source of truth.**
2. Tool adapters (Espanso YAML, VS Code snippets, …) are **examples / generated outputs**.
3. If an adapter diverges from the catalog, **the catalog wins** — regenerate the adapter.

An adapter file is never canon. The named example must not be named after any product.

---

## §2 — The rules (canonized)

Every operator command inherits all of the following. Rules **1–9 bind universally**; rules **10–12 bind any command that touches that surface** (referenced work, credentials, comms):

1. **One-shot.** It must not change the agent's personality, language preference, collaboration mode, or future response style. Forbidden phrasing: "from now on…", "always respond…", "a partir de ahora…", "keep this format". Use "for this response…", "in this report…". *(Binds `CANON-AGENT-COLLABORATION`.)*
2. **Evidence discipline (anti-hallucination).** For any gate/check/report the agent separates `COMMAND` · `RESULT` · `EVIDENCE` · `INFERENCE` (if any) · `RECOMMENDATION`, and labels each claim:
   - `EXECUTED` — the command actually ran;
   - `VERIFIED` — existence/fact confirmed by a file, metadata, PR, branch, docs, or tool output;
   - `INFERENCE` — reasonable deduction, not execution;
   - `NOT VERIFIED` — not confirmed.
   **Never** say "I ran X" if X was only found in package/scripts/docs/memory/index. *(Binds `REVIEW-READINESS-PROTOCOL`.)*
3. **Actionable close-out.** Every command ends with an honest next action (`RECOMMENDATION:` + optional `VERDICT:` / `NEXT STEP:`). If the next action maps to another catalog command, say it **literally**: `Te recomiendo correr :xxx` (or the adapter's localized equivalent). *(Binds `CANON-GIT-HYGIENE §2.6`.)*
4. **Tool-agnostic.** The catalog defines stable command ids + output contracts; expanders are adapters. No repo/operator is required to install an expander.
5. **Language-agnostic.** Stable **English** technical ids (`repo-health`, `task-status`). Localized aliases/prompts are allowed; the snippet's language must **not** set a permanent language preference.
6. **Prefix-safe aliases.** No trigger may be an **exact prefix** of another (an expander can fire the short one before the user finishes typing the long one). Validate before publishing/generating an adapter. *(Field origin: `:handoff` fired before `:handoff-local`; fixed by removing the bare prefix.)*
7. **Additive adapter.** Generating/installing an adapter must never delete or overwrite the user's existing snippets. On a trigger clash: report the conflict and propose an alias — never silently replace.
8. **One canonical trigger per intention.** The catalog defines exactly **one** canonical trigger per command id. Synonym aliases are **not** shipped as canon — field use showed they bloat the help list, breed dead/duplicate entries, and let a short synonym fire before the long one (rule 6). An alias is **opt-in and local (L3)**: a consumer may add one to their own adapter for a **documented reason** (a genuine typo-magnet, a localized daily-use short form), prefix-safe (rule 6), never overriding or duplicating the canonical. The catalog lists one trigger; `commands-help` lists exactly the canonical set. For a command whose canonical trigger **localizes** (e.g. `explain-plain` → `:cristiano`, rule 5), the L1 **identity is the id**; the consumer binds exactly **one** canonical trigger at L3 — still one per intention, not a free-for-all of synonyms. *(Supersedes the former "short trigger + long synonym" convention; validated by the §5.1 gate.)*
9. **Declared execution.** A command's output **opens by declaring which command ran and its intent** — `COMMAND EXECUTED: :xxx — <intent>` (the label localizes, rule 5 — e.g. Spanish `COMANDO EJECUTADO: :xxx — <intención>`) — so the transcript records what the operator triggered and the agent cannot silently drift from it. *(Reinforces rule 2's evidence discipline.)*
10. **Referenced work carries identity, not just a number.** Any command that surfaces a PR, issue, branch, or check **gives its title and current state**, never a bare number — `#123 "Fix tenant leak" (OPEN · CI red)`, not `#123`. A bare number is unverifiable at a glance and ages badly. *(Binds rule 2 — VERIFIED, not asserted.)*
11. **Credential / UAT safety.** Any command that touches credentials, secrets, or a UAT/staging identity **first reads the repo's credential/UAT runbook and env docs**, **never invents or rotates a key**, **never hardcodes or prints a secret value**, and treats the identity as ephemeral and non-destructive (no mutation of real, team, or tenant accounts). The concrete secret store, runbook path, and UAT harness are **L3**. *(Binds `REVIEW-READINESS-PROTOCOL` — env/secret readiness.)*
12. **Comms / handoff use the repo's governed channel.** Any command that files a comm, finding, or handoff **uses the repo's real governed channel** — the configured inbox/lane and structured front matter (recipient, status, human-needed) — not an ad-hoc chat message; the chat is a pointer, never the artifact. The concrete inbox tool, config, and lane paths are **L3**. *(Binds `CANON-MULTI-AGENT-ORCHESTRATION §2.2/§2.3` closeout+handoff; `CANON-COMM-INTERNAL-VS-EXTERNAL`.)*

**Aliases are opt-in and local (rule 8).** The catalog ships **one canonical trigger per intention**. A consumer may add a prefix-safe alias in their own adapter for a documented reason, but it is **never canon** and `commands-help` still lists only the canonical set.

**Static-list exception (rules 3 and 9).** A command that only prints a static list and **executes nothing** (e.g. `commands-help`) satisfies rules 3 and 9 by declaring in its **header line** and closing with a pointer — it does not carry the full evidence preamble or a `RECOMMENDATION`, because it ran nothing to recommend from.

---

## §3 — Command shape (the schema an adapter consumes)

```yaml
id: repo-health              # stable English id (L1)
category: repo               # repo | dk | git | ci | task | handoff | session | review | context | explain | meta
trigger: ":repo-health"      # ONE canonical trigger per intention (rule 8)
aliases_local: []            # opt-in L3 ONLY — prefix-safe (rule 6), documented reason, never canon
intent:
  en: "Run a complete read-only repo health diagnostic."
one_shot: true
declares_execution: true     # output opens with `COMANDO EJECUTADO: :xxx — <intent>` (rule 9)
output_contract: [COMMAND, RESULT, EVIDENCE, INFERENCE, RECOMMENDATION]
binds: "CANON-GIT-HYGIENE §2.6"       # the governing canon this command applies
related_commands: [git-scope, dk-refresh, ci-status, session-close]
body_ref: L3                          # the concrete prompt body is L3 (see §6)
adapter_notes:
  additive_only: true
  do_not_overwrite_existing_triggers: true
```

---

## §4 — The agnostic core (curated — the set every repo can inherit)

Ids only; each is one-shot, evidence-contracted, actionable-close. The **prompt bodies** that name concrete commands (`<pkg-manager> <script>`, tool paths) are **L3** (§6).

| Category | Command ids |
|---|---|
| **session** | `repo-morning` (start hygiene) · `session-close` (end-to-end closeout → exit states) · `repo-panic` (safe recovery, non-destructive) |
| **repo** | `repo-health` (read-only diagnostic) · `repo-creds` (credential/UAT safety protocol — read the runbook, never invent/rotate/print a key; the concrete store is L3, rule 11) |
| **git** | `git-scope` (separate scopes) · `git-precommit` (audit, no commit) · `git-commit` (one clean scope) · `git-pushready` (ready to travel?) · `owner` (whose branch/worktree before touching) |
| **ci** | `ci-status` · `ci-triage` (first real error) · `ci-cost` (are we burning time/tokens?) · `ci-rerun` (justified rerun only) |
| **task** | `task-size` (path/class/gates) · `task-status` · `coder-needed` (executor routing) |
| **handoff** | `handoff-full` (route + prepare) · `handoff-local` (shared lane; consumes declared closeout state, recommends `session-close` first when state is unclear) · `handoff-ext` (external/GitHub) · `handoff-back` (an incoming handoff is ambiguous → ask backward-clarifying questions before accepting, don't guess) · `finding` (governed out-of-scope finding) |
| **review** | `review-ready` (is a surface ready for human review?) |
| **explain** | `explain-plain` (state the current status in plain, non-jargon language so the operator can continue the same front — canonical trigger localizes, e.g. `:cristiano`) · `explain-teach` (didactic, worked-example explanation of a concept/decision — e.g. `:teen`) |
| **context** | `bootstrap` (cold entry: read the bootstrap family) · `chat-weight` (is this session too heavy? — triage) · `chat-handoff` (roll to a fresh session: emit a self-contained re-entry block to paste into a new chat) |
| **dk** | `dk-refresh` (fast-forward-pull the kit + print the canon-delta, then re-read the flagged canons — refresh a running session WITHOUT restarting it; the content sibling of `ops-sync`) |
| **meta** | `commands-help` (list) · `ops-sync` (§5) |

Product-specific commands (knowledge-index freshness, product schema checks) are **L3 extensions**, not part of this core. *(`dk-refresh` is core, not L3: refreshing the kit is a universal kit operation — the content sibling of `ops-sync`, which refreshes the command adapter — and its only machine-specific part is the mount path, an L3 placeholder like every other command's concrete bits.)*

> **`chat-weight` vs `chat-handoff`.** `chat-weight` is the lightweight triage — *seguir / resumir aquí / rollover*. `chat-handoff` is the action when the verdict is rollover: it picks the most appropriate handoff and **produces a self-contained re-entry block to paste into a new chat**, so the same work continues (with you or other people) without losing context. Distinct from `handoff-*` (which hand work to a *recipient*): `chat-handoff` optimizes for *rebuild-my-context-to-continue*, not *tell-someone-else-what-to-do*.

---

## §4.1 — Example flows (use cases)

Flows are written with **command ids only** — that keeps them agnostic (the ids are L1; the concrete bodies are L3). They show how commands compose, not what they invoke.

- **Session start → work → close:** `repo-morning` → (`git-scope` if dirty & yours) → … → `session-close`.
- **Close then hand off:** `session-close` → `handoff-local`. `handoff-local` should not perform cleanup itself; it consumes the declared closeout state or recommends running `session-close` first.
- **Ship one change:** `git-scope` → `git-precommit` → `git-commit` → `git-pushready`.
- **CI is red:** `ci-status` → `ci-triage` → (`ci-cost` if stuck looping) → `ci-rerun` *only if justified*.
- **Route a task:** `task-size` → `coder-needed` → (if delegating) `handoff-full`.
- **Session got heavy:** `chat-weight` → (if rollover) `chat-handoff` → paste its block into a fresh chat.
- **Before asking a human to review:** `review-ready` → (ready) share · (not) fix first.
- **Fresh agent enters a repo:** `bootstrap` → `repo-morning`.
- **Saw something off-scope:** `finding` (don't fix it inline).
- **Got a handoff you don't fully understand:** `handoff-back` (ask backward before accepting) → then act.
- **Lost the thread / need it in plain words:** `explain-plain` → continue. Learning a concept: `explain-teach`.
- **About to touch credentials or a UAT identity:** `repo-creds` (read the runbook first — never invent/rotate/print a key).
- **Set up / refresh your commands:** `ops-sync`.
- **A kit canon changed and your session is still running:** `dk-refresh` (pull + canon-delta + re-read the flagged canons — no restart).

---

## §5 — The `ops-sync` meta-command (bring/refresh the catalog into your expander)

The catalog is only useful if the operator can pull it into their tool without hand-authoring YAML. `ops-sync` is the **install/refresh** command. An operator runs it (or says it in words) and an agent generates/updates the adapter **additively** from this catalog.

**Reference body (adapter-neutral):**

> Read the dev-kit operator command catalog (`REFERENCE-OPERATOR-COMMAND-CATALOG`) and create/update my command expander **additively**. Detect which expander I use (Espanso / VS Code snippets / Raycast / other) or ask if unclear. Requirements: do **not** delete or replace existing snippets; if a trigger already exists, report the conflict and propose an alias; validate **prefix-safety** (no trigger an exact prefix of another) before writing; generate valid adapter files for my tool; validate the tool can load them (and restart + inspect the log if available); report evidence — files created/edited, triggers added, conflicts, and how to test `:commands-help`. Close with `RECOMMENDATION` and the next step.

This is what makes *"hey, bring the operator commands from the dev-kit"* a single action instead of a manual copy.

### §5.1 — The catalog gate (`check-operator-catalog`)

`ops-sync` generates an adapter; the gate keeps it **honest**. `tools/check-operator-catalog.mjs` lints an operator adapter (default: the shipped example; a consumer points it at their own file via `tools/operator-catalog.config.json`) and goes **RED** on the three failures field use surfaced — the reason `commands-help` was listing junk:

- **Dead command** — a trigger with an empty/missing body (`commands-help` would advertise a command that does nothing).
- **Duplicate trigger** — the same trigger defined twice (the second silently shadows or the help double-lists).
- **Prefix collision** — a trigger that is an exact prefix of another (rule 6 mechanized; `:handoff` fires before `:handoff-local`).

It parses only the adapter's trigger set + body presence (tool-neutral; zero deps) — it does **not** execute any command. Skip-with-note when no config and no example is present. Known-bad tests ship with it (`check-operator-catalog.test.mjs`, per `CANON-AUDIT-PROTOCOL §8.7`). *Non-goal:* it does not cross-check triggers against §4's markdown (that set is curated prose, not a machine manifest); it validates the adapter is internally clean, which is what stops `commands-help` from listing dead/duplicate/colliding commands.

---

## §6 — L1 / L3 line (what belongs where)

- **L1 (this reference — inherited):** the **rules** (§2), the **command shape** (§3), the **agnostic core ids + contracts** (§4), the **`ops-sync` behaviour** (§5), and the **catalog gate** (§5.1, `check-operator-catalog`).
- **L3 (the consuming repo/operator):** the **concrete prompt bodies** that invoke real commands (the package-manager script names, tool paths, canon file names), **product-specific commands**, **localized prompt text** (including a localized canonical trigger like `:cristiano`, rule 5), and — for the safety rules — the **concrete secret store / credential runbook / UAT harness** (rule 11) and the **concrete inbox tool, config, and lane paths** (rule 12). The kit states the *principle*; the consumer binds the vendor/paths. A consumer's local adapter (e.g. a personal Espanso file) legitimately carries product commands and prefix-safe opt-in aliases — that is L3, and correct; only the shipped **example** is neutralized.

The kit ships the **shape + rules + a slot**; the consumer fills the bodies. If L3 bodies leak into this L1 reference, it drifts (fire-test fails).

---

## §7 — Provenance

Forced by a real operator practice: a tested Espanso command set proved that the reusable value is the **catalog + contracts + rules**, not the expander. The evidence discipline (labels), the one-shot guard, the prefix-safe lesson, and the actionable-close were all field-validated. This reference lifts the agnostic half to the kit and binds the rules to existing spine (§2.6, evidence discipline, one-shot, closeout/handoff) rather than re-deriving them. Adapters (Espanso, VS Code, …) ship as **optional templates**, never as required tooling.

**Fire-test:** names no first-party product, agent harness, person, package manager, or concrete path; third-party expander tools (Espanso, VS Code, Raycast, …) are named **only as example adapters**, the same way the kit names example runtimes. Layering gate (Check 8/9) GREEN. PASS.

**SEALED 2026-07-01 by the named authority** (drafted by the Principal Architect; rules approved by the chief architect). Adapter templates added the same day.

**Amendment 2026-07-01 (b) — approved by the chief architect:** added `chat-handoff` (§4 context — the rollover companion to `chat-weight`: emit a self-contained re-entry block for a new chat) and §4.1 Example flows (id-only, agnostic use cases). No rule change.

**Amendment 2026-07-10 (v2 — DRAFT, pending seal · D-065), forced by real operator usage** (the help was listing dead/duplicate commands; synonym pairs bred junk; commands referenced bare PR numbers; creds/comms asks had no shared floor). Six changes, all agnostic:
- **Canonical-only (rule 8, supersedes the "short + long synonym" convention).** One canonical trigger per intention; synonym aliases are opt-in **L3**, never canon. The core index collapses its one true synonym pair (`repo-status` → opt-in alias of `repo-health`); the §3 schema now carries a single `trigger` + opt-in `aliases_local`. *The convention that a command should ship a short **and** a long synonym is retired.*
- **Declared execution (rule 9).** Every command opens with `COMANDO EJECUTADO: :xxx — <intención>` so the transcript records what was triggered (`declares_execution` in §3).
- **Three inherited safety/quality rules (10–12):** referenced work carries **title + state** not a bare number; **credential/UAT** commands read the runbook and never invent/rotate/print a key (concrete store L3); **comms/handoff** commands use the repo's governed channel with structured front matter (concrete inbox/lane paths L3). The kit states the principle; the vendor/paths bind at L3 (§6).
- **The catalog gate (§5.1, `check-operator-catalog`).** Mechanizes rule 6 + kills dead/duplicate commands; the machine enforcement of rule 8's "no junk in `commands-help`". Ships with known-bad tests (`CANON-AUDIT-PROTOCOL §8.7`).
- **Four new agnostic commands:** `repo-creds` (repo), `handoff-back` (handoff), and a new **explain** category (`explain-plain`, `explain-teach`). All are L1 ids with L3 bodies; `explain-*` triggers localize (rule 5).
- **Fire-test:** all additions name no first-party product, vendor, store, or path (the concrete secret store, inbox tool, and localized triggers are explicitly routed to L3). PASS.
Drafted by the dev-kit seat; **independent adversarial validation before seal**; sealed only by the named authority.
