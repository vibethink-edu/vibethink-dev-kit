<!--
  DECISION-REGISTER skeleton — instance of CANON-STATE-MIRROR-AND-DECISION-REGISTER-001 §6.
  Copy, rename to your repo's convention, delete these guidance comments.
  Role: ledger of AUTHORITY APPROVALS (who authorized, when, channel, evidence).
  Mutability: APPEND-ONLY. This is NOT the ADR (CANON-DEVELOPMENT-PROCESS §5 owns the
  "why behind the design"); this captures the AUTHORIZATION EVENT and its provenance.
-->
# DECISION REGISTER — auditable ledger of authority approvals

> **Append-only.** Every decision of an authority class (a "go ahead", an approval
> to proceed, a seal) is registered here the **moment it is granted** — especially
> approvals given through ephemeral channels (chat, a call) that leave no other
> durable trace. The agent or human records it **immediately**; a reconstructed
> approval is a recollection, not a record. Approvals self-documented elsewhere
> (e.g. a merge recorded by the forge) are listed too, so this is one timeline.
>
> **Evidence** field points at the durable backing link (commit · PR · ADR · artifact).
> An ADR answers *why this design*; a row here answers *who authorized acting, and how we know.*

**Authority classes recognized here:** `<L3: which decisions require a row — e.g. cross-boundary, security, data-sensitivity, spend, public-facing; and which are delegated>`
**Channels recognized as a valid source of an approval:** `<L3: e.g. chat, call, forge merge, signed doc>`
**Timezone of the *when* field:** `<L3: e.g. America/Bogota>`

| # | When | Decision (what) | Proposed by | Authority (granted by) | Channel | Evidence |
|---|---|---|---|---|---|---|
| D-001 | <YYYY-MM-DD> | <the decision, one auditable line> | <who proposed> | <who approved> | <where granted> | <durable link> |

<!--
  Distinct from the audit-finding disposition ledger (CANON-AUDIT-PROTOCOL §4):
  that ledger carries FINDINGS to closure; this register carries AUTHORITY APPROVALS.
  A repo may run both.
-->
