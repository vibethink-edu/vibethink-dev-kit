# Mutation testing — reference practice (universal · opt-in lens)

> **Status:** REFERENCE PRACTICE (L1-agnostic). **Not** canon, **not** sealed, **not**
> a gate. An optional lens, applied by judgment.
> **Home:** the dev-kit (supra-repo). Inherited by every repo as a pointer, not a
> dependency.
> **Relationship:** complements the "tests exist" discipline (a product's testing
> policy) with a structural check on whether those tests actually *catch* regressions.
> It does **not** amend or supersede any testing policy, and it adds no required gate.
> **Tool:** a standalone sibling harness (see *Invocation*), vendor-per-language;
> vendor names below appear only as per-language examples, never as the practice itself.

## 1. What it is

"Tests exist and pass" proves the tests *run*. It does not prove they would *fail* if
the code broke. Mutation testing closes that gap: it introduces small, deliberate
faults (**mutants**) into the source — flip a `>` to `>=`, drop a branch, negate a
condition — then re-runs the tests. A test suite that still passes against a mutant
has a **blind spot**: it does not actually assert the behavior that mutant changed.

- A mutant the suite catches is **killed**; one it misses **survives**.
- The **mutation score** = killed / total. Surviving mutants are the actionable
  output — each is a concrete assertion the tests are missing.

This is a *depth* check on existing tests, orthogonal to coverage (coverage says a
line ran; mutation says a line is actually *asserted*).

## 2. When to apply it (the judgment — this is the valuable part)

Mutation testing is **selective and opt-in**. Run it on code where a silent,
test-passing regression is expensive or dangerous:

- **Critical modules only** — authentication / authorization, payments, tenant
  isolation / row-level access, secrets handling, and **core business logic with real
  branching** (the rules an application is actually trusted for).
- **At a chosen moment** — before sealing a risky module, after a refactor of one,
  or when a bug slipped past a green suite (the suite had a blind spot — find the
  rest). Not on every commit.

## 3. When NOT to apply it

- **Not a universal gate.** It never blocks CI for the whole repo, and it is not a
  per-file requirement. Forcing it everywhere produces noise and slow runs, and earns
  resistance to a tool that is valuable when aimed.
- **Not for** routes/controllers, presentation components, config, types, or scripts
  — low branching density, low payoff.
- **Not preemptively adopted** as a dependency in each repo. The harness is invoked
  standalone (next section); it is not installed per-project.

## 4. Invocation (verified pattern)

The harness lives as a **neutral sibling** to the product repos (alongside them, not
inside any one of them), holding the runner and its dependencies so no target repo
takes them on. **One tool per language** — e.g. Stryker for TypeScript, mutmut for
Python, Pitest for Java — chosen by the target's language, never a fixed vendor.

The pattern (TypeScript, validated stack — Stryker 9.x + a test-runner or
command-runner against the repo's own tests):

1. In a config, point `mutate` at the **specific critical file(s)** to probe.
2. Point the runner at **those files' tests** (a focused command — the whole suite is
   unnecessary and slow).
3. Run from a **target repo with healthy dependencies**, e.g.
   `cd <repo> && npx stryker run <config>`.
4. Read the surviving mutants; for each, add the missing assertion (or justify it as
   an equivalent mutant).

Keep the run **narrow** — a handful of critical files, their focused tests — so it
finishes fast and the output is actionable.

## 5. Status of the tooling (honest)

The harness is **built and ready to invoke, but not yet validated against real code.**
The first smoke attempt was blocked by an unrelated dependency-graph problem in the
target repo (a stale worktree symlink), not by the tool. Any TypeScript project with
healthy dependencies is a valid first smoke target. Treat the tool as *available and
opt-in*, not *proven*, until a green run against real code exists (see the gate below).

## 6. Promotion to canonical hosting (deferred — watchlist)

Today the dev-kit **references** this practice and points to the sibling harness
(reference-and-pointer). Moving the harness *into* the kit under a canonical
`tools/` location (single-source-of-truth, invoked from one place by any repo) is
**deferred** until a real need and real proof exist. Promote only when **both** hold:

1. **Proven** — at least one green mutation run against real code (the kit's own
   TypeScript, or another healthy repo).
2. **Demanded** — two or more repos actually invoking it from a canonical location
   (build on real pain, not preemptively).

Until both are met, the harness stays a sibling and this doc stays a reference. This
mirrors how other cross-repo dev-tools earned their place in the kit: dogfooded and
proven first, consolidated second.

## See also

- `CANON-DEVELOPMENT-PROCESS.md` — governed execution & verification (this lens
  deepens the verification step; it does not change the gate).
- `VT-METHOD.md` — the house binding; mutation testing is an optional lens *within*
  governed execution, never a new mandatory pillar.
