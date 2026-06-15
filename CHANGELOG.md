# Changelog

## 2026-06-15

### Added

- **Governance + orchestration canons sealed** (from a vertical's elevation handoff),
  each registered as an ADOPT piece: **#34** `CANON-STATE-MIRROR-AND-DECISION-REGISTER-001`
  (present-mirror + append-only log + decision register, with a reusable L3 skeleton at
  `setup/templates/governance-instruments/`); **#35** `CANON-CODER-SAFE-IDENTITY-001`
  (low-privilege executor identity + per-session isolation); **#36**
  `CANON-CODER-ORCHESTRATION-001` (command hygiene, the design gate, wave shape) +
  `setup/RUNBOOK-LAUNCH-CODERS.md`; **#37** `CANON-CHANGE-PATH-AND-DECISION-CLASSES-001`
  (which path a change takes + whose approval); **#38** `CANON-DB-SECURITY-BASELINE-001`
  (Postgres/Supabase exposed-schema floor, engine-specific); **#39**
  `CANON-HUMAN-SURFACE-LEGIBILITY-001` (every human surface leads with the decision layer;
  verbose-but-mute = defect).
- **`tools/devkit-doctor.mjs`** — one-screen health board (verdict first, one line per
  gate, the fix per red, `--verbose`/`--json`); the reference instance of piece #39. Now
  the kit's "Am I governed?" one-command self-test.
- **`setup/USING-THE-KIT.md`** — the adoption on-ramp (persona router · fresh-clone-vs-update
  · worked example · the daily loop · adoption failure modes).
- **`doc/decisions/DECISION-REGISTER.md`** — the kit dogfooding piece #34 (records its own
  authority seals).
- **`setup/CLAUDE-CODE-PERMISSIONS.md`** — harness adapter: a safe `settings.json` allowlist
  for Claude Code users (what to never allowlist).
- **`tools/comms-send.test.mjs`** — tests for the governed send, incl. the §2.2.1
  COMMITTED-LOCAL fallback (wired into the engine-tests CI job).

### Changed

- **`CANON-MULTI-AGENT-ORCHESTRATION`** — §2.2.1 no-remote local-commit handoff fallback
  (`COMMITTED-LOCAL` exit state + mandatory warning); §2 producer-side routing test
  ("who has to ACT on this, and will they find it where I put it?"); §5.1 back-reference
  to the surface-legibility law (#39).
- **`tools/comms-send.mjs`** — splits commit (persistence) from push (travel): no remote /
  `--no-push` degrades to `COMMITTED-LOCAL` + warning (exit 0), not a hard exit-4 failure.
- **`tools/external-tools.lock.json` + `setup/EXTERNAL-TOOLS.md`** — graphify pin bumped to
  `0.8.39` (exercised on a real machine); the "installed ≠ on PATH" gotcha closed in
  `install-external-tools.{ps1,sh}` + `check-tools.sh`; `graphify-out/` added to the kit's
  own `.gitignore`.
- **`README.md` + `knowledge/START-HERE.md`** — the SUPRA model made legible ("The model in
  90 seconds": supra-repo · L1/L2/L3 · inherit-by-reference vs copy · the seal); the
  two-checkouts repo-topology note; "Am I governed?" now points to `devkit-doctor`.

### Added (later same day — gates, visibility, adoption)

- **`CANON-AGENT-COLLABORATION` §6 rule 11** (#100) — the advisor's duty not to let the
  human walk into a foreseeable, cheap-to-prevent hole; surfaced in `AGENTS_UNIVERSAL`
  Duty-to-Flag so it bites at runtime.
- **`tools/check-governance.mjs`** (#102) — the gate that makes #34/#37 bite (declared
  instruments exist + non-empty; decision-class binding declared) + `governance.config.example.json`.
- **`knowledge/SUPRA-MAP.md` + `tools/graph-canon.mjs`** (#104) — auto-generated canon
  constellation (Mermaid), with a `--check` freshness gate.
- **`tools/check-canon-links.mjs`** (#105) — cross-reference integrity gate (every markdown
  link resolves; every "Piece #N" exists).
- **`tools/versions.json` + `tools/check-tool-versions.mjs`** (#106) — every wired tool
  versioned (CANON-VERSIONING-001 §6, via manifest).
- **`setup/templates/heir-bootstrap/`** (#107) — copy-a-folder adoption bundle (AGENTS.md,
  configs, CI workflow, FIRST-PROMPT).
- **`devkit-doctor` gates** (#101 test, #102/#105/#106) — now a 5-gate one-screen board;
  each gate has a test wired into CI.

### Changed (later same day)

- **`check-tools.sh`** (#108) — probe `python3` (macOS), not just `py`/`python` — the first
  Mac-heir gotcha.
- **`check-canon-links.mjs`** (#107) — skip `setup/templates/` (template links resolve in
  the consumer post-copy, not in place).
- **`README.md`** (#109/#110) — platform compatibility as a table (Linux/Windows ✅ ·
  macOS 🟡 pending the first Mac green); gates-that-bite table extended (governance,
  canon-references, tool-versions).
- **`tools/agent-context.config.json`** (#107) — allowlist the heir-bootstrap `AGENTS.md`
  template (no-parallel false positive).
- **`tools/versions.json`** (this entry) — `check-canon-links` → 1.1 (templates-skip);
  the shell tools (`check-tools.sh`, `install-external-tools.{sh,ps1}`) added; the gate
  now scans `.sh`/`.ps1` too, not only `.mjs`.

## 2026-06-04

### Added

- Added `knowledge/ai-agents/REVIEW-READINESS-PROTOCOL.md` as the inherited
  process for review readiness: test the layer that gives the true signal, attach
  evidence, watch machine gates, avoid duplicate dispatch loops, and leave
  concrete adapters to consuming repos.

### Changed

- Referenced the review-readiness protocol from `AGENTS_UNIVERSAL.md` so
  inheriting repos can bind local launchers, auth bootstrap, evidence tools,
  queue thresholds, and deploy gates without duplicating SUPRA policy.

## 2026-05-25

### Added

- Added canonical `scripts/sync-agent-skills.mjs` in the Dev-Kit with a
  non-destructive `--check` mode for `.agents/skills` -> `.claude/skills` drift.
- Added `tools/comms-send.mjs` and `tools/comms-sync.mjs` as the governed send/sync
  path for inter-agent comms across machines.
- Added `repo` awareness to comms so a recipient can detect wrong-repo context.
- Added `target_layer` and `ref_branch` governance fields for cross-agent
  `task` / `review` / `audit` comms.

### Changed

- Hardened VT-Method decision capture: architecture, contract, behavior,
  AI-assisted / model-driven behavior, dependency, runtime, security/data/auth,
  privacy, and supply-chain changes now trigger an explicit ADR/canon
  classification before implementation.
- Promoted the Recipient Self-Check from a good practice to a required block for
  governance task/review/audit comms.
- Updated `comms-send` to fail closed when governance comms are missing
  `target_layer`, `ref_branch`, or the Recipient Self-Check heading.
- Consolidated `sync-agent-skills` as a Dev-Kit-owned dev-tool; downstream repos
  should inherit it instead of carrying a duplicate copy.

### Verified

- PR #21 merged with review verdict `PASS WITH NOTES`.
- Follow-up issue #23 tracks non-blocking future hardening.
- The inter-agent loop was dogfooded end to end: sync, dispatch, review, issue
  follow-up, merge, and delivery comm.
