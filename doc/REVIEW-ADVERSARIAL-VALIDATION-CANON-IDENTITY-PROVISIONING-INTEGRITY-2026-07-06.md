# REVIEW — Validación adversarial independiente · dev-kit PR #237 (CANON-IDENTITY-PROVISIONING-INTEGRITY-001, D-060)

- **Rol:** validador independiente (no construyó el canon; mandato: refutar, no aprobar)
- **Agente:** claude (Claude Code · Fable 5 · devkit-rev)
- **Fecha:** 2026-07-06
- **Objeto:** rama `claude/canon-identity-provisioning-integrity` @ `eb14f74` — DRAFT `knowledge/methodology/CANON-IDENTITY-PROVISIONING-INTEGRITY-001.md` + D-060 + SUPRA-MAP + exención catalog-sync
- **Método:** los 6 claims del encargo tratados como hipótesis a romper; evidencia re-verificada de primera mano (grep del spine completo, lectura de siblings, diff del PR, lectura de las DOS fuentes en el consumer)
- **Autoridad de registro:** `CANON-AUDIT-PROTOCOL §9` (veredicto persistido verbatim ANTES de que la autoridad actúe)

---

## VERDICT: **REQUEST-CHANGES**

El **lift es válido** — no duplica el spine (C1), el fire-test pasa (C3), el split L1/L3 es limpio (C6). Pero el cuerpo normativo tiene **3 hallazgos AMEND-grade que deben corregirse antes del sello** (C2, C5a, C5b) y la disposición del candidato 2 **deja dos reglas genuinamente supra sin hogar** (C4). Ninguno invalida el principio; todos son corregibles en el mismo PR.

---

## C1 — "No está cubierto por el spine": **CLAIM SOBREVIVE (verificado de primera mano)**

Re-grepeé `knowledge/` completo (`drift|lockout|reconcil|provision` + `identity|role source|authorization`, 43+45 archivos revisados). Ningún canon gobierna la relación entre ≥2 fuentes de identidad de un principal:

- `CANON-CODER-SAFE-IDENTITY-001.md:5,13-15` — identidad del **ejecutor/bot que pushea código** (provenance de ejecución, asimetría propose-only). Capa distinta, exactamente como declara el draft (línea 6).
- `CANON-DB-SECURITY-BASELINE-001.md:5,13` — piso **engine-specific** Postgres/PostgREST (grants `PUBLIC`, RLS, `search_path`). No dice nada de la relación entre stores de identidad; su §8:70 aporta solo la disciplina "gate, not a cleanup" (ver C4b).
- `CANON-DATA-CHANGE-AUDIT-001.md:10` — quién/qué/cuándo de una mutación; no integridad cross-source.
- Los demás "drift" del spine son de otra cosa: `CANON-UPSTREAM-PROTOCOL §6.3` (versiones), `CANON-CONFIGURATION-DISCIPLINE` (config), `CANON-STATE-MIRROR §17` (estado operativo), `CANON-AGENT-SCOPE-DISCIPLINE §1` (scope de agente).

**No hay duplicación. No hay que abortar.**

## C2 — Generalización a los 4 sistemas: **SE SOSTIENE, PERO ENCONTRÉ DONDE SE ROMPE** ⚠️ AMEND pre-seal

La mecánica es genuinamente agnóstica (fuentes/guards/principals abstractos) y el `N-A(single-identity-source)` de §5 maneja los sistemas de una sola fuente. Pero el §1/§3, aplicado literal, **produce falsos positivos estructurales exactamente en un sibling que el canon dice cubrir**:

- **Caso que rompe:** un sistema hermano tiene hoy un gate de autorización de dos fuentes donde la **ausencia en la segunda fuente ES la decisión de autorización por diseño** (fail-closed): la sesión autenticada existe en el auth store ("quién es") y el vínculo/rol se resuelve server-side contra otra tabla ("qué puede ver"); un principal autenticado SIN fila de vínculo es un estado **normal y deliberado** (denegar es lo correcto), no un "lockout de un principal legítimo". El §1 del draft ("present/active in one and absent/inactive in another — that is drift... a security fault") clasifica cada usuario no-vinculado como drift. El §3 en ambas direcciones lo reporta en masa.
- **Mismo modo de falla, segundo caso:** §5 declara in-scope el IdP federado + role store local — con **JIT provisioning** (fila local creada al primer login), la dirección "activo en el IdP sin fila local" es o no-enumerable (IdP público) o el patrón deliberado, no drift.
- **Fix propuesto (chico):** en §1 o §5, scoping de la población: *el drift se mide sobre los principals que el sistema intenta tener en TODAS las fuentes (la población co-provisionada vía §2.1)*; una fuente **deliberadamente sparse** (ausencia = denegación por diseño) se declara como tal y ese par sale del check, o el check corre solo en la dirección acotada.

Sin este scoping, el canon adoptado tal cual obliga a un sibling a reportar como "security fault" su propio diseño fail-closed correcto.

## C3 — Fire-test: **PASA** (re-escaneado el archivo COMPLETO + SUPRA-MAP)

- Grep exhaustivo del archivo entero (producto, vendor, engine, agente, modelo, persona, tablas concretas del consumer): **un solo match** — "Postgres/PostgREST" en la línea 6 (header **Siblings**), describiendo el scope declarado del sibling engine-specific. Está fuera de §1–§7 y tiene precedente sellado (`CANON-DATA-CHANGE-AUDIT-001` nombra Postgres/Supabase como ilustración; su seal note lo permite explícitamente). No es fallo.
- **SUPRA-MAP diff: limpio** — nodo `identity provisioning integrity` + 3 aristas a siblings; cero vendors.
- **Declarado para juicio de Marcelo (no lo califico fallo):** "ViTo" aparece en la razón de exención de `tools/catalog-sync.config.json` y en la fila D-060 del `DECISION-REGISTER.md:83`. Precedente claro: el register ya nombra al consumer 24 veces y el config 1 vez en master — son **registros de gobernanza**, no cuerpo normativo; el fire-test aplica al canon. Consistente con la práctica del kit.

## C4 — No-lift del candidato 2: **~80% ES REAL, PERO LA DISPOSICIÓN VARÓ DOS REGLAS SUPRA** ⚠️ finding sobre D-060

Verifiqué la cobertura citada, pieza por pieza:

| Pieza del candidato 2 | ¿Cubierta? | Evidencia |
|---|---|---|
| Builder-doesn't-grade (§1) | ✅ | `CANON-ARCHITECTURE-REVIEW.md:43` — literal *"the one who builds does not grade"* (§3.1) |
| Tier economy (§3) | ✅ | `CANON-MULTI-AGENT-ORCHESTRATION` §3.3 (amendment sellado 2026-07-02) |
| Registro verbatim (§7) | ✅ | `CANON-AUDIT-PROTOCOL §9` |
| Disciplina de gates (§5 mecánica) | ✅ | `CANON-AUDIT-PROTOCOL §8.7` (known-bad + blocking) |
| **Cadencia por GATILLO para el sweep caro (§4)** | ❌ | `AUDIT-PROTOCOL §8.4` cubre el **inverso** (verificadores baratos periódicos deben auto-dispararse para no lapsar). Ningún canon dice: *la revisión profunda de tier caro se dispara por gatillo (volumen nuevo de código AI, pre-go-live, clase nueva de defecto), jamás por calendario*. |
| **Closure→portero como principio L1 (§5)** | ❌ | *"closure is a gate, not a cleanup"* existe SOLO dentro de `CANON-DB-SECURITY-BASELINE-001.md:70` (engine-specific §8) — y el **propio draft nuevo lo re-declara** en su §3 ("It is a gate, not a cleanup — same discipline as any drift closure") citando una disciplina que **no tiene hogar supra**. Tres declaraciones locales del mismo principio = principio L1 varado. |

**La decisión de NO crear un segundo canon es defendible** (el grueso sí está cubierto y el embudo operativo concreto es L3 razonable). **Lo indefendible es silenciar el residuo:** D-060 dice "stays a ViTo L3 canon citing the supra pieces" — con eso, los dos ❌ quedan invisibles para los otros siblings, que también acumulan código AI-generado. **Pedido:** la disposición nombra el residuo y lo rutea — (a) cadencia-por-gatillo → amendment a `MULTI-AGENT-ORCHESTRATION §3.3` o `ARCHITECTURE-REVIEW`; (b) closure-is-a-gate → amendment a la familia `AUDIT-PROTOCOL §8`. Pueden ser follow-ups, pero registrados, no perdidos.

## C5 — Soundness del principio: **2 HALLAZGOS** ⚠️ AMEND pre-seal

- **(5a) Tensión de alcance §2.2 ↔ §4.** §2.2 gatea *"any change that alters which source a guard consults"*; §4 lo reduce a *"stricter or additional"*. Un **switch** de fuente (guard pasa de leer A a leer B, no estrictamente más estricta) puede **crear ghost-authority** — principals inactivos en A pero activos en B **ganan** acceso con el cambio — y bajo la letra de §4 no gatearía ("ghost-authority... is not created by hardening"), mientras que bajo §2.2 sí. Un lector que implemente desde §4 deja el hueco fail-open abierto. **Fix:** alinear la frase de gating de §4 al alcance de §2.2 (cualquier cambio de qué fuente consulta un guard gatea; el *peso* en lockout se mantiene como está).
- **(5b) El drift de §1/§3 es solo presencia/ausencia.** Falta la tercera clase: **mismatch de atributo/nivel** — principal activo en AMBAS fuentes con privilegio distinto (top-privilege en A, soporte en B). No es lockout-por-ausencia ni ghost-por-presencia; produce **privilegio equivocado silencioso**, y el set-difference de §3 lo declara "the sources agree". Para un canon cuyo §7 reclama gobernar *"the relationship between sources"*, es una omisión nombrable. **Fix mínimo:** o extender §3 (comparar también el atributo de rol cuando ambas fuentes lo portan) o declarar attribute-drift explícitamente fuera de alcance en §7 — silencio no.
- **(5c) Atomicidad §2.1 — sin hallazgo bloqueante.** El texto ya reconoce el caso sin transacción común y exige secuencia gobernada + verificación de que todos los lados aterrizaron + tratamiento de escritura parcial como fallo. Correcto. Nota menor: por la ventana de crash entre escrituras, §2.2 es el **backstop obligatorio** de §2.1, no un requisito independiente — el texto lo implica; decirlo en una frase lo blinda.

## C6 — Split L1/L2/L3: **CORRECTO, sin contrabando**

- Cuerpo normativo sin stores/tablas/productos; §3 da la forma portable como shape abstracta de query (líneas 29-33); §6 asigna a L3 exactamente lo concreto (fuentes reales, check wireado + regression gate vía `AUDIT-PROTOCOL §8.7`, dónde ocurre el provisioning, autoridad de remediación) — líneas 49-54. §7 delimita bien lo que NO hace (líneas 56-60).
- **Nit (no gatea):** la provenance cita `FINDING-ARCHITECTURE-IDENTITY-DRIFT-DEVKIT-LIFT-2026-07-05` sin decir dónde vive (la genericidad dejó la trazabilidad coja); "in the consumer's comms lane" basta.

---

## Resumen de cambios pedidos (todos AMEND, mismo PR)

1. **§1/§5 scoping de población co-provisionada** — fuentes deliberadamente sparse (fail-closed linking, JIT) no son drift (C2).
2. **§4 alinear alcance del gate a §2.2** — el switch de fuente también gatea (C5a).
3. **§3/§7 attribute-drift** — cubrir o excluir explícito (C5b).
4. **D-060: rutear el residuo del candidato 2** — cadencia-por-gatillo y closure-is-a-gate como amendments con destino nombrado, no silencio (C4).
5. *(opcional, 1 frase)* §2.1→§2.2 backstop explícito (C5c) · provenance: ubicar el finding del consumer (C6).

**Sobre el sello:** con 1-3 aplicados, el canon queda apto para sello. Sin ellos, el primer sibling que lo adopte con un gate fail-closed legítimo lo va a violar de entrada o a reportar falsos drift en masa.

*Registro per `CANON-AUDIT-PROTOCOL §9` — fileado antes de cualquier acción de la autoridad humana sobre el PR #237.*
