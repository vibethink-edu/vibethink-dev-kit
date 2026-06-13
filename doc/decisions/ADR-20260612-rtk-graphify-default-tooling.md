# ADR — RTK + Graphify pasan de RECOMMENDED a DEFAULT (el kit shippea el ciclo de vida)

- **Fecha:** 2026-06-12
- **Estado:** ACCEPTED — sellado por el Principal Architect el 2026-06-13
  ("dale lo que sea necesario"). Body inmutable desde el seal; solo
  transiciones de estado en el header de aquí en más.
- **Decisor:** Marcelo Escallón ("quisiera promoverlo porque suma… dev-kit lo
  debería tener default") · preparado por Claude/arquitecto (Campus) · sellado
  vía devkit-arquitecto (claude, Opus 4.8)
- **Resuelve:** la pregunta abierta desde 2026-05-23 en la comms lane del
  orchestrator (`TASK-PROMOVER-RTK-GRAPHIFY-AL-DEV-KIT-INSTALL-STATE-VERIFICADO`),
  dirigida a codex y nunca respondida.

## Contexto

`AGENTS_UNIVERSAL.md` declaraba el baseline RTK+Graphify como RECOMMENDED y
delegaba versiones + instalación al per-repo ("e.g. an EXTERNAL-TOOLS
registry") — pero el único registro real vivía en WorkBench. Resultado: el
baseline era letra muerta para cualquier heredero nuevo (Campus lo vivió hoy:
no se pudo poner el aprovisionamiento en el PASO 0 del briefing del coder
porque la receta de instalación no existía en ningún repo que el coder pudiera
leer).

## Decisión

1. El baseline sube a **DEFAULT · non-blocking**: se aprovisiona por defecto
   en todo entorno de desarrollo de la familia.
2. El kit **shippea el ciclo de vida**: `setup/EXTERNAL-TOOLS.md` con pins,
   recetas multi-plataforma, evidencia y política version-forward — tomados
   del registry + lock de WorkBench (verificados vía API el 2026-06-12):
   **graphify 0.7.13** (pip `graphifyy`, MIT, Clase A) y **rtk 0.38.0**
   (release GitHub, Apache-2.0, Clase B).
3. Mecanismo: **pin + receta, jamás vendoring** de terceros (lo que ya
   proponía la task de mayo). Per-repo override sigue permitido y gana.

## Barandas (lo que NO cambia)

- **DEFAULT ≠ gate** — la ausencia degrada, jamás falla nada. La advertencia
  del canon ("do NOT let it harden into a required gate") se preserva textual.
- La postura de privacidad viaja: `graphify-out/` jamás commiteado (entra al
  `gitignore.baseline` del PR onboarding-hardening), telemetría RTK apagada.
- En briefings de ejecutor el aprovisionamiento es paso OPCIONAL y saltable.

## Notas de verificación

- El task de 2026-05-23 citaba RTK `0.39.0`; el registry y el lock de
  WorkBench dicen `0.38.0` con evidencia de máquina — se pinea `0.38.0`
  (el lock manda; avanzar = version-forward por PR).
- `CANON-EXTERNAL-TOOL-LIFECYCLE-001` permanece en WorkBench (su alcance es
  el bundle del operador WorkBench); el kit no lo mueve — shippea su PROPIO
  registro default, que es lo agnóstico. Si el canon resulta agnóstico-ready,
  moverlo es un follow-up separado.
- El status de la task de mayo en el orchestrator queda por cerrar
  (open → answered) — repo clase-Marcelo; viaja con su próximo PR.
