---
type: proposal
from: claude
to_agent: dev-kit
to: agent
repo: vibethink-dev-kit
status: open
needs: review
priority: normal
date: 2026-06-17
re: subir agnóstico "una superficie por clase de consumidor; los verticales se enchufan, nunca forkean"
---

# PROPOSAL — una sola superficie por clase de consumidor (supra agnóstico)

**Origen:** Marcelo + Fable, 2026-06-17, durante la UAT de Campus. Marcelo lo **selló** ya en el lado producto
(`vibethink-campus/docs/canon/CANON-EXTERNAL-CONSUMER-SURFACE-001`); esta propuesta es el **lift agnóstico** al
dev-kit para que **todo repo lo herede** ("donde sea que estemos, lo sabemos").

## Principio (agnóstico)
> **Cada CLASE de consumidor tiene UNA superficie canónica. Un vertical / extensión / módulo expone sus
> capabilities DENTRO de esa superficie (vía el mecanismo de composición del producto — widgets / membrana /
> plugin), NUNCA construye otra superficie paralela para el mismo consumidor.**

El **motor/dato** puede ser propio del vertical (implementación propia); la **superficie del consumidor externo
NO** — esa es compartida y canónica. (Distingue "camino B / own engine" de "own surface": lo primero es válido,
lo segundo es drift.)

## Por qué importa (cross-producto)
- Sin esto, cada vertical re-implementa el front del usuario externo → **N superficies divergentes** para el
  mismo consumidor, mantenimiento duplicado, UX inconsistente, identidad/sesión fragmentada.
- Es el mismo modo de falla de scope que venimos viendo, pero a nivel **superficie**: forkear lo que debía
  componerse.

## Binding L3 (ejemplo — ViTo/Campus)
- usuario externo del tenant (cliente/padre/Amigo) → **el portal** (compartido); el vertical aporta widgets.
- staff/operador del vertical → **plano de operación propio del vertical** (ok, no es consumidor externo).
- Caso real: Campus había construido páginas `(portal)/*` propias para el padre = drift → se planifican como
  widgets del portal de ViTo.

## Acción sugerida
`NEW-CANON` (o fold en surface-authority / Widget-Protocol agnósticos si ya existen en el kit): subir el
principio agnóstico + dejar el binding (qué superficie por clase de consumidor, qué mecanismo de composición)
como declaración **por-repo**. Aprobación de canon: Marcelo. El L3 de Campus ya está sellado.
