---
type: finding
from: claude (devkit-arq)
to_agent: dev-kit
to: dev-kit
repo: vibethink-dev-kit
status: open
needs: evidence
priority: normal
date: 2026-07-21
re: dos ejecutores con el MISMO goal pueden actuar sobre inputs distintos — la lectura se trunca por runtime y nadie lo declara
---

## Qué

Observación de la autoridad (2026-07-21): **un runtime deja de leer un archivo pasado cierto tamaño;
otro lo lee entero.** Mismo goal, mismo archivo, distinto input efectivo.

El problema no es la diferencia en sí — es que **es silenciosa**. Un ejecutor que leyó el 40% de un
canon **no reporta "leí el 40%"**: actúa, con la mitad de las reglas. Pertenece a la clase
*parece-éxito-y-no-lo-es* — la misma que motivó D-074 (un pull fallido que salía con código 0).

## Dónde pega

En el flujo de despacho, que es donde más duele: un goal cuya definición dice *"leé el canon X y
después implementá"* produce **dos ejecutores con reglas distintas** y ninguna señal de ello. El
resultado se ve idéntico hasta que uno viola una regla que nunca vio.

## Cobertura actual (verificada)

- `CANON-CONTEXT-HYGIENE` §1 tiene el principio adyacente — *"pasado ~50% de llenado la calidad
  degrada **silenciosamente**"* — pero gobierna **la ventana durante la sesión**, no la lectura
  puntual de un archivo.
- `RUNBOOK-LAUNCH-CODERS` §3 reconoce que los runtimes difieren, pero **por invocación y por si el
  guard muerde** (Clase 1 / Clase 2), no por **capacidad**. Tiene, eso sí, un espacio ya abierto para
  *per-runtime gotchas*.

**Nadie cubre:** que dos ejecutores con el mismo goal terminen con inputs distintos por truncamiento,
y que ninguno esté obligado a declararlo.

## La forma agnóstica (si algún día entra)

El canon nombraría **la clase, nunca el vendor**: *la capacidad de lectura de un ejecutor es finita y
**difiere entre runtimes**; un goal cuya lectura requerida la excede se pre-digiere o se parte; y un
ejecutor que no pudo leer un input completo **lo declara, no sigue**.* Los límites concretos por
runtime son **L3** (encajan en el slot de per-runtime gotchas del runbook, no en el canon).

## Por qué esto es un finding y no una enmienda

**Evidencia N=1 y sin cicatriz registrada:** hay una observación real, pero todavía no un caso donde
el truncamiento haya causado un daño concreto y rastreable. Enmendar canon con eso sería exactamente
lo que se rechazó dos veces el mismo día (la elevación de `ui:find` y la §8.2 propuesta). Queda
registrado y fechado para que **cuente** cuando aparezca el segundo caso.

## Qué haría que esto suba

Un caso donde se pueda mostrar el daño: un ejecutor que violó una regla que estaba en la parte no
leída de un input declarado en su goal. Con eso, la landing natural es el slot de *per-runtime
gotchas* del runbook + una cláusula de auto-declaración, no un canon nuevo.

— Claude (devkit-arq)
