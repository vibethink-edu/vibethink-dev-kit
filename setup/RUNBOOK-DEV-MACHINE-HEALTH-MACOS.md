# Runbook — Salud y Mantenimiento de la Máquina de Dev (macOS) — STUB

> **Capa:** Adaptador de plataforma **macOS (L3)** — el *cómo* concreto para Mac.
> **Estado:** 🟡 **STUB / PENDIENTE.** Owner: **Rodrigo** (tiene la Mac y valida los comandos).
> **Principios agnósticos:** [`DEV-MACHINE-HEALTH.md`](./DEV-MACHINE-HEALTH.md) — te aplican al 100%; seguilos mientras este adaptador se completa.
>
> **Por qué es un stub:** se redactó desde una máquina Windows; los comandos macOS **no están validados**. En vez de inventarlos (y arriesgar que estén mal), se dejan las **equivalencias a nivel principio** para que el owner ponga y verifique el procedimiento real.

## Equivalencias del principio en macOS (a validar por el owner)

| Principio (agnóstico) | En macOS (punto de partida — validar) |
|---|---|
| Compactar discos virtuales | **No hay WSL/`.vhdx`.** Docker Desktop for Mac usa su propia imagen (`Docker.raw`): reducir vía Settings → Resources, o `docker system prune` + recrear. VMs (UTM/Parallels) tienen su propia compactación. |
| Una versión por herramienta | **Homebrew** (`brew`) como gestor único; evitar mezclar con instaladores sueltos o `npm i -g` fuera de un manejador de versiones. |
| Backup antes de compactar | **Time Machine** (o snapshot APFS). |
| Diagnóstico de disco/RAM | `df -h`, `du -sh *`, Activity Monitor, `About This Mac → Storage`. |
| No borrar a ciegas + mantenimiento mensual | Igual (agnóstico). |
| Diagnóstico de crashes | `Console.app` / panic logs en `/Library/Logs/DiagnosticReports/` (no hay `Get-WinEvent`). |

## NO aplica en macOS (piezas exclusivas de Windows)

- `.wslconfig`, `wsl --shutdown`, `fstrim` de WSL, `diskpart` / `Optimize-VHD`.
- `Get-WinEvent`, `Get-Command`/`where.exe`, rutas `C:\`.

## TODO (owner: Rodrigo)

- [ ] Reemplazar la tabla de equivalencias por el **procedimiento exacto**, validado en Mac.
- [ ] Confirmar cómo compactar el disco de Docker Desktop for Mac en tu versión.
- [ ] Ajustar la cadencia si algo difiere en tu flujo.
