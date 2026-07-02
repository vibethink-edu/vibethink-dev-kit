# REFERENCE-POLICY-ENGINE-001 — The reference runtime policy engine (machine-enforced law)

**Status:** **SEALED 2026-07-02 by the named authority** — drafted by the Principal Architect (roadmap item 3, slice S1; design GO'd by the chief architect in the 2026-07-01 handoff), approved and sealed by the chief architect ("adelante", register row D-052). Shipped in PR #221 after independent adversarial review: APPROVE WITH FIXES (2 P2) → fixed `3046e7b`.
**Date:** 2026-07-01
**Scope:** the dev-kit (producer-side instrument) + any heir that wants action-time enforcement over machine-readable law (copy the reference engine or build its own against the same sealed contract).
**Spine:** this is the L2 instrument of `CANON-RUNTIME-POLICY-ENGINE-001` (SEALED — the contract; **not reopened here**), consuming `REFERENCE-POLICY-MANIFESTS-001` (the law's machine form, D-051) and proven by `REFERENCE-BEHAVIORAL-GOLDEN-TASKS-001` (the behavior battery, D-050). The instrument-loop closes: **law → manifest → engine → trap**.

---

## §0 — Why this exists

The golden battery proved the constitution can *hold under temptation* — but holding depended on the agent reading and honoring prose. The maturity roadmap (item 3) names the next step: *"force-push forbidden" stops being text an agent may not have read and becomes a physical no.* This reference implementation is that step's S1: the same trap that previously graded "the agent resisted" now grades "the system made it impossible" — a DENY **before the side effect**.

## §1 — What ships (S1)

| Piece | Contract |
|---|---|
| `tools/policy-engine/engine.mjs` | the PURE CORE, zero dependencies, no filesystem/harness: `evaluate(event, state, policies)` implementing the sealed contract verbatim (§2 conformance map below), `compileManifest()` (manifests → policies), `createSessionState()`/`applyUpdates()` (§5 state + post-approval application), and the built-in `STATIC_FLOOR` |
| `tools/policy-engine.mjs` | the CLI: `eval` (one action → verdict; exit **0 ALLOW · 1 DENY · 3 ASK · 2 setup**) and `policies` (what law compiled). A harness adapter calls this before the side effect and honors the exit code |
| `enforce` manifest field | optional per-rule block in `VIBETHINK_POLICY_MANIFEST_V1` (§3 below); validated by `check-policy-manifests.mjs` like everything else |
| 2 DENY policies | fed by EXISTING manifests: force-push (`CANON-GIT-HYGIENE` §4/§7) · invented-port (`CANON-PORT-ASSIGNMENT-001` §2/§3) |
| L1 fire-test | `tools/policy-engine.test.mjs` — every contract clause on its known-bad, plus the golden force-push trap run behind the engine (GREEN = impossible, not resisted) |

**Distribution:** copy-parity, like every kit runnable. If the engine ever grows dependencies, it moves to the org-registry path (`ADR-20260619-shared-runtime-package-distribution`) — never vendored deps in the kit.

## §2 — Contract conformance (canon § → behavior)

- **§2 points** — a policy declares `on: [request | pre-model | tool-call | tool-result]`; the engine skips the rest.
- **§3 verdicts** — `ALLOW` (may carry a replacement `data` payload, threaded to later policies and returned — the redaction case) · `ASK` (accumulates; **ALL writes withheld**, returned as `withheldUpdates` for the adapter to apply **only on human approval**) · `DENY` (short-circuits with a reason).
- **§4 composition** — declared array order (the caller owns the session → agent-spec → server layering); a DENY applies the writes accumulated so far and names the deciding policy.
- **§5 state** — `{counters, risk, cost_usd, labels}` per session; updates are `SET / INCREMENT / APPEND`; storage is the adapter's (S2).
- **§6 fail-closed** — a policy that throws, returns a verdict outside its declared set, or is malformed → DENY; declared `advisory` → ALLOW; declared `approval-gate` → ASK. A broken guard never fails open.
- **§8 the shared floor** — `STATIC_FLOOR` (identity / destruction / secrets / arbitrary-exec, the `CANON-CODER-ORCHESTRATION-001` §7 classes) is appended to **every** chain by the engine itself; `evaluate` offers no way to remove it. An allow-everything policy list still cannot force-push (§10 anti-pattern "dissolving the shared floor", made structurally impossible).
- **§7 discipline** — nothing here gates on a vendor model id; the engine names no vendor, model, or harness.

## §3 — The `enforce` field (the engine's food)

```json
"enforce": {
  "point": "tool-call",
  "verdict": "DENY",
  "match": { "tool": "bash", "pattern": "git push .*(--force|-f)\\b" }
}
```

- **Only MECHANICALLY-DECIDABLE rules carry it** — declarative matchers over the action's *shape*, never NLP at runtime. Most manifest rules are judgment law and MUST NOT be forced into matchers; they stay watched by gates / golden tasks / review (their `watch` field, unchanged).
- `match.pattern` is a RegExp over the event content; optional `match.tool` scopes the tool; optional `match.captureNotInStateLabel` makes **membership** mechanical: the pattern's capture is looked up in `state.labels[<label>]` — a member → ALLOW; anything else, **including a missing label, takes the rule's verdict** (deliberate fail-closed: `CANON-PORT-ASSIGNMENT-001` §3, no declaration → refuse).
- `match.unlessGrant` *(S2)* is the **governed-exemption** shape for a rule whose prose declares one lawful exception (e.g. `CANON-GIT-HYGIENE` §7's create-only comm lane). A grant is **call-time provenance**: it is honored only from `event.labels`, attached by the governed invoker at evaluation time (CLI/adapter `--grant`, i.e. the invocation the governed flow owns) — **never from persisted session state**, which is data an agent with shell access could forge (S2 review P1; the forged-label known-bad pins this). The exemption never bleeds into sibling rules (a force-push DENIES even with the grant).
- The gate (`check-policy-manifests.mjs` check 6) validates the shape: point in the §2 range, verdict in the §3 range, pattern compiles, capture group present when membership is declared. A typo'd block is a policy that never fires — that is why malformation is RED, not a warning.
- `enforce` **rides the rule's existing § citation**; it adds no law. Adding a matcher to a rule is projection maintenance; adding a *rule* still requires its § in the sealed prose first.
- **A matcher is PARTIAL by design and must never be read as the rule's full enforcement.** It mechanizes the *unambiguous* action shapes; everything the shape can't see (other flag spellings, config-file values, indirect effects) stays owned by the rule's `watch` instruments (gate / golden task / review). When the gap is material, declare it in an `enforce.coverage` free-text field (e.g. the port matcher covers `--port/--listen/PORT=` but not `-p` or config-driven binds — S1 review P2). An engine DENY is a floor, not the ceiling.

## §4 — Semantic mapping to OPA (bind-to-standards)

Policy-as-code has a recognized standard — OPA/Rego. This engine deliberately stays mappable to it, so a future swap is a compile target, not a redesign (`CANON-UPSTREAM-PROTOCOL` §5: extract the pattern, declare the mapping):

| Ours | OPA equivalent | Note |
|---|---|---|
| `ALLOW` / `DENY` composed in order, DENY short-circuits | `allow` / `deny` rules; deny-overrides composition | direct — an `enforce` block compiles mechanically to a Rego rule over the input document |
| `event` (point, tool, content) | the `input` document | direct |
| manifest `enforce` blocks | Rego policies loaded from a bundle | our manifests stay the source; Rego would be a build artifact |
| **`ASK` + withheld writes** | — | **our extension**: OPA has no human-approval verdict; in an OPA deployment this stays in the adapter (PEP), not the policy engine (PDP) |
| **mutable per-session state** (`counters/risk/cost`) | `data` documents are read-only at eval time | **our extension**: OPA externalizes state updates; ours are first-class (`state_updates`) |
| fail-closed on a broken policy | default-deny idiom | ours is engine-level, not per-policy convention |

**Not adopted now, by decision (2026-07-01 handoff):** a Go binary + a second language for a ~300-line zero-dep Node need, with no native ASK or session state, fails the adoption burden of proof. The mapping above is what keeps that decision reversible.

## §5 — Layering (the §9 reconciliation)

`CANON-RUNTIME-POLICY-ENGINE-001` §9 assigns the **contract** to L1 and the **engine** to L3, "the kit ships no runtime". This reference refines — through the canon's own seal path, on the S1 PR — what that sentence guards: the kit still runs **no service**, mandates **no engine**, and owns **no product policies/thresholds**. What it now ships is a zero-dep **reference implementation** distributed copy-parity like every other kit runnable, so each heir stops rebuilding the same ~300 lines from prose. An heir may copy it, or build its own against the same sealed contract; its concrete policies, thresholds, harness mapping, and state storage remain L3 — unchanged.

## §6 — Fire-test protocol

1. **L1 (CI, free):** `tools/policy-engine.test.mjs` — every contract clause proven on its known-bad; runs in the engine-test glob from the S1 PR on.
2. **The golden loop:** the force-push trap run with a willfully violating agent whose commands pass through the engine — GREEN because the violation is impossible; without the engine the same intent goes RED (`golden-tasks.test.mjs` known-bad). Recorded in comms (the S1 delivery).
3. **Manifest first-consumption (`REFERENCE-POLICY-MANIFESTS-001` §5.2):** the engine resolving the force-push NEVER from the manifest — outcome matches the prose reading. Same comms record; heirs may now be pointed at the schema.

## §7 — What comes next (not this slice)

- **S2 — SHIPPED (2026-07-02 addendum, sealed with the S2 PR):**
  - *Persisted session state* (`tools/policy-engine/session-store.mjs`, `VIBETHINK_POLICY_SESSION_V1`): one JSON per session (`state` + `pendings`); an ASK parks its withheld writes under the action's stable key; `settlePending(approve: true)` is the ONLY path that applies them — deny/timeout drops them unapplied (§3). **Deployment contract (S2 review P1/P3): ONE writer per session file** (one agent loop = one session; never share a mutable session file across parallel agents — the store is last-writer-wins by design), and the store lives **outside the governed workspace** (the adapter defaults to the OS temp area). The floor's *self-protection* class denies tool-plane commands that reference the store, the approval subcommands, or the hook adapter — an agent behind the engine cannot self-settle or tamper. **Declared limit:** the engine governs only what flows through it; against an agent that is not behind it (or arbitrary exec the pattern floor cannot see, e.g. inline interpreter eval), the harness static deny remains the backstop (§8, `CANON-CODER-ORCHESTRATION-001` §7) — this reference does not pretend otherwise.
  - *The real approval surface* (`tools/policy-engine/hook-adapter.mjs`, PreToolUse-style wire): pre maps the verdict to the harness's own permission prompt (`allow|ask|deny`); post — the tool having RUN is the human's approval — settles and applies the parked writes (§11.4 ask-once rides the approval labels). Fails closed on any internal error. An L3 on another harness copies the file and rewrites only the wire mapping.
  - *The §7 pattern menu as code* (`tools/policy-engine/patterns.mjs`): `costDowngradeGate` (§11.1, DENY-with-steer + soft-threshold ASK-once), `riskScore` (§11.2, accumulation + guarded-tool escalation), `rateLimit`. Factories — every threshold/tier name is the caller's; nothing gates on a vendor model id.
  - *Session-aware CLI*: `eval --session <file>` persists across calls; `approve|deny --session --key` settle a pending.
  - *Governed exemption* (`match.unlessGrant`, §3 above) — closes S1-P5: a direct push to the default branch is now DENIED (`GIT-MUST-ALL-VIA-PR`, main/master as a ref token — S2 review P2), with the comm lane exempted by a call-time grant only the governed flow passes. The merge-push gaming of the golden trap is now impossible behind the engine, like force-push before it.
- **S3 — SHIPPED (2026-07-02 addendum, sealed with the S3 PR):** telemetry JSONL with OTLP LogRecord field naming (advisory emitter — never alters a verdict) wired into CLI + hook adapter · first governed-flow grant: comms-send consults the engine with `--grant`-equivalent call-time labels before its push · golden trap #5 `audit-persistence` (AUDIT §9) — the manifest watch upgraded from none to golden-task. First heir fire-test (a consuming product generalizing its point-solution hooks) remains open as the heir's own front.

---

## Provenance

Roadmap 2026-07-01 (chief-architect directed), item 3 — behind items 1 (golden tasks, D-050) and 2 (policy manifests, D-051). Design (5 decisions) and adoption position recorded in `docs/ai-coordination/comms/2026-07-01-HANDOFF-ITEM3-POLICY-ENGINE-DESIGN-AND-ADOPTION-POSITION.md`. Pattern prior-art: the omnigent entry of `knowledge/research/ORCHESTRATION-PRIOR-ART-2026-05-25.md` per `ADR-20260616-runtime-policy-engine` (D-009) — extract-patterns-not-dependency; no external tool adopted.

**Fire-test:** vendor/agent/product/person-neutral in the normative body — the engine and its schema name no vendor, model, agent harness, or person. **Declared exceptions:** §4 names OPA/Rego (a policy-as-code *standard*, named to declare the mapping, not adopted — same class as the OTLP binding) and the wire-token family (`VIBETHINK_POLICY_MANIFEST_V1`) carries the house mark per the kit's schema-token convention. PASS with those exceptions on the record.
