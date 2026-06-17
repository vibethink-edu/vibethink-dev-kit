# CANON — Testing Minimum Bar (universal · agent-agnostic)

> **Scope:** every repo that ships code. Vendor-neutral, product-neutral, language-neutral.
> **Status:** approved (fire-test passed: no product, vendor, framework, language, or methodology name appears here).
> **Home:** the dev-kit (supra-repo). Inherited by every repo as upstream → fork.
> **Family:** quality discipline · companion of `CANON-VISUAL-BUG-TRIAGE-001.md` · binds with `CANON-DEVELOPMENT-PROCESS.md` (governance precedes code).

## 1. Root principle

> **No tests = not done.**

A feature, fix, or refactor without tests is **incomplete work that was checked in**. It is not "ready to ship" — it is "ready to break silently for the next person who touches it." The minimum bar exists because zero tests on conditional logic is the cheapest possible source of incidents that look like infrastructure problems and are actually code problems.

## 2. The minimum bar

For every new function with **conditional logic** (any of: `if`, `switch`, `filter`, `find`, ternary `? :`, null-coalescing `?? :`, error handling, retry, race, timeout, polymorphic dispatch), the author commits, in the same change:

| Required | Why |
|---|---|
| **1 happy-path test** | Proves the function does what it claims when inputs are well-formed |
| **1 failure-mode test** | Proves the function fails as designed when inputs are NOT well-formed (or returns its documented error) |

That is the floor. Functions with multiple distinct failure modes need a test per mode. Functions with no conditional logic (pure transforms, getters, simple wrappers) are exempt from the failure-mode requirement but still need at least the happy-path assertion.

## 3. Scope of the rule

The rule applies to:
- New functions / methods / classes / modules **with conditional logic** in any service, library, package, or runnable.
- Modifications to existing functions that add or change conditional logic (per scout rule §4).

The rule does NOT automatically apply to:
- Pure type definitions / interfaces / schemas (no logic to test).
- Configuration files (declarative, not runtime logic).
- Build scripts that do not gate production behavior.
- One-off scripts that produce a one-off output and are never re-executed.

Per-repo binding declares which directories / file patterns fall under the rule (e.g. "everything in `src/services/`, `src/lib/`, `packages/*/src/`" — but routes, components, types, config typically exempt; see §6).

## 4. The scout rule

> **Touch a function → add at least one test in the same change.**

If you modify a function that has zero tests, you write at least one before merging. You do not need to retroactively cover the whole module — but you stop the rot at the function you touched. This keeps coverage growing instead of being a perpetually-deferred cleanup project.

## 5. The pre-GO check (60 seconds, before any new function)

Before writing the function, name three things out loud (or in the briefing):
1. **The testable unit** — what is the function's contract, in one sentence?
2. **The failure mode** — what is the most likely way this can be called wrong or fail at runtime?
3. **Where the test goes** — what file, what test name?

If you cannot answer all three in 60 seconds, **the design is not ready**. Step back to specification, not to writing untestable code.

## 6. Service self-test (for integration modules)

A module that integrates with an external system (database, third-party API, queue, file system, OS process) ships with a **self-test endpoint** (or equivalent invocable command) that returns the structured count:

```
{ "passed": N, "failed": M, "total": N+M }
```

The self-test exercises the integration's real failure modes (auth, timeout, malformed response, missing record) against the real configuration of the running environment. Demo-readiness requires `failed = 0`.

The specific endpoint shape (`GET /api/<service>/selftest`, a `cli <service> selftest` command, a runner subcommand) is per-repo binding; the **contract** of `{passed, failed, total}` is universal.

### 6.1 — The toolchain must be alive *(SEALED 2026-06-11 by the Principal Architect — "SEAL DALE", agnostic-lift batch G→Z)*

The minimum bar presumes the tests **actually run**. A workspace whose test script invokes a runner that is not installed, or whose test files import a framework the workspace does not use, produces the worst failure mode this canon exists to prevent: **silent false green** — tests that appear to pass because nothing executed. Therefore:

- **One declared runner per workspace.** Hybrid or orphaned toolchains (script says runner A, imports say framework B, dependencies say neither) are a violation on sight, corrected before merge.
- **Verified alive.** "The test command exits 0" is not evidence; *the runner executed N tests* is. A zero-test run on a workspace with test files is a red flag, not a pass.

Which runner, and any consolidation plan from a legacy mix, are per-repo binding; the **one-live-declared-runner** rule is universal.

### 6.2 — Env-portable integration self-tests *(PROPOSED 2026-06-17 — pending Principal Architect seal; from a consumer's wire-to-cloud finding)*

§6.1 guarantees the toolchain is alive. A sibling failure mode it does not name: an
**integration** self-test can be **alive against the development seed and dead against the
deployed environment** — because its fixtures depend on seed data that exists only locally.
The suite then verifies the integration's *logic* in a seed environment, not its
*behaviour* in the environment that gives the true signal. The result is **false confidence
about deployed behaviour**: green at the gate, the deployed path never exercised.

Therefore, an integration self-test **provisions its own fixtures** — ephemeral, in a
transaction with rollback, or set up and torn down — rather than depending on seed data.
So it runs against **any** environment (a local mirror *or* the deployed one), and the
"verified alive" of §6.1 strengthens to **"alive against the environment that gives the
true signal — the deployed one — not only the dev seed."**

A self-test that cannot run against the deployed environment because its fixtures are
seed-bound is a §6.2 gap: it proves logic, not deployed behaviour. (This is
`REVIEW-READINESS-PROTOCOL` §1 — *"test in the layer that gives the true signal"* — applied
inside the minimum bar.) The concrete fixture mechanism is per-repo binding; the
**self-provisioning, env-portable** rule is universal.

## 7. What this canon does NOT do

- It does **not** prescribe a specific testing framework (Jest, Vitest, pytest, Go test, JUnit, whatever the language standard is).
- It does **not** prescribe coverage percentages — the bar is "per-function minimum," not "global aggregate."
- It does **not** require end-to-end (E2E) tests for everything — those follow a separate discipline (see the review-call checklist for what E2E proves vs unit).
- It does **not** mandate test-first / TDD — the rule is the test ships **in the same change**, not before the code.
- It does **not** require test changes for trivial refactors that preserve behavior and add no conditional logic.

## 8. The throughline

> **Tests are the contract. Code is the implementation. Shipping code without its contract is shipping IOU.**

A bug found in production for which no test existed is a **doubled failure**: the bug itself, and the gap that let it slip. The minimum bar closes the gap at the smallest possible scope (per-function) with the smallest possible cost (one happy + one failure path).

## 9. Per-repo binding

Each consuming repo declares:
- Which directories the rule applies to (typically `services/`, `lib/`, library `src/`).
- Which directories are exempt (typically routes, components, types, config, one-off scripts).
- The testing framework + command (so CI can enforce).
- The self-test endpoint pattern for integration modules (§6).
- Whether the rule is currently advisory or blocking in CI.

## 10. Inheritance

This kit is the **upstream** of governance. Each repo is a **fork** that inherits this canon. Per-repo bindings stay in that repo's own layer; they never flow into this neutral core.

## Fire-test

This document names no product, vendor, brand, framework, language, or methodology. Those bind at L2/L3.

## Provenance

Distilled from a real product-repo's rule that emerged after a production demo failed due to a swallowed exception on a 1,300-line module with zero tests. The rule, codified locally, was generalized here on 2026-06-03 after the dev-kit-adoption audit identified it as agnostic.
