# SPIKE - KDD Knowledge Packs as OKF-compatible bundles

**From:** Codex dev-kit session, 2026-07-02
**To:** Fable or Opus independent reviewer, then Marcelo for direction
**Status:** proposal / spike output only. Not sealed law. Do not amend KDD templates,
checks, or canon from this document without review.
**Question:** Can KDD Knowledge Packs expose an OKF-compatible surface without weakening
KDD authority, validation, or freshness?

## Verdict

**Recommended: run a small compatibility spike.**

**Reviewer status:** Opus returned `APPROVE WITH FIXES` in
`docs/ai-coordination/comms/2026-07-02-REVIEW-ADVERSARIAL-KDD-OKF-COMPATIBILITY-OPUS.md`.
This spike document has been updated to incorporate the five required fixes before any
sample pack, template, checker, or canon change.

OKF and KDD are not competing layers. OKF is a portable knowledge format: Markdown
concept files, YAML frontmatter, `index.md`, `log.md`, and markdown links. KDD is a
governance method: accepted knowledge, human validation, retrieval adapters, freshness
manifests, and a required `Knowledge Baseline` before product-shaping work.

Adopt the OKF shape only as an **interoperability skin** over KDD Knowledge Packs.
Do not replace KDD's lifecycle, validator, source-of-truth rule, or freshness gates.

## Preflight Against Canon

Checked:

- `knowledge/methodology/CANON-KNOWLEDGE-NATIVE-VT-METHOD-001.md`
- `knowledge/methodology/VT-METHOD.md`
- `setup/templates/knowledge-pack/README.md`
- `tools/check-knowledge-pack.mjs`
- `tools/check-knowledge-memory-freshness.mjs`

Conclusion:

- The proposal is compatible if OKF remains a format/export/profile.
- The proposal is not compatible if OKF becomes the authority layer.
- A conformant OKF bundle may be `raw-input`, `candidate`, or `accepted`; only KDD
  status and validation decide whether it can govern product work.

## Source Check

Primary sources reviewed:

- OKF spec: <https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md>
- Google Cloud OKF blog: <https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing>
- Karpathy LLM wiki gist: <https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f>
- Cole Medin OKF bundle: <https://github.com/coleam00/cole-medin-ai-coding>

Relevant OKF facts:

- OKF v0.1 is draft.
- A bundle is a directory tree of Markdown files.
- Concept documents have YAML frontmatter and body content.
- Only `type` is required for concept frontmatter.
- `title`, `description`, `resource`, `tags`, and `timestamp` are recommended.
- `index.md` supports progressive disclosure.
- `log.md` is optional chronological history.
- Consumers should tolerate unknown fields and broken links.

## KDD to OKF Mapping

| KDD artifact | OKF role | Proposed `type` | Notes |
|---|---|---|---|
| `PACK-METADATA.md` | bundle metadata concept | `kdd-pack-metadata` | Keeps `status`, `validator`, `validated_at`, `knowledge_memory_adapter`, `source_of_truth`. |
| `BUSINESS-CONTEXT.md` | concept document | `kdd-business-context` | Domain/business claims; must cite sources. |
| `PRODUCT-CONTEXT.md` | concept document | `kdd-product-context` | Product identity and user promise. |
| `DOMAIN-VOCABULARY.md` | concept document | `kdd-domain-vocabulary` | Terms, aliases, forbidden names. |
| `OPERATING-RULES.md` | concept document | `kdd-operating-rules` | Invariants and policy constraints. |
| `DECISION-LINKS.md` | concept document | `kdd-decision-links` | Links to ADR/canon/spec records. |
| `WORKED-SCENARIOS.md` | concept document | `kdd-worked-scenarios` | Happy, exception, edge, longitudinal scenarios. |
| `ANTI-EXAMPLES.md` | concept document | `kdd-anti-examples` | Tempting wrong paths and why they fail. |
| `OPEN-QUESTIONS.md` | concept document | `kdd-open-questions` | Owner/status remains mandatory by KDD. |
| `SOURCES.md` | concept document | `kdd-sources` | Provenance. Raw sources remain evidence, not authority. |
| generated `index.md` | OKF index / derived surface | reserved filename | Lists pack sections. Generated OKF surface, not accepted source. |
| generated `log.md` | OKF update history / derived surface | reserved filename | Optional. Must not be fingerprinted as accepted source if it churns with refresh events. |

## Minimal Frontmatter Profile

`PACK-METADATA.md` remains the single source for pack authority:

```yaml
---
type: kdd-pack-metadata
title: Pack Metadata
description: Pack identity, lifecycle status, validation record, and retrieval contract.
tags: [kdd, knowledge-pack, metadata]
timestamp: YYYY-MM-DD
---
```

Inside its existing metadata block, the lifecycle status must remain the full KDD enum:

```yaml
status: raw-input # raw-input | candidate | accepted | superseded | rejected
```

Every other non-reserved KDD concept file can carry only concept-level OKF metadata:

```yaml
---
type: kdd-business-context
title: Business Context
description: One-line summary of what this artifact contributes to the pack.
tags: [kdd, business-context]
timestamp: YYYY-MM-DD
---
```

Pack-level authority fields (`kdd_pack_id`, `kdd_pack_version`, `kdd_status`,
`kdd_source_of_truth`, validator, acceptance record) must not be stamped onto every
concept file. They live once in `PACK-METADATA.md`, where KDD already keeps the
validator and acceptance record. Per-concept frontmatter is descriptive only.

If the sample uses a bundle-root `index.md`, declare OKF version once there:

```yaml
---
okf_version: "0.1"
title: <Pack title>
description: <One-line pack summary>
---
```

Links in the sample must use relative paths such as `./PACK-METADATA.md` or
`PACK-METADATA.md`. Do not use OKF `/`-absolute links in the spike because the current
KDD pack gate resolves those as filesystem-absolute paths, not bundle-root-relative paths.

## Spike Shape

Do this in one isolated sample pack, not globally:

1. Use an existing external OKF bundle, preferably Cole Medin's bundle or one Google
   sample bundle, as an import fixture. Treat it as `raw-input`, not accepted knowledge.
2. Create or copy one small candidate KDD Knowledge Pack under a scratch path in a
   consumer repo or fixture directory.
3. Add the corrected OKF frontmatter profile to each required KDD artifact.
4. Generate a root `index.md` that lists the pack artifacts with one-line descriptions
   and uses relative links only.
5. Keep generated OKF surfaces (`index.md`, `log.md`, visualizer output) out of the
   accepted-source fingerprint. They are derived artifacts, not accepted sources.
6. Use Google's static OKF visualizer, if available in the local test setup, as one
   generic OKF consumer. Also ask a fresh agent to consume the pack directly.
7. Run `check-knowledge-pack.mjs`; it must stay GREEN or fail only for pre-existing
   KDD issues.
8. Run `check-knowledge-memory-freshness.mjs` if the fixture declares derived indexes.
9. Ask a fresh agent to consume the sample as OKF and answer:
   - What is this pack about?
   - What facts are accepted vs open?
   - What source proves each load-bearing claim?
   - Is this pack allowed to govern a product-shaping feature?

Success criteria:

- A generic OKF-aware agent can navigate the pack through `index.md`, frontmatter,
  and links.
- A KDD-aware agent still treats KDD metadata as authority.
- No OKF rule implies that raw imported content is accepted knowledge.
- Unknown OKF fields do not break existing KDD checks.
- Imported external OKF bundles can be represented as `raw-input` without status inflation.
- Generated OKF surfaces do not self-invalidate KDD memory freshness.
- The source-of-truth statement remains: accepted Markdown Knowledge Pack, not graph,
  memory, embeddings, search, or imported bundle.

## Risks

| Risk | Severity | Control |
|---|---:|---|
| Agents mistake OKF conformance for KDD acceptance | High | Single-source authority in `PACK-METADATA.md`; reviewer must test that concept frontmatter alone never implies acceptance. |
| Imported OKF bundle is inflated from raw evidence to candidate knowledge | High | Full KDD lifecycle enum includes `raw-input`; external bundles enter as `raw-input` unless reconstructed for review. |
| We duplicate pack structure with OKF taxonomy | Medium | Keep KDD file roles unchanged; OKF is frontmatter + index only. |
| OKF `/`-absolute links break KDD reference checks | Medium | Use relative links in the compatibility profile unless the checker later gains bundle-root semantics. |
| Generated `index.md` / `log.md` churn invalidates freshness | High | Treat generated OKF surfaces as derived artifacts and keep them out of accepted-source fingerprints. |
| `index.md` drifts from files | Medium | Generate it mechanically later if adopted; for the spike, drift is acceptable evidence. |
| OKF v0.1 changes | Low | Treat as compatibility profile, not canon dependency. |
| The kit becomes a content catalog | High | Keep product/domain packs in L3; DevKit only defines method/profile. |

## Adoption Path If Validated

If Fable/Opus approves the spike direction:

1. Add an optional `okfCompatibility` section to the knowledge-pack template README.
2. Add optional frontmatter examples to template files.
3. Add a small generator/checker only if manual `index.md` drift becomes real or if
   generated OKF surfaces need explicit freshness exclusions.
4. Add a note to `CANON-KNOWLEDGE-NATIVE-VT-METHOD-001` saying OKF can be an exchange
   surface, but never the authority layer.
5. Consider an import rule: external OKF bundles enter as `raw-input` or `candidate`
   until reconstructed and validated as KDD.

If the reviewer rejects it:

- Keep KDD as-is.
- Preserve this document as prior-art evidence.
- Revisit only if a real cross-agent sharing case requires it.

## Validation Prompt For Fable Or Opus

Review this spike adversarially.

Scope:

- `docs/ai-coordination/comms/2026-07-02-SPIKE-KDD-OKF-COMPATIBILITY.md`
- `knowledge/methodology/CANON-KNOWLEDGE-NATIVE-VT-METHOD-001.md`
- `knowledge/methodology/VT-METHOD.md`
- `setup/templates/knowledge-pack/README.md`
- `tools/check-knowledge-pack.mjs`
- `tools/check-knowledge-memory-freshness.mjs`
- OKF spec: <https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md>

Required verdict:

- APPROVE
- APPROVE WITH FIXES
- REQUEST CHANGES
- REJECT

Questions to answer:

1. Does the proposal preserve KDD's authority model?
2. Does any field or naming choice blur `raw-input`, `candidate`, and `accepted`?
3. Does OKF frontmatter conflict with existing KDD templates or checks?
4. Is the proposed mapping too heavy, too light, or correctly minimal?
5. What exact fix is required before changing templates or canon?

File the review in `docs/ai-coordination/comms/` before acting on it.
