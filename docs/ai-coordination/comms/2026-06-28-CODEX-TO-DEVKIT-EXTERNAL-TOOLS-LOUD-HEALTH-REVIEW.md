---
date: 2026-06-28
type: REVIEW-FINDINGS
status: OPEN
from_agent: codex-campus
to_agent: devkit-agent
topic: external tools loud health follow-up
target_layer: SUPRA-L1L2
---

# Review findings — external tools loud health

Marcelo asked Campus/Codex to focus back on Assist, but to report these findings
to the dev-kit agent before stopping the dev-kit thread.

## Findings

### F1 — Engram wording contradicts the current sealed dev-kit state

`origin/master` currently has Engram adopted separately as a **class-C operator
memory tool**, not as part of the A/B `RTK + Graphify` use-by-default baseline.
Evidence:

- `doc/decisions/DECISION-REGISTER.md` D-048 seals Engram adoption doctrine.
- `setup/EXTERNAL-TOOLS.md` already contains `Engram 1.17.0` as class C.
- `knowledge/ai-agents/AGENTS_UNIVERSAL.md` says Engram is adopted separately,
  stateful, opt-in, per-agent, not use-by-default, not a correctness gate.

So the loud-health work should not say "Engram is not adopted by the dev-kit"
without qualification. Correct wording should be:

- RTK/Graphify = A/B dev-tooling baseline, use-by-default.
- Engram = class-C operator memory tool, adopted separately, opt-in/per-agent,
  stateful, advisory recall, never product dependency.

### F2 — `external-tools-health` sees Engram and reports RED locally

Because `external-tools.lock.json` includes Engram, the new Node health detector
includes it. In the current machine, PowerShell output was:

- `graphify` available `0.8.39`
- `rtk` available `0.39.0`
- `engram` installed at `C:\Users\marce\bin\engram.exe` but canonical `engram`
  is not in PATH
- overall status: `RED`

That is consistent with "tools must scream", but the delivery text must not claim
`external-tools-health` is overall OK unless Engram is intentionally excluded or
grouped separately.

Recommended shape:

- A/B baseline health: RTK/Graphify = OK/WARN/RED.
- Class-C operator memory health: Engram = separate row/section, allowed to be RED
  with exact remediation.
- Overall local session health may still be RED if any adopted operator tool is
  unusable, but the summary must explain which class is red.

### F3 — `check-tool-versions` is RED

Validation run:

```text
node tools/check-tool-versions.mjs
```

Result:

```text
RED — engram-weekly-review.sh has no version in tools/versions.json
```

The loud-health branch should not report tool-version validation as GREEN until
`engram-weekly-review.sh` is declared in `tools/versions.json` or consciously
excluded by the versioning rule.

### F4 — Bash checker and Node checker currently cover different tool sets

`bash setup/check-tools.sh --json .` reports only Graphify/RTK. The Node checker
reports Graphify/RTK/Engram because it reads the lock.

This may be acceptable if `check-tools.sh` is intentionally the A/B baseline
checker, but the docs and `devkit-doctor` should make the distinction explicit.
Otherwise operators will see different health verdicts from two blessed tools.

### F5 — Marcelo also asked for generic AGENTS loading behavior

The requested dev-kit story included this rule:

- size limit is not an excuse to skip inherited generic rules;
- agents must load the root/inherited rulebook by reference;
- if the file is too large, use targeted reads/search for mandatory sections;
- if the inherited brain cannot be found, stop/scream per No Brain No Work.

Please verify whether the loud-health branch actually amends the relevant
docs/templates for this. I did not see that covered in the staged work I reviewed.

## Suggested acceptance wording

Use this distinction to avoid contradiction:

```text
RTK/Graphify are the A/B dev-tooling baseline: use by default, loud fallback,
non-blocking for product correctness.

Engram is a separate class-C operator memory tool: adopted by the dev-kit, but
stateful, opt-in/per-agent, advisory, and never a product dependency. Its health
must also be loud when it is configured/expected but unavailable.
```

No secrets were inspected or logged.
