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
re: TASK Campus L3: aterrizar D-077 (secretos) + D-078 (capabilities binding) — no re-decidir, solo bindear lo sellado
summary: "Campus: regla de secretos en launcher+scripts; binding de capacidades (roles/menores/P4/RLS/cards)"
---
## Origen

L1 sellado hoy (kit): **D-077** (regla universal de secretos) + **D-078** (contrato de gateway de
capacidades). Este TASK es el **aterrizaje L3 de Campus** — no re-decidir nada, solo bindear lo sellado.

## Qué aterrizar (Campus)

**De D-077 (secretos):**
1. Incluir la regla dura en el **prompt de lanzamiento** de coders de Campus: nunca aflorar el VALOR
   de un secreto; al exponerse → parar, escalar rotación (el runbook corre bajo su dueño, **el agente
   no rota**), registrar sin el secreto. (El prompt-base del kit ya la trae — verificar que el launcher
   de Campus la herede.)
2. En scripts de **diagnóstico/deploy**: reportar `present`/`absent`, nunca el valor; redactar en logs.

**De D-078 (capacidades) — el binding concreto que el kit deja explícito a L3:**
- roles escolares · datos de menores/**P4** · **RLS** · tools por módulo · **capability cards READY**
  (una capacidad no-READY no se simula ni se promete) · copy es/en · auditoría · las acciones que
  requieren **GO de Marcelo**.
- El gateway/`AssistantSurface` concreto lo provee ViTo (TASK hermano); Campus declara el adaptador
  del vertical con sus tools + permisos.

## Contrato (no violar)

La UI no otorga permisos. Actor/tenant/scope se resuelven server-side, nunca del prompt. Mismo usuario
= mismo permiso desde panel o chat. `REFERENCE-AGENT-TOOL-CATALOG-CONTRACT` (SEALED) + `AGENT-NATIVE-
SURFACE-CONTRACT-001` §4 + `CANON-DEVELOPMENT-PROCESS §8.1` (propose→apply).

## Siguiente acción del ejecutor

Campus-arq: confirmar que el launcher hereda D-077; declarar el binding de capacidades. NO tocar L1.

— devkit-arq (selló D-077/D-078 hoy)

## Recipient Self-Check

- **Target repo / layer:** Campus (`vibethink-campus`) · **L3** binding · **ref-branch:** `main` (crear la rama de trabajo desde ahí).
- [ ] Soy Campus-arq (o el dueño del launcher/scripts de Campus). Si no, reasignar.
- [ ] Leí D-077 y D-078 en el kit antes de aterrizar (no re-decidir L1).
- [ ] Confirmo: este TASK es binding L3 sobre `main`, no toca canon del kit.
- [ ] Las acciones que requieren GO de Marcelo quedan marcadas, no auto-ejecutadas.
