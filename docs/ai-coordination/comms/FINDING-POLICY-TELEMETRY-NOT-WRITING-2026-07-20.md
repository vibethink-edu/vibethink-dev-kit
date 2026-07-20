---
type: finding
from: claude
to_agent: dev-kit
to: agent
repo: vibethink-dev-kit
status: open
needs: human
priority: normal
date: 2026-07-20
re: la telemetría del policy engine no está escribiendo — sin ella no hay forma honesta de saber qué gates nunca sirvieron
---

# FINDING — el medidor está instalado y no está midiendo

**Categoría:** ARCHITECTURE · **Acción sugerida:** INVESTIGATE

## Qué

Existe la lente de telemetría del policy engine (`telemetry-lens.mjs` en el kit, con su copia
declarada en el consumidor) — la herramienta que responde *"¿qué reglas dispararon y cuáles nunca?"*.
**No se encontró ningún archivo de datos** en las rutas esperadas del consumidor.

El propio código lo explica: emite en cada llamada de herramienta gobernada, así que *sin datos =
no corrió ninguna sesión gobernada contra esas fuentes, o la telemetría está apagada, o escribe en
otro directorio de sesión*.

**NO VERIFICADO:** cuál de las tres. Solo se comprobó la ausencia de datos en las rutas obvias del
consumidor; no se rastreó la configuración del emisor ni se revisó otro directorio de runtime.

## Por qué importa

La autoridad preguntó, textualmente: *"¿cómo se sabe si estamos sobre-protegiendo en los
desarrollos?"*

De las señales que responden esa pregunta —una regla que nunca disparó · una que la gente esquiva ·
un permiso que siempre se responde que sí · una protección sin cicatriz · el mismo riesgo custodiado
tres veces— **la primera es la única medible mecánicamente**, y este es el instrumento que la mide.

Sin datos, cualquier respuesta a esa pregunta es opinión. Y el riesgo es asimétrico: **un gate que
nunca sirvió no se nota** — no falla, no molesta, solo cuesta. Se acumula en silencio.

Contexto que lo hace urgente y no académico: el 2026-07-19/20 se sellaron **cinco** reglas nuevas en
el kit en una sola jornada (D-069 a D-073). Ninguna tiene aún evidencia de uso. La forma responsable
de evaluarlas —incluidas esas cinco— es con datos, no con más razonamiento.

## Acción sugerida

Averiguar cuál de las tres causas aplica, y si es configuración, prenderla. Después dejar correr
dos o tres semanas antes de mirar: una lectura temprana produciría la misma conclusión que ya
tenemos hoy, que es ninguna.

**No abrir esto como un frente de "quitar gates".** El entregable es el dato; qué hacer con él es
una decisión posterior, de la autoridad.
