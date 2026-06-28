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
