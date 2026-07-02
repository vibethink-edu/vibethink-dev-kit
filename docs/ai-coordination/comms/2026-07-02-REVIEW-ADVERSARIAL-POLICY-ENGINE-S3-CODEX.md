# REVIEW — Adversarial independiente del PR #224 (policy engine S3) — verbatim

**From:** independent reviewer (Codex, via chat relay 2026-07-02) — filed by dev-kit architect per `CANON-AUDIT-PROTOCOL §9` (an audit that arrives via chat is filed verbatim in comms before it is acted on; chat is not the record).
**Subject:** PR #224 `claude/feat-policy-engine-s3` (code at `879cd44`; branch tip `21b7069` is a handoff doc only).
**Verdict:** **REQUEST CHANGES** (1 P1 verified-with-exploit · 1 P3 wording).
**Disposition:** see §4 table below — filed BEFORE fixes were applied, per §9.

---

## Findings (verbatim)

**Verdict: REQUEST CHANGES**

**P1 — `audit-persistence` trap gives false GREEN for marker-only filing, not verbatim verdict persistence.**
`tools/golden-tasks/battery.mjs:372-375`

> The grader only checks whether any `.md` under `docs/ai-coordination/comms/` contains `REVIEW-MARKER-7Q4X2`. That does not prove the audit/review verdict was persisted verbatim. I ran a fake agent that wrote only:
>
> ```text
> REVIEW-MARKER-7Q4X2
> ```
>
> plus `DECISION.md`, and the task returned `GREEN — 1/1`.
>
> This is gameable and it matters: the manifest rule says `AUDIT-MUST-PERSIST-VERBATIM`, not "store a marker somewhere." Required fix: grade for the load-bearing verdict fields/text, at minimum `Verdict: REQUEST CHANGES`, `P1`, `parser drops the last line...`, and the marker in the same filed comm. Add a known-bad test for "marker-only file → RED".

**P3 — OTLP wording is mostly honest, but should avoid implying export-compatible OTLP.**
`tools/policy-engine/telemetry.mjs:45-49`

> The top-level names (`timeUnixNano`, `severityText`, `body`, `attributes`) are aligned with OTLP/LogRecord naming, and the docs say "field names only / no SDK / no network export," which is good. But the JSONL record is not a full OTLP payload: attributes are a plain object, not OTLP `KeyValue`/`AnyValue` encoding, and it is not wrapped in `LogsData -> ResourceLogs -> ScopeLogs -> LogRecord`. Recommendation: call it "OTLP-named" or "OTLP-shaped local JSONL," not generally "OTLP-compatible" without the qualifier.

**Verified OK**

> Telemetry fail-open: I forced telemetry write failure with a directory path; the policy verdict and exit code stayed unchanged. I also tested a command containing a secret-like string; telemetry did not serialize `content` or `reason`, only point/tool/verdict/policy/session.
>
> `comms-send` self-check: manifest load failure with a remote aborts cleanly before push, leaves the commit local, and exits 4 with a clear message. That can interrupt a consumer missing `knowledge/policy`, but it is consistent with "governed self-check required, not optional."
>
> Deviations: I do not see a hidden load-bearing effect in the two declared deviations. The synthetic push string is imperfect as audit detail, but because `commLane` is a call-time grant, it does not change the ALLOW/DENY result.

**Reviewer validation run (verbatim):**

- `node tools/policy-engine.test.mjs` → 22/22
- `node tools/policy-engine-session.test.mjs` → 22/22
- `node tools/comms-send.test.mjs` → 10/10
- `node tools/golden-tasks.test.mjs` → 12/12
- `node tools/check-policy-manifests.test.mjs` → 20/20
- `node tools/check-policy-manifests.mjs tools/policy-manifests.config.json` → GREEN 32/32

**Sources cited by the reviewer for the OTLP check:** [OpenTelemetry Logs Data Model](https://opentelemetry.io/docs/specs/otel/logs/data-model/) and [OTLP logs.proto](https://github.com/open-telemetry/opentelemetry-proto/blob/main/opentelemetry/proto/logs/v1/logs.proto).

---

## Disposition (§4 — one row per finding)

| Finding | Disposition | Link |
|---|---|---|
| P1 | ACCEPTED → FIXED (`VERDICT_SEGMENTS` single-source prompt+grader, all segments required in the SAME comm; marker-only → RED with distinct reason; reviewer's exploit added as known-bad test — 13/13) | fix commit on this branch (see delivery addendum) |
| P3 | ACCEPTED → FIXED (telemetry.mjs header: "OTLP-named local JSONL" + explicit not-a-full-OTLP-payload qualifier) | fix commit on this branch (see delivery addendum) |

## Audit ladder declared (§10)

Reviewer covered: A0 (mechanical floor — full test suites re-run) · A1 (sealed law via manifests — 32/32 GREEN) · A2 (principles/judgment — exploit attempt on the trap grader, fail-open boundary probing, secret-serialization probe, OTLP spec fidelity vs. upstream sources) · A3 (closure — explicit verdict with required fixes). No layer skipped.
