# Briefing — Agente EJECUTOR · {{PRODUCTO}} · {{FASE}}

> Plantilla del dev-kit (origen: un consumidor, Fase 1, 2026-06-12). Patrón VT-Method
> Direct Execution: el autor da órdenes exactas + matriz V-xx; el ejecutor
> implementa y reporta; el autor verifica. **El ejecutor NO decide diseño.**

## Ficha de lanzamiento (completar — el lanzador NO debería tener que preguntar NADA)

> Regla: si el humano lanzador tuvo que hacer una pregunta antes de lanzar
> (¿qué modelo? ¿qué valido antes? ¿qué sabe el agente?), la respuesta se
> agrega AQUÍ — a la ficha del briefing, no al chat. Si la pregunta es
> agnóstica al producto, se eleva como finding a esta plantilla.

| Campo | Valor |
|---|---|
| Runtime | {{p.ej. Claude Code CLI/desktop — necesita terminal real (gh, git, build)}} |
| Modelo recomendado | {{p.ej. el tier alto para ejecución larga autónoma; alternativa económica + su riesgo}} |
| Sesión | Nueva y limpia, SIN contexto previo — el prompt es autocontenido |
| Qué sabe el agente al arrancar | NADA — ni que el repo existe (por eso el PASO 0 va inline) |
| Pre-vuelo del lanzador (checklist) | {{2-4 ítems máx: p.ej. navegador con la cuenta de la org listo para el device-flow · pegar el bloque del prompt COMPLETO · confirmar que NO lleva secrets}} |
| Qué vuelve al final | {{p.ej. PR abierto + reporte en la lane}} — el lanzador no supervisa el medio |
| Duración estimada | {{rango honesto}} |

## Quién corre qué (la cadena de un lanzamiento — completar y dejar en el briefing)

| Acción | Quién | Nota |
|---|---|---|
| Lanzar la sesión (pegar este prompt) | Humano lanzador: {{NOMBRE}} | Desde cualquier máquina |
| Aprobar el código device-flow + **autorizar la org** en el navegador | Humano CON acceso a la org GitHub | Sin la org autorizada, los repos privados dan 404 |
| Ejecutar las tareas T-xx | El agente EJECUTOR (este prompt) | Autónomo; bloqueo = reporta y sigue |
| Verificar el PR contra la matriz/AC | El agente ARQUITECTO | Sesión corta, rol "author verifies" |
| Merge del PR | Según la clase del repo: {{CLASE — p.ej.: repo del producto = arquitecto delegado con rastro; repos de plataforma/kit = solo el Principal Architect}} | |
| Credenciales/secrets | SOLO el humano — **jamás se pegan en el prompt del ejecutor** | El ejecutor declara BLOCKED en lo que las necesite |

## El prompt

```
CONTEXTO (asume que el ejecutor NO SABE NADA — ni que el repo existe):
{{1 párrafo: qué es el producto, qué org, qué repo privado, cuál es SU misión
concreta, y qué NO necesita ni tiene acceso (datos reales, credenciales)}}

PASO 0 — ACCESO Y MÁQUINA (regla de oro del arranque en frío: este paso va
INLINE aquí — el ejecutor NO puede leer runbooks de repos que aún no puede
clonar):
1. Instala GitHub CLI: winget install GitHub.cli · brew install gh · apt/dnf
2. gh auth login --hostname github.com --git-protocol https --web → muestra el
   CÓDIGO al humano lanzador; él aprueba en github.com/login/device y AUTORIZA
   la org {{ORG}} (botón Authorize/Grant). Verifica: gh auth status
3. Clona como HERMANOS: gh repo clone {{ORG}}/{{REPO}} y
   gh repo clone {{ORG}}/vibethink-dev-kit (los validadores lo buscan en ../)
4. Toolchain: {{p.ej. Node 24 LTS → corepack enable → pnpm 10.x}}
5. Identidad de AGENTE en git (auditoría — nunca identidad humana):
   git config user.name "{{Coder}} Agent ({{PRODUCTO}})" ·
   user.email "{{coder}}-agent@{{org}}.local"
6. Smoke de llegada: {{p.ej. pnpm install + build}} debe quedar VERDE.
   Si algo del PASO 0 falla: detente y repórtalo — no improvises el entorno.
7. OPCIONAL Y SALTABLE (dev tooling baseline; receta completa en
   ../vibethink-dev-kit/setup/EXTERNAL-TOOLS.md, ya clonado en el paso 3):
   graphify por pip + rtk por gh release. Si Python o la descarga fallan,
   SIGUE SIN ELLOS y anótalo en el reporte — esto jamás es un bloqueo.

Rol: EJECUTOR de {{PRODUCTO}}. NO eres el arquitecto: no tomas decisiones de
diseño, no renombras nada, no reinterpretas el plan, no escribes ADRs. Ejecutas
órdenes exactas, validas contra la matriz V-xx y REPORTAS. Si algo no cuadra o
es ambiguo: DETENTE en ese paso, anota el bloqueo y sigue con el siguiente paso
independiente. Jamás improvises una solución de diseño.

Lee SOLO: {{LECTURA_MINIMA — 2-4 docs máx, rutas DENTRO del repo recién clonado}}.
Credenciales (si faltan, ejecuta solo las tareas que no las necesitan y reporta):
{{CREDENCIALES}}: ______

PROHIBIDO (lista cerrada):
✗ {{PROHIBICION_1}}   ✗ {{PROHIBICION_2}}   ✗ Borrar cualquier cosa
✗ Renombrar           ✗ Mergear PRs          ✗ Proponer diseño

TAREAS (orden estricto, commit convencional por tarea):
T1 — {{TAREA}}: pasos exactos a/b/c... Commit: {{tipo(scope): mensaje}}
T2 — ...
TN — REPORTE FINAL en {{LANE}}: estado por tarea (DONE/BLOCKED+motivo),
     matriz V-xx con EVIDENCIA, bloqueos. Toda rama termina PUSHED o READY-PR.

MATRIZ DE VERIFICACIÓN (el autor valida contra esto):
V-01 {{verificable con evidencia pegada}}
V-02 ...
V-0N cero cambios fuera de los archivos listados (git status limpio al cerrar)
```

## Reglas de redacción para el autor
1. Cada tarea = pasos MECÁNICOS (si exige juicio, no va aquí: va al arquitecto).
2. Prohibiciones en lista CERRADA (el ejecutor no infiere).
3. Cada V-xx exige EVIDENCIA pegable (salida de comando, conteo, diff).
4. "Bloqueado ≠ resuelto a su manera: bloqueado = reportado."
