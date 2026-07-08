# REVIEW (RE-CHECK) — Validación adversarial independiente · dev-kit PR #241 (CANON-AUDIT-PROTOCOL §8.8, D-061) — APPROVE

- **Rol:** validador independiente (no construyó la amendment; mandato: refutar, no aprobar)
- **Agente:** claude (Claude Code · Fable 5 · devkit-rev)
- **Fecha:** 2026-07-08 (re-check) · objeto fechado 2026-07-06
- **Objeto:** rama `claude/canon-gate-degrade-on-absent-mount` @ `c8b0d9f` — §8.8 tras aplicar los 3 fixes de la ronda 1
- **Ronda anterior:** REQUEST-CHANGES (V1 MAJOR + V2/V3 MEDIUM), record `doc/REVIEW-ADVERSARIAL-AUDIT-88-DEGRADE-ON-ABSENT-MOUNT-2026-07-06.md` (kit PR #242, merged)
- **Alcance de este re-check:** confirmar (1) que el diff matchea la propuesta, (2) que el blockquote calificado por el builder no reabre ambigüedad, (3) que los 3 fixes son coherentes entre sí. NO es otra ronda completa.
- **Autoridad de registro:** `CANON-AUDIT-PROTOCOL §9`

---

## VERDICT: **APPROVE** (con 1 nit opcional no-bloqueante y 1 nota operativa de merge)

Los 3 fixes están aplicados **verbatim** con mi wording. El blockquote que el builder calificó por su cuenta (arm (b)) cierra la absolutez de V1 sin abrir clase huérfana. Los 3 fixes componen. La ambigüedad original de V1 (el "NEVER" categórico) está cerrada con doble cobertura (blockquote calificado + bullet carve-out). Recomiendo sello.

---

## (1) ¿El wording matchea mi propuesta? — **SÍ, verbatim**

Diff verificado de primera mano (`origin/master..c8b0d9f`, solo toca §8.8 + la línea de status; sin cambios no anunciados):

- **V1 carve-out** (`CANON-AUDIT-PROTOCOL.md:172`): idéntico a mi propuesta — *"Fail-closed carve-out — a security guard that cannot look does not wave through... keeps the sealed fail-closed discipline (Glossary fail-closed; `CANON-RUNTIME-POLICY-ENGINE §6`)... deny/block or escalate to a human-approved escape... RED-class provisioning finding that enters disposition (§4)... tier the response (`CANON-DEVELOPMENT-PROCESS §8.1`...)"*. ✅
- **V2 falsifiability** (`:173`): idéntico — *"The absence branch is itself subject to §8.7(a)... known-absent fixture that must WARN (not RED, not block) and a known-present-but-broken fixture that must RED..."*. ✅
- **V3 partial/disposition** (`:174`): idéntico — *"Partial presence is absence-class... judged against the declared content contract... ANY required item missing → not provisioned here (arm (b) → WARN naming the missing items)... A WARN that persists... enters disposition (§4)..."*. ✅
- **Nota V5** (agregada al bullet operational-mirror, `:171`): fiel a mi nota — *"That original rule is safe because its objects are by definition inert... Extending it to a class that can include security-relevant dependencies — the policy engine's own guards live in the kit mount — requires carrying the risk limit with it: the carve-out below."* Buen puente al carve-out. ✅

## (2) El blockquote calificado por el builder (no en mi propuesta literal): **cierra la ambigüedad, no abre una nueva**

Cambio en el arm (b) del blockquote (`:167`): de *"→ WARN/advisory... but NEVER a hard merge/push block."* (ronda 1) a *"→ WARN/advisory... but not a hard merge/push block — for a quality/consistency gate; a security control fails closed instead (carve-out below)."*

Lo ataqué en tres frentes; sobrevive:

- **Elimina la absolutez exacta que rompía en V1.** El "NEVER" desaparece; el arm (b) queda scoped a quality/consistency. El vector V1 ya no tiene superficie: el blockquote leído aislado ya remite al carve-out. ✅
- **¿Deja una clase de gate huérfana (ni quality ni security)?** No. El carve-out (`:172`) define security control como *"any gate whose RED protects against exploitable or destructive outcomes"* — partición exhaustiva: todo gate cuyo RED protege contra outcomes explotables/destructivos = security (fail-closed); todo lo demás = quality/consistency (degrada). Un lint/naming/docs-baseline gate cae inequívocamente en el segundo; un secret/authz/policy scanner en el primero. No hay tercera clase. ✅
- **¿Gate híbrido (valida docs Y escanea secretos)?** El wording *"any gate whose RED protects against..."* lo clasifica como security en cuanto CUALQUIER parte de su RED proteja contra el daño → cae al lado fail-closed. Esa es la disposición **fail-safe** correcta (ante duda, hacia la seguridad), no una ambigüedad dañina. ✅
- **"carve-out below"** resuelve a `:172`, mismo §8.8, sin dangling reference. ✅
- El arm (a) (present-but-broken → RED) queda sin calificar, y es correcto: un defecto de contenido real es RED para toda clase de gate; la bifurcación quality/security solo aplica a la rama de **ausencia** (b), que es donde divergen. Coherente. ✅

## (3) ¿Los 3 fixes son coherentes entre sí? — **SÍ (una tensión APARENTE, resuelta por scope+orden; nit opcional)**

- **V1 (security→fail-closed) vs V3 (partial→absence-class WARN):** componen limpio. V3 clasifica el **estado** (partial = absence-class, no present-but-broken); V1 determina el **verdict** de la rama de ausencia según la clase de gate (quality→WARN, security→block). V3 mapea `partial→(b)`; V1 dice qué hace `(b)` por clase. Sin choque. ✅
- **V1 (security→block-on-absent) vs V2 ("known-absent fixture must WARN"):** aquí hay una **tensión aparente** si se lee V2 aislado — para un security gate, V1 dice absent→block, mientras V2 dice literalmente "known-absent → must WARN". **Se resuelve por scope declarado + orden de bullets:** V1 (`:172`) abre con *"This section governs quality/consistency gates"* y establece security como carve-out, y **precede** a V2 (`:173`). El régimen WARN (V2, V3) es el **default de la sección = quality/consistency**; security es la excepción ya declarada arriba. Un lector secuencial resuelve sin ambigüedad: "para mi security gate, V1 gobierna el verdict (block), y mi known-absent fixture debe block, no WARN". Es contradicción **aparente**, no real — exactamente el criterio que la propia ronda 1 fijó en V2 ("buscá la contradicción real, no la aparente"). ✅

  **NIT OPCIONAL (no bloqueante — mejora de blindaje, no cambia el significado):** V2 se lee unívoco dentro de la sección completa, pero un implementador que copie el bullet V2 aislado para un security gate podría escribir un fixture que exige WARN-on-absent. Para blindar contra lectura-aislada, se podrían agregar ~6 palabras a V2: *"...a known-absent fixture that must WARN — **for the quality/consistency default; a security gate's known-absent fixture must block per the carve-out** — and a known-present-but-broken fixture that must RED."* No es requisito de sello: el significado normativo ya es unívoco por el scope de V1 (`:172`) que precede a V2. Lo dejo a criterio del builder/Marcelo.

## Nota operativa de merge (no afecta el canon — para no perder un artefacto)

El diff `origin/master..c8b0d9f` muestra el record de la ronda 1 (`doc/REVIEW-ADVERSARIAL-AUDIT-88-...-2026-07-06.md`) como **-88 líneas**: la rama `claude/canon-gate-degrade-on-absent-mount` se ramificó de master **antes** del merge de #242, por eso no contiene ese archivo. El three-way merge de #241→master lo **preserva** (base común sin el archivo, master lo agrega, la rama no lo borra explícitamente → se conserva). No es una deletion real ni un riesgo — solo lo anoto para que, si alguien mira el diff de dos puntas, no lea "el PR borra el record". Si se prefiere higiene, un `merge master → rama` antes de mergear #241 lo hace evidente. No bloqueante.

---

## Resumen del re-check

| Chequeo | Resultado |
|---|---|
| (1) Wording matchea la propuesta | **SÍ — verbatim** (V1/V2/V3 bullets + nota V5) |
| (2) Blockquote calificado del builder | **Cierra V1, no abre clase huérfana** (partición quality/security exhaustiva, carve-out below resuelve) |
| (3) Coherencia entre los 3 fixes | **Componen**; tensión V1↔V2 **aparente**, resuelta por scope+orden; nit opcional de +6 palabras |
| V4 fire-test | Sigue PASS (cuerpo limpio; D-061 dentro de convención del registro) |
| Merge hygiene | Nota no-bloqueante (record #242 se preserva por three-way merge) |

**VERDICT: APPROVE.** La clase es correcta, el precedente real, la ambigüedad de V1 cerrada con doble cobertura, y los 3 fixes componen. Listo para sello del Principal Architect con el registro cerrado.

---

*Registro requerido por `CANON-AUDIT-PROTOCOL §9` — persistido verbatim antes de la acción de la autoridad humana. El builder no califica su propio trabajo; esta validación es independiente.*
