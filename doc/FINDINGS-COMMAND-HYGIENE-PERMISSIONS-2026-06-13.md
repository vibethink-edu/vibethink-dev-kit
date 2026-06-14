# FINDINGS — Command Hygiene & Permission-Friction (multi-coder)

**Fecha:** 2026-06-13 · **Autor:** Claude (sesión de orquestación) · **Estado:** PROPUESTO
**Para sello de:** Marcelo · **Destino sugerido:** amend a `CANON-MULTI-AGENT-ORCHESTRATION`
(§ nueva "Command Hygiene") + `CANON-BRANCH-WORKTREE-LIFECYCLE` (git -C) ·
referencias cruzadas a `CANON-GIT-HYGIENE`.

> **Alcance:** findings **neutrales de proceso multi-agente** (sin nombres de
> tenant/producto). Los findings específicos de un producto (deploy de un vertical,
> fronteras de dominio) se quedan en el repo de ese producto — anti-contaminación
> del core, consistente con la regla "ningún nombre de tenant en paquetes core".

## Contexto
Setup real: muchos worktrees bajo `/c/tmp/`, Windows + git-bash, orquestador que
lanza coders, y un harness con **gate de permisos por comando**. Los coders generaban
comandos creativos que disparaban prompts de permiso una y otra vez. Cada patrón nuevo
se cerró, pero el aprendizaje de fondo es reusable por todos los coders.

---

## F1 — `git -C "<path>"`, nunca `cd <path> && git ...`
**Síntoma:** todo `cd <worktree> && git commit/add/push` pide permiso **siempre**.
**Causa raíz:** el harness detecta "cambio de directorio + git" y avisa por posible
ejecución de **hooks no confiables** del repo destino. Ningún allowlist lo anula
(es un gate de seguridad, no un match faltante). Se dispara en cada op porque el
trabajo git vive en worktrees fuera del workspace raíz.
**Regla:** apuntar git con `-C "<path-literal>"` sin cambiar de directorio. Una sola
regla `Bash(git *)` lo cubre. Para comandos NO-git que requieren el worktree, no
encadenarlos con git en la misma línea.
**Home:** `CANON-BRANCH-WORKTREE-LIFECYCLE` (operación sobre worktrees).

## F2 — Rutas literales, no variables shell, en comandos a allowlistar
**Síntoma:** `or="/path"; git -C "$or" ...` pide permiso aunque uses `git -C`.
**Causa raíz:** (a) el comando empieza con la asignación `or=...`, así que ya no
empieza con `git` → el prefix-match del allowlist no aplica; (b) `$or` no se resuelve
estáticamente. El harness marca esto como **`simple_expansion`** y **nunca**
auto-permite un comando con expansión de variables.
**Regla:** poné la ruta literal en cada statement (`git -C "/path/lit" ...`). Evitá
asignaciones de variable y `$VAR`/`$?`/`$(...)` en comandos que querés silenciosos.
**Home:** nueva § "Command Hygiene" en `CANON-MULTI-AGENT-ORCHESTRATION`.

## F3 — Para orquestación local confiable, la palanca es el MODO de permiso, no más allowlist
**Síntoma:** después de cerrar decenas de patrones, siguen apareciendo prompts por
comandos con variables/loops/`$()` — el allowlist tiene un techo.
**Causa raíz:** el allowlist es prefix-match literal; cualquier `simple_expansion`,
loop o sustitución queda fuera por diseño (conservador = seguro).
**Regla:** cuando el orquestador opera sobre **worktrees propios y confiables**, usar
**modo bypass de permisos** para esas sesiones, en vez de perseguir patrón por patrón.
**Gotcha crítico (GUI vs CLI):**
- **CLI:** `--dangerously-skip-permissions`, o `permissions.defaultMode: "bypassPermissions"` en settings.
- **GUI (app de escritorio):** **NO** honra `defaultMode: bypassPermissions` de settings (es CLI-only). Se activa en **Settings → habilitar "Allow bypass permissions mode"** + el **selector de modo** al lado del botón de enviar.
- El `deny` (force-push, reset --hard, rm -rf) sigue protegiendo aun en bypass — no quitarlo.
**Home:** nueva § "Command Hygiene" en `CANON-MULTI-AGENT-ORCHESTRATION`.

## F4 — Loops/health-checks recurrentes → script con nombre + allowlist del script
**Síntoma:** `for/until ...; do code=$(curl ...); done` pide permiso siempre.
**Causa raíz:** loops y `$(...)` no se pueden prefix-matchear; el comando interno
allowlisteado no ayuda porque el harness evalúa la construcción completa.
**Regla:** encapsular la lógica recurrente en **un script versionado** e invocarlo con
una **forma canónica exacta** allowlisteada (`Bash(bash "/ruta/abs/script.sh"*)`). El
loop vive dentro del script → el harness solo ve la invocación → cero prompts.
**Home:** § "Command Hygiene".

## F5 — Lecturas de API por CLI solo-GET, no heredocs de intérprete
**Síntoma:** decenas de `python - <<'EOF' ... urllib ... EOF` para consultar una API
local piden permiso siempre.
**Causa raíz:** un heredoc de python/node = ejecución de código arbitrario → el harness
pide permiso siempre, y allowlistar el intérprete sería abrir exec arbitrario (anti-F6).
**Regla:** proveer un **cliente CLI solo-lectura (GET)** con auth/base parametrizadas;
allowlistar su ruta exacta. Mutaciones siguen por la herramienta gobernada existente.
**Home:** § "Command Hygiene".

## F6 — Nunca allowlistar wildcards de ejecución arbitraria
**Regla (recordatorio de seguridad):** `Bash(python *)`, `node *`, `npx *`, `bash *`,
`sh *`, `eval`, `ssh`, `gh api *`, task-runner wildcards (`pnpm run *`, `make *`) =
ejecución arbitraria. No allowlistar con `*`. Si un script recurrente lo necesita,
darle nombre fijo y allowlistar **esa invocación exacta** (F4/F5).
**Home:** referencia cruzada desde `CANON-GIT-HYGIENE` / § "Command Hygiene".

## F7 — Raíz estable de tooling compartido
**Patrón:** poner scripts/config reusables (health-checks, CLI de lectura) en una
**ruta absoluta estable común a todos los worktrees**, e invocarlos con esa ruta. El
allowlist hace match por ruta absoluta literal → **una sola regla sirve desde cualquier
cwd/worktree**, sin duplicar entradas por worktree.
**Home:** § "Command Hygiene".

## F8 — Hooks (husky) deben comillar `"$1"` — rutas con espacios rompen TODO commit
**Síntoma:** `commit-msg` falla con `Unknown arguments: Marcelo, Labs/...` y aborta
cualquier commit.
**Causa raíz:** `.husky/commit-msg` llama `commitlint --edit $1` con `$1` **sin
comillas**; si la ruta del repo tiene espacios (`C:/IA Marcelo Labs/...`), el shell
parte la ruta en varios argumentos. Es un bug latente que se dispara solo en máquinas
con espacios en el path.
**Regla:** todo hook que reciba paths debe comillar (`--edit "$1"`). Aplica a
`commit-msg`, `pre-commit`, etc. Verificar en todos los repos de la familia.
**Home:** § "Command Hygiene" (y candidato a check automático del kit).

---

## Acción propuesta para Marcelo
1. ¿Sellar como **§ "Command Hygiene"** nueva en `CANON-MULTI-AGENT-ORCHESTRATION` (F2–F7)?
2. ¿Amend a `CANON-BRANCH-WORKTREE-LIFECYCLE` con **F1 (git -C)** como anti-patrón explícito?
3. Una vez sellado en el dev-kit, los productos lo heredan por capa (L1/L2); cada repo
   puede materializar las reglas operativas (script de health, CLI de lectura, allowlist)
   vía copy-parity o adapter local — NO copiar el canon.
