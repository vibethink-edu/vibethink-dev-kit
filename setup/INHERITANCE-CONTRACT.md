# The Inheritance Contract — how a repo inherits this kit

> **Status:** CANON (the heir's contract — one page, every rule of inheritance).
> **Read this before adopting anything.** The catalog (`ADOPT-DEV-KIT.md`) tells
> you *what* you can inherit; this contract tells you *how inheritance behaves* —
> how to declare it, how to legitimately deviate, and what counts as a violation.
>
> **Why this exists.** Before 2026-06-11 this contract was real but scattered
> across five homes (the inheritance ADR, the catalog, a §8 buried in the
> git-hygiene spine, per-spine "L3 binding" sections, and the parity config
> format). An heir asking *"may I override X?"* had to archaeologize. One page
> now; the five homes point here.

---

## §1 — The mechanism (by artifact type)

From `doc/decisions/ADR-20260524-supra-repo-inheritance-mechanism.md`:

| Artifact | Mechanism | Never |
|---|---|---|
| **Docs** (canons, methodology, ADRs) | **by reference** — your repo points at the kit path | never copy a doc (two normative copies drift) |
| **Runnables** (engines, scripts) | **verbatim copy + parity check** (catalog Piece #31) | never an unguarded copy (it rots silently) |
| **Mount** (local checkout/symlink of the kit) | dev/read convenience **only** | never let correctness depend on it |

**Enforced by:** the copy-parity gate (Piece #31) for runnables; review discipline
for doc-copies (a copied canon in an heir's tree is a finding).

## §2 — Declare your adoption (silence is not declaration)

Every consuming repo maintains **one discoverable status doc** (suggested:
`docs/DEV_KIT_INHERITANCE_STATUS.md`) with a per-piece table over the full
catalog, using the **strict status vocabulary**:

- `WIRED-CI(file:job)` / `WIRED-HOOK(file:hook)` / `WIRED-SCRIPT(file)` — a
  mechanism enforces it; the claim names the mechanism.
- `DECLARED-ONLY(file)` — adopted by documented discipline; no mechanism yet.
- `ADOPTED-NATIVE` — satisfied by the repo's own equivalent; **name the native
  binding** in the row.
- `PENDING` — recognised, not yet wired.
- `N-A(reason)` — does not apply; the reason travels with the claim.

A claims validator that rejects vague claims and verifies cited mechanisms
exist is the **reference enforcement** (both current consumers run one). Keep
its parse bounds loose — an exact ceiling mirroring the catalog freezes at N
(it happened twice).

**Enforced by:** the consumer's claims validator in its CI; the catalog's
per-piece table + "Done when" checklist.

## §3 — Never duplicate (the binding points up)

An heir's L3 binding **points at the spine and adds only what the spine cannot
know** (paths, tooling, incidents, product vocabulary, concrete thresholds). It
**never restates** the spine's principles, protocols, or rules.

> If your L3 binding repeats the spine, it has drifted — the duplicate becomes
> a second normative copy that rots independently. Trim it to binding + pointer.

**Enforced by:** review discipline + the architecture-review lens (documentation
drift); every spine's own "L3 binding" section names what belongs down here.

## §4 — Override visibly (the deviation clause)

*(Promoted 2026-06-11 from the git-hygiene spine §8 — it always applied to every
spine; now it lives where an heir will look for it.)*

Sometimes a consuming repo must deviate from a spine rule for legitimate local
reasons (a constrained CI environment, a solo-operator repo that needs no PRs,
a compliance posture). The override mechanism is **explicit and documented,
never silent**:

1. The L3 binding declares an **`## Overrides`** section listing, per override:
   - the specific rule overridden (**spine + section number**),
   - the local replacement rule,
   - the **reason** (local constraint, compliance, environment…),
   - whether it is **temporary** (with a target close date) or **permanent**.
2. Every override is **a finding to the spine's maintainer** (send it through
   the governed comms lane): it signals either (a) the spine misses a case it
   should support, or (b) the repo carries genuinely unique constraints. The
   maintainer reviews and decides whether the spine amends.
3. **Silent deviation is forbidden** and counts as drift (§6).

Keep the section shape exactly as above — one list entry per override, starting
with the spine + section — so a future gate can parse it without redesign.

**Enforced by:** the comms-lane finding (traceability); review discipline today;
the parseable shape reserves mechanical validation for when the pain warrants it.

## §5 — Runnable divergence = declared adaptation

A copied runnable that must deliberately differ from upstream (consumer layout,
platform constraint) is declared in the parity config as
`adapted: { reason, since }` — it reports visibly as ADAPTED on every run and
its do-not-overwrite detail lives in the per-fork `UPSTREAM.md`
(upstream-protocol canon §6.1). An **undeclared** mismatch is DRIFT and goes red.

**Enforced by:** the copy-parity gate (Piece #31) — drift exits 1; an adaptation
without a reason exits 1.

## §6 — Silent deviation is a violation

The single principle behind §§1–5: **every divergence from the kit is visible
somewhere a gate or a reviewer will look** — a status row, an `## Overrides`
entry, an `adapted` declaration, a finding in the lane. A deviation that lives
only in someone's memory (or nowhere) is drift, and drift is the failure class
this whole kit exists to prevent.

---

## Done when (for a new heir)

- [ ] Status doc exists and covers the **full** catalog (no silent skips — §2).
- [ ] A claims validator (or equivalent) runs in CI against it.
- [ ] Copied runnables declared in a parity config; the parity check runs at
      least pre-commit where the kit checkout is present (§1, §5).
- [ ] Zero copied docs (§1); L3 bindings point up, none restate a spine (§3).
- [ ] `## Overrides` sections exist wherever the repo deviates — each entry
      with spine+section, replacement, reason, temporality (§4); each one sent
      as a finding to the maintainer.

---

*Companion docs: `ADOPT-DEV-KIT.md` (the catalog — what to inherit, piece by
piece) · `ADOPT-CROSS-AGENT-GOVERNANCE.md` (the runbook for Pieces #2/#3/#4) ·
`ADR-20260524-supra-repo-inheritance-mechanism.md` (the mechanism decision).*
