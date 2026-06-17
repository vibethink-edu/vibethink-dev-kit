---
type: finding
from: claude
to_agent: dev-kit
to: agent
repo: vibethink-dev-kit
status: open
needs: review
priority: normal
date: 2026-06-17
re: el gate de idioma-de-identificadores debe ser SURFACE-COMPLETE — refina el fold-in pendiente de D-6 (G-066)
---

# FINDING — el gate de idioma-de-identificadores debe ser SURFACE-COMPLETE (no solo schema)

**Origen:** Fable + Marcelo, 2026-06-17, durante la UAT de Campus (Marcelo vio slugs en español). **Refina el
fold-in YA pendiente** del eje idioma-de-schema (D-6 / el gate vocabulary-lockfile, G-066) hacia
`CANON-NAMING-CONVENTIONS-001`. **No es bloqueante** y **no es un finding nuevo independiente** — es una línea
para ese fold-in.

## TL;DR
La disciplina *"identificadores en el idioma declarado (inglés); el idioma local solo para data/UI"* se
implementó como un gate que chequea **UNA superficie**: identificadores de **SCHEMA** (`db/migrations`). Pero
los identificadores viven en **más superficies** — **route/URL slugs**, file/dir names, config/env keys. Un
gate schema-only deja pasar las otras → **confianza falsa**.

## Evidencia (Campus, hoy)
El gate D-6 está **verde** sobre el schema, pero hay **slugs de ruta en español** que nunca miró porque solo
escanea `db/migrations`: `comidas`, `momentos`, `boletines`, `usuarios`, `autorizaciones`, `presencia`,
`comedor` (mezclados con slugs en inglés: `enrollment`, `transport`, `applications`, `attendance`…). Un slug
es un identificador (vive en la URL y en el código), no un valor de UI.

## El principio (agnóstico)
Cuando se suba el gate de idioma a `CANON-NAMING-CONVENTIONS-001`, debe ser **surface-complete**: el binding
**por-repo declara TODAS las superficies de identificador a chequear** (schema · route/URL slugs · file/dir
names · config/env keys · …), no una sola. **Schema-only es un blindspot** que da verde falso.

## El throughline (mismo patrón que mis 2 findings previos)
Es el MISMO modo de falla que `CANON-TESTING-MINIMUM-BAR §6.1` (silent-false-green) y `§6.2` (env-portable):
**un gate vivo para una cosa y muerto para la que importa da verde falso.** Acá: gate verde sobre schema,
slugs en español pasando. Vale la pena nombrarlo como principio transversal ("un gate declara su superficie de
cobertura; lo no-cubierto NO está verde, está sin-mirar").

## Acción sugerida
`AMEND` — agregar al fold-in pendiente de D-6 (G-066 → `CANON-NAMING-CONVENTIONS-001`) la cláusula
**surface-complete**: el gate de idioma se declara por-repo sobre todas las superficies de identificador;
schema-only es insuficiente. **El fix CONCRETO de Campus** (extender su gate a `app/` route slugs + rename
español→inglés) es **L3, no toca el dev-kit** — lo ejecuta el seat de Campus. Aprobación de canon: Marcelo.
