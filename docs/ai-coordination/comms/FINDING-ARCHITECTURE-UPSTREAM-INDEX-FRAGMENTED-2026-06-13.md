# FINDING — ARCHITECTURE — Índice de upstreams §6.2 fragmentado (+ discrepancia de versión RTK)

- **Fecha:** 2026-06-13
- **Categoría:** ARCHITECTURE
- **Autor:** claude (Opus 4.8), sombrero de arquitecto · solicitado por Marcelo
- **Contexto de origen:** sesión de mudanza SpecKit ViTo → dev-kit (ADR-20260613, PRs dev-kit #71 / orchestrator #3261). Al verificar si graphify/RTK figuran en el índice discoverable §6.2.
- **Acción sugerida:** `INVESTIGATE` + `FIX` liviano (sub-finding 2) · decisión de diseño (sub-finding 1)

---

## Sub-finding 1 — No existe UN índice §6.2 único; está fragmentado

**Qué.** `CANON-UPSTREAM-PROTOCOL.md §6.2` prescribe **un solo documento discoverable por repo** — la única puerta de entrada a *"¿qué upstreams tenemos?"* — listando **todo** (forks + pinned deps + runtimes + tools + providers), *"no reconstruido cazando entre docs per-fork dispersos"* (§6.2 textual).

**Dónde.** Hoy en el dev-kit el inventario está repartido:
- `setup/EXTERNAL-TOOLS.md` → cubre solo las herramientas del operador (Graphify, RTK).
- `spec-kit/UPSTREAM.md` → registro per-fork de SpecKit (creado en PR #71), separado.
- No hay archivo que una ambos (ni futuros providers/runtimes) en una sola vista.

**Por qué importa.** Es exactamente el anti-patrón que §6.2 fue sellado para prevenir (FINDING-UPSTREAM-PROCESS-NOT-STANDARD-2026-06-05 acción #2: *"el proceso debe ser estándar y discoverable"*). Con dos mapas parciales, un heredero/agente nuevo no tiene una sola fuente de verdad; tiene que saber de antemano dónde buscar cada tipo.

**Acción sugerida.** Decidir si materializar un índice §6.2 único (p.ej. `setup/UPSTREAM-INDEX.md` con columnas: name · kind(§4) · version/last-sync · source · license · cadence · bounded-adaptation? → puntero al UPSTREAM.md per-fork) que **agregue** EXTERNAL-TOOLS (tools) + spec-kit (fork) + futuros. `EXTERNAL-TOOLS.md` y los `UPSTREAM.md` per-fork siguen siendo el detalle; el índice es el mapa. (Es additivo, no rompe nada.)

---

## Sub-finding 2 — Discrepancia de versión RTK: ADR sellado (0.38.0) vs artefacto shippeado (0.39.0)

**Qué.** `ADR-20260612-rtk-graphify-default-tooling.md` (cuerpo **sellado, inmutable**) pinea **RTK `0.38.0`** y su nota de verificación dice textual: *"El task de 2026-05-23 citaba RTK 0.39.0; el registry y el lock de WorkBench dicen 0.38.0 con evidencia de máquina — se pinea 0.38.0 (el lock manda)."* Pero `setup/EXTERNAL-TOOLS.md` shippea **`0.39.0`** (tabla + recetas `gh release download v0.39.0`).

**Dónde.** `doc/decisions/ADR-20260612-rtk-graphify-default-tooling.md` (líneas 32, 46-48) vs `setup/EXTERNAL-TOOLS.md` (fila RTK + receta de instalación).

**Por qué importa.** O bien (a) hubo un **version-forward legítimo** 0.38.0→0.39.0 (el ADR lo permite: *"avanzar = version-forward por PR"*) y entonces **la nota de verificación del ADR quedó stale** y falta el trail del bump; o (b) es una **contradicción no reconciliada** entre la decisión sellada y el artefacto. En cualquier caso, es el tipo de drift pin↔decisión que el §6.2 existe para no dejar pasar.

**Acción sugerida.** `FIX` de 30s: confirmar cuál es la verdad (probable: 0.39.0 por version-forward — nota que PR #72 acaba de tocar el baseline rtk/graphify). Si es version-forward, dejar una línea de trail (changelog/nota) para que el ADR no parezca contradicho.

---

## No-acciones (alcance)

Esto NO toca graphify/RTK como mecanismo (siguen as-is: pin + receta, jamás vendoring — correcto). Es solo sobre **discoverability del inventario** y **consistencia pin↔decisión**.

*Persistido a pedido de Marcelo. Relacionado: `spec-kit/UPSTREAM.md`, `PROPOSAL-SPECKIT-SPEC-TEMPLATE-COMPOSITION-2026-06-13.md`.*
