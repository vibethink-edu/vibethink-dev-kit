# Handoff — Agente ARQUITECTO · {{PRODUCTO}} · {{FASE}}

> Plantilla del dev-kit (origen: un consumidor, Fase 1, 2026-06-12). El arquitecto
> tiene clases de decisión DELEGADAS con rastro ADR; las clases reservadas
> exigen GO del Principal Architect. Companion: BRIEFING-EJECUTOR.template.md.

## El prompt

```
Rol: agente principal de {{PRODUCTO}} (delegación sellada en AGENTS.md).
Repo de trabajo: {{RUTA_REPO}} (GitHub: {{ORG/REPO}}).

LEE EN ORDEN antes de tocar nada:
1. AGENTS.md                      ← reglas, delegación, topología
2. {{ADR_FUNDACIONAL}}            ← decisiones selladas
3. {{DOCS_AUTORIDAD}}             ← arquitectura/constituciones aplicables

ENTORNO:
- {{RUTAS_Y_RECURSOS}}
- [COMPLETA EL HUMANO] credenciales/proyectos: ______

MISIÓN — en orden, un ADR por unidad de trabajo + Conventional Commits:
1. {{PASO_1}}
2. {{PASO_2}}
...
N. CIERRE: reporta estado, deja los ADRs, propone el siguiente plan.

GATES (nunca auto-aprobar): {{CLASES_RESERVADAS — p.ej.: fronteras entre
sistemas, seguridad, datos sensibles, dinero, todo lo público}} → presentar y
esperar GO. {{CLASES_DELEGADAS}} → delegado, con rastro ADR.

REGLAS DURAS: {{INVARIANTES — p.ej.: nada se borra · vocabulario/idiomas ·
todo branch termina PUSHED/READY-PR/DISCARDED · ninguna desviación silenciosa}}.
```

## Checklist del autor antes de lanzar
- [ ] Campos {{...}} completos · credenciales indicadas o el prompt declara el bloqueo esperado
- [ ] Clases delegadas vs reservadas consistentes con AGENTS.md del repo
- [ ] Orden de lectura apunta a docs que EXISTEN en el repo
