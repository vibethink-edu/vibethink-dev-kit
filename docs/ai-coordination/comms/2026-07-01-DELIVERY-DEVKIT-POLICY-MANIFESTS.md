# DELIVERY — Policy manifests: machine-readable law (roadmap item 2)

**From:** dev-kit architect (Fable session, 2026-07-01)
**To:** the chief architect (seal decision) + kit maintainers
**Thread:** executes item 2 of `2026-07-01-ROADMAP-DEVKIT-NEXT-ADDITIONS-ARCHITECT-POSITION.md`, on Marcelo's GO, same day item 1 (behavioral golden-tasks) was merged, live-validated GREEN 4/4 and sealed (D-050).

## What shipped (one PR)

**Prose for humans, manifest for machines, one seal** — sealed canons now project their MUSTs/NEVERs into small machine-readable manifests, held faithful by a gate:

| Piece | File |
|---|---|
| 4 manifests (v1: the canons the golden battery already watches) | `knowledge/policy/canon-{git-hygiene,port-assignment-001,knowledge-native-vt-method-001,change-path-and-decision-classes-001}.policy.json` |
| The projection gate (shape · source · **status parity with prose** · § anchor per rule · watch refs real · coverage ratchet) | `tools/check-policy-manifests.mjs` (v1.0) |
| Config + heir example | `tools/policy-manifests.config.json` (+ `.example`) |
| Co-located test — every drift class demonstrated RED (§8.7a) + dogfood over the kit's own manifests | `tools/check-policy-manifests.test.mjs` (9/9) |
| Doctor board line + CI step | `devkit-doctor.mjs` (1.8→1.9) · `agent-context.yml` engine-tests job |
| The instrument reference (PROPOSED — pending seal) | `knowledge/methodology/REFERENCE-POLICY-MANIFESTS-001.md` |

**Contract highlights:** every rule cites the § it derives from — no § anchor = new law = refused (a manifest is a projection, never a second legislature) · `watch` names the instrument that watches each rule (gate / golden-task / declared-`none`-with-reason — unwatched is conscious, never silent) · **JSON not YAML** (declared deviation: zero-dep house, JSON-everywhere; the roadmap's YAML was illustrative) · coverage grows by **ratchet** (`requireFor` only ever grows; 28 sealed canons reported as open frontier, not failed).

## Verification

- Gate over the kit: **GREEN — 4/4 manifests faithful**, frontier 28 reported.
- `node tools/check-policy-manifests.test.mjs` → 9/9 (status drift, missing § anchor, dangling watch, silent unwatched, ratchet hole all RED; frontier stays GREEN; empty policyDir = setup error; dogfood pass).
- Gate bit on day one: it refused a manifest because `CANON-PORT-ASSIGNMENT-001`'s sealed H1 predates the `-00N` id convention — resolved by accepting id in title-or-filename instead of cosmetically rewriting sealed prose.

## Pending (explicitly)

1. **Seal decision** on `REFERENCE-POLICY-MANIFESTS-001` (PROPOSED → SEALED, chief architect).
2. **Frontier**: 28 sealed canons without manifests — land canon-by-canon into the ratchet (each new manifest reviewed against its prose), not in one rushed sweep.
3. Roadmap **item 3** (action-time ALLOW/ASK/DENY policy engine) now has its food: it consumes `rules[]`+`watch` from these manifests. Separate front, own decision.

---

## Addendum — adversarial review response (same day, REQUEST CHANGES → fixed)

An independent adversarial review (7 inline findings, verdict REQUEST CHANGES) — disposition:

| # | Finding | Disposition |
|---|---|---|
| 1 | P1 status parity by substring ("PROPOSED — not SEALED yet" passes as SEALED) | **ACCEPTED** — exact-token compare of the first word after `**Status:**`; the reviewer's exact case is now a known-bad test |
| 2 | P1 § cites unvalidated (§999 passes) | **ACCEPTED** — every cited § must anchor to a real heading (with/without the § glyph) or inline § reference; dangling-cite known-bad added; port-manifest cites corrected (§2.x were list items, not sections) |
| 3 | P1 ratchet has no memory (delete manifest + delist = silent regression) | **ACCEPTED (portable form)** — ratchet is now bidirectional (manifest ⇒ must be in requireFor), so shrinking always takes a visible two-file diff owned by PR review; full git-history memory rejected as forge-specific/non-portable — residual declared in the reference §3 |
| 4 | P1 watch.ref only proves file existence | **ACCEPTED** — a gate watcher must cite the canon id in its source; a golden-task watcher must declare the canon among the task's laws; known-bad added. The hardened check immediately caught findings 5-adjacent false watches (below) |
| 5 | P2 GIT-MUST-ALL-VIA-PR watcher overstates | **PARTIALLY REFUTED with evidence** — post-#216 the force-push trap grades BOTH arms (§4 rewrite AND §7 any direct landing on main; the `merge-push` known-bad proves the non-force direct push goes RED). Scope note added to the watch. **However** the same hardened watcher-check exposed that the two OTHER GIT watches (root-write, clean-start) pointed at session-hygiene-scan, which enforces MULTI-AGENT §2.2, not GIT-HYGIENE → both now `watch: none` with gap notes. The reviewer's class was right |
| 6 | P2 "synced" hardens §1 | **ACCEPTED** — dropped; cite extended to §4 for the in-progress-operation clause |
| 7 | P2 VIBETHINK_POLICY_MANIFEST_V1 vs neutrality claim | **PARTIALLY REFUTED** — the token follows the kit's established schema convention (VIBETHINK_CATALOG_SYNC_V1, VIBETHINK_TOOL_VERSIONS_V1); renaming the family is a separate decision. The real bug the reviewer caught — the fire-test line claiming unqualified neutrality — is fixed: the exception is now declared on the record |

Test: **13/13** (was 9/9; +4 known-bad born from the review). Second time in one day the review→regression-test growth rule pays.
