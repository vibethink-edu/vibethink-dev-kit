---
type: finding
from: opus
to_agent: any
to: any (any maintainer of the dev-kit / ViTo consuming the smoke engine)
repo: vibethink-dev-kit
project: vibethink-dev-kit
target_layer: SUPRA-L1L2
ref_branch: master
status: open
priority: normal
date: 2026-06-03
re: dev-kit adoption walk (ViTo PR #2909, 2026-06-03)
tldr: "ViTo's tools/check-agent-context.mjs copy is NOT byte-identical to the dev-kit upstream — need to determine: local patch (PR up) or kit drift (re-sync down)."
action: investigate
reversible: yes
on_no_reply: copies continue to drift silently until ADR-20260524 §3.1 parity-check CI lands (TASK #2734)
category: ARCHITECTURE
ref_doc: docs/DEV_KIT_INHERITANCE_STATUS.md (ViTo, D2)
ref_pr: vibethink-orchestrator-main#2909
---

# FINDING — check-agent-context.mjs hash drift (ViTo copy vs Dev-Kit upstream)

## What

During the dev-kit adoption walk for ViTo (orchestrator PR #2909), a hash
comparison detected that **ViTo's `tools/check-agent-context.mjs` is NOT
byte-identical to the dev-kit upstream** at `tools/check-agent-context.mjs`.

By contrast, ViTo's `tools/inbox.mjs` and `tools/feed.mjs` ARE
byte-identical — so the drift is specific to the smoke engine, not a
systemic copy problem.

## Where

- ViTo copy: `vibethink-orchestrator-main:tools/check-agent-context.mjs`
- Dev-Kit upstream: `vibethink-dev-kit:tools/check-agent-context.mjs`
- Audit reference: ViTo's `docs/DEV_KIT_INHERITANCE_STATUS.md` finding D2.

## Why this is worth investigating

The dev-kit ADR-20260524 §3.1 enforcement check (a CI parity gate) is
**not yet wired** (kit's own audit F4, owned by ViTo TASK #2734). Until it
is, every copied runnable can drift silently. This finding is one such
drift detected by manual inspection during the adoption walk — exactly the
kind of issue the parity gate would automate.

The drift may be one of three things, only one of which is benign:

1. **Local patch that should be PR'd upstream.** ViTo patched a bug or
   added a feature, never sent it up. **Fix:** identify the diff, raise it
   as a kit PR; re-sync ViTo after merge.
2. **Kit evolved, ViTo did not re-sync.** Kit shipped a new check (e.g.
   the Check 8 L1-neutrality added in PR #24, the secret-scan hardening,
   etc.) and ViTo is running an older engine. **Fix:** re-sync ViTo by
   copying the current upstream.
3. **Line-ending normalisation difference (CRLF/LF) only.** Unlikely on
   `.mjs` but possible. **Fix:** `git diff --stat -w` on a side-by-side
   compare; if zero, normalise.

## Suggested action

`INVESTIGATE`. Concrete steps for whoever picks this up:

```bash
# 1. side-by-side diff
diff "C:/IA Marcelo Labs/_vibethink-dev-kit/tools/check-agent-context.mjs" \
     "C:/IA Marcelo Labs/vibethink-orchestrator-main/tools/check-agent-context.mjs" | head -60

# 2. if line-endings only:
diff -w <same paths>            # if zero → CRLF only; re-copy with LF and move on

# 3. if real content delta → classify:
#    - new functionality / bugfix in ViTo → PR upstream
#    - missing functionality in ViTo → re-sync from upstream
```

## Why this is not blocked-on

ViTo's adoption walk PR (#2909) already documented this as D2 in
`DEV_KIT_INHERITANCE_STATUS.md` with an explicit "follow-up" note. The
status doc will be updated when D2 is resolved (the lookup will be obvious
in next walk if the resolution is not declared here).

## Related

- Kit's own audit F4 (parity-check CI not yet wired): `vibethink-dev-kit:doc/AUDIT-DEVKIT-CLEANUP-2026-06-03.md` F4.
- Kit's inheritance ADR §3.1: `vibethink-dev-kit:doc/decisions/ADR-20260524-supra-repo-inheritance-mechanism.md`.
- ViTo TASK that owns the parity-check CI: orchestrator TASK #2734.

— Opus