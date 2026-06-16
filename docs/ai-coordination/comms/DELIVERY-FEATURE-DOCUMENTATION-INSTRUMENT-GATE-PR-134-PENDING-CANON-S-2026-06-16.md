---
type: delivery
from: claude
to_agent: human
to: human
repo: vibethink-dev-kit
status: open
needs: human
priority: normal
date: 2026-06-16
re: feature-documentation instrument + gate (PR #134) — pending canon seal
---
## Qué entrego

PR **#134** (`claude/feat-feature-docs-instrument` → `master`): el **instrumento heredable de documentación de feature** que cierra el gap §5/§6 de `CANON-DEVELOPMENT-PROCESS` — el canon declaraba el set de artefactos por unidad y qué es un finding, pero no shippeaba ni templates ni gate. Mismo patrón de cierre que el instrumento de versioning (D-005).

## Contenido

- `setup/templates/feature-docs/`: un template por rol §5 (REQUIREMENTS · READINESS-PLAN con la sección de seguridad §5.2 · ROADMAP · LOG append-only · CHANGELOG per-unit) + FINDING §6 + un **README discoverability map** que apunta a qué canon gobierna cada parte, **incluyendo las reglas de versioning**. ADRs se referencian, no se re-templatean.
- `tools/check-feature-docs.mjs` (+ test 10/10 + config de ejemplo): gate config-driven, skip-when-no-config, cableado en `devkit-doctor` y registrado en `versions.json`.
- `setup/ADOPT-DEV-KIT.md` #10a: enmendado para documentar el instrumento (paridad con #16).

## Lo que necesita tu sello

- `CANON-DEVELOPMENT-PROCESS` §5 enmendado (marcado **PROPOSED**). **Tu merge = el sello.**
- `DECISION-REGISTER` **D-008** agregada como **PENDING SEAL**.

## Verificación

- `devkit-doctor` → GREEN 6/6 (el gate nuevo `feature documentation` skippea correctamente en el kit).
- `check-feature-docs.test.mjs` → 10/10 · `check-versioning.test.mjs` → 8/8 (sin regresión).

## Follow-up (carriles ajenos, NO toco desde el dev-kit)

El instrumento es ahora heredable; la adopción es de cada repo:
- **Campus**: versioning #16 PENDING + falta `.versioning.yaml`; y ahora puede adoptar este instrumento.
- **WorkBench**: tiene proceso nativo (#10a), puede adoptar el set de artefactos + gate.
- **ViTo**: ya tiene la instancia L3 (`CANON-FEATURE-LIFECYCLE-TRACKING-001`) — reconocerla como la instancia + sumar `tools/feature-docs.config.json` para que el gate la verifique.
