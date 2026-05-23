# Supra-repo validation review — 2026-05-22

**Status: BLOCKED** (second-architect empirical review). Do **not** seal a
validated close until the P1 findings below are fixed and the review is re-run.
The reviewer ran the tests + the smoke test + inbox/feed against a real comms lane
and found real false-greens. This is the validated-close gate working as designed.

## Must fix before seal

1. **inbox does not route real comms (routing field).** P1.
   The tool uses `to_agent`; the canon §5 table called it `to`; real comm files
   use a prose `to:` ("to: claude-dev (...)"). So `inbox <agent>` returns `[]` on
   the real lane. **Fix:** canonical normalized field = `to_agent` (a clean token,
   distinct from the prose `to:`); align the orchestration canon §5 + AGENTS_UNIVERSAL
   to `to_agent`; add a best-effort fallback that extracts a known agent token from
   the prose `to:`/`re` when `to_agent` is absent; add tests with real-shaped
   fixtures (`to: codex`, `to: Codex (...)`, `to_agent: claude`, `to: any`, `needs: human`).
   Share one normalizer between inbox and feed (today feed hides the bug via
   `to_agent ?? to`).

2. **Smoke #6 false-green on "no parallel constitution".** P1.
   The check scans only `knowledge/ai-agents/`. Other constitution-like files exist:
   `AGENTS_GOLDEN.md` (root) and `knowledge/capabilities/ai-agents/AGENTS.md`.
   **Fix:** broaden the scan to all tracked agent-pattern files repo-wide, with an
   explicit allowlist for templates/examples. **Also:** `AGENTS_GOLDEN.md` still
   contains product specifics (a voice-agent example, vendor names) at the root —
   move it to `setup/templates/` (it's a template, not authority).

3. **AGENTS_UNIVERSAL not fully vendor-neutral.** P1 (the kit claims Level-1
   neutrality). Still contains: stack/port names, an IDE/tool name, agent runtime
   names, and a database example. **Fix:** keep only agnostic rules in the universal
   authority; move stack/ports/tool-capability-detection/DB examples to an
   org/methodology layer or templates.

4. **Decision-disposition canon: stale text contradicts its own amendment.** P1.
   The intro/§2 still says the indexer extracts "inline decision comments"; the
   amendment says it does not. AGENTS_UNIVERSAL also says "ADR + inline markers" as
   indexable. **Fix:** rewrite those lines — Markdown/ADR = strong indexable binding;
   inline markers = advisory/human-readable until a dedicated extractor exists.

5. **Secret scan too weak to claim "no live secrets".** P2.
   Limited patterns (GitHub/OpenAI/Slack/AWS), limited extensions, tracked-only.
   **Fix:** lower the claim to "basic secret pattern scan", OR add patterns for the
   providers actually used + an opt-in `--include-untracked`. Do not oversell #7 as
   real security.

## Backlog (not blockers)
- inbox/feed tests don't cover real YAML (lists, multiline, BOM/CRLF, prose `to`,
  non-binary status like `ACTIVE`/`READY`). Add a fixture taken from the real lane.
- Smoke #2 (adapter = pointer) is a size+mention proxy; add a denylist of
  constitution headings (Tech Stack / Never Do / Critical Rules) to prove it's a pointer.
- Paused-work ADR is sound but still discipline-without-tool: needs the classifier
  + TTL + enforcement.
- Add CI that runs `check-agent-context` + the tests, or the norms stay written but
  not biting.

## Path to validated close
Fix P1 (1-4) + decide P2 (5) → re-run the tests + smoke + inbox/feed against the
real lane → re-request the Codex review → seal on GO.

Credit: empirical review by the Codex architect. Self-correcting multi-agent loop.
