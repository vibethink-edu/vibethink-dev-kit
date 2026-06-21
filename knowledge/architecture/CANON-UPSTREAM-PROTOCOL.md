# CANON-UPSTREAM-PROTOCOL — Universal protocol for adopting and tracking upstream code

**Status:** SEALED 2026-06-04 by Marcelo (Principal Architect) — Tier C consolidation · **§6 amendment RE-SEALED 2026-06-05 by Marcelo** (bounded-adaptation field + discoverable index) · **§17 amendment SEALED 2026-06-05 by Marcelo** (provider security-posture lifecycle — agnostic-lift A#7)
**Date:** 2026-05-25
**Scope:** Every repo that adopts, forks, or pins external code. Cross-product (agnostic).
**Companion canons:** [`CANON-DECISION-DISPOSITION-FOR-GRAPH-INDEXING`](./CANON-DECISION-DISPOSITION-FOR-GRAPH-INDEXING.md) (the decision-capture spine this canon plugs into).

---

## §1 — Principle (and the brownfield framing)

Every repo with code is **brownfield** the moment it has code. The moment you build on something external — a fork, a pinned dep, a CLI tool, a design system, an AI SDK, an LLM provider — you have an **upstream**. Two facts follow:

> **An unreviewed upstream is invisible technical debt. An upstream reviewed and rejected on purpose is an architectural decision.**

Both states are acceptable; the third — *"we have it, but nobody ever looked"* — is the failure mode this canon prevents.

Brownfield matters because greenfield-style thinking ("we just pick the best lib") ignores the existing surface the lib touches: existing styles, existing types, existing licenses, existing version pins. Adopting an upstream in a brownfield context is **always** a multi-surface decision.

---

## §2 — Constitutional rule

Before **adopting**, **installing**, **forking**, or **integrating** any substantial third-party dependency, the agent **MUST**:

1. Run the 6-step Adoption Protocol (§3).
2. Obtain an explicit decision from the human authority of the consuming repo.
3. Write the decision as an **ADR** (per the decision-capture canon — trigger-before-implementation rule) **before code lands**.

**Applies to:** form engines, CMS engines, editors, AI SDKs, LLM providers, payment processors, UI libraries with their own CSS, component frameworks, build tools, databases, cloud services, design-system kits, observability stacks, image/video processors, schedulers, queues.

**Does NOT apply to:** small utilities without their own CSS or restrictive license (date-style, common-collections, schema-validators, uuid, etc.). Use common sense; if in doubt, run the protocol.

---

## §3 — The 6-step Adoption Protocol

### Step 1 — STOP (breathe)

No install. No code. No `pnpm add` / `pip install` / `cargo add` / equivalent. **Declare the intent to evaluate** out loud and pause.

### Step 2 — STUDY THE FULL ECOSYSTEM

Not just the package that looks useful. The whole project's surface.

| What to investigate | Why |
|---|---|
| All repos in the project/org (not only the one that seems handy) | Some pieces may be commercial-only, copyleft, or carry toxic transitive deps |
| Exact license of each component (permissive, copyleft, commercial proprietary) | A commercial or copyleft license can contaminate the whole consuming repo |
| Pricing if commercial (tiers, per-seat, perpetual vs subscription) | The human decides if the cost is acceptable |
| Maintenance state (last release date, open issues, sole-maintainer risk, governance) | An unmaintained upstream is debt with no exit |
| Public security history (CVEs, response time) | Carrying an upstream means carrying its security posture |

### Step 3 — LICENSE & COMPATIBILITY

Verify the license is compatible with the consuming repo's license and with **every transitive dependency** relevant to distribution. Document the verdict.

### Step 4 — PRICING & COST

Document one-time + recurring costs. If commercial, note when the cost recurs (per dev, per seat, per year) and which tier matches actual usage. A "free tier" with a hard ceiling counts as commercial.

### Step 5 — ALTERNATIVES (at least 3, including the "do nothing" option)

- An **OSS alternative** with comparable maturity.
- A **pattern-extraction** alternative — build it ourselves, taking the idea/design but not the code (this is the **default policy**, §5).
- A **defer / do nothing** alternative — explicit choice not to act now.

### Step 6 — DECISION

Human authority of the consuming repo decides one of: `ADOPT` / `FORK` / `EXTRACT-PATTERN` / `REJECT` / `DEFER`. The decision is captured as an **ADR** with alternatives, license verdict, cost, and the why.

**No code lands before the ADR is written.** A code commit referencing an upstream without a matching ADR is a finding (§9).

### §3.1 — License-compatibility matrix

Step 3's verdict is bounded by this matrix. What a license permits depends on the **mode** of use — adopting as a managed dependency, extracting patterns (zero source copied), or forking source into the repo:

| License | Adopt as dependency? | Extract patterns (zero code)? | Fork source into the repo? |
|---|---|---|---|
| MIT | ✅ | ✅ | ✅ (with attribution) |
| Apache 2.0 | ✅ | ✅ | ✅ (with a NOTICE file) |
| ISC / BSD | ✅ | ✅ | ✅ (with attribution) |
| AGPL-3.0 | ⚠️ only as an external service (network boundary) | ✅ patterns only, zero code | ❌ **never** — copyleft contaminates the repo |
| GPL-3.0 | ⚠️ only as an external service | ✅ patterns only, zero code | ❌ **never** — copyleft contaminates the repo |
| Source-available (BSL / SSPL / SEE) | ❌ read the terms | ✅ patterns only | ❌ likely restricted |
| Proprietary / no license | ❌ | ⚠️ fair use only | ❌ |

> **Iron rule:** strong-copyleft code (AGPL / GPL) **never** enters the repo as a fork or copy — not "just this one function." It may be studied for patterns (reimplemented from scratch in the repo's own style) or consumed across a network boundary as an external service. The `UPSTREAM.md` must flag this constraint explicitly. (The matrix interacts with §15's runtime-location typology: "external service" is exactly the AGPL-safe runtime location.)

---

## §4 — Taxonomy of upstream types

Every upstream falls into one of these categories. The handling pattern differs by type; the consuming repo's L3 binding declares which instances live in which category.

| Type | What it is | Pattern | Where it lives |
|---|---|---|---|
| **Fork-adapted** | Source copied/adapted; we modify and sync periodically | Per-package `UPSTREAM.md` (§6.1) + cadence | Inside the consuming repo at the package's root |
| **Pinned dep** | Used as-is at a pinned version; we don't modify | Lockfile + central baseline doc (§6.2) | Lockfile + a per-repo baseline doc |
| **Runtime / framework** | The platform the consuming repo builds on (render lib, routing layer, build tool) | Baseline + ADR on every major bump | Baseline + ADR archive |
| **Design-system kit** | UI components, often with their own CSS / tokens | Per-kit doc + token-alignment rule | Inside the consuming repo, scoped to the UI package |
| **AI / model provider** | Vendor-locked-in unless explicitly abstracted | Per-provider doc + an abstraction layer between the provider and the rest of the code | Inside the consuming repo, scoped to the AI/inference layer |
| **CLI / personal tool** | Operator-personal across products; not part of any product repo | Operator-personal bitácora **outside** any product repo (§8) | The operator's personal storage |

This taxonomy is **the routing-by-type rule**: each type's home is declared once and not negotiated per instance.

---

## §5 — Default policy: extract patterns, not dependencies

When evaluating any new upstream above the small-utility threshold, the **default** is:

> Read the source. Take the **idea, design, or shape**. Implement it ourselves.

Only adopt as a dependency when **all** of the following hold:
- the surface is large enough that re-implementing is genuinely wasteful,
- the upstream's maintenance is robust (active org, multiple maintainers, fast security response),
- the license is clean for our use,
- the decision is captured as an ADR.

This avoids: vendor lock-in, bug inheritance, license bleed, and "we adopted X two years ago and now we can't move."

This default is overridable by an ADR. The default is not a ban — it is the burden of proof shifting onto the *adopt* side.

---

## §6 — Mechanism patterns

The consuming repo binds these patterns to its own paths and files (§7).

### 6.1 Per-fork artifact: `UPSTREAM.md`

Every forked package has an `UPSTREAM.md` at its root with:
- upstream URL,
- license,
- snapshot date or upstream commit,
- the local-vs-upstream diff summary (what we changed and why),
- **whether the fork is a *bounded adaptation*, and if so its explicit *do-not-overwrite-on-sync* list** — the commands, files, templates, or routing deliberately diverged from upstream that a future sync **MUST preserve** (and the upstream features deliberately dropped that a sync **MUST NOT restore**),
- the assigned **cadence** (§6.4),
- the next-review date.

This is the per-fork accountability artifact. Without it, the fork is unreviewable. The diff summary is **descriptive** (what we changed); the do-not-overwrite list is **prescriptive** (what a sync must not undo) — a bounded adaptation needs both, or a future sync silently reverts the divergence.

### 6.2 Baseline-versions document & discoverable upstream index

A single, **discoverable** document per consuming repo — the one entry point for *"what upstreams do we have?"* — listing **every tracked upstream** (not only pinned deps: also forks, runtimes, design-systems, AI/model providers) with: name, **kind (§4)**, version / last-sync, source URL, license, **cadence (§6.4)**, **bounded-adaptation? flag** (→ the per-fork `UPSTREAM.md` §6.1 for the do-not-overwrite list), last-reviewed date, drift flags. Updated when versions bump or new upstreams land.

The point is **discoverability**: the standard must be findable from this one index, not reconstructed by hunting across scattered per-fork docs. The per-fork `UPSTREAM.md` (§6.1) holds the detail; this index is the map.

### 6.3 Drift detection

A periodic check that compares the baseline doc against the lockfile and flags drift: silent version bumps, two versions of the same lib across packages, sole-maintainer abandonment, license changes upstream. The mechanism (script, CI gate, manual review) is the consuming repo's choice; the **existence** of the check is mandatory.

### 6.4 Cadence framework

Every upstream is assigned exactly one of:
- **Monthly** — high-velocity upstreams that ship often.
- **At-release** — version-tag upstreams; we sync at upstream's release events.
- **As-needed** — slow-moving or utility upstreams; sync when something we need lands.

The cadence is declared once in the inventory and is the contract: missing a cadence cycle is itself a finding.

---

## §7 — L3 binding (what the consuming repo owns)

This canon is the spine. The consuming repo's L3 binding **adds** the product-specific content the spine cannot know:

- The actual **inventory of forks** (which upstreams, where in the repo, license, cadence).
- The actual **baseline doc path** (concrete file location for the dependency baseline).
- The actual **drift-detection check** (script path or CI gate name).
- **Stack-specific compatibility checks** (e.g., "compat with the chosen render lib version", "compat with the chosen build tool") — these only make sense inside a specific product's stack.
- **Product-specific overlays** (e.g., reject upstreams that violate the product's vocabulary or governance posture — a domain-specific blacklist).
- **Originating incidents** as evidence (the time we adopted X badly and what we learned).

The L3 binding **points at this canon as the spine**; it does NOT re-write the principle, the 6-step protocol, or the taxonomy. If the L3 binding repeats those, it drifts.

---

## §8 — Operator-personal bitácora (separate axis)

A separate axis from L1/L2/L3: the **operator's personal cross-product tooling**. CLIs and tools the human operator uses across multiple products (code indexers, code-graph tools, version managers, profile managers) live in a **bitácora outside any product repo**.

This is operator-personal hygiene, not product governance. The same operator may track 10 personal CLIs across 5 products without any of them being a product upstream. Keep this axis separate to avoid polluting product L3 bindings with operator-personal noise.

---

## §9 — Linkage to decision-capture

Adopting, forking, or pinning a new upstream is a **decision-capture trigger** (see the decision-capture canon — trigger-before-implementation rule). The 6-step protocol's output is the ADR that fulfills that trigger.

The reverse is also true: if a future agent sees an upstream in the inventory **without a matching ADR**, that is a finding to surface. The upstream may have been adopted before this protocol existed; the consuming repo should backfill the ADR retroactively (marked `[RECONSTRUCTED]`).

---

## §10 — Ongoing-update decisions (when an upstream has new code)

§3 governs **initial adoption**. This section governs **ongoing updates**, once an upstream is already in the inventory.

For each new upstream change, answer these three questions in order:

### Q1 — Is it a security issue?

If **yes** → UPDATE is mandatory. No negotiation. Branch immediately, fix forward. (Linkage: §11 rule 3.)

### Q2 — What kind of change is it?

| Type | Action |
|---|---|
| Security patch | UPDATE always |
| Bug fix that affects something the consuming repo uses | UPDATE |
| New feature the consuming repo can use | EVALUATE (continue to Q3) |
| Breaking change | EVALUATE cost/benefit + ADR (decision-capture trigger) |
| New feature the consuming repo does NOT use | SKIP + document |
| Deprecation of something we use | PLAN migration |

### Q3 — Is the sync cost worth it now?

- **Cost:** merge time + testing + regression risk.
- **Benefit:** product improvement, security, DX.
- **Timing:** if there is active work in that module right now, sync now (lower coordination cost than later).

If **cost > benefit** → SKIP this version. **Document the skip** in the baseline-versions doc (§6.2) with: package, upstream-latest version, pinned version, decision, date, reason. A skipped version *without* documentation is a finding (§11 rule 2).

---

## §11 — Operating constitutional rules

These rules apply to every ongoing-update touchpoint. They are **NOT negotiable** on a per-update basis.

1. **Upstream claims ≠ product truth.** What the upstream documents is not what your consuming repo has. Verify against the actual local code, not the upstream README.
2. **Every skip is documented.** "Did not look" ≠ "decided not to update". Only *"I looked and decided to skip because X"* is a valid skip — and X is recorded in the baseline doc.
3. **Security patches are obligatory.** Without negotiation. Without convenient timing. **Severity policy:** Critical/High CVE → update **same day** (override every other rule). Medium → within **one week**. Low → at next **monthly review**. *(This rule governs a fix **you** apply to code you consume. When the **provider itself** degrades and there is no patch you can apply — an active breach, a leaked credential, an expired certificate — the response is not "patch" but "stop consuming until they remediate": see §17, the provider security-posture lifecycle.)*
4. **One update per PR.** Never mix updates of multiple upstream repos in a single PR. Bundling defeats reviewability.
5. **Build + test before merge.** No upstream update merges without a green build and a passing test suite.
6. **Baseline is truth.** The baseline-versions doc (§6.2) is updated in the same PR as the update. Pin drift without a baseline update is a finding.

These rules complement §2 (the constitutional adoption rule). §2 governs whether to adopt at all; §11 governs how every subsequent touchpoint operates.

---

## §12 — Sync execution shape (pattern, not commands)

The shape for executing a sync is the same for any upstream type. The exact tooling (`pnpm`, `cargo`, `pip`, `npm`, `bundle`, etc.) is **L3 binding**; the steps and gates are agnostic.

1. **Dedicated branch:** `{agent}/{type}-upstream-{name}-{version}` (one upstream per branch; §11 rule 4).
2. **Fetch + selective integration:** fetch from the upstream remote (if configured) or cherry-pick from a download. **Never** blind-merge — always review the diff first.
3. **Build + test:** the consuming repo's full build and test suite must pass before any review (§11 rule 5).
4. **PR body — comparison table:** documents what changed by category (security / bug fixes / new features adopted / breaking changes resolved / features ignored), with the *why* for each ignored item.
5. **Baseline update in the same PR:** §6.2 is updated as part of the same merge, never as a separate "I'll do it later" PR (§11 rule 6).

The consuming repo's L3 binding documents the concrete commands (which package manager, which branch-naming convention exactly, which CI gate names); the shape above is the spine.

---

## §13 — Risk tiers (orthogonal to §4 taxonomy)

§4 classifies upstreams by **kind** (fork-adapted, pinned dep, runtime, design-system, AI/model provider, CLI personal). This section classifies them by **risk / criticality** — an **orthogonal axis**. A given upstream has *both* a kind and a tier (e.g., a primary render framework is `runtime × Tier 1`; a calendar engine is `fork-adapted × Tier 2`; a UUID lib is `pinned dep × Tier 3`).

| Tier | Definition | Examples (by category, not specific package) |
|---|---|---|
| **Tier 1 — Platform Core** | A breaking change here takes down the entire product/platform | Language runtime, primary framework, type system, package manager, database client |
| **Tier 2 — Feature Critical** | A breaking change breaks **that feature**, not the platform | A specific UI engine (editor, whiteboard, calendar, drag-and-drop), an AI/model SDK powering a feature |
| **Tier 3 — Utility / Low Risk** | Updates rarely break anything user-visible | Tiny utilities (date math, classnames, UUIDs, schema validators), dev tools (lint, format, build helpers) |

The consuming repo's L3 binding **names the actual packages** in each tier (per §7) — this canon defines the **classification framework**, not the inventory.

---

## §14 — Automation policy per tier

| Tier | Pin shape | Auto-update | Who decides | Cadence |
|---|---|---|---|---|
| **1 — Platform Core** | **Exact** (e.g. `"19.1.0"`, no caret) | **Never** auto-update | Architect / human authority of the consuming repo | Quarterly review, or security-driven |
| **2 — Feature Critical** | **Caret** (e.g. `"^0.18.0"`) | Bot PR allowed; **no auto-merge** (Dependabot/Renovate file the PR; human reviews) | Feature owner | Monthly review |
| **3 — Utility** | **Caret** | **Patch auto-merge** allowed; minor/major requires human review | CI for patch, owner for minor/major | Continuous for patches; monthly for minor |

The **bot/CI tool** (Dependabot, Renovate, or equivalent) and its config file are **L3 binding** — the consuming repo declares which tool it uses and how its tier groups are expressed in that tool's config. This canon defines the **policy**; the L3 binding defines the **mechanics**.

This pairing of §13 + §14 with §10 (ongoing-update Q1/Q2/Q3) means: every upstream change is first classified by **kind** (§4) and **tier** (§13), then handled by the **automation policy** for that tier (§14), and the **decision per change** runs through §10's Q1/Q2/Q3.

---

## §15 — Runtime-location typology (third orthogonal axis)

§4 classifies upstreams by **kind** (fork-adapted, pinned dep, runtime, design-system, AI provider, CLI personal). §13 classifies them by **risk tier** (Platform Core / Feature Critical / Utility). This section adds a **third orthogonal axis**: where the upstream **runs** relative to the consuming repo's host process.

| Typology | Definition | Mechanism | Examples (by category) |
|---|---|---|---|
| **A — Host component** | Code that runs **inside** the consuming repo's host runtime. Inherits its privileges, crash risk, and version constraints. | `import`, `require`, `package.json` dep | UI libs, utility libs, embedded AI SDKs running in-process, build-time plugins |
| **B — Service component** | Code that runs **alongside** the host as an isolated runtime; communicates via defined contracts. **Exempt** from host runtime version constraints (a sidecar can run a different language/version). | Docker container, sidecar process; HTTP / WebSocket / gRPC | A separate inference service, an indexing engine, a queue worker, a ML pipeline |
| **C — External peer** | Autonomous system running **outside** the consuming repo's infrastructure control. | API call (REST / GraphQL) over public or private network | An LLM provider API, a payment processor, an analytics SaaS, a legacy ERP |

### §15.1 — The "Import vs Curl" Litmus Test (heuristic)

> **Do you `import` it?** → **Typology A (Host).** It runs in your process. Even if marketed as an "agent" or "microservice," if you import it, it is a library — it inherits your privileges and your crash risk.
>
> **Do you `curl` it?** → **Typology B or C.** Differentiator: **do we deploy it?** Yes → B. No → C.

This test prevents the common architectural confusion where a vendor labels a Library as an "Agent" or a Service. The test is mechanical and unambiguous.

### §15.2 — Using the three axes together

| Typology | Common kinds (§4) | Typical risk tiers (§13) |
|---|---|---|
| A — Host | fork-adapted, pinned dep, runtime, design-system | Tier 1 or 2 (in-process = higher blast radius) |
| B — Service | runtime, AI/model provider, design-system kit (rare) | Tier 1 (platform sidecar) or Tier 2 (feature-specific) |
| C — External | AI/model provider, payment processor, observability | Variable (vendor risk independent of in-process risk) |

The full classification of an upstream is the triple **(kind, tier, typology)** — together they determine its handling end-to-end.

### §15.3 — Typology-specific gates (L3 binding)

Each typology activates additional constraints the consuming repo's L3 binding defines:

- **A (Host):** physical-admission gate (codebase placement, no import leaks), UI-contract gate (CSS isolation, token bridging), license compatibility with the host's distribution model.
- **B (Service):** container / OCI isolation (must run in a codified container), **no shared memory** with host, explicit CPU / RAM limits, contract definition (OpenAPI / gRPC schema), separate observability.
- **C (External):** adapter pattern between consuming code and the external API, rate-limit policy, key/secret management (no values in repo), fail-soft on outage, and a **provider security-posture grade** with a ban/reinstate lifecycle (§17) — the provider's own security is outside your patching control, so it is governed as a distinct axis.

The consuming repo names the actual gate documents in its L3 binding; this canon names the gate **categories**.

---

## §16 — Intake & Outcome templates (the artifacts §3 produces)

§3 governs the 6-step adoption protocol. This section provides the **templates** for the artifacts that protocol produces — the Sponsor's declared Intent at the start, and the sealed Outcome at decision.

### §16.1 — Intake (the Sponsor declares Intent before any technical work)

Every adoption proposal opens with a Sponsor block. **Without this block, the proposal does not advance through §3.** Fail-closed by design.

```markdown
## 3P Intake

**Name:** [Component name]
**Source / Vendor:** [URL / repo]
**Typology (§15):** [A / B / C] (justify with the Litmus Test §15.1)
**Risk tier (§13):** [1 / 2 / 3]
**Kind (§4):** [fork-adapted / pinned dep / runtime / design-system / AI provider / CLI]
**Data impact:** [read-only / writes user data / writes system core]
**Privileges:** [what access does it need?]
**Alternatives considered (at least 1):** [name + why rejected; default per §5: extract-pattern]
**Exit criteria:** [how do we remove it if it fails?]
```

### §16.2 — Outcome (the sealed block at decision — the ADR)

Every adoption evaluation closes with a sealed Outcome block. This **is** the ADR that §3 step 6 + §9 (decision-capture linkage) require.

```markdown
## 3P Evaluation Outcome

**Status:** [ADOPTED | FORKED | EXTRACT-PATTERN | REJECTED | DEFERRED]
**Scope (typology, §15):** [A — Host | B — Service | C — External]
**Risk tier (§13):** [1 / 2 / 3]
**Rationale:**
[Concise architectural + business + license justification]

**Evidence:**
- [link to assessment / shootout]
- [link to proof of concept, if any]

**Owner:** [@handle of the responsible engineer or agent]
**Next review:** [YYYY-MM-DD or event trigger]
```

The Outcome block is the **decision record**. The consuming repo's L3 binding declares where these files live (e.g., `docs/decisions/`, `doc/adr/`, equivalent).

### §16.3 — Anti-duplication clause

These templates are the spine's SoT for the **structure** of Intake and Outcome. The **content** of specific evaluations (criteria sets, vendor-evaluation policies, licensing checklists, UI-adapter standards) lives in domain-specific docs the consuming repo names in its L3 binding (§7).

---

## §17 — Provider security-posture lifecycle (orthogonal axis)

§4 classifies upstreams by **kind**, §13 by **risk tier**, §15 by **runtime location**. This section adds the axis those three miss: the **security trustworthiness of the provider itself**.

> **§13 measures blast radius if the upstream breaks. This section measures whether the provider's own security can be trusted at all.** They are independent: a Tier-1 platform-core provider can still be security-grade-F, and a Tier-3 utility can be grade-A.

This axis is most load-bearing for **Typology C (External)** and **Typology B (Service)** providers — the ones whose security posture sits **outside your patching control**. For a Typology A (Host) dependency you can patch the code yourself (§11 rule 3 governs that). For an external provider that is breached, you cannot patch them; the only lever is to **stop consuming them** until they remediate. That is what this lifecycle governs.

> **Iron rule:** an insecure external provider is worse than no provider. Block first, evaluate later.

### §17.1 — Security grading

Every external provider (Typology B/C) carries a **security grade** drawn from provider-controlled criteria — authentication strength, transport security, data handling, incident history, and documentation/transparency. The grade is recorded wherever the provider is inventoried (the discoverable upstream index, §6.2).

| Grade | Meaning | Action |
|---|---|---|
| **A — Trusted** | Strong auth, modern transport, no known incidents, public security posture | Full integration allowed |
| **B — Acceptable** | Adequate auth, minor past incidents resolved, no current advisories | Integration allowed **with monitoring** |
| **C — Caution** | Weak auth or thin security docs or past unresolved issues | Integration allowed **with extra controls** (rate limiting, secret-rotation schedule, network rules) |
| **F — Banned** | Active security incident, breach, credential leak, transport compromise, malware, auth bypass | **BANNED — zero integration work until reinstated** |

The spine mandates that a grade **exists** and that grade `F` blocks all integration work. The **exact weighted rubric, the numeric thresholds, and the column/field that stores the grade are L3 binding** — the consuming repo defines them (§17.7).

### §17.2 — Ban triggers (block all integration work)

A ban blocks **all** integration work on the provider — distinct from §11 rule 3, which obligates a patch **you** apply. A ban is the response when the provider itself has degraded and no patch of yours can fix it.

**Automatic (no approval needed — any agent or human MUST set the provider to `F` on discovery):**

| Trigger | Example |
|---|---|
| Active data breach | Provider announces a breach affecting API consumers |
| Credential / secret exposure | Provider's API keys or OAuth secrets leaked publicly |
| Transport compromise | Endpoint served over plaintext or with an invalid / expired certificate (MITM exposure) |
| Malware delivery | Provider responses carry malicious payloads |
| Authentication bypass | A known exploit allows unauthenticated access |
| Regulatory shutdown | A government orders the provider to cease operations |
| Supply-chain compromise | The provider's distributed SDK / library is hijacked |

**Manual (requires the consuming repo's human authority to confirm):**

| Trigger | Example |
|---|---|
| Repeated unplanned outages | Multiple unplanned outages in a short window affecting your consumers |
| Silent breaking changes | Provider behavior changes with no changelog or notice |
| Undocumented throttling | Provider silently throttles beyond any documented limit |
| Unresponsive security team | A reported vulnerability gets no response within the policy window |
| Sunset without migration path | API version deprecated with insufficient notice and no successor |

### §17.3 — Ban execution (agnostic shape)

When banning a provider, the consuming repo executes — in its own concrete artifacts:

1. **Record the ban in the upstream index (§6.2)** with date, reason, and a review date.
2. **Add a ban banner** to the provider's reference artifact.
3. **File a decision / finding record** (this is a decision-capture trigger, §9).
4. **Disable or feature-flag the integration code** — fail-soft per §15.3-C.
5. **Notify live downstream consumers** if any have active connections.
6. **Commit and push immediately** — a ban is a governance event.

The consuming repo's L3 binding names the concrete artifacts (the registry/index file, the reference-file format, the ban-banner template, the notification channel).

### §17.4 — Periodic security health-check

Orthogonal to **drift detection (§6.3)**, which watches *version* drift. This check watches the provider's *security posture*: status / incident pages, security advisories and CVEs, transport-certificate validity and expiry, and endpoint or version changes that carry security implications. **Cadence follows the risk tier (§14).** The mechanism (script, CI gate, manual review) is the consuming repo's choice; the **existence** of the check is mandatory.

### §17.5 — Reinstatement (governed, with probation)

A banned provider returns to active status **only** when all hold:

1. **Root cause remediated** — the issue that triggered the ban is fixed.
2. **Provider confirms** — written confirmation (advisory, incident report, or equivalent) that it is resolved.
3. **Independent verification** — the consuming repo verifies the fix itself, not just the provider's word.
4. **Authority approves** — the consuming repo's human authority explicitly approves reinstatement.
5. **Probation** — the provider returns at grade `C (Caution)` for a probation window before any re-grade upward.

### §17.6 — L3 binding (what the consuming repo owns)

- The **exact weighted scoring rubric** and the numeric grade thresholds.
- **Where the grade lives** (the registry column or inventory field).
- The **reference-artifact format** and the **ban-banner template**.
- The **notification channel** for live consumers.
- The **health-check tooling / command** and the concrete cadence per tier.
- The **provider categories** specific to the product's domain.

This section defines the lifecycle (grade → ban → health-check → reinstate); the L3 binding defines the **instance**. If the L3 binding restates the lifecycle instead of pointing at it, it drifts.

---

## §18 — What this canon does NOT do

- It does **NOT** prescribe specific tools (commit hooks, dependency scanners, drift CI). The consuming repo picks its tooling.
- It does **NOT** prescribe specific licenses to accept or reject. The consuming repo's authority decides license posture.
- It does **NOT** replace the decision-capture canon — it sits on top of it for the upstream-adoption case.
- It does **NOT** define the "small utility" threshold quantitatively. Use common sense; if in doubt, run the protocol — the cost of running it is lower than the cost of an undocumented adoption.
- It does **NOT** govern the operator-personal axis (§8); that lives outside any product repo by design.
- It does **NOT** fix the security-grade rubric, the numeric thresholds, or the ban-banner format (§17); it mandates that a grade exists, that grade `F` blocks integration, and that a reinstatement is governed — the consuming repo owns the rest.

---

## Provenance

This canon was lifted from two product-side canons that had the agnostic substance buried inside product-specific binding:
- A product-side `CANON-UPSTREAM-GOVERNANCE-001` (SEALED 2026-04-08) — the principle, the inventory pattern, the cadence framework.
- A product-side `CANON-THIRD-PARTY-ADOPTION-PROTOCOL-001` (DRAFT) — the 6-step protocol, the constitutional rule, originating from the SurveyJS adoption incident (2026-04-14).

The product-specific content (the actual inventory, baseline file path, stack checks, incident records, vocabulary overlay) **remains at L3** in the consuming repo and binds to this spine. Once this canon is sealed, the two product-side canons restructure to point at this spine and keep only their L3 content.

**Amendment 2026-05-25 (a) (same DRAFT cycle, per Marcelo's directive *"no se quede atrapada en ViTo lo que puede ser agnóstico"*):** §10 (ongoing-update decisions Q1/Q2/Q3), §11 (operating constitutional rules), and §12 (sync execution shape) were lifted from `CANON-UPSTREAM-GOVERNANCE-001` (the product-side §§5, 6, 7, 9) where they had been trapped at L3 despite being agnostic. The product-side canon retains only the inventory, the npm baseline reference, the soldier/cadence assignments, the SpecKit-specific binding, and product-specific overlays.

**Amendment 2026-05-25 (b):** §13 (Risk tiers as orthogonal axis to §4), §14 (Automation policy per tier), and the CVE severity policy folded into §11 rule 3 were lifted from `CANON-OSS-UPDATE-METHODOLOGY-001` (a product-side DRAFT) to resolve the overlap diagnosed during paso 3 scan.

**Amendment 2026-05-25 (c) (Cluster C-7 reconciliation):** §15 (Runtime-location typology Host / Service / External as the third orthogonal axis to §4 and §13) including the "Import vs Curl" Litmus Test, and §16 (Intake & Outcome templates that §3 produces) were lifted from `THIRD_PARTY_ACCEPTANCE_PROTOCOL.md` (a product-side ACTIVE canon). The product-side canon refactors to a thin L3 binding that names the actual gate documents (`VENDOR_EVALUATION_POLICY`, `GOVERNANCE_IMPORTS`, `VENDOR_UI_ADAPTER_CANON`). In the same wave, the duplicate product-side `CANON-DEPENDENCY-UPGRADE-POLICY-001` (DRAFT, never sealed) was **consolidated into** `CANON-OSS-UPDATE-METHODOLOGY-001` (already an L3 binding of this spine) and superseded — its more-complete tier inventory and execution protocol were absorbed.

**Amendment 2026-05-25 (b) (same DRAFT cycle, paso 3 reconciliation):** §13 (Risk tiers as orthogonal axis to §4), §14 (Automation policy per tier), and the CVE severity policy folded into §11 rule 3 were lifted from `CANON-OSS-UPDATE-METHODOLOGY-001` (a product-side DRAFT) to resolve the overlap diagnosed during paso 3 scan. The product-side canon refactors to a thin L3 binding (the actual package lists per tier, the `.github/dependabot.yml` config, the product's file paths, product-specific examples).

**Amendment 2026-06-05 (A#7) — SEALED by Marcelo:** §17 (Provider security-posture lifecycle — grade A/B/C/F as a fourth orthogonal axis, ban triggers, ban execution, periodic security health-check, governed reinstatement with probation) was lifted from a product-side `CANON-API-SECURITY-BAN-POLICY-001` (SEALED 2026-03-30), whose agnostic substance — *"an insecure external provider is worse than none; grade it, ban active incidents, health-check, reinstate via probation"* — was buried under product-specific binding (the `API-REGISTRY.md` Security Grade column, the 12-section `*_API_REFERENCE.md` format, the HTB category, `pnpm api:health-check`, LY-MSG tenant notifications, the exact weighted criteria values). Coverage-check confirmed the gap: §13 (risk tier = blast radius) ≠ provider security trustworthiness; §11 rule 3 (patch **you** apply) ≠ ban when the **provider** degrades; §6.3 (version drift) ≠ provider security posture. The old §17 ("What this canon does NOT do") shifted to §18 (uncited section, zero citation breakage; §15/§16 were verified cited and left intact). The product-side canon restructures to a thin L3 binding (§17.6) pointing here and keeping only its product-specific instance. Additive only — no normative substance removed. **SEALED 2026-06-05 by Marcelo.**

**Amendment 2026-06-05 — RE-SEALED by Marcelo:** §6.1 gained the **bounded-adaptation / do-not-overwrite-on-sync** field (descriptive diff summary alone silently reverts deliberate divergences on a sync); §6.2 broadened from a pinned-dep baseline into the **single discoverable upstream index** across all kinds (forks + deps + runtimes + providers), with `kind`, `cadence`, and `bounded-adaptation?` columns. Lifted as the agnostic generalization of two product-side signals surfaced in `FINDING-UPSTREAM-PROCESS-NOT-STANDARD-2026-06-05` (#2999 actions #4 + #3): the product-side SpecKit fork's `.specify/UPSTREAM.md` (a real bounded adaptation) and Marcelo's "el proceso debe ser estándar y discoverable". Additive only — no normative substance removed. **SEALED 2026-06-05 by Marcelo.**
