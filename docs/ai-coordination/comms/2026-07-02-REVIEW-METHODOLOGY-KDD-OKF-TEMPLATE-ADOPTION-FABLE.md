# REVIEW (methodology/product) — Should DevKit add optional OKF compatibility to Knowledge Pack templates?

**From:** Fable (house-methodology reviewer, Cursor session), 2026-07-02
**To:** Marcelo for direction
**Reviews:** the full 2026-07-02 KDD/OKF thread (SPIKE, two adversarial Opus reviews,
hardened-sample delivery, guardrail fixes, behavior test, baseline-health clarification),
plus `CANON-KNOWLEDGE-NATIVE-VT-METHOD-001`, `setup/templates/knowledge-pack/`,
`setup/templates/knowledge-memory/`, `check-knowledge-pack.mjs`,
`check-knowledge-memory-freshness.mjs`, `kdd-refresh.mjs`.
**Status:** review output only. Not sealed law. Does not amend templates or canon.

---

## Verdict

**PAUSE — keep OKF as an internal guardrail. Do NOT add `okfCompatibility` to the
Knowledge Pack templates now.** Declare template adoption DORMANT with a named
wake-up trigger, and salvage one small OKF-neutral residue into the template README.

This is not a safety verdict — safety is solved. It is a demand verdict: nobody has
needed this yet, and the template is the most-copied artifact in the kit.

---

## Where the thread actually stands

The two blockers Opus named before template adoption are both resolved:

- **F-1** (basename-global `sourceExclusions` silently hiding accepted knowledge):
  fixed — exact repo-relative paths only, dangerous defaults removed, regression-tested.
- **F-3** (`lapsed`/`stale-by-pivot` enum ambiguity): sealed by Marcelo as computed
  health conditions, not persisted statuses (D-056, canon §4/§8.2 amended,
  `PACK-METADATA.template.md` updated, negative tests added).

So the mechanical preconditions for graduation are met. That is exactly why the
decision is now pure methodology/product judgment, which is what this review gives.

## Answers to the seven questions

### 1. Does OKF fit the spirit of Knowledge-Native VT-METHOD?

**The mechanics fit; the brand is orthogonal.** KDD already says Markdown is the
auditable source of truth and every engine is derived evidence (canon §1, §8). OKF is
literally "Markdown + descriptive YAML frontmatter + an index," and its authors call it
"format, not platform." An interop *skin* whose authority stays in `PACK-METADATA.md`
by construction (the gate reads only that file) is native in spirit. What does not fit
the spirit is importing a three-week-old vendor draft's *name* into the house
constitution's template surface. The spirit test passes for the mechanism, not for the
branding.

### 2. Does it make agents more context-aware in a useful way?

**Proven for consuming large external bundles; unproven for KDD packs themselves.**
The behavior test showed progressive disclosure (root index → concept index → concepts
→ sources) beats raw ripgrep on Cole Medin's ~100-file bundle. Credible. But a KDD pack
is **ten fixed files with self-describing names** — `BUSINESS-CONTEXT.md` does not need
frontmatter for an agent to know what it is. Navigation is not the pack's bottleneck;
validation and freshness are, and OKF contributes nothing there. Also note the evidence
asymmetry: the guardrail was proven with 28 mechanical tests plus an independently
reproduced exploit; the benefit was "proven" with one question, one bundle, one run,
self-administered by the advocating session. That is a hypothesis, not a result.

### 3. Does it risk feeling borrowed or fashionable instead of native?

**Yes, if it lands in templates under the OKF name now.** OKF v0.1 is a draft published
weeks ago. The durable ideas (descriptive frontmatter, progressive disclosure) predate
it and will outlive it. The failure mode: every new consumer copies the template, sees
an `okfCompatibility` section, and reads the house method as "KDD = our wrapper around
Google's thing." The guardrail codebase avoided this correctly — `raw-input`,
path-scoped exclusions, and the status clarification are all OKF-independent
improvements. Keep that posture.

### 4. Is optional template support the right altitude, or should it remain only a guardrail?

**Guardrail is the right altitude today.** The spike itself defined the correct dormancy
condition: *"Revisit only if a real cross-agent sharing case requires it."* No such case
has appeared — the behavior test manufactured one. The two real use cases resolve
differently:

- **Import** (external OKF bundle → `raw-input` evidence): needs **zero** template
  change. Any agent can already read any OKF bundle; the gate already accepts
  `raw-input`. Fully served by the guardrail.
- **Export** (authoring/sharing KDD packs as OKF bundles): the only case template
  support pays for — and nobody has asked for it.

Template support without a requester is speculative API surface.

### 5. What to add, remove, or rename for coherence with DevKit?

- **Add (now, small):** one paragraph in `setup/templates/knowledge-pack/README.md`:
  descriptive frontmatter (`type`, `title`, `description`, `tags`, `timestamp`) is
  *permitted* on pack artifacts, never confers authority, and pack authority fields
  live only in `PACK-METADATA.md`. That is the entire useful pack-level residue, and it
  needs no OKF mention.
- **Rename (if ever adopted):** call the capability what it is — an **exchange
  profile** or **descriptive frontmatter profile** — with OKF listed as one compatible
  target format. The house method should not carry a vendor draft's brand in its
  constitution.
- **Remove/avoid:** a generated `index.md` inside a 10-file pack. It adds drift and
  freshness-exclusion surface for near-zero navigation gain — the first step toward
  over-instrumentation. Reserve it for the export case, if that case ever arrives.
- **Optional cheap hardening (F-4):** the soft lint forbidding `status:`/`kdd_status:`
  outside `PACK-METADATA.md`. Independent of OKF, closes the display-spoof tail.

### 6. Is this over-instrumented?

**The shipped tooling: no. The pipeline cadence: at the limit.** Every code change
closed a real, pre-existing hole (F-1 was a genuine silent-staleness exploit
independent of OKF; `raw-input` brought the gate in line with canon §4; D-056 removed
a real enum ambiguity). None of it should be reverted. But seven comms documents and
three review cycles for an *optional frontmatter* question is heavy. Acceptable as
one-time diligence on a method-touching decision; not acceptable as a continuing burn
rate without a demand signal. This review should close the thread.

### 7. Recommendation

**PAUSE.** Not reject — the direction is validated and the prior art is filed. Not
proceed — no consumer needs it and the evidence for agent benefit on packs is n=1.

---

## What feels right

- OKF-as-skin with authority single-sourced in `PACK-METADATA.md` **by construction**
  (the gate consults nothing else). This is the strongest kind of guarantee — mechanical,
  not aspirational.
- External bundles stayed external (`git ls-remote` only, content never copied,
  `raw-input` class). Textbook canon §4; the kit did not become a content catalog.
- The thread's discipline: adversarial review before adoption, fixes with regression
  tests, canon question escalated to Marcelo instead of resolved by an agent. The
  process worked exactly as designed.
- The permanent side effects are all wins regardless of the OKF decision.

## What feels wrong or premature

- **Demand is manufactured, not observed.** The trigger the spike itself required — a
  real cross-agent sharing case — never appeared.
- **Evidence asymmetry.** All rigor went to "is it safe?"; almost none to "is it
  wanted?". One self-run question on an external bundle does not establish that KDD
  packs benefit from OKF dressing.
- **Wrong beneficiary.** The demonstrated benefit is for consuming *large external
  bundles* (import), which needs no template change. Template support serves export,
  which has no requester.
- **Vendor-draft branding in the constitution.** Binding the most-copied template to
  "OKF" v0.1 draft nomenclature is where "fashionable instead of native" becomes real.

## Exact next step

1. **Mark the thread closed:** guardrail retained; template adoption **DORMANT** with
   wake-up trigger = (a) a real import of an external OKF bundle into a consumer's
   Knowledge Reconstruction Sprint, or (b) a real external consumer requesting a pack
   as an OKF bundle. First occurrence → a small adoption PR, under exchange-profile
   naming, through normal review.
2. **Salvage the residue (one small PR, no OKF branding):** the descriptive-frontmatter
   paragraph in the knowledge-pack README (§5 above), optionally plus the F-4 soft lint.
3. **Nothing else.** No canon amendment is needed — §4/§8.2 already landed via D-056.
