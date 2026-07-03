# REPORT TO RODRIGO — dev-kit: qué cambió en 2 días (2026-07-02/03) y por qué refrescar

- **From:** claude (Claude Code · Fable 5 · devkit-arq)
- **To:** Rodrigo (operator/consumer) · Marcelo (aprueba/sella)
- **Date:** 2026-07-03
- **Kit HEAD:** `master @ 84f8645`
- **Companion:** `2026-07-01-REPORT-TO-RODRIGO-OPERATOR-COMMANDS-UPDATE.md` (comandos de operador)

## TL;DR — corré esto

macOS:
```
node <ruta-al-dev-kit>/tools/devkit-upgrade.mjs --dry-run   # preview: qué cambia + canon-delta
node <ruta-al-dev-kit>/tools/devkit-upgrade.mjs             # aplicar (pull + re-sync copias + provisión tools)
node <ruta-al-dev-kit>/tools/devkit-doctor.mjs --adoption   # ver el estado nuevo
```
El `--dry-run` te imprime el **canon-delta**: la lista exacta de qué re-leer. No adivines — leé esa lista.

## Qué se selló/cambió estos 2 días

**Policy engine (runtime de gobernanza) — COMPLETO.** La ley como código: manifiestos JSON →
veredictos DENY/ASK fail-closed, hook PreToolUse, **telemetría por sesión**, y un lector nuevo:
`policy-engine report` (mix de veredictos, qué regla friccciona, reglas nunca-disparadas). Es
**opt-in** por copy-parity; no te obliga a nada, pero está disponible. (D-055 + item 6.)

**Regla que te toca SI lanzás coders (D-057):** specs **BOUNDARY** (auth, DB, input no confiable)
solo en runtime **Class 1 / Claude** — el deny-guard por sesión NO viaja a otros CLIs (Codex/Class 2
corre sin él). Lo mecánico/docs/lógica-pura sí puede ir a Class 2. Si usás Class 2: pineá el modelo
en el launch (el default del CLI puede exigir CLI más nuevo) y deshabilitá MCPs no usados en headless.

**Amendments de gobernanza (D-054):** `CANON-MULTI-AGENT-ORCHESTRATION §3.3` (economía de tier —
delegá lo mecánico al tier barato) + `CANON-AUDIT-PROTOCOL §9/§10` (persistí el veredicto de auditoría
**verbatim** antes de actuar; regla de completitud). Si tus agentes auditan o revisan, esto cambia el
cómo.

**Persistencia de trabajo costoso (`CANON-MULTI-AGENT-ORCHESTRATION §2.4`):** un artefacto caro de
producir (análisis, plan, review) se persiste, no se tira al cerrar sesión.

**KDD (Knowledge-Driven Design) — clarificación (D-056):** `lapsed` / `stale-by-pivot` son condiciones
**computadas**, no valores de `status:` en los packs. Si mantenés knowledge packs, no los guardes como estado.

**CI-cost (D-058):** el propio CI del kit dejó de correr doble (`agent-context.yml` restringido a master).
No te pide acción — es higiene interna del kit; te llega gratis al refrescar.

## Por qué importa refrescar (no es cosmético)

1. **Heredás el canon POR REFERENCIA — pero solo si hacés pull.** Sin refresh, tus agentes operan con
   reglas viejas (routing de coders, economía de tier, persistencia verbatim) creyendo que están al día.
2. **El refresh ahora distingue 3 frescuras** (herencia / tool instalado / artefacto derivado del tool).
   Te dice separadamente qué está viejo — incluido, p.ej., el grafo de graphify — sin rebuildear nada solo.
   Un "estás al día" falso era la trampa que esto cierra.
3. **El canon-delta te dice QUÉ re-leer**, no solo "te actualicé N commits". Estar mecánicamente al día
   ≠ saber qué cambió.

Impacto para vos: bajo esfuerzo (un comando), pero cierra la brecha entre "me siento actualizado" y
"mis agentes aplican las reglas de hoy".

— devkit-arq (Fable), 2026-07-03. Kit sano y sincronizado (`84f8645`).
