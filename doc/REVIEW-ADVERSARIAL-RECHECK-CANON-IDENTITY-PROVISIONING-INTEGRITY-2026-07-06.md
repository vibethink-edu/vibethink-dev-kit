# REVIEW — Re-check adversarial · dev-kit PR #237 tras amendments (head `4381f04`)

- **Rol:** validador independiente (mismo mandato: refutar, no aprobar)
- **Agente:** claude (Claude Code · Fable 5 · devkit-rev)
- **Fecha:** 2026-07-06
- **Objeto:** `knowledge/methodology/CANON-IDENTITY-PROVISIONING-INTEGRITY-001.md` + D-060 @ `4381f04` (amendments C2/C5a/C5b/C4 sobre mi REQUEST-CHANGES previo, record `b1e713e`)
- **Autoridad de registro:** `CANON-AUDIT-PROTOCOL §9` — persistido verbatim ANTES del sello

---

## VERDICT: **REQUEST-CHANGES** (segunda ronda, estrecha: 2 fixes de una frase c/u)

Los 4 amendments atacan lo que pedí y 2 de los 4 cierran limpio (§4 y D-060). Pero el wording del scoping de C2 **abre un falso-negativo contra la clase del incidente fundador**, y el attribute-drift de §3 **es vacuo exactamente en el consumer que lo motivó**. Ambos son fixes quirúrgicos; con ellos aplicados, apto para sello sin otra ronda completa.

---

## Q1 — ¿El scoping de C2 cierra el falso-drift SIN abrir un hueco? **NO — abre uno** 🔴 gating

**Lo que cierra (verificado):** §5 bullet nuevo (línea 50) — fuente deliberadamente sparse (fail-closed linking, JIT) declarada en L3 y excluida en su dirección. El falso-positivo masivo del gate fail-closed queda resuelto. Bien.

**El hueco que abre:** la población se operacionaliza por **provenance de §2.1**:
- §5:50 — *"Drift is measured only over the principals the system intends to have in all the sources under check — **those it co-provisions via §2.1**"*
- §5:50 (final) — *"the check still runs on the bounded direction (**principals the system did co-provision** but that diverge)"*
- Y la restricción es **global**: §2.2:25 *"restricted to the co-provisioned population (§5)"* y §3:33 *"over the co-provisioned population only"* la aplican a TODOS los pares, no solo a los sparse.

**Por qué eso es un falso-negativo de la clase fundadora:** los principals drifteados del near-incidente (2 de 3 admins) drifteaban **precisamente porque fueron provisionados por caminos separados, fuera de cualquier operación atómica** — no existe registro §2.1 de ellos. Bajo la lectura estricta ("those it co-provisions via §2.1"), un principal provisionado por camino legacy o rogue queda FUERA de la población → excluido del check → **el check mandatorio ya no ve el incidente que motivó el canon**. El provisioning rogue (el menos gobernado) es exactamente el drift que el check debe ver, y es exactamente el que no tiene provenance §2.1. Una lectura caritativa ("intends" como clase, no provenance) evita el hueco — pero un gate normativo de seguridad no puede colgar de la lectura caritativa: la lectura estricta es implementable y es la equivocada.

**Fix (una frase en §5, ajuste de dos remisiones):** la población es **por-par y observacional por default**:
- Par de fuentes **intended-complete** (ninguna declarada sparse — el caso fundador): población = **unión de principals activos en cualquiera de las dos, leída de las fuentes mismas** — nunca derivada de registros de provisioning. (Esto es lo que el check v1 ya hacía; para estos pares no hace falta restricción alguna.)
- **Dirección sparse declarada:** ahí sí la población viene de un **registro de intención declarado** (roster/log de provisioning — el L3 lo nombra), porque observacionalmente no se distingue el no-vinculado-legítimo del no-vinculado-random.
- Frase guardiana sugerida: *"membership in the population is never derived from §2.1 provisioning records on an intended-complete pair — a principal provisioned by a rogue path is exactly the drift the check must see."*

## Q2 — ¿§4 quedó consistente con §2.2? **SÍ — PASS** ✅

§4:43 ahora dice explícito: *"the scope of the gate is every guard-source change (§2.2); the emphasis of the review is the lockout direction"*, e incluye el lateral switch con su mecanismo correcto (ghost-authority creado por el switch = atrapado por el gate; ghost encontrado por el run periódico = finding). Re-leí ambos §§ buscando contradicción: no queda ninguna. El hueco fail-open del switch que señalé está cerrado.

**Nit (no gatea):** §2.2:25 conserva el paréntesis *"(it names the exact principals who would be locked out)"* — con el switch ahora en el gate, la lista también nombra principals que **ganarían** acceso. Un "or would gain access" lo cierra.

## Q3 — ¿El attribute-drift de §3 es implementable/claro? **IMPLEMENTABLE SOLO DONDE NO HACE FALTA** 🔴 gating

§3:35 — *"**Where both sources carry the same authority attribute** for a principal, the check MUST also compare that attribute"* + *"(A source that does not carry the attribute at all cannot be compared on it — that pair is presence/absence only.)"*

**El problema:** dos stores provisionados por separado casi nunca portan "el mismo" atributo — tienen **vocabularios de rol distintos** (ese es el síntoma natural de haber sido construidos por separado). En el propio consumer fundador, las dos fuentes usan enums diferentes (tres niveles top/ops/soporte en una; tres roles con otro naming en la otra — ver el finding fuente, líneas 11-12). Un implementador razonable concluye "no es el mismo atributo" → cae en la frase de escape → **la tercera clase queda vacía exactamente en el caso que motivó añadirla**. La cláusula solo muerde donde ambos stores comparten enum — el caso raro.

**Fix (una frase en §3 + un bullet en §6):** la comparación corre a través de una **equivalencia declarada** cuando los vocabularios difieren — *"same **or mapped** authority attribute; the role-equivalence mapping between the two vocabularies is an L3 binding item (§6). A pair with no declarable mapping is declared attribute-incomparable in the binding — explicitly, not silently."*

## Verificaciones adicionales (no pedidas, mismo mandato)

- **C4/D-060: CERRADO** ✅ — `DECISION-REGISTER.md:83` ahora rutea los dos residuos con destino nombrado: (a) cadencia-por-gatillo → amendment `MULTI-AGENT-ORCHESTRATION §3.3` o `ARCHITECTURE-REVIEW`; (b) closure-is-a-gate L1 → amendment familia `AUDIT-PROTOCOL §8`. Registrados como follow-ups, no silenciados. Es lo que pedí.
- **Fire-test v2: PASA** ✅ — re-grep exhaustivo del texto enmendado completo (vendor/producto/engine/agente/persona): CLEAN; el diff no introdujo nombres.
- **§2.1 backstop (C5c): aplicado** ✅ — línea 24, el paréntesis nuevo declara §2.2 como backstop obligatorio de la atomicidad. Correcto.
- **Provenance: ubicación del finding añadida** ✅ — línea 71, "(in the consumer's comms lane)".
- **Coherencia §5→§6 (nit, no gatea):** §5 exige que la fuente sparse "MUST be declared in the L3 binding (§6)", pero la lista de §6 no enumera esa declaración (ni el mapping de atributos del fix Q3). Añadir un bullet a §6: *declared deliberately-sparse sources/directions (+ their intent record) and the attribute-equivalence mapping*.

---

## Resumen para el sello

| Ítem | Estado |
|---|---|
| Q2 — §4↔§2.2 | ✅ cerrado |
| C4 — ruteo residuos D-060 | ✅ cerrado |
| C5c, provenance, fire-test | ✅ cerrados |
| **Q1 — población por provenance §2.1** | 🔴 **fix de 1 frase antes del sello** (falso-negativo clase fundadora) |
| **Q3 — attribute-drift sin mapping** | 🔴 **fix de 1 frase + 1 bullet §6 antes del sello** (vacuo en el consumer fundador) |
| §2.2 paréntesis lockout-only · §6 no enumera declaraciones | 🟡 nits, con gusto en el mismo commit |

**Con Q1+Q3 aplicados no necesito otra ronda completa** — verifico el diff de wording en minutos y queda apto para sello.

*Registro per `CANON-AUDIT-PROTOCOL §9` — fileado antes del sello.*
