# CANON-GAP-REPORT — On-demand gap report (universal · agent-agnostic)

> **Scope:** every repo where the human authority asks an agent "where are we / what's left / what's next" on a feature or front.
> Vendor-neutral, product-neutral, tool-neutral.
> **Status:** DRAFT — awaiting human-authority seal.
> **Home:** the dev-kit (supra-repo). Inherited by every repo as upstream → fork.
> **Sibling:** `CANON-AGENT-COLLABORATION` §6 (report results, not process) — this canon is the specific shape of one such report.

---

## §1 — Trigger

When the human authority asks, in any phrasing, *"what are the gaps / what's next / where are we / give me the progress report / continue with the logical steps"* on a feature or front, the agent delivers a **gap report** — a verified-against-reality status, not a recap of the plan doc.

The consuming repo's L3 binding records the exact trigger phrases in the human's language.

---

## §2 — Mandatory protocol (in this order)

1. **Read the feature's plan/requirements doc** — the official statement of what is done, what is missing, and known blockers.
2. **Read the feature's roadmap** — status by phase/sprint.
3. **Read the real code** — diff the documentation against reality. The report is grounded in what the code confirms, not what a doc claims.
4. **Deliver** in the format below.

---

## §3 — Delivery format

```
## Gap Analysis — {feature}

### ✅ What works today
| Feature | Status |

### 🔴 UX gaps / active bugs
| Problem | Cause | Fix |

### 🟡 Functional gaps (incomplete or absent features)
| Feature | Real state | Fix or phase |

### 🔴 Infrastructure blockers
| Blocker | Impact |

### Logical order of work
1. ...
```

---

## §4 — Rules

- **Do not invent** — report only what the code confirms.
- **Code wins** over documentation when they conflict (then flag the doc as stale).
- **Omit empty sections** — no infra blockers → drop that section.
- **One table per section** — concise, no repetition.
- **The report is diagnosis, not execution.** End by proposing the next action and **ask before acting** — never start work off the back of a gap report without the human's go-ahead.
