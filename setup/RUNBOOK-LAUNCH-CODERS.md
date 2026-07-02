# RUNBOOK — How to configure and launch coders (executors)

> **What this is.** The **operational how-to** for standing up and launching autonomous
> coders (executors). It is the *how*; the *why/what* is canon:
> [`CANON-CODER-SAFE-IDENTITY-001`](../knowledge/ai-agents/CANON-CODER-SAFE-IDENTITY-001.md)
> (identity, auth gate, per-session isolation, PREP) and
> [`CANON-CODER-ORCHESTRATION-001`](../knowledge/ai-agents/CANON-CODER-ORCHESTRATION-001.md)
> (command hygiene, the design gate, wave shape). This runbook does not re-derive them —
> it walks you through instantiating them. Everything in `<…>` is an L3 choice for your repo.

---

## 0. Mental model (one paragraph)

A coder is an agent session that **pushes as a low-privilege bot** (propose-only: it opens
a PR, it cannot merge or bypass review), runs in **its own worktree**, and is launched by
**one command** that a non-executor session (PREP) prepared. The launch wires three things:
an **identity gate** (refuse to run unless the session's own credential is the bot), a
**per-session allowlist** (silence the routine, keep identity/destruction/secrets prompted),
and a **launch prompt** (the spec to build + how to write commands that don't stall on the
permission gate).

---

## 1. Prerequisites (one-time, per repo)

1. **A low-privilege bot identity.** A separate account with **write but not admin** on the
   repo — it can push a branch and open a PR, but cannot merge, bypass protection, or
   self-approve (`CANON-CODER-SAFE-IDENTITY-001` §3). `<bind the concrete bot account>`.
2. **A protected default branch.** Require PR + review; forbid force-push/deletion. This is
   the lock; the bot identity is what makes it bite (`…SAFE-IDENTITY-001` §3).
3. **A per-session credential mechanism.** A way to inject the bot's token **into the launch
   shell's environment** so the agent process and its children inherit it — never written to
   a file (`…SAFE-IDENTITY-001` §4/§9). `<bind the env-var name>`.
4. **Provisioned optional tooling (if the repo uses any).** If coders are expected to use
   per-user-installed tools (a CLI installed under the user's home), provision them in the
   launch's PASO 0 — and beware the **"installed ≠ on PATH" gotcha**: a package can be
   installed yet its CLI not resolve by name because the per-user binary dir is not on PATH.
   - **Verify the CLI *resolves by name*** (run its `--help`), not merely that the package is
     present — "installed ≠ available" is the trap. The provisioner should detect the per-user
     binary dir, prepend it to the launch session's PATH, and report the exact dir.
   - **A fresh shell is required.** A process freezes its PATH at startup, so fixing PATH does
     **not** reach already-open shells (stale-shell) — only a new shell/launch picks it up.
     Since the launch script starts the agent as a child of a fresh shell, fixing PATH there
     propagates correctly. Absence degrades, never blocks (use-by-default, §7 / `…ORCHESTRATION-001` §10).

---

## 2. Build the launch surface (PREP — once per wave)

PREP is a **skill any non-executor session performs** (`CANON-SKILLS-OVER-ROLES`); it only
writes local files, so it does **not** need the bot credential. Per wave it prepares, so
launching each coder is one command:

- **a launch script** (§3) that runs the identity gate, enters/creates the worktree, writes
  the per-session settings, and starts the agent with its prompt;
- **a per-session settings file** with the allowlist + deny-guard (§5);
- **one prompt per spec** (or a family/base prompt) carrying the command-hygiene section (§6).

---

## 3. The launch script anatomy

A launch script, in order (pseudocode — bind to your shell/harness/forge):

```
# input: <spec-id>     # token (e.g. the bot's credential) expected in the session ENV, not here

# 1) IDENTITY GATE (CANON-CODER-SAFE-IDENTITY-001 §5) — verify THIS session, abort otherwise
if   <session credential is unset>                 -> ABORT "set the bot token in this shell first"
if   <forge CLI's own auth login> != <bot login>   -> ABORT "active identity is not the bot; refusing to push"
<forge CLI: set up git auth>

# 2) WORKTREE (CANON-BRANCH-WORKTREE-LIFECYCLE §5/§7) — dedicated, from the LATEST integration head
if   <worktree for this spec does not exist>:
       <fetch integration branch>
       <add worktree at C:/tmp/<prefix>-<spec> on a new branch from origin/<integration>>
<enter the worktree>

# 3) PER-SESSION SETTINGS (§5) — rewritten each launch so the current policy always applies
<write .<harness>/settings.local.json with the allowlist + deny-guard below>

# 4) LAUNCH — FEED THE PROMPT VIA STDIN (not a CLI arg), headless + bypass, deny-guard active
<prompt-for-this-spec + ">>> YOUR ASSIGNED SPEC: specs/<spec-id>">  |  <runtime> <headless-flag> <bypass-flag>
```

**The launch contract (agnostic — derive it, don't improvise step 4):**

1. **Feed the prompt via stdin, never as a CLI argument.** A per-spec prompt is multi-KB; passed
   as an argument it overflows the command-length limit (shell/OS/runtime) — so it is **piped**
   (`<prompt> | <runtime> …`). This is command-hygiene (§6) at the launch boundary.
2. **Headless + bypass, with the deny-guard still biting.** The coder runs unattended over the
   routine in the runtime's bypass mode; the **DENY** of §5 / `CANON-CODER-ORCHESTRATION-001` §7
   (identity-change, destruction, secrets, arbitrary-exec) still apply — bypass silences the
   *allow*-prompts, never the deny-guard.

**Runtimes fall into two classes — same contract, different invocation (the concrete list is L3):**

| Class | What changes | What stays | What does NOT carry over |
|---|---|---|---|
| **1 — API-compatible with the host agent** | only an **env preset** (base URL + auth token + model) | the launcher and the step-4 line are **identical** | — |
| **2 — its own CLI** | its **own binary + flags** | the **contract** above (stdin + headless + bypass + worktree) + the **identity gate** (git push identity is the bot's token, runtime-agnostic) | the **step-3 per-session deny-guard** — another binary does not read the host harness's `settings.local.json`, so a Class 2 run is **bypassed with no guard biting** |

> The concrete runtime matrix (which runtimes, their env vars / binaries / flags, and any
> per-runtime gotcha — e.g. a `--yolo`-style flag that also turns on a sandbox that can fight the
> worktree/bypass) is a **per-repo L3 binding** — it names vendors, so it lives in the consumer's
> launch dir, not this neutral runbook (same boundary as the Claude-CLI worked example, §9).

**Class 2 adoption notes (proven by a consumer's first live Class 2 runs — a docs-only job and a
pure-logic implementation, both merged after independent review):**

1. **ROUTING RULE (the governance consequence of the deny-guard gap above):** route **mechanical /
   docs / pure-logic** specs to Class 2 freely; keep **BOUNDARY specs (untrusted input, auth,
   DB, sandbox — §7 design-gate class) on Class 1**, where the per-session deny-guard bites,
   until an equivalent Class 2-side guard exists. Do not build that guard speculatively —
   build-on-pain, the routing rule covers the risk at zero cost.
2. **Default-model-vs-CLI-version gotcha:** a Class 2 CLI invoked without an explicit model uses
   the CLI's *default* model, and that default can require a **newer CLI than installed** (the
   run fails at launch, not mid-job). Two valid mitigations: upgrade the CLI, or **pin the model
   at launch**. A launcher SHOULD expose a runtime-agnostic **model-pin** input (Class 1 → the
   model env var; Class 2 → the CLI's model flag); empty = the runtime's own default, with this
   caveat.
3. **MCP hygiene under headless:** interactively-authenticated MCP servers configured in the
   Class 2 CLI fail auth in headless runs (non-fatal, but they pollute the log and burn startup
   time). Disable unused MCP servers in the runtime's config for launch-surface runs.

**Prompt selection:** `prompt-<spec-id>` if it exists (a specific spec, e.g. a boundary spec
with its design gate) → else a **family** prompt (e.g. a shared wiring prompt) → else the
**base** prompt. Keep boundary specs on their own prompt so the design gate (§7) is explicit.

> **Identity gate (step 1) is an ALLOW-LIST — not a deny-list.** The gate must **positively
> confirm the active identity IS the bot** ("abort unless active == bot"). Do **not** weaken it
> to a deny-list ("abort only if active is a human/owner") for the convenience of dropping a
> bot-login arg: a deny-list is the `CANON-AUDIT-PROTOCOL` §8.1 anti-pattern — an identity that
> is **neither the bot nor an enumerated human** (a stale token, a third bot, the unexpected)
> would **pass as the bot**. The frictionless gain is marginal (the bot token is in the env
> either way); the hole is real. Confirm the bot positively.

---

## 4. Resuming after a closed terminal

The per-session credential lives in the shell's environment and **dies when the terminal
closes**. To resume: exit the agent → re-set the token in a fresh shell → resume the session
by id. (A bare interrupt is not enough — the process already captured its environment at
launch.) Work already committed in the worktree is safe.

---

## 5. The allowlist (what to cover / what NEVER to cover)

The allowlist is **scoped to the session/worktree, never global, never committed** to the
repo (`CANON-CODER-SAFE-IDENTITY-001` §8). It auto-allows the **routine** and leaves the
**gates** prompted. Skeleton (bind the concrete tool names):

```jsonc
{
  "permissions": {
    "allow": [
      // version control, package manager, build/runtime, the forge's read + PR commands
      "<VC> *", "<package-manager> *", "<runtime> *", "<forge> pr *", "<forge> api *", "<forge> auth status",
      // read-only shell utilities (file recon is better via the harness's file tools)
      "<grep>", "<cat>", "<tail>", "<head>", "<find>", "<sort>", "<uniq>", "<wc>", "<diff>",
      // the harness's file tools — need no prefix-match at all
      "Read", "Edit", "Write", "Glob", "Grep"
    ],
    "deny": [
      "Read(<secret-file>)", "Read(<secret-file>.*)",   // never read secrets
      "<recursive-delete>", "<read of any *.env*>"        // never destroy / leak
    ]
  }
}
```

**NEVER allowlist** (these stay prompted/denied on purpose — `CANON-CODER-ORCHESTRATION-001` §7):
identity change (the forge CLI's login/switch), recursive delete / force-push / hard reset,
secret-file reads, and **arbitrary-execution wildcards** (`<interpreter> *`, `<shell> *`,
`eval`, remote-shell, a raw forge-API wildcard, a task-runner wildcard). If a recurring
script needs one, give it a fixed name and allowlist that **exact** invocation.

> **Beyond the allowlist's ceiling — the permissive-deny posture:** on your own trusted
> worktrees, instead of chasing every pattern, **broadly allow Bash and let an airtight `deny`
> list be the boundary** (`deny` wins; the harness checks each sub-command of a compound). A
> ready instance is **`setup/templates/coder-permissions/`** (`settings.local.json` + README):
> it auto-allows the routine, denies identity-change / destruction / secret-reads / cloud-apply
> / arbitrary-exec hatches, and **leans on the backstop** (low-priv bot + disposable worktree +
> credential scoping) rather than pretending to be airtight. The **Claude-Code-specific scope**
> (precedence, what `bypassPermissions` does and does NOT cover, the command-line-only ceiling) is
> pinned in that folder's `CLAUDE-CODE-SCOPE.md`. **You don't need bypass mode** —
> `allow: ["Bash"]` + `deny` already silences the routine while the guard bites (deny is enforced
> even under bypass; bypass only skips allow-prompts). Smoke-verify that a denied command inside a
> compound is still blocked; and mind the GUI-vs-CLI gotcha — a desktop GUI may not honor a
> settings-file default, so confirm the mode in the app's selector.

## 6. The command-hygiene section to embed in every prompt

Paste a section like this into the launch prompt (lever **a** of
`CANON-CODER-ORCHESTRATION-001` §4). Each "never" is paired with its clean form (§5):

- **File recon → use the harness's file tools** (Read/Glob/Grep), not shell `ls`/`cat`/`grep`.
- **Never `cd "<dir>" && <cmd>`** — your worktree is already the working dir; point VC at the
  path with a literal flag (`<VC> -C "<literal-path>"`).
- **Never variables or env-prefix** (`$VAR`, `NAME=…`, `VAR=x cmd`); never an expandable
  string with an embedded expression (a `"…$expr…"` status-echo). Put the **literal value**
  in each statement. A commit trailer goes **literally** inside the commit, not in a variable.
- **DB/SQL → feed a file** (`-f file`), not a heredoc; **commit messages → feed a file**
  (`-F file`), not an inline message flag (avoids glob-like tokens like `<->` tripping the gate).
- **Avoid pipes/loops/substitutions** in commands you want silent — let a long command finish
  and read its output with the file tools; put recurring loops in a named, allowlisted script.
- **Prefer the POSIX shell** over a shell whose expandable strings turn status-echoes dynamic.
- **Do not touch the architect's governance instruments** (the present-mirror, the decision
  register — `CANON-STATE-MIRROR-AND-DECISION-REGISTER-001`); report to the coordination
  channel and append to the history log only.

## 7. Gates and wave shape

- **Boundary specs** (identity, access control, security, sensitive data): the coder produces
  plan/data-model/tasks and **presents them for approval before writing sensitive code** (the
  **design gate**, `CANON-CODER-ORCHESTRATION-001` §8). Mechanical specs run autonomously
  after a canary. Either way: draft PR, no merge, no self-approve.
  - **Under a headless launch the design gate is TWO LAUNCHES — there is no live pause.** A
    headless coder runs to the end; it cannot stop mid-run to ask for the GO. So for a
    **boundary** spec the gate is materialized as two phases:
    1. **Plan-only launch** — the coder reads the spec, produces its plan (call-sites, routes,
       migration plan) as a **durable, reviewable artifact** (a committed plan file, or a draft
       PR carrying **only** the plan — never just printed to stdout, which is not a gate), and
       **terminates**.
    2. *(human reviews the plan and gives the GO)*
    3. **Implementation launch** — re-launch with the GO to write the sensitive code.

    **The re-launch must be frictionless — phase 1 and phase 2 are two separate runs of the same
    launcher that share the *worktree*, not a live process** (the worktree, not a running agent,
    carries the approved plan across the GO). The launcher typically `cd`s into the worktree to run
    the agent there, so it MUST (a) **return the operator to the invocation directory** afterward
    (push/pop, not a bare `cd`) and (b) on the **plan** phase **print the exact phase-2 command**.
    Otherwise the operator is stranded in the worktree, unable to find the launch script to run
    phase 2 (lived 2026-06-20: after a plan-only run the operator asked *"do I close the bot and run
    it again?"* and then *"the launch-coder is no longer there"* — it was a bare `cd` into the
    worktree, and the plan-phase coder had already exited cleanly on its own).

    For **mechanical** specs the single autonomous run + draft PR (the gate lives in the PR
    review) is enough. This maps 1:1 to §8's boundary/mechanical split — the draft-PR gate
    alone approves *after* the code is written; the two-phase flow restores §8's *approve the
    plan before the sensitive code* where the live pause does not exist.
- **Wave shape** (§9): pieces that **depend** → launch **sequentially** along the spine; pieces
  that are **independent** → **fan out**, one coder per worktree. Dependent coders branch from
  the **latest integration head at launch time** to inherit merged foundations.

## 8. Definition of done for a coder session

The coder exits with every branch it touched in one of three states (`CANON-GIT-HYGIENE` §3 +
`CANON-BRANCH-WORKTREE-LIFECYCLE`; vocabulary `CANON-MULTI-AGENT-ORCHESTRATION` §2.2):
**PUSHED**, **READY-PR** (draft PR open), or **DISCARDED**. No uncommitted WIP at exit; a
final report to the coordination channel (state per task, verification matrix); and, if the
spec has a row in the dispatch board, its row updated.

---

## 9. Worked example — Claude CLI (PowerShell)

This is the concrete shape any agent uses to **produce the launch instruction** for a coder running
as a `claude` CLI session. The launcher (`launch-coder.ps1`) is the consuming repo's L3 instance of §3;
the agent does **not** invent the command — it hands the human this exact frame.

**The instruction to emit (per coder):**
```powershell
# Once per terminal — the bot token lives in the ENV, never in a file (§5):
$env:GH_TOKEN = "<PAT of the coder bot, e.g. colupbot-coder>"
cd "<repo>/ops/coder-launch"

# One coder per terminal (run several terminals for a parallel wave):
.\launch-coder.ps1 <spec-id>        # e.g. 028-config-academica
```

**What the human sees happen (the launcher does §3 automatically):**
1. **Identity gate** — aborts unless THIS session's `gh` is the coder bot (never pushes as someone else).
2. **Clean worktree** from the latest `origin/main` → `<tmp>/wt-<spec-id>` (reused if present).
3. **Per-session `settings.local.json`** written into that worktree (allowlist + deny-guard, §5) so the
   session runs without stalling on every prompt, while identity/destruction/secrets stay gated.
4. **Launches `claude`** in the worktree with `prompt-<spec-id>.txt` (or `prompt-base.txt`) + the line
   `>>> YOUR ASSIGNED SPEC: specs/<spec-id>`.

**To launch ANY new spec** (not a fixed list): ensure `prompt-<spec-id>.txt` exists (carrying the
command-hygiene section of §6 + the design-gate for boundary specs), then the instruction is always the
same frame above with the new `<spec-id>`. The coder opens a **draft PR as the bot, never merges**, and
**stops at the boundary gate** (new RLS/migration) for the architect to verify before apply.

**Resuming / parallel:** see §4. One `$env:GH_TOKEN` per terminal; coders on independent specs (distinct
tables/providers) don't collide. The consuming repo names the concrete launcher + token var (L3, §1);
this appendix is the Claude-CLI binding of the agnostic body above.
