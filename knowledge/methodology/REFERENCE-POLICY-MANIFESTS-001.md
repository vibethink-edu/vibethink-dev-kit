# REFERENCE-POLICY-MANIFESTS-001 — Machine-readable law (policy manifests)

**Status:** PROPOSED — drafted by the Principal Architect (2026-07-01, roadmap item 2); pending the chief architect's seal.
**Date:** 2026-07-01
**Scope:** the dev-kit (producer-side projections of its sealed canons) + any heir that maintains manifests over its own L3 law (same schema, own config).
**Spine:** companion instrument to `REFERENCE-BEHAVIORAL-GOLDEN-TASKS-001` (behavior) — this one makes the LAW itself machine-consumable. No canon principle is reopened; every manifest is a *projection* of prose already sealed.

---

## §0 — Why this exists

Two costs of prose-only law, both observed in the field:

1. **Interpretation drift.** Two agents reading the same canon extract different MUSTs ("different results" — the roadmap's words). The prose is authoritative but not deterministic to parse.
2. **Token cost.** An agent that needs one NEVER re-reads pages of rationale every session. The rationale is for humans (and for hard cases); the operative rule fits in a line.

The fix is the classic one: **prose for humans, manifest for machines, one seal.** And the prerequisite of roadmap item 3 (an action-time ALLOW/ASK/DENY policy engine) is exactly this artifact — an engine cannot consume prose.

## §1 — The manifest contract (`VIBETHINK_POLICY_MANIFEST_V1`)

One JSON file per canon in `knowledge/policy/<canon-slug>.policy.json`:

| Field | Contract |
|---|---|
| `id` / `source` | the canon's id and its prose file — the manifest's single source of authority |
| `status` | must match the prose `**Status:**` line (the parity check — a manifest never out-claims its prose) |
| `rules[]` | each: `id` (stable, greppable) · `level` `MUST`\|`NEVER` · `cite` (**the § of the prose it derives from — a rule with no § anchor is new law, not a projection, and is refused**) · `rule` (one operative sentence) · `watch` |
| `watch` | the instrument that watches the rule: `{kind:"gate", ref}` (a check-\* engine **whose source cites this canon** — existence alone is a false watch) · `{kind:"golden-task", ref, task}` (a battery trap **that declares this canon among its laws**) · `{kind:"none", note}` — **unwatched is a conscious declaration with a reason, never an omission** |

**JSON, not YAML — declared deviation from the roadmap's sketch:** the kit is zero-dep pure Node and JSON-everywhere (every `*.config.json`); Node has no stdlib YAML parser and a hand-rolled one is risk without benefit. The roadmap's "YAML" was illustrative; the contract is "small, structured, diff-able", which JSON satisfies.

## §2 — Derived, never legislative (the one-seal principle)

- **The prose is the law.** On any divergence, the canon wins and the manifest is the bug.
- **A manifest rides its canon's existing seal** — it is a projection, so adding one to a sealed canon is not an amendment. **Adding a rule that has no § to cite IS an amendment** → it goes through the canon's own seal path first, then the manifest projects it.
- **The gate makes divergence visible** (`check-policy-manifests.mjs`, on the doctor board and in CI): shape · source exists + id in title-or-filename · **status parity by exact token** (the first word after the prose `**Status:**` — a substring like *"PROPOSED — not SEALED yet"* can never satisfy `SEALED`) · **every cited § anchors to a real heading or § reference in the source** (a dangling cite = the section moved or the rule is new law) · **watchers declare their law** (a gate ref must cite the canon id in its source; a golden-task ref must list the canon among the task's laws) · bidirectional coverage ratchet (§3).
- Same structural anti-gaming as `CANON-DEVELOPMENT-PROCESS` §8.1: the projection cannot silently outrun the source because a machine checks the two against each other.

## §3 — Coverage: ratchet + frontier

Manifesting ~30 sealed canons in one sweep would produce theatre (rushed MUST extraction is exactly the drift this kills). Instead:

- `requireFor` in `tools/policy-manifests.config.json` is a **bidirectional ratchet**: a canon listed there MUST have a manifest, **and every manifest's canon MUST be listed there** — so a manifest can never exist un-ratcheted, and shrinking coverage always takes a visible two-file diff (delete the manifest AND edit the config), which PR review governance owns. *Honest residual:* the gate has no git-history memory (a base-branch comparison is forge-specific, non-portable); a reviewed two-file removal remains possible by authority decision — the same trust level as deleting any gate config.
- Sealed canons not yet manifested are **reported as the frontier** (a count in the GREEN verdict), not failed. New manifests land canon-by-canon, each reviewed against its prose, then join the ratchet.
- v1 ships the four canons the golden battery already watches (GIT-HYGIENE · PORT-ASSIGNMENT · KNOWLEDGE-NATIVE-VT-METHOD · CHANGE-PATH-AND-DECISION-CLASSES) — law, manifest, and behavioral trap aligned on the same four fronts.

## §4 — Consumption (who reads these)

- **Agents:** load the manifest for the operative MUSTs/NEVERs; open the prose when a rule needs its rationale or a hard case arises. The manifest is a *faithful index*, never a substitute authority.
- **The action-time policy engine (roadmap item 3):** consumes `rules[]` + `watch` at interception points — "force-push forbidden" stops being text an agent may not have read. That engine is NOT this reference; this ships its food.
- **Heirs:** same schema over their own L3 law, own `policy-manifests.config.json` (see the `.example`). The kit's manifests cover kit law only; heirs never edit them (inheritance contract: point, don't fork).

## §5 — Fire-test protocol

1. The gate's co-located test proves every drift class goes RED (status drift, missing § anchor, dangling watch, silent unwatched, ratchet hole) and the kit's own manifests pass (dogfood).
2. First consumption: an agent or engine reads a manifest instead of the prose for a routine MUST-check and the outcome matches the prose reading (record it in comms).
3. Only then do heirs get pointed at the schema for their L3 law.

---

## Provenance

Roadmap 2026-07-01 (chief-architect directed), item 2 — build front after item 1 (behavioral golden-tasks, sealed D-050 the same day). The four v1 manifests were derived by reading each canon's normative sections and citing them per rule; the gate refused the first draft once (a canon whose sealed title predates the `-00N` id convention) — the id check now accepts title-or-filename rather than cosmetically rewriting sealed prose.

**Fire-test:** vendor/agent/person-neutral in the normative body — names no vendor, agent harness, or person (roles only). **Declared exception:** the wire token `VIBETHINK_POLICY_MANIFEST_V1` carries the house mark, following the kit's established schema-token convention (`VIBETHINK_CATALOG_SYNC_V1`, `VIBETHINK_TOOL_VERSIONS_V1`); renaming that family is a separate decision, not this reference's. PASS with that exception on the record (raised by the PR #218 review).
