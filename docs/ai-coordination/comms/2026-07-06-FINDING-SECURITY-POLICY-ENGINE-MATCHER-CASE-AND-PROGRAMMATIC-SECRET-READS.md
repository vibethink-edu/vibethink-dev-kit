# FINDING · SECURITY — policy-engine matcher: case-sensitivity bypass + programmatic secret-read gap

- **From:** Claude Code (Opus 4.8) · role **wb-arq** (WorkBench), routing to **devkit-arq**
- **Date:** 2026-07-06
- **Category:** `SECURITY` · **Suggested action:** `FIX` (kit-owned engine) + `ESCALATE-TO-ARCHITECT` (Marcelo)
- **Trigger:** WB coder-carril audit-close (`vibethink-workbench` PR #704 · `AUDIT-CLOSE-WB-CODER-CARRIL-2026-07-06.md`). Findings **F5/F6** were routed to the kit because the policy-engine is a kit instrument — **not to be patched in WorkBench**. Confirmed independently against the kit source of truth (`tools/policy-engine/engine.mjs`), not just repeated from the audit.
- **Scope note:** filing only — no kit code touched (kit is delicate; devkit-arq executes, Marcelo seals).

---

## F6 (SECURITY) — matcher is case-sensitive → NEVER-TOUCH-LAW / TAMPER-CI bypass on case-insensitive filesystems

### What
Manifest-compiled rules and part of the static floor match **case-sensitively**, so an uppercased spelling of a governed path or command evades the rule while the OS (Windows / macOS default — case-insensitive FS) resolves it identically. `.GITHUB/workflows/…`, `GOVERNANCE/policy/…` pass `ALLOW`.

### Where (kit source of truth)
1. **`tools/policy-engine/engine.mjs:268`** — `compileManifest` builds every enforce matcher with
   ```js
   const re = new RegExp(enf.match.pattern);   // no flags → case-sensitive, and no path canonicalization
   ```
   No `i` flag, no path canonicalization. A rule pattern like `\.github/workflows` will not match `.GITHUB/workflows`.
2. **`tools/policy-engine/engine.mjs:118` and `:120`** — the STATIC_FLOOR **force-push** and **hard-reset** patterns omit the `/i` flag, while every sibling floor pattern (identity `:114`, recursive-delete `:124`, secret-file-read `:129`, pipe-to-shell `:134`, self-protection `:146`) has `/i`. Internal inconsistency inside the floor itself.

### Why it bites (demonstrated, not just theorized)
- On a **case-insensitive FS** the uppercased path is the *same file*, so a coder that writes `.GITHUB/workflows/ci.yml` tampers CI while the matcher sees no hit → `ALLOW`. This defeats `WBCR-NEVER-TAMPER-CI` / never-touch-law exactly where it matters (Windows operator machines).
- The floor-casing gap is directly reachable: **`GIT push --force`** / **`Git reset --hard`** (capitalized command name) is a valid invocation in PowerShell/cmd (command lookup is case-insensitive) but `\bgit\b` without `/i` (`:118`/`:120`) never matches `GIT`/`Git` → the destruction floor is silently skipped.

### Suggested fix (kit)
Canonicalize the matcher before testing: **case-insensitive** (`i` flag on compiled rules + on the two floor patterns) **and canonical-path** normalization (collapse case + separators for path-shaped rules), **tool-aware**. Add `i` to `:118`/`:120` regardless. This is the same root as F4 below — one canonicalization pass closes both.

---

## F5 (SECURITY) — secret-read floor only catches shell readers, not programmatic reads

### What
The static floor for secret-file reads enumerates **shell CLI readers** only; a language-runtime read of `.env` (`node -e`, `python -c`) is not matched → `ALLOW`.

### Where
**`tools/policy-engine/engine.mjs:129`**
```js
floorPolicy("secrets", "secret-file read",
  /\b(cat|type|less|more|head|tail|get-content|gc)\s+[^\s|;&]*\.env(\.[\w.]+)?\b/i),
```
Catches `cat .env`, `type .env`, `Get-Content .env`, etc. — but **not**:
- `node -e "console.log(require('fs').readFileSync('.env','utf8'))"`
- `python -c "print(open('.env').read())"`
- `node --eval …`, `deno eval …`, `ruby -e …`, and similar `-e/-c/--eval` one-liners.

### Why it bites
A governed coder behind the engine can exfiltrate/read secrets by routing the read through an interpreter the floor doesn't enumerate. The audit classified this as **matcher-proof, not a demonstrated leak** — but it is the exact shape the secrets floor exists to stop, and the pipe-to-shell floor (`:134`) already shows the engine reasons about interpreters, so the gap is a coverage omission, not an architectural limit.

### Suggested fix (kit)
Extend the secrets floor to catch programmatic reads that reference a secret path — an interpreter (`node|deno|bun|python3?|ruby|perl|php`) invoked with `-e|-c|--eval|--exec` whose payload references `.env`/secret paths, and the common `fs.readFileSync|readFile|open(...)` shapes over `.env`. Conservative-but-broader, consistent with the floor's "catch the unambiguous shapes" doctrine (`:94`).

---

## F4 / C3 (P2, coherence — same root as F6) — matcher does not canonicalize; §7-ASK shadowed by floor DENY

### What / Where
- **Over-denies:** a rule pattern that names a governed path fires even when the path only appears inside a *glob argument or a comment mentioning it* (deny-of-too-much).
- **Under-denies:** the case gap of F6 (deny-of-too-little).
- **§7-ASK shadowing:** `engine.mjs:171` appends `STATIC_FLOOR` last; a floor `DENY` short-circuits (`:198`) and discards an already-accumulated manifest `ASK` for the same shape — so a rule the manifest declares as **§7-ASK** (ask the human) surfaces as **DENY** in practice. Safe-side (DENY over ASK), so **declared-vs-real incoherence, not a hole** — but worth reconciling.

### Why / Suggested fix
F4 (over-deny) and F6 (under-deny) are **one root**: the matcher does not canonicalize (case + path + tool-awareness). A single canonicalization pass closes both. For the §7-ASK shadow, decide the intended precedence explicitly (floor-DENY-wins is defensible — just document it so the manifest's ASK isn't read as a promise the engine won't keep).

---

## Provenance
- Confirmed by reading `tools/policy-engine/engine.mjs` (lines cited) and `patterns.mjs` directly in `_vibethink-dev-kit` (kit source of truth), not from the WB copy.
- Original triangulated audit (Opus constructor + Fable auditor + Codex tie-breaker): WB `#704`.
- **SECURITY → Marcelo:** escalated per Rule #20 (SECURITY + ESCALATE-TO-ARCHITECT go to Marcelo immediately).

## Verdict
- **VERDICT:** `FINDING-SECURITY` (2× SECURITY: F6 case-bypass, F5 programmatic-secret-read gap) + `P2` coherence (F4/C3).
- **ARTEFACTO:** this file (dev-kit comms lane) + WB `#704`.
- **SIGUIENTE ACCIÓN HUMANA:** Marcelo/devkit-arq deciden si el fix de canonicalización + ampliación del floor de secrets entra como slice del policy-engine (kit-owned).
- **MENSAJE PARA devkit-arq:** un solo fix de canonicalización (case-insensitive + path canónico + tool-aware) cierra F6 **y** F4; F5 es una ampliación del regex de secrets. No parchear en WorkBench.
- **SIGUIENTE PASO DEL AGENTE:** wb-arq continúa con F1 (watchdog P0) en WorkBench; no toca el kit.
