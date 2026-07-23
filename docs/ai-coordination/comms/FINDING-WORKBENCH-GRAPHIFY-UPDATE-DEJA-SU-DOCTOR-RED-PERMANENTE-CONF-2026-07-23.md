---
type: finding
from: claude (devkit-arq)
to_agent: claude
to: claude
repo: vibethink-dev-kit
status: open
needs: agent
priority: normal
date: 2026-07-23
re: Workbench: graphify update ./ deja su doctor RED permanente (config, no gate) + arruga latente del gate KDD registrada
summary: "workbench refreshCommand full-rebuild rechazado por 2.8 con required:true = RED perpetuo; fix es del dueno; gate del kit correcto"
---
## Qué (accionable — workbench)

`vibethink-workbench/tools/knowledge-memory.config.json` declara graphify con `required: true` (línea 24)
**y** `refreshCommand: "graphify update ./"` (línea 26) — un rebuild de repo entero. El gate del kit
`check-knowledge-memory-freshness` **rechaza ese scope en cada corrida** (§2.8: el refresh de un índice
derivado debe ser scoped, nunca full rebuild — gate líneas 244-257). Con `required: true`, eso significa:

> **el doctor del workbench se queda RED PARA SIEMPRE, incluso DESPUÉS de refrescar el grafo.**

No es drift ni un bug del kit — es el gate haciendo su trabajo sobre un `refreshCommand` mal declarado.

## Fix (lo decide el dueño del workbench — hay dos caminos)

1. **Scopear el comando** por cada `sourceRoot` real que el índice cubre (un `graphify update <path>`
   por raíz concreta) — preferible si no hay una razón real de agregación global.
2. **Declarar `allowGlobalRefresh: true`** en ese índice **con una razón de agregación documentada** —
   solo si de verdad necesita el grafo de todo el repo como una sola unidad.

No lo aplico yo: el scope correcto depende de la topología de graphify del workbench, que es conocimiento
de su dueño. Adivinar el valor sería peor que dejarlo declarado.

## Contexto (cómo salió)

Un `devkit-doctor` de consumidor salió RED solo por "KDD memory freshness". Se validó con el arquitecto
advisor (Fable) si el gate estaba mal-clasificando salud como bloqueo. **Veredicto: el gate está bien**
— `CANON-KNOWLEDGE-NATIVE-VT-METHOD-001 §8.1` es lex specialis y dice RED cuando falta memoria `required`,
WARN si es opcional. §2.8/§8.8 no alcanzan (el manifiesto es artefacto propio del repo, no una dependencia
heredada; y el gate ya cumple §2.8 para el caso opcional). El RED del consumidor se cura con un refresh
scoped + un `kdd-refresh`. **El único defecto real que salió del análisis es este config del workbench.**

## Nota registrada (arruga latente del gate — NO accionar)

Hay un caso teórico en el gate: un consumidor **todo-opcional** con el manifiesto ausente saldría RED
(líneas 52-61 disparan antes de mirar `cfg.indexes`), donde quizá debería WARN. **Cero consumidores lo
tocan** (orchestrator y workbench declaran graphify `required`), no viola texto sellado, y la remediación
son segundos. Se registra por honestidad; **no se toca el gate** — ablandarlo por una config que nadie corre
sería sobre-ingeniería. Si algún día existe un consumidor todo-opcional: ramificar el manifiesto-ausente en
`cfg.indexes.some(i => i.required)` — con required ⇒ exit 1, ninguno ⇒ WARN exit 0, + las 2 fixtures §8.7(a).

— Claude (devkit-arq) · validado con Fable (1 ronda)
