# CANON-TENANT-AGNOSTICISM-001 — Cualquier colegio del mundo = un PERFIL, no un fork

**Estado:** propuesto · **Dominio:** arquitectura / multi-tenant SIS · **Vendor/país-neutral.**

## Principio
Un colegio de cualquier país es una **combinación de configuración + catálogos por jurisdicción**, nunca una rama de código. Lo específico de un país/colegio vive como **dato** (catálogo, config, template), jamás como columna/enum/rama en el core.

## Lectura honesta: la brecha es CHICA
La base ya es agnóstica y hace el trabajo pesado:
- **Config paramétrica** por tenant × año × período; `jurisdiction_code`.
- **RBAC por capacidades, no por cargos** (un "Rector"/"Principal" es un set de permisos, no un título hardcodeado).
- **Identidad = UUID interno** (el documento es un atributo, no la PK).
- **i18n gate** (toda label visible pasa por `t()`), soft-delete + auditoría universal, calendario con fechas (sirve hemisferio N/S).

El riesgo real **no es arquitectura, es DISCIPLINA**: evitar que lo local se cuele al core.

## Litmus test (la regla de oro)
> Si un campo/enum solo tiene sentido en un país o colegio, es una **fila de catálogo**, no una columna/enum del core.

Ejemplos de lo que debe ser catálogo/config (no core): tipos de documento, parentesco, entidad de salud, niveles/grados y sus nombres, escala de calificación, tipos de reporte, roles.

## Deltas acotados a parametrizar (pequeños, no re-arquitectura)
1. **Nombre de persona flexible:** partes de nombre + **orden de despliegue** por cultura (nombre único, apellido-primero, patronímicos, uno o dos apellidos). No asumir un esquema fijo.
2. **Identidad opcional y multi-tipo:** hay alumnos sin documento nacional; soportar 0..N identificadores tipados. Nunca **exigir** documento en un flujo.
3. **Modo de asistencia configurable:** por-excepción (solo ausentes) **o** positiva por clase/período con códigos (presente/tarde/excusado). Es un toggle, no dos modelos.
4. **Ciclo académico flexible:** N períodos, o **sin períodos** (evaluación continua). La lógica/UI no debe asumir un número fijo.
5. **Esquema de calificación pluggable:** cualitativo, numérico (0–100, 1–7, 1–10), letras, IB, **narrativa-only**, o **por estándar/competencia**. Configurable por año × jurisdicción; el legacy nunca se reescala.

## Módulos opcionales = toggles por tenant (no siempre-encendidos)
Transporte, comedor, convivencia/disciplina, calificación por competencias, educación especial (planes individualizados). Muchos colegios no los usan; deben poder **apagarse por tenant** sin romper el core.

## Gaps a roadmap (no bloquean; son adiciones limpias)
Convivencia/disciplina · standards-based grading · asistencia por período con códigos · planes individualizados (IEP/PIAR) · cobranza/pensión por familia · horarios rotativos / multi-sede. Ninguno exige re-arquitectura; se añaden como módulos toggle cuando el mercado objetivo los pida.

## Consecuencia operativa
En cualquier ETL/migración: **todo lo específico de un país entra como catálogo/config por jurisdicción**, y cada punto donde la data de un colegio real tienta a asumir (nombres, documento, períodos, escala) se **marca**, no se hornea. "Cualquier colegio del mundo" = seleccionar un **perfil**, no bifurcar el producto.
