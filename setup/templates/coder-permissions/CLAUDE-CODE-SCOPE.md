# Claude Code — exact scope of the coder permissive-deny posture

> **Why this doc exists.** `settings.local.json` here is **Claude Code's** permission format,
> and "what the bypass actually covers" is a **security boundary** — so it must be pinned to
> what the harness really does, not assumed. Verified against the Claude Code permission docs
> (2026-06; the core semantics below are documented as stable policy, not version-specific).
> The canon (`CANON-CODER-*`) stays harness-neutral; this file is the Claude-Code instantiation.

## 1. Precedence — `deny > ask > allow`

Rules evaluate in that order; the first match wins, regardless of specificity.
- A **`deny`** rule **overrides** an `allow` rule for the same command. Deny is checked first.
- An **`ask`** rule prompts **even when** a more specific `allow` also matches.
- So the deny-list is the **strongest** guard: it cannot be out-voted by a broad allow.

## 2. The posture mechanism (what makes it work)

```json
{ "permissions": { "allow": ["Bash", "Read", "Edit", "Write", "Glob", "Grep"], "deny": [ … ] } }
```

- **`"Bash"` (bare tool name) = all Bash commands, no prompt.** Equivalent to `Bash(*)`. This is
  the correct way to broadly auto-allow Bash *while* keeping deny enforcement (you do **not** need
  bypass mode for this).
- **Compound commands are decomposed and checked per sub-command.** Claude Code recognizes the
  separators `&&`, `||`, `;`, `|`, `|&`, `&`, and newlines, and **a rule must match each
  sub-command independently.** So `foo && rm -rf x` → the `rm -rf x` sub-command hits the deny
  rule and is **blocked**, even though it rode inside a compound. This is what makes "broad allow
  + airtight deny" safe: structure can't smuggle a denied command past the guard.

## 3. What `bypassPermissions` actually does (the correction)

> **`bypassPermissions` does NOT skip `deny`.** It skips the **allow-side prompts** only. Still
> enforced under bypass: **`deny` rules, `ask` rules, and a built-in circuit-breaker** that still
> prompts on `rm -rf /` and `rm -rf ~`.

Consequences for this posture:
- You **don't need** bypass mode — `allow: ["Bash"]` + `deny` already silences the routine and
  keeps the guard. **Prefer it**, so there's no global "skip" flag to misremember or misapply.
- If a session *does* run in bypass, the deny-list above **still bites** — bypass is not the
  deny-killer. (Earlier drafts of this template claimed it was; that was wrong.)
- **`acceptEdits` does NOT auto-approve Bash** — it auto-accepts file edits + a few filesystem
  commands (`mkdir`/`touch`/`mv`/`cp`). For Bash you need `allow: ["Bash"]` (per §2).

| `defaultMode` | Effect on Bash | Deny still enforced? |
|---|---|---|
| `default` | prompts on first use | yes |
| `acceptEdits` | **no** auto-approve (edits + mkdir/touch/mv/cp only) | yes |
| `plan` | read-only | yes |
| `bypassPermissions` | skips allow-prompts | **yes** (+ ask + rm circuit-breaker) |

This template relies on `allow: ["Bash"]` under the **default** mode — not on any bypass flag.

## 4. Pattern syntax + gotchas

- **Bash:** `Bash(<prefix>:*)` (the repo's form, e.g. `Bash(git add:*)`) and `Bash(<prefix> *)`
  both match the prefix. **Word-boundary gotcha:** `Bash(ls*)` (no space) also matches `lsof`;
  `Bash(ls *)` / `Bash(ls:*)` do not. For **deny** rules, over-matching is the safe direction
  (it blocks a bit more), so the bounded forms here are fine.
- **`Read`/`Edit`:** gitignore-style globs. On Windows, paths normalize to POSIX
  (`C:\Users\x` → `/c/Users/x`). A leading `/path` is **project-root-relative**, not absolute —
  use `//abs/path` for a true absolute.
- **Leading `cd`:** `cd dir && git …` does **not** get `git` auto-allowed by a `cd` rule — which
  is exactly why the routine relies on broad `allow: ["Bash"]`, not on per-tool prefixes.

## 5. The scope ceiling (what deny does NOT see)

> **Deny matches the Bash *command line*. It does not see *inside* a process.**

- A **script file** or **interpreter** that does damage *internally* (a `.sh` that deletes, a
  `python script.py` that calls `os.remove`, a `node` program that fetches-and-execs) is **not**
  caught by a command-line deny — the deny only saw `bash foo.sh` / `python script.py`.
- This is the reason the deny-list blocks the **inline** arbitrary-exec hatches (`bash -c`,
  `sh -c`, `eval`, `node -e`, `python -c`) — those put the payload *on the command line* where the
  guard can see it. A payload moved *into a file* is past the guard.
- **Pipe-to-shell** (`curl … | sh`) is the same class: the dangerous part executes inside the
  piped shell's stdin, not on a deny-able command line.
- **What carries this weight is NOT the permission file** — it is the backstop: a **low-privilege
  bot** (can't merge/escalate), a **disposable worktree** (recoverable blast radius), and
  **credential scoping** (no prod creds in-session). For OS-level enforcement across arbitrary
  child processes, Claude Code **sandboxing** is the separate mechanism (out of scope for this
  template; adopt it at L3 if your threat model includes a hostile coder, not just an honest one).

## 6. Smoke-verify (2 checks, once per harness version)

1. A compound recon command (`cd <wt> && ls`) runs **silent** → broad allow works.
2. A denied command inside a compound (`true && rm -rf /tmp/x`) is **blocked** → deny bites
   per-sub-command.

If (2) is not blocked, something in the local config is overriding the deny (a stray `allow` for
that exact command, or an edited file) — fix it before launching coders.
