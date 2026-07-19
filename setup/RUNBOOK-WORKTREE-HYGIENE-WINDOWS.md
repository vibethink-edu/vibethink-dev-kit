# Runbook — Higiene de worktrees de agentes (Windows)

> **Capa:** Adaptador de plataforma **Windows (L3)** — el *cómo* concreto para que los worktrees que dejan los agentes no llenen el disco. **Puramente informativo** (no es canon, gate ni verifier).
> **Canon relacionado:** `CANON-BRANCH-WORKTREE-LIFECYCLE` §5.4 (remove-en-background, cuarentena-antes-de-purga).
> **Origen:** limpieza 2026-07-19 en la ASUS TUF — `C:\tmp` había llegado a **418 GB** en ~550 worktrees.

## 0. El problema

Los agentes (Claude Code, Codex) crean un worktree por tarea bajo `C:\tmp\vito-wt-*`. Cada uno con `node_modules` hidratado pesa **0.5–7 GB**. En una máquina con dispatch intensivo esto genera **~30 GB/día** y nadie los borra al mergear el PR.

**Síntoma:** alarma de disco al 10% libre; el usuario no entiende en qué se fue 1 TB "si no tengo ni Office".

## 1. El script

`scripts/wt-hygiene.ps1` (en el repo de la máquina, no en el kit — depende de rutas locales).

```powershell
# Ver qué hay y qué se podría limpiar (NO borra nada — modo por defecto)
pwsh "C:\IA Marcelo Labs\scripts\wt-hygiene.ps1"

# Limpiar de verdad
pwsh "C:\IA Marcelo Labs\scripts\wt-hygiene.ps1" -Execute

# Ampliar la ventana de protección (default: 2 días)
pwsh "C:\IA Marcelo Labs\scripts\wt-hygiene.ps1" -DiasProteccion 5
```

### Clasificación

| Categoría | Criterio | Acción |
|---|---|---|
| **SAFE** | rama con PR mergeado (`gh pr list --state merged`) o ancestro de `origin/main` | se borra |
| **ORPHAN** | sin `.git` (borrado a medias previo) | se borra — escombro puro |
| **ACTIVE** | modificado en los últimos N días | **INTOCABLE** (agente trabajando) |
| **DIRTY** | `git status --porcelain` no vacío | **INTOCABLE** (trabajo sin commitear) |
| **AMBIG** | sin evidencia de merge | **INTOCABLE** (revisar a mano) |

### Guardias de seguridad (por qué es seguro correrlo)
1. Solo opera dentro de `C:\tmp`.
2. Solo carpetas `vito-wt-*` / `vito-mobile-*` (no toca logs, evidencias, cuarentenas).
3. Nunca borra ACTIVE / DIRTY / AMBIG.
4. **Neutraliza junctions de primer nivel ANTES de borrar** (ver §2).
5. Usa `git worktree remove` cuando el worktree sigue registrado; `git worktree prune` al final.

## 2. Gotchas (los que ya mordieron)

- **⚠️ Junction de `node_modules` → el borrado sigue el link y destruye el `node_modules` REAL compartido.** Pasó con Campus (se perdió `node_modules/.bin` del checkout principal). **Fix:** quitar el link con `(Get-Item $p -Force).Delete()` (borra el LINK, no el target) **antes** de cualquier borrado recursivo. **NUNCA** `Remove-Item -Recurse` directo sobre un reparse point.
- **⚠️ NO confundir junctions peligrosos con symlinks internos de pnpm.** Un worktree hidratado tiene **8.000–9.500 symlinks** adentro: son de pnpm apuntando a su propio store *dentro de la misma carpeta* → inofensivos y se van con ella. Recorrerlos uno por uno para "protegerlos" cuesta ~1.3M de operaciones inútiles. **Solo importan los links de PRIMER nivel** (un `node_modules` junctionado a otro repo).
- **⚠️ `git worktree remove` con `node_modules` grande excede timeouts** (>2 min) y deja carpeta huérfana sin `.git`. **Correr siempre en background.**
- **⚠️ `Directory not empty` es benigno.** git borra lo que rastrea; quedan archivos no versionados (logs, `.env`, `.next/`). Esas carpetas pasan a ORPHAN y las levanta la siguiente corrida.
- **⚠️ El policy engine bloquea `rm -rf` recursivo** para agentes (static floor, `CANON-CODER-ORCHESTRATION-001 §7`). Por eso el script usa `git worktree remove` primero y `Remove-Item` acotado con guardias, y por eso conviene que el humano dé un GO explícito.
- **Reparación si se perdió `.bin`:** `pnpm install --frozen-lockfile --prefer-offline` lo regenera desde el store `.pnpm` intacto (sin red). En monorepos grandes tarda **>5 min** — correr en background y no en paralelo con una purga (compiten por I/O de disco).

## 3. Política recomendada

- **Semanal** (o cuando el disco baje del 20% libre): correr en modo reporte, mirar, y ejecutar.
- **Antes de purgar**, verificar que ningún agente esté despachado sobre un worktree (la ventana de protección de 2 días cubre el caso normal).
- **Lo que el script NO toca y conviene revisar a mano de vez en cuando:** backups de upgrades (`codex-preupgrade-backups`), caché de pnpm (`AppData\Local\pnpm`), caché del navegador, `Downloads`.

## 4. Evidencia del caso real (2026-07-19)

| | |
|---|---|
| Estado inicial | `C:\tmp` = **418 GB** en ~550 carpetas; **71.7 GB libres** (alarma al 10%) |
| Purga SAFE (240) | 165 borrados limpios, 75 con `Directory not empty` |
| Purga ORPHAN (152) | escombros sin `.git`, ~159 GB |
| Otros | `MEMORY.DMP` (4.7 GB), `hiberfil` reducido (12.7 GB), Docker `builder prune` + compactación vhdx (16.7 GB) |
| **Resultado** | **de 71.7 GB a ~290 GB libres** |
