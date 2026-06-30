# 🧭 PROPOSAL — Dev-kit next additions (4 propuestas → stack reordenado, doble-validado)

- **De:** vito-architect (Claude Code · Opus 4.8).
- **Validado adversarialmente por:** Opus advisor **y** Codex architect (independientes, 2026-06-29).
- **Disposición:** PROPOSED roadmap (no canon nuevo — ver verdict). Espera GO de Marcelo.
- **Sobre:** qué le agregamos al stack ViTo (KDD + agent-native §8.1 + operator-tooling graphify/engram/rtk).

---

## Las 4 adiciones que propuse (vito-architect)
1. **Learning-loop** work→knowledge (agente propone update de pack → human valida).
2. **Provenance chain** knowledge→decisión→evidencia (atar KDD+graphify+ETM por mutación).
3. **Evals / golden-tasks por capability** (probar que el agente LOGRA, no solo que la puerta abre).
4. **Cockpit de salud del conocimiento** (fresh/lapsed/contradicted/forgotten por pack).

## Veredicto convergente (Opus + Codex coinciden)
| # | Convergencia | Acción |
|---|---|---|
| **#3 evals** | Alto valor, **selectivo** (no todo día-uno). Es el *outcome slice* de §8.1 (la puerta logra, no solo abre) + incremento del testing-gate. **No es canon nuevo.** | **PULL — pero scope acotado** |
| **#2 provenance** | **Tier, no toggle.** Mínimo-obligatorio (`pack_ref → decision/ADR → evidence → mutation`) reusando el risk-tier de §8.1; full-lineage solo high-risk. **Extender ETM, no 2º ledger.** PROV-O para entity/activity/agent; OpenLineage solo para pipelines, NO para toda decisión. | **Enabling — mínimo** |
| **#4 cockpit** | **Over-engineering con N=25.** fresh/lapsed ya lo cubre `kdd-refresh`+`check-knowledge-memory-freshness`. contradicted/forgotten = **queries de graphify/engram** (dead-knowledge), no motor nuevo. | **Señales como JSON/doctor/health — UI diferida** |
| **#1 learning-back** | **La grande Y la peligrosa.** Vector de **poisoning** vía fatiga-de-validador (mismo teatro que §8.1) + self-reinforcement (model-collapse de conocimiento). **Ya es principio en canon** (`CANON-KNOWLEDGE-NATIVE-VT-METHOD-001 §3.6 "Feed learning back"` + loop §1.0) → la novedad es el **instrumento/gate, no el canon.** | **HOLD canon · PASS instrumento mínimo, con TODOS los gates** |

## Gate-set para #1 (unión Opus 6 + Codex 7 — TODOS, no uno)
1. **Proposal-only** — el agente **nunca** escribe `accepted`; propone candidate amendment, diff chico y trazable.
2. **Evidence-bound, evidencia no-fabricable** — DEBE citar PR-merged / finding-accepted / decision-sealed / incident / eval-failure / user-approved. Si el agente escribe el test que cita → poison por la capa de evidencia.
3. **Trust zones** — raw chat ≠ comm ≠ PR-merged ≠ canon-sealed ≠ incident ≠ eval-failure NO tienen igual autoridad. Sin fuente → queda raw-input, no conocimiento.
4. **Cuarentena** — lo propuesto NO es consumible como baseline §7 hasta aceptado.
5. **Contradiction-precheck automático** (= señal de #4) **antes** del humano — no que el humano cace la contradicción.
6. **Knowledge-mutation budget / rate-limit** — máximo de cambios por período; los packs NO son diarios de sesión.
7. **Proposer ≠ validator ≠ primer consumidor** — pack-owner/humano valida.
8. **Provenance + reversibilidad** (= #2) en la aceptación — toda aceptación atribuible y **revertible**.
9. **Net-value / acceptance-rate metric** — aceptadas vs ruido; si baja, el gate molesta más de lo que aprende.

## Lo que YO no vi (ambos lo marcaron)
- **No son 4 independientes — es un stack con dependencias.** #2-mínimo + señales-#4 son **prerrequisito** de #1. **#1 NO va primero.**
- **El validador humano es el cuello de botella Y el punto único de poisoning** — ninguna de mis 4 lo diseñaba. Necesita batching/pre-filtro/auto-reject.
- **Reversibilidad/retirement de conocimiento** — KDD read-only no lo necesitaba; KDD que aprende sí: versionado de packs, rollback de aceptación mala, invalidación del §7 cacheado, y **supersession** (un pack puede estar *fresco* pero conceptualmente reemplazado).
- **La 5ª que faltaba — EFICACIA:** nadie mide si el conocimiento AYUDA. Atar pass-rate de golden-tasks (#3) ↔ qué packs estaban en contexto (#2 lo permite); + **negative-retrieval evals** (el agente rechaza pack stale/contradicted y cita el correcto). Un pack-update que no mueve el eval → se degrada.

## Ya resuelto — NO duplicar
- Risk-tier de §8.1 → reusar para el tier de #2.
- graphify → señales estructurales (forgotten/contradicted) son **queries**, no motor.
- engram → ya captura memoria cross-agente; **#1 NO es "capturar aprendizaje" (ya pasa) — es solo el gate de graduación engram/work → pack canónico.** Eso lo achica de "pilar" a "gate de promoción".
- #3 → es el Slice-N natural de §8.1, no un pilar aparte.

## Orden real (reconciliado)
1. **Ahora (bajo riesgo, alto valor):** #3 golden-tasks **selectivo** — PR-gate smoke (capability crítica) + nightly full + required para agent-native/hard-block/tenant-visible/regresión. Con disciplina held-out / builder-doesn't-grade.
2. **Enabling:** #2-mínimo provenance (tier=§8.1, extiende ETM) + #4-señales (queries graphify → JSON/doctor).
3. **Después (gateado):** #1 learning-back **como instrumento** (no canon — §3.6 ya existe), con los 9 gates + budget + trust-zones.
4. **Transversal:** #5 eficacia (eval↔pack, negative-retrieval, supersession, net-value).

---

**VERDICT — vito-architect (incorporando ambas reviews):** `HOLD` para canon nuevo (los principios ya existen) · `PASS` para instrumentar **#3 selectivo** + **#1 mínimo gateado**, en el orden de arriba. Dos arquitectos independientes convergieron → alta confianza. No es "programa de 4 pilares": es **1 entrega que acelera (#3) + 1 inversión enabling (#2+#4-señales) + 1 riesgo que necesita blindaje (#1) + 1 transversal (#5)**.
**MARCELO, AHORA TÚ** — decidir qué se pulla primero (recomiendo #3 selectivo) y si #1 se instrumenta en el dev-kit ANTES de tocar ViTo local.
