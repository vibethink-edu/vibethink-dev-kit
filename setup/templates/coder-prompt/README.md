# Coder-prompt template — make the launch prompt explicit

The launch prompt's structure was previously **tribal knowledge** — implicit across
`CANON-CODER-ORCHESTRATION-001` §4a (the command-hygiene lever) and
`RUNBOOK-LAUNCH-CODERS` §6 (the section to embed). A repo without an architect who
knew it either did not use coders or improvised them — losing the guardrails. This
template names the structure so any repo can stand up a governed coder prompt.

## The structure (named, not implicit)

| Section | Role |
|---|---|
| **CONTEXT** | who the coder is (low-priv bot, propose-only, own worktree) + the one-line job |
| **MODEL** | which model tier; stronger for boundary, cheaper for mechanical |
| **PIECES** | the canons that govern it — read, don't re-derive |
| **STEP 0 — IDENTITY** | confirm THIS session is the bot before any push; abort otherwise |
| **READ IN ORDER** | the spec → the governing canons → the touched code, before writing |
| **HARD RULES** | command hygiene — each "never" paired with its clean form (`…ORCHESTRATION-001` §5) |
| **DESIGN GATE** | boundary specs present design before sensitive code (§8) |
| **DO-NOT** | the gates that bite — identity / destruction / secrets / arbitrary-exec |
| **DEFINITION OF DONE** | every branch ends PUSHED / READY-PR / DISCARDED; final report |

## Adopt in two steps

1. **Copy** `prompt-base.template.txt` → your launch dir as `prompt-base.txt`; fill the
   `<…>` placeholders (repo, model, your root-rules path). For each **boundary spec**,
   make a `prompt-<spec-id>.txt` so its design gate is explicit (the launcher prefers a
   spec-specific prompt over the base — `RUNBOOK-LAUNCH-CODERS` §3).
2. **Wire** it into your launch script (`RUNBOOK-LAUNCH-CODERS` §3): the script selects
   `prompt-<spec-id>.txt` → else `prompt-base.txt`, and appends `>>> YOUR ASSIGNED SPEC`.

## Where this sits

This is the **artifact you copy and fill**; the *how-to* is `RUNBOOK-LAUNCH-CODERS`, the
*why/what* is the two coder canons. Same relationship as every other kit template (you
fill the template; the canon governs it). The readiness of the surrounding launch
surface (script + settings + bot token) is checked by the **coder-launch-readiness**
instrument; the live forge state (bot is low-priv, branch protected) stays your L3
confirmation.
