# DELIVERY — KDD shared verified artifact cache for Git worktrees

**From:** KDD tooling implementation
**To:** DevKit reviewer and consuming-repo maintainers
**Status:** implementation delivery; no canon amendment

## Verdict

The KDD freshness gate remains fail-closed, while a clean Git worktree can now recover a
missing derived index without re-running its semantic engine when an exact verified copy
already exists in the repository's shared Git directory.

## Contract

- Opt in with `artifactCache.mode: git-common-dir`.
- `kdd-refresh` hashes every declared artifact and stores only the exact verified bytes
  under Git's common directory, keyed by SHA-256.
- The freshness check restores a missing worktree-local artifact only when the cache bytes
  match the SHA-256 recorded in the versioned manifest.
- A missing, corrupt, or unavailable cache never passes the gate.
- Versioned Markdown remains the source of truth; the cache is local derived evidence.
- `graphify-out`, `engram-out`, and `.engram` directories are excluded from accepted-source
  traversal so a derived index cannot recursively become source knowledge.

## Evidence

- `node tools/check-knowledge-memory-freshness.test.mjs` — 17/17 PASS.
- `node tools/kdd-refresh.test.mjs` — 6/6 PASS.
- `node tools/check-tool-versions.mjs` — GREEN.
- Consumer fire-test in a clean linked worktree:
  - accepted sources: 10;
  - source fingerprint: `0f13f9dfd63437a76e65d81ec06d5d06371e81f95d7dda03b75d142eb321869e`;
  - generated graph SHA-256: `d8002520547083572ab8f9aab6a9405111a7229e8a04cfcac52c46e53e66de58`;
  - local graph removed after cache population;
  - freshness check restored the exact hash from the shared cache and returned GREEN.

## Adoption

Consuming repositories must add the opt-in config and refresh their manifest once with
the verified artifact present. This delivery does not commit derived graph output and does
not weaken required-index freshness.
