---
type: note
from: claude (devkit-arq)
to_agent: claude
to: claude
repo: vibethink-dev-kit
status: open
needs: agent
priority: normal
date: 2026-07-23
re: ADDENDUM scripts de operador: el nudo NO es diseño nuevo — machine-identity.mjs + decisión 2026-05-25 ya lo resuelven (prior-art traído por Marcelo)
summary: "prior-art vivo: git distribuye una vez pusheado; machine-identity.mjs es el primitivo per-maquina; baja de diseno a ejecucion"
---
## Qué corrige

Addendum a `DECISION-RESPUESTA-AL-FINDING-DE-SCRIPTS-DE-OPERADOR-PR-5250-...-2026-07-21` (mismo lane).
Ese comm presentó el **"nudo"** (resolver la ruta por máquina + escribir las referencias) como si
necesitara **diseño nuevo** estilo ops-sync. **Es incorrecto: la arquitectura ya está decidida y el
primitivo ya existe, vivo.** La autoridad (Marcelo) lo cazó desde memoria — *"creo que ya teníamos una
experiencia sobre eso"*. La tenía, y más de una vez.

**Honestidad del registro:** tanto el comm original como la ronda de arquitecto advisor (Fable) de esa
noche **pasaron por alto este prior-art**. El chequeo lo hizo la memoria del operador. Queda anotado
como lo que es — el humano-en-el-loop atrapando un prior-art que el advisor y el agente no surfacearon.

## El prior-art (verificado y VIVO 2026-07-23)

1. **Decisión 2026-05-25** (`DELIVERY-...-MULTI-WORKSTATION`): *"la mayoría ya la da git… la máquina no
   importa una vez pusheado… el único gap real era un comando corto"* → `comms:send`/`comms:sync`.
   **Principio ya decidido: una vez versionado + pusheado, git distribuye; la máquina no importa.**
2. **`tools/machine-identity.mjs`** (orchestrator, PR #2738/#2743, MERGED). Corrido en vivo:
   `{"hostname":"VibeThink-CEO","platform":"windows","alias":"TUF"}`. Cross-platform (`os.hostname()`),
   Mac-aware (`darwin→macos`), resuelve alias vía `_machine-profiles/machine-aliases.json`, principio
   **"detectar, nunca hardcodear"**. **ESTE es el primitivo del "nudo"** — no hay que inventarlo.
3. **`_machine-profiles/`** (git-excluida, per-máquina) + patrón `.agents/skills → .claude/skills`
   (source agnóstico → target tool-específico): distribución por-máquina ya existente.

## Qué cambia en la respuesta al finding

El problema de scripts de operador **NO es arquitectura nueva** — es **ejecución no-hecha de una
arquitectura ya decidida.** Baja de "diseño + Fable" a "aplicar lo existente + el GO del repo".

**Recipe corregida (bind, no invent):**
- **Backup + distribución:** versionar los scripts (repo de operador con remote) → git los distribuye;
  Rodrigo (Mac) hace `clone` + `comms:sync`. La decisión 2026-05-25 ya lo dice: la máquina no importa
  una vez pusheado.
- **El "nudo" (ruta por máquina):** la **generación** de las referencias (CLAUDE.md/allowlist/hooks) a
  tiempo de escritura **se ata a `machine-identity.mjs`** para resolver la máquina, y a
  `_machine-profiles/` para los valores por-máquina. Se genera con el patrón `.agents/skills →
  .claude/skills` ya probado. Cero primitivo nuevo.
- **Sigue siendo cierto** de la respuesta original: `wt-hygiene.ps1`/`memory-doctor.mjs`/`check-health.sh`
  → kit; `wb-get.py`/`workbench-nudge.mjs` → workbench (product-coupled); resolución a **write-time**,
  no runtime (el harness matchea texto literal); diff humano para `settings.json`.

## Estado

- El finding NO se cierra como duplicado: los 7 scripts + `CLAUDE.md` + Espanso **siguen sin versionar**
  (la ejecución no se hizo). Lo que cambia es que **el CÓMO ya está resuelto y decidido** — el GO del
  repo de operador aplica arquitectura conocida, no abre diseño.
- Sin nueva ronda de Fable: es corrección sobre evidencia viva, no decisión nueva.

— Claude (devkit-arq) · prior-art traído por la autoridad
