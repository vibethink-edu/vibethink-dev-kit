# External Tools — Default Dev Tooling (registro a nivel kit)

**Status: DEFAULT · non-blocking** — declarado en
`knowledge/ai-agents/AGENTS_UNIVERSAL.md` §Dev Tooling Baseline; este archivo
es el ciclo de vida (pins + recetas de instalación) que ese baseline delega.

**Origen:** promovido desde el `EXTERNAL-TOOLS-REGISTRY.md` de WorkBench
(pregunta abierta en la comms lane del orchestrator desde 2026-05-23;
resuelta por el Principal Architect el 2026-06-12: "dev-kit lo debería tener
default"). Los pins y la evidencia provienen del `EXTERNAL-TOOLS-LOCK.json`
de WorkBench — verificados, no asumidos.

## Las tres barandas (no negociables)

1. **DEFAULT ≠ gate.** La ausencia DEGRADA la experiencia (más tokens, grep a
   ciegas) pero JAMÁS rompe un build, un hook ni CI. No dejar que esto se
   endurezca en gate con el tiempo (advertencia del propio canon).
2. **No se vendorea código de terceros.** Se promueve pin + receta + evidencia
   — nunca el binario/fuente dentro del árbol del repo.
3. **La postura de privacidad viaja con la herramienta.** `graphify-out/`
   jamás se commitea (va al gitignore baseline); la telemetría de RTK
   permanece APAGADA.

## Instalación — un comando (idempotente · non-blocking)

Un heredero **no** necesita seguir las recetas a mano. El kit shippea un
instalador que lee los pins de [`external-tools.lock.json`](external-tools.lock.json)
(fuente de verdad legible por máquina), instala lo que falte y saltea lo ya
presente. **Nunca rompe nada** (DEFAULT ≠ gate; si Python/`gh`/red faltan, degrada y sigue).

```bash
# Windows
pwsh setup/install-external-tools.ps1
# macOS/Linux
bash setup/install-external-tools.sh
# Verificar qué hay (el par "instalar / verificar")
bash setup/check-tools.sh <ruta-al-repo>
```

> Las tools viven **en la máquina**, nunca en el repo (baranda #2). Un `git clone`
> trae el instalador + el lock, no los binarios — corré el instalador una vez por
> máquina. Las recetas manuales de abajo quedan como referencia/troubleshooting.

## Herramientas

| Tool | Clase | Pin | Fuente oficial | Licencia | Rol |
|---|---|---|---|---|---|
| Graphify | A — mission-critical | `0.8.20` | github.com/safishamsi/graphify | MIT | Navegación estructural de código / memoria semántica local (hubs, dead-code, "qué toca X") antes de grep a ciegas |
| RTK | B — cost/quality multiplier | `0.39.0` | github.com/rtk-ai/rtk | Apache-2.0 | Compresión local de output ruidoso de shell (builds, tests, logs, find) — economía de tokens del agente |

## Graphify `0.8.20`

> **Pin bumped `0.7.13 → 0.8.20` (2026-06-15) con la evidencia exigida.** La política
> de este archivo exige *ejercitar la versión nueva en una máquina* (`graphify --help`
> + un `graphify update` real) antes de avanzar el pin. **Ya se ejercitó:** `0.8.20`
> corrió `--help` + un `update` real (indexó una feature: 69 nodos / 146 edges /
> 8 communities, a cero tokens) en el work-server → esa es la prueba pedida. El pin
> avanza a `0.8.20` (la versión verificada; pip publica hasta `0.8.39`, sin ejercitar
> aún → no se adopta sin evidencia). **Non-blocking:** la ausencia degrada, no rompe.

> **⚠️ Gotcha "instalado ≠ disponible" (multi-Python PATH).** El síntoma observado en
> los 5 ejecutores de una ola: todos reportaron `graphify: unavailable` aunque el
> paquete **estaba instalado** — su directorio `Scripts/` (Windows) o `bin/` (POSIX)
> del `--user` site **no estaba en PATH**, así que el CLI `graphify` no resolvía por
> nombre y el flujo que lo invoca no podía usarlo. Agravante **stale-shell:** un proceso
> congela su PATH al arrancar, así que arreglar el PATH del registro **no** afecta a los
> shells ya abiertos — solo un shell/lanzamiento nuevo lo toma. Por eso:
> - `install-external-tools.{ps1,sh}` detecta el `Scripts/`/`bin/` real del `--user` site,
>   lo **antepone al PATH de la sesión** (para que el lanzamiento hijo lo herede) y
>   **reporta el dir exacto** + el comando para agregarlo de forma persistente.
> - `check-tools.sh` verifica que `graphify` **RESUELVE por nombre** (no solo que el
>   paquete esté instalado) y marca explícito el estado "instalado PERO no en PATH".

- Paquete pip: `graphifyy` · CLI: `graphify`
- **Instalación** (requiere Python 3):
  - Windows: `py -m pip install --user graphifyy==0.8.20`
  - macOS/Linux: `python3 -m pip install --user graphifyy==0.8.20`
- Verificación: `graphify --help` (debe **resolver por nombre** — si no, ver el gotcha de PATH arriba)
- Uso: `graphify update <subdir>` → escribe `graphify-out/` (indexar el
  subdirectorio donde se trabaja, NO el monorepo entero)
- `graphify-out/` es cache regenerable: **jamás se commitea** (lección
  orchestrator 2026-05-23: 2.971 archivos de cache staged)
- El indexado estructural funciona a CERO tokens, sin backend LLM. El
  enriquecimiento semántico opcional usa Gemini/Ollama — credenciales
  ausentes = gap de backend semántico, NO "graphify no disponible"
- Privacidad: indexado 100% local, sin secrets, el grafo no se comparte

## RTK `0.39.0`

- Binario: `rtk` · release pineado: `v0.39.0` (asset por plataforma —
  **no usar `latest`**)
- **Instalación Windows** (el ejecutor ya tiene `gh` por el PASO 0 del
  briefing):

  ```powershell
  $target = "$env:USERPROFILE\.vt-tools\rtk\0.39.0"
  New-Item -ItemType Directory -Force -Path $target | Out-Null
  gh release download v0.39.0 -R rtk-ai/rtk -p rtk-x86_64-pc-windows-msvc.zip -D $target --clobber
  Expand-Archive -LiteralPath "$target\rtk-x86_64-pc-windows-msvc.zip" -DestinationPath $target -Force
  & "$target\rtk.exe" --version   # debe reportar: rtk 0.39.0
  ```

  - macOS/Linux: descargar el asset del release `v0.39.0` para la plataforma
- Tras instalar: **confirmar telemetría APAGADA** en `~/.config/rtk/config.toml`
- Uso: envolver comandos de output ruidoso (`rtk <comando>`); NO envolver
  output ya compacto (p.ej. `git log --oneline`)
- Gotcha Windows conocido: subcomandos que delegan en herramientas nativas
  ausentes del PATH fallan (`rtk wc` sin `wc`) — usar el subcomando
  equivalente nativo de rtk o saltarlo
- Privacidad: binario local, sin API keys, sin llamadas LLM

## Herencia y override

- Los herederos consumen este registro **por referencia** (mecanismo estándar
  del kit). Un repo PUEDE override con su propio registro EXTERNAL-TOOLS —
  el ciclo de vida per-repo gana, el override se declara visible.
- **Version-forward:** los pins solo avanzan editando ESTE archivo vía PR al
  kit, con evidencia de la versión nueva verificada en al menos una máquina.

## En los briefings de ejecutor

El PASO 0 de un briefing puede incluir el aprovisionamiento como paso
**OPCIONAL y saltable**: si Python o la descarga fallan, el ejecutor sigue
sin las herramientas y lo anota en el reporte — nunca es un bloqueo.
