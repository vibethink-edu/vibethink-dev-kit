---
type: proposal
from: claude
to_agent: dev-kit
to: agent
repo: vibethink-dev-kit
status: actioned
resolution: SEALED 2026-06-17 into REVIEW-READINESS-PROTOCOL §8.1 (PR #142, D-011)
needs: review
priority: normal
date: 2026-06-17
re: norma cloud-first para UAT/UX-refinement — no quemar protocolo CI/CD local; cloud y local-Supabase siempre espejo
---

# PROPOSAL — cloud-first para UAT/UX-refinement (no quemar protocolo local), y local-Supabase siempre espejo

**Origen:** Marcelo + Fable, tras el wire-to-cloud de Campus (2026-06-17). Marcelo lo pidió explícito como
**candidato a norma de dev-kit**. Lección de fricción real, no abstracta.

## La norma propuesta
Cuando la tarea es **UAT / refinamiento de UX / review no-destructivo** — *"¿esto se ve / funciona bien contra
data real?"*, NO *"¿este cambio de código es seguro?"* — **preferir el camino CLOUD**: el **front desplegado**
+ **cloud como fuente de verdad**. **No quemar la ceremonia local de CI/CD** (build gates, preflights de
dirty-tree, dev server local, cableado de fixtures, login local) para lo que es un review contra data real.

Dos mitades:
1. **UAT/review → cloud directo.** El front desplegado contra el cloud da la señal verdadera sin ceremonia.
2. **El Supabase LOCAL es SIEMPRE un espejo del cloud.** Disciplina de sync: el drift se corrige *hacia* el
   cloud. El local existe para testing destructivo / ensayo de migraciones / offline — **nunca como verdad
   que compite con el cloud**.

## Lo que la norma NO afloja (importante)
Los **gates siguen aplicando al CÓDIGO**: migraciones nuevas, features, cambios riesgosos → las 3 compuertas
de migration-testing + CI siguen. La norma **no debilita la seguridad del código**; saca **ceremonia del
REVIEW**. La regla de decisión: *¿es un cambio de CÓDIGO (→ gates) o un UAT/refinamiento (→ cloud-first,
ceremonia mínima)?*

## Evidencia (esta sesión)
Para hacer UAT de Campus, intenté el camino LOCAL y **quemé protocolo sin payoff**: flip del `.env.local` a
cloud, choque con el preflight "No Dirty Starts", y un **dead-end** — `apps/web` de Campus **no tiene UI de
login** (la sesión viene del despliegue `.vibethink.ai`; `localhost:3400` no puede autenticar, distinto
origin). El camino que dio la señal verdadera **sin ceremonia** fue el **cloud**: el front desplegado
`campus.vibethink.ai` + el Supabase compartido (donde estaba el wire) + un vínculo de UAT user. Ahí la
verificación behavioral salió directa (admin ve 437 enrollments reales, 0 sin sesión). El local fue **fricción
pura**; el cloud fue **un paso**.

## Relación con lo existente
- **Lift/afilado** de la canon ViTo `CANON-DB-MIGRATION-TESTING-001` §1.1 ("cloud = fuente de verdad; el UAT
  real-tenant apunta a cloud; el Docker local es mirror/fallback") → subirla **agnóstica** al dev-kit.
- **Complementa** `REVIEW-READINESS-PROTOCOL` ("testeá en la capa que da la señal verdadera"): para
  UX-refinement esa capa es el **cloud desplegado**, no el local. Esta norma lo hace explícito + agrega la
  cláusula "local siempre espejo".

## Acción sugerida
`AMEND / NEW-CANON` — el agente de dev-kit evalúa subirla como norma agnóstica (canon propia tipo
`CANON-CLOUD-FIRST-REVIEW` o fold dentro de `REVIEW-READINESS-PROTOCOL`). Aprobación de canon: Marcelo.
