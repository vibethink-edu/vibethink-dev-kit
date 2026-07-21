---
type: handoff
from: claude (devkit-arq)
to_agent: claude
to: claude
repo: vibethink-dev-kit
status: open
needs: agent
priority: normal
date: 2026-07-21
re: Continuidad devkit-arq — cierre 2026-07-21 (D-074/D-075/D-076 sellados; scope pristino)
summary: "Tres decisiones selladas, una propuesta no elevada, dos cicatrices propias; cero trabajo vivo"
---
## Objective

Continuidad **devkit-arq** del 2026-07-21. Cierre limpio: **cero trabajo vivo propio**, cero ramas
propias, cero worktrees propios. Es handoff de **contexto**, no de trabajo.

## Estado al cierre

- **dev-kit:** `master`, árbol limpio, `0/0` con `origin/master`, rama por defecto **verde**.
- **Ramas/worktrees propias de la sesión:** todas mergeadas y borradas. **Ninguna abierta.**

## Lo entregado hoy — tres decisiones selladas

**D-074 — el contrato de código de salida de `devkit-upgrade` (kit PR #272).**
El header prometía exit 1 al fallar el pull, pero el único camino a 1 era `missingUpstream`: un pull
fallido salía **0**, y cuatro agentes que corrieron el refresh real contra un mount divergido
recibieron "éxito" mecánico. Ahora sale **2 (degradado)** — la herramienta sigue con sus pasos
restantes (degrade-not-block intacto), `1` tiene precedencia sobre `2`, `--dry-run` y `--no-pull`
nunca son fallo de pull, y `--json` expone `exitCode` + `pull.failed`. `versions.json` 1.3→1.4.
25 tests. Fable 2 rondas (R1 cazó un bug real: un `--dry-run` con fetch caído salía 2).

**D-075 — `CANON-DATA-JURISDICTION-RESOLUTION-001` (kit PR #274), adoptado como REESCRITURA.**
Propuesta de un consumidor (PR #273). Se quedó lo único que el spine no tenía: la resolución
`coalesce(unidad, cuenta)` y el modelo de **vigencia** (paquetes versionados con ventana; lo ya
emitido queda clavado a la versión vigente). Se botó lo que repetía a `CONFIGURATION-DISCIPLINE`,
dos citas a canons **inexistentes en el kit**, y se resolvió el choque con `LEGAL-COMPLIANCE §6`
con **un puntero de una línea**, no una reescritura. Vive en `knowledge/methodology/`, no en
`architecture/` como pedía el request. Fable 2 rondas.

**D-076 — §8.2 declinada; una fila de ruteo + una fila de diferidos (kit PR #278).**
Un arquitecto consumidor propuso forzar el GOAL-TEMPLATE desde el canon porque `git grep` daba
cero. **La obligación ya existía** en `RUNBOOK-LAUNCH-CODERS §2` (D-070 la puso ahí a propósito):
el silencio del canon era **ruteo, no hueco**. Se concedieron dos piezas delgadas: una **fila de
ruteo en §2** (cierra la referencia de una sola vía que *causó* la propuesta) y una fila en
`DEFERRED-INSTRUMENTS` para los 7 candidatos v2 **con contador de evidencia (1 de 2-3)**,
acreditando la cazada real del proponente. PR #276 cerrado con el motivo.

## Lo NO elevado (con registro, para que nadie lo re-proponga)

- **`ui:find` / discoverability ejecutable** (TASK de ViTo, PR #5239). El **principio ya estaba
  sellado** (`CANON-UX-BASE-001` §3.1, D-071 — misma cicatriz) y la **secuencia ya era L3** por su
  §5. Motor genérico → fila en `DEFERRED-INSTRUMENTS`. Cierre entregado al consumidor
  (orchestrator PR #5245). **Sin canon nuevo y sin enmienda a `UX-BASE`** — ni una línea.

## Findings abiertos

- **`FINDING-EXECUTOR-READ-CAPACITY-DIFFERS-SILENTLY-2026-07-21`** (nuevo, de la autoridad): un
  runtime trunca la lectura de un archivo grande y otro no; dos ejecutores con el **mismo goal**
  acaban con inputs distintos y **ninguno lo declara**. Clase *parece-éxito-y-no-lo-es*. N=1, sin
  cicatriz aún → registrado para que **cuente** cuando aparezca el segundo caso.
- **Telemetría del policy engine apagada** (de ayer, sigue abierto, `needs: human`).

## Gobernanza nueva de la sesión (regla permanente)

**Toda propuesta de canon pasa por el arquitecto advisor (Fable) ANTES de decidir**, y se reporta a
la autoridad **qué pasa y qué no pasa**, ítem por ítem. El agente es **dueño y protector del Canon**
(evalúa, decide qué entra, defiende de contradicciones); el advisor **asesora**; **la autoridad
sella**. Instrucción textual de la autoridad, 2026-07-21.

Valió las cuatro veces: cazó un bug real en D-074, dos defectos en D-075, corrigió una
**evidencia contada dos veces** en el caso `ui:find`, y en D-076 aportó **los dos argumentos
decisivos que al arquitecto se le habían pasado**.

## Cicatrices propias de la sesión (para no repetirlas)

1. **Cité `(D-075.)` antes de que la fila existiera** — la misma falla de cita fantasma que le
   señalé a una propuesta, dentro del arreglo de esa falla. La cazó el advisor. → la fila del
   registro va **en el mismo PR** que la cita.
2. **Encadené el watch de CI con el merge en un solo comando**, así que el merge corrió con el
   check en rojo y **la rama por defecto quedó roja** unos minutos (`SUPRA-MAP` es un mapa
   **generado**; tocar un canon lo deja viejo). → **watch y merge son pasos separados**, y se corre
   la **suite completa**, no solo los gates de gobernanza, antes de pushear.

## Riesgos / deuda no propia

- **7 ramas locales `claude/*` en el mount del kit** con contenido propio (1-4 commits) y **sin
  contraparte en `origin`**: `bump-graphify-0-10-0`, `fix-tool-versions-opcat`, `kdd-scoped-refresh`,
  `mount-clone-not-junction`, `ops-catalog-canonical-only-v2`, `rtk-accept-floor`,
  `unify-staleness-source`. Son **anteriores a esta sesión**; no se tocaron (propiedad ambigua →
  decisión de la autoridad). Nota: el squash-merge ciega la detección de "mergeado", así que
  "tiene contenido propio" no prueba que sea trabajo perdido — hay que mirarlas una por una.
- Checkout `codex/root-sync-20260704` del orchestrator sigue atrasado (dispara falsos drift). De codex.
- PR #192 del kit (draft de codex, ~3 semanas). Ajeno, NO-TOCADO.

## Next action

Ninguna acción de agente pendiente. La próxima sesión arranca leyendo esto + `dk.fresh`.

## TERMINOS NO DEFINIDOS

Ninguno. (`dk.fresh` = `node <kit>/tools/devkit-upgrade.mjs`; devkit-arq = rol de arquitecto de
gobernanza del dev-kit — el registro canónico de identidades vive en el repo consumidor, no en el kit.)

## PREGUNTAS AL EMISOR

NINGUNA, puede seguir.
