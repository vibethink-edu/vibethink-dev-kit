# Knowledge Pack Template

> Instance of `CANON-KNOWLEDGE-NATIVE-VT-METHOD-001`.
> Copy this directory into a consuming repo's knowledge root for a product/domain scope.

## Purpose

A Knowledge Pack answers what an agent must understand before specifying
product-shaping work. It is not a feature spec and not a chat summary. It becomes an
Accepted Knowledge Baseline only after human/principal validation.

## Lifecycle

1. Create a candidate pack from declared sources.
2. Fill every required artifact.
3. Resolve or owner/status every open question.
4. Validate with the repo authority.
5. Mark `PACK-METADATA.md` as `status: accepted`.
6. Require future complex/product-shaping features to cite this pack in their
   `Knowledge Baseline` section, including the Knowledge Memory Adapter used to
   retrieve it.
7. Refresh the declared KDD memory indexes and write the freshness manifest with
   `tools/kdd-refresh.mjs`.

`lapsed` and `stale-by-pivot` are health conditions, not `status:` values. Keep
`status: accepted` for an accepted pack and let the repo's KDD status surface compute
whether the pack is lapsed or blocked by a declared business pivot.

Pack artifacts may carry descriptive frontmatter for agent navigation, such as
`type`, `title`, `description`, `tags`, or `timestamp`. Those fields are only
descriptive. They never confer authority, acceptance, validation, or freshness.
Lifecycle status, validator identity, acceptance evidence, and revalidation inputs
belong in `PACK-METADATA.md`.

## Required Files

- `PACK-METADATA.md`
- `BUSINESS-CONTEXT.md`
- `PRODUCT-CONTEXT.md`
- `DOMAIN-VOCABULARY.md`
- `OPERATING-RULES.md`
- `DECISION-LINKS.md`
- `WORKED-SCENARIOS.md`
- `ANTI-EXAMPLES.md`
- `OPEN-QUESTIONS.md`
- `SOURCES.md`

## Engine Boundary

Graph, memory, embedding, and search engines may index or help reconstruct this pack.
They do not replace validation. The accepted pack is the source of truth.

In VibeThink repos, the default adapter profile is Engram for memory/facts/recall,
Graphify for graph relationships/communities/semantic navigation, and versioned
Markdown as the auditable source of truth. Concrete health and freshness checks live
in the consuming repo's L3 config.

Use `setup/templates/knowledge-memory/` for the manifest-backed freshness check that
prevents agents from using stale graph/memory indexes after this pack changes.
