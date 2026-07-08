# REVIEW (RE-CHECK RONDA 2) — Validación adversarial independiente · dev-kit PR #244 (§5.4 D-062)

- **Rol:** validador independiente (no construyó la amendment; mandato: refutar, no aprobar)
- **Agente:** claude (Claude Code · Fable 5 · devkit-rev)
- **Fecha:** 2026-07-08
- **Objeto:** rama `claude/canon-worktree-remove-lock-junction` @ `c2afe7d` — los 9 fixes de la ronda 1 aplicados por devkit-arq en el mismo PR #244
- **Método:** re-check acotado (no ronda completa) — diff `r1(8612741) → r2(c2afe7d)` de §5.4 y del D-row; verificación de que cada fix matchee el wording propuesto, no reabra hueco, no se contradiga con otro ni con el §5.4 sellado; 4 preguntas de integración del encargo
- **Ronda 1:** REQUEST-CHANGES — 3 MAJOR + 4 MEDIUM + 2 MINOR (record `doc/REVIEW-ADVERSARIAL-WORKTREE-REMOVE-LOCK-JUNCTION-D062-2026-07-08.md`, kit PR #245 MERGED `7976e44`)
- **Autoridad de registro:** `CANON-AUDIT-PROTOCOL §9` (persistido verbatim antes de que la autoridad selle)

---

## VERDICT: **APPROVE**

Los 9 hallazgos de la ronda 1 están aplicados **fielmente al wording propuesto**, sin reabrir huecos ni introducir contradicción con el §5.4 sellado (D-021 / squash / physical-orphan 2026-06-29 / D-059). El caso conjunto lock+junction (V5) queda cerrado **con defensa en profundidad**. La secuencia lock-aware es internamente consistente y termina en un estado terminal seguro sin loop. La corrección F9 de dos-clases es fiel y elimina el overclaim sin overturnear la evidencia sellada 2026-06-29. Fire-test del cuerpo limpio. Un único apunte **MINOR no-bloqueante** (nota de binding L3, abajo) que no impide el seal.

---

## Verificación fix-por-fix (matchea el wording propuesto en ronda 1)

| # | Sev | Estado | Evidencia (canon r2) |
|---|-----|--------|----------------------|
| **F1** | MAJOR | **APLICADO** | Heading junction-safe: `worktree boundary` → **`the object being deleted`**. Regla (3): *"The boundary is the deleted object's own directory, whatever its current path — and it binds **every** recursive delete in the cleanup lifecycle: the remove itself, the L3 `gc`, **and the eventual quarantine purge**… A quarantined tree keeps its absolute junctions **live**…"* + lock-aware: *"**unlink its junctions/reparse-points *before* the move** so it enters quarantine **link-inert**"*. Cierra el hueco del purge que yo señalé. |
| **F4** | MAJOR | **APLICADO** | Lock-aware: *"do not force it — **attribute the lock first:** if the holder is not the worktree's own launch surface… do **NOT** move the tree — a persistent foreign lock is a live session and protects the tree (per the quarantine's failed-move rule)"* + *"the move MUST be an **atomic same-volume rename that fails cleanly** — never a copy-then-delete, which can split a locked tree across two paths."* |
| **F7** | MAJOR | **APLICADO** | *"**Terminal safe state, when the remove and the move both fail or the move is forbidden: registered + flagged** — leave the worktree **registered** (never deregister, `--force`, or prune it away…), mark it (e.g. `git worktree lock` with a dated reason), and the **periodic audit owns its disposition**. *'Never left loose' means never unregistered-and-unflagged — not 'moved at any cost'.*"* |
| **F2** | MED | **APLICADO** | Regla (2): *"**One file system — never delete through a mount.**… a **bind mount / container volume** inside the tree is not a link and cannot be unlinked… **unmounted or excluded, never deleted through** (one-file-system semantics)."* |
| **F3** | MED | **APLICADO** | Regla (1): *"**Default to unlink-first.**… Trusting a tool's link-safety *instead*… **REQUIRES a host-verified fixture per link type present** in the tree, and that trust is a point-in-time claim, re-verified whenever the tool changes."* |
| **F5** | MED | **APLICADO** | *"The detached/background remove (per the timeout rule above) is **supervised**: the session or launcher that dispatched it observes its exit and owns the retry and any deferral — a fire-and-forget remove that can fail unobserved recreates the loose tree this rule forbids."* Reconcilia explícitamente con el background-remove de D-059 (no lo contradice). |
| **F9** | MED | **APLICADO** | Amendment note + D-row reescritos: *"**Two distinct classes, not one:** the 2026-06-29 'to be determined' is now determined **for the orphan class** — a remove that **fails partway on an OS lock**… the 2026-06-29 note's sealed evidence positively **excluded** junction-follow for *that* class, and this does not overturn it; the **junction-follow delete is a second, distinct class**…"* Fiel al bullet sellado línea 118. |
| **F6** | MIN | **APLICADO** | "registered" ahora definido dentro de F7 (*"registration is what keeps it audit-visible"*). |
| **F8** | MIN | **APLICADO** | `.next`-class → **`a framework build-output dir`** en bullet y nota; "Fable" removido del cuerpo del canon (queda solo en el D-row bookkeeping, donde es legítimo). |

---

## Las 4 preguntas de integración del encargo

### (1) ¿F1+F4+F7 cierran el caso conjunto lock+junction (V5) sin hueco? — **SÍ, con defensa en profundidad**

Recorrí las tres ramas del árbol de decisión conjunto (árbol lockeado CON junctions):
- **Own leftover lock + junctions** → unlink junctions primero (el junction rara vez es el open handle → el unlink corre aun lockeado) → **atomic same-volume rename** a cuarentena → árbol **link-inert** → el purge posterior (regla 3) no tiene nada que seguir. ✓
- **Foreign lock + junctions** → **never move** (F4) → cae al **terminal registered+flagged** (F7: "move forbidden") → el árbol no se borra ni se mueve → sin escape; el audit es dueño. ✓
- **Own lock + junctions, rename falla** → terminal registered+flagged. ✓

**Defensa en profundidad (más fuerte que mi fix pedía):** aunque un árbol llegara a cuarentena con junctions vivos (p.ej. vía el ritual batch D-059 que no unlinkea al mover), la regla (1) *unlink-first* + regla (3) *binds el purge* garantizan que **el purge mismo unlinkea antes de borrar**. La clase junction-follow queda cerrada en **DOS** puntos (el move Y el purge), no uno. No hay ruta al purge que siga un junction vivo.

### (2) ¿La secuencia lock-aware es internamente consistente y no crea loop? — **SÍ**

Cadena: release lock-holders → remove (supervised) → retry-backoff en lock transitorio → si persiste: attribute → foreign⇒no-move / own⇒unlink-then-atomic-rename → si remove+move fallan o move prohibido ⇒ **registered+flagged, audit owns disposition**. Cada rama de falla **termina** en un estado terminal owned por el audit periódico — no hay re-entrada tight-loop; el próximo intento es un ciclo de audit fresco, no un bucle. Consistencia con lo sellado verificada: "supervised" no contradice el "detached/background" de D-059 (un proceso background cuyo exit se observa); el "atomic rename que falla limpio" **fortalece** el "a failed move correctly protects a live session" de D-059 (un copy+delete no falla limpio: parte el árbol — justo lo que F4 ahora prohíbe). Además la deferral a cuarentena hereda por referencia ("the quarantine above") el gate merged-per-item de D-059, así que trabajo no-verificable se auto-protege (no se mueve, cae a registered+flagged) — sin hueco de pérdida de datos.

### (3) ¿La corrección F9 de dos-clases es fiel y no reintroduce el overclaim? — **SÍ, fiel**

El overclaim de ronda 1 ("determinado: junction-follow") desapareció. r2 dice explícitamente que la evidencia sellada 2026-06-29 **excluyó** junction-follow para la clase huérfano y *"this does not overturn it"* — exactamente mi fix. La clase huérfano se cierra con el mecanismo lock-fail-partway del propio finding; junction-follow se nombra como **segunda clase distinta** (destruye targets **fuera** del árbol). Cruzado contra el bullet sellado línea 118 (*"direct validation… refuted that — the dirs hold real `node_modules` and lack `.git`"*): sin contradicción. El D-row del register recibió la misma reescritura.

### (4) ¿Fire-test del cuerpo limpio? — **SÍ**

Grep sobre el texto nuevo (bullets + nota): sin `.next`, sin `Fable/Claude/Opus/Sonnet`, sin producto/vendor/framework/methodology. `OS-level file lock` / `a framework build-output dir` son genéricos. `node_modules` y `git worktree` son **grandfathered** (aparecen en los bullets sellados 118/122/124, vocabulario de ecosistema/herramienta ya aceptado en este canon sellado). El `.next`/`Windows`/nombre-de-consumidor que quedan en el **D-row** son bookkeeping legítimo del register (registra la procedencia del finding), no cuerpo L1.

---

## Apunte MINOR no-bloqueante (nota de binding L3 para el seal)

El estado terminal F7 marca el árbol con `git worktree lock` + **dated reason**. El bullet sellado de *interrupted-create heal* (línea 120) trata un worktree *"locked in a create-time state (`initializing`)"* como **heal candidate → unlock → remove → recreate**. Ambos usan `git worktree lock`. La **desambiguación existe en el texto sellado**: el heal está scopeado a la razón auto-set `initializing` (create-time), no a "cualquier lock"; F7 usa una *dated reason* deliberada. Un implementador que siga el canon los distingue por la razón. El riesgo residual es puramente L3 (un audit/launcher que keye en "¿está locked?" a secas podría unlock→remove→recreate un árbol que F7 quería preservar). **No es defecto de canon ni contradicción normativa** — el texto ya los separa — pero conviene que el binding L3 del audit/launcher **matchee la razón create-time específica**, no "locked" a secas. Registrado como nota para el ejecutor L3 (gc/quarantine ruteado a vito-arq); no condiciona el seal.

---

## Cierre

Los 3 MAJOR de la ronda 1 eran cada uno citeable para destruir un árbol compartido (purge-scope, move-de-sesión-viva, "moved at any cost"); los tres están cerrados con el wording exacto propuesto, y el caso conjunto queda con doble barrera. La amendment ahora dice, sin ambigüedad citeable en dirección insegura, lo que un canon de un flujo de borrado debe decir. **APPROVE — listo para el seal de Marcelo con el registro cerrado.**

## Siguiente paso

Marcelo sella D-062 (agrega la SEAL line al placeholder de la amendment note + `SEALED 2026-07-08` al D-row). El ejecutor L3 gc/quarantine (ruteado a vito-arq) hereda F1/F3/F4 como requisitos de implementación **más** la nota MINOR (razón create-time específica en el audit).

---
*Registro creado bajo `CANON-AUDIT-PROTOCOL §9` — persistido verbatim antes del seal. Validación independiente: el autor de este record no escribió ni una línea del amendment auditado. Ronda 2 de 2.*
