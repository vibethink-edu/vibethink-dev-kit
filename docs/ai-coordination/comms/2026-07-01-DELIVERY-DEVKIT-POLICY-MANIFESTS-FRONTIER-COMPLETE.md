# DELIVERY — Policy-manifest frontier closed: 28 → 0 (32/32 sealed canons manifested)

**From:** dev-kit architect (Fable session, 2026-07-01)
**To:** the chief architect + kit maintainers
**Thread:** executes the frontier pending of `2026-07-01-DELIVERY-DEVKIT-POLICY-MANIFESTS.md` on Marcelo's "GO hazlo tú" (architect-executed instead of coder-dispatched). Instrument law: `REFERENCE-POLICY-MANIFESTS-001` (SEALED, D-051).

## What shipped (one PR)

- **28 new manifests** in `knowledge/policy/` — every remaining SEALED canon in `knowledge/{ai-agents,methodology,architecture}` now has its machine-readable projection. Total: **32 manifests · 177 rules**, each rule citing the § it derives from.
- **Ratchet extended 4 → 32** (`requireFor` — bidirectional: none of these can now silently disappear).
- **Frontier: 0** sealed canons unmanifested.
- Derivation method: 4 parallel drafting agents (7 canons each) reading each canon end-to-end, with the projection gate as the mechanical judge — all 32 GREEN on first gate run (status parity by exact token, every § anchored, watchers declaring their law, bidirectional ratchet).

## Verification

- `check-policy-manifests` → **GREEN 32/32**, frontier 0.
- Full house suite: 31 test files by glob (31/31) · canon-links · catalog-sync · gate-integrity · tool-versions · biome · ls-lint · doctor board — all GREEN.

## PENDIENTES (marcados explícitamente — lo que este PR NO cierra)

| # | Pendiente | Detalle | Dueño del siguiente paso |
|---|---|---|---|
| P-1 | **5 canons vigentes invisibles a la frontera** | La frontera cuenta solo token `SEALED`. Con token `approved`/`CANON` quedan FUERA de manifiesto y FUERA del conteo: `CANON-DEVELOPMENT-PROCESS` (¡la columna del §8.1!), `CANON-CROSS-AGENT-CONTEXT-LAYERING`, `CANON-NAMING-CONVENTIONS-001`, `CANON-TESTING-MINIMUM-BAR-001`, `CANON-VISUAL-BUG-TRIAGE-001`. Misma clase que el audit F-05 (vocabulario de status). Salida: normalizar sus Status (decisión de sello del chief architect) o extender la frontera a esos tokens — y entonces manifestarlos. | Chief architect (status) → arquitecto (manifiestos) |
| P-2 | **4 canons DRAFT correctamente excluidos** | `COMM-INTERNAL-VS-EXTERNAL`, `OBSERVABILITY-CLOSED-LOOP`, `VERTICAL-BOUNDARY`, `VERTICAL-UI-INHERITANCE` — no son ley sellada; se manifiestan cuando se sellen. | Se auto-resuelve con cada sello |
| P-3 | **158 de 177 reglas sin vigilante** (`watch: none` declarado, nunca silencioso) | Solo 19 reglas tienen instrumento hoy (13 gate + 6 golden-task). Las 158 son el mapa de trabajo del **item 3 (policy engine)** y de nuevas trampas golden — cada `note` dice "growth candidate". | Roadmap item 3 + crecimiento por incidentes |
| P-4 | **Fidelidad semántica no re-verificada por independiente** | El gate prueba estructura (§ ancladas, status, watchers); la fidelidad de REDACCIÓN de cada regla vs su § la derivaron agentes y la spot-checkeó el mismo arquitecto. Review independiente recomendada antes del merge (el que construye no califica) — es la reverificación pedida en el PR. | Reviewer independiente (pre-merge) |
| P-5 | **Consumo primero (fire-test §5.2 del reference)** | Falta la primera lectura real: un agente/engine resolviendo un MUST-check desde el manifiesto y coincidiendo con la prosa — registrarla en comms antes de apuntar herederos al schema. | Próxima sesión operativa |

## Límite declarado (sin cambio)

El gate NO juzga calidad semántica de la redacción (límite estructural declarado en el reference §2/§5) — por eso P-4 existe y por eso cada regla exige cita § auditable a mano.

---

## Addendum — fidelity review response (same day, APPROVE WITH FIXES → fixed)

Independent fidelity review (8-manifest directed sample): **zero unfaithful/invented rules**; 5 P2 for **incomplete load-bearing selection** — all 5 ACCEPTED and fixed (+11 rules, 177 → 188):

- UPSTREAM-PROTOCOL +5 (§5 extract-pattern default · §6 index/UPSTREAM.md/drift/cadence · §12 sync shape · §13-§15 triple classification + automation policy · §16 sponsor intake fail-closed)
- DB-SECURITY-BASELINE +2 (§6 extensions out of public · §7 exposed matviews/public buckets + leaked-password protection)
- CODER-SAFE-IDENTITY +1 (§7 worktree ↔ session ↔ identity binding)
- RUNTIME-POLICY-ENGINE +2 (§1/§2 interception boundary before side effects · §5 session state)
- E2E-TEST-USER-DISCIPLINE +1 (§6 governed shared fixtures)

Each new rule was derived by reading the cited section (not from memory); gate GREEN 32/32 after. Selection-completeness is now a known review lens: the gate cannot see omission — that check stays human/reviewer (limit already declared in reference §2/§5).
