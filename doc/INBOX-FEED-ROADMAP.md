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
| 3a | `tools/comms-send.mjs` — governed send path: secret scan, create-only comm write, commit + push, repo field, and fail-closed governance fields for task/review/audit (`target_layer`, `ref_branch`, `Recipient Self-Check`) | via `npm run check` + dry-run probes |
| 3b | `tools/comms-sync.mjs` — pull origin, show recipient inbox, and warn about local-only comms / unpushed work on this machine | via dogfood |
| 4 | `tools/inbox.config.json` — per-repo `lanePath` + known agent tokens (engines fall back to defaults when absent) | — |

Pure Node, no deps, core logic exported + unit-tested. Engines are vendor-neutral
(canonical home = this kit). Run: `node tools/inbox.test.mjs && node tools/feed.test.mjs`.

## Next — in logical order

3. **Field lint (advisory + targeted hardening).** Keep the current fail-closed
   governance checks in `comms-send`, then add focused hardening only where pain
   was observed:
   - warn on `TASK-*` docs that have no dispatched comm;
   - audit routing fields beyond manual inspection;
   - strengthen `Recipient Self-Check` validation so an empty heading cannot pass;
   - preserve all-caps acronyms in `comms-send` commit subjects (`PR`, `ADR`).
   Tracked in issue #23.
4. ~~**Per-repo config.**~~ ✅ Done — `tools/inbox.config.json` declares `lanePath`
   + known agent tokens; engines fall back to defaults + `--lane` when absent.
5. **Activation = wiring + seed.** Copy the engines + config into each consuming
   repo and wire a `SessionStart` hook per agent so the inbox surfaces
   automatically at session start. This is the payoff: each agent arrives knowing
   its open items; the human watches the feed and keeps the interrupt — but is no
   longer the router.

## Bigger roadmap (queued, separate efforts)

- **Governance enforcement hardening.** Follow-up issue #23 tracks the remaining
  non-blocking notes from PR #21: decision-capture check, dispatch/routing lint,
  Self-Check content validation, and commit-subject acronym preservation. Build
  only when the manual gap hurts or as a focused enforcement slice.
- **Agents-off hygiene window** — the safe execution moment for reaping paused
  work. See `doc/decisions/ADR-20260522-paused-work-lifecycle.md`.

## References

- `knowledge/ai-agents/CANON-MULTI-AGENT-ORCHESTRATION.md` (the model)
- `knowledge/architecture/CANON-DECISION-DISPOSITION-FOR-GRAPH-INDEXING.md`
- `doc/decisions/ADR-20260522-paused-work-lifecycle.md`
- GitHub issue #23 — follow-up enforcement notes from PR #21
