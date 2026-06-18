<!--
TEMPLATE — Architecture document · standards: C4 model (c4model.com) + arc42 (arc42.org).
Bound by CANON-DOCUMENTATION-ARTIFACT-STANDARDS-001 §2 (Architecture). Use C4 for the diagrams
(zoom levels) and arc42 for the prose sections. Keep it living; link ADRs for the "why".
-->

# Architecture — <system name>

- **Status:** living · **Last updated:** YYYY-MM-DD · **Owner:** <who>

## 1. Introduction & goals (arc42 §1)

<What the system is, its top 3 quality goals (e.g. correctness, latency, tenant-isolation), key stakeholders.>

## 2. Constraints (arc42 §2)

<Technical/organizational constraints that shape the design (stack, compliance, deadlines).>

## 3. Context — C4 Level 1 (System Context)

<The system as one box; the users and external systems it talks to, and why.>
```
[User] → ( <system> ) → [External system A]
                       → [External system B]
```

## 4. Containers — C4 Level 2

<The deployable/runnable units (apps, services, DBs, queues) and how they communicate.>
```
( <system> )
  ├── [Web app]  --HTTP-->  [API service]
  ├── [API service]  --SQL-->  [Database]
  └── [Worker]  --consumes-->  [Queue]
```

## 5. Components — C4 Level 3 (only where it earns it)

<Inside a container that matters: its main components + responsibilities. Don't draw everything.>

## 6. Runtime / key flows (arc42 §6)

<1–3 important scenarios traced end-to-end (the request that matters, the failure path).>

## 7. Cross-cutting concepts (arc42 §8)

<Auth, persistence, tenancy, error handling, observability — the patterns applied across the system.>

## 8. Architecture decisions (arc42 §9)

<Link the ADRs (MADR) that shaped this — do not restate them; point to them.>

## 9. Risks & technical debt (arc42 §11)

<Known risks, debt, and what would trigger addressing them.>

## 10. Glossary (arc42 §12)

<Domain + technical terms a newcomer needs.>
