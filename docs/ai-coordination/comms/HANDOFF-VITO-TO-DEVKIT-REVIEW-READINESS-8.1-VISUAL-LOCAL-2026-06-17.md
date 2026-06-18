---
type: handoff
from: claude (vito-architect / Opus 4.8, sesión ViTo)
to_agent: dev-kit
to: architect (DevKit)
repo: vibethink-dev-kit
status: actioned
resolution: SEALED 2026-06-17 into REVIEW-READINESS-PROTOCOL §8.1.1 (D-014). Placed as §8.1.1 (sharpening of §8.1); drop-in text applied verbatim; ports kept orthogonal (the gate decides the layer, never the port); no explicit see-also (minimal/implicit, per Marcelo).
needs: action — amend REVIEW-READINESS-PROTOCOL §8.1 (decision gate visual→local)
priority: normal
date: 2026-06-17
re: amend MÍNIMO a §8.1 — iteración visual pura corre local; solo decision gate, sin acoplar puertos
authority: Marcelo (Principal Architect) dio GO al contenido; aprobación de canon = Marcelo
---

# HANDOFF — Amend mínimo a `REVIEW-READINESS-PROTOCOL §8.1` (visual puro → local)

**Para:** el arquitecto del DevKit. **De:** vito-architect (Opus), por pedido de Marcelo. **Ejecutás vos** la
redacción/sello en el DevKit; yo solo entrego el handoff listo. **Aprobación de canon: Marcelo** (ya dio GO al
contenido de abajo).

## Contexto (la fricción real)
El **§8.1** que vos sellaste hoy (PR #142, D-011) metió **todo** "UAT/UX-refinement → deployed/cloud". La evidencia
fue Campus (data real + login que solo existe en el deploy → cloud, correcto). Pero **faltó un sub-caso**: la
**iteración visual pura** (mover un color, ajustar un layout, props, copy) **no necesita data real** — y hacerla en
cloud **quema CI/CD en cada tweak**. Marcelo lo levantó hoy como afinado.

## La decisión de diseño de Marcelo (importante para el alcance)
**MÍNIMO. Solo el decision gate.** NADA de acoplar puertos dentro de este gate. Razón (la comparto como arquitecto):
*cuándo voy local/cloud* (fase) y *en qué puerto corro local* (`PORT_ASSIGNMENT` / `CANON-PORT-ASSIGNMENT-001`) son
**dos ejes ortogonales** que cambian por razones distintas. El gate decide la **capa**; el puerto ya es canónico y se
aplica **solo** cuando es local. Acoplarlos sería over-engineering. → El amend **no menciona puertos** salvo, opcional,
un "ver también" al pie.

## El delta exacto (drop-in para §8.1 — inglés, consistente con el protocolo)

> **Sharpening — pure visual iteration runs local.** §8.1's *"UAT / UX-refinement → deployed/cloud"* holds when the
> review needs **real data** or a **path that only exists in the deployed origin** (e.g. a session that only the
> deployed origin can issue). It does **not** hold for **pure visual iteration** — colors, layout, spacing, props,
> copy: anything that does **not** need real data. There the deployed/CI path adds **no extra signal** and **burns
> CI/CD on every tweak**, so it runs **local**.
>
> **Decision gate — does this review need real data or a deploy-only path?**
> - **No** → **local** (visual / UX iteration; fastest true signal, zero CI/CD spend).
> - **Yes** → **deployed/cloud** (data fidelity, deploy-only auth/session, edge/scheduled/webhook behavior).
>
> *(Orthogonal, not coupled here: when a review runs local, the repo uses its canonical port from the supra port
> assignment — applied independently. This gate decides the **layer**, never the **port**.)*

## Cómo aplicarlo (a tu criterio de arquitecto del DevKit)
- Probable home: como cierre de **§8.1** (un §8.1.1 / "Sharpening") o un **§8.2** corto. Vos decidís la ubicación.
- **No** toca §8 ni el resto del protocolo; **no** debilita los gates del CÓDIGO (siguen como están).
- Si lo subís a `CANON-REVIEW-READINESS-001` algún día, va con el resto (no es promoción aparte).

## Boundary (lo que NO se pide)
No ampliar el alcance: no agregar reglas de puertos al gate, no tocar `PORT_ASSIGNMENT`, no nuevas secciones, no
canon nuevo. Es **un** afinado de **un** sub-caso.

## Open questions para vos
1. ¿Ubicación: §8.1.1 vs §8.2? (cosmético, tu llamada).
2. ¿Querés el "ver también `PORT_ASSIGNMENT`" explícito al pie, o lo dejás implícito? (Marcelo se inclina por implícito/mínimo.)

— claude (vito-architect / Opus 4.8), 2026-06-17. Origen del afinado: Marcelo, sesión ViTo, tras revisar §8.1.
