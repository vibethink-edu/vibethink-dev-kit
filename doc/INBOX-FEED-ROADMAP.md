# Inbox / Feed — build roadmap

Executable layer of `knowledge/ai-agents/CANON-MULTI-AGENT-ORCHESTRATION.md`.
Read-only views over the shared comms channel so the human stops being the
message bus. Resume here, in order.

## Routing fields the channel carries (front-matter)

`to_agent: <token>|any` · `status: open|closed` (missing = open) · `needs: human`
(present at a judgment gate) · plus `from`, `priority`, `re`, `date` (prose ok).

## Done

| Step | What | Tests |
|------|------|-------|
| 1 | `tools/inbox.mjs` — filtered view for one recipient (agent inbox = to_agent self/any + open; human inbox = needs:human + open) | 13/13 |
| 2 | `tools/feed.mjs` — chronological river of the whole channel (open AND closed) | 5/5 |

Pure Node, no deps, core logic exported + unit-tested. Engines are vendor-neutral
(canonical home = this kit). Run: `node tools/inbox.test.mjs && node tools/feed.test.mjs`.

## Next — in logical order

3. **Field lint (advisory).** A non-blocking check that warns when a comm lacks
   `to_agent`/`status`, or has `needs` without a recipient. Advisory only — it
   nudges the convention, never blocks. Ship with tests.
4. **Per-repo config.** `tools/inbox.config.json` declaring `lanePath` + the known
   agent tokens for a consuming repo. (The engines already fall back to
   `docs/ai-coordination/comms` and accept `--lane`.)
5. **Activation = wiring + seed.** Copy the engines + config into each consuming
   repo and wire a `SessionStart` hook per agent so the inbox surfaces
   automatically at session start. This is the payoff: each agent arrives knowing
   its open items; the human watches the feed and keeps the interrupt — but is no
   longer the router.

## Bigger roadmap (queued, separate efforts)

- **Protocol review of this kit** — is the cross-agent discipline right? (the
  layering, orchestration, and decision-disposition canons + the new
  paused-work ADR). Best done with a second architect's empirical review.
- **Agents-off hygiene window** — the safe execution moment for reaping paused
  work. See `doc/decisions/ADR-20260522-paused-work-lifecycle.md`.

## References

- `knowledge/ai-agents/CANON-MULTI-AGENT-ORCHESTRATION.md` (the model)
- `knowledge/architecture/CANON-DECISION-DISPOSITION-FOR-GRAPH-INDEXING.md`
- `doc/decisions/ADR-20260522-paused-work-lifecycle.md`
