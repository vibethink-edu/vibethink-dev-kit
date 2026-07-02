# HANDOFF — Item 3 (action-time policy engine): approved design + adoption position

**From:** dev-kit architect (Fable session, 2026-07-01 — the items 1+2 session)
**To:** the fresh session (or coder) that opens roadmap item 3. **Hablá español con Marcelo.**
**Status of this doc:** design reviewed with the chief architect in-session ("wow suena genial" + directed handoff); NOT sealed law — S1's PR carries the reference/canon touches through the normal seal path.

## Re-entry (read in order, ~15 min)

1. `2026-07-01-ROADMAP-DEVKIT-NEXT-ADDITIONS-ARCHITECT-POSITION.md` — item 3 is the front; items 1-2 are DONE.
2. `knowledge/ai-agents/CANON-RUNTIME-POLICY-ENGINE-001.md` (SEALED) — **the contract is already law; do not redesign it.** ALLOW/ASK/DENY · typed enforcement points · declared-order composition (DENY short-circuits; ASK accumulates and WITHHOLDS ALL WRITES until approval) · per-session state · fail-closed · never gate on vendor model id · never dissolve the static-deny floor (§8).
3. `doc/decisions/ADR-20260616-runtime-policy-engine.md` (D-009) — extract-pattern-from-omnigent decision + starter policy primitives; canon §11 has worked examples.
4. `REFERENCE-POLICY-MANIFESTS-001` (SEALED D-051) + `knowledge/policy/` — the engine's food: 32 manifests, 188 §-cited rules.
5. `REFERENCE-BEHAVIORAL-GOLDEN-TASKS-001` (SEALED D-050) + `tools/golden-tasks*` — the engine's effectiveness test.
6. Same-day deliveries (context): `...DELIVERY-DEVKIT-BEHAVIORAL-GOLDEN-TASKS.md`, `...DELIVERY-DEVKIT-POLICY-MANIFESTS.md`, `...DELIVERY-DEVKIT-POLICY-MANIFESTS-FRONTIER-COMPLETE.md` (pendientes P-1..P-5 live there).

## The design (5 decisions — reviewed with the chief architect)

1. **A zero-dep reference engine in the kit, not a framework.** Core: `tools/policy-engine/engine.mjs`, a pure function `evaluate(action, sessionState, policies) → {verdict, decidingPolicy}` implementing the sealed contract verbatim. Distribution: copy-parity like every kit runnable; if it ever grows dependencies → org registry per `ADR-20260619-shared-runtime-package-distribution`.
2. **The food: an optional per-rule `enforce` block in the manifest schema.** Only MECHANICALLY-DECIDABLE rules carry it — declarative matchers over the action's shape, never NLP at runtime:
   `"enforce": { "point": "tool-call", "match": { "tool": "bash", "pattern": "git push .*(--force|-f)\\b" }, "verdict": "DENY" }`
   `check-policy-manifests.mjs` validates its shape (point in range, pattern compiles, verdict in range) the same way it validates everything else. Rules without `enforce` stay watched by gates / golden tasks / review — most of the 188 are judgment rules and MUST NOT be forced into matchers.
3. **Thin per-harness adapters, harness-free core.** Adapters (~30 lines each): a PreToolUse-style hook (the existing point-solution hooks in consuming repos — e.g. ViTo's CRM-vocabulary hook — are exactly what this generalizes) + a CLI wrapper mode. The core is tested without any harness (same L1 fire-test pattern as golden-tasks/gate).
4. **The golden battery is the engine's effectiveness test** (the instrument loop closing): the same trap run with the engine active must move from *"the agent resisted"* to *"the system made it physically impossible"* (DENY before the side effect). Comparative run recorded in comms.
5. **House verification pattern:** co-located test with known-bads (forbidden action → DENY · ASK withholds writes · a throwing policy → DENY fail-closed · the static floor never dissolves) + gate-integrity covers it automatically + versions.json entry.

## Slices (one PR each, house pattern: co-located tests, fire-test L1, one-pass CI)

| Slice | Content | Visible outcome |
|---|---|---|
| **S1** | Core engine + `enforce` schema field (+ gate validation) + 2 DENY policies fed by EXISTING manifests (force-push GIT §4/§7 · invented-port PORT §3) | The force-push golden trap becomes impossible, not just resisted |
| **S2** | ASK with write-withholding + session state (per-session JSON: counters, risk score, cost) + the hook adapter | Contextual decisions (budgets, accumulated risk) |
| **S3** | Engine counters as JSONL with **OTLP-compatible field naming** (seeds roadmap item 6, telemetry) + first heir fire-test (ViTo generalizes its point-solution hooks into policies) | Real data to tune warn→block |

## Adoption position (asked and answered with the chief architect, this session)

**Pocket rule: adopt what runs BESIDE you (binaries, services, forges, harnesses); extract the pattern from anything that wants to live INSIDE your governance.** Grounded in `CANON-UPSTREAM-PROTOCOL` §5 (extract-pattern default; burden of proof on adopt) and the D-009 omnigent precedent.

- **LangGraph / LangChain: NO for the governance plane** — they build agent *applications*; our problem is governing agents on third-party harnesses. Wrong altitude. A product repo may evaluate them for product features via the §3 adoption protocol (sponsor intake §16, ADR before code) — never into the kit.
- **OPA / Rego: extract + DECLARE THE MAPPING, don't adopt.** The recognized policy-as-code standard; our contract already matches its model (composable ALLOW/DENY, fail-closed). S1's reference doc MUST include a short "semantic mapping to OPA" section (our ALLOW/DENY ≈ OPA allow; our ASK+withhold and session state are the extensions) so a future swap stays possible — bind-to-standards discipline. Not adopted now: Go binary + Rego for a ~300-line Node need, and no native ASK/session-state.
- **Inspect / promptfoo (evals): already extracted** — the golden battery is that pattern; adopting one would be the second-framework anti-pattern (`CANON-CONTEXT-HYGIENE` §6.2, the gentle-ai lesson).
- **OpenTelemetry: YES as format binding** (S3): field names OTLP-compatible from day one; no vendor, no dependency required.

## Do NOT

Redesign the sealed contract · adopt omnigent/LangGraph into the kit · force `enforce` onto judgment rules · gate on vendor model ids · let the engine weaken the static deny floor · put the engine on the doctor board (runtime, not board).

## Queue behind this front (unchanged owners)

- **P-1** (chief architect decision): 5 in-force canons with `approved`/`CANON` status tokens are invisible to the manifest frontier (incl. `CANON-DEVELOPMENT-PROCESS`) — normalize statuses or extend frontier tokens, then manifest them.
- `ANTHROPIC_API_KEY` secret in the kit repo (enables one-click live golden battery).
- Reference §5.2 first-consumption fire-test of a manifest (can be S1's natural by-product: the engine consuming `enforce` IS the first machine consumption — record it).
- Roadmap items 4-7 stay opportunistic behind this.
