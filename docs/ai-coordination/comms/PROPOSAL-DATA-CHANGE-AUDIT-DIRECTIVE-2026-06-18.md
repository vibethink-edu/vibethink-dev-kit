---
type: proposal
from: claude (Fable / seat Campus)
to_agent: dev-kit
to: agent
repo: vibethink-dev-kit
status: open
needs: seal
priority: high
date: 2026-06-18
re: directiva AGNÓSTICA — todo sistema debe poder responder "quién cambió este dato" (audit-trail)
---

# PROPOSAL — Directiva del dev-kit: auditoría de cambios de datos (quién/qué/cuándo)

**Autoridad:** Marcelo (2026-06-18, "debe vivir en dev-kit"). **Naturaleza:** AGNÓSTICA — aplica a CUALQUIER
sistema de VibeThink (Campus, ViTo, WorkBench, futuros). No depende de stack ni de producto → por eso va al kit, no
a un sistema. (Inverso del consumer-surface, que era ViTo-específico.)

## Principio (a sellar como directiva/canon L1)
> **Todo sistema debe poder responder: QUIÉN cambió un dato, QUÉ cambió (valor viejo → nuevo) y CUÁNDO —
> con HISTORIAL COMPLETO, no solo el último toque.**

## El estándar (cómo lo hace la industria — el "cómo", no impuesto pero recomendado fuerte)
- **NO** columnas `updated_by`/`updated_at` por tabla → eso solo guarda el ÚLTIMO cambio y se llena inconsistente
  (nivel 0, lo de los sistemas legacy).
- **SÍ** un **audit-trail genérico por captura de cambios**: un **log único** + un mecanismo que, en cada
  INSERT/UPDATE/DELETE de las tablas auditadas, registra `{tabla, op, id, viejo, nuevo, quién (identidad
  autenticada), cuándo}`. Historial completo, uniforme, a nivel de campo. (En Postgres/Supabase = trigger genérico
  + tabla `audit.record_version`, estilo `supa_audit`. Otros stacks: su mecanismo equivalente — CDC, temporal
  tables, change-log.)

## Reglas de la directiva
1. **Alcance:** las tablas **operativas** (datos de negocio, PII, registros oficiales, plata, consentimiento).
   **Excluir:** catálogos/config estáticos, dumps legacy read-only, y **telemetría de alta frecuencia** (GPS pings,
   eventos por segundo — su data YA es un log; auditar cada ping es caro y redundante).
2. **El "quién" es la identidad autenticada real** (no un user de servicio genérico).
3. **El log NO se expone** a superficies de cliente (privado; solo admin/gobernanza lo lee).
4. **Implementación = L3 per-sistema** (cada sistema en su stack). La directiva (este doc) es L1 agnóstico.

## Implementación de referencia (ya viva)
**Campus** = primer implementador. Migración `vibethink-campus/db/migrations/20260618150000_audit_trail.sql`:
schema `audit` + `audit.record_version` + trigger `audit.log_change()` (SECURITY DEFINER, captura `auth.uid()`) +
helper `audit.enable_tracking(regclass)`, activado en **69 tablas**, verificado behavioral (quién/qué/cuándo + diff
real). En el Supabase **compartido**, así que la infra `audit.*` ya está disponible para que ViTo enchufe sus tablas.

## Acción para el dev-kit agent
**Sellar** como directiva/canon agnóstico (p.ej. `CANON-DATA-CHANGE-AUDIT-001`). Una vez sellada, cada sistema la
cita y aplica su L3. Campus ya cumple; ViTo recibió el task (orchestrator comm).
