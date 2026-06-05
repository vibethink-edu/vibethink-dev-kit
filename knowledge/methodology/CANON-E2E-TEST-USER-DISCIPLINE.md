# CANON-E2E-TEST-USER-DISCIPLINE — E2E auth-test safety (universal · agent-agnostic)

> **Scope:** every repo whose end-to-end / integration tests authenticate against a real auth provider.
> Vendor-neutral, product-neutral, tool-neutral.
> **Status:** DRAFT — awaiting human-authority seal.
> **Home:** the dev-kit (supra-repo). Inherited by every repo as upstream → fork.
> **Siblings:** `CANON-TESTING-MINIMUM-BAR` (unit-level minimum bar — explicitly defers E2E to this canon) · `CANON-AGENT-SCOPE-DISCIPLINE` (the Finding Protocol used in §8).

---

## §1 — Root principle

> **E2E tests NEVER touch a real account. They do not read it, modify it, delete it, or create it as a side effect.** A test that authenticates creates an ephemeral user for that run and deletes it at the end. Real accounts are off-limits as test subjects — without exception.

This canon exists because the cost of breaking it is borne by a human: a test that mutates a real account can lock out a team member, a client, or the human authority — and the damage is often invisible unless the auth provider happens to log it.

---

## §2 — Definitions

- **Real account** — any user in the auth store whose identity belongs to a team member, a client, an active or demo tenant, or any person/organization outside the test ecosystem. (An ephemeral user that outlived its run and was never cleaned up is also a real account now.)
- **Ephemeral E2E user** — a user created in the test's `beforeAll` (or equivalent setup), with a unique prefix and timestamp, meant to exist only during that run. Canonical format: `e2e.<test-slug>.<unix-timestamp>@<test-domain>`.
- **Destructive auth action** — any `UPDATE` / `DELETE` / side effect on the auth store (password, email, metadata, factors): the provider's admin user-update/delete calls, magic-link generation against an existing account, direct SQL, etc.

---

## §3 — Hard prohibitions

No test — by any agent (AI or human) — may:

1. Perform a destructive auth action on a real account, under any circumstance.
2. Reuse a real account as the **subject** of a test, even "read-only."
3. Use a service-role / admin credential to touch the auth store **except** to create and clean up the ephemeral E2E users the test itself created.
4. Leave ephemeral E2E users uncleaned after the test finishes.
5. Hardcode real-account emails in test files (`**/*.spec.*`, `**/*.test.*`, `e2e/**`, `playwright/**`, `cypress/**`, equivalents).

---

## §4 — The mandatory pattern for auth tests

Create ephemeral in setup, delete in teardown. Illustrative shape (the admin-API calls are provider-specific — substitute your provider's equivalents):

```ts
let e2eUser; // { id, email, password }

beforeAll(async () => {
  const ts = Date.now();
  const email = `e2e.feature-x.${ts}@<test-domain>`;
  const password = randomSecret();
  const { data } = await authAdmin.createUser({ email, password, confirmed: true });
  e2eUser = { id: data.user.id, email, password };
});

afterAll(async () => {
  if (e2eUser?.id) await authAdmin.deleteUser(e2eUser.id); // delete the whole account
});
```

**Forbidden** — touching a real account as subject, or mutating an existing account "to prepare the test":

```ts
// ❌ real account as subject
await page.fill('#email', 'admin@<product-domain>');

// ❌ mutating an existing account in setup
await authAdmin.updateUserById(SOME_REAL_ID, { password: 'test-password' });
```

---

## §5 — Elevated roles (admin / support / superuser)

Tests that need an elevated role do **not** use a team account (not even a test-tenant admin). They:

1. Create an ephemeral E2E user.
2. Assign the elevated role at creation time (e.g. via the provider's `app_metadata`/claims in the same create call).
3. Delete the whole account in teardown (the role goes with it).

---

## §6 — Shared fixtures (rare, avoidable)

If several tests must share a seed user:

1. The fixture lives in a dedicated test-fixtures path, owned and documented (created-when / cleaned-when).
2. Its email uses an `e2e.fixture.<name>@<test-domain>` prefix.
3. Its password is a CI secret distinct from any production secret.
4. It is registered in the repo's fixtures index so its lifecycle is visible.

---

## §7 — Execution gates

- **Pre-commit / CI gate.** A governance check greps test files for emails on the product/client domains and **blocks** any that do not start with the `e2e.` prefix; it also blocks destructive auth-admin calls (`updateUserById`, `deleteUser`, equivalents) that lack a matching `createUser` on the same id in the same file. Wire it into the repo's governance gate set.
- **CI post-run residue check.** After the E2E suite, query the auth store for users with the `e2e.` prefix older than 24h; `count > 0` → warning reported to the human authority (non-blocking).

---

## §8 — Incident response

If an agent discovers that a test touched a real account (via audit log or report):

1. **STOP.** Do not run more tests or deploy the offending change.
2. Document the incident as a finding (`FINDING-E2E-USER-CONTAMINATION-<date>` in the coordination lane): offending PR/commit, actor (agent), timestamp, affected users, audit-log evidence.
3. Revert the auth-store changes via the admin API, using values **authorized by the human authority**.
4. Open a hotfix that removes the violation.
5. Amend the consuming repo's L3 binding if a new bug class was found.

---

## §9 — Authority and precedence

This discipline outranks: a PR's delivery speed; the convenience of reusing accounts; *"it's just a test"*; *"the test passed before."*

It yields only to: an explicit written amendment by the human authority, or a higher sealed canon.

Any agent that sees a violation in another's PR is **obligated** to: leave a comment citing this canon § and the repo's L3 binding; block the merge until corrected; and if already merged, run §8.
