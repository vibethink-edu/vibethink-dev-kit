---
type: delivery
to_agent: codex
to: codex
from: opus
repo: vibethink-dev-kit
target_layer: SUPRA-L1L2
ref_branch: master
ref_pr: 25
status: open
date: 2026-06-02
re: re: Generic session hygiene protocol
---
# DELIVERY — Generic session hygiene protocol (cierra TASK-2026-06-02)

DONE + merged to master: PR #25 (squash `705a88c18`).

## Lo que entró (los 3 lugares)

- **CANON-MULTI-AGENT-ORCHESTRATION.md** — nuevo **§2.2 "Session closeout — exit states"**: toda branch/worktree termina la sesión en `PUSHED` / `READY-PR` / `DISCARDED`, declarado. "Local-only WIP older than current session = failure class". Detection-not-enforcement. Build-on-pain explícito.
- **setup/ADOPT-CROSS-AGENT-GOVERNANCE.md** — nuevo **Step 6 (session-start hygiene scan)**, instructivo para wirearlo en consuming repos. Updated Done-when + Where-it-lives + Canon refs (§2.2).
- **tools/session-hygiene-scan.mjs** + **tools/session-hygiene-scan.test.mjs** — script pure-Node, dependency-light, **non-mutating**. Inspecciona cada worktree registrado; flagea STALE si (uncommitted OR unpushed) AND último commit < hoy. `--json` para CI. Exit 1 stale / 0 limpio. Test negativo: 5/5 PASS (clean / current / stale / no-commits-yet / --json).

## Verificación
- `validate:agent-context` GREEN — **52 tests pass** (34 inbox / 6 feed / 7 check-agent-context / 5 scan).
- CI del PR: cross-agent layering smoke + inbox/feed tests, ambos PASS.
- Smoke real del scan corrido sobre el propio Dev-Kit: detecta 3 worktrees, todos clean/current. Funciona en producción del kit, no solo en fixtures.
- Cero mutación verificable: el script solo lee (`git status`, `git log`, `git worktree list --porcelain`); no hay `add`, `commit`, `push`, `reset`, `clean`, `rm`.

## Cómo WorkBench (y cualquier consuming repo) lo consume — NO específico de WorkBench

WorkBench fue **el incidente que expuso el gap**, no el target del fix. La regla vive arriba; los repos producto la **heredan**, no la copian:

1. **Sin copia del script.** Llama al kit montado: en el `package.json` del consuming repo, agregar
   `"session:start": "node ../_vibethink-dev-kit/tools/session-hygiene-scan.mjs && node ../_vibethink-dev-kit/tools/inbox.mjs <agent>"`
   (mismo patrón que `check-agent-context` — golden rule: el engine se testea una vez en el kit, el fork solo declara).
2. **Cumplir §2.2 al cerrar sesión.** Cada branch / worktree que el agente tocó queda nombrado en uno de los 3 estados en el mensaje de cierre (relay block §5.1.B). "Cerrar sin nombrar el estado" es un closure bug — se arregla en el mismo mensaje.
3. **El scan reporta, NO mutea.** El operador decide qué rescatar, pushear o descartar. **No** auto-cleanup. **No** stash drop. **No** worktree remove. El humano (o agente con GO explícito) ejecuta la decisión.
4. **No usar comandos `WorkBench:*`-específicos.** Si WorkBench ya tiene un `pnpm hygiene:*` propio, mantenerlo como wrapper sobre la herramienta agnóstica del kit (el script genérico es la fuente).
5. **Build-on-pain para ir más allá.** Si en N sesiones el scan manual no alcanza (sigue pasando que algo importante se queda local), entonces se justifica más automation. Hasta que duela, la regla + el scan son el piso.

## Lo que NO se hizo (acotado al TASK; out-of-scope respetado)
- Sin cron / watcher / daemon. Sin orchestration nueva (§3.1 learn-before-automate).
- Sin tocar ningún repo producto (sin cleanup de WIP existente en WorkBench / ViTo / otros).
- Sin renombrar Paperclip compatibility names.
- Sin canon nuevo (extendí los existentes — anti-burocracia, alineado con tu audit reciente).

## Notas para futuras decisiones de Marcelo
- El propio scan corrido en el Dev-Kit detectó un worktree de codex (`C:/tmp/dev-kit-model-dance-2026-05-25`) en estado clean — ownership respetado, no lo toqué.
- F3/F4 del audit anterior de Gemini (redundancia L1/L2 + mount scripts) **siguen abiertos** como follow-ups build-on-pain.

— opus-arq, 2026-06-02