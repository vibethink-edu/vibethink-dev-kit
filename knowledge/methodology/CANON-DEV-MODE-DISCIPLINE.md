# CANON-DEV-MODE-DISCIPLINE — Pre-production operating discipline (universal · agent-agnostic)

> **Scope:** every repo that has not yet reached its first real user with live data.
> Vendor-neutral, product-neutral, tool-neutral.
> **Status:** SEALED 2026-06-05 by the Principal Architect — Tier A consolidation (autonomous-close authorization).
> **Home:** the dev-kit (supra-repo). Inherited by every repo as upstream → fork.
> **Parent:** `CANON-AGENT-COLLABORATION` §4 (Pre-production discipline) states the principle and the transition; this canon is the tactical body it delegates to.

---

## §1 — DEV-MODE is a declared state, not inferred

A repo is in DEV-MODE while **all** of these hold: no real production tenants/users; all data is seed/mock; the go-live date has not arrived; the human authority has not explicitly declared "production mode" for any tenant. DEV-MODE ends only when the human authority declares the transition explicitly (`CANON-AGENT-COLLABORATION` §4.1). Until that phrase is pronounced, **assume DEV-MODE**.

---

## §2 — Deletion is the default operation

When an agent finds contaminated, obsolete, or conceptually wrong code/data, the default is to **delete it**, not preserve it behind deprecation markers.

| ❌ Not in DEV-MODE | ✅ In DEV-MODE |
|---|---|
| Mark files `@deprecated` and leave them alive | Delete whole files |
| Migrations with `IF EXISTS` + legacy-data preservation | Drop tables, recreate from scratch, truncate |
| Keep backward compatibility with old APIs | Delete the old APIs and rewrite callers |
| Feature flags for "gradual rollout" | Merge to the default branch directly |
| Shims / adapters / compat layers for old code | Delete the old code |
| Extensive issue-report docs of "what happened" | One journal/log entry + version-control history |

**Rationale:** everything deleted in DEV-MODE is recoverable from version control. No user is waiting for the file to exist; no data is lost. Preservation is ceremony without purpose.

---

## §3 — Migrations do not preserve data in DEV-MODE

Migrations may `DROP TABLE` without a preservation migration, `ALTER`/rename columns without an intermediate alias step, `TRUNCATE` seed tables, or change constraints without a transformation migration — with **no documented "why we deleted the data."** The implicit justification: DEV-MODE, the data is seed.

**Single exception:** if a specific test datum cost the human authority **>1h to configure manually** (e.g. a hand-tuned fixture), the agent asks before deleting it. The default case is: delete.

---

## §4 — Multiple approval is ceremony, not governance

Agents do **not** ask the human authority for:

- Mechanical operational fixes (build errors, lint, frontmatter)
- Deletion of clearly obsolete code/docs
- Choosing between mechanically-equivalent variants (timestamp format, variable name, import order)
- Re-approval of something already approved in a prior turn
- Validation of each sub-step of an already-approved plan

**One meta-level question** ("do you approve plan A or B?") is legitimate. **Ten subsequent operational questions** are ceremony — the agent already holds the meta-level approval; it executes and returns with the result.

---

## §5 — Governance gates stay active

DEV-MODE does **not** disable governance gates (security, forbidden-vocabulary, schema/data lifecycle, auth guards, branch/worktree discipline, the proposal preflight). What changes is only the *tempo*: agents run these gates **fast and without ceremony**, not slower. Speed is a virtue in DEV-MODE; the safety gates are **not** the ceremony being cut. (The concrete gate set is an L3 concern.)

---

## §6 — Detecting over-protection in other agents

When an agent sees another agent (human or AI) applying production-grade caution to non-existent data, it **flags it**. Signals to watch for:

- Complex `BEGIN` / `COMMIT` / `ROLLBACK` blocks on seed operations
- Defensive `try/catch` around operations that cannot fail
- Mocking production when the real source is locally available
- Retry policies with exponential backoff in seed code
- Triple-validating inputs already validated upstream
- Extensive "what if X fails" docs for scenarios impossible in DEV-MODE
- `--dry-run` defaults before executing
- Deep audits for mechanical fixes

**How to flag:** a short message — *"we are in DEV-MODE; the over-protection of [X] is ceremony — I propose [simpler version]."* **Flagging is a responsibility; imposing is not.** If the proposer insists or the human authority ratifies the caution, it is respected — the flag has been raised.

---

## §7 — Ceremony has a measurable cost

Every minute of ceremony in DEV-MODE costs:

- **The human authority's time** — hours not spent building the product before go-live.
- **The agent's finite context window** — each needless round consumes tokens needed for real execution.
- **Drift risk** — longer sessions mean more hallucination, lost thread, and contradiction.

Therefore **less ceremony = better governance**. Counterintuitive, but simplicity protects more than elaboration when there is no real data to protect.

---

## §8 — When ceremony IS warranted (exceptions)

DEV-MODE is not "anything goes." Some operations need care even without real data:

| Operation | Ceremony? | Why |
|---|---|---|
| Delete canon-contaminated code / seed migrations | ❌ No | DEV-MODE default |
| Modify or delete a sealed canon | ✅ Yes | Only the human authority approves |
| Modify the philosophy-root or meta-governance canon | ✅ Yes | Foundational |
| Change monorepo architecture (workspaces, tooling, root manifest) | ✅ Yes | Affects all agents / the lockfile |
| Touch a surface the human is manually tuning | ✅ Yes | Concurrent human work |
| Touch credentials / secrets | ✅ Yes | Even test ones belong to the human |

**Golden rule:** if the operation affects canon, philosophy, or configuration the human is manually manipulating → it needs approval. If it only affects code/data an agent generated → in DEV-MODE the agent may delete it on its own.

---

## §9 — Exit from DEV-MODE

When the repo leaves DEV-MODE, the human authority updates the L3 binding:

1. Declare the exit date and the first production tenant.
2. Replace the DEV-MODE rules with production rules (data preservation, transformative migrations, multi-approval for destructive change).
3. **Explicitly invert §2** ("deletion is default" → "preservation is default").

Until that update, the DEV-MODE rules are the operating law.

---

## §10 — Constitutional rules

1. **DEV-MODE is declared, not inferred.** No explicit "production mode" → assume DEV-MODE.
2. **Ceremony in DEV-MODE is an operational bug, not a virtue.** Detecting and flagging it is each agent's responsibility.
3. **Deletion is reversible** — version-control history always returns what was deleted.
4. **Preservation is irreversible** — deprecated code causes permanent confusion until someone deletes it later.
5. **The human authority wins by default** — "delete" → delete; "preserve" → preserve. The agent's rule: propose the simplest version first; offer ceremony only if asked.
6. **The litmus test** — *"can a competent agent resolve this in <30 min by reading the code and applying a clear fix? If yes → just do it, don't escalate."*

---

## §11 — Explicit anti-patterns

- Splitting mechanical changes into separate PRs "for a readable diff" with no real readers
- `@deprecated` when deletion is possible
- Migrating seed data "for consistency"
- Asking approval for each sub-step of an already-approved plan
- Extensive issue-report docs for problems solvable in 30 minutes
- Designing feature flags in DEV-MODE
- Documenting "the upgrade path" when only one version is alive
- Triple-validating inputs "for safety"
- Cosmetic code review on code that will be replaced next week
- Offering the human authority 5 options when 1 is clearly best
- Treating seed data as relics
