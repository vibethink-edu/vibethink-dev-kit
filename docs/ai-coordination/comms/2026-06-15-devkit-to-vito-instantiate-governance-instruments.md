---
from: devkit-arquitecto
to_agent: vito-arquitecto
repo: vibethink-orchestrator-main
target_layer: L3 (consumer instantiation — NOT canon authoring)
ref_branch: main (READ-ONLY — trabajar en rama/worktree)
ref_doc: dev-kit @ master cddbdb7 · ADOPT pieces #34/#35/#36/#37 · setup/templates/governance-instruments/ · setup/RUNBOOK-LAUNCH-CODERS.md
ref_pr: dev-kit #83 (pieces #34/#35/#36) · #84 (#37) · #85 (graphify 0.8.39 + register dogfood) — los tres MERGED
tldr: Instanciar en ViTo (orchestrator) los 4 instrumentos de gobernanza/orquestación que el dev-kit selló family-wide el 2026-06-15. ViTo es el PRIMER consumidor nuevo. Es trabajo L3 (instanciar + bindear + declarar adopción), NO authoring de canon. Auditar primero qué ya existe as-built y reconocerlo como instancia, no duplicar.
action: AUDIT (qué tiene ViTo hoy) → INSTANTIATE (copiar+renombrar el skeleton) → BIND (specifics L3) → DECLARE (filas #34–#37 en la tabla de adopción de AGENTS.md) → VERIFY (checks verdes). NO tocar los canon sellados (cambiarlos = clase-autoridad, vuelve al dev-kit + sello de Marcelo). NO tocar las instancias de Campus.
reversible: true
on_no_reply: ViTo sigue sin instrumentos formales (degrada, no bloquea); el canon ya está sellado y disponible cuando se quiera adoptar.
severity: MEDIA (mejora de gobernanza del consumidor; no bloquea features)
status: OPEN
---

# HANDOFF — Instanciar en ViTo los instrumentos de gobernanza + orquestación (pieces #34–#37)

> **Quién manda esto y por qué.** El arquitecto del dev-kit, tras sellar (con Marcelo,
> 2026-06-15) cuatro canon family-wide nacidos de la práctica de un vertical. ViTo
> (el orchestrator) es el **primer consumidor nuevo** que los instancia. Campus ya los
> tiene as-built; ViTo arranca de fábrica. Esto NO requiere que el dev-kit haga nada
> más — la pelota queda en el repo del orchestrator.

> ## 🔎 Recipient Self-Check — leer ANTES de actuar
> - **target_layer = L3.** El trabajo es **instanciar** en `vibethink-orchestrator-main`,
>   NO autorar canon. Los 4 canon ya están **SEALED** en el dev-kit. Cambiar un canon es
>   **clase-autoridad** (vuelve al dev-kit + sello de Marcelo) — acá solo se instancia y
>   se bindea lo concreto (L3).
> - **`main` es READ-ONLY** (pre-commit hook; AGENTS.md Regla #8) → trabajar en rama/worktree.
>   Higiene de comandos: `git -C "<ruta-literal>"`, nunca `cd <wt> && git`; paths literales.
> - **Reconocer, no duplicar.** ViTo probablemente YA tiene piezas de esto as-built
>   (clases de decisión en su constitución, algún tablero/log). Auditá primero y
>   **reconocé lo existente como la instancia**, alineándolo al canon — no crees archivos
>   paralelos. (Es lo que se hizo con `TABLERO/BITACORA/GO-REGISTER` de Campus.)

---

## 0. Qué se selló (contexto — todo en el dev-kit @ master `cddbdb7`)

| Pieza | Canon (home en el kit) | Qué resuelve |
|---|---|---|
| **#34** | `knowledge/methodology/CANON-STATE-MIRROR-AND-DECISION-REGISTER-001.md` | 3 instrumentos: **present-mirror** (estado en una página, "espejo gana la realidad"), **append-only log** (historia), **decision register** (ledger de aprobaciones de autoridad: quién/cuándo/qué/canal/evidencia — **distinto del ADR**) |
| **#35** | `knowledge/ai-agents/CANON-CODER-SAFE-IDENTITY-001.md` | Identidad bot low-privilege (propose-only), gate de auth, aislamiento por sesión, las 3 identidades (auditar el *push actor*), PREP |
| **#36** | `knowledge/ai-agents/CANON-CODER-ORCHESTRATION-001.md` | Correr coders sin trabarse en prompts (matchability ≠ peligro), tabla disparador→fix, gates nunca-allowlisteados, design-gate, wave shape |
| **#37** | `knowledge/methodology/CANON-CHANGE-PATH-AND-DECISION-CLASSES-001.md` | Qué **path** toma un cambio (directo / spec-first / design-gate) + qué **clase de decisión** (authority-sealed / delegated-with-record / autonomous) |

Apoyos en el kit: **skeleton L3** `setup/templates/governance-instruments/` (README + 3 plantillas copy-and-rename) · **guía operativa** `setup/RUNBOOK-LAUNCH-CODERS.md` · el **índice** `setup/ADOPT-DEV-KIT.md` (pieces #34–#37 con su Qué/Cómo/Verificar) · un **ejemplo vivo del register**: `doc/decisions/DECISION-REGISTER.md` (el kit dogfoodeando #34).

> **Hecho de wiring clave:** los canon se heredan **por referencia**, NO por copy-parity
> (ningún `knowledge/**` está trackeado en el copy-parity de ViTo). Así que **no hay que
> tocar `tools/copy-parity.config.json`** para estos canon. Los instrumentos son
> **instancias L3** (archivos nuevos en ViTo, copy-and-rename del skeleton — no son copias
> drift-guarded). Mantené el mount del kit (`../_vibethink-dev-kit`) ff-synced a master.

---

## 1. La tarea (paso a paso)

### Paso 1 — AUDITAR qué tiene ViTo hoy
Antes de crear nada: barré el repo por instrumentos as-built y por el modelo de clases de
decisión (su constitución / `AGENTS.md` / `docs/`). Lo que exista se **reconoce como la
instancia** y se alinea al canon; no se duplica. Salida del paso: una lista "esto ya existe
→ es la instancia de la pieza X" vs "esto falta → hay que crearlo".

### Paso 2 — #34 Instrumentos de gobernanza (mirror + log + register)
- Si ViTo ya tiene equivalentes → reconocerlos + alinearlos a los 3 roles del canon.
- Si faltan → copiar `setup/templates/governance-instruments/{PRESENT-MIRROR,APPEND-ONLY-LOG,DECISION-REGISTER}.template.md` del kit y **renombrar** con el patrón recomendado del README: `{scope}-{role}`, **scope-led**, living docs **sin fecha**, casing igual al resto de docs de gobernanza del repo (ej.: `ORCHESTRATION-DASHBOARD.md` / `ORCHESTRATION-LOG.md` / `ORCHESTRATION-DECISIONS.md`; angostá a `CODERS-`/`AGENTS-` solo si el tablero trackea SOLO ejecutores).
- **Bindear L3** (los slots `<L3: …>`): clases de autoridad que exigen fila en el register, canales válidos de aprobación, timezone del campo *when*, convenciones de evidencia.
- Ejemplo a copiar de estilo: `doc/decisions/DECISION-REGISTER.md` del kit.

### Paso 3 — #35 Coder safe identity
- Si ViTo lanza coders/ejecutores → bindear: cuenta bot write-no-admin, branch protection del default, el env-var del credential por sesión, el comando de auth-status y el de auditoría del *push actor*.
- Si ViTo NO lanza coders → declarar `N-A(no coders)` (no silencioso).

### Paso 4 — #36 Coder orchestration
- Si aplica: bindear el allowlist concreto (read-only seguro), el prompt de lanzamiento con su sección de higiene, y qué specs son **boundary vs mechanical**. Referencia operativa: `setup/RUNBOOK-LAUNCH-CODERS.md`.
- Si no aplica → `N-A(no coders)`.

### Paso 5 — #37 Change-path & decision classes
- ViTo casi seguro **ya tiene clases de decisión** (en su constitución/AGENTS) → reconocerlas y bindearlas a las 3 formas del canon (authority-sealed / delegated-with-record / autonomous), más los umbrales de corte del path (qué es trivial→directo, qué es contrato→spec-first, qué superficie es boundary→design-gate).
- Recordá: **todo cambio de canon es authority-sealed** (regla del canon).

### Paso 6 — DECLARAR la adopción
En el `AGENTS.md` de ViTo, en la tabla **Per-piece adoption status**, agregar/llenar las filas **#34, #35, #36, #37** con `ADOPTED` / `PENDING` / `N-A` + notas (binding paths). **Silencio no es declaración** (regla del índice ADOPT).

---

## 2. Criterios de aceptación (definition-of-done)

- [ ] Auditoría hecha: qué existía as-built quedó **reconocido como instancia**, no duplicado.
- [ ] Los 3 instrumentos de #34 existen como archivos L3 (o se reconocieron los existentes), nombrados con el patrón recomendado y con los slots L3 bindeados.
- [ ] #35 y #36 bindeados **o** declarados `N-A(no coders)` con razón.
- [ ] #37: clases de decisión + umbrales de path de ViTo bindeados (reconociendo el modelo existente).
- [ ] Tabla de adopción de `AGENTS.md` con filas #34–#37 declaradas (sin skips silenciosos).
- [ ] Checks existentes de ViTo verdes (copy-parity, etc.) — **sin tocar** `copy-parity.config.json` por los canon (heredan por referencia).
- [ ] Mount del kit (`../_vibethink-dev-kit`) ff-synced a master `cddbdb7`+.
- [ ] PR en rama (main es read-only); merge según la clase de decisión de ViTo.

## 3. Fuera de alcance (no hacer)
- ❌ Modificar los canon sellados (#34–#37) — eso es clase-autoridad, vuelve al dev-kit + sello de Marcelo.
- ❌ Tocar las instancias L3 de Campus (`TABLERO`/`BITACORA`/`GO-REGISTER`).
- ❌ Instanciar otros verticales.
- ❌ Agregar `knowledge/**` al copy-parity (los canon heredan por referencia, no por copia).

## 4. Punteros de evidencia (rutas exactas, dev-kit @ master `cddbdb7`)
- Canon: `knowledge/methodology/CANON-STATE-MIRROR-AND-DECISION-REGISTER-001.md` · `knowledge/methodology/CANON-CHANGE-PATH-AND-DECISION-CLASSES-001.md` · `knowledge/ai-agents/CANON-CODER-SAFE-IDENTITY-001.md` · `knowledge/ai-agents/CANON-CODER-ORCHESTRATION-001.md`
- Skeleton L3: `setup/templates/governance-instruments/` (README con el patrón de naming + 3 plantillas)
- Guía operativa: `setup/RUNBOOK-LAUNCH-CODERS.md`
- Índice: `setup/ADOPT-DEV-KIT.md` (pieces #34–#37 — Qué/Cómo/Verificar + la tabla de adopción modelo)
- Ejemplo vivo del register: `doc/decisions/DECISION-REGISTER.md`
- PRs del sello: dev-kit #83 / #84 / #85 (MERGED)
- Mount de copy-parity de ViTo: `../_vibethink-dev-kit` (mantener ff-synced)
