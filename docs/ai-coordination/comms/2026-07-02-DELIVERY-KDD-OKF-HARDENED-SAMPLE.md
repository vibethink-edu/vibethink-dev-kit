# DELIVERY - KDD/OKF hardened sample gate

**From:** Codex dev-kit session, 2026-07-02
**To:** Marcelo / future DevKit reviewer
**Status:** delivery evidence. Not canon. Does not adopt OKF as law.

## Verdict

The OKF compatibility direction is now guarded by mechanical tests before any template
or canon adoption.

The sample is deliberately split:

- **Local deterministic fixture:** tests the KDD/OKF mechanics without network or copied
  external content.
- **Live external evidence:** Cole Medin's OKF bundle exists and resolves remotely, but its
  content is not copied into DevKit. It remains external `raw-input` unless reconstructed
  and validated.

## What Was Hardened

1. `raw-input` is now a valid Knowledge Pack status in `check-knowledge-pack.mjs`.
   External OKF bundles no longer need to be inflated to `candidate`.
2. OKF-compatible frontmatter is allowed when it is descriptive only.
   Authority still lives in `PACK-METADATA.md`.
3. Slash-absolute OKF bundle links, such as `/PACK-METADATA.md`, are a known-bad case
   for the current KDD reference gate. The compatibility profile uses relative links.
4. Generated OKF surfaces such as `index.md` and `log.md` can be excluded from the
   accepted-source fingerprint with `sourceExclusions`.
5. `sourceExclusions` is written into the freshness manifest. Changing it after refresh
   is RED, not silent.

## Evidence

Commands run:

```text
node tools/check-knowledge-pack.test.mjs
node tools/check-knowledge-memory-freshness.test.mjs
node tools/kdd-refresh.test.mjs
git ls-remote https://github.com/coleam00/cole-medin-ai-coding HEAD
```

Results:

```text
check-knowledge-pack: 12 passed, 0 failed
check-knowledge-memory-freshness: 10 passed, 0 failed
kdd-refresh: 6 passed, 0 failed
coleam00/cole-medin-ai-coding HEAD: 7ea6017be6916574ad0a733a4617ded67b1da209
```

The `kdd-refresh` test prints two `x`-style error lines for intentional known-bad cases:
missing config and failing refresh command. Those are expected negative tests; the suite
exits 0.

Primary external source checked:

- <https://github.com/coleam00/cole-medin-ai-coding>

Observed shape: OKF bundle with `index.md`, `log.md`, `videos/`, `concepts/`, and
`okf-cli.py`; the README describes it as read-only reference knowledge for agent
navigation. That is exactly the class KDD should treat as `raw-input` until validated.

## What This Does Not Prove

- It does not prove that OKF improves agent answer quality yet.
- It does not make the Cole bundle accepted knowledge.
- It does not authorize a canon amendment.
- It does not adopt OKF as required infrastructure.

## Next Decision

The next useful step is an agent behavior test:

1. Give a fresh agent the external OKF bundle as `raw-input`.
2. Give the same agent a KDD-style question.
3. Check whether it uses `index.md`, `type`, tags, and relative links to gather context
   without claiming the content is accepted.
4. Compare against a no-OKF/plain-doc navigation baseline.

Only if that behavior test shows better context selection should DevKit consider an
optional `okfCompatibility` section in the Knowledge Pack template.
