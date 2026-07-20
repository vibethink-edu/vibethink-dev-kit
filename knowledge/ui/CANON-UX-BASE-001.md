# CANON — UX Base (universal · product-agnostic)

> **Scope:** every repo that inherits this kit and renders a user interface.
> Vendor-neutral, product-neutral, framework-neutral.
> **Status:** SEALED 2026-07-19 by the Principal Architect — elevated from a consumer finding (recurring
> interaction decisions were being made screen-by-screen instead of once); validated by an independent
> adversarial round that cut one rule and closed an intra-kit restatement before seal.
> **Home:** the dev-kit (supra-repo). Inherited by every repo as upstream → fork.

---

## §1 — What this owns (and what it does not)

This canon owns the **interaction principles** a product decides **once**, not per screen: when a
surface interrupts, what it may hide, how it announces state.

**It is not the kit's only UI rule.** Two neighbours already exist and this canon sits beside them,
not above:
- [`CANON-VERTICAL-UI-INHERITANCE-001`](../architecture/CANON-VERTICAL-UI-INHERITANCE-001.md)
  (architecture) — inheritance/composition of surfaces, terminology layering, and the **machine gate**
  for text/vocabulary. Where a rule here overlaps, **that canon owns the mechanism**; this one owns
  only the interaction decision.
- [`CANON-UI-PREFERENCE-PERSISTENCE-001`](../methodology/CANON-UI-PREFERENCE-PERSISTENCE-001.md)
  (methodology) — how a user's interface preferences persist.

It does **NOT** own — these are **L3**, the consuming repo's:
- **Which component library** it uses and where components live. The kit states only the rule:
  **the repo declares its component catalog; the bricks (dialog, popover, table, calendar…) come
  from there and are not reinvented.** Naming the library is the repo's call.
- Screen-specific behaviour, visual identity, spacing scales.
- A repo's own component-sourcing doctrine (catalog order, placement, styling tokens). That is a
  **binding to this spine**, not a competitor: a repo with an existing native doctrine keeps it and
  declares `ADOPTED-NATIVE` (`INHERITANCE-CONTRACT` §2), naming where its native rules live.

## §2 — Adopt, do not rewrite

The general usability body of knowledge is **mature and external**. This canon **points at it and
stops** — copying it here would create a second, staler copy:

- **Usability heuristics** (Nielsen Norman Group's ten) — visibility of state, error prevention,
  recognition over recall.
- **Practical interface craft literature** (e.g. *Refactoring UI*) — hierarchy, spacing, depth,
  restraint. The **class** is normative; no specific title is required reading.
- **Accessibility** (WCAG) — keyboard reachability, contrast, labelled controls. Not optional, not
  a later phase.

**Do not paraphrase these into the repo.** Cite them; read them at the source. §3 is only what those
sources do **not** decide for us — a rule that merely restates a cited source does not belong here.

## §3 — House rules (the part we own)

**Entry condition:** a rule enters this list **only with a named scar** — if nobody can name the day
it cost real work, it does not belong. Every rule below carries one.

1. **Reuse before building.** Search the repo's component catalog first: **reuse > adapt > build.**
   Never hand-roll a composite surface (board, card, tabs, table, calendar) the catalog already
   solves. *(A repo with no composite catalog declares that; the rule binds from its first composite.
   Composition-vs-fork of an inherited surface is decided by the inheritance canon, §1.)*
   *Scar: a large component catalog existed and composite surfaces were still rebuilt by hand.*
2. **Inline over modal for simple edits.** One or two fields edit **in place**. A modal is for a rich
   view, a destructive action, or a genuinely multi-step flow.
   *Scar: a two-field date edit shipped as a popup.*
3. **Show over hide.** A problem, conflict or blocked state is visible **in context** — a marker that
   lights up where the thing lives. The delta over the cited heuristics is **WHERE**: state must be
   visible without opening anything, not merely visible once opened.
   *Scar: schedule conflicts were discoverable only after opening a modal.*
4. **Active state is unambiguous.** A toggle, filter or mode makes it obvious what is currently on.
   The ownable part is the severity: **ambiguous state is a defect, not a style preference.**
   *Scar: a mode toggle (inherited vs own) left users unable to tell which was active.*
5. **Every surface declares its states.** The enumeration is owned by the inheritance canon (§1);
   this rule adds the one it does not carry: **unauthorized**, where an auth boundary exists — else
   declare `N-A(reason)`. A surface with only the happy path reads as broken the first time reality
   is not happy.
   *Scar: an empty state was rendered as a real value — "0 conflicts" shown while no schedule had
   been loaded yet, indistinguishable from a genuinely conflict-free schedule.*
6. **No hardcoded user-visible text; storage names never surface.** Every string a person reads
   routes through a **replaceable text layer** (the repo names it), and the interface shows the
   domain's word, never the storage entity's.
   *Scar: a storage entity name reached production screens and had to be corrected across dictionaries.*
   → **Mechanism and gate live in the inheritance canon (§1), not here.** This rule states the
   interaction invariant; that canon enforces it.

## §4 — Staying current without rotting

The state of the art moves; a canon that enumerates fashionable patterns ages in months and nobody
updates it. This one stays current **by reference, not by rewrite**:

- **Before inventing an interaction pattern, check it against the sources in §2.** Most problems are
  already solved there.
- **If a house rule stops matching real practice, raise it in the repo's governed finding lane** (the
  shared coordination channel its comms rules declare) — never patch it silently. A rule everyone
  quietly ignores is worse than no rule. The architecture-review documentation-drift lens is the
  standing sweep that surfaces this class.

## §5 — L3 binding (what the consuming repo declares)

- Its **component catalog** and order of preference; where shared components live. If it already has
  native doctrine, it declares `ADOPTED-NATIVE` and points at it.
- Its **replaceable text layer** and language policy.
- Its **domain vocabulary** (the words the person reads) and the storage names that must never reach
  the interface.
- Any **stricter house rule** its product needs — with its own named scar.

The binding points here. **Restatement means copying §3's rule text**; naming concrete instances,
paths, thresholds or component names at L3 is expected, not drift.

---

*Provenance: elevated from a consumer finding — recurring interaction decisions (modal vs inline,
problems hidden behind a click) re-decided screen by screen. Evidence at elevation: one surface plus
a second consumer's existing component-sourcing doctrine on a different axis; recorded as such in the
decision register rather than claimed broader. One proposed rule (progressive disclosure) was **cut**
during review for restating a cited source — §2's own admission test.*
