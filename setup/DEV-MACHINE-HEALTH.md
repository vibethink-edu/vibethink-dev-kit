# Salud y Mantenimiento de la Máquina de Dev — Principios (agnóstico)

> **Capa:** Principios **agnósticos** — el *qué* y el *por qué*, válidos en cualquier sistema operativo. **Puramente informativo** (no es canon ejecutable, ni gate, ni verifier); da **alineamiento** al equipo.
> El *cómo* concreto (comandos) vive en los **adaptadores por plataforma** (abajo).
>
> Origen: incidente 2026-07-14 en una máquina Windows (BSOD por memoria + apps duplicadas + disco al 89%). Los principios se extrajeron para que apliquen a cualquier máquina de dev del equipo (Windows, macOS, Linux).

## Principios (invariantes — cualquier SO)

1. **Mantenimiento = hábito, no bombero.** Un pase mensual evita el incendio.
2. **Los discos virtuales crecen pero NO se encogen solos.** WSL, Docker, VMs: reservan espacio que no devuelven al borrar adentro → hay que **compactarlos** periódicamente.
3. **Una versión por herramienta.** Un solo gestor por stack; no mezclar. Las **instalaciones duplicadas** son la causa #1 de líos de versión y de disco.
4. **En máquina de dev NO se borra a ciegas.** Compactar / `prune` con comandos oficiales **>** borrar. Backup antes de tocar un disco virtual.
5. **Diagnosticar antes de declarar.** Medir RAM, disco y eventos del sistema antes de afirmar una causa o un límite.
6. **Los worktrees los limpia su dueño**, con su propia política. Nadie limpia el árbol de otro por asunción.
7. **Duplicados fuera:** al instalar algo nuevo "encima", desinstalar lo viejo en el mismo acto.

## Adaptadores por plataforma (el *cómo*)

| SO | Adaptador (comandos concretos) | Estado |
|---|---|---|
| **Windows** | [`RUNBOOK-DEV-MACHINE-HEALTH-WINDOWS.md`](./RUNBOOK-DEV-MACHINE-HEALTH-WINDOWS.md) | ✅ Completo |
| **macOS** | [`RUNBOOK-DEV-MACHINE-HEALTH-MACOS.md`](./RUNBOOK-DEV-MACHINE-HEALTH-MACOS.md) | 🟡 Stub (owner: Rodrigo) |
| **Linux** | *(pendiente — agregar adaptador cuando exista una máquina)* | — |

> **Si usás Mac:** leé estos principios (te aplican al 100%) y seguí el adaptador macOS. Si un comando del adaptador Windows no tiene equivalente Mac, es porque esa pieza (WSL/`diskpart`/`.wslconfig`) es exclusiva de Windows — no te falta nada.

## Cadencia (aplica a cualquier SO)

| Cada | Hacer |
|---|---|
| **Sesión** | Diagnóstico rápido si la máquina va lenta |
| **Semanal** | Revisar RAM/procesos; reiniciar el equipo (libera memoria no devuelta) |
| **Mensual** | `prune` de Docker, compactar discos virtuales, revisar worktrees |
| **Al instalar algo nuevo** | Desinstalar la versión vieja |
