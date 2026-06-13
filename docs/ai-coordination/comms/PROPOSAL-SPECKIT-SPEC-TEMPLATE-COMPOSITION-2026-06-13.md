# PROPOSAL — SpecKit: composición en vez de fork para `spec-template`

- **Fecha:** 2026-06-13
- **Estado:** PROPOSED — para ejecutar en el **PR de sync** SpecKit (v0.8.1 → latest), no antes
- **Autor:** claude (Opus 4.8), sombrero de arquitecto · solicitado y aceptado por Marcelo
- **Autoridad:** deriva de ADR-20260613 (mudanza SpecKit→dev-kit). Aprobación de ejecución: Marcelo, en el PR de sync.
- **Relacionado:** `spec-kit/UPSTREAM.md` (lista "PENDING" los adaptados), PRs #71 / orchestrator #3261.

---

## Problema

`spec-template.md` quedó clasificado como **adaptado/diferido** porque mezcla, en **un solo archivo forkeado**:
- **líneas 1-129** = template upstream **neutro** (idéntico a `github/spec-kit` salvo line-endings),
- **líneas 130-194** = bloque **ViTo** `## Canon Contract Obligations` (Metering, Evidence, AI, Data Scoping — referencia `docs/canon/`).

Mantenerlo como fork cobra un **impuesto de merge** en cada sync upstream: reconciliar a mano la base neutra contra el bloque ViTo, para siempre.

## Observación que lo habilita

El bloque **ya es modular y condicional por diseño**, no por accidente:
- El template mismo dice: *"include only the sections relevant to your feature. /speckit.analyze will flag missing sections."*
- El comando `speckit.specify` (paso 4) **ya detecta el dominio** del feature y **quita** las secciones de Canon Contract que no aplican (paso 4d).

O sea: el bloque está *inlineado por costumbre*, pero lógicamente ya es un addendum separable.

## Propuesta

Convertir el **fork** en una **composición** (base neutra + addendum ViTo):

| Pieza | Hoy (fork) | Propuesto (composición) |
|---|---|---|
| `spec-kit/templates/spec-template.md` (kit) | ausente (diferido) | **template neutro upstream** → copy-parity **GREEN, sin `adapted`** |
| Bloque Canon Contract | inline 130-194 en el archivo ViTo | archivo ViTo aparte: `.specify/templates/_canon-contract-obligations.md` (local, NO parity-tracked) |
| `speckit.specify` | usa el template forkeado | **compone**: carga base neutra + *append* del addendum ViTo según dominio (la detección ya existe, paso 4) |

## Beneficios

- El `spec-template` upstream **fluye solo** → se elimina el impuesto de merge.
- El addendum ViTo **nunca colisiona** (vive en su propio archivo).
- `spec-template` pasa de *adapted/diferido* a **parity limpio** → **una divergencia menos** en la lista do-not-overwrite.
- Sienta el principio general: **fork solo donde cambiaste las tripas** (el routing canon *mid-body* de los 4 comandos); **composición donde solo agregás** (spec-template; y a futuro, lo apendizable de los comandos).

## Límite honesto (no es bala de plata)

Los **4 comandos** NO se resuelven igual de limpio: ahí el routing ViTo está **entretejido en el medio** del cuerpo, no apendido al final. La composición resuelve `spec-template` al 100% ya; para los comandos es un **norte**, no una solución completa — su agnosticismo real sigue pendiendo del fetch upstream + revisión del diff.

## Pasos de ejecución (en el PR de sync)

1. Fetch `github/spec-kit` (versión objetivo) → obtener el `spec-template` upstream neutro real.
2. Colocar el neutro en `spec-kit/templates/spec-template.md` (kit) → declarar copy-parity en el consumidor **sin** `adapted`.
3. Extraer el bloque ViTo a `.specify/templates/_canon-contract-obligations.md` (consumidor).
4. Ajustar `speckit.specify` paso 4 para *componer* (cargar base + append condicional del addendum) en vez de leer el bloque inline.
5. Quitar `spec-template` de la lista PENDING en `spec-kit/UPSTREAM.md` y de la nota `_speckit_note` del copy-parity del orchestrator.
6. Verificar: copy-parity GREEN, `validate-speckit-commands` PASS, un `speckit.specify` de prueba arma el spec con las secciones Canon correctas según dominio.

---

*Persistido a pedido de Marcelo (aceptación explícita 2026-06-13). Ejecución diferida al PR de sync.*
