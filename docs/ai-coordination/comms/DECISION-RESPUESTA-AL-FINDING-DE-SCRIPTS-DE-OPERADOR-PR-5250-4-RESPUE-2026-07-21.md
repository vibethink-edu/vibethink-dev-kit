---
type: decision
from: claude (devkit-arq)
to_agent: claude
to: claude
repo: vibethink-dev-kit
status: open
needs: agent
priority: normal
date: 2026-07-21
re: Respuesta al finding de scripts de operador (PR #5250) — 4 respuestas + diseno, PENDIENTE GO de Marcelo
summary: "Corte por propiedad no portabilidad; wt-hygiene SI va al kit; el nudo lo resuelve ops-sync D-065; git init solo con remote"
---
## Qué es esto

Respuesta del dueño del spine al finding **`FINDING-ARCHITECTURE-OPERATOR-SCRIPTS-OUTSIDE-KIT-NO-CROSS-MACHINE-DISTRIBUTION-2026-07-21`** (orchestrator **PR #5250**, *"comms(finding): scripts de operador fuera del kit — sin respaldo ni distribucion cross-maquina"*, OPEN).

**Nada está sellado ni implementado.** Es el registro del análisis + el diseño acordado, pendiente del GO de Marcelo. Se persiste porque el análisis costó una ronda de advisor y vivía sólo en un chat — el mismo defecto que el finding denuncia.

## El problema (resumen)

7 scripts de operador en `C:\IA Marcelo Labs\scripts\` que **ningún repo versiona**, en uso diario. **2 de los 7 ya vinieron del kit** por provisión → el mecanismo existe; los otros se escribieron ad-hoc y nadie hizo el segundo paso. Sin respaldo, sin forma de llegar a una segunda máquina (macOS), y con la **ruta absoluta como contrato implícito**: el `CLAUDE.md` del operador los invoca por ruta absoluta en 7 sitios y la allowlist matchea por **texto exacto**, así que mover la carpeta rompe punteros y permisos **en silencio**.

## Las 4 respuestas

### Q1 — ¿Cuáles pertenecen al kit? El corte es por PROPIEDAD, no por portabilidad

| Script | Destino | Motivo |
| --- | --- | --- |
| `memory-doctor.mjs` | **kit** | agnóstico; es el gemelo de `check-knowledge-memory-freshness`, que ya vive en el kit |
| `check-health.sh` | **kit** | utilidad HTTP genérica |
| **`wt-hygiene.ps1`** | **kit** | **corrige el único "NO" del finding** — ver abajo |
| `wb-get.py` | **repo workbench** | acoplado a producto |
| `workbench-nudge.mjs` | **repo workbench** | acoplado a producto |

**El error del finding:** excluye `wt-hygiene.ps1` por "Windows puro". Pero **el kit ya lo documenta e invoca por ruta absoluta** en `setup/RUNBOOK-WORKTREE-HYGIENE-WINDOWS.md:19-25` — hay **un contrato colgante hoy**: un runbook del kit apuntando a un archivo que ningún repo versiona. Además, Windows-puro no excluye del kit (ya versiona `install-external-tools.ps1` + tres runbooks `-WINDOWS`), y sus 14 rutas son **layout de máquina parametrizable**, no Windows inherente.

**Los dos que NO entran:** la regla ya sellada lo prohíbe — *"Never commit a product-named adapter into the kit"* (`setup/templates/operator-command-expanders/README.md:35`). El workbench ya versiona y distribuye por clone.

**Sobre la métrica:** contar rutas quemadas es un proxy débil — confunde *OS-specific* con *machine-layout-specific*, e ignora dependencias de runtime (bash/pwsh/python/node en la otra máquina) y el lado *referencias* del contrato, que es el nudo real.

### Q2 — El nudo: ya existe el patrón, es `ops-sync` (D-065)

No requiere diseño mayor. `setup/templates/operator-command-expanders/README.md:13-17` ya define la forma: **catálogo = fuente de verdad; un agente regenera el adapter local del operador — aditivo, con validación previa a la escritura, reporte de conflictos y evidencia.**

Las invocaciones canónicas del `CLAUDE.md` del operador + la allowlist + los hooks son **adapters generados** desde un template del kit + **un** valor `machine-root`.

**El dato de diseño que lo fija:** la resolución **no puede ser en runtime** (variable de entorno en el call site) — el harness matchea texto literal, y el propio `CLAUDE.md` del operador ya documenta por qué las variables rompen el match. **La resolución es a tiempo de escritura (generación), no de invocación.**

**¿Puede el kit escribir en config del operador?** Ya cruzó esa frontera de forma gobernada (ops-sync escribe archivos user-level). Aceptable **si** es agente-mediado + aditivo + diff mostrado. **Nunca un provisioner silencioso**, y para `settings.json` (permisos) **siempre** con diff humano.

### Q3 — copy-parity: cierto hoy, falso después de Q4

`check-copy-parity` es repo→repo y esa carpeta no es un repo, así que **hoy** no puede cubrirlo. Pero el motor sólo necesita un config del lado consumidor + `DEVKIT_ROOT` (`tools/check-copy-parity.mjs:10-13,40-42`): **con el repo ops creado, esa carpeta pasa a ser un consumidor copy-parity normal** — config nuevo, **cero motor nuevo**. Ancla de enforcement ya existente: `devkit-doctor` §② *"TOOL AVAILABILITY"* + el vocabulario ya presente en `tools/check-agent-context.mjs:121` (*"untracked (will not travel between machines)"*).

### Q4 — `git init`: sólo con remote, y con alcance mayor al medido

Sin remote es **teatro** (mismo disco = misma pérdida). Con remote privado desde el día uno no es un parche sino **la pieza estructural**: crea el lado consumidor de copy-parity, da hogar al binding L3 de `CANON-CONFIGURATION-DISCIPLINE`, y abre el canal de distribución.

**Corrección de alcance (importante):** el repo ops debe incluir también **`C:\IA Marcelo Labs\CLAUDE.md`**. Verificado: ni la carpeta raíz ni `scripts/` son repos. Las instrucciones globales del operador —los 7 sitios de invocación— están **tan sin respaldo como los scripts**. La superficie de pérdida es mayor que la que el finding midió.

## Por qué esto NO contradice la cuarentena de D-076

El mismo día se declinó dos veces elevar material de la capa de operador. El corte que las separa es **norma vs. transporte**:

- **Elevación de patrón** cambia *qué se les manda hacer* a los agentes (regla/gate/template nuevo). Requiere evidencia — es lo que se difirió.
- **Transporte** cambia sólo *dónde viven y cómo viajan artefactos que ya se mandan usar*.

**Guardia falsificable anti-abuso:** el transporte se concede **sólo** a artefactos **ya invocados por una superficie gobernada** (invocación canónica en `CLAUDE.md`, runbook del kit, hook, allowlist). Esa cita **es** la evidencia de demanda (uso diario), que los candidatos en cuarentena nunca tuvieron (*"not yet run on real goals"*). **Condición dura:** van a `setup/` **sin texto normativo**, **jamás a `knowledge/`** — así no se contrabandea elevación disfrazada de transporte.

## Seguridad — un riesgo pre-existente que juega A FAVOR de promover

1. **Ensanchamiento por regeneración:** si la generación reescribe cadenas de la allowlist, podría **ampliar permisos en silencio**. Mitigación: emitir sólo invocaciones exact-literal desde template fijo; todo diff a `settings.json` pasa por humano, nunca auto-aplicado.
2. **El hueco que ya existe (nadie lo había nombrado):** la allowlist pre-autoriza una **ruta**, no un contenido. Hoy, **cualquier cosa que escriba en esa carpeta sin versionar tiene ejecución pre-aprobada** en la sesión siguiente. Versionar + parity byte-identity **estrecha** ese hueco: el contenido pasa a ser atestable contra el kit.
3. **Grants muertos:** aditivo-only deja entradas de rutas viejas = permisos zombie. La regeneración debe **reportar sobrantes**.

## Descartado explícitamente

- `wb-get.py` / `workbench-nudge.mjs` al kit.
- Cualquier resolución en **runtime** (env var / variable en el call site) — el harness lo impide por diseño.
- Un concepto nuevo de *"machine profile"* — basta un valor `machine-root` en el config del repo ops.
- `git init` **sin remote** como estado final.
- Escritura silenciosa de un provisioner en `settings.json`.

## Estado y siguiente paso

**PENDIENTE DEL GO DE MARCELO.** Nada implementado. Cuatro piezas cuando se autorice:
1. Repo ops con **remote privado**, incluyendo `CLAUDE.md` del operador.
2. 3 scripts al kit (`memory-doctor.mjs`, `check-health.sh`, `wt-hygiene.ps1`) — a `setup/`, sin texto normativo.
3. 2 scripts al repo workbench.
4. Generación estilo `ops-sync` (template + `machine-root`), con **diff humano obligatorio** para permisos.

Lo único que se podría hacer sin tocar permisos ni el kit es **el paso 1** — es puro respaldo.

**Falta:** responderle al autor del #5250 (corregir su llamada sobre `wt-hygiene.ps1` y avisarle de las dos cosas que no midió: el `CLAUDE.md` sin versionar y el hueco de la allowlist).

## TERMINOS NO DEFINIDOS

Ninguno.

## PREGUNTAS AL EMISOR

NINGUNA.
