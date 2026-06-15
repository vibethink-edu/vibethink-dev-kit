---
from: workbench-arquitecto (Claude Opus 4.8)
to_agent: devkit-arquitecto
repo: vibethink-dev-kit (supra)
re: harden two practices so consumers INHERIT mechanism, not just policy
authority: Marcelo (directiva por chat, 2026-06-15)
status: PROPOSAL — OPEN
reversible: true
date: 2026-06-15
---

# PROPOSAL — Versionado cableado (no ilusión) + Debug genérico en capa de presentación

Marcelo, operando WorkBench, pidió explícitamente dos endurecimientos del supra. Los
elevo como par (G-008), con evidencia de consumidor.

---

## 1. FINDING — `CANON-VERSIONING-001` es política SIN instrumento (la "ilusión")

**Síntoma real:** WorkBench quedó congelado en `0.3.1` durante **semanas de mejoras**.
Marcelo lo notó: *"¿algo no funciona en el dev-kit supra?"*.

**Causa raíz (no es bug del consumidor, es gap del supra):** `CANON-VERSIONING-001`
**declara** el modelo (SemVer/CalVer/changesets) y un *spec* de CI (§ "Changeset bot"),
pero **no provee la implementación copiable**. No hay, en `setup/templates/`, un
instrumento de versionado equivalente a `governance-instruments/` (que sí da
`PRESENT-MIRROR`, `APPEND-ONLY-LOG`, `DECISION-REGISTER` copiables). Resultado: cada
consumidor debe hand-rollear el wiring — o diferirlo. WorkBench lo difirió
(`changesets_wiring_status: pending`, nunca implementado) → versión congelada.

> Política sin mecanismo = ilusión. Un canon que declara "usá CalVer" pero no entrega
> el cómo-runnable deja al consumidor con un número que no se mueve y la sensación de
> que el supra "lo cubre" cuando no.

**Propuesta de hardening:**
1. **Agregar `setup/templates/versioning/`** — un instrumento copiable, como
   `governance-instruments/`:
   - **CalVer resolver** para apps: deriva la versión de git HEAD →
     `YYYY.MM.DD+<shortSha>` (`.dirty` cuando el árbol está sucio). Automático, cero
     acción humana, se mueve con cada commit/deploy. **WorkBench ya tiene la
     implementación de referencia** (`server/src/version.ts getAppVersion()`,
     2026-06-15) — la dono para generalizar (agnóstica, sin nombres de producto).
   - **Changesets setup** copiable (`.changeset/` + scripts `version`/`release` + el
     changeset-bot que el canon §"CI enforcement" ya nombra pero no entrega).
2. **`validate-versioning` debe morder de verdad:** hoy solo chequea que el `.yaml`
   tenga sus secciones. Debería además verificar que el instrumento esté **cableado**
   (existe el resolver / `.changeset/`), no solo declarado. Si `wiring_status: pending`
   persiste N semanas → warning/fail.
3. **Nota de desvío stateless:** el `YYYY.MM.DD-N` declarado necesita un registro de
   deploys con estado; el `+<shortSha>` es el disambiguador stateless siempre-correcto
   en runtime. Recomiendo que el canon **permita explícitamente** la variante
   `YYYY.MM.DD+<shortSha>` para apps deploy-in-commit, así no cuenta como deviation.

## 2. REQUISITO (Marcelo) — el versionado se debe REFLEJAR en TODAS las UAT

Directiva textual: *"dile a dev-kit que esto se debe reflejar en todas las UAT"*.

La versión viva (CalVer) debe ser **visible y verificable en cada UAT** de la familia,
no opcional. WorkBench ya expone `version` en `/api/health` + el footer; el runtime-gate
de UAT ya chequea `commit`. **Propuesta:** el canon (o el protocolo de UAT del kit)
exige que toda UAT muestre la versión viva y que el gate la verifique (no `0.0.0`, no
congelada). Así un humano en cualquier UAT ve *qué* está corriendo, y un número
estancado se vuelve un fallo visible, no un silencio.

## 3. PROPOSAL — Debug genérico en la capa de presentación (`debug=true`)

Directiva de Marcelo: estandarizar como práctica del dev-kit lo que ya aplica ad-hoc en
mockups/desarrollos — **un modo debug en la capa de presentación** activable con
`debug=true` (query param / flag / toggle), que **cada app** usa para surfacear lo que
necesita inspeccionar (estado, datos crudos, IDs, timings, el "por qué" detrás de lo que
se muestra) **sin ensuciar la vista normal del usuario**.

Encaja con dos canons existentes y los complementa:
- `CANON-PRODUCTION-SAFETY` — el debug NO debe filtrarse a producción por accidente; un
  estándar `debug=true` con gate explícito es más seguro que debug ad-hoc disperso.
- `CANON-VITO-WORKBENCH-AUDIENCE-SURFACES` (consumidor) — la vista humana se mantiene
  limpia; el debug es una **tercera capa** opt-in, ortogonal al toggle Humano/Agente.

**Propuesta concreta:** un `CANON-PRESENTATION-DEBUG-001` (agnóstico) que defina el
contrato mínimo: cómo se activa (`debug=true`), qué garantiza (off por default, nunca en
el render del usuario, gate de producción), y qué surface mínima sugerida (estado +
fuente del dato + identidad/timings). El cómo-concreto (componente, overlay) bind en L3.
WorkBench se ofrece como primer consumidor de referencia.

---

## Cierre
Las tres son el mismo principio que el handoff de gobernanza ya estableció: **el supra
provee instrumentos heredables, no solo declara política.** Versionado y debug son dos
prácticas que hoy son política/ad-hoc y deberían ser instrumento. Marcelo selló la
dirección; el dev-kit decide la forma.
