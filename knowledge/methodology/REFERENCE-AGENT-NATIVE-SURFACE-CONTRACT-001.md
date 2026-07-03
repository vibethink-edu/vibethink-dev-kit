# REFERENCE-AGENT-NATIVE-SURFACE-CONTRACT-001 - Practical contract for dual-surface capabilities

**Type:** Reference (implementation guidance).  
**Status:** PROPOSED reference, derived from observed second-consumer pain.  
**Scope:** Any repo applying `CANON-DEVELOPMENT-PROCESS.md` §8.1
dual-surface parity. Neutral, product-neutral, vendor-neutral, model-neutral.

This reference does not create a new rule. The rule already lives in
`CANON-DEVELOPMENT-PROCESS.md` §8.1: a capability is complete only when the
human surface and the programmatic surface both exist, are governed, and are
proven by execution. This file gives implementers a concrete, reusable shape for
building that rule without rediscovering the same boundary patterns.

## 1. Vocabulary

- **Capability:** a user-meaningful operation or workflow, not a random helper.
- **Human surface:** the GUI or human-facing command surface.
- **Programmatic surface:** the agent/API plane for the same capability.
- **Capability registry:** the source that names the operation, inputs, outputs,
  side effects, permissions, events, examples, and version.
- **Runtime envelope:** the versioned request/response wrapper that crosses a
  boundary between a consumer and a capability runtime.
- **Delegated actor handle:** an opaque, short-lived proof that a server minted
  for an agent to act on behalf of a real authenticated principal.
- **Tool provider:** a server-side callback surface that exposes capability
  discovery and execution to an agent.
- **Conformance fixture:** a static example payload plus negative cases that
  both producer and consumer parse in tests.

## 2. The minimum contract

For a non-trivial capability, the L3 binding should name these artifacts:

| Artifact | Purpose |
|---|---|
| Capability registry entry | One source of truth for human and programmatic projections. |
| Human projection | The GUI route/component/command that humans use. |
| Programmatic projection | API/tool/CLI/workflow surface with read/mutate/observe/emit as applicable. |
| Delegation mechanism | How an agent proves it acts for a real principal without receiving raw secrets. |
| Runtime envelope fixture | Versioned happy-path and negative payloads shared across boundary tests. |
| Conformance probe | Execution test proving the plane lives, not just that it was declared. |
| Verification surface | Independent machine-truth view for the governing human, per §8.2. |

If one artifact is intentionally absent, the escape is explicit, human-approved,
logged, and more expensive than building the artifact.

## 3. Derive both doors from one source

Do not design the GUI first and bolt an agent API on later. The capability
registry is the shared source:

```text
capability
  -> human projection
  -> programmatic projection
  -> conformance fixture/probe
  -> verification surface
```

The registry does not have to be a specific file format. It may be a route
manifest, schema registry, OpenAPI/GraphQL/AsyncAPI source, server-action table,
or another L3-native source. What matters is that the two projections cannot
drift silently.

## 4. Delegated actor handle

An agent does not become the user by receiving the user's raw credential. A
server mints a delegated actor handle with these properties:

- **Opaque to the client:** the client cannot derive secrets, roles, tenant
  membership, or provider credentials from it.
- **Short-lived:** expires quickly and is replay-resistant where mutation is
  possible.
- **Scoped:** names the principal, tenant/scope, allowed verbs, surface, and
  audience/runtime.
- **Server-minted:** role, tenant, surface, and principal are derived from the
  authenticated session and server-side authorization, never from client hints.
- **Server-validated:** every tool/runtime call validates expiry, audience,
  scope, and current authorization before doing work.
- **Auditable:** mutations record both the real principal and the acting agent or
  runtime, plus the reason/correlation id.

The handle is a delegation proof, not a permission shortcut. It may allow a
runtime to call back into a product, but it never bypasses that product's normal
authorization and tenancy checks.

## 5. Runtime envelope

Boundary calls use a versioned envelope. The exact fields are L3, but the shape
should carry:

- `version` or equivalent contract id.
- `messages` or operation input, bounded and schema-validated.
- `context` with non-authoritative hints such as locale and surface.
- `actor_auth` or equivalent delegated actor handle.
- `idempotency_key` for mutation-class work.
- `correlation_id` for logs, traces, and audit.
- `surface_context` minimized to what the runtime needs.

Hard limits:

- No raw secrets.
- No service credentials.
- No unbounded personal data.
- No client-asserted role, tenant, or principal as authority.
- No mutation-class side effects without idempotency, provenance, and a governed
  apply/propose decision.

## 6. Tool provider surface

When the programmatic plane is exposed as tools, use a two-part server surface:

1. **Manifest/discovery:** lists tools, inputs, preconditions, side effects,
   version, examples, and required scopes.
2. **Execute:** performs the call after auth-first validation.

Execution rules:

- Auth and tenant/scope validation happen before parsing work-specific payloads.
- Read returns scoped data only.
- Mutate supports dry-run/propose when the action is tenant-visible,
  irreversible, or governed.
- Observe and emit are separate: emit is mutation-class and needs the same
  governance as mutate.
- Errors are typed and machine-readable, with retryability and user-safe
  messages separated.

## 7. Conformance fixtures

Every boundary needs fixtures that are used by both sides:

- A minimal valid envelope.
- A maximal valid envelope for expected optional fields.
- Negative cases for missing actor handle, stale version, wrong audience,
  unauthorized scope, replay/idempotency conflict, and invalid context.
- A response fixture for success and typed failure.

The fixture is not documentation only. It is imported by tests in the producer
and the consumer. If a runtime and a caller parse different fixtures, the
contract is not shared.

## 8. Testing matrix

Minimum tests for an agent-native capability:

| Test | What it proves |
|---|---|
| GUI smoke | Human surface still works. |
| Programmatic happy path | Agent plane can execute the capability. |
| Auth-first negative | Unauthenticated or wrong actor is rejected before work. |
| Scope negative | Cross-tenant/cross-principal access fails. |
| Fixture parse | Producer and consumer accept the same envelope. |
| Mutation dry-run/propose | Governed actions can preview without applying. |
| Provenance check | Any mutation records actor, reason, and correlation. |
| Verification surface check | Human can verify machine truth without trusting the agent report. |

High-risk capabilities add golden tasks: end-to-end agent tasks with verified
outcomes, authored by someone other than the implementer.

## 9. Anti-patterns

- GUI-only capability with "agent can click it later" as the plan.
- API-only capability with no human verification surface.
- Runtime envelope built from ad-hoc strings instead of a schema.
- Client-provided role, tenant, or surface treated as authority.
- Giving an agent a user's raw token or a service credential.
- Tool manifest that declares side effects but no execute-time enforcement.
- Conformance fixture living in docs but not imported by tests.
- Mutation tool with no dry-run/propose path for governed actions.

## 10. L3 adoption checklist

The consuming repo declares:

- where capability registry entries live;
- what projection creates the human surface;
- what projection creates the programmatic surface;
- the delegated actor handle shape and expiry;
- the runtime envelope fixture path;
- which tests import the fixture;
- which verification surface shows machine truth to the governing human;
- which high-risk capabilities require golden tasks.

Status vocabulary:

- `ADOPTED` - active and tested.
- `ADOPTED-NATIVE` - equivalent local pattern exists; name it.
- `PENDING` - acknowledged but not wired.
- `N-A` - no agent-operated capabilities in this repo.

## Provenance

Raised from a real second-consumer pattern: a capability front built a usable GUI
and then had to harden the agent/runtime boundary after audit. The repeated
pieces were generalizable: a delegated actor handle, a versioned runtime
envelope with shared fixtures, and a tool-provider surface that is auth-first,
scoped, and testable. This reference captures the reusable implementation shape
without naming the source product or domain.

