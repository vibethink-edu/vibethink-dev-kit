# CANON-DB-SECURITY-BASELINE — Postgres/Supabase exposed-schema security floor (engine-specific · agent-agnostic)

**Status:** SEALED 2026-06-15 by the Principal Architect — agnostic-lift #38
**Date:** 2026-06-15
**Scope:** Repos whose data plane is **PostgreSQL exposed over PostgREST / Supabase** (a REST surface where the `anon` and `authenticated` roles can reach the schema). This canon is **engine-specific by design** — its mechanisms (the `PUBLIC` execute grant, RLS policies, `search_path` pinning, the `anon`/`authenticated`/`service_role` role model, the Supabase Security Advisor) are properties of Postgres + PostgREST. It does **NOT** apply to MySQL, SQL Server, MongoDB, DynamoDB, or any non-Postgres engine — those have their own threat model and must not inherit these rules verbatim. A repo on a non-Postgres engine marks this piece `N-A(non-postgres)`.
**Companion canons:** [`CANON-PRODUCTION-SAFETY`](./CANON-PRODUCTION-SAFETY.md) (what the shipped artifact must not contain — this canon governs what the *exposed database* must not allow) · [`CANON-VERTICAL-BOUNDARY-001`](../architecture/CANON-VERTICAL-BOUNDARY-001.md) (who owns a shared schema's debt) · [`CANON-TESTING-GATE`](./CANON-TESTING-GATE.md) (gate discipline).
**Origin:** lifted from a consuming product's W3–W7 advisor convergence (2026-06-13 → 2026-06-15). The `PUBLIC`-grant discovery (§3) and the self-test migration discipline (§9) are battle-proven: the product's own embedded self-test caught a silent no-op revoke against cloud before it could be declared a success.

---

## §1 — Principle

**On a Postgres schema reachable by `anon`/`authenticated`, a privilege you did not explicitly close is open.** Supabase/PostgREST publish the schema; the published `anon` key reaches every object the `anon` role can touch, with no login. The default Postgres grant model is *permissive* (EXECUTE to `PUBLIC`, no RLS until enabled), so "we never granted access" is **not** the same as "access is denied." The floor below is the set of closures that must be true before a Postgres/Supabase schema is considered safe to expose.

> **Iron rule:** the absence of an explicit grant is not a denial. Deny is a thing you *do*, per object, and *verify*.

---

## §2 — `SECURITY DEFINER` functions are not anonymously executable

A `SECURITY DEFINER` function runs with the **definer's** privileges. If `anon`/`authenticated` can `EXECUTE` it via `/rest/v1/rpc/...`, an anonymous caller acts with elevated rights — a privilege-escalation surface.

- **Deny by default:** no `SECURITY DEFINER` function in an exposed schema is executable by `anon`/`authenticated` **unless** a documented, audited allowlist entry says it must be (e.g. an anonymous-portal RPC like a public branding-by-slug lookup).
- The allowlist is **derived from real client call sites** (grep the app's `.rpc()` usage), not guessed. Control-plane functions (tenant creation, role/claim setters, seeders, system-event loggers) are never on it.

## §3 — Revoke from `PUBLIC`, not just from the roles (the silent no-op)

**This is the discovery that this canon exists to encode.** Postgres grants `EXECUTE` on every function to the pseudo-role `PUBLIC` at creation. `anon` and `authenticated` are members of `PUBLIC`, so they **inherit** EXECUTE through it.

> `REVOKE EXECUTE ON FUNCTION f() FROM anon, authenticated;` is a **no-op** if the privilege comes from `PUBLIC` — `has_function_privilege('anon', f, 'EXECUTE')` stays `true`.

The correct closure:

```sql
REVOKE EXECUTE ON FUNCTION public.f(args) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.f(args) TO service_role;   -- keep server-side callers
```

The same `PUBLIC`-inheritance trap applies to table/sequence grants. **Always verify with `has_*_privilege(role, obj, priv)` after revoking** — a revoke that "ran" is not a revoke that "took."

## §4 — No anonymous write policies; no `USING(true)` write for `anon`

- **RLS enabled** on every table in the exposed schema.
- **No `FOR ALL / INSERT / UPDATE / DELETE` policy with `USING(true)`/`WITH CHECK(true)` granted to `anon`** — that is unrestricted, cross-tenant, unauthenticated write.
- Writes are one of: **server-side via `service_role`** (internal), or **`authenticated` + tenant/row scoped**, or **token-validated server-side** (e.g. a signed grant token checked in an API route). A browser writing an exposed table directly with the **anon key** is an anti-pattern, not a shortcut — route it server-side.
- A table that is RLS-on with **zero policies** is deny-all but still trips `rls_enabled_no_policy`; add an **explicit `FOR ALL TO service_role`** policy to document service-role-only intent and silence the advisor.

## §5 — Pin `search_path` on every function

A function without a fixed `search_path` is exposed to search-path injection (a caller resolves an unqualified name to an attacker object, executed with the function's privileges — acute for `SECURITY DEFINER`). Pin it on **every** function:

```sql
ALTER FUNCTION public.f(args) SET search_path = public, extensions, pg_catalog;
```

`SECURITY INVOKER` functions are not injectable (caller's privileges) but are pinned anyway for determinism. **Stragglers are expected:** a function added *after* a sweep arrives unpinned — the gate (§8) catches it, not a one-time fix.

## §6 — Extensions out of `public`

Install extensions (`vector`, `pg_trgm`, `moddatetime`, …) in a dedicated `extensions` schema, not `public`. Moving an existing extension can require recreating dependent indexes/columns — treat it as its **own** migration with a tested rollback, never bundled.

## §7 — No materialized views or private buckets exposed to `anon`

- **Materialized views ignore RLS** — any anon/authenticated SELECT is a flat read of the whole view. Revoke `anon`/`authenticated` from exposed matviews; serve them server-side.
- **Storage buckets are private by default**; a bucket that allows public listing exposes every object key. Public only by explicit intent.
- Enable **leaked-password protection** (HaveIBeenPwned) — a one-toggle auth hardening.

## §8 — The Supabase Advisor (linter) is the gate — so warnings don't grow

The recurring failure is **drift**: a schema is cleaned once, then new objects re-open the same classes. The closure is a **gate, not a cleanup**.

- The **Supabase Security Advisor** (Database → Advisors → Security) is a **required check** at CI and/or pre-cutover.
- **Green = 0 security Errors + 0 security Warnings**, or each surviving item carries a documented exception (rationale + owner) in the repo.
- A new security-class warning **fails the gate** the same as a failing test. This is what prevents regression — §2–§7 are the rules; §8 is the thing that *bites*.

## §9 — Migration discipline: catalog-driven · idempotent · self-testing

DB-security migrations follow the proven shape:

- **Catalog-driven** — iterate `pg_proc` / `pg_tables` / `pg_policies` and act on what matches, rather than hardcoding object names (survives schema growth).
- **Idempotent** — guarded by `has_*_privilege` / `to_regclass` / `NOT EXISTS`; re-running is a no-op.
- **Embedded self-test** — end with a `DO $$ … RAISE EXCEPTION … $$` that re-checks the invariant and **rolls back** if the migration's own goal isn't met. This is non-negotiable: it is what turns §3's silent no-op from a false "success" into a caught failure.

## §10 — Boundary: who fixes a shared-schema warning

When verticals share one Postgres project (schema-per-vertical), the advisor reports the **whole** project's debt. Per [`CANON-VERTICAL-BOUNDARY-001`](../architecture/CANON-VERTICAL-BOUNDARY-001.md): a vertical **flags** debt outside its schema (duty to flag — shared cloud blast radius) but **routes the fix to the owner**; it does not edit another vertical's objects. The advisor's `schema`/object names identify the owner.

---

### Adoption note
A consuming repo binds this at L3 by naming: its migrations dir, its advisor/lint command, and its CI gate wiring. Postgres/Supabase repos adopt; non-Postgres repos mark `N-A(non-postgres)`.
