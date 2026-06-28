# External Tools — Default Dev Tooling (registro a nivel kit)

**Status: DEFAULT · non-blocking para producto · loud para sesión local** — declarado en
`knowledge/ai-agents/AGENTS_UNIVERSAL.md` §Dev Tooling Baseline; este archivo
es el ciclo de vida (pins + recetas de instalación) que ese baseline delega.

**Origen:** promovido desde el `EXTERNAL-TOOLS-REGISTRY.md` de un consumidor
(pregunta abierta en la comms lane de un consumidor desde 2026-05-23;
resuelta por el Principal Architect el 2026-06-12: "dev-kit lo debería tener
default"). Los pins y la evidencia provienen del `EXTERNAL-TOOLS-LOCK.json`
de un consumidor — verificados, no asumidos.

## Las tres barandas (no negociables)

1. **DEFAULT ≠ product gate.** La ausencia DEGRADA la experiencia (más tokens,
   grep a ciegas) pero JAMÁS rompe un build, un hook de producto ni CI de
   correctness. **DEFAULT tampoco significa silencioso:** `devkit-doctor`,
   `check-tools` y los launchers de sesión deben mostrar RED/WARN visible si
   RTK/Graphify faltan, si el paquete está instalado pero el CLI no está en PATH,
   o si el shell está stale / ve solo el `.exe`.
2. **No se vendorea código de terceros.** Se promueve pin + receta + evidencia
   — nunca el binario/fuente dentro del árbol del repo.
3. **La postura de privacidad viaja con la herramienta.** `graphify-out/`
   jamás se commitea (va al gitignore baseline); la telemetría de RTK
   permanece APAGADA.

## Instalación — un comando (idempotente · non-blocking)

Un heredero **no** necesita seguir las recetas a mano. El kit shippea un
instalador que lee los pins de [`external-tools.lock.json`](external-tools.lock.json)
(fuente de verdad legible por máquina), instala lo que falte y saltea lo ya
presente. **Nunca rompe producto** (DEFAULT ≠ product gate; si Python/`gh`/red
faltan, degrada y sigue), pero el verificador de salud local debe chillar.

```bash
# Windows
pwsh setup/install-external-tools.ps1
# macOS/Linux
bash setup/install-external-tools.sh
# Verificar qué hay (el par "instalar / verificar")
bash setup/check-tools.sh <ruta-al-repo>
bash setup/check-tools.sh --json <ruta-al-repo>   # salida legible por launchers
node tools/external-tools-health.mjs --json       # salud de tools registradas en el lock
```

> Las tools viven **en la máquina**, nunca en el repo (baranda #2). Un `git clone`
> trae el instalador + el lock, no los binarios — corré el instalador una vez por
> máquina. Las recetas manuales de abajo quedan como referencia/troubleshooting.

## Herramientas

| Tool | Clase | Pin | Fuente oficial | Licencia | Rol |
|---|---|---|---|---|---|
| Graphify | A — mission-critical | `0.8.39` | github.com/safishamsi/graphify | MIT | Navegación estructural de código / memoria semántica local (hubs, dead-code, "qué toca X") antes de grep a ciegas |
| RTK | B — cost/quality multiplier | `0.39.0` | github.com/rtk-ai/rtk | Apache-2.0 | Compresión local de output ruidoso de shell (builds, tests, logs, find) — economía de tokens del agente |
| Engram | C — **stateful (memoria)** | `1.17.0` | github.com/Gentleman-Programming/engram | MIT | Memoria persistente cross-agente (SQLite+FTS5, binario Go in-process) — el "cuaderno compartido" de los agentes; buscar/guardar lecciones entre sesiones y agentes |

## Engram `1.17.0` — ⚠️ clase C: STATEFUL (distinta a A/B)

> **Por qué clase C y no A/B:** Graphify y RTK son **sin estado** — si faltan, los regenerás, no perdés nada (por eso "ausencia degrada, no rompe" es literal). **Engram GUARDA DATOS** (la memoria de los agentes). La baranda #1 se cumple para el **binario** (instalarlo es non-blocking igual que A/B), pero **los DATOS son responsabilidad del operador**: respaldar con `engram export`, compartir con `engram sync`. Binario perdido → reinstalás; **BD perdida sin respaldo → se pierde memoria**. Tratar la BD como precioso, no como caché.
>
> **Engram es de los AGENTES, no de los sistemas.** Cada sistema/producto consumidor tiene su propia BD para su trabajo; Engram es el cuaderno compartido de los agentes que trabajan *sobre* ellos. Un sistema NO adopta Engram; sus agentes sí.
>
> **Evidencia (ejercitada 2026-06-20):** `engram.exe v1.17.0` instalado en una máquina de la familia; `save`/`search` (FTS5)/`stats`/`doctor`/`export` verdes; **memorias reales** importadas a `~/.engram` (`--project <consumidor>`). Recall **fuerte con términos técnicos, débil cross-idioma** (FTS literal, sin semántica) — limitación documentada.
>
> **Acceso por agente (no es como graphify):** graphify se invoca por CLI y listo. Engram es **memoria compartida**, así que cada agente que deba leer/escribir se enchufa una vez: `engram setup <claude-code|codex|cursor|gemini-cli|…>` (registra su MCP, perfil `agent` = 15 tools — **nunca el perfil `all`=19, nunca un MCP global por default**: per-agente y perfil mínimo). Claude Code en modo CLI (`engram save/search`) evita meter tools al contexto; agentes sin auto-surface propio usan el MCP.
>
> **Privacidad (baranda #3):** la BD vive local (`~/.engram`), **datos del operador, nunca en el repo**. Engram chequea updates contra GitHub en cada invocación (ruido 403 sin token) — desactivable; no bloqueante.
>
> **Naming de proyecto:** la memoria se particiona por `--project` (ej. el nombre del repo consumidor). Para que varios agentes compartan el mismo cuaderno, alinear el nombre de proyecto entre ellos.
>
> **Cadencia de upstream: SEMANAL (decisión Marcelo 2026-06-20).** Engram ship rápido (v1.14→v1.17 en días) y es **stateful** — cambios en su formato/sync/CLI nos afectan — así que la verificación *"¿qué cambió?"* es **cada 7 días** (más agresiva que A/B: graphify 30d, rtk 60d). **PRINCIPIO (simple):** *USAR Engram dentro de la suite + trackearlo como upstream semanal.* **NO** reverse-engineer su BD/implementación dentro de un sistema consumidor ni del dev-kit — no copiamos "lo que ya tiene y cómo lo hizo", lo **usamos** y **vigilamos qué cambia**.
>
> **Doctrina de adopción — los 2 deltas restantes vs graphify (sello Marcelo 2026-06-20).**
> - **Solo el binario, NO el ecosistema.** Se adopta el binario `engram` y nada más — **no** `gentle-ai` (su SDD/skills): un framework de opiniones importado sería un **2º framework** compitiendo con el del dev-kit, justo el anti-patrón de capacidad-importada de `CANON-CONTEXT-HYGIENE` §6.2. La herramienta sí; su ecosistema de opiniones no.
> - **Alimenta, no decide.** Engram es memoria de *recall*: **input advisory, nunca autoridad**. Las decisiones viven en spec/ADR/canon; Engram **nunca overridea un sellado** — en conflicto gana el sellado y el agente reporta la divergencia. Es el principio de `CANON-CONTEXT-HYGIENE` §6 (*ninguna capacidad importada supera la autoridad del repo*) aplicado a la capa de memoria; el recall es punto-en-el-tiempo → verificar contra la fuente viva antes de afirmarlo.

## Graphify `0.8.39`

> **Pin bumped `0.7.13 → 0.8.20 → 0.8.39` (2026-06-15) con la evidencia exigida.** La
> política de este archivo exige *ejercitar la versión nueva en una máquina*
> (`graphify --version`/`--help` + un `graphify update` real) antes de avanzar el pin.
> Trazo: `0.8.20` se ejercitó primero (`--help` + un `update` real, 69 nodos / 146 edges
> / 8 communities, a cero tokens — work-server). Luego **`0.8.39` se ejercitó en una
> máquina de la familia** (`vm-XL-app-cup`, Python 3.12.8): `graphify --version` →
> `0.8.39` + `graphify update <subdir> --no-cluster` → grafo real **141 nodos / 233
> edges** (extracción AST, sin backend LLM) sobre los `.mjs` del propio kit. Esa es la
> prueba más fuerte y la versión más nueva verificada → el pin queda en `0.8.39`.
> **Non-blocking:** la ausencia degrada, no rompe.
>
> *Nota de superficie:* 0.8.x amplió la CLI (instalación como skill por plataforma,
> `query`/`affected`/`extract`, grafo global, hooks de git). El `update <subdir>`
> documentado sigue vigente y es el camino mínimo sin backend, así que la guía de uso
> no rompe. Aprovechar el modelo skill = PR aparte.

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
> - `check-tools.sh` y `devkit-doctor` verifican que `graphify` **RESUELVE por nombre**
>   (no solo que el paquete esté instalado) y marcan explícito el estado
>   "instalado PERO no en PATH". En Bash/WSL también detectan el caso Windows `.exe`
>   visible (`graphify.exe`) pero comando canónico invisible (`graphify`) como
>   **WARN shell mismatch / stale shell**, no como "no instalado".

- Paquete pip: `graphifyy` · CLI: `graphify`
- **Instalación** (requiere Python 3):
  - Windows: `py -m pip install --user graphifyy==0.8.39`
  - macOS/Linux: `python3 -m pip install --user graphifyy==0.8.39`
- Verificación: `graphify --help` (debe **resolver por nombre** — si no, ver el gotcha de PATH arriba)
- Uso: `graphify update <subdir>` → escribe `graphify-out/` (indexar el
  subdirectorio donde se trabaja, NO el monorepo entero)
- `graphify-out/` es cache regenerable: **jamás se commitea** (lección
  un consumidor 2026-05-23: 2.971 archivos de cache staged)
- El indexado estructural funciona a CERO tokens, sin backend LLM. El
  enriquecimiento semántico opcional usa Gemini/Ollama — credenciales
  ausentes = gap de backend semántico, NO "graphify no disponible"
- Privacidad: indexado 100% local, sin secrets, el grafo no se comparte

> **Freshness & activación (SEALED 2026-06-27 by the Principal Architect — "sellalo").** El uso scoped + no-commit de arriba
> resuelve el CÓMO, pero los operator-tools se **omiten en la práctica** cuando el grafo se pone
> viejo en silencio: el agente lo consulta, ve código desactualizado, concluye "no sirve" y deja
> de usarlo. *No es disciplina — es freshness + activación.* El nudge pasivo (texto "reach for it")
> es fácil de saltar.
> - **Estándar: nudge ACTIVO, no pasivo.** Un hook `SessionStart` (fs-only, `exit 0`, nunca
>   bloquea) detecta que el grafo está stale y **redirige al patrón scoped** — nunca a rebuildear
>   el monorepo.
> - **Scoped, NO whole-repo (medido).** `graphify update .` (todo el repo) midió **>9 min,
>   all-or-nothing, sin terminar** en un repo grande (~12k archivos); `graphify update <subdir>`
>   midió **~6 s**. El nudge da el comando scoped, jamás auto-rebuildea (caro).
> - **Safety en el mensaje:** local/no-LLM por default — sin `GEMINI/GOOGLE_API_KEY` no sale
>   código a un LLM externo (el enriquecimiento semántico SÍ enviaría el código).
> - **Dos nudges complementarios (SessionStart):** (a) **freshness del grafo** —
>   `graphify-staleness.mjs`; (b) **tools cargadas** — `operator-tools-health.mjs` (chequea que
>   graphify/engram/rtk **resuelvan por nombre**; atrapa el gotcha "instalado ≠ disponible" del
>   PATH que dejó ejecutores reportando `unavailable`). Ambos: fs/spawn-light, `exit 0`, nunca
>   bloquean, silenciosos cuando todo está bien.
> - **Implementación de referencia:** `scripts/{graphify-staleness,operator-tools-health}.mjs`
>   (consumidor) + `setup/templates/hooks/{graphify-staleness,operator-tools-health}.mjs` (templates
>   agnósticos) — provisionables por `install-external-tools` (auto-wire al `settings.json` del
>   consumidor = build-on-pain, después).
>
> **Aplica a los 3 operator-tools (no solo graphify) — mismo patrón de nudge activo:**
> - **engram (memoria · stateful → costo MAYOR: lo no-grabado se pierde):** SessionStart →
>   recordá *recall* (`engram search <tema>`); al sellar decisión/hallazgo → recordá `engram save`
>   (no solo en chat).
> - **rtk (economía de tokens):** trigger distinto — cuando vayas a pipear un build/test largo,
>   usá `rtk` en vez de `head`/`tail` (se dispara al correr el comando ruidoso, no al inicio).
>
> graphify es la **1ra instancia construida**; engram + rtk siguen el mismo estándar (sus hooks
> concretos = build-on-pain). El principio único: *nudge activo > texto pasivo; el agente que no
> recibe el recordatorio, omite la herramienta.*

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
- **Engram queda separado del baseline A/B:** está documentado arriba como clase C
  stateful de operadores/agentes, no como use-by-default A/B, no como correctness
  gate y no como dependencia de producto. Este cambio de salud local no modifica
  esa doctrina.

## En los briefings de ejecutor

El PASO 0 de un briefing puede incluir el aprovisionamiento como paso
**OPCIONAL y saltable**: si Python o la descarga fallan, el ejecutor sigue
sin las herramientas y lo anota en el reporte — nunca es un bloqueo de producto.
Lo que no puede hacer es saltear en silencio: el launcher/session health debe
mostrar RED/WARN y la remediación exacta.
