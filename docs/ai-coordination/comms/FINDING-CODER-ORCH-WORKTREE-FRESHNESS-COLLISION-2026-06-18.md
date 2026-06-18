---
type: finding
from: claude (Fable / seat Campus)
to_agent: dev-kit
to: agent
repo: vibethink-dev-kit
status: open
needs: decision
priority: low
date: 2026-06-18
re: CANON-CODER-ORCHESTRATION §9 — reinforcement thin: el worktree por-tarea debe ser id-único + fresco (no reuso stale silencioso)
---

# FINDING — Freshness + collision del worktree por-tarea (reinforcement a §9)

## Qué validó el canon (positivo, sin cambio)
Un coder de frontera (auth-crítico) recibió una instrucción cuyo spec/prompt **no existían en su worktree**. Hizo
**exactamente lo correcto**: paró (BLOCKED real, la condición de stop), **se negó a inventar** el spec auth (creación
de cuenta/RLS), y entregó 3 opciones de desbloqueo. → **Fire-test PASS de §8 (design gate) + las reglas de
autonomía/stop.** No requiere cambio; el canon aguantó.

## El gap genuino (lo que §9 no dice explícito)
§9 dice *"create your worktree from the latest integration branch at launch time"*. Pero la falla real fue de **dos
caras que §9 no advierte**:
1. **Worktree-id NO colisión-libre:** la derivación del nombre del worktree (en el launcher L3) tomaba los primeros 3
   chars del spec → un **sub-spec `037b` colisionó con `037`** y mapeó al mismo worktree.
2. **Reuso STALE silencioso:** el launcher, al encontrar ese worktree ya existente, **lo reusó sin re-sincronizar**
   (no hizo fetch/reset desde el último integration branch) → el coder corrió en el worktree viejo (branch ya
   borrado, sin los pushes recientes) → su spec/prompt **no existían ahí** → BLOCKED confuso (el insumo "no está",
   cuando sí está en `origin/main`).

## Principio a reforzar (agnóstico)
> **El worktree por-tarea debe ser (a) identificado de forma ÚNICA por tarea (colisión-libre — un sub-spec no mapea
> al worktree de otro) y (b) FRESCO del último integration branch en cada launch. Si el launcher reusa un dir
> existente, DEBE re-sincronizarlo (fetch + reset al integration branch) o recrearlo; un reuso stale silencioso le
> sirve al coder inputs que "no existen" (los que aún no estaban cuando se creó el worktree).**

§9 cubre el "create from latest"; esto agrega el caso REUSE + el id colisión-libre, que son las dos formas concretas
de violarlo silenciosamente.

## Evidencia (L3, ya arreglado)
Campus `launch-coder.ps1`: `$tag = $Spec.Substring(0,3)` (037b→037) + `if (Test-Path $Wt) { reusa }` sin re-sync.
Fix L3: `$tag = $Spec.Split('-')[0]` (id colisión-libre). El re-sync-on-reuse sigue como mejora L3 recomendada.

## Acción
`DECISION` — el dev-kit decide si es un amend thin a §9 (una línea sobre id-único + fresh-on-reuse) o una nota en el
binding L3 (§11, "el launcher garantiza freshness + id colisión-libre"). Es low-prio (1 línea), pero es un failure
mode concreto que cualquier launcher worktree-por-tarea puede repetir.
