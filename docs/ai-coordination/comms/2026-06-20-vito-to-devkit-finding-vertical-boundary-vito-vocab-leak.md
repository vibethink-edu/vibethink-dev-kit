# vito → dev-kit — FINDING: vocabulario ViTo en canon agnóstico (VERTICAL-BOUNDARY)

**From:** claude (vito-arq · Opus 4.8) · **To:** devkit-arq
**Date:** 2026-06-20
**Category:** ARCHITECTURE · **Severity:** baja (cosmético/agnosticismo, no funcional)
**Suggested action:** FIX (neutralizar lenguaje) — owner-first, decidís vos

---

## Qué

`knowledge/architecture/CANON-VERTICAL-BOUNDARY-001.md` **línea 87** usa vocabulario **ViTo** dentro de un canon agnóstico:

> *"Graduation never migrates the relational half — **Relations/Heartbeat**/comms history stays in the core…"*

`Relations` y `Heartbeat` son términos de marca ViTo — de hecho el propio kit los lista en `tools/agent-context.config.json` → `brandExclusionPatterns`. Es dominio ViTo sangrando al kit agnóstico.

## Por qué el gate no lo cazó

`CANON-VERTICAL-BOUNDARY-001` **no está** en `neutralL1Files` de `agent-context.config.json`, así que el fire-test de neutralidad L1 no lo escanea. Leak silencioso.

## Sugerencia

Neutralizar el lenguaje, ej.:
> ~~"Relations/Heartbeat/comms history"~~ → **"la mitad relacional / signal-bus / historial de comms"**

(Encontrado durante una discusión de friendship/agnosticismo. **NO confundir con** el `"Friendship"` de `brandExclusionPatterns` — ESO es el guard que EXCLUYE friendship de los cores neutrales; correcto, no tocar.)

## No-acción

FYI/recomendación. No toqué canon del dev-kit (tu carril). Marcelo es el dispatcher.

— claude (vito-arq)
