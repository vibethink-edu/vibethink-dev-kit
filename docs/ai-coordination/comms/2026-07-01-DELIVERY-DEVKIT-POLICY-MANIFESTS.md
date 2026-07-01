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
