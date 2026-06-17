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
re: refinar CANON-TESTING-MINIMUM-BAR §6.1 — integration self-tests env-portables (confianza falsa sobre el entorno desplegado)
---

# FINDING — el minimum-bar atrapa "¿corrió?" pero no "¿corrió contra el entorno que da la señal verdadera?"

**Origen:** Fable (seat Campus/ViTo), durante el **wire-to-cloud de Campus** (2026-06-17). Reparo desde
experiencia real, no abstracto. **No es bloqueante** — es un refinamiento al canon de testing.

## TL;DR
`CANON-TESTING-MINIMUM-BAR-001` §6.1 ("toolchain alive / no silent false green") es de lo mejor del kit —
*"exit 0 no es evidencia; que el runner ejecutó N tests, sí"*. **Pero hay un modo de falla hermano que el
canon no nombra:** un suite de **integración** puede estar **vivo contra el seed de dev y muerto contra el
entorno desplegado**, porque sus fixtures dependen de data de seed que solo existe en local. Resultado:
**confianza falsa sobre el comportamiento en producción.**

## Evidencia concreta (Campus, hoy)
- Los harnesses de RLS de frontera de menores (`db/verify/*_person_and_role_governance.sql`,
  `*_enrollment_composite.sql`) **pasaron el Gate 1 en local** (46 y 39 aserciones, positivo+NEGATIVO+
  cross-tenant+cross-sede). Verde.
- Al aplicar el esquema a la prod compartida y querer **verificar la RLS contra cloud**, los harnesses
  **no pudieron correr**: insertan fixtures que referencian a los actores del seed sintético (`008 §2`),
  que **a propósito NO se cargan a prod** → `FK violation` en `person_auth_link` antes de la primera aserción.
- O sea: verifican la **LÓGICA** de la RLS en un entorno de seed local, **no el COMPORTAMIENTO** en el
  entorno desplegado. Contra cloud solo pude verificar **estructuralmente** (198 policies, 16/16 tablas-
  frontera con RLS ON) — la prueba de comportamiento tuvo que diferirse a la UAT con login real.

## El gap, preciso
§6.1 define "verified alive" = "el runner ejecutó N tests". Correcto, pero **insuficiente para integración**:
un suite puede estar *alive* contra el seed de dev y *dead* contra el entorno que importa. §6 dice que el
self-test corre "contra la config real del entorno que corre" — pero en la práctica el test de integración se
**escribió contra el seed local**, así que no corre contra el desplegado. El canon no distingue las dos cosas.

## Sugerencia (a evaluar por el agente de dev-kit; aprueba Marcelo)
Refinar §6 / §6.1 (o agregar §6.2) con el principio **env-portable integration self-test**:

> Un self-test de integración debe **crear sus propios fixtures** (en transacción, con rollback / efímeros
> con cleanup) en vez de depender de data de seed. Así corre **contra cualquier entorno** — espejo local
> *o* desplegado — y "verified alive" pasa a significar **"vivo contra el entorno que da la señal verdadera
> (el desplegado)"**, no solo "vivo contra el seed de dev".

Es la generalización de `REVIEW-READINESS-PROTOCOL` ("testeá en la capa que da la señal verdadera") metida
dentro del minimum-bar. Atrapa el modo de falla "Gate-1-verde / cloud-sin-probar" en el origen.

## Notas
- El resto de la metodología me parece **fuerte y madura** — el minimum-bar pragmático (1 happy + 1 failure,
  no %-cobertura), la scout rule, y mutation-testing como **lente opt-in por juicio, no gate** (build-on-pain).
  Este finding no toca nada de eso; solo afila §6/§6.1.
- **Side note:** busqué el conflicto histórico `TESTING-PHILOSOPHY vs TESTING-POLICY` — **no existe un doc
  `TESTING-PHILOSOPHY` separado en el kit** hoy; parece reconciliado dentro de `CANON-TESTING-MINIMUM-BAR-001`.
  Vale confirmar que ese finding viejo quedó cerrado.

## Acción sugerida
`CONSULT / AMEND` — el agente de dev-kit evalúa si afila §6.1 o agrega §6.2 (env-portable integration
self-tests). Aprobación de canon: Marcelo.
