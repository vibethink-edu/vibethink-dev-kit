# CANON-CODER-SAFE-IDENTITY-001 — Safe low-privilege executor identity & per-session isolation

**Status:** SEALED 2026-06-15 by the Principal Architect — fire-tested on the first vertical's executor launch wave (proposed 2026-06-13).
**Date:** 2026-06-13
**Scope:** Every repo where one or more AI agents ("coders"/executors) push code on behalf of a **bot account** with asymmetric permissions (propose-only: write + open PR, no merge, no admin/bypass), while a separate **owner/maintainer** identity reviews and merges. Vendor-neutral, forge-neutral, harness-neutral, bot-implementation-neutral.
**Home:** the dev-kit (supra-repo). Inherited by every repo as upstream → fork.
**Companion canons:** [`CANON-BRANCH-WORKTREE-LIFECYCLE`](../methodology/CANON-BRANCH-WORKTREE-LIFECYCLE.md) (worktree isolation + spawned-worker lifecycle this canon binds an identity to) · [`CANON-GIT-HYGIENE`](../methodology/CANON-GIT-HYGIENE.md) (the pre-push preflight this canon adds an identity check to) · [`CANON-CONFIGURATION-DISCIPLINE`](../methodology/CANON-CONFIGURATION-DISCIPLINE.md) (the layered config/secret resolution the per-session token rides on) · [`CANON-MULTI-AGENT-ORCHESTRATION`](./CANON-MULTI-AGENT-ORCHESTRATION.md) (the architect↔executor dance + handoff the PREP step feeds) · [`CANON-SKILLS-OVER-ROLES`](./CANON-SKILLS-OVER-ROLES.md) (PREP is a skill, not a standing role).

---

## §1 — Principle

An autonomous executor that can **merge its own work**, **bypass review**, or **act as the repo owner** is a review gate that does not hold. "All changes through a reviewed PR" is only real if the identity the executor pushes with **cannot** merge or bypass it.

So: the executor pushes as a **low-privilege bot** (propose-only); a **separate owner identity** reviews and merges; and the two **never share an active credential in the same session**. The branch-protection rule is the lock; the bot identity is what makes the lock bite; per-session isolation is what keeps the owner's key out of the executor's hand.

> **The failure mode this canon prevents:** an executor pushing — by accident, by prompt-injection, or by a shared machine's default credential — as an identity that can reach the default branch directly. The lock exists; this canon makes sure the executor is on the wrong side of it.

This is **not** a statement of distrust toward the agent. It is the same defense-in-depth as a least-privilege service account: the asymmetry contains *any* executor error — hostile or honest.

---

## §2 — Relationship to the companion spines (no duplication)

| Concern | Owner | This canon |
|---|---|---|
| Worktree isolation, one-branch-per-worker, cleanup | **`CANON-BRANCH-WORKTREE-LIFECYCLE`** §5/§7 | does **not** restate; §7 only adds the **session↔identity binding** |
| Clean working floor, all-changes-via-PR, no silent bypass, pre-push preflight | **`CANON-GIT-HYGIENE`** §2/§4/§7 | does **not** restate; §5 adds the **identity** check to the same preflight |
| Layered config + secret/env resolution | **`CANON-CONFIGURATION-DISCIPLINE`** §3/§4 | does **not** restate; §4 rides on it for the **per-session credential** |
| Architect↔executor dance, handoff completeness, exit states | **`CANON-MULTI-AGENT-ORCHESTRATION`** §2/§9 | does **not** restate; §9 feeds it via the **PREP** setup step |
| Skills over standing roles | **`CANON-SKILLS-OVER-ROLES`** | does **not** restate; §9 names **PREP as a skill**, not a role |

This canon **owns** what had no agnostic home: the **identity asymmetry**, the **per-session identity binding**, the **auth gate**, the **three-identity audit**, the **per-session permission scoping**, and the **PREP setup pattern**.

---

## §3 — The identity model (asymmetric, two parties)

- **Executor / coder = bot, propose-only:** write to the repo and open a PR; **no merge, no admin, no bypass** of branch protection.
- **Owner / maintainer (the architect / coordinator):** reviews and merges. May hold admin — in which case branch protection must still require review, or admins are exempted only **deliberately and documented**.
- **The lock:** the default branch is protected (PR + review required). When "admins may bypass" is enabled, the owner can push directly but the bot **cannot** — so the bot is the side the lock holds. The executor also cannot self-approve its own PR.

L3 binds the concrete bot account, its permission level, and the forge's branch-protection settings.

---

## §4 — Per-session identity isolation (no global contamination)

A machine/user has **one active forge credential** by default. Do **not** flip a global credential per task — it is error-prone and couples unrelated sessions.

- **Bind identity per session:** launch the executor's agent session with the **bot credential injected into that process's environment** (a per-session token env var). The owner's session runs **without** it and resolves to the stored owner credential.
- **Inheritance:** a credential set in the launching shell is inherited by the agent process and all its children — so set it **in the same shell, before launch**. (`CANON-CONFIGURATION-DISCIPLINE` §3 owns the layered env-var resolution this rides on.)
- **Separation is by identity, not hardware:** executor and owner may be on different machines **or coexist on one** — the per-session token is what separates them. A global account switch is the fallback only when the launch environment cannot be controlled.

The concrete env-var name and provisioning are L3.

---

## §5 — The auth gate (verify your OWN session before any push)

Before **any** push, an agent verifies the **active identity of its own session** (the forge CLI's auth status, in this process). If it is not the expected bot → **STOP, do not push, escalate to the human.**

- **Never trust an identity status pasted from another window or session.** Identity is **per-process**; a status from elsewhere proves nothing about *this* session.
- This is the **identity counterpart** to the working-floor preflight of `CANON-GIT-HYGIENE` §2.1 — same gate, identity side.

> **Mnemonic:** *the push runs only from the session whose own auth says it is the bot.*

---

## §6 — The three identities (do not conflate) + auditing the real actor

| Identity | What it is | Set by | Does branch-protection see it? |
|---|---|---|---|
| **commit author** | the label in the commit log | the VCS user config | **No** — cosmetic |
| **push actor** | **who pushed** to the remote | the **active credential** | **YES — this is what the lock checks** |
| **PR author** | who opened the PR | the active forge account | indirect (cannot self-approve) |

- **Audit the push actor**, not just the commit author. The commit author reading "Coder Agent" proves **nothing** about who actually pushed — a session on the owner credential with a cosmetic commit-author still pushes *as the owner*.
- Verify by querying the forge's **events/activity for the branch** and confirming the actor is the bot. The concrete API/command is L3.

---

## §7 — Worktree ↔ session identity binding

`CANON-BRANCH-WORKTREE-LIFECYCLE` §5/§7 own worktree isolation and one-branch-per-worker. This canon adds the **identity binding**:

- **One executor session = one worktree = one bot identity.** Two executors never share a working tree (the lifecycle canon's collision rule), and the pushing session carries the bot identity (§4).
- A worktree is **local to a machine** — the session that pushes from it runs on that same machine and carries the bot identity.
- **Shared-foundation dependency:** when one executor lays a foundation others consume (e.g. test wiring), the dependent executors create their worktree from the **latest integration branch at launch time**, so they inherit the merged foundation instead of duplicating it.

---

## §8 — Per-session permission scoping (reduce prompts without going global)

An executor that asks permission for every action stalls a long run; but blanket "bypass all prompts" is — per the harness's own guidance — for **isolated environments only**.

- **Scope the relaxation to the executor's session/worktree** (the harness's per-workspace settings), **never** machine/user-global and **never committed** to the repo.
- **Keep a guard even in bypass:** still **prompt** (not silently allow) on destructive patterns — recursive delete, outbound fetch/exfiltration, force-push — and **deny** reads of secret files.

The harness's settings file, its format, and the guard list are L3.

---

## §9 — The PREP step (setup as a skill, not a role)

Per wave, a **non-executor session** prepares the launch surface so launching each executor is **one command**: a per-spec prompt, the per-session permission settings, and a launch script that runs the auth gate (§5), enters or creates the worktree (§7), and starts the executor with its prompt.

- **PREP is identity-neutral** — it only writes local files (no push), so it does **not** need the bot.
- **PREP is a skill** any generalist session performs (`CANON-SKILLS-OVER-ROLES`), not a standing role. It does **not** push, merge, or implement specs.
- **Hard rule:** the bot credential is **never written to a file** — launch scripts **expect** it in the session environment, never contain it.

---

## §10 — L3 binding (what the consuming repo owns)

- the concrete **bot account** + its permission level + the forge's **branch-protection** settings (§3)
- the **per-session credential** env-var name + how it is provisioned (§4)
- the forge CLI's **auth-status** command (§5) and the **events/audit** query (§6)
- the **shared-foundation order** for the wave (§7); the worktree root convention defers to `CANON-BRANCH-WORKTREE-LIFECYCLE` §5.3
- the harness's **per-session permission-settings** file + format + the ask/deny guard list (§8)
- the **launch-script + prompt-file** layout the PREP step emits (§9)

The L3 binding **points at this canon as the spine**; it does not re-write the identity model, the gate, or the audit. If it repeats them, it drifts.

---

## §11 — What this canon does NOT do

- It does **NOT** own worktree lifecycle mechanics (phases, cleanup, naming) — that is `CANON-BRANCH-WORKTREE-LIFECYCLE`.
- It does **NOT** own session hygiene / all-via-PR — that is `CANON-GIT-HYGIENE`.
- It does **NOT** own env/secret resolution layering — that is `CANON-CONFIGURATION-DISCIPLINE`.
- It does **NOT** own the handoff vocabulary or the architect↔executor dance — that is `CANON-MULTI-AGENT-ORCHESTRATION`.
- It does **NOT** prescribe the forge, the CLI, the agent harness, or the bot implementation — all L3.
- It does **NOT** make the executor "untrusted" — it is least-privilege defense-in-depth, not a trust statement.

---

## Provenance

First assembled while launching the **first vertical's executor wave** (2026-06-13). Each of the six pieces was forced by a concrete bump during that launch, not invented ahead of need (Rule: build on real pain):
- a session **defaulting to the owner credential** because a per-session token never reached it → §4, §5;
- an **identity status pasted from the wrong window** nearly used to authorize a push → §5;
- a branch whose **push actor** had to be audited separately from its cosmetic commit author → §6;
- **two executors** about to share one working tree / a missing shared-foundation order → §7;
- per-action permission prompts stalling a long run → §8;
- repeated manual launch friction → the **PREP** skill, §9.

**Coverage-check:** `CANON-BRANCH-WORKTREE-LIFECYCLE` owned worktree isolation but not identity binding; `CANON-GIT-HYGIENE` owned the working-floor preflight but not an identity gate; `CANON-CONFIGURATION-DISCIPLINE` owned env layering but not per-session credential isolation; `CANON-MULTI-AGENT-ORCHESTRATION` owned handoff but not the executor-identity model; `CANON-SKILLS-OVER-ROLES` owned the skills model but PREP was unnamed. This canon fills that gap and references the companions rather than duplicating them; consuming repos keep only the concrete bindings (§10).

**SEALED 2026-06-15 by the Principal Architect (merge = seal).** (Proposed 2026-06-13.)
