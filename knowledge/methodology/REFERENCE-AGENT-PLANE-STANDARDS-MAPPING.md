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

**Load-bearing trio (strong, well-documented — anchor here):**

| §8.1 piece (neutral) | Standard / canonical name | Maturity | Source |
|---|---|---|---|
| Tool/resource surface + capability discovery (read=resources, mutate=tools) + semantic discovery | **Model Context Protocol (MCP)** (Anthropic, open spec) | established | modelcontextprotocol.io |
| **Signal/observe** plane — event envelope | **CloudEvents** (CNCF) | established | cloudevents.io |
| **Signal/observe** plane — event/message catalog + deprecation | **AsyncAPI** (vendor-neutral) | established | asyncapi.com |
| Read/mutate contract + codegen (the **derivation** source) | **OpenAPI + JSON-Schema** | established | openapis.org |
| Execution proof of the plane | **Consumer-driven contract tests** (Pact-style) + conformance probe | established | pact.io / general |
| Structured error contract | **typed problem details** (RFC 7807 / problem+json) | established | RFC 7807 |

> These three (MCP · CloudEvents/AsyncAPI · OpenAPI) cleanly cover **read + mutate + observe +
> discovery** and are the safe anchors. The derivation+execution gate (below) binds to OpenAPI
> codegen + contract tests.

**Exploratory (cite as direction, NOT load-bearing — Opus review 2026-06-29):**

| Idea | Name | Why exploratory |
|---|---|---|
| "Agent is a first-class consumer" | **Agent-Computer Interface (ACI)** — SWE-agent (arxiv 2405.15793) | It is a CLI/text ACI for *code* agents, **not** a generic read/mutate/signal data-plane. Mapping it here is a **stretch** — use for the *framing*, not the contract. |
| "Agent prefers API over GUI" | **AXIS** (arxiv 2409.17140) | Emerging; single-paper. Supports the intuition, not load-bearing. |
| "Declarative affordances at data layer" | **VOIX** (arxiv 2511.11287) | Emerging; recent. Directionally right, not established. |
| The **gate** | **Spec-Driven Development** (GitHub spec-kit) | Right *intent*, but spec-driven **declaration** is the weak link (see §5). |
| Repo-level discovery | **AGENTS.md**, **llms.txt** | Emerging conventions. |

## 4. What the principle gained (gaps closed in §8.1)

1. **Three verbs** — the original "a CLI exists" became **read + mutate + observe/signal** (the signal
   verb was the missing one); read includes cursor/pagination/streaming.
2. **Discovery — structural + semantic** — preconditions, side-effects, examples (MCP-style), not just
   an endpoint list.
3. **Standardized signal contract** — a standard event envelope + catalog, not house-ad-hoc events.
4. **Governed mutation, made explicit (Opus 2026-06-29):** authorization **per verb and per tenant**;
   **idempotency + concurrency** (replay/double-fire safety); **propose/dry-run** variant; **typed
   error contract**; **provenance/audit** (which agent, why); **rate/quota/metering**.
5. **Versioned + deprecation signalling** — agents are *notified* of breaking changes, not just a bump.
6. **Affordances at the data layer**, not endpoint wrappers.
7. **Derivation + execution gate** (see §5) — the single biggest correction: prove the plane by
   running it, generated from the same source as the GUI.

## 5. The gate — declaration → derivation + execution (Opus review 2026-06-29)

A spec-driven preflight that checks **what you declared** is the *weak* link: declaration ≠
implementation, so the gate passes a plane that does not exist, and "declare read+mutate+signal+
discovery" is trivially stubbed. The robust gate, in order of strength:

1. **Derive, don't declare** — generate the agent plane from the **same contract/registry as the
   GUI** (OpenAPI/GraphQL/AsyncAPI → codegen). The plane then exists by construction and cannot be
   stubbed without breaking the human surface. Question shifts from *"declared?"* to *"regenerated +
   conforms?"*.
2. **Execution proof** — a **conformance probe / consumer-driven contract test** exercises each verb
   against the live capability (read returns real data, mutate mutates + verifies effect, signal
   fires + observed, discovery self-validates), with a happy + failure case so the probe is not a
   no-op. Declaration alone is theatre.
3. **Anti-bureaucracy** — fire at the **capability boundary** (not raw schema), **default-infer**
   (derive for CRUD; block only on inference-fail/override), **risk-tier** (hard block only
   tenant-visible/prod), and a **net-value self-test** (if it fires more than it catches, it is
   net-negative).
4. **Expensive, human-approved escape** — "no agent surface" is the top gaming vector; it must be
   architect-approved, logged, audited, and **costlier than complying**.

This supersedes the earlier "spec-driven preflight" framing. The L1 rule (§8.1) now states the
execution+derivation gate directly.

## 6. Sources (verify before citing externally)

- SWE-agent / ACI — arxiv 2405.15793 (NeurIPS 2024).
- AXIS (API-first for agents) — arxiv 2409.17140.
- VOIX (declarative agent affordances) — arxiv 2511.11287.
- CloudEvents (CNCF) — cloudevents.io. · AsyncAPI — asyncapi.com.
- MCP — modelcontextprotocol.io. · OpenAPI — openapis.org.
- Spec-Driven Development — GitHub spec-kit. · AGENTS.md — agents.md. · llms.txt — llmstxt.org.
- **Excluded (unverifiable):** arxiv 2603.20300.
