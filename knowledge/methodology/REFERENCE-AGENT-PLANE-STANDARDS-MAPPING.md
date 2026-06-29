# REFERENCE — Agent-plane standards mapping (informational)

> **Type:** Reference (informational). **Not** a neutral L1 canon — it intentionally names external
> open standards so consumers can bind. The L1 rule lives vendor-neutral in
> `CANON-DEVELOPMENT-PROCESS.md §8.1` ("Dual-surface parity"); concrete binding is L2/L3.
> **Records:** the research run of 2026-06-29 behind the §8.1 extension.

---

## 1. The principle (restated)

Every system/feature has **two first-class consumers designed in parallel from the schema and
architecture**: the **human** (GUI) and the **agent** (a programmatic plane: **read + mutate +
observe/signal**, discoverable and governed). The agent plane is a **design input** at modeling
time, enforced by a **gate** so it is never forgotten.

## 2. Research integrity caveat (read before trusting the citations)

The 2026-06-29 deep-research run's **adversarial verification phase was 100% rate-limited** (server
throttling, not a usage limit) — every claim came back `0-0` (zero verifiers ran). The auto-summary
"all claims refuted / inconclusive" is a **rate-limit artifact, not a refutation**. The *claims*
were extracted from real, citable sources and were cross-checked against the architect's own SOTA
knowledge. One source (`arxiv 2603.20300`, "invocable capabilities") could **not** be verified and
is **not** anchored to. **Because automated verification failed (twice, across two runs), an
independent human/advisor review of the gate design is warranted before sealing.**

## 3. Mapping — neutral principle → established/emerging standards

| §8.1 piece (neutral) | Standard / canonical name | Maturity | Source |
|---|---|---|---|
| Agent is a first-class consumer with a purpose-built plane | **Agent-Computer Interface (ACI)** — SWE-agent | established | arxiv 2405.15793; NeurIPS 2024 |
| Agent consumes API, not the human GUI | **API-first for agents** — AXIS (API > UI, ~65-70% faster) | established | arxiv 2409.17140 |
| Tool/resource surface + capability discovery | **Model Context Protocol (MCP)** (Anthropic, open spec) | established | modelcontextprotocol.io |
| **Signal/observe** plane — event envelope | **CloudEvents** (CNCF) | established | cloudevents.io |
| **Signal/observe** plane — event/message catalog | **AsyncAPI** (vendor-neutral) | established | asyncapi.com |
| Declarative, machine-readable affordances at the data/state level, at design time | **VOIX** (tool/context tags ≈ read/mutate/signal) | emerging | arxiv 2511.11287 |
| Read/mutate contract | **OpenAPI + JSON-Schema** | established | openapis.org |
| The anti-forgetting **gate** | **Spec-Driven Development** (spec precedes code; spec must declare the agent surface) | established/emerging | GitHub spec-kit |
| Repo-level discovery for agents | **AGENTS.md**, **llms.txt** | emerging | agents.md; llmstxt.org |

## 4. What the principle gained (gaps closed in §8.1)

1. **Three verbs** — the original "a CLI exists" became **read + mutate + observe/signal** (the signal
   verb was the missing one).
2. **Discovery** — machine-readable self-description, not just "the endpoint exists."
3. **Standardized signal contract** — emit a standard event envelope + catalog, not house-ad-hoc
   events (the L2/L3 binds CloudEvents/AsyncAPI; L1 only says "a signal contract").
4. **Governed mutation** — authorization/scope, idempotency, proposal/apply separation.
5. **Versioned agent contract**.
6. **Affordances at the data layer**, not endpoint wrappers.

## 5. The gate (the core requirement)

The documented anti-forgetting mechanism is **spec-driven**: nothing is built without a spec, and the
spec/preflight **requires** the agent plane (read + mutate + signal + discovery) for any capability,
**schema, or architecture change** — or a conscious "no agent surface" with a reason. The lock fires
at **design time**, not review time.

## 6. Sources (verify before citing externally)

- SWE-agent / ACI — arxiv 2405.15793 (NeurIPS 2024).
- AXIS (API-first for agents) — arxiv 2409.17140.
- VOIX (declarative agent affordances) — arxiv 2511.11287.
- CloudEvents (CNCF) — cloudevents.io. · AsyncAPI — asyncapi.com.
- MCP — modelcontextprotocol.io. · OpenAPI — openapis.org.
- Spec-Driven Development — GitHub spec-kit. · AGENTS.md — agents.md. · llms.txt — llmstxt.org.
- **Excluded (unverifiable):** arxiv 2603.20300.
