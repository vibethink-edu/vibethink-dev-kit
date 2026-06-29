# KDD Memory Freshness Template

Instance of `CANON-KNOWLEDGE-NATIVE-VT-METHOD-001`.

Use this template when a consuming repo has accepted Knowledge Packs and declared
Graphify, Engram, vector, search, or markdown-only memory adapters.

## Install

1. Copy `knowledge-memory.config.json` to `tools/knowledge-memory.config.json`.
2. Edit `sourceRoots`, `knowledgeMemoryAdapter`, and `indexes` for the consuming repo.
3. Refresh declared engines.
4. Run:

```bash
node <kit>/tools/kdd-refresh.mjs tools/knowledge-memory.config.json
node <kit>/tools/check-knowledge-memory-freshness.mjs tools/knowledge-memory.config.json
```

## Rule

The accepted Markdown Knowledge Pack is the auditable source of truth. Graphify,
Engram, vector stores, and search indexes are derived memory. If accepted knowledge
changes and the manifest is stale, local/session health must report RED/WARN before
agents use the old memory.
