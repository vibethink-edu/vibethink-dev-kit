# REVIEW CONVERGENTE — §8.2 "Human governance plane" (PROPOSED, PR #208)

- **Consolidado por:** wb-arq (reviews independientes de **Codex** + **Opus**).
- **Fecha:** 2026-06-30.
- **Sujeto:** `knowledge/methodology/CANON-DEVELOPMENT-PROCESS.md` §8.2 (PROPOSED), PR #208.
- **Veredicto convergente:** **principio SÓLIDO, agnóstico, dual fiel de §8.1, no contradice
  §6.1/§9.x.** Codex: *sellable con cambios menores.* Opus: *no al nivel de §8.1 todavía — falta el
  MODELO DE ENFORCEMENT* (el dual del "contract-derived execution gate"). **Resuelto: se agregó el
  enforcement + los ajustes de ambos. Listo para 2º review + seal.**

## El hallazgo MAYOR (Opus) — y por qué es correcto

§8.1 se selló porque nombró **cómo se prueba** ("proven by a contract-derived execution gate, not by
declaration"). §8.2, como estaba, **enunciaba la propiedad** ("read machine truth, not narration")
**sin decir cómo se prueba** que una superficie la cumple → podía satisfacerse con una superficie que
es **ella misma teatro** (eco del agente) — el fallo exacto que nombra. Sin el modelo de enforcement,
§8.2 sería más blando que su hermana bajo el mismo banner §8.x (el mismo riesgo que los 2 rounds de
§8.1 corrigieron).

**Cierre (agregado):** *"Proven by an independence probe, not by asserting independence — the
verification gate (the dual of §8.1's execution gate)."* El check **inyecta una narración FALSA del
agente** (un "succeeded/fresh/passed" fabricado) y confirma que la superficie **sigue mostrando el
estado-máquina grabado**, inmóvil ante el reclamo del agente. Es el dual exacto del lying-probe de
§8.1. Las verdades que pide YA las graba §8.1 → **se consume, no se graba de nuevo.**

## Ajustes incorporados (qué se cambió)

| # | Reviewer | Hallazgo | Cierre en el diff |
|---|---|---|---|
| 🔴 | Opus | falta el modelo de enforcement (dual del execution gate) | **agregado** el "verification gate" (probe de narración-falsa) |
| 🟠 | Codex+Opus | "conversación auditable" demasiado amplia | **acotado** al capability/mutation boundary (instrucciones/decisiones/aprobaciones que autorizan un mutate/emit gobernado); chat/brainstorm NO |
| 🟠 | Opus | gap PII/secretos en la traza | **agregado** "inherits secrets/PII governance — no raw secrets/payloads" |
| 🟠 | Codex | "human-verifiable truth" aspiracional | **L2/L3 obligation:** nombrar el triple *machine truth source → verification surface/query → audit trace* por capability; ausencia = waiver explícito |
| 🟡 | Opus | parece redefinir la human surface de §8.1 | **frase:** §8.2 AGREGA el plano gobernador, NO remueve la human-operating surface de §8.1 (paridad sigue; dos roles humanos distintos) |
| 🟡 | Opus | riesgo de doble-mandato de grabado vs §8.1 | **frase:** §8.2 *consume* la provenance de §8.1, sin nueva obligación de grabado |
| 🟡 | Opus | cross-refs | **Companions:** §6.1 (finding = palabra del agente; §8.2 = verdad-máquina independiente) + `REVIEW-READINESS-PROTOCOL` (la disciplina humana que esta superficie habilita) |
| 🟡 | Codex | "budget" no universal | **suavizado** a "applicable limits (budget / quota / rate)" |
| 🟡 | Codex | lema español en canon L1-EN | **"the builder does not grade** (*el que construye no califica*)" |

## Lo confirmado por ambos (no se toca)

- **Agnóstico/L1:** no nombra productos; formas diferidas a L2/L3. Pasa el fire-test.
- **Coherente con §8.1:** "echoing the agent is theatre" es el dual fiel de "declaration is theatre".
- **No pisa §6.1** (findings = aprendizaje activo) ni §9.x (freshness manifest se *consume*, no se
  redefine). §9.1 **no existe** en este canon (vive en otros); el vecino conceptual real es
  `REVIEW-READINESS-PROTOCOL`.

## Veredictos crudos

- **Codex:** PASS-CON-CAMBIOS / agujeros-menores — sellable tras los 4 ajustes.
- **Opus:** NO-SELLAR-AÚN al nivel de §8.1 — principio sólido, falta el enforcement model + 2 ajustes
  de scope; sellable como PROPOSED/dirección mientras se agrega.

## Estado

Con el enforcement model + todos los ajustes **incorporados al PR #208**, §8.2 es ahora **peer real de
§8.1** (anti-teatro con dientes de ejecución). **Próximo:** 2º review convergente sobre la versión
ajustada → **seal del Principal Architect** (Rule #4 — solo Marcelo). El seal-log **no** se toca hasta
el seal.

---

**VERDICT — wb-arq:** reviews aceptados enteros. El hallazgo de Opus (enforcement model) era el que
elevaba §8.2 a la vara de §8.1 — agregado como el dual del execution gate (probe de narración-falsa).
Gracias Codex + Opus.
