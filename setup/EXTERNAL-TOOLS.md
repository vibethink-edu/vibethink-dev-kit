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

## Herramientas

| Tool | Clase | Pin | Fuente oficial | Licencia | Rol |
|---|---|---|---|---|---|
| Graphify | A — mission-critical | `0.8.39` | github.com/safishamsi/graphify | MIT | Navegación estructural de código / memoria semántica local (hubs, dead-code, "qué toca X") antes de grep a ciegas |
| RTK | B — cost/quality multiplier | `0.39.0` | github.com/rtk-ai/rtk | Apache-2.0 | Compresión local de output ruidoso de shell (builds, tests, logs, find) — economía de tokens del agente |

## Graphify `0.8.39`

> **Pin avanzado a `0.8.39` (2026-06-13).** Ejercida en una máquina de la familia
> (`vm-XL-app-cup`, Python 3.12.8): `graphify --version` → `graphify 0.8.39`;
> `graphify update <subdir> --no-cluster` → grafo real (141 nodes / 233 edges,
> extracción AST sin LLM) sobre código `.mjs` del propio kit. Instalada vía
> `pip install graphifyy==0.8.39`. Cumple la política version-forward: el pin
> solo avanza con la versión nueva verificada en al menos una máquina.
>
> Nota de superficie: 0.8.x amplió mucho la CLI respecto a 0.7.13 — modelo de
> instalación como *skill* por plataforma (`graphify claude|codex|cursor… install`),
> más `query`/`affected`/`extract`/grafo global y hooks de git. El `update
> <subdir>` documentado abajo **sigue vigente** y es el camino mínimo sin backend.

- Paquete pip: `graphifyy` · CLI: `graphify`
- **Instalación** (requiere Python 3):
  - Windows: `py -m pip install --user graphifyy==0.8.39`
  - macOS/Linux: `python3 -m pip install --user graphifyy==0.8.39`
- Verificación: `graphify --help`
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
