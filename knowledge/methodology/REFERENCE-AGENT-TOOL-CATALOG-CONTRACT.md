# REFERENCE-AGENT-TOOL-CATALOG-CONTRACT — portable catalog of agent-callable capability tools

**Status:** **SEALED 2026-07-23** by the Principal Architect (chat: "SELLA") — D-078. Adopted as the surface-independent capability gateway with two additions vs the 2026-07-09 proposal (§3.2 identical-verdict corollary + §3 bullet 6 no-simulation), after two architecture-advisor rounds. Fire-test passed (l1-neutrality GREEN). *(Original proposal 2026-07-09; seal deferred to the normal authority + PR path.)*
**Date:** 2026-07-09
**Scope:** Any repo where more than one agent surface (assistant, in-context advisor, twin/avatar, coder, orchestrator) needs to invoke the same governed capabilities on domain/business data.
**Home:** the dev-kit (supra-repo). Inherited by consuming repos as upstream contract → local binding.
**Binds:** `CANON-DEVELOPMENT-PROCESS §8.1` (dual-surface parity — a capability's agent plane). This reference is the **discovery/registration instrument** that lets §8.1's agent plane be registered once and consumed by many agents.
**Companions:** `REFERENCE-OPERATOR-COMMAND-CATALOG` (human prompt triggers) and `REFERENCE-EXECUTABLE-CLI-CATALOG-CONTRACT` (runnable repo commands). This reference is the third sibling: **domain-capability tools that agents call**, not human prompts and not repo scripts.

---

## §0 — What this is (and is not)

An **agent tool catalog** is a machine-readable inventory of the capability tools a repo exposes **for agents to invoke** against domain/business state: tool id, the capability it belongs to, read-vs-write class, propose/apply mode, input schema, permission handle, evidence expectations, and discovery metadata (preconditions, side-effects, examples).

The defining property is **register once, consume N**: a capability registers its tool **one time, from one source**, and **every** agent surface (assistant, in-context advisor, twin, coder, orchestrator) consumes it from the **same** catalog. Building the same lookup twice — once per agent surface — is the failure this contract exists to prevent.

It is **not** an execution or authorization authority. A catalog entry says "this tool exists and this is its contract"; whether a given caller, tenant, actor, or **plan/seat** may invoke it is decided by the repo's authorization and entitlement authorities — **out of scope of the catalog** (§2 `permission`, §3.5).

It is **not** the operator command catalog (human prompts) and **not** the executable CLI catalog (repo scripts). Those catalog different objects for different callers; keep the three separate (§4).

It is **not** a second brain per feature. A surface that hosts its own model loop and its own private tools, instead of consuming the shared catalog through the governed engine, is the anti-pattern this contract replaces.

---

## §1 — Authority order

1. The capability's local implementation owns the actual behavior and its governed agent plane (§8.1).
2. The exported catalog owns the portable discovery/registration contract — one entry per tool, one source.
3. The dev-kit schema and checker own the minimal shape that makes the export consumable by any agent surface.
4. A generated adapter, agent surface, UI, or orchestrator never outranks the catalog, and never re-declares a tool it should consume.

A stale or duplicated catalog is worse than none: it invites two agents to trust two divergent maps of the same capability.

---

## §2 — Portable contract

The portable JSON export MUST carry:

```json
{
  "schemaVersion": "agent-tool-catalog.schema:v1",
  "schema": "./path/to/agent-tool-catalog.schema.json",
  "catalogVersion": "2026.07.09",
  "project": "consumer-repo",
  "tools": [
    {
      "id": "domain:query_thing",
      "capability": "domain",
      "kind": "read",
      "mode": "read",
      "inputSchema": "./schemas/query_thing.input.json",
      "permission": "domain.thing.read",
      "surface": "domain",
      "discovery": {
        "preconditions": ["actor is entitled to the capability"],
        "sideEffects": [],
        "examples": ["ask: what is the state of thing X"]
      },
      "provenance": true,
      "description": "Read-only lookup of a domain object for an authorized actor."
    }
  ]
}
```

Field rules:

- `id` is stable and machine-facing. Lowercase ASCII with `:` or `-` separators.
- `capability` names the capability the tool belongs to — the routing + governance bucket.
- `kind` is `read` or `write`; a `write` tool is a mutation-class action (§8.1) and carries the write obligations (idempotency, propose/apply, provenance).
- `mode` is `read` or `propose_apply`; tenant-visible or irreversible actions MUST be `propose_apply` — the agent proposes, a governed authority applies.
- `inputSchema` points to a JSON-Schema for the tool's arguments (machine-validated at the boundary).
- `permission` is the authorization handle the repo's authority evaluates; the catalog declares it, it does not enforce it.
- `surface` is the responsible domain/frente that owns and registers this tool (accountability, not exclusivity).
- `discovery` carries preconditions, side-effects, and examples so an agent knows *when and how* to call safely, not only *that* it exists.
- `provenance` asserts that invocations are recorded (which agent, on whose behalf, why).
- `description` is short, factual, free of secrets.

The schema lives at `setup/templates/agent-tool-catalog/agent-tool-catalog.schema.json`.

---

## §3 — Consumer responsibilities

A consuming repo that adopts this contract SHOULD provide:

1. A registration path where each capability/surface declares its agent tools **once** into the governed catalog (not inline per route, not copied per agent surface).
2. A single governed engine/broker that every agent surface calls to invoke a catalogued tool — so the advisor, the assistant, the twin, and coders all traverse the same catalog, not private loops. The **same actor + tenant + capability resolves to the same authorization verdict from any surface**; a surface is context and audit, **never authority** — neither a UI nor a prompt grants permission; actor/tenant/scope derivation belongs to the delegated actor handle (`REFERENCE-AGENT-NATIVE-SURFACE-CONTRACT-001` §4), not to this catalog.
3. A gate that validates the exported catalog against this contract, and a drift check tying local tool implementations to their catalog entries.
4. A **responsible surface** recorded for every tool (§2 `surface`) — the domain accountable for the tool's contract. This is domain accountability, not agent ownership.
5. **Consumption governance the catalog defers to, not defines:** authorization per verb/tenant/actor (§8.1), and an **entitlement/plan authority** deciding whether a tenant's plan enables the capability and **how many actors (seats) are enabled** — deny-by-default. The catalog carries the `permission` and `capability` handles; the repo's entitlement authority resolves them. Metering/quota per §8.1 applies.
6. **No-simulation enforcement:** the engine offers only tools present in the catalog and passing conformance; an absent or failing tool is **never simulated** — an unavailable capability is answered with the truth, not a pretended result or a promise.

The kit does not prescribe the storage of the registry, the entitlement model, the seat/plan vocabulary, or the engine implementation. Those are local bindings.

---

## §4 — Relationship to the sibling catalogs

Use all three, kept separate:

| Catalog | Reusable object | Typical consumer | Authority |
|---|---|---|---|
| Operator command catalog | prompt trigger + output contract | human operator → agent | methodology prompt contract |
| Executable CLI catalog | runnable command metadata | agent/UI/orchestrator → repo command | local repo command contract |
| **Agent tool catalog (this)** | **domain-capability tool metadata** | **many agents → domain capability** | **capability's governed agent plane (§8.1)** |

An agent tool may be surfaced by an operator command or wrap an executable command, but the three are registered separately: a human prompt is not a domain tool, and a repo script is not a governed business capability.

---

## §5 — Gate behavior

A reference checker validates a catalog exported as JSON. It reads either a `catalog` file path or a `catalogCommand` argv whose stdout is the catalog JSON, and verifies:

- required top-level fields exist;
- tool ids are unique and match the stable id pattern;
- each tool carries all required fields with expected primitive types;
- `kind`/`mode` are drawn from the allowed sets and `write` tools declare `provenance: true`;
- optional `requireInputSchemas` verifies each `inputSchema` resolves to an existing local file.

It does not invoke the listed tools, does not evaluate `permission`, and does not decide entitlement. Discovery contract only.

---

## §6 — L1 / L3 line

- **L1 (this reference):** the existence of a portable agent-tool catalog contract, the register-once-consume-N property, the required fields, the schema template, and the checker behavior.
- **L3 (consuming repo):** the actual tool ids and implementations, the registry storage, the governed engine, the **entitlement/plan/seat authority and its enforcement**, the permission vocabulary, and which gates are required in CI.

If concrete product tools, tenants, plans, or seat models leak into this reference, the fire-test fails.

---

## §7 — Provenance

Forced by a real consumer sequence: several agent surfaces (an assistant, an in-meeting advisor, a twin, an orchestrator) each grew **their own model loop and their own private data lookups**, several of them stubbed and dead, so the same "look this up in the business data" tool was half-built two and three times and consumed by exactly one surface each. The reusable lesson is not the consumer's tools; it is the contract that lets a capability register a tool **once** and have **every** agent discover and invoke it — with authorization and entitlement resolved by the repo, not by the catalog.

**Fire-test:** names no product, tenant, person, provider, plan, seat model, or concrete consumer path. PASS.
