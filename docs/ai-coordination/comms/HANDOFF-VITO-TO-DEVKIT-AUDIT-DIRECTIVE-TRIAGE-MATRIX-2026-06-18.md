---
type: handoff
from: claude (vito-architect / Opus 4.8, sesión ViTo)
to_agent: dev-kit
to: architect (DevKit)
repo: vibethink-dev-kit
status: actioned
resolution: Folded into CANON-DATA-CHANGE-AUDIT-001 §10.2 (SEALED 2026-06-18, D-020) — the triage matrix (audit classes vs exclude classes + why); concrete names stay L3 (explicit reviewed list, never auto-include). The secrets rule is §10.1 (its critical item). Campus-review suggestion relayed.
needs: action — incorporar la matriz de triage a la directiva de audit agnóstica al sellarla
priority: normal
date: 2026-06-18
re: matriz de triage agnóstica — qué CLASES de tabla auditar / NO auditar (y por qué)
authority: Marcelo (GO 2026-06-18)
related: PROPOSAL-DATA-CHANGE-AUDIT-DIRECTIVE-2026-06-18 · HANDOFF-VITO-TO-DEVKIT-AUDIT-DIRECTIVE-SECRETS-EXCLUSION-2026-06-18 (la regla de seguridad — este es la guía de clasificación; van juntos)
---

# HANDOFF — Matriz de triage para la directiva de audit (agnóstica)

**Para:** el arquitecto del DevKit. **De:** vito-architect (Opus), del triage L3 de ViTo (B1 + B2). **GO: Marcelo.**

## Por qué (la directiva necesita una guía de clasificación, no solo el "qué")
La directiva dice *"audita quién / qué / cuándo"*. Pero al aplicarla, **todo** sistema enfrenta la misma pregunta:
*¿a qué tablas SÍ y a cuáles NO?* Sin una guía en la directiva, cada implementador re-clasifica a mano — con
**riesgo real**: en el triage L3 de ViTo, un auto-clasificador por nombre **metió `tenant_api_keys` en "auditar"**
(lo atrapé, pero Campus o el próximo implementador podrían no). La directiva debería traer la matriz para que el
triage sea **consistente y seguro** en cualquier repo.

## La matriz (agnóstica)
**AUDITAR** — tablas **operativas / PII / oficiales / financieras / de consentimiento**: el dato de negocio que
cambia y cuyo "quién/qué/cuándo" importa.

**NO auditar** (con el porqué por clase):

| Clase | Por qué NO se audita |
|---|---|
| **secrets / keys / tokens** | el trigger `old/new` replicaría el secreto dentro del log — **SEGURIDAD** (ver el handoff de secrets; es el ítem crítico de esta misma matriz) |
| **connections con credenciales** | pueden llevar tokens embebidos → tratar como secret hasta confirmar que son solo-metadata |
| **logs / colas / eventos / metering / telemetría** | su data **ya es** un log/append-only; auditarla duplica y gasta (alta frecuencia) |
| **catálogos / config estática** | no cambian como dato operativo; su "historial" es el versionado del repo/seed |
| **jobs / derivados / media / caches** | output recomputable, no fuente de verdad |
| **backups / ledger de migraciones / system** | snapshots/sistema, no dato operativo editable |

## Cómo dejar la regla (tu criterio como dueño de la directiva)
- Fold dentro de `PROPOSAL-DATA-CHANGE-AUDIT-DIRECTIVE` al sellarla: una sección **"Qué auditar / qué no, y por qué"**.
- La cláusula de **secrets/keys** (handoff previo) es el ítem de SEGURIDAD de esta matriz — quedan **juntos** en la directiva.
- Los **nombres concretos** (`signal_bus`, `tenant_secrets`, etc.) son L3 de cada repo; la directiva sólo da las **clases** + el porqué. Cada repo arma su lista explícita revisada (no auto-incluir).

## Evidencia (L3 ViTo, hoy)
- **B1:** 34 tablas del núcleo (operativas/PII/oficial/plata/consentimiento/governance/access) → auditadas, aplicadas a cloud, behavioral verificado.
- **B2:** 174 candidatas operativas / **107 excluidas exactamente por estas clases** / 11 borderline. Ref: `REFERENCE-VITO-AUDIT-B2-FULL-CLASSIFICATION-2026-06-18` (ViTo comms).

## Acción
Incorporar la matriz a la directiva agnóstica al sellarla (aprobación de canon: Marcelo). **Sugerido para Campus
(primer implementador):** revisar sus tablas ya auditadas contra esta matriz — ¿quedó alguna connection / log / key
auditada por error?

— claude (vito-architect / Opus 4.8), 2026-06-18.
