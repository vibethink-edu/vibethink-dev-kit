# DELIVERY — policy-engine telemetry consumption lens (roadmap item 6, closes S3-P4)

- **From:** claude (Claude Code · Fable 5 · dev-kit seat, policy-engine front)
- **Date:** 2026-07-02
- **PR:** https://github.com/vibethink-edu/vibethink-dev-kit/pull/227 (`claude/feat-policy-telemetry-lens`)
- **Precedes:** S1 (#224 area), S2 (#226), S3 (telemetry emitter) — all merged; ViTo heir S2 PreToolUse hook LIVE (ViTo #4119).

## What shipped

`policy-engine report` — the reader for what S3 only emitted. Consumes the OTLP-named
JSONL (hook-adapter default session dir, or `--telemetry` repeatable) and reports:

1. **Verdict mix + window/freshness** — is the wire alive; is friction growing.
2. **DENY/ASK ranking by deciding rule** — which law generates friction (review candidates).
3. **Friction streaks** (≥ `--streak` consecutive DENYs, same session+rule) — an agent
   hitting a wall: over-match suspect OR a flow that needs a governed grant.
4. **Never-fired enforceable rules** (optional manifest cross) — deterrence or dead
   pattern; prove which with a known-bad (§8.7a), never assume.

## Posture

Advisory **lens, not a gate, never a second source of verdicts** — mirrors the emitter's
fail-open discipline. Exit 0 with or without data; corrupt lines counted (`N malformed`),
never fatal; exit 2 only for an explicitly named unreadable source.

## Evidence

- New suite **20/20** (known-bad: corrupt line · missing explicit source · broken
  `--streak` · interleaved sessions can neither fake nor hide a streak · end-of-log flush).
- Regression: `policy-engine.test.mjs` 22/22 · `policy-engine-session.test.mjs` 37/37 ·
  `devkit-doctor` all clear.
- **Ran over REAL live telemetry** (ViTo heir-S2 review probes, 5 records): mix
  `ALLOW 2 · DENY 3`, correct rule ranking, and the honest cross-repo view (kit manifests
  vs ViTo-emitted rule names) — the lens reports exactly the law you hand it.

## Next (not this slice)

- Heir wiring: ViTo runs `report` against its own manifests (`scripts/policy-engine/policies/`)
  — trivially available post-merge via copy-parity re-sync; its own front.
- Session-id fidelity: hook adapter records `session_id` per harness session; per-session
  analysis sharpens as real sessions emit (today's sample is probe-only, `default`).

## MENSAJE PARA REVIEWER (paste block)

> Review adversarial del PR #227 (dev-kit): telemetry consumption lens (`policy-engine report`,
> roadmap item 6, closes S3-P4). Foco sugerido: (1) ¿puede el lens convertirse en fuente de
> veredictos o punto de enforcement encubierto? (2) ¿el manejo de streaks resiste sesiones
> interleaved y logs corruptos? (3) ¿exit codes honestos (lens ≠ gate)? (4) fire-test de
> neutralidad. Precedente: S1 REQUEST-CHANGES→APPROVE (Codex), S2 3-rondas→APPROVE (Opus).
> Veredicto verbatim como comm en el kit antes de actuar (AUDIT §9).
