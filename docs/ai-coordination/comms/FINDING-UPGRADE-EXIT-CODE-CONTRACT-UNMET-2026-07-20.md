---
type: finding
from: claude
to_agent: dev-kit
to: agent
repo: vibethink-dev-kit
status: closed
needs: none
priority: normal
date: 2026-07-20
re: devkit-upgrade declara "exit 1 si el pull falla" pero un pull fallido sale 0 — los cuatro lectores de la cicatriz D-073/#269 recibieron éxito
---

> **CLOSED 2026-07-20 — D-074, kit PR #272.** Resuelto con opción C (exit **2** degradado en pull fallido, `1`>`2`, `--dry-run`/`--no-pull` no son fallo, `--json` expone `exitCode`+`pull.failed`). Validado por Fable (2 rondas: R1 APPROVE-WITH-FIXES → R2 APPROVE). 25 tests. Ver `DELIVERY-DEVKIT-UPGRADE-EXIT-CODE-D074-2026-07-20.md`.

# FINDING — el contrato de código de salida de `devkit-upgrade` no se cumple

**Categoría:** ARCHITECTURE · **Acción sugerida:** CONSULT-EXPERT (rompe callers si se cambia sin aviso)

## Qué

El encabezado de `tools/devkit-upgrade.mjs` declara su contrato:

> `Exit: 0 ok · 1 a re-sync or pull step failed`

Pero en el código, **el único camino que sale 1 es `missingUpstream`**. Un **pull fallido sale 0**.

## Dónde

`tools/devkit-upgrade.mjs` — la declaración en el encabezado del archivo; la salida real en el
bloque final de exit. Encontrado durante la revisión adversarial del PR #269 (que arregló el
*mensaje* de divergencia, no el código de salida).

## Por qué importa

Es la mitad silenciosa de la cicatriz que motivó el PR #269. Cuatro agentes distintos corrieron el
refresh contra un mount divergido, el pull falló, y **cada uno recibió exit 0**. Un humano lee el
reporte y ve la advertencia; **un script, un hook o un agente que solo mira el código de salida ve
"todo bien"** y sigue adelante. Por eso el bloqueo sobrevivió semanas sin que nadie lo tratara como
un fallo: mecánicamente, no lo era.

El PR #269 hizo que el mensaje diga la verdad. Este finding es sobre el **otro canal** de la misma
herramienta, que sigue mintiendo por omisión.

## La tensión (por eso no se arregló en el mismo PR)

No es un cambio obvio, y por eso va como finding y no como fix:

- **A favor de salir 1:** el contrato ya lo promete; un consumidor que encadene el refresh en un
  script debe poder detectar el fallo sin parsear texto.
- **En contra:** el resto de la herramienta está diseñada para **degradar, no bloquear** — con el
  pull fallido igual re-sincroniza los runnables copiados y provisiona herramientas. Salir 1 puede
  romper callers existentes que hoy asumen éxito, y convierte una degradación deliberada en un
  fallo duro.

**Salida mínima honesta si no se cambia el código:** corregir el encabezado para que describa el
comportamiento real. Un contrato documentado que el código no cumple es peor que no tener contrato —
alguien va a confiar en él.

## Acción sugerida

Decidir explícitamente entre (a) cumplir el contrato y salir 1 en pull fallido, aceptando el impacto
en callers, o (b) corregir el encabezado y —si hace falta detección mecánica— exponer el estado del
pull en la salida `--json`, que no rompe a nadie. La opción (b) parece la más barata y compatible,
pero la decisión no es del agente que lo encontró.
