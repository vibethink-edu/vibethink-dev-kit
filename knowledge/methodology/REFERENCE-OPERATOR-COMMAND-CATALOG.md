# REFERENCE-OPERATOR-COMMAND-CATALOG — agnostic operator commands for agents

**Status:** **SEALED 2026-07-01 by the named authority** — the **rules** (§2) are binding; the catalog set (§4) is a curated reference. Adapter examples ship as optional templates (`setup/templates/operator-command-expanders/`).
**Date:** 2026-07-01
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

Every operator command **MUST** satisfy all seven:

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

**Convention:** a **short** trigger for daily use + a **long** descriptive synonym for discoverability (`:hd-local` / `:handoff-local`), *only when prefix-safe*. Recommend the short one in follow-up text.

---

## §3 — Command shape (the schema an adapter consumes)

```yaml
id: repo-health              # stable English id (L1)
category: repo               # repo | dk | git | ci | task | handoff | session | meta
aliases:
  canonical: [":repo-health", ":repo-status"]
  typo_tolerant: [":repo-healh"]     # optional, prefix-safe
intent:
  en: "Run a complete read-only repo health diagnostic."
one_shot: true
output_contract: [COMMAND, RESULT, EVIDENCE, INFERENCE, RECOMMENDATION]
binds: "CANON-GIT-HYGIENE §2.6"       # the governing canon this command applies
related_commands: [git-scope, dk-health, ci-status, session-close]
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
| **repo** | `repo-health` / `repo-status` (read-only diagnostic) |
| **git** | `git-scope` (separate scopes) · `git-precommit` (audit, no commit) · `git-commit` (one clean scope) · `git-pushready` (ready to travel?) · `owner` (whose branch/worktree before touching) |
| **ci** | `ci-status` · `ci-triage` (first real error) · `ci-cost` (are we burning time/tokens?) · `ci-rerun` (justified rerun only) |
| **task** | `task-size` (path/class/gates) · `task-status` · `coder-needed` (executor routing) |
| **handoff** | `handoff-full` (route + prepare) · `handoff-local` (shared lane; consumes declared closeout state, recommends `session-close` first when state is unclear) · `handoff-ext` (external/GitHub) · `finding` (governed out-of-scope finding) |
| **review** | `review-ready` (is a surface ready for human review?) |
| **context** | `bootstrap` (cold entry: read the bootstrap family) · `chat-weight` (is this session too heavy? — triage) · `chat-handoff` (roll to a fresh session: emit a self-contained re-entry block to paste into a new chat) |
| **meta** | `commands-help` (list) · `ops-sync` (§5) |

Product-specific commands (a kit-refresh trigger, knowledge-index freshness, product schema checks) are **L3 extensions**, not part of this core.

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
- **Set up / refresh your commands:** `ops-sync`.

---

## §5 — The `ops-sync` meta-command (bring/refresh the catalog into your expander)

The catalog is only useful if the operator can pull it into their tool without hand-authoring YAML. `ops-sync` is the **install/refresh** command. An operator runs it (or says it in words) and an agent generates/updates the adapter **additively** from this catalog.

**Reference body (adapter-neutral):**

> Read the dev-kit operator command catalog (`REFERENCE-OPERATOR-COMMAND-CATALOG`) and create/update my command expander **additively**. Detect which expander I use (Espanso / VS Code snippets / Raycast / other) or ask if unclear. Requirements: do **not** delete or replace existing snippets; if a trigger already exists, report the conflict and propose an alias; validate **prefix-safety** (no trigger an exact prefix of another) before writing; generate valid adapter files for my tool; validate the tool can load them (and restart + inspect the log if available); report evidence — files created/edited, triggers added, conflicts, and how to test `:commands-help`. Close with `RECOMMENDATION` and the next step.

This is what makes *"hey, bring the operator commands from the dev-kit"* a single action instead of a manual copy.

---

## §6 — L1 / L3 line (what belongs where)

- **L1 (this reference — inherited):** the **rules** (§2), the **command shape** (§3), the **agnostic core ids + contracts** (§4), and the **`ops-sync` behaviour** (§5).
- **L3 (the consuming repo/operator):** the **concrete prompt bodies** that invoke real commands (the package-manager script names, tool paths, canon file names), **product-specific commands**, and **localized prompt text**. A consumer's local adapter (e.g. a personal Espanso file) legitimately carries product commands — that is L3, and correct; only the shipped **example** is neutralized.

The kit ships the **shape + rules + a slot**; the consumer fills the bodies. If L3 bodies leak into this L1 reference, it drifts (fire-test fails).

---

## §7 — Provenance

Forced by a real operator practice: a tested Espanso command set proved that the reusable value is the **catalog + contracts + rules**, not the expander. The evidence discipline (labels), the one-shot guard, the prefix-safe lesson, and the actionable-close were all field-validated. This reference lifts the agnostic half to the kit and binds the rules to existing spine (§2.6, evidence discipline, one-shot, closeout/handoff) rather than re-deriving them. Adapters (Espanso, VS Code, …) ship as **optional templates**, never as required tooling.

**Fire-test:** names no first-party product, agent harness, person, package manager, or concrete path; third-party expander tools (Espanso, VS Code, Raycast, …) are named **only as example adapters**, the same way the kit names example runtimes. Layering gate (Check 8/9) GREEN. PASS.

**SEALED 2026-07-01 by the named authority** (drafted by the Principal Architect; rules approved by the chief architect). Adapter templates added the same day.

**Amendment 2026-07-01 (b) — approved by the chief architect:** added `chat-handoff` (§4 context — the rollover companion to `chat-weight`: emit a self-contained re-entry block for a new chat) and §4.1 Example flows (id-only, agnostic use cases). No rule change.
