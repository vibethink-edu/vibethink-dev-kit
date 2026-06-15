# Governance-instruments L3 skeleton

Reusable skeletons for the three governance instruments defined by
[`CANON-STATE-MIRROR-AND-DECISION-REGISTER-001`](../../../knowledge/methodology/CANON-STATE-MIRROR-AND-DECISION-REGISTER-001.md):

| Skeleton | Instrument | Role | Mutability |
|---|---|---|---|
| `PRESENT-MIRROR.template.md` | present-mirror | the whole state on one page | overwritable |
| `APPEND-ONLY-LOG.template.md` | append-only log | the history / why | append-only |
| `DECISION-REGISTER.template.md` | decision register | ledger of authority approvals | append-only |

## How to instantiate (L3 binding — §8 of the canon)

1. **Copy** the three skeletons into the consuming repo and **rename** them to the
   repo's own convention. The canon prescribes the *roles*, never the file names —
   pick names that fit the repo (the present-mirror at the repo root is common, the
   log and register under a `doc/` or `docs/` path are common). Honors
   `CANON-CONTEXT-HYGIENE` §3 (*"the concrete paths/files are an L3 concern"*).

   **Recommended naming pattern** (per `CANON-NAMING-CONVENTIONS-001` §2 — docs are
   `{TOPIC}-{slug}`, and these are *living* docs so they carry **no date**): lead with
   a shared **scope** prefix so the three sort and read as one family, and put the
   **role** in the suffix. Scope-led beats role-led (groups in a listing). Example
   for a delivery/orchestration scope:

   | Role | Recommended example | Alternatives |
   |---|---|---|
   | present-mirror | `ORCHESTRATION-DASHBOARD.md` | `DELIVERY-DASHBOARD`, `<scope>-BOARD` |
   | append-only log | `ORCHESTRATION-LOG.md` | `<scope>-LOGBOOK`, `<scope>-JOURNAL` |
   | decision register | `ORCHESTRATION-DECISIONS.md` | `<scope>-REGISTER`, `GO-REGISTER` |

   Match the repo's existing governance-doc casing (e.g. ALL-CAPS-KEBAB if the repo
   already uses `AGENTS.md`/`README.md`-style caps). Narrow the scope (`CODERS-`,
   `AGENTS-`) only if the instruments truly track *only* executor work; if the
   present-mirror tracks the whole effort, keep the broader scope.
2. **Bind the local specifics** in each file's header where marked `<L3: …>`:
   - the repo's **authority classes** (which decisions require a register row);
   - the **channels** the register recognizes as valid sources of an approval;
   - the **timezone** stamped in the register's *when* field;
   - the **evidence conventions** (what counts as a durable backing link).
3. **Do not re-write the canon.** The instances point at the canon as the spine —
   they carry only the concrete bindings. If an instance restates the roles, the
   mirror-wins rule, the register field set, or the close ritual, it has drifted.
4. **Run the close ritual** (§7) at every session end: update the mirror, append to
   the log, add a register row if an authority decision was granted.

> These are skeletons, not prose to paraphrase. Copy, rename, fill the `<L3: …>`
> slots, delete the `<!-- guidance -->` comments, and start using them.
