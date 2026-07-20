---
type: note
from: claude (devkit-arq · continuidad)
to_agent: dev-kit
to: dev-kit
repo: vibethink-dev-kit
status: closed
needs: agent
priority: low
date: 2026-07-20
re: Cierre findings coder-launch 2026-06-19 — DELIVERED §9.1/§10 + rescate residuo
summary: "2 findings de la rama huerfana ya son canon; residuo thin rescatado; rama a borrar"
---
## Por qué esta nota

La rama huérfana `claude/finding-tool-adoption-enforcement` (origin `811b245`, ~4 semanas, **sin PR**,
sin worktree) contenía **solo 2 documentos de finding** del 2026-06-19. Ambos ya son canon. Marcelo
autorizó borrar la rama (chat, 2026-07-20). Antes de borrarla se rescata acá el **residuo único** para
que no se pierda (protocolo SUPERSEDED — rescatar artefactos únicos antes de eliminar).

## Evidencia de entrega (verificado en este turno)

| Finding (2026-06-19) | Aterrizó en | Estado |
| --- | --- | --- |
| `FINDING-FANOUT-READINESS-CHECK` — forzar la evaluación del fan-out en el dispatch, no asumir "tema distinto = seguro" | `CANON-CODER-ORCHESTRATION-001 §9.1 — The Fan-Out Gate` (**SEALED 2026-06-19**, mismo día, misma causa "described but not forced") | **DELIVERED** |
| `FINDING-TOOL-ADOPTION-ENFORCEMENT` — separar expectativa-de-uso de gate; que no se saltee una tool presente sin que el humano presione | `CANON-CODER-ORCHESTRATION-001 §10 — Expectation-of-use vs gate-of-correction` ("use-by-default… never a silent skip") | **DELIVERED (parcial)** — ver residuo |

El chequeo automático de footprint del finding #2 (cada unidad declara su superficie estructurada; el
check cruza tablas ∪ archivos por independencia) quedó **aplazado a propósito** (build-on-pain) y ya está
registrado en `doc/DEFERRED-INSTRUMENTS.md` con su trigger — es la automatización L3 de §9.1. No es un
olvido: es una decisión consciente. No re-abrir hasta que el gate manual demostrablemente falle.

## Residuo abierto (thin, build-on-pain — NO accionar sin nueva cicatriz)

Del finding #1, dos matices reales que §10 **no** captura del todo:

1. **AUSENTE vs PRESENTE-PERO-SALTEADA.** §10 ata "never a silent skip" al caso de **ausencia**
   ("if the environment cannot provide it… documents why"). El agujero original era otro: la tool está
   **presente** y se saltea con una racionalización ("el Explore cubrió la necesidad"). Ese caso —
   *skip-presente = requiere justificar (ausente/falló), no "no me acordé / el grep alcanzó"* — no está
   endurecido explícitamente.

2. **Atar la integración always-on en L3.** El patrón "si la tool ofrece auto-activación (hook de sesión /
   native-config), BINDEALA en L3 — la prosa use-by-default es el fallback, no el mecanismo" (ej: `graphify
   claude install` / `graphify hook install`) no está nombrado en §10/§11. Es el lever que evita depender
   de presión humana.

**Criterio de disparo:** enmendar §10 (thin) + validar con Fable **solo si** vuelve a ocurrir un
"presente-pero-salteada" después del sello de §10 (2026-07-16), o si un segundo consumidor lo pide. La
evidencia del finding es **anterior** a §10; sin cicatriz nueva, no hay pain que justifique tocar canon
sellado.

## Estado

- Findings 2026-06-19 → DELIVERED (§9.1 + §10); footprint-check aplazado y registrado.
- Residuo thin del #1 rescatado acá (build-on-pain).
- Rama `claude/finding-tool-adoption-enforcement` (`811b245`) borrada de origin tras el rescate.

— Claude (devkit-arq · continuidad)
