# HANDOFF — DevKit to WorkBench: consume Knowledge-Native VT-METHOD

Date: 2026-06-28
From: DevKit
To: WorkBench
Subject: Knowledge Packs as first-class work objects

## Canon to cite

WorkBench should cite:

> VT-METHOD is knowledge-native: product-shaping work starts from validated
> knowledge, not from isolated feature requests.

And:

> Product-shaping work may not start until the agent has retrieved and cited the
> Accepted Knowledge Baseline through the declared knowledge memory adapter.

And:

> Knowledge-Driven Design (KDD) sits underneath the rest of the product method.

Canonical homes:

- `knowledge/methodology/CANON-KNOWLEDGE-NATIVE-VT-METHOD-001.md`
- `knowledge/methodology/VT-METHOD.md`
- `setup/templates/knowledge-pack/`
- `setup/templates/knowledge-memory/`
- `tools/check-knowledge-pack.mjs`
- `tools/knowledge-pack.config.example.json`
- `tools/kdd-refresh.mjs`
- `tools/check-knowledge-memory-freshness.mjs`
- `tools/knowledge-memory.config.example.json`

## L3 adoption expected in WorkBench

WorkBench remains the L3 consumer. It should not become the canonical source of this
method; it should bind the DevKit contract to its own objects and UI/runtime.

If WorkBench discovers a reusable KDD gap, route it upstream:

```text
finding/handoff to DevKit -> DevKit canon/template/gate amendment -> WorkBench L3 adoption
```

Do not convert a generic KDD rule into WorkBench-local canon first. Temporary local
implementation is allowed only when labelled local/temporary and linked to the DevKit
handoff.

Represent an Accepted Knowledge Baseline as a consumable object on:

- project;
- goal;
- card/task;
- agent context;
- heartbeat context;
- coder/subagent launch context.

For any product-shaping or complex card, WorkBench should require a `Knowledge Baseline`
binding before execution. The binding should include:

- accepted pack id/version/path;
- declared Knowledge Memory Adapter;
- retrieval timestamp or freshness evidence;
- relevant scenarios/anti-examples;
- open questions that block or constrain execution.

## Adapter profile

VibeThink default:

- Engram: memory, facts, recall across sessions.
- Graphify: graph relationships, communities, semantic navigation.
- Versioned Markdown Knowledge Pack: auditable source of truth.

If Engram or Graphify are stale/unavailable, WorkBench should surface RED/WARN in local
session health. It must not silently continue as if retrieval succeeded. A markdown-only
fallback is valid only if the L3 adapter declares it and the feature cites that retrieval
path.

## Gate integration

Adopt `tools/check-knowledge-pack.mjs` with a WorkBench-local
`tools/knowledge-pack.config.json`.

Adopt `tools/check-knowledge-memory-freshness.mjs` with a WorkBench-local
`tools/knowledge-memory.config.json`. After refreshing Graphify/Engram/other declared
indexes, run `tools/kdd-refresh.mjs` to write the manifest. Session health should refuse
to treat stale derived memory as fresh context.

Minimum local/session checks:

- config declares `knowledgeMemoryAdapter`;
- accepted packs include required artifacts;
- accepted packs name validator;
- open questions have owner/status;
- product-shaping/complex feature docs/cards cite a baseline and adapter;
- KDD memory manifest fingerprint matches accepted sources;
- required Graphify/Engram artifacts exist and match the manifest;
- stale adapter indexes are reported loudly by WorkBench health.

## Boundary

Do not move Campus or any vertical-specific business knowledge into DevKit. Product
knowledge lives in each vertical's versioned Knowledge Packs. DevKit defines the method,
shape, and gate.
