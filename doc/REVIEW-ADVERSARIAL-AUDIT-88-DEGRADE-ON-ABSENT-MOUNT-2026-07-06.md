# REVIEW — Validación adversarial independiente · dev-kit PR #241 (CANON-AUDIT-PROTOCOL §8.8, D-061)

- **Rol:** validador independiente (no construyó la amendment; mandato: refutar, no aprobar)
- **Agente:** claude (Claude Code · Fable 5 · devkit-rev)
- **Fecha:** 2026-07-08 (review) · objeto fechado 2026-07-06
- **Objeto:** rama `claude/canon-gate-degrade-on-absent-mount` @ `92f6fed` — DRAFT `knowledge/methodology/CANON-AUDIT-PROTOCOL.md` §8.8 ("the mirror false-RED") + fila D-061 en `doc/decisions/DECISION-REGISTER.md`
- **Método:** 5 vectores de ataque tratados como hipótesis a romper; fuente leída de primera mano (diff completo del PR contra `origin/master`; §8 completo sellado; `AGENTS_UNIVERSAL` 146-180; grep de fail-closed sobre `knowledge/` entero; instrumento `tools/check-gate-integrity.mjs`; gate consumer real `scripts/knowledge-pack-health.mjs`)
- **Autoridad de registro:** `CANON-AUDIT-PROTOCOL §9` (veredicto persistido verbatim ANTES de que la autoridad actúe)

---

## VERDICT: **REQUEST-CHANGES**

La clase es real y la regla es necesaria: el mecanismo "false-RED entrena al operador a `--no-verify`, que después bypasea el gate cuando el contenido SÍ está roto" es correcto, el precedente es genuino, y el fire-test pasa (V4). Pero el blockquote normativo tiene **1 hallazgo MAJOR (V1)** — el "NEVER a hard merge/push block" categórico colisiona con la disciplina fail-closed SELLADA del propio kit para guards de seguridad — y **2 hallazgos MEDIUM (V2, V3)** de completitud normativa. Los tres son corregibles con párrafos cortos en el mismo PR. Ninguno invalida el principio.

---

## V1 — "Genuinely-absent → WARN, NEVER a hard block" ¿demasiado absoluto para gates de seguridad?: **SE ROMPE — MAJOR, AMEND pre-seal**

El blockquote (`CANON-AUDIT-PROTOCOL.md` rama PR, línea 167) es categórico: *"(b) the dependency is GENUINELY ABSENT (not provisioned here) → WARN/advisory, surfaced but NEVER a hard merge/push block"*. Sin carve-out. El cuerpo de §8.8 (líneas 163-173) no menciona seguridad, fail-closed, ni tiers de riesgo. Eso contradice frontalmente el spine sellado:

- **`knowledge/GLOSSARY.md:52`** — *"**Fail-closed.** A broken guard denies by default."* Definición de kit, sin excepción por "ausente vs roto".
- **`CANON-RUNTIME-POLICY-ENGINE-001.md:50,57`** — §6 Fail-closed: *"A broken guard **never fails open**."* Y las policies que ese engine consume **viven en el mount del kit** (`knowledge/policy/*.policy.json`). §8.8 se extiende explícitamente *"to any inherited dependency a gate consults — **including the kit mount itself**"* (línea 171). Mismo objeto, mandatos opuestos: mount de policies wipeado → §6 sellado dice DENY; §8.8 draft dice WARN-y-pasa. Un lector puede citar §8.8 para fallar-open un guard de seguridad.
- **Caso concreto dentro del alcance literal de §8.8 (merge/push):** un scanner de secretos/authz provisionado como tool (la familia de `tools/comms-security-gate.mjs`, que es exactamente un gate de push-time contra fuga de secretos) ausente en esta máquina, con un push que toca superficie sensible → §8.8 literal: WARN y el push sale sin que el control haya podido mirar. "El control de seguridad no pudo mirar" sobre contenido sensible NO es inofensivo: es la dirección peligrosa, y el kit ya lo sabe — `CANON-OBSERVABILITY-CLOSED-LOOP-001.md:29-32` (§4: *"if spend cannot be measured, the loop **stops**"*) aplica stop-on-cannot-measure hasta para presupuesto.
- El propio spine ya tiene el patrón de resolución: **`CANON-DEVELOPMENT-PROCESS.md:334`** — *"**Risk-tiered** — a hard block only for tenant-visible / production capabilities; advisory for internal ones"* — y `CANON-AUDIT-PROTOCOL §8.3` (severidad por riesgo real, no binaria). §8.8 flatten-ea a WARN lo que §8.3 manda gradar.

**Por qué no es teórico:** la nota del propio D-061 dice que el WARN existe para no entrenar `--no-verify`. Pero para un guard de seguridad la salida correcta no es WARN-silencioso-que-pasa, es **block + nombrar la remediación (re-provisionar) o escape humano caro** (`CANON-DEVELOPMENT-PROCESS.md:339-342`: el escape es aprobado por humano, logueado, más caro que cumplir). La asimetría de daño es real: quality gate en WARN = una inconsistencia de docs aterriza; security gate en WARN = un secreto/vuln sale pusheado.

**Fix propuesto (bullet nuevo en §8.8, después de línea 171):**

> **Fail-closed carve-out — a security guard that cannot look does not wave through.** This section governs *quality/consistency* gates. A gate that is a **security control** (a runtime policy guard, a secret/authz/exposure scanner — any gate whose RED protects against exploitable or destructive outcomes) keeps the sealed fail-closed discipline (Glossary *fail-closed*; `CANON-RUNTIME-POLICY-ENGINE §6` — a broken guard never fails open): its dependency absent = the guard cannot look = **deny/block or escalate to a human-approved escape**, at minimum for changes touching the surface it guards. The absence itself is a RED-class provisioning finding that enters disposition (§4), not ambient advisory. Where risk is tiered, tier the response (`CANON-DEVELOPMENT-PROCESS §8.1`: hard-block the high tiers, advisory the internal ones — the same anti-flatten rule as §8.3).

## V2 — ¿§8.7 y §8.8 se contradicen?: **NO se contradicen — COMPONEN. Pero §8.8 esquiva la disciplina de falsificabilidad de §8.7 — MEDIUM**

No hay contradicción: §8.7 (líneas 149-161) exige que el gate **muerda sobre contenido known-bad** (RED + required/blocking); §8.8 clasifica una condición de entrada distinta (ausencia de entorno ≠ contenido malo). Un gate puede ser required/blocking Y degradar a WARN en ausencia: el check corre siempre, exit 0-con-WARN cuando la dependencia está genuinamente ausente, exit≠0 en present-but-broken o defecto de contenido. Complementarios, como el encargo sospechaba.

**Pero** §8.8 introduce un **tercer verdict (WARN-absent) y un clasificador (a)/(b) sin exigirles prueba**, cuando §8.7(a) existe exactamente para eso (*"a check you cannot make fail is not a check"*, línea 155). El instrumento del kit (`tools/check-gate-integrity.mjs`, header líneas 6-18) solo exige el fixture known-bad que prueba el RED — **nada prueba la rama de ausencia**. Un bug del resolver que clasifique present-but-broken como absent (p.ej. error de permisos leído como "no existe") convierte cada rotura real en WARN ambiente para siempre: **el false-GREEN raíz de §8, reintroducido por la amendment que mata a su espejo**. En el gate consumer real esto no es hipotético: `scripts/knowledge-pack-health.mjs:81-84` — `resolveDevkitRoot()` devuelve null y el llamador no distingue "no resolvió" de "resolvió y está roto".

**Fix propuesto (una oración al final del bullet "Verify content, not the container", línea 169, o bullet propio):**

> **The absence branch is itself subject to §8.7(a).** The (a)/(b) classifier and the WARN verdict are provable behavior: the gate's paired test ships a **known-absent fixture that must WARN (not RED, not block)** and a **known-present-but-broken fixture that must RED**. An unproven classifier that drifts toward "absent" turns every real breakage into ambient WARN — §8's false-green, one level up.

## V3 — "Verificar contenido, no el contenedor" ¿implementable sin ambigüedad?: **HAY UN ESTADO SIN CLASIFICAR — MEDIUM**

El caso vacío está bien resuelto (línea 169: mount vaciado ≠ presente). Pero el **estado parcial** — contenedor presente, contenido parcialmente presente (mount a medio poblar; exactamente lo que deja un wipe interrumpido de la familia D-059, la causa probable que la propia D-061 nombra) — cae en las DOS ramas según cómo se lea:

- Lectura 1 (bullet línea 169): "required content is present" → falta 1 de 5 archivos → contenido requerido NO presente → **absent → WARN**.
- Lectura 2 (arm (a), línea 167): el mount resolvió y tiene contenido, pero su contrato está roto (falta un archivo requerido) → **present-but-broken → RED, block**.

Mismo estado observable, verdicts opuestos, ambos defendibles con el texto tal como está. El autor del gate va a elegir uno — y la regla pierde su valor de clase. Nota: la remediación del operador para parcial y para vacío es idéntica (re-provisionar), y el contenido guarded (los docs del repo) sigue sin ser el defecto — blockear un docs-push por un mount a medio wipear fabrica la MISMA fricción falsa que el precedente.

Segundo gap del mismo vector: el WARN no tiene deber de disposición. Un WARN que persiste corrida tras corrida se vuelve amarillo-permanente que todos ignoran — el gemelo del "cry wolf" de §8.3, y el reemplazo del silencio que §8.8 quiere evitar. El canon ya tiene la respuesta en casa: §4 (*no audit is left idle*).

**Fix propuesto (bullet nuevo):**

> **Partial presence is absence-class, and a persistent WARN enters disposition.** Presence is judged against the dependency's **declared content contract** (the required-items list the gate consults): ALL items present → present (a deeper violation → RED, arm (a)); ANY required item missing → not provisioned here (arm (b) → WARN **naming the missing items**) — a half-populated mount is remediated the same way as an empty one, and the guarded content is still not the defect. A WARN that persists across runs is not ambient noise: it is a provisioning finding that enters disposition (§4), so permanent-yellow does not become the new silence.

## V4 — Fire-test: **PASA** (cuerpo completo re-leído)

Contra la definición del kit (`knowledge/GLOSSARY.md:12`: el L1 no nombra producto/vendor/brand/framework/methodology):

- §8.8 cuerpo completo (líneas 163-173): *"a consumer"*, *"a machine"*, *"the inherited kit mount"* — ningún producto, vendor, persona ni path de máquina. Limpio.
- Fila D-061 (`doc/decisions/DECISION-REGISTER.md:84`): nombra "ViTo", "vito-arq" y `resolveDevkitRoot` — pero es la **convención establecida del registro** (D-058, D-059 y D-060 nombran "ViTo"/"Fable devkit-rev" idénticamente): el registro es procedencia, no canon L1; el fire-test aplica a `knowledge/`, no a `doc/decisions/`. Consistente con el precedente OBSERVABILITY (el nombre de producto se tolera en DRAFT/procedencia y se retira al sellar).
- Nit opcional, no bloqueante: *"every docs/comms/specs/features push"* (línea 173) calca la lista de scopes del hook del consumer; genérico igual (no es nombre de producto), pero *"every documentation-class push"* sería más limpio.

## V5 — ¿Duplica o pisa `AGENTS_UNIVERSAL`?: **EXTENSIÓN LEGÍTIMA, no duplicación — con una nota que refuerza V1**

`knowledge/ai-agents/AGENTS_UNIVERSAL.md:146-180` (baseline RTK+Graphify): *"NEVER a product-correctness dependency. Non-blocking: no CI gate, no merge gate... Local/session health MUST still surface absence as RED/WARN"* (148-152) + *"Loud fallback, documented — never silent"* (162-166). §8.8 preserva el núcleo semántico (loud, no-blocking, nunca silencioso) y extiende la clase de objeto (de tools de operador a cualquier dependencia heredada que un gate consulte). No hay contradicción — el RED/WARN de session-health (151-152) y el WARN del gate son superficies distintas con la misma constante: gritar sin bloquear. La cita cruzada de la línea 171 es correcta.

**Pero la nota importa:** la regla de AGENTS_UNIVERSAL es segura *porque sus objetos son por definición inofensivos* ("NEVER a product-correctness dependency", línea 150 — un índice de base de datos, según su propio modelo mental). §8.8 extiende esa regla a una clase que **incluye dependencias security-relevant** (las policies del engine viven en el mount, V1) **sin traer consigo el límite de riesgo**. La extensión es legítima; extraerla sin el carve-out es exactamente el hueco de V1.

---

## Resumen ejecutivo

| Vector | Resultado | Severidad |
|---|---|---|
| V1 — WARN absoluto vs guards de seguridad | **SE ROMPE** — colisión con fail-closed sellado (`GLOSSARY:52`, `RUNTIME-POLICY-ENGINE §6`, `OBSERVABILITY §4`); carve-out requerido | **MAJOR** |
| V2 — §8.7 vs §8.8 | Componen, no se contradicen; pero la rama WARN-absent no tiene deber de falsificabilidad (§8.7(a)) ni cobertura del instrumento | MEDIUM |
| V3 — contenido-no-contenedor | Estado parcial sin clasificar (dos lecturas, verdicts opuestos); WARN sin deber de disposición §4 | MEDIUM |
| V4 — fire-test | **PASA** (cuerpo limpio; registro dentro de convención) | nit opcional |
| V5 — AGENTS_UNIVERSAL | Extensión legítima, sin contradicción; la nota de clase-de-objeto refuerza V1 | nota |

**Condición de sello:** aplicar los 3 fixes de wording (V1 obligatorio; V2 y V3 párrafos cortos) en el mismo PR. Con eso, APPROVE — la clase es correcta, el precedente real, y el espejo false-RED/false-GREEN es una adición genuina al §8.

---

*Registro requerido por `CANON-AUDIT-PROTOCOL §9` — persistido verbatim antes de cualquier acción de la autoridad humana. El builder (devkit-arq) no califica su propio trabajo; esta validación es independiente.*
