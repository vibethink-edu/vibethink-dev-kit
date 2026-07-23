---
type: task
from: claude (devkit-arq)
to_agent: codex
to: codex
repo: vibethink-dev-kit
target_layer: product-L3
ref_branch: main
status: open
needs: agent
priority: normal
date: 2026-07-23
re: TASK ViTo L3: construir la AssistantSurface/CapabilityGateway compartida (D-078) — contrato concreto, sin duplicar engine
summary: "ViTo: superficie compartida de agente que recibe adaptador del vertical; misma auth desde cualquier superficie"
---
## Origen

L1 sellado hoy (kit): **D-078** — `REFERENCE-AGENT-TOOL-CATALOG-CONTRACT` SEALED (gateway de
capacidades independiente de la UI) + **D-077** (regla de secretos). Este TASK es el **aterrizaje L3
de ViTo** para D-078.

## Qué construir (ViTo)

La **superficie compartida de agente** — panel / overlay / launcher — que:
- recibe un **adaptador del vertical** (Campus declara sus tools+permisos);
- **no decide permisos ni conoce tablas de Campus**: orquesta tools declaradas en el catálogo y
  presenta estados **disponible / no-habilitado / confirmación**;
- misma autorización desde cualquier superficie (panel lateral **o** chat completo) — la superficie es
  contexto/auditoría, **nunca autoridad**;
- una capacidad no-READY **no se simula ni se promete** (§3 bullet 6 del contrato).

## Contrato (SEALED, no re-derivar)

`REFERENCE-AGENT-TOOL-CATALOG-CONTRACT` §3.2 (un solo broker gobernado que toda superficie llama) +
§3.5 (entitlement deny-by-default) · actor/tenant/scope server-side (`AGENT-NATIVE-SURFACE-CONTRACT-001`
§4) · escritura = propose→preview→confirm→apply (`CANON-DEVELOPMENT-PROCESS §8.1`).

## Siguiente acción del ejecutor

ViTo-arq: definir el contrato concreto `AssistantSurface`/`CapabilityGateway` (types+adapter) como L3,
sin duplicar el engine ni abrir puerta trasera admin. NO tocar L1.

— devkit-arq (selló D-078 hoy)

## Recipient Self-Check

- **Target repo / layer:** ViTo (`vibethink-orchestrator-main`) · **L3** binding · **ref-branch:** `main` (crear la rama de trabajo desde ahí).
- [ ] Soy ViTo-arq (o el dueño de la superficie de agente / AssistantSurface). Si no, reasignar.
- [ ] Leí D-078 (contrato SEALED) antes de construir; no duplico el engine.
- [ ] Confirmo: el contrato concreto es L3; ViTo no decide permisos ni conoce tablas de Campus.
- [ ] Sin puerta trasera admin; escritura = propose→preview→confirm→apply.
