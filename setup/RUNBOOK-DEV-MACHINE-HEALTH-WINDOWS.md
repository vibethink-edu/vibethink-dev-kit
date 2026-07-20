# Runbook — Salud y Mantenimiento de la Máquina de Dev (Windows)

> **Capa:** Adaptador de plataforma **Windows (L3)** — el *cómo* concreto para Windows/WSL. **Puramente informativo** (no es canon, gate ni verifier).
> **Principios agnósticos (leer primero):** [`DEV-MACHINE-HEALTH.md`](./DEV-MACHINE-HEALTH.md) · **Otras plataformas:** [`RUNBOOK-DEV-MACHINE-HEALTH-MACOS.md`](./RUNBOOK-DEV-MACHINE-HEALTH-MACOS.md)
>
> **Qué es esto:** las prácticas para que una máquina de desarrollo Windows (WSL + Docker + monorepos + agentes) no se llene el disco, no se quede sin RAM (BSOD) y no acumule instalaciones duplicadas. Nace del incidente del 2026-07-14 (BSOD `0x1A` por memoria + Codex duplicado + disco al 89%).
>
> **Regla madre:** en máquina de dev **NO se borra a ciegas**. Se **compacta** (recupera espacio sin borrar), se **prune** con los comandos oficiales, y los worktrees los limpia el dueño con su política. Antes de cualquier compactación de disco virtual → **backup**.

---

## 0. Cadencia (que sea hábito, no bombero)

| Cada | Hacer |
|---|---|
| **Sesión** | Diagnóstico rápido de salud (§1) si la máquina va lenta |
| **Semanal** | Revisar RAM/procesos; reiniciar el equipo (limpia memoria que no se devuelve) |
| **Mensual** | `docker system prune`, compactar WSL (§3), revisar worktrees `C:\tmp` |
| **Al instalar algo nuevo** | Desinstalar la versión vieja (§6, §7). No dejar duplicados |

Docker y WSL **crecen sin límite**: sin mantenimiento periódico se comen el disco.

---

## 1. Diagnóstico rápido de salud (comandos)

```powershell
# RAM: total / en uso / libre
$os=Get-CimInstance Win32_OperatingSystem
"Libre: {0} GB" -f [math]::Round($os.FreePhysicalMemory/1MB,1)

# Top procesos por RAM
Get-Process | Group-Object Name | Select @{n='App';e={$_.Name}},@{n='GB';e={[math]::Round((($_.Group|Measure WorkingSet64 -Sum).Sum)/1GB,2)}} | Sort GB -Desc | Select -First 10

# Espacio en disco
Get-Volume | ? DriveLetter | Select DriveLetter,@{n='Libre_GB';e={[math]::Round($_.SizeRemaining/1GB,1)}}

# Pantallazos azules (BSOD) recientes + stop code
Get-WinEvent -FilterHashtable @{LogName='System';Id=1001} -MaxEvents 6

# QUIÉN agotó la memoria (evento clave)
Get-WinEvent -FilterHashtable @{LogName='System';ProviderName='Microsoft-Windows-Resource-Exhaustion-Detector'} -MaxEvents 4

# Medir tamaño de carpetas grandes (rápido, sin crear objetos por archivo)
robocopy "<carpeta>" NUL /L /E /BYTES /NFL /NDL /NJH /NP /NC /XJ   # leer la línea "Bytes"
```

> En Windows es `Get-Command <x> -All` y `where.exe <x>` — **no `which`** (eso es Linux).

**Semáforo (Administrador de tareas `Ctrl+Shift+Esc` → Rendimiento → Memoria):**
🟢 <75% · 🟡 75–90% (cerrá algo) · 🔴 >90% (cerrá ya o reiniciá antes del BSOD).

---

## 2. Memoria RAM — prevención de crashes (BSOD `0x1A MEMORY_MANAGEMENT`)

**Causa típica:** WSL sin tope + demasiadas apps → se agota la RAM → pantallazo.

**Fix estructural — `C:\Users\<user>\.wslconfig`:**
```ini
[wsl2]
memory=24GB          # tope; deja el resto a Windows. Suficiente para builds pesados
swap=8GB             # colchón: un build pico usa disco en vez de morir
[experimental]
autoMemoryReclaim=gradual   # WSL DEVUELVE la RAM cacheada al terminar (clave; sin esto se queda inflado)
```
Aplicar: `wsl --shutdown` (tarda ~8s en releer el config).

**Reglas de convivencia:**
- No tener 4 IDEs + WSL + Docker + navegadores abiertos a la vez. Cerrá lo que no uses.
- Antes de un build pesado en WSL, cerrá lo demás.
- Reiniciá el equipo cada 1–2 días (los programas no devuelven toda la RAM).

---

## 3. WSL — compactar el disco virtual (recuperar GB sin perder nada)

**Por qué se infla:** el disco de WSL es **un archivo** (`ext4.vhdx`). Crece cuando llenás, pero **NO se encoge solo** cuando borrás adentro — reserva el espacio. Diagnóstico: el archivo pesa 93 GB pero `du` adentro dice 25 GB → 68 GB de aire.

**Verificar inflado (read-only):**
```powershell
# tamaño del archivo
(Get-ChildItem "$env:LOCALAPPDATA\wsl" -Recurse -Filter *.vhdx).Length/1GB
# uso real adentro
wsl -d Ubuntu -u root -- df -h /        # 'Used' vs el tamaño del archivo
```

**Compactar (procedimiento seguro, NO borra datos):**
```powershell
# 1) BACKUP del vhdx primero (buena práctica; ver Fuentes)
# 2) fstrim: marca libres los bloques ya borrados
wsl -d Ubuntu -u root -- fstrim -v /
# 3) apagar WSL por completo
wsl --shutdown
# 4) compactar — COMO ADMINISTRADOR:
#    a) diskpart (todas las ediciones de Windows):
$v="$env:LOCALAPPDATA\wsl\{GUID}\ext4.vhdx"
"select vdisk file=`"$v`"`r`nattach vdisk readonly`r`ncompact vdisk`r`ndetach vdisk`r`nexit" | Out-File "$env:TEMP\dp.txt" -Encoding ascii
diskpart /s "$env:TEMP\dp.txt"
#    b) o (si hay Hyper-V): Optimize-VHD -Path $v -Mode Full
```

**⚠️ NO usar** `wsl --manage <distro> --set-sparse true` en un disco EXISTENTE: Microsoft lo bloquea por **riesgo de corrupción** (pide `--allow-unsafe`). `sparseVhd` solo es seguro en discos **nuevos**. En máquina de dev → **jamás `--allow-unsafe`**.

**⚠️ NUNCA** modificar/mover/abrir los archivos de WSL en `AppData` con herramientas de Windows (Explorador, etc.) → corrompe la distro.

---

## 4. Docker — prune periódico (suele tener 10–66 GB de basura)

```powershell
docker system df                 # ver cuánto ocupa qué
docker image prune -a            # imágenes sin usar
docker container prune           # contenedores parados
docker builder prune             # cache de build (suele ser el gordo)
docker volume prune              # OJO: borra volúmenes sin contenedor → puede tener datos
```
Recupera 10–30 GB típico. **`volume prune` con cuidado** (revisá antes qué volúmenes hay). Tras el prune, el `docker_data.vhdx` no se encoge solo → aplicar §3 (compactar) a ese vhdx también.

---

## 5. Higiene de disco — dónde se esconde el espacio (mapa 2026-07)

Medí con `robocopy /L` (§1). En esta máquina el ~1 TB estaba así:

| Dónde | Qué es | Cómo se libera |
|---|---|---|
| **`C:\tmp` (worktrees de agentes, p. ej. `<repo>-wt-*`)** | worktrees no limpiados post-merge | `git worktree remove` + `prune` — **NUNCA `rm -rf` crudo** (política del dueño) |
| **`AppData\Local\wsl`** | disco de Ubuntu (inflado) | Compactar (§3) |
| **`AppData\Local\Docker`** | imágenes/volúmenes | prune (§4) + compactar |
| **`AppData\Local\Google`** | caché de Chrome/Drive | se regenera; limpiar caché del navegador |
| **`codex-preupgrade-backups` / `Codex-backups`** | respaldos de updates de Codex | revisar y archivar/borrar manualmente cuando ya no sirvan |
| **`pnpm` store / `node_modules`** | paquetes | `pnpm store prune`; borrar `node_modules` de proyectos muertos |
| **Papelera** | ya "borrado" | vaciar |

> **Worktrees = responsabilidad del dueño, con su propia política.** Este playbook no los toca.

---

## 6. Codex — una sola versión (evitar el "update loop")

**CLI (terminal):** dueño único = **Volta**.
- Actualizar: `volta install @openai/codex@latest`. **NUNCA `npm i -g`** (instala en un rincón fuera del PATH → actualizás una copia y corrés otra → loop infinito).
- Verificar: `Get-Command codex -All` (muestra todas las copias y cuál gana).

**App de escritorio:** usar SOLO la de **Microsoft Store**; anclarla a la barra de tareas. La instalación **standalone vieja** (`AppData\Local\OpenAI\CodexDesktop`) no se auto-actualiza y el atajo del menú inicio apunta a ella → confunde. Desinstalarla cuando se decida.

**Chats:** viven en la **nube** (cuenta OpenAI). Borrar apps locales NO los pierde; la app nueva los muestra todos al loguear.

---

## 7. Instalaciones duplicadas — regla general

El 90% de los líos de disco/versión son **copias viejas nunca desinstaladas** (Codex CLI x3, Codex App x2, node por 4 lados). Reglas:
- Al instalar "encima", **desinstalá lo viejo** en el mismo acto.
- Un gestor por herramienta (Volta para node/CLIs). No mezclar `npm i -g` con Volta.
- `Get-Command <x> -All` / `where.exe <x>` para ver duplicados en el PATH; el primero gana.

---

## 8. Organización de descargas

`Downloads` acumula GB de sueltos. Organizarlos por tipo en subcarpetas (Videos, Instaladores, Comprimidos, Documentos…) **sin borrar** — solo mover. Deja el raíz limpio y facilita después decidir qué liberar.

---

## Reglas de oro

1. **No borrar a ciegas** (máquina de dev). Compactar/prune > borrar.
2. **Backup antes** de compactar cualquier disco virtual.
3. **Una sola versión** de cada herramienta.
4. **Cerrá lo que no usás**; reiniciá seguido.
5. **Worktrees los maneja el dueño** con su política.
6. En Windows: `Get-Command`/`where.exe`, no `which`.

---

## Fuentes (validado 2026-07-15)

- WSL disk mgmt (oficial): https://learn.microsoft.com/en-us/windows/wsl/disk-space
- WSL config (oficial): https://learn.microsoft.com/en-us/windows/wsl/wsl-config
- Shrink WSL2 vhdx (Hanselman): https://www.hanselman.com/blog/shrink-your-wsl2-virtual-disks-and-docker-images-and-reclaim-disk-space
- Shrink WSL2 (Rees-Carter): https://stephenreescarter.net/how-to-shrink-a-wsl2-virtual-disk/
- Dev disk cleanup (node_modules/Docker/WSL): https://khides.com/en/blog/developer-disk-cleanup/
- WSL VHDX cleanup: https://zicode.com/en/blog/wsl-disk-space-vhdx-cleanup/
- wsl-cleaner (script): https://github.com/dbfx/wsl-cleaner
- Reclaim memory from Docker WSL: https://dev.to/colin-williams-dev/how-to-reclaim-memory-from-docker-wsl-2lkf
