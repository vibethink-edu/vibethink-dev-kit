# DELIVERY — Policy engine S2: sesión persistida + ASK con superficie de aprobación real + hook adapter (y el gaming merge-push, imposible)

**From:** dev-kit architect (Fable session, 2026-07-02)
**To:** the chief architect + kit maintainers
**Thread:** executes slice S2 of `2026-07-01-HANDOFF-ITEM3-POLICY-ENGINE-DESIGN-AND-ADOPTION-POSITION.md` on Marcelo's GO ("adelante", 2026-07-02). Contract law: `CANON-RUNTIME-POLICY-ENGINE-001` (SEALED, untouched). Instrument reference: `REFERENCE-POLICY-ENGINE-001` (SEALED D-052; §7 addendum rides this PR's seal path).
**Branch/PR:** `claude/feat-policy-engine-s2` (one PR, house pattern).

## What shipped

- **`tools/policy-engine/session-store.mjs`** (`VIBETHINK_POLICY_SESSION_V1`) — persisted per-session state (§5: counters, risk, cost, labels) + the **withheld-write ledger**: an ASK parks its writes as a PENDING under the action's stable key; `settlePending(approve: true)` is the **only** path that ever applies them; deny/timeout drops them unapplied (§3). Atomic writes (tmp+rename).
- **`tools/policy-engine/hook-adapter.mjs`** — the PreToolUse-style harness adapter (design decision 3). **The real approval surface is the harness's own permission prompt**: pre maps ALLOW/ASK/DENY to `permissionDecision allow|ask|deny`; post — the tool having RUN **is** the human's approval — settles and applies the parked writes (§11.4 ask-once rides approval labels). Fails CLOSED on any internal error. An L3 on another harness copies the file and rewrites only the wire mapping.
- **`tools/policy-engine/patterns.mjs`** — the §7 pattern menu as factories (thresholds/tiers are the CALLER's; nothing gates on a vendor model id): `costDowngradeGate` (§11.1 DENY-with-steer + soft-threshold ASK-once), `riskScore` (§11.2 accumulation + guarded-tool escalation), `rateLimit` (§7 cap).
- **Session-aware CLI** (`policy-engine.mjs` 1.1): `eval --session <file>` persists across calls and prints the pending key on ASK; new `approve|deny --session --key` subcommands settle it.
- **`match.unlessGrant`** (schema + gate check 6, `check-policy-manifests.mjs` 1.2) — the **governed exemption** shape, and with it **S1-P5 CLOSED**: `GIT-MUST-ALL-VIA-PR` (§7) now carries `enforce` — a direct push naming main/master as a ref token is DENIED unless the governed comm-send flow passes the **call-time grant** (`--grant commLane`) at invocation; persisted state never exempts (see review addendum below). Coverage declared PARTIAL (a bare `git push` carries no branch literal — stays with the golden trap).
- **`tools/policy-engine-session.test.mjs`** — 15 tests, S2 known-bads: denied ASK leaves NO side effects · contextual policies bite only through accumulation (same call: fresh session ALLOW, burned session DENY/ASK) · the exemption never weakens sibling rules (force-push DENIES even with the comm-lane label) · hook fails closed on garbage. `.gitignore` += `.policy-sessions/`.

## The demo (the §7 arm goes physical)

S1 made the force-push REWRITE impossible. The golden battery's known gaming case — merge origin/main + push directly (no rewrite, still a §7 violation, PR #216 review finding) — was still possible for an engine-gated agent in S1 (S1-P5, declared). In S2:

- **Without engine** (golden-tasks.test.mjs `merge-push` known-bad): RED — `origin/main was pushed to directly`.
- **Behind the engine** (same intent, law = the git-hygiene manifest only): `git pull` ALLOWED (local, lawful) → `git push origin main` **DENY — CANON-GIT-HYGIENE/GIT-MUST-ALL-VIA-PR (§7)** before the side effect → remote untouched → trap **GREEN**.

Codified permanently in the test suite, like S1's force-push demo.

## Verification (one-pass, local)

- S2 tests 15/15 · S1 tests 22/22 (untouched semantics) · gate tests 20/20 (nuevo known-bad de unlessStateLabel) · full CI glob GREEN · policy-manifests 32/32 · tool-versions · gate-integrity · doctor all clear · biome limpio.

## PENDIENTES (lo que S2 NO cierra)

| # | Pendiente | Dueño |
|---|---|---|
| S2-P1 | **Sello** del addendum §7 del reference (SEALED doc; el addendum va por el seal path de este PR) | Chief architect (review del PR) |
| S2-P2 | **Review adversarial independiente** antes de merge | Independent reviewer |
| S2-P3 | **Cablear el hook en un repo consumidor real** (ViTo: generalizar sus hooks punto-solución a políticas) — es el heir fire-test de S3 | S3 |
| S2-P4 | El comm-send governed flow todavía NO setea `labels.commLane` por sí mismo (el label existe y la exención funciona; el wiring del flujo real es del repo que adopte el hook) | S3 / heir wiring |
| S2-P5 | **S3**: contadores JSONL con naming OTLP (semilla del roadmap item 6) | Detrás de S2 |

---

## Addendum — independent adversarial review response (2026-07-02, REQUEST CHANGES → fixed)

Independent review: **1 P1 (confirmado con exploit), 1 P2, 1 P3** — los tres ACEPTADOS y corregidos en el mismo PR:

- **P1 (approval/session state alcanzable desde el tool plane; bypass verificado escribiendo `labels.commLane` en el JSON de sesión):** fix ESTRUCTURAL, no cosmético — el diseño de exención por estado persistido era el error:
  1. `unlessStateLabel` **eliminado** → **`unlessGrant`**: una exención se honra SOLO desde `event.labels`, el grant de **invocación** que pasa el flujo governado (`--grant commLane` en el CLI/hook que ese flujo posee). El estado persistido nunca exime — el exploit del reviewer ahora es un known-bad test (label forjado en sesión → DENY igual).
  2. **Floor `self-protection`** (no-removible): DENY de tool-calls que invoquen `policy-engine approve|deny` o `hook-adapter.mjs` (Post forjado), o que referencien el session store — self-settlement y tampering quedan fuera del plano governado. `eval` sigue alcanzable (leer un veredicto es inocuo).
  3. **Store fuera del workspace** por default (OS tmpdir).
  4. Known-bads nuevos: label forjado grants nothing · self-approve → floor DENY · tamper (redirección y `node -e` write) → floor DENY · Post forjado sin pending aplica nada.
  5. **Límite declarado** (reference §7): contra un agente que NO pasa por el engine, o exec arbitrario que el pattern-floor no ve (`node -e` genérico), el backstop es el static deny del harness (§8 del canon, CODER-ORCH §7) — no se pretende lo contrario.
- **P2 (falso positivo `feature/main-fix`):** ambos patrones (force-push Y all-via-PR) ajustados a forma de ref-token (`[\s:/+](main|master)(\s|$)`); tests fijan `feature/main-fix` → ALLOW, `HEAD:main`/`refs/heads/master` → DENY; el residuo (rama literalmente llamada `.../main`) declarado en coverage.
- **P3 (last-writer-wins solo en comentario de código):** contrato de despliegue subido al reference §7: UN writer por session file, store protegido fuera del workspace, nunca compartir sesión mutable entre agentes paralelos.

Suite tras los fixes: S2 **22/22** (7 tests nuevos de review) · S1 22/22 · gate 20/20 · glob completo GREEN · doctor all clear.
