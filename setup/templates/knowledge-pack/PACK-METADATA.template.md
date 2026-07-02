# Pack Metadata

```yaml
id: <knowledge-pack-id>
version: 0.1
status: candidate # raw-input | candidate | accepted | superseded | rejected
scope: <business/product/domain scope>
created: YYYY-MM-DD
updated: YYYY-MM-DD
validator: <human/principal or pending>
validated_at: <YYYY-MM-DD or pending>
supersedes: <pack id/version or none>
freshness: <review cadence or trigger>
revalidation_due: <YYYY-MM-DD / release boundary / pending>
pivot_pending: false # computed health input; not a status value
knowledge_memory_adapter: <declared adapter name/profile>
retrieved_via: <engram/graphify/markdown-only/other L3 binding>
source_of_truth: versioned-markdown
```

## Summary

<One paragraph: what this pack lets a new agent understand.>

## Acceptance Record

- Validator:
- Decision:
- Evidence:
- Remaining open questions:

## Use Before

List the feature/spec classes that must cite this pack.

## Retrieval Contract

- Knowledge Memory Adapter:
- Active engines:
- Freshness check:
- Stale/unavailable behavior: RED/WARN local health; do not silently proceed.
