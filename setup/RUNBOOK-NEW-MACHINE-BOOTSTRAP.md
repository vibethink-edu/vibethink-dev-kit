# Runbook — Bootstrap on a new machine (agent session)

> Origin: a consuming product's founding day (2026-06-12), tested on Windows Server. Gets any
> machine from zero to a working governed session.

## Steps

1. **GitHub CLI:** install `gh` (winget/MSI/brew). Then:
   `gh auth login --hostname github.com --git-protocol https --web`
   — the agent can run this and surface the one-time code; the HUMAN approves
   at github.com/login/device. **Org gotcha:** in the browser, also authorize
   the organization (the "Authorize/Grant" button next to the org name) or
   private org repos will 404.
2. **Clone the kit + the product repo(s)** as siblings:
   `gh repo clone <org>/vibethink-dev-kit` · `gh repo clone <org>/<product>`
3. **Git identity** (per repo or global): `git config user.name/user.email`.
4. **Node toolchain** (if the repo has package.json): Node LTS + `corepack
   enable` → `pnpm install` → hooks active. **Windows gotcha (lived):** husky
   hooks run under git-bash, which does NOT pick up a machine PATH updated
   mid-session — add `export PATH="$PATH:/c/Program Files/nodejs"` at the top
   of each hook (or restart the session), or every commit fails with
   `node: command not found`.
5. **Session start:** `pnpm session:start` (hygiene scan + inbox) or read the
   repo's README "Para trabajar" section for the session prompts.
6. **Sensitive data never travels via GitHub** — if a task needs local-only
   data (e.g. a data subset), it runs on the machine that holds it; the
   briefing must say so.

## Done when
- [ ] `gh auth status` shows the org account
- [ ] product repo cloned, `git pull` works
- [ ] governance validators run green (or PENDING declared honestly)
