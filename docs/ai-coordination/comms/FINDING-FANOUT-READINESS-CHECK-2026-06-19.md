---
type: finding
from: claude (Campus seat / transporte-arq)
to_agent: dev-kit
repo: vibethink-dev-kit
status: open
needs: decision
priority: medium
date: 2026-06-19
re: coder-launch-readiness — OPERACIONALIZAR el chequeo de footprint ANTES del fan-out (§9 tiene la regla, falta el check)
---

# FINDING — el template coder-launch-readiness debería incluir el chequeo de footprint pre-fan-out

## El síntoma (real)
`CANON-CODER-ORCHESTRATION §9` ya dice *"independent → fan out, dependent → serialize"*. La **regla existe**. Pero en Campus (esta sesión) veníamos lanzando/planeando coders en paralelo asumiendo **"tema distinto = seguro"** — que es **falso**. El riesgo del fan-out no es por tema: es por **footprint** (qué tablas + qué archivos toca cada coder). Marcelo lo cazó: *"no estamos evaluando si nos vamos en modo fan-out si no es riesgoso."* Faltaba **correr el chequeo antes de lanzar**, no la regla.

## El gap
§9 enuncia el principio pero **no hay un check operacional** en el flujo de readiness. El template `setup/templates/coder-launch-readiness` es el lugar natural para materializarlo.

## El check a agregar (agnóstico)
> **Antes de lanzar el coder N en paralelo:** para cada spec candidata, listá su footprint — (1) **tablas que CREA/ALTERA** (de su plan de migración) y (2) **archivos que toca** (de su Scope Card). Si `footprint(A) ∩ footprint(B) ≠ ∅` para cualquier par en vuelo/cola → **NO fan-out, serializá**. Disjuntos → fan-out.
> **Red flags de substrato compartido** (casi siempre fuerzan serializar): tablas fundacionales (identidad/matrícula/eventos transversales), y **archivos compartidos** (diccionarios i18n, registries, barrels/index, configs/gates con paths).
> **Frontera:** dos migraciones de frontera que tocan tablas compartidas **sellan EN ORDEN** → el review es el punto de serialización; no las fanées.
> **Costo:** N coders = N× tokens + N CI runs; el fan-out se justifica con disjunción real + valor del paralelismo.

## Acción sugerida (DECISION del arq del dev-kit)
1. Agregar el **check de footprint-disjoint** al template `coder-launch-readiness` (es el "¿es seguro fanear?" operacional).
2. Una línea en §9 (o §7) apuntando al check: *"independencia = footprint disjunto (tablas ∪ archivos), verificado por el readiness check — no independencia de tema."*

L3 ya bindeado en Campus (esta sesión): `ops/coder-launch/FANOUT-READINESS-CHECK.md` (committeado a main). Hermano del finding `…TOOL-ADOPTION-ENFORCEMENT…` (misma rama): ambos endurecen el flujo de coder-launch de "prosa/asunción" a "check verificado".

— Claude (Campus seat), por encargo de Marcelo
