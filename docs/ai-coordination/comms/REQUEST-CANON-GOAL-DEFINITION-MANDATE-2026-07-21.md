# REQUEST — Elevar el GOAL-TEMPLATE (8 campos) a gate forzado en `CANON-CODER-ORCHESTRATION-001`

**Fecha:** 2026-07-21 · **Tipo:** request de enmienda de canon (propose-only, sello pendiente) · **Lane origen:** arquitectura CUP (Migrador/arquitecto de datos), a solicitud de la autoridad de CUP · **Sello:** pendiente del **Principal Architect** del dev-kit. Vendor-neutral, sin PII.

## El hueco (verificado este turno)
- El **template de despacho existe**: `setup/templates/goal/GOAL-TEMPLATE.md` ("the 8-field dispatch contract — define first, dispatch second"). Referencia a `CANON-CODER-ORCHESTRATION-001 §8.1`.
- **Pero el canon NO lo nombra ni lo obliga.** `git grep -niE "goal-template|8[- ]field|template|dispatch contract" -- knowledge/ai-agents/CANON-CODER-ORCHESTRATION-001.md` → **cero resultados**. El formulario existe; la **regla no fuerza usarlo.**
- Es **exactamente la misma clase "descrito-pero-no-forzado"** que ya motivó §8.1 (run-to-completion) y §9.1 (fan-out gate): la forma estaba descrita pero no era un gate, así que dependía de que el agente/operador la recordara.

## Propuesta — nueva §8.2 (texto para revisar y sellar)
> ### §8.2 — Goal-definition gate (the 8-field contract is forced, not optional)
> *(described-but-not-forced class, dual of §8.1/§9.1: the goal-definition contract existed as a template but no canon forced it, so a half-defined goal degraded into dispatch-and-nudge — the operator typing "continue" at every partial close.)*
>
> No autonomous unit is dispatched — headless run **or** interactive session — until its goal is defined with the **8-field GOAL-TEMPLATE** (`setup/templates/goal/GOAL-TEMPLATE.md`). A goal missing any of the 8 fields is **not dispatchable**; an empty field is a Principal-Architect decision, not executor work. The template carries these **non-negotiable gates**, which the dispatch inherits:
> 1. **Verified FRENTE header** — repo · branch · worktree · what-is-built, each field **verified this turn** (`git`), never remembered; `SIN VERIFICAR` if not checked; on frente change, declare and **stop** for human confirm.
> 2. **Source-verification gate** — before citing anything: it EXISTS, it is in the **executor's branch** (origin, not a local), it is not stale.
> 3. **A/B return format** — every report is A (PARO) or B (TERMINÉ) with the OUTCOME **marked point-by-point** (✅/🔶/⬜ + evidence); "avancé bastante" is not a state.
> 4. **Readiness check + veredicto** (`GO | GO-con-gate | DEFINE | SPLIT`) **before** dispatch — the architect self-gates; a loose field = DEFINE, oversized = SPLIT.
> 5. **Executor counterweight** matched to the failure mode (overrun-prone → "no salgas del plan"; stall-prone → "encadená la slice, no cedas el turno"), per §4/§5.
>
> Expectation-of-use → gate-of-correction (§10): defining the goal is the expectation; **dispatching an under-defined goal is the correction that bites.**

## Encaje (sin duplicar — §2)
- **No** crea un canon nuevo ni un segundo motor: **amplía** el canon existente que ya gobierna el despacho. El template sigue en `setup/templates/goal/` (el formulario); §8.2 lo **fuerza** (la regla).
- Companion: `RUNBOOK-LAUNCH-CODERS.md` (el *cómo* corre) queda intacto; §8.2 gobierna el *qué/dónde-para* antes de lanzar.

## Reversibilidad / gobernanza
- **Propose-only:** este comm NO edita ni sella el canon. La §8.2 se aplica y sella por el Principal Architect (como §8.1/§9.1). Rama `comms/request-canon-goal-definition-mandate` desde `origin/master`; PR de propuesta, sin merge a master hasta el sello.
- Evidencia de uso real: el primer despacho con este contrato (frente selector-de-rutas, tenant CUP) validó los 5 gates end-to-end (encabezado FRENTE forzó `git`, detectó HEAD en rama ajena; readiness/veredicto y contrapeso Codex incluidos).
