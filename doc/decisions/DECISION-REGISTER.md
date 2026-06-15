# DECISION REGISTER — auditable ledger of authority approvals (the dev-kit itself)

> **Append-only.** Every decision of an authority class (a "go ahead", an approval
> to proceed, a seal) is registered here the **moment it is granted** — especially
> approvals given through ephemeral channels (chat) that leave no other durable
> trace. This is the dev-kit's own instance of
> [`CANON-STATE-MIRROR-AND-DECISION-REGISTER-001`](../../knowledge/methodology/CANON-STATE-MIRROR-AND-DECISION-REGISTER-001.md)
> §6 (the kit dogfooding its own canon). An ADR answers *why this design*; a row
> here answers *who authorized acting, and how we know.*

**Authority classes recognized here** (per [`CANON-CHANGE-PATH-AND-DECISION-CLASSES-001`](../../knowledge/methodology/CANON-CHANGE-PATH-AND-DECISION-CLASSES-001.md) §4): **canon/law changes** (a new or amended spine, a piece registered in `setup/ADOPT-DEV-KIT.md`) are **authority-sealed** by the Principal Architect — never delegated. Tooling version-forwards and doc tweaks are **delegated-with-record** (listed here for one timeline; their *why* lives in the PR/ADR).
**Channel of record:** chat approval, confirmed by the merge of the cited PR.
**Timezone of the *when* field:** UTC.

| # | When (UTC) | Decision (what) | Proposed by | Authority (granted by) | Channel | Evidence |
|---|---|---|---|---|---|---|
| D-001 | 2026-06-15 14:19 | **SEAL** of the governance-instruments + coder-orchestration elevation — registers ADOPT pieces **#34** (state-mirror-and-decision-register), **#35** (coder-safe-identity), **#36** (coder-orchestration); statuses flipped to SEALED | dev-kit architect (from a vertical's elevation handoff) | Principal Architect | chat ("dale aprobado") | [PR #83](https://github.com/vibethink-edu/vibethink-dev-kit/pull/83) MERGED → master `cc65046` |
| D-002 | 2026-06-15 14:42 | **SEAL** of **#37** change-path-and-decision-classes — closes the gate-decision gap for heirs (path: direct/spec-first/design-gate; classes: authority-sealed/delegated/autonomous) | dev-kit architect | Principal Architect | chat ("si dale") | [PR #84](https://github.com/vibethink-edu/vibethink-dev-kit/pull/84) MERGED → master `cba9dc2` |
| D-003 | 2026-06-15 | **Version-forward** graphify pin `0.7.13 → 0.8.39` (delegated-with-record; version-forward policy = PR + real-machine evidence) | dev-kit architect | delegated (under "ajusta los pendientes") | chat | exercised on `vm-XL-app-cup` (Python 3.12.8): `--version` → 0.8.39 + `update` → 141 nodes/233 edges; this PR (supersedes [PR #75](https://github.com/vibethink-edu/vibethink-dev-kit/pull/75)) |
| D-004 | 2026-06-15 | **SEAL** of **#38** db-security-baseline (Postgres/Supabase exposed-schema security floor) — engine-specific by direction (`N-A(non-postgres)`); carries the `PUBLIC`-grant silent-no-op discovery + self-testing-migration discipline + Supabase advisor as CI/pre-cutover gate. Same seal: cross-repo-handoff discovery rule added to `CANON-MULTI-AGENT-ORCHESTRATION` §2 | dev-kit architect (from ViTo W3–W7 advisor convergence) | Principal Architect | chat ("Sella el canon de los descubrimientos … asegúrate de que se aplique para Postgres") | this PR |

<!--
  Distinct from the audit-finding disposition ledger (CANON-AUDIT-PROTOCOL §4):
  that ledger carries FINDINGS to closure; this register carries AUTHORITY APPROVALS.
  Add a row the moment an authority-class "go" is granted — a reconstructed approval
  is a recollection, not a record.
-->
