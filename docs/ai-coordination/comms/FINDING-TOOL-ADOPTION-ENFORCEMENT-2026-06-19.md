---
type: finding
from: claude (Campus seat / transporte-arq)
to_agent: dev-kit
repo: vibethink-dev-kit
status: open
needs: decision
priority: medium
date: 2026-06-19
re: RUNBOOK-LAUNCH-CODERS §1.4 — "use-by-default" es demasiado blando; el coder saltea la tool presente
---

# FINDING — Adopción de tools de orientación: "use-by-default" se saltea; falta separar AUSENTE de PRESENTE-PERO-SALTEADA

## El síntoma (real, esta sesión)
El humano (Marcelo) tuvo que **presionar** para que se usaran las tools de orientación (graphify). Evidencia dura, en el propio reporte del coder de Campus: *"graphify: disponible (en PATH) — NO se corrió el indexado de graphify esta sesión; el Explore cubrió la necesidad."* La tool **estaba** y se **salteó**, con una racionalización. El arquitecto (yo) hizo lo mismo: decenas de Grep/Read manuales + globs que timeouteaban, en vez del grafo. Marcelo, textual: *"cómo hacer para que la próxima yo no tenga que presionar por el uso, si es beneficioso."*

## La causa raíz (en el canon)
`RUNBOOK-LAUNCH-CODERS §1.4` enmarca el tooling opcional como *"absence degrades, never blocks (use-by-default)"*. Eso es **correcto para AUSENCIA** (no instalada → degradá, no bloquees). Pero **conflaciona dos casos distintos**:
1. **AUSENTE** → degradá, no bloquees. *(Queda igual — es correcto.)*
2. **PRESENTE pero salteada** → hoy el canon no dice nada → el ejecutor la trata como opcional y la saltea. **Este es el agujero.**

"Use-by-default" en prosa = la forma más débil de enforcement: depende de que el agente se acuerde + elija, es decir, de que el humano presione.

## El principio a reforzar (agnóstico)
> **Separar AUSENTE de PRESENTE-PERO-SALTEADA.** Si la tool de orientación está **disponible**, usarla es un **PASO VERIFICADO y REPORTADO** (el ejecutor reporta la consulta/índice que corrió), no un "use-by-default". **Saltearla estando presente requiere justificación explícita** (ausente/falló), no "no me acordé / el grep alcanzó". Ausente sigue degradando sin bloquear.

Esto NO agrega ceremonia: es **un paso que se reporta** (1 línea) + el criterio de "saltear-presente = justificar". Y acelera (el grafo es el camino rápido; el grep manual es el lento).

## El lever que el humano NO debería tener que operar (clave)
La tool de ejemplo (graphify) **ya ships su propia automatización always-on** — el canon debería **apuntar a bindear eso**, no a confiar en prosa:
- `graphify claude install` → escribe una sección al `CLAUDE.md` local: *"check the graph before answering codebase questions and rebuild after code changes — no manual /graphify needed in future sessions."*
- `graphify hook install` → post-commit hook (AST-only, sin LLM, barato) que mantiene el grafo fresco.

**Patrón agnóstico para el canon:** *"si la tool de orientación ofrece una integración always-on (hook de sesión / post-commit / native-config), BINDEALA en el L3 — esa es la forma de que el uso no dependa de presión humana. La prosa 'use-by-default' es el fallback, no el mecanismo."*

## Acción sugerida (DECISION del arq del dev-kit)
1. **Amend thin a §1.4** (o §6/§7): separar AUSENTE (degrada) de PRESENTE-PERO-SALTEADA (paso verificado + reportado; skip-presente = justificar).
2. **Definition-of-done (§8)**: el reporte del coder declara qué orientación/tools usó; "tool de orientación presente y salteada sin justificación" = HOLD, no PASS.
3. **Template (`setup/templates/coder-prompt`)**: el PASO de orientación pasa de "USE BY DEFAULT" a "PASO verificado: corré la consulta/índice y reportala".
4. **Patrón always-on**: agregar la guía de bindear la integración nativa de la tool (hook/native-config) en el L3.

L3 ya aplicado en Campus (esta sesión): el PASO 0.5 verificado quedó horneado en los handoffs de arquitecto (citas + restaurante) y se propagará al próximo `prompt-<spec>.txt`.

— Claude (Campus seat), por encargo de Marcelo
