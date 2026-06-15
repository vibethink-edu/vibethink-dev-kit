# Claude Code permissions — reduce prompts safely (harness adapter)

> **Harness-specific on purpose.** This guide names **Claude Code** and its
> `settings.json` — it is an **adapter**, not neutral canon. It **binds** the
> agnostic principle to one harness: the *what/why* is canon
> ([`CANON-CODER-ORCHESTRATION-001`](../knowledge/ai-agents/CANON-CODER-ORCHESTRATION-001.md)
> §4–§5/§7 + [`CANON-CODER-SAFE-IDENTITY-001`](../knowledge/ai-agents/CANON-CODER-SAFE-IDENTITY-001.md)
> §8); the *how* (the concrete `settings.json` syntax) is here. Using a different
> harness? Apply the same principle to its config; the canon stays the source.

For a **developer** working in a kit-inheriting repo with Claude Code who is tired
of approving the same routine commands — without quietly opening a hole.

---

## §1 — Why you get prompted (it's structure, not danger)

Claude Code auto-allows a command only when it can **prefix-match** it against an
allow rule. A command prompts when it **can't be matched** — it leads with `cd`/a
variable, expands `$VAR`, uses a heredoc / pipe / loop / `$(…)`, or carries a
glob-like token (`<->`, `*`, `[..]`) **even inside quotes** — or when its tool
simply **isn't listed**. *Matchability decides the auto-allow, not how dangerous the
command is* (`CANON-CODER-ORCHESTRATION-001` §3).

So there are **two levers** (§4 of that canon): **(a)** write matchable commands
(the command-hygiene table, §5 — `git -C` not `cd && git`, literal values not
`$VAR`, a file not a heredoc, `-F file` not an inline message with glob tokens), and
**(b)** an **allowlist** for the routine. This guide is lever (b).

---

## §2 — The three files (where rules live)

| File | Scope | Committed? | Use for |
|---|---|---|---|
| `~/.claude/settings.json` | your machine, **all** repos | no (your home) | your personal routine allowlist |
| `<repo>/.claude/settings.json` | this repo, **everyone** | **yes** | the team's agreed routine + the **deny guard** |
| `<repo>/.claude/settings.local.json` | this repo, **just you** | **no** (git-ignored) | your local relaxations; never commit |

Rules are **prefix-match patterns**: `Bash(git *)` allows any `git` command;
`Bash(gh pr close*)` allows `gh pr close …`. More specific = safer.

---

## §3 — A safe starter allowlist (a regular dev's routine)

Paste into `<repo>/.claude/settings.json` (shared) or `~/.claude/settings.json`
(your machine). Covers the day-to-day without touching the gates:

```jsonc
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": [
      "Bash(git *)", "Bash(gh pr *)", "Bash(gh repo view*)", "Bash(gh api *)",
      "Bash(pnpm *)", "Bash(npm *)", "Bash(npx *)", "Bash(node *)",
      "Bash(grep *)", "Bash(cat *)", "Bash(ls *)", "Bash(tail *)", "Bash(head *)",
      "Bash(find *)", "Bash(diff *)", "Bash(wc *)", "Bash(jq *)", "Bash(test *)",
      "Read", "Edit", "Write", "Glob", "Grep"
    ]
  }
}
```

> `Bash(gh pr *)` covers the whole PR lifecycle (create / merge / close / comment /
> ready / edit / reopen) in one rule. Prefer the harness's **file tools**
> (`Read`/`Edit`/`Write`/`Glob`/`Grep`) over shell file utilities — they need no
> prefix-match at all and never prompt.

---

## §4 — What you NEVER allowlist (the gate that must keep biting)

These stay **prompted or denied — on purpose.** They are the boundary, not a gap
(`CANON-CODER-SAFE-IDENTITY-001` §8, `CANON-CODER-ORCHESTRATION-001` §7):

- **Identity change** — `gh auth login` / `gh auth switch`. Auto-allowing it
  dissolves the "who am I pushing as" gate. **Never.**
- **Destruction** — recursive delete, force-push, hard reset → put them in **`deny`**
  so they're blocked even under bypass (§5).
- **Secret reads** — reading `.env` / credential files → **`deny`**.
- **Arbitrary-execution wildcards** — never `Bash(python *)`, `Bash(bash *)`,
  `Bash(node -e *)`, `eval`, a remote shell, or a raw task-runner wildcard. If a
  recurring script needs one, give it a fixed path and allowlist that **exact**
  invocation.

The **deny guard** (put in `settings.local.json` or the project settings — it wins
even in bypass mode):

```jsonc
{
  "permissions": {
    "deny": [
      "Read(.env)", "Read(.env.*)", "Read(**/*.env*)",
      "Bash(rm -rf *)", "Bash(git push --force*)", "Bash(git reset --hard*)",
      "PowerShell(Remove-Item -Recurse -Force*)"
    ]
  }
}
```

---

## §5 — Bypass mode (trusted local worktrees only) + the GUI gotcha

On **your own trusted worktree**, instead of chasing every pattern you can run in
**bypass mode** — but the **deny guard (§4) still bites**, and never let bypass
dissolve the identity gate.

- **CLI:** `claude --dangerously-skip-permissions`, or `"permissions": { "defaultMode": "bypassPermissions" }` in settings.
- **Desktop app (GUI) — the gotcha:** the GUI **does NOT honor** `defaultMode:
  bypassPermissions` from a settings file (it's CLI-only). Enable it in the app:
  **Settings → "Allow bypass permissions mode"**, then pick it in the **mode
  selector** next to the send button. *(Sealed finding F3 — command-hygiene 2026-06-13.)*

---

## §6 — You add the rule, not the agent

Claude Code **refuses to let an agent loosen its own permission gates** on a vague
instruction ("just make it automatic") — that's a self-modification guard, and it's
the *same* least-privilege rule the canon preaches (`CANON-CODER-SAFE-IDENTITY-001`
§8: the executor never widens its own boundary). So a permission rule is **added by
you (the human)** — paste it into the file above, or use `/permissions` in an
interactive Claude Code terminal. The agent can *suggest* the rule; it can't *apply*
it to itself.

---

## §7 — First reduce the need: write matchable commands

The cleanest fix for "it keeps prompting" is often **lever (a)**, not a bigger
allowlist: the command-hygiene table in `CANON-CODER-ORCHESTRATION-001` §5 (each
anti-pattern paired with its clean form). A clean command never prompts and needs no
rule. Reach for the allowlist for genuinely routine tools; reach for hygiene for
everything that "shouldn't have prompted."
