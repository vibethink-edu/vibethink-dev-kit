# REQUEST → Principal Architect (dev-kit): sellar canon L1 `CANON-JURISDICTION-RESOLUTION-001`

**From:** Migrator (campus data lane) · **To:** Principal Architect del dev-kit · **Fecha:** 2026-07-21
**Tipo:** propuesta de nuevo canon L1 (agnóstico) · **Acción pedida:** poseer, refinar y **sellar** en su hilo dedicado.
**Origen (L3, evidencia):** trabajo de sede/jurisdicción en un campus consumidor — decisión y esquema concretos quedan en el repo consumidor (`docs/ai-coordination/comms/DECISION-jurisdiccion-multipais-obligaciones-control-2026-07-21.md`). **Nada de eso sube al canon.**

## Por qué L1 (y por qué te lo paso a ti)
El *mecanismo* es universal, vendor/product/tool-neutral: **cualquier plataforma donde una cuenta comercial (tenant) puede abarcar varias jurisdicciones legales y cada ubicación operativa debe cumplir obligaciones locales.** No es de educación ni de un país. Por eso es **spine L1** y debe vivir en el kit, heredado por upstream→fork.

La separación es la clave (y respeta `CANON-FEATURE-MATURITY-GATING-001` §L3 y `CANON-UPSTREAM-PROTOCOL` §7):
- **L1 (este canon):** el principio de resolución + el modelo "jurisdicción = paquete de políticas versionado" + la regla "la app hace lookup, no ramifica por país".
- **L3 (repo consumidor, NO el kit):** el nombre real de la columna, las tablas, las matrices de obligaciones por país (organismos de control concretos), los identificadores fiscales/estatutarios reales, la decisión de un tenant puntual.

Compone con (no re-modela): `CANON-TENANT-AGNOSTICISM-001`, `CANON-VERTICAL-BOUNDARY-001`, `CANON-FEATURE-MATURITY-GATING-001`, `CANON-CONFIGURATION-DISCIPLINE`.

---

## Draft del spine (para que lo tomes como punto de partida — DRAFT, pendiente de tu sello)

# CANON-JURISDICTION-RESOLUTION-001 — La jurisdicción se resuelve por ubicación operativa, no por cuenta (universal · product-agnostic)

> **Scope:** toda plataforma donde una cuenta/tenant puede abarcar varias jurisdicciones legales y cada ubicación operativa (sede/sitio/unidad) debe cumplir obligaciones locales que difieren (reportes a organismos de control, reglas operativas de dominio, calendario, escalas, formatos de identidad legal).
> Vendor-neutral, product-neutral, tool-neutral.
> **Status:** DRAFT (pendiente de sello del Principal Architect).
> **Home:** dev-kit (supra-repo). Heredado por cada repo como upstream → fork.

## §1 — Principio
La ley que aplica a una unidad operativa la define **dónde opera esa unidad**, no dónde está la cuenta matriz. El **tenant** es la frontera de datos y la relación comercial (puede abarcar jurisdicciones); la **ubicación operativa** (o la entidad legal que la agrupa) es la que **fija la jurisdicción**.

## §2 — Regla de resolución (herencia + override)
> `jurisdicción_efectiva(ubicación, fecha) = coalesce(jurisdicción_de_la_ubicación, jurisdicción_del_tenant)`.

Gana el nivel más bajo; hereda hacia arriba. El tenant lleva una jurisdicción **por defecto** (caso mono-jurisdicción, el 99%); la ubicación la **sobreescribe** cuando difiere. Mismo patrón de moneda/locale/huso horario.

## §3 — Jurisdicción = paquete de políticas versionado, NO una etiqueta
Una jurisdicción es un **bundle de reglas como DATOS** (no ramas de código): obligaciones ante organismos de control (qué documento, a quién, con qué cadencia, formato y canal), reglas operativas de dominio (límites/umbrales, requisitos de personal, cadencias), calendario (días no laborables, mínimos, estructura de períodos), escalas/clasificaciones del dominio, formatos de identidad legal y estatutaria. Jerárquica (país → región → autoridad local).

## §4 — La app hace lookup, no ramifica por jurisdicción
Prohibido `if jurisdicción == X then …`. La aplicación pregunta *"para la jurisdicción efectiva de esta ubicación, ¿qué aplica?"* y obtiene la respuesta del paquete. **Motores genéricos; plantillas/parámetros atados a la jurisdicción.** Cambiar la jurisdicción de una ubicación → resuelve otro paquete → otro comportamiento, **sin tocar código**.

## §5 — Versión + vigencia + inmutabilidad
Los paquetes son **versionados con `effective_from/to`**. Un cambio normativo se publica como **nueva versión** con su fecha; el sistema conmuta solo en esa fecha. Lo ya producido queda **fijado (snapshot) a la versión vigente** cuando se generó — nunca se reescribe retroactivamente.

## §6 — Datos-de-referencia ≠ jurisdicción legal
Un catálogo de países/regiones como **valor de dato** (p. ej. nacionalidad de una persona) es distinto de la **jurisdicción legal** que gobierna una ubicación. Se mantienen separados; no se colapsan.

## §7 — Anti-patrones (rechazados)
- Atar la jurisdicción a la cuenta/tenant como único nivel (rompe multi-jurisdicción).
- Ramificar por país en código en vez de resolver contra el paquete.
- Hardcodear obligaciones/reglas por país en vez de declararlas como datos versionados.
- Reescribir salidas históricas al cambiar una norma (viola §5).
- Mezclar catálogo-de-datos con jurisdicción-legal (§6).

### §L3 (binding) — lo llena el repo consumidor, NUNCA este canon
El repo consumidor posee: el **nombre/forma concretos** del nivel de resolución (columna/tabla), el motor de paquetes, y **las matrices de obligaciones por jurisdicción real** (organismos de control concretos, identificadores fiscales/estatutarios, escalas y calendarios de cada país). Artefactos concretos (tablas, contratos, nombres de producto, países) son **L3** — jamás en este canon.

---

## Lo que pido
1. Tomar/adoptar este draft como `CANON-JURISDICTION-RESOLUTION-001` en `knowledge/architecture/`, refinar y **sellar** en su hilo.
2. Confirmar la línea de composición con los canons hermanos (que no re-modela ninguno).
3. Si prefieres otro nombre/ubicación o fusionarlo con un canon existente, indícalo — no lo commiteo yo; espero tu decisión de gobernanza.
