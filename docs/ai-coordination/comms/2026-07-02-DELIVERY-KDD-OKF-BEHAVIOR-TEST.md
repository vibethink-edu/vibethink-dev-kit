# DELIVERY - KDD/OKF behavior test

**From:** Codex dev-kit session, 2026-07-02
**To:** Marcelo / future DevKit reviewer
**Status:** behavior evidence. Not canon. Does not adopt OKF as template support.

## Question

Does an OKF bundle make an agent more context-aware without weakening KDD authority?

## Verdict

**Promising, but keep as guardrail / experiment.**

The OKF shape improved orientation and context selection. It did not create authority,
and it did not remove the need for KDD validation.

The useful split remains:

- OKF improves navigation: `index.md`, `type`, `title`, `tags`, related links.
- KDD decides authority: `raw-input`, `candidate`, `accepted`, validator, freshness.

## Fixture

External OKF bundle:

- <https://github.com/coleam00/cole-medin-ai-coding>
- HEAD checked during the test: `7ea6017be6916574ad0a733a4617ded67b1da209`

The bundle was cloned into a temporary directory outside DevKit and then treated as
external `raw-input`. No content was copied into DevKit.

## Test Question

What is Cole's main idea for getting reliable code from an AI coding assistant?

## OKF-Aware Path

Read path:

1. `README.md`
2. `index.md`
3. `concepts/index.md`
4. `python okf-cli.py find "reliable code AI coding assistant context engineering PIV validation"`
5. `concepts/context-engineering.md`
6. `concepts/the-piv-loop.md`
7. `videos/principled-agentic-engineer.md`
8. `videos/complete-guide-to-claude-code.md`

Observed answer:

Cole's reliable-code pattern is not "better prompting" alone. It is context engineering
plus disciplined execution:

- give the assistant curated context up front through PRP-style artifacts;
- keep the human responsible for planning and validation;
- use the PIV loop: Plan -> Implement -> Validate;
- separate planning and implementation sessions;
- require tests, linting, type-checking, and review;
- evolve reusable rules/commands/skills over time.

Important KDD status: this is `raw-input` external reference knowledge, not an accepted
VibeThink baseline.

## Plain Search Path

Command:

```text
rg -n -i "reliable|repeatable|context engineering|PIV loop|Plan|Validate|validation" --glob "*.md" --glob "!README.md" --glob "!index.md" .
```

Observed behavior:

- Search did find the relevant concepts and videos.
- It also returned a broader mixed set across concepts, videos, and `log.md`.
- The agent still needed to infer the navigation order.
- Without OKF indices/frontmatter, there was no explicit "start here" path or concept/video
  separation beyond filenames and matches.

## Result

OKF improved context selection by giving the agent a progressive-disclosure path:

```text
root index -> concept index -> concept pages -> source video pages
```

That is useful for agents because they can gather just enough context before answering,
instead of scanning the whole bundle or relying only on keyword hits.

## Guardrails Confirmed

- The bundle stays external `raw-input`.
- No external content becomes `accepted`.
- OKF frontmatter helps routing but does not confer authority.
- KDD freshness and validator semantics remain outside OKF.

## Recommendation

Keep OKF compatibility as an internal guardrail and continue to the next experiment only
after resolving the pending canon question:

> Are `lapsed` and `stale-by-pivot` persisted `status:` values or computed conditions?

If that is clarified, the next useful step is optional template support for descriptive
frontmatter and path-scoped generated-surface handling, still without making OKF mandatory.
