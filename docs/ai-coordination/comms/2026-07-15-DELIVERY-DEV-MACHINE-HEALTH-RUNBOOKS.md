# DELIVERY — Runbooks de Salud de la Máquina de Dev (agnóstico + Windows + stub macOS)

**Fecha:** 2026-07-15
**De:** Claude Code (Opus 4.8) · bajo autoridad de Marcelo
**Para:** Rodrigo (owner del adaptador macOS)
**Branch:** `claude/docs-dev-machine-health`

## Qué se agregó (todo en `setup/`, puramente informativo — NO canon, NO gates)

1. **`setup/DEV-MACHINE-HEALTH.md`** — **principios agnósticos** (compactar discos virtuales, una versión por herramienta, no borrar a ciegas, backup antes de compactar, mantenimiento mensual, worktrees = dueño). Aplican a cualquier SO.
2. **`setup/RUNBOOK-DEV-MACHINE-HEALTH-WINDOWS.md`** — adaptador **Windows** completo: `.wslconfig` (tope de RAM), compactar WSL (`fstrim` + `diskpart`/`Optimize-VHD`), Docker `prune`, diagnóstico de BSOD, higiene de disco, Codex una-sola-versión.
3. **`setup/RUNBOOK-DEV-MACHINE-HEALTH-MACOS.md`** — **stub, owner Rodrigo**.

Origen: incidente 2026-07-14 en la máquina Windows de Marcelo (BSOD `0x1A` por memoria + Codex duplicado + disco al 89%). Se extrajeron los principios para que el kit no quede sesgado a Windows.

## MENSAJE PARA RODRIGO (owner macOS)

Como usás Mac, se armó la estructura para que al leer el kit **no te confundas con comandos Windows**:

- Leé **`DEV-MACHINE-HEALTH.md`** → los principios te aplican al 100%.
- Tu adaptador macOS es un **stub** con las **equivalencias a nivel principio** (Docker Desktop for Mac, Homebrew, Time Machine, `Console.app`) marcadas *"a validar"*. **No se inventaron comandos de Mac** que no se pueden probar desde una máquina Windows — mejor una casilla honesta que una receta falsa.
- Cuando quieras, completá el **procedimiento exacto validado en tu Mac** (hay un checklist `TODO` al final del stub). Sin apuro ni bloqueo: el stub ya orienta.

## VERDICT
`READY-MERGE` — docs informativos, sin lógica ejecutable. Falta merge del PR.

## SIGUIENTE ACCIÓN HUMANA
Marcelo: revisar y mergear el PR. Rodrigo: completar el stub macOS cuando le sirva.

*Co-autoría: Claude Code (Opus 4.8) redacta; Marcelo autoridad; Rodrigo owner macOS.*
