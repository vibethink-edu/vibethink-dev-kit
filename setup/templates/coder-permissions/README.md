# Coder permissions — the permissive-deny posture (heritable)

> **What this is.** The concrete per-session `settings.local.json` a launcher writes into a
> coder's worktree so the coder runs a long session **without stalling on a prompt at every
> step**, while the **gates that protect identity / destruction / secrets / cloud still bite**.
> It is the L3 instantiation of `CANON-CODER-ORCHESTRATION-001` §4/§7 (bypass keeps the
> deny-guard, never dissolves the identity gate) and `CANON-CODER-SAFE-IDENTITY-001` §8
> (scope to the session, never global, never committed, guard even in bypass).

## Why this exists

A per-command gate auto-allows only what it can **prefix-match**. Routine work is full of
compound / expandable forms (`cd "<wt>" && pnpm install`, `VAR=x cmd`, pipes) that match
nothing — so they prompt, and you click "yes" a hundred times. The fix is to **broadly allow
Bash and let an airtight `deny` list be the boundary** — `deny` wins over `allow`, and the
harness checks each sub-command of a compound, so `foo && rm -rf x` is still caught.

## The two golden rules (do not break these)

1. **Close the arbitrary-execution hatches.** Under broad Bash allow, if you do not deny
   `bash -c` / `sh -c` / `eval` / `node -e` / `python -c`, the whole deny-list is bypassable in
   one line (`bash -c "rm -rf x"`). Denying them is **not optional**.
2. **The identity gate stays intact.** `gh auth login/switch/logout` is never auto-allowed.
   That is the line `CANON-CODER-SAFE-IDENTITY-001` §5 does not let cross.

## What carries the weight (read this before trusting the list)

The deny-list is the **first layer against an honest coder's mistake** — not a wall against a
hostile one. What actually contains a bad command is the sealed backstop:

- **Low-privilege identity** — the coder pushes as a propose-only bot: it cannot merge, bypass
  review, or reach the default branch. (`CANON-CODER-SAFE-IDENTITY-001` §3)
- **Disposable worktree** — the blast radius of a destructive command that evades the list is
  the coder's own worktree, which is recoverable. (`CANON-BRANCH-WORKTREE-LIFECYCLE`)
- **Credential scoping** — prod/cloud creds are **not** in the coder's session env, so a
  `psql`/`supabase` against the cloud fails auth regardless of the permission file. (§4)

> **Design stance:** keep the list **tight and precise, not exhaustive**. A noisy deny-list that
> blocks routine work trains people to add exceptions — and then it rots. Lean on the backstop.

## The deny-list (what is blocked, and why)

| Category | Blocked | Rationale |
|---|---|---|
| **Identity** | `gh auth *`, `git remote set-url/add` | dissolving the identity gate / redirecting the push to another remote |
| **Destruction** | `rm -rf/-fr/-r`, `git push --force/-f/--force-with-lease`, `git reset --hard`, `git clean -f`, `dd`, `mkfs` | irreversible damage to the tree/history |
| **Secrets** | reading `.env*`, `.npmrc`, `credentials`, gh `hosts.yml`, `*.pem`, `id_rsa*`; `env`/`printenv`/`export` | leaking the bot's session token or creds into logs |
| **Cloud-apply** | `supabase db push`, `supabase functions deploy`, `supabase link`, `npm/pnpm publish`, `vercel`, `terraform apply`, `kubectl apply` | mutating production / publishing — irreversible, outside the worktree |
| **Arbitrary-exec** | `bash -c`, `sh -c`, `eval`, `node -e`, `python -c`, `python3 -c`, `xargs` | the escape hatches that would make all of the above bypassable (golden rule 1) |

Everything else — recon, build/test, **local** psql, routine git, `gh pr/api`, the file tools,
and their compound forms — runs **silent**.

## Honest residual gaps (covered by the backstop, not the file)

Two dangerous shapes **cannot** be cleanly pattern-denied, so the file does NOT claim to:

- **`psql` against a remote/cloud host** — the host can't be reliably patterned, and
  `allow`-broad + `deny`-wins can't express "local yes, remote no". Gated instead by
  **credential scoping** (no prod DB creds in the coder env, §4). Local psql stays silent.
- **pipe-to-shell** (`curl … | sh`, `… | bash`) — a pipe target isn't a deny-able prefix, and
  blanket-denying `bash`/`curl` would kill the wrapper scripts and health checks. Contained by
  the disposable worktree + the honest-coder threat model. (A hostile coder is out of scope
  here — that's what the identity asymmetry is for.)

Naming these is the point: a gate that hides what it does not cover reads as "airtight" when it
is not.

## Wire it (launcher / PREP steps)

1. The launch script writes this file to the coder worktree's `.claude/settings.local.json`
   **each launch** (so the current policy always applies), per `RUNBOOK-LAUNCH-CODERS.md` §3.
2. **Never commit it** to the repo and **never** make it global (`CANON-CODER-SAFE-IDENTITY-001` §8).
3. **You don't need bypass mode** — `allow: ["Bash"]` + `deny` already silences the routine while
   the guard bites; prefer it so there's no global "skip" flag to misapply. (For the exact
   Claude Code semantics — including the fact that `bypassPermissions` does **not** skip `deny` —
   see `CLAUDE-CODE-SCOPE.md` in this folder. The harness-specific behavior is pinned there, not
   guessed here.)
4. **Smoke-verify on your harness version (2 checks, once):**
   - a compound recon command (`cd <wt> && ls`) runs **silent** → allow-broad works;
   - a denied command in a compound (`true && rm -rf /tmp/x`) is **blocked** → deny bites
     per-sub-command.
   If the second one is NOT blocked, a stray local `allow` is overriding the deny — fix it before
   launching coders.

## A knob you may turn (per repo)

If your coders routinely rebase their **own** PR branch, you may move
`git push --force-with-lease` and `git reset --hard` from `deny` to `ask` (prompt) instead of
block — they stay gated either way (`CANON-CODER-ORCHESTRATION-001` §7 allows "denied OR
prompted"). The shipped default is the stricter **deny**.
