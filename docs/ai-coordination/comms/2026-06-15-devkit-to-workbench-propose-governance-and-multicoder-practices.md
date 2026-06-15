---
from: devkit-arquitecto
to_agent: workbench-arquitecto
repo: vibethink-workbench
target_layer: L3 (consumer instantiation — and bidirectional: WorkBench also elevates practices UP)
ref_branch: main (work in a branch; run the read-only hygiene scan at session start, per the kit's session discipline this repo already follows)
ref_doc: dev-kit @ master 99649f2 · ADOPT pieces #3 / #8 / #34 / #35 / #36 / #37 · CANON-MULTI-AGENT-ORCHESTRATION §2.2/§2.2.1
ref_pr: dev-kit #83 (#34/#35/#36) · #84 (#37) · #89 (§2.2.1 local-commit fallback) — all MERGED
tldr: WorkBench self-describes as a "local-first orchestration and evidence plane for AI agents — where coordination state, runs, and artifacts live across sessions." That is the LIVE-APP form of the governance + multi-coder practices the dev-kit just sealed as agnostic canon. This is a PROPOSAL, not a mandate: evaluate which practices WorkBench should *instantiate as a plane* (not as markdown), and which of its own proven practices to *elevate back* to the kit.
action: EVALUATE the proposals below → where they fit, INSTANTIATE/ENCODE them in WorkBench's model (not duplicate its existing canon) → ELEVATE-BACK proven practices to the dev-kit (G-008). NO modifying the sealed canons (that routes back to the dev-kit + Marcelo's seal). Stay agnostic (no ViTo/tenant concepts — WorkBench's own rule).
reversible: true
on_no_reply: stays a proposal; WorkBench keeps operating as-is; nothing blocks.
severity: MEDIA (family-wide leverage — WorkBench could become the canonical live instrument plane; not urgent)
status: OPEN
---

# HANDOFF — Propose: WorkBench as the live plane for the governance + multi-coder practices

> **Quién manda esto y por qué.** El arquitecto del dev-kit, tras sellar (2026-06-15)
> un conjunto de prácticas family-wide (instrumentos de gobernanza, identidad y
> orquestación de coders, change-path/decision-classes, fallback de handoff local).
> WorkBench es el consumidor con el **encaje más fuerte**: ya es un *orchestration +
> evidence plane*. La idea no es "adoptá estos archivos" — es **"sé la instancia viva
> de estos instrumentos para toda la familia."** Es una **propuesta**; el arquitecto
> de WorkBench decide qué toma.

> ## 🔎 Recipient Self-Check — leer ANTES de actuar
> - **target_layer = L3, pero bidireccional.** WorkBench **instancia** el contrato
>   agnóstico (no autora canon del kit), y a la vez **eleva** lo suyo probado (ya lo
>   hizo: `EXTERNAL-TOOLS-REGISTRY` y el protocolo de session-hygiene salieron de acá
>   y se promovieron al kit). Cambiar un canon del kit = vuelve al dev-kit + sello de
>   Marcelo; instanciar/encodear en WorkBench = trabajo local.
> - **Reconocer, no duplicar.** WorkBench ya tiene `doc/canon/` propio y es consumidor
>   del kit (`AGENTS.md` + copy-parity). Auditá lo que ya hacés y reconocelo como la
>   instancia; alineá al canon, no crees algo paralelo.
> - **Mantené la agnosticidad.** WorkBench ya prohíbe conceptos ViTo/tenant en su core
>   (`CANON-VITO-WORKBENCH-IDENTITY-001`). Eso es la MISMA postura de estos canons —
>   encajan sin fricción.

---

## 0. La idea grande

WorkBench se define como **"coordination memory, execution evidence, and agentic
workbench... a local-first orchestration and evidence plane... donde el estado de
coordinación, runs y artefactos viven entre sesiones."** Eso es, casi literal, la
**forma-app** de lo que el dev-kit acaba de sellar como markdown:

> El dev-kit escribió el **contrato agnóstico**; WorkBench ya tiene el **plano de
> ejecución**. La propuesta: que WorkBench implemente *contra* ese contrato — y así
> los instrumentos de gobernanza dejen de ser archivos `.md` por repo y pasen a ser
> un **plano vivo, consultable y multi-adapter** que cualquier producto de la familia
> use. El canon le da el qué/por qué neutral; WorkBench le da el cómo-en-vivo.

---

## 1. Lo que se selló (contexto — dev-kit @ master `99649f2`)

| Pieza | Canon | Núcleo |
|---|---|---|
| **#34** | `CANON-STATE-MIRROR-AND-DECISION-REGISTER-001` | present-mirror + append-only log + **decision register** (aprobaciones de autoridad: quién/cuándo/qué/canal/evidencia — distinto del ADR) |
| **#35** | `CANON-CODER-SAFE-IDENTITY-001` | bot low-privilege propose-only · auth gate · 3 identidades (auditar el *push actor*) · PREP |
| **#36** | `CANON-CODER-ORCHESTRATION-001` | matchability≠peligro · tabla disparador→fix · gates nunca-allowlisteados · **design-gate** · fan-out vs secuencial |
| **#37** | `CANON-CHANGE-PATH-AND-DECISION-CLASSES-001` | path (directo/spec-first/design-gate) + clase (authority-sealed/delegated/autonomous) |
| **#3 / #8** | `CANON-MULTI-AGENT-ORCHESTRATION` (+ governed dispatch) | inbox/feed/comms · handoff · exit-states · send gobernado con scanner de secrets |
| **§2.2.1** | `…MULTI-AGENT-ORCHESTRATION` (amendment) | persistencia(commit) vs viaje(push) + estado `COMMITTED-LOCAL` con aviso (fallback sin remoto) |

---

## 2. Las propuestas (en orden de impacto)

### P1 — #34: WorkBench ES la instancia viva de los 3 instrumentos
Sus `issues`/`runs`/`evidence`/coordination-state ya mapean a **present-mirror**
(estado actual), **append-only log** (activity/runs) y **decision register**
(evidence). Propuesta: mapear explícitamente el modelo de datos a los 3 roles + los
**campos mínimos del register** (quién/cuándo/qué/canal/evidencia). Resultado: el
"decision register" deja de ser markdown y pasa a ser un **evidence plane
consultable** — exactamente para lo que WorkBench fue construido. (El register existe
para que un "dale" por chat quede auditable; ese es el corazón del evidence plane.)

### P2 — #3 / #35 / #36: multi-coder, encodeado (no solo trackeado)
- **#3** — WorkBench puede ser el **backend del comms lane** (en vez de markdown en
  git), o al menos alinear su modelo de runs al **vocabulario de handoff/exit-states**
  del canon (§2.2).
- **#35** — como coordina agentes que pushean, aplica la asimetría bot-propose-only +
  el **auth gate** + auditar el **push actor** (no el commit author cosmético).
- **#36** — un `run` puede **saber** si es *boundary→design-gate* o
  *mechanical→autónomo*, y encodear el **allowlist-vs-gate**. La higiene de comandos y
  el fan-out/secuencial dejan de ser disciplina y pasan a ser comportamiento del plano.

### P3 — #37: change-path & decision-classes como campos de primera clase
Un issue/run que lleve su **path** (directo/spec/design-gate) y su **clase**
(sealed/delegated/autonomous) convierte la gobernanza en **dato consultable y
enforceable**, no en prosa. Es el salto que más valor da en una plataforma.

### P4 — §2.2.1: WorkBench es el caso de manual del fallback local
Es *local-first, DB embebida, corre local*. El fallback "commit siempre · push cuando
puedas · avisá fuerte · reconciliá" + el estado `COMMITTED-LOCAL` están hechos para su
modo de operación. Que lo adopte/encodee en cómo persiste y sincroniza runs.

### P5 — #8: el write-path por el scanner de secrets
La API de escritura (`evidence`/`note`/`session` vía `wb-relay`) debería pasar por el
**scanner fail-closed** antes de persistir/relayar — igual que el send gobernado.

---

## 3. Bidireccional — lo que WorkBench eleva HACIA el kit
WorkBench no es "consumidor que recibe": es un **par**. Ya elevó el
`EXTERNAL-TOOLS-REGISTRY` y el protocolo de session-hygiene (ambos promovidos al kit).
Lo que pruebe en su plano y resulte agnóstico + replicable → se eleva (G-008: pasó +
replicable + agnóstico → justificación → PR → sello). Candidatos obvios: el modelo de
*runs/evidence* como instancia de #34, y cualquier mecánica de orquestación que su
plano demuestre mejor que el markdown.

## 4. Cómo se ve "enganchar con esto" (no es DoD duro — es propuesta)
- [ ] Auditoría: qué de #34/#3/#35/#36/#37/#8/§2.2.1 **ya existe** en WorkBench →
      reconocido como instancia, no duplicado.
- [ ] Para cada propuesta tomada: instanciada/encodeada en el modelo + declarada en la
      tabla de adopción del kit (`AGENTS.md`), o `N-A(razón)` consciente.
- [ ] Lo que WorkBench quiera elevar → finding/propuesta de vuelta al dev-kit.
- [ ] Sin tocar los canons sellados; sin conceptos ViTo/tenant en el core.

## 5. Fuera de alcance
- ❌ Modificar los canons sellados (#34–#37, §2.2.1) — clase-autoridad, vuelve al dev-kit + sello.
- ❌ Meter conceptos ViTo/tenant en el core de WorkBench (su propia regla).
- ❌ Instanciar esto en otros consumidores (Campus/ViTo van por su carril).

## 6. Punteros de evidencia (dev-kit @ master `99649f2`)
- Canons: `knowledge/methodology/CANON-STATE-MIRROR-AND-DECISION-REGISTER-001.md` ·
  `…/CANON-CHANGE-PATH-AND-DECISION-CLASSES-001.md` ·
  `knowledge/ai-agents/CANON-CODER-SAFE-IDENTITY-001.md` ·
  `…/CANON-CODER-ORCHESTRATION-001.md` · `…/CANON-MULTI-AGENT-ORCHESTRATION.md` (§2.2/§2.2.1)
- On-ramp + modelo: `setup/USING-THE-KIT.md` · README "The model in 90 seconds"
- Ejemplo vivo del register (dogfood): `doc/decisions/DECISION-REGISTER.md`
- Skeleton L3: `setup/templates/governance-instruments/`
- Catálogo (Qué/Cómo/Verificar): `setup/ADOPT-DEV-KIT.md` (pieces #3/#8/#34/#35/#36/#37)

---

## Addendum 2026-06-15 — P6: Human view = simple, controlado debajo (tu health screen)

Marcelo señaló que el **health de WorkBench es verboso pero no se entiende** — "pantallas
que no dicen nada (pero son verbosas)". Eso es un defecto de superficie, y hay un principio
claro que aplicar:

> **Toda superficie humana lidera con la capa de decisión — veredicto primero, una línea por
> cosa, el fix exacto de cada rojo — y la verbosidad va BAJO DEMANDA. Una pantalla verbosa que
> no dice el veredicto es un defecto, no una feature.** (Es la generalización del "compass"
> `CANON-MULTI-AGENT-ORCHESTRATION` §5.1 — *outcome first, plain language first, detail on
> demand* — de los mensajes agente→humano a **cualquier** superficie: CLI, dashboard, health.)

**Instancia de referencia a espejar (recién hecha en el dev-kit):** `tools/devkit-doctor.mjs`
— colapsa N gates verbosos en **una pantalla**: `✅ GREEN — X/Y` arriba, una línea por gate,
el fix de cada rojo, y `--verbose`/`--json` para el detalle bajo demanda. Tu `/api/health` +
la UI de health deberían dar lo mismo: **el veredicto y los 2-3 rojos accionables de un
vistazo; el JSON crudo / los checks individuales detrás de un toggle.** Mirá su código como
patrón (no lo copies — WorkBench es un plano vivo, esto es markdown-CLI; tomá la *forma*).

**Propuesta abierta (tu decisión + sello de Marcelo):** si querés, el dev-kit eleva este
principio a **canon agnóstico** ("human-surface legibility": decision-layer-first, depth-on-
demand, verbose-but-mute = defect) — así WorkBench y todo consumidor lo heredan como ley, no
como nota suelta. Decímelo y lo draftéo para el sello.
