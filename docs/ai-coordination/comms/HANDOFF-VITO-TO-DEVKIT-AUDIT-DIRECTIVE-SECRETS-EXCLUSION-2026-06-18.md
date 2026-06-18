---
type: handoff
from: claude (vito-architect / Opus 4.8, sesión ViTo)
to_agent: dev-kit
to: architect (DevKit)
repo: vibethink-dev-kit
status: actioned
resolution: Folded into CANON-DATA-CHANGE-AUDIT-001 §10.1 (SEALED 2026-06-18, D-020) — the old/new trigger NEVER runs on a secret store; options (a) exclude or (b) metadata-only. The metadata-only helper is an L3 infra choice (the kit names the option, not the helper).
needs: action — amend a la directiva de audit agnóstica (cláusula secrets/sensibles) antes/al sellarla
priority: high
date: 2026-06-18
re: amend de arquitectura a PROPOSAL-DATA-CHANGE-AUDIT-DIRECTIVE — el audit genérico NO debe aplicarse a tablas de secrets/sensibles
authority: Marcelo (aprobó excluir en ViTo + pidió informar al DevKit)
related: PROPOSAL-DATA-CHANGE-AUDIT-DIRECTIVE-2026-06-18 (a sellar) · vibethink-campus/db/migrations/20260618150000_audit_trail.sql (L3 Campus, primer implementador) · TASK-VITO-APPLY-DATA-AUDIT-DIRECTIVE-2026-06-18 (L3 ViTo)
---

# HANDOFF — Amend de seguridad a la directiva de audit agnóstica (excluir secrets/sensibles)

**Para:** el arquitecto del DevKit. **De:** vito-architect (Opus), descubierto en el triage L3 de ViTo. **Aprobación:
Marcelo** (ya aprobó excluir `tenant_secrets` en ViTo y pidió informar al DevKit para que la directiva agnóstica lo
incorpore). **Ejecutás vos** el amend a la directiva al sellarla.

## El finding (de seguridad)
La directiva de audit captura **quién / qué (old→new) / cuándo** vía el trigger genérico (`audit.log_change()` →
`audit.record_version` con `old_record`/`new_record`). Eso es correcto para tablas operativas. **Pero aplicado a una
tabla de SECRETS o datos sensibles, el trigger replica el secreto/dato sensible dentro del log de auditoría** — el
`old_record`/`new_record` contendría el valor del secreto.

Aunque el log sea privado (no expuesto a superficies de cliente), **duplicar secretos fuera de su store** rompe el
principio de superficie-mínima-de-secretos. En ViTo, los secrets viven **solo** en `tenant_secrets` por canon
(`CANON-SECRETS-001`); auditarla con el trigger old/new los copiaría a `audit.record_version`.

## Amend propuesto a la directiva agnóstica
Agregar una cláusula:

> **El audit genérico (trigger que captura `old_record`/`new_record`) NO se aplica a tablas de secrets ni datos
> sensibles.** Para esas tablas, dos opciones gobernadas:
> - **(a) Excluir** del audit genérico (el cambio de un secreto ya se gobierna por su propio control — p. ej.
>   `reason_code`/`ticket_ref` donde aplique).
> - **(b) Auditar solo METADATA** — quién / cuándo / qué tabla / qué operación, **SIN** `old_record`/`new_record`
>   (un trigger variante que NO captura los valores).
>
> El trigger genérico old/new es para tablas **operativas**, nunca para un secret store.

## Alcance (agnóstico)
- Aplica a **todo** sistema que implemente la directiva — no es específico de ViTo.
- **Campus (primer implementador):** verificar que `audit.enable_tracking` **no** se haya activado sobre una tabla de
  secrets/sensibles con el trigger old/new. Si lo hizo, retrofit (excluir o variante metadata).

## Acción para el DevKit
Incorporar la cláusula a `PROPOSAL-DATA-CHANGE-AUDIT-DIRECTIVE-2026-06-18` **antes de sellarla** (o como primera
enmienda si ya se selló). Una vez sellada, ViTo y Campus la citan; ViTo ya la aplica en su triage L3 (excluye
`tenant_secrets`).

## Open question para vos
¿Conviene que la infra compartida `audit.*` ofrezca un **`audit.enable_metadata_tracking()`** (variante que NO
captura old/new) para el caso (b)? Tu llamada como dueño de la infra agnóstica; ViTo por ahora va con la opción (a)
(excluir `tenant_secrets`).

— claude (vito-architect / Opus 4.8), 2026-06-18.
