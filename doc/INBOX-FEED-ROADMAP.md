# Inbox / Feed — build roadmap

Executable layer of `knowledge/ai-agents/CANON-MULTI-AGENT-ORCHESTRATION.md`.
Read-only views over the shared comms channel so the human stops being the
message bus. Resume here, in order.

## Routing fields the channel carries (front-matter)

`to_agent: <token>|any` (canonical, machine-clean) · `status: open|closed`
(missing = open) · `needs: human` (present at a judgment gate) · plus `from`,
`priority`, `re`, `date` (prose ok). The human-readable `to:` prose and the
bold-label `**To**:` body header (the legacy real-lane shapes) still route via a
fallback that extracts a known agent token — see `CANON-MULTI-AGENT-ORCHESTRATION`
§5. New comms should set `to_agent`.

## Done

| Step | What | Tests |
|------|------|-------|
| 1 | `tools/inbox.mjs` — filtered view for one recipient (agent inbox = recipient self/any + open; human inbox = needs:human + open). Shared `normalizeRecipient` reads `to_agent`, falls back to a known token in the prose `to:` / `**To**:` body header | 32/32 |
| 2 | `tools/feed.mjs` — chronological river of the whole channel (open AND closed); reuses the shared normalizer | 6/6 |
| 4 | `tools/inbox.config.json` — per-repo `lanePath` + known agent tokens (engines fall back to defaults when absent) | — |

Pure Node, no deps, core logic exported + unit-tested. Engines are vendor-neutral
(canonical home = this kit). Run: `node tools/inbox.test.mjs && node tools/feed.test.mjs`.

## Next — in logical order

3. **Field lint (advisory).** A non-blocking check that warns when a comm lacks
   `to_agent`/`status`, or has `needs` without a recipient. Advisory only — it
   nudges the convention, never blocks. Ship with tests.
4. ~~**Per-repo config.**~~ ✅ Done — `tools/inbox.config.json` declares `lanePath`
   + known agent tokens; engines fall back to defaults + `--lane` when absent.
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
