---
type: guide
from: devkit-arquitecto
to_agent: human
to: human
repo: vibethink-dev-kit
status: open
needs: human
priority: normal
date: 2026-06-16
re: Upgrade del dev-kit en macOS — para Rodrigo
---
> **Para:** Rodrigo (dev en macOS — primer consumidor no-Windows). **De:** devkit-arquitecto.
> **Por qué importa doble:** su corrida confirma que el kit anda en macOS (destraba #123 + el README macOS 🟡→✅).

## Cómo correr el upgrade del dev-kit (macOS)

**0) Poné el dev-kit al día primero** (así corrés las últimas herramientas — incluye el fix #130 del doctor). Asumo que está al lado de tu repo como `../_vibethink-dev-kit`:
```bash
git -C ../_vibethink-dev-kit fetch origin && git -C ../_vibethink-dev-kit merge --ff-only origin/master
```
Si todavía no lo tenés clonado:
```bash
git clone <url-del-dev-kit> ../_vibethink-dev-kit
```

**1) Preview (no toca nada — muestra qué haría, tool por tool):**
```bash
node ../_vibethink-dev-kit/tools/devkit-upgrade.mjs --dry-run
```

**2) Aplicar (cuando el preview se vea bien):**
```bash
node ../_vibethink-dev-kit/tools/devkit-upgrade.mjs
```
Hace `git pull` del kit, re-sincroniza los runnables copiados, y provisiona las tools que falten a su pin (graphify vía `pip`/python3, rtk). En Mac elige solo el script `.sh` (bash).

**3) Ver el estado:**
```bash
node ../_vibethink-dev-kit/tools/devkit-doctor.mjs --adoption
```
👉 Si dice **"NO ADOPTION DECLARED"** es **normal** en un repo que todavía no declaró adopción — no es un error. Para declararla más adelante: copiás `setup/templates/DEV_KIT_INHERITANCE_STATUS.template.md` a `doc/` o `docs/` de tu repo (el doctor ahora lee ambos, #130).

## Notas para Mac
- Usa **python3** y **bash** automáticamente.
- Si tras instalar graphify dice *"el CLI no resuelve por nombre"*, el script imprime la línea de PATH a agregar (tipo `~/Library/Python/3.x/bin` o `~/.local/bin`) → agregala a `~/.zshrc` y **abrí una terminal nueva** (una abierta no toma el cambio).
- Si algo falta, **no se rompe** — degrada y avisa (non-blocking por diseño).

## Lo que pedimos de vuelta
Pegá la salida de los pasos **1 y 3** (y del 2 si lo corrés). Con eso confirmamos que el flujo corre limpio en macOS y marcamos el README macOS ✅.
