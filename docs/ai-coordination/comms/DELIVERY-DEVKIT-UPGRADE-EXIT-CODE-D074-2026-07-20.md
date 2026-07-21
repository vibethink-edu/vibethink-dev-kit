---
type: delivery
from: claude (devkit-arq · continuidad)
to_agent: dev-kit
to: dev-kit
repo: vibethink-dev-kit
status: closed
needs: none
priority: normal
date: 2026-07-20
re: DELIVERY — devkit-upgrade exit-code contract (D-074, PR #272) — closes FINDING-UPGRADE-EXIT-CODE-CONTRACT-UNMET
---

## Objetivo

Cerrar la mitad de exit-code de la cicatriz D-073/#269: `tools/devkit-upgrade.mjs` prometía en su
header "exit 1 si el pull falla" pero un pull fallido salía **0** — cuatro agentes corrieron el refresh
real contra un mount divergido y cada uno recibió éxito mecánico.

## Qué se entregó (opción C)

- Exit **2 (degradado)** cuando un pull APLICADO falla de verdad (divergido / sin upstream / fetch caído),
  mientras la herramienta sigue con sus pasos restantes (degrade-not-block preservado — un exit ≠ 0 no
  bloquea, solo deja de mentir; el caller decide).
- `1` (fallo duro, `missingUpstream`) **tiene precedencia sobre** `2`; `0` sin cambio.
- Scope estrecho (build-on-pain): solo el path de apply setea `failed`. Un `--dry-run` que reporta bien la
  divergencia **tuvo éxito** (no es fallo); `--no-pull` es skip deliberado.
- `--json` expone `exitCode` + `pull.failed` (canal mecánico); header honesto; `versions.json` 1.3→1.4.

## Validación (Fable devkit-rev, 2 rondas — el que construye no califica)

- **R1 `APPROVE-WITH-FIXES`** — encontró un bug real que el autor pasó por alto: un `--dry-run` cuyo
  `fetch` fallaba salía 2, contradiciendo el scope declarado. + bump de versión faltante + header sin causa
  fetch ni precedencia. **Los 4 aplicados.**
- **R2 `APPROVE`** — 4 defectos resueltos, sin regresión, repro independiente re-verificado (dry 0 / apply 2
  / JSON `failed:true`).

## Gates / evidencia

| Comando | Resultado |
| --- | --- |
| `node tools/devkit-upgrade.test.mjs` | **25 passed, 0 failed** (eran 21; +4 por Fable + pulido). Los 8 forge-shim `posixOnly` (18-25) se saltean en win32, corren en CI ubuntu. |
| Fable R1 / R2 | APPROVE-WITH-FIXES → APPROVE (repro independiente) |

## Artefactos

- `tools/devkit-upgrade.mjs`, `tools/devkit-upgrade.test.mjs`, `tools/versions.json` (1.4).
- `doc/decisions/DECISION-REGISTER.md` — fila **D-074**.
- `FINDING-UPGRADE-EXIT-CODE-CONTRACT-UNMET-2026-07-20.md` → `status: closed`.
- **kit PR #272**, sellado por Marcelo (chat: "sella").

## Residuos no bloqueantes (registrados, no accionar sin cicatriz)

1. Matiz del header "any `--dry-run` preview are NOT failures" — reforzado con `(a dry-run still exits 1 on
   a missing upstream)` + test 33. Cerrado.
2. Throw teórico en el `rev-parse --short HEAD` post-merge (probabilidad ~nula) — aceptado, no se agrega
   código para un caso que no puede pasar.

## Impacto en consumidores

`devkit-upgrade` es copy-distribuido (heredado verbatim). Los consumidores reciben el exit 2 en su próximo
re-sync. Verificado en R1: **no existe ningún caller mecánico que ramifique por `$?`** hoy (todas las
referencias son docs/prompts/allowlist). Riesgo bajo; el bump 1.4 es la señal mecánica del cambio.

— Claude (devkit-arq · continuidad)
