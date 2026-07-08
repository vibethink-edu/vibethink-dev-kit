# REVIEW — Validación adversarial independiente · dev-kit PR #244 (CANON-BRANCH-WORKTREE-LIFECYCLE §5.4, D-062)

- **Rol:** validador independiente (no construyó la amendment; mandato: refutar, no aprobar — "el que construye no califica")
- **Agente:** claude (Claude Code · Fable 5 · devkit-rev)
- **Fecha:** 2026-07-08
- **Objeto:** rama `claude/canon-worktree-remove-lock-junction` @ `8612741` — DRAFT `knowledge/methodology/CANON-BRANCH-WORKTREE-LIFECYCLE.md` §5.4 (2 bullets: lock-aware removal, línea 126; junction-safe deletion, línea 127) + amendment note 2026-07-08 (línea 212) + fila D-062 en `doc/decisions/DECISION-REGISTER.md` (línea 85) + corrección D-061 → SEALED (línea 84)
- **Método:** 5 vectores tratados como hipótesis a romper; fuente de primera mano (diff completo del PR contra `origin/master`; §5.4 sellado completo incl. bullets D-021/squash/physical-orphan/D-059; `CANON-AUDIT-PROTOCOL` status line + §8.8 en master; `GLOSSARY.md`; forge: PRs #241/#242/#243 estado+merge-commit; grep de "registered quarantine" sobre el kit entero)
- **Alcance especial:** es un flujo de BORRADO que YA destruyó dos árboles compartidos HOY (el mount del kit + un worktree vivo) — estándar de rigor de canon de seguridad, no de doc
- **Autoridad de registro:** `CANON-AUDIT-PROTOCOL §9` (veredicto persistido verbatim ANTES de que la autoridad actúe)

---

## VERDICT: **REQUEST-CHANGES**

Los dos principios son correctos y necesarios — un remove que falla en lock necesita una salida gobernada, y un recursive delete que sigue un link es exactamente la clase que destruyó dos árboles hoy. La fidelidad de la corrección D-061 → SEALED es exacta (V4). Pero como **regla de seguridad de un flujo destructivo** el texto tiene **3 hallazgos MAJOR** — (F1) el alcance del junction-safe rule deja textualmente afuera el purge de la cuarentena, que es a donde este mismo amendment DIFIERE los árboles con junctions vivos; (F4) "persistent lock → move a cuarentena" ordena mover exactamente el árbol que no se puede mover limpio, y es citeable para relocar el worktree de una sesión VIVA (la clase del segundo incidente de hoy); (F7) no hay estado terminal cuando el move también falla — más **4 MEDIUM** y **2 MINOR**. Todos corregibles con wording en el mismo PR; ninguno invalida el principio. No es BLOCK porque nada exige rechazar la amendment; sí impide el seal tal como está, porque los tres MAJOR son citeables para ejecutar la misma clase de destrucción que motivó el amendment.

---

## V1 — Junction-safe deletion como regla de seguridad: **SE ROMPE — 1 MAJOR + 2 MEDIUM**

### F1 (MAJOR) — El alcance textual excluye el purge de la cuarentena: la destrucción junction-follow no se elimina, se DIFIERE fuera del alcance de la regla

El invariante operativo del bullet (línea 127) está anclado al worktree: *"a recursive delete MUST NOT escape **the worktree boundary**"*, *"the cleanup can only ever delete inside **the worktree's own directory**"*, y el binding final cubre solo al ejecutor: *"The `gc`/harvest executor … its delete step is bound by this rule wherever it runs"*. Pero:

- El bullet lock-aware (línea 126) manda a **cuarentena** precisamente los árboles pesados/hidratados — los que más junctions tienen.
- Un junction de Windows es **absolute-path**: tras el move a `_orphans-quarantine-<date>/`, sigue apuntando **vivo al target compartido original**. El árbol en cuarentena NO es inerte.
- El purge de esa cuarentena, según el bullet sellado D-059 (línea 124), lo hace **un humano días después** (*"then let a human purge the quarantine days later"*) — un recursive delete que (a) no es el "gc/harvest executor" nombrado en el binding, y (b) opera sobre un dir que **ya no es un worktree**, así que "the worktree boundary" / "the worktree's own directory" no aplican literalmente.

Resultado: un purge humano de cuarentena con `rm -rf` / `Remove-Item -Recurse` sobre árboles llenos de junctions absolutos vivos a stores compartidos — **la clase exacta de las dos destrucciones de hoy** — cumple el canon tal como está escrito. La regla difiere el peligro hacia el único delete que dejó fuera de su alcance.

**Fix exacto (2 piezas):**
1. En el bullet junction-safe, reemplazar el binding final por: *"This rule binds **every recursive delete in the cleanup lifecycle** — the remove itself, the L3 `gc`/harvest executor, **and the eventual quarantine purge** (human or automated): a quarantined tree keeps its absolute junctions **live**, so purging it is the same hazard deferred. The boundary is **the deleted object's own directory**, whatever its current path."*
2. En el bullet lock-aware, antes del move: *"**Unlink the tree's junctions/reparse-points before the move** — a tree enters quarantine **link-inert** (the junction itself is rarely the open handle, so unlinking usually succeeds even on a locked tree), so no later sweep can follow anything."*

### F2 (MEDIUM) — El invariante es path-based y no cubre el escape por mount: cumplible mientras destruye storage compartido

Cobertura de vectores del bullet (línea 127): junction ✓, symlink ✓ (enumerado sin calificador — cubre file y dir), reparse-point ✓ (superset Windows: incluye volume mount points). **Hardlinks: analizados y NO son vector de escape** en este modelo de amenaza — borrar un hardlink elimina solo esa entrada de directorio y decrementa el link count; el contenido del otro nombre (p.ej. un store global hardlinkeado) sobrevive. Sin hallazgo ahí.

Pero un **filesystem montado dentro del árbol** (bind mount POSIX, volumen de dev-container montado en el path del store de dependencias — patrón mainstream) **no es un link**: no se puede "unlink", no es reparse-point en POSIX, y un recursive delete lo atraviesa borrando el storage compartido **sin salir jamás del path del worktree**. El invariante *"can only ever delete inside the worktree's own directory"* se satisface mientras se destruye el target compartido. El heading promete "MUST NOT escape the worktree boundary" pero la operacionalización path-based no lo garantiza. El canon se declara *"Portable rule"* — el caso POSIX/container está en su alcance.

**Fix exacto:** agregar al Rule: *"…and MUST NOT cross a **filesystem/mount boundary** (one-file-system semantics): a mounted filesystem inside the tree is unmounted or excluded, never deleted through — a mount is not a link and cannot be 'unlinked'."*

### F3 (MEDIUM) — El orden seguro (unlink-first) es el fallback; el camino primario es confiar en el tool, y la verificación no es MUST-grade ni por tipo de link

El bullet SÍ contiene el deber que el vector pedía — *"Verify the delete tool's link-following behaviour on the host … if it cannot be made link-safe, unlink the junctions first, then delete the now-plain tree"* — pero lo estructura al revés para un flujo destructivo: **trust-the-tool es el camino primario y unlink-first el fallback**. La verificación (a) no es "MUST", (b) no especifica QUÉ verificar (la semántica difiere **por tipo de link**: un tool puede no seguir directory junctions y sí seguir symlinks-to-dir, y cambia entre versiones/flags — `-Force`, providers), y (c) es un claim point-in-time: la clase que destruyó dos árboles hoy es exactamente "un tool que se creía link-safe". Unlink-first es el único orden determinístico.

**Fix exacto:** *"**Default to unlink-first** — unlink junctions/reparse-points, then delete the now-plain tree; it is the only order safe across tool versions and flags. Trusting a delete tool's link-safety instead REQUIRES a host-verified fixture **per link type present** in the tree, and that trust is a point-in-time claim, re-verified when the tool changes."*

---

## V2 — Lock-aware removal vs el resto de §5.4: **SE ROMPE — 1 MAJOR + 1 MEDIUM + 1 MINOR**

**No hay duplicación** con el timeout rule (línea 122): la distinción slow-remove-killed vs fail-outright-on-lock es real y el bullet mismo la traza. Legítimo.

### F4 (MAJOR) — "Persistent lock → move a cuarentena, never left loose" ordena mover el árbol que no se puede mover limpio — y es citeable para relocar una sesión VIVA

El bullet sellado D-059 (línea 124) ya estableció la física: *"a dir that will not move is holding an open handle (**a live session**), and the move-failure **correctly protects it**"* — y su evidencia vivida (fila D-059 del register): 63/64 movidos, **el único move fallido era una sesión viva que el fallo protegió correctamente**. El bullet nuevo (línea 126) pisa esa protección con *"never left loose"* como triunfo: un lock **persistente** (que por definición sobrevivió release+retry) es la firma más probable de (i) una sesión viva ajena — double-dispatch, otro agente con el árbol abierto — o (ii) un handle que también va a bloquear el move. Dos fallas concretas:

1. **Sesión viva:** tal como está escrito, un operador puede citar el bullet para relocar a cuarentena el worktree de una sesión viva "porque el lock persiste" — **la clase exacta del segundo incidente de hoy** (*"a live worktree deleted mid-operation"*, nota línea 212). El bullet no exige atribuir el lock antes de mover.
2. **Move que parte el árbol:** si el move se implementa como **copy-then-delete** (la familia `robocopy /E /MOVE` / Move-Item con fallback cross-volume), sobre un árbol lockeado copia lo que puede y borra lo que puede → **el árbol vivo queda PARTIDO entre dos paths** (evidencia vivida en el ecosistema consumidor: un move de un dir lockeado partió el árbol y hubo que verificar/recomponer post-cuarentena). Solo un **rename atómico same-volume que falla limpio** tiene la semántica que D-059 asume.

**Fix exacto (agregar al bullet lock-aware):** *"Before any quarantine move, **attribute the lock**: if the holder is not the worktree's own launch surface (an unknown or foreign session), do **NOT** move — a persistent foreign lock is a live session and protects the tree (per the quarantine's failed-move rule). The move itself MUST be an **atomic same-volume rename that fails cleanly** — never a copy-then-delete, which can split a locked tree across two paths — and a failed rename is the signal D-059 already names, not an error to force past."*

### F5 (MEDIUM) — Composición con el background-remove de D-059: nadie es dueño del retry/deferral si el remove corre desatendido

D-059 (línea 122) exige el remove **detached/background** (nunca en un step que pueda morir por timeout). El bullet nuevo exige **retry with backoff** y **deferral a cuarentena** en lock persistente — dos conductas que requieren **observar el resultado** del remove. Un remove fire-and-forget que falla en lock deja el árbol loose sin que nadie lo sepa hasta el próximo audit — **violando el propio "never left loose" del bullet**. (La secuencia del release sí compone: "stop the worktree's own dev servers" corre en foreground ANTES de despachar el remove. El hueco es la observación posterior.)

**Fix exacto:** *"The detached/background remove (per the timeout rule above) is **supervised**: the session or launcher that dispatched it observes its exit and owns the retry and the quarantine deferral — a fire-and-forget remove that can fail unobserved recreates the loose tree this rule forbids."*

### F6 (MINOR) — "registered quarantine" es un término nuevo sin definición

Grep sobre el kit entero: el término no existe fuera de este PR; la cuarentena D-059 (línea 124) no registra nada. El paréntesis *"(the quarantine above, marked for a verifiable later sweep)"* no dice **dónde vive la marca**. **Fix:** definir — p.ej. *"registered = the dated quarantine dir itself is the register entry the periodic audit reads (`_orphans-quarantine-<date>/<worktree-name>`)"* — o soltar el adjetivo.

---

## V3 — Fail-safe terminal del borrado: **SE ROMPE — MAJOR**

### F7 (MAJOR) — No hay estado terminal cuando el move a cuarentena TAMBIÉN falla: "never left loose" se vuelve insatisfacible y empuja a forzar

Cadena tal como está escrita: remove falla en lock → release + retry → lock persiste → move a cuarentena. Pero **el mismo handle que bloqueó el remove bloquea el move** (D-059 lo predice y lo llama protección correcta). El texto no dice qué pasa entonces. "Never left loose" queda insatisfacible, y las dos salidas que le quedan a un implementador obediente son exactamente las prohibidas: los **`--force` retries** que el propio bullet veta (riesgo de partial delete), o **deregistrar** (`git worktree remove --force` / prune-after-the-fact) — que produce un árbol loose Y ADEMÁS invisible al registro, peor que el estado inicial. No hay loop infinito escrito, pero tampoco hay piso.

**Fix exacto (cerrar la escalera con el estado terminal seguro):** *"If the quarantine move itself fails or is forbidden (foreign lock, F4), the safe terminal state is **registered + flagged**: leave the worktree **registered** (never deregister, `--force`, or prune it away — registration is what keeps it audit-visible), mark it (e.g., `git worktree lock` with a dated reason), and the periodic audit owns its disposition. **'Never left loose' means never unregistered-and-unflagged — not 'moved at any cost'.**"* — Nota: esto degrada limpiamente a la detección que §5.4 ya tiene (audit periódico + heal de locked-states), así que el fix reutiliza maquinaria sellada, no inventa nueva.

---

## V4 — Fire-test + fidelidad D-061: **fidelidad PASA · 1 MEDIUM + 1 MINOR**

### Fidelidad D-061 → SEALED: **FIEL** (verificado contra canon y forge)

- Canon master `CANON-AUDIT-PROTOCOL.md:5` y `:163`: *"§8.8 … **SEALED 2026-07-06 by the Principal Architect** after one independent adversarial round"* — la fila corregida dice lo mismo.
- Forge: PR #241 **MERGED**, merge commit `bce2ecdb598c66e03e140f6fe8518f44e3d0eafd` = el `bce2ecd` de la fila ✓; records #242 (REQUEST-CHANGES) y #243 (re-check APPROVE) mergeados ✓. La corrección es exacta.

### F9 (MEDIUM) — Overclaim de root-cause closure: la nota atribuye el cierre del "to be determined" de 2026-06-29 al mecanismo que la evidencia sellada de 2026-06-29 excluye

La nota (línea 212) y la fila D-062 (register línea 85) afirman: *"the mechanism the 2026-06-29 note left 'to be determined' is now determined: **a recursive delete following a `node_modules` junction**"*. Pero el bullet sellado (línea 118) registra la validación directa de esa clase: los huérfanos tienen **`node_modules` REAL** (no junction) y les falta `.git` — un junction-follow delete vacía el **target compartido en otro path** y no deja un store real pesado dentro del huérfano. Para ESA clase, junction-follow está **positivamente excluido por la evidencia sellada**. El cierre legítimo del "to be determined" (¿qué produce el partway-failed removal?) es **el mecanismo del propio finding de este PR**: el remove que **falla partway en un OS lock** (36 huérfanos) — remove que ya borró `.git` y muere en el `node_modules` lockeado = exactamente la firma 2026-06-29. Junction-follow explica las **dos destrucciones de hoy** — una clase **distinta** (targets compartidos vaciados, no huérfanos sin `.git`). La nota fusiona las dos clases y sella la historia con la atribución equivocada; el "This finding + D-061 are two halves of one incident" del register hereda la misma fusión.

**Fix exacto (paréntesis de la nota, línea 212):** *"(the 2026-06-29 'to be determined' is now determined **for the orphan class**: a remove that **fails partway on an OS lock** — this PR's own 36-orphan finding; the **junction-follow delete is a second, distinct class** that destroys shared targets *outside* the tree, validated the same day by two real destructions)"* — y la frase espejo de la fila D-062.

### F8 (MINOR) — Fire-test: "`.next`" nombra el artefacto de build de UN framework

`GLOSSARY.md:12`: el fire-test = un L1 *"names no product/vendor/brand/**framework**/methodology"*. El bullet (línea 126, *"a build-output dir (`.next`-class)"*) y la nota (línea 212) nombran el dir de build propietario de un framework concreto. El precedente sellado (`node_modules`, línea 118) es ecosystem-wide, no de un framework — no ampara esto. El "Fire-test clean" del PR body pasa el grep de CI pero no la barra sustantiva. **Fix:** *"a framework build-output dir"* en ambos sitios.

---

## V5 — Completitud normativa (lock + junction juntos): **SE ROMPE — cae en el hueco de F1**

El estado conjunto — árbol **lockeado** CON **junctions** — es precisamente el caso común (el lock típico vive en el store hidratado; el junction típico ES el store) y hoy cae en la peor composición: lock persiste → move a cuarentena (F4: puede partir o robar un árbol vivo) → árbol en cuarentena con junctions absolutos VIVOS → purge posterior fuera del alcance textual del junction-safe rule (F1) → destrucción del target compartido, canon-compliant. Los fixes de F1 (link-inerte antes del move + binding del purge) + F4 (atribución + rename atómico) + F7 (terminal registered+flagged) cierran el caso conjunto completo; ninguno por separado alcanza.

---

## Resumen de hallazgos

| # | Sev | Vector | Hallazgo | Fix |
|---|-----|--------|----------|-----|
| F1 | MAJOR | V1/V5 | Alcance "worktree boundary" deja fuera el purge de cuarentena; árboles en cuarentena conservan junctions absolutos vivos | Binding a todo recursive delete del ciclo (incl. purge humano) + árbol entra a cuarentena link-inerte |
| F4 | MAJOR | V2 | Move-on-persistent-lock: citeable para relocar una sesión viva; copy+delete parte un árbol lockeado | Atribución del lock pre-move (foreign → NO mover) + rename atómico same-volume que falla limpio |
| F7 | MAJOR | V3 | Sin estado terminal cuando el move también falla; "never left loose" insatisfacible → empuja a `--force`/deregistrar | Terminal seguro = REGISTERED + FLAGGED, nunca deregistrar; audit es dueño de la disposición |
| F2 | MEDIUM | V1 | Invariante path-based no cubre mounts (bind mount / container volume): destruible sin "escapar" del path | One-file-system: nunca borrar a través de un mount boundary |
| F3 | MEDIUM | V1 | Unlink-first es fallback; trust-the-tool primario sin MUST ni fixture por tipo de link | Unlink-first default; tool-trust solo con fixture host-verificado por tipo de link |
| F5 | MEDIUM | V2 | Retry/deferral incompatibles con remove background no-observado (D-059) | Remove detached SUPERVISADO: dispatcher observa exit, es dueño de retry+deferral |
| F9 | MEDIUM | V4 | Root-cause closure atribuido a junction-follow, que la evidencia sellada 2026-06-29 excluye para la clase huérfano | Atribuir cierre de la clase huérfano al lock-fail partway; junction-follow = segunda clase distinta |
| F6 | MINOR | V2 | "registered quarantine" sin definición en el kit | Definir el registro (el dir datado) o soltar el adjetivo |
| F8 | MINOR | V4 | "`.next`" nombra el artefacto de un framework (fire-test GLOSSARY.md:12) | "a framework build-output dir" |

**Fidelidad D-061 → SEALED: verificada exacta** (canon `CANON-AUDIT-PROTOCOL.md:5,:163` + PR #241 MERGED `bce2ecd…` + records #242/#243).

## Siguiente paso

El asiento constructor (devkit-arq) aplica los fixes en el mismo PR #244 (todos son wording, ningún cambio estructural); este validador re-chequea la ronda 2 sobre el diff actualizado antes del seal de Marcelo. El L3 gc/quarantine executor ruteado a vito-arq hereda los fixes F1/F3/F4 como requisitos de implementación.

---
*Registro creado bajo `CANON-AUDIT-PROTOCOL §9` — persistido verbatim antes de cualquier acción de la autoridad. Validación independiente: el autor de este record no escribió ni una línea del amendment auditado.*
