# DELIVERY — Governance amendments: tier economy (§3.3) + audit persistence (§9) + completeness ladder (§10)

**From:** dev-kit architect (Fable session, 2026-07-02)
**To:** the chief architect
**Thread:** executes Marcelo's GO ("GO por supuesto y continuamos") on the four-piece amendment discussed in-session (same session as policy-engine S2). Origin: Marcelo's three directives — "que no tenga yo que recomendártelo" (tier routing), "las auditorías no queden en el aire" (persistence), "un mínimo o estándar de completitud... elevable a SUPRA" (ladder).

## What shipped (one PR, seal-on-merge per each canon's amendment path)

1. **`CANON-MULTI-AGENT-ORCHESTRATION` §3.3 — Tier economy.** A high-tier session spends its tier on judgment (design, law, security semantics, adversarial review, seals, briefings); mechanical mid-size work delegates to a lower tier by default; a closed-contract slice is DISPATCHED, not executed in-session (cut test: if the briefing requires the executor to make design decisions, the dispatch is cut wrong); the interleaved-design exception is declared, never assumed; review strength never downgrades to save cost. Complements §3.2 (which governs HOW a route is declared; §3.3 governs WHEN to route down). Vendor-neutral: tiers/capabilities, no model ids.
2. **`CANON-AUDIT-PROTOCOL` §9 — Verbatim persistence of the audit record.** Any audit/review verdict — including chat/relay-delivered — is filed verbatim, dated, in the single audit/comms location, committed+pushed, before/while acting on it. The response addendum never substitutes the record. Precedent named in the §: the same agent left chat-delivered audits unfiled twice (2026-06-23 · 2026-07-02) — a memory-level rule failed twice; law + trap is the correction.
3. **`CANON-AUDIT-PROTOCOL` §10 — Completeness ladder A0–A3.** Every audit declares its coverage: A0 mechanical floor (gates/tests run+cited) · A1 sealed law (applicable manifest rules enumerated — machine-readable law makes this an enumerable list, not prose) · A2 principles/judgment (architecture lenses + the product's L3 principles — the kit names the slot) · A3 closure (§4 disposition + §5 links + §9 persistence). Skipped layer = declared layer; minimum, not ceiling; the declaration block is gate-validatable later (same manifests→engine path).
4. **Manifests updated in the same PR** (one-seal principle): `ORCH-MUST-TIER-ECONOMY` (§3.3) · `AUDIT-MUST-PERSIST-VERBATIM` (§9) · `AUDIT-MUST-DECLARE-COMPLETENESS-LADDER` (§10). Projection gate GREEN 32/32.

## Backlog registered (piece 4 of the GO — not built here)

- **Behavioral golden trap `audit-persistence`** (REFERENCE-BEHAVIORAL-GOLDEN-TASKS §3: incidents leave traps): a verdict arrives in the prompt → deterministic grader checks the filed record exists in the audit location. Declared TRAP-ELIGIBLE in §9 and in the manifest watch note. Natural home: the next battery growth PR (or policy-engine S3's heir fire-test wave).
- Tier-economy telemetry: measuring tier spend is roadmap item 6 / policy-engine S3 (JSONL counters) — the §3.3 watch note points there.

## Verification

- `check-policy-manifests` GREEN 32/32 (new rules anchored §3.3/§9/§10, status parity holds) · `check-canon-links` GREEN · `check-catalog-sync` GREEN 44/44 · biome clean.
- No section renumbered (both canons appended); sealed §§ untouched.

## PENDIENTES

| # | Pendiente | Dueño |
|---|---|---|
| 1 | Sello de las tres enmiendas (status lines ya llevan la fórmula "sealed on merge of their PR") | Chief architect (merge del PR) |
| 2 | Trampa golden `audit-persistence` (backlog arriba) | Próximo PR de batería / S3 |
| 3 | Herederos: al hacer devkit-upgrade, sus adapters heredan §3.3/§9/§10 por referencia — sin acción inmediata; el primer audit post-merge debe estrenar la escalera A0–A3 | Todos los agentes |
