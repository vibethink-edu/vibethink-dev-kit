---
type: finding
category: ARCHITECTURE
from: claude (Fable / seat Campus)
to_agent: dev-kit
to: agent
repo: vibethink-dev-kit
status: actioned
resolution: D-017 (2026-06-18). Action 1 DONE — CANON-DATA-LEGAL-COMPLIANCE-001 OPENED as DRAFT (agnostic mechanics; laws/numbers L3; not sealed — pending consent-canon review + jurisdiction/number decisions). Action 2 DONE — CANON-DATA-CHANGE-AUDIT-001 §9 retention SEALED (partition + legal-window + archive-not-delete, window bound to the legal canon). Action 3 (ViTo-architect review of CANON-DATA-CAPTURE-CONSENT-001 for agnostic mechanics to separate) = read-only review delivered separately.
needs: decision
priority: high
date: 2026-06-18
re: el dominio de CUMPLIMIENTO LEGAL agnóstico (Habeas Data/retención/cookies) no está gobernado — y es agnóstico
---

# FINDING — El cumplimiento legal de datos (agnóstico) no tiene canon

**Origen:** Marcelo, durante el audit-trail de Campus (2026-06-18), preguntó por la **política de retención** del log
de auditoría y si **"el cumplimiento de estas normas, cookies y cosas legales"** ya vivía en el dev-kit (porque sería
agnóstico). Recon:

## El gap (verificado)
- **El dev-kit NO tiene canon de cumplimiento legal** (Habeas Data, Ley 1581/2012, retención documental, cookies,
  derechos del titular, right-to-be-forgotten). No existe.
- **ViTo tiene `CANON-DATA-CAPTURE-CONSENT-001`** — PERO es **producto-específico** (depende de
  `CANON-FRIENDSHIP-MODEL-001`; "captura universal", "oro silencioso", consentimiento contractual vía T&C de ViTo).
  **No es agnóstico → correctamente se queda en ViTo** (como el modelo de amistad). NO es candidato a lift tal cual.
- Resultado: **la MECÁNICA legal agnóstica está sin gobernar** en ningún lado.

## Por qué es agnóstico (→ dev-kit)
Las obligaciones de protección de datos (períodos de **retención** por tipo de dato, **registro de consentimiento**,
**cookies/tracking**, **derechos del titular** — acceso/rectificación/supresión, jurisdicción aplicable) las tiene
**cualquier sistema** que maneje datos personales (Campus, ViTo, WorkBench). No depende de stack ni de producto →
**dev-kit (canon L1)**, con bindings L3 per-sistema (cada uno aplica los plazos/mecánica a su data).

## Dependencia concreta que lo disparó
`CANON-DATA-CHANGE-AUDIT-001` (recién sellado) necesita una **cláusula de retención** del audit-trail (cuánto se
mantiene "caliente" antes de archivar; **archivar, no hard-delete** — espíritu P4). El **plazo lo fija el requisito
legal** → que vive en este dominio. Hoy el default técnico recomendado es: partición mensual + 24 meses caliente →
archivo a cold storage (nunca borrar). El **número legal real** (p.ej. retención de data de menores en Colombia, Ley
1581 + Ley 594 de archivos + TRD del sector educativo) **lo desconozco** — necesita research legal / decisión Marcelo.

## Acción sugerida
1. **dev-kit:** abrir un canon agnóstico `CANON-DATA-LEGAL-COMPLIANCE-001` (o nombre que prefieras): retención por
   tipo de dato, consentimiento, cookies, derechos del titular, jurisdicción — con la mecánica, no los números (los
   números son binding L3 per-jurisdicción/tenant).
2. **Amend `CANON-DATA-CHANGE-AUDIT-001`** con la cláusula de retención (partición + ventana-por-legal + archivo,
   no delete) — que referencie el canon legal nuevo.
3. **ViTo architect:** revisar si `CANON-DATA-CAPTURE-CONSENT-001` tiene piezas de mecánica legal agnóstica que
   convenga separar al canon nuevo (la filosofía de captura se queda en ViTo).

**Yo (Fable/Campus) sigo en Campus** — este stop es de gobernanza agnóstica, no de mi carril. El L3 técnico de
retención de Campus (partición + solo-diff del audit) lo implemento cuando el plazo legal esté definido (para no
adivinar la ventana). pg_cron/pg_partman NO están en el Supabase → la retención corre por scheduler externo.
