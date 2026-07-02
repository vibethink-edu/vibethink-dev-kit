# REVIEW (adversarial) — SPIKE KDD ↔ OKF compatibility

**From:** Claude Opus (independent reviewer, Cursor session), 2026-07-02
**To:** Codex dev-kit session (spike author) → then Marcelo for direction
**Reviews:** `docs/ai-coordination/comms/2026-07-02-SPIKE-KDD-OKF-COMPATIBILITY.md`
**Status:** review output only. Not sealed law. Does not amend KDD templates, checks, or canon.

---

## Verdict

**APPROVE WITH FIXES.**

The *direction* is correct and I recommend running the spike: OKF as an **interoperability
skin** over KDD Knowledge Packs, never the authority layer. The spike is honestly scoped,
self-gating ("do not amend templates/checks/canon from this document"), and its source
claims about OKF v0.1 are accurate against the primary spec.

But the **concrete frontmatter profile and mapping as written contain real defects** that
would blur KDD's status semantics and break the two existing KDD checkers if used verbatim —
even in the isolated sample pack. Those defects must be fixed *before* the sample is authored,
and certainly before any template/canon amendment. Hence: approve the spike, block the profile
until the five fixes below are applied.

I verified every OKF claim against the raw spec
(`raw.githubusercontent.com/GoogleCloudPlatform/knowledge-catalog/main/okf/SPEC.md`, v0.1
Draft). The spike's summary of OKF (only `type` required; `title/description/resource/tags/
timestamp` recommended; `index.md`/`log.md` reserved; consumers tolerate unknown fields and
broken links) is faithful. This review's disagreements are with the *KDD-side design*, not
with the spike's reading of OKF.

---

## Answers to the five questions

### Q1 — Does the proposal preserve KDD's authority model?

**Yes in intent, with one hole.** The spike is explicit and correct that OKF `type` is for
routing/filtering, not authority; that authority stays with `kdd_status` + validator +
`source_of_truth`; and that imported OKF bundles enter as `raw-input`/`candidate` until
reconstructed and validated (adoption path §5). Risk #1 ("agents mistake OKF conformance for
KDD acceptance") is correctly identified as High with a control. This is consistent with
`CANON-KNOWLEDGE-NATIVE-VT-METHOD-001` §1 ("Engine output is retrieval evidence. The accepted
Markdown Knowledge Pack remains the authority") and §8 (engines are never source of truth).

The hole is Finding C+D below: the *field design* replicates and truncates status in a way
that undercuts the very single-source authority the intent protects. Intent preserved;
mechanism leaks.

### Q2 — Does any field or naming choice blur `raw-input`, `candidate`, `accepted`?

**Yes — two distinct blurs. This is the most important finding.**

**(C) The `kdd_status` enum omits `raw-input`.** Canon §4 defines **five** lifecycle states:
`raw-input | candidate | accepted | superseded | rejected`. The proposed profile (spike lines
90) enumerates only **four**: `candidate | accepted | superseded | rejected`. Yet the spike's
own Preflight (line 36) says "A conformant OKF bundle may be `raw-input`, `candidate`, or
`accepted`", and adoption path §5 says imported bundles "enter as `raw-input` or `candidate`".
**The document contradicts itself:** the text needs `raw-input`, the field can't express it. A
field whose comment lists the legal values but omits `raw-input` actively invites an agent to
tag imported raw material as `candidate` — the lowest value on offer — which is a one-level
**status inflation** of raw evidence into a review-eligible candidate. That is exactly the
raw→candidate blur the question targets.

**(D) Replicating `kdd_status` on every concept file de-centralizes authority.** The profile
puts `kdd_pack_id`, `kdd_pack_version`, `kdd_status`, `kdd_source_of_truth` on *every*
non-reserved file (8+ per pack). KDD deliberately single-sources status + the acceptance
record in **`PACK-METADATA.md`** (validator, `validated_at`, Acceptance Record). N replicated
copies can drift, and — worse — a generic agent that opens one concept file sees
`kdd_status: accepted` **without the validator/acceptance record that only PACK-METADATA
carries**. That is risk #1 realized *by the profile's own design*: a per-file status string is
mistaken for pack acceptance. Pack-authority fields belong at the pack level (PACK-METADATA,
or the bundle-root `index.md`), not stamped on each concept.

### Q3 — Does OKF frontmatter conflict with existing KDD templates or checks?

**Frontmatter keys: no. Two adjacent OKF conventions the spike invites: yes.**

- **Frontmatter, non-conflicting.** Adding a YAML frontmatter block with OKF keys does not
  break `check-knowledge-pack.mjs`. Its `metadataStatus()` matches `/^\s*status:\s*([a-z-]+)/im`;
  `kdd_status:` is **not** matched (the literal `status:` is not immediately after leading
  whitespace — `kdd_` precedes it), so the existing pack `status:` in `PACK-METADATA.md`'s
  fenced block still governs. Unknown keys are ignored by both checkers. Good.

- **CONFLICT — OKF absolute (bundle-relative) links break the pack gate.** OKF §5.1 makes
  `/`-rooted links (e.g. `[meta](/PACK-METADATA.md)`) the **recommended** form. The pack gate's
  `linkTargetExists()` treats any non-`http/mailto/#` href as a local path and only tries
  `resolve(dirname(file), href)` and `resolve(ROOT, href)`. A leading `/` makes `resolve()`
  return a **filesystem-absolute** path (`C:\PACK-METADATA.md` on Windows / `/PACK-METADATA.md`
  on POSIX) — never the bundle root — so every OKF-style absolute link resolves to a
  non-existent path → **RED "reference … does not resolve"**. If the generated `index.md` (or
  any concept) uses OKF's recommended linking, the gate fails. `ROOT` is the repo cwd, not the
  bundle root, so the two notions of "root" don't even coincide.

- **CONFLICT — `log.md` (and `index.md`) churn invalidates the freshness manifest.**
  `check-knowledge-memory-freshness.mjs` fingerprints **all** `.md/.json/.yaml/.yml` under an
  `accepted` pack (`includeSource` filters only by pack status + the manifest file itself; no
  filename exclusion). A generated `index.md` and especially a `log.md` that "may mirror KDD
  freshness / acceptance events" (spike line 74) change on every event → the source fingerprint
  changes → manifest goes stale → freshness gate RED until re-refresh. Because `log.md` records
  *the refresh itself*, this is a self-invalidating loop (write the log entry → fingerprint
  moves → stale again). The spike's risk table lists "index.md drifts from files" but **not**
  this interaction, which is the more damaging one.

### Q4 — Is the mapping too heavy, too light, or correctly minimal?

**Correctly minimal on structure; too heavy on per-file metadata.**

- *Correctly minimal:* one `kdd-*` `type` per artifact role, no new files, no new taxonomy,
  frontmatter + optional `index.md`/`log.md` only. The `kdd-` prefix namespaces the types so
  they don't collide with generic OKF types. This is the right weight for an interop skin, and
  it does not duplicate pack structure (risk #2 controlled).

- *Too heavy:* the profile stamps **pack-level** fields (`okf_version`, `kdd_pack_id`,
  `kdd_pack_version`, `kdd_status`, `kdd_source_of_truth`) on **every concept**. This is the
  Finding D drift/authority problem restated as a weight problem. Per-concept frontmatter
  should carry only concept-level fields (`type`, `title`, `description`, `tags`, `timestamp`);
  pack identity/status/version live once, in PACK-METADATA (and `okf_version` once in the
  bundle-root `index.md`, per OKF §11 — the *only* place the spec permits `index.md`
  frontmatter). Moving pack fields out of per-concept frontmatter makes the mapping both lighter
  **and** safer.

### Q5 — What exact fix is required before changing templates or canon?

Five fixes to the spike's **Minimal Frontmatter Profile** and **Mapping**, to land in the
sample pack first (not in templates/canon):

1. **Restore the full lifecycle enum.** `kdd_status` comment MUST read
   `raw-input | candidate | accepted | superseded | rejected` (all five, canon §4). Imported
   OKF bundles that are not yet reconstructed MUST be expressible as `raw-input`. Resolve the
   spike's internal contradiction (line 36/§5 vs line 90).

2. **Single-source pack authority.** Remove `kdd_pack_id`, `kdd_pack_version`, `kdd_status`,
   `kdd_source_of_truth` from **per-concept** frontmatter. Keep them once in `PACK-METADATA.md`.
   Per-concept frontmatter carries only `type`, `title`, `description`, `tags`, `timestamp`
   (+ optional `kdd_pack_id` as a *back-reference only*, never a status). Authority stays where
   the validator/acceptance record lives.

3. **Mandate relative links in the profile.** The sample's `index.md` and any cross-links MUST
   use relative (`./FILE.md` / `FILE.md`) form, not OKF `/`-absolute, so `check-knowledge-pack.mjs`
   stays green. Alternatively (heavier, defer): teach `linkTargetExists()` a bundle-root base —
   but for the spike, relative links are the correct, zero-code fix. Document this constraint
   explicitly.

4. **Keep generated `index.md`/`log.md` out of the accepted-source fingerprint.** Either don't
   place `log.md` inside an `accepted` pack dir that the freshness config walks, or add an
   exclusion for reserved OKF filenames to the L3 `knowledge-memory.config.json` scope, or mark
   them non-source. The spike must state that generated OKF surfaces are **derived artifacts**,
   not accepted sources — otherwise `log.md` churn RED-flags freshness on every event.

5. **Place `okf_version` per spec.** Declare `okf_version: "0.1"` **once** in the bundle-root
   `index.md` frontmatter (OKF §11), not on every concept. This is the spec-sanctioned location
   and reinforces fix #2.

Only after these five are demonstrated green in the isolated sample pack should the adoption
path (template README `okfCompatibility` section, canon note that OKF is exchange-surface-only)
proceed — and the canon note must go through Marcelo's normal canon-approval authority (§6.1:
agents propose, they do not auto-edit canon).

---

## What the spike got right (keep as-is)

- OKF-as-skin framing; authority never moves to OKF. (Matches canon §1, §8.)
- Honest, verified source citations; OKF v0.1 correctly summarized.
- Self-gating status ("do not amend from this doc"); isolated single-pack spike shape.
- Risk #1 (conformance ≠ acceptance) named High with a control, plus the "kit becomes a content
  catalog" risk kept High and pushed to L3 — consistent with the L1/L2/L3 layering and the
  §11 anti-pattern "product-specific knowledge lifted into the dev-kit".
- Import rule (external bundles enter as `raw-input`/`candidate`) is exactly right — it just
  needs fix #1 so the field can carry `raw-input`.

## Residual (non-blocking) notes

- `timestamp: YYYY-MM-DD` is a valid ISO-8601 date; OKF examples use full datetime. Harmless;
  keep consistent with PACK-METADATA's date-only convention.
- kebab-case `type` values vs OKF's Title-Case examples: allowed (producers choose; consumers
  tolerate). No change needed.

---

## Bottom line for Marcelo

Run the spike — the interoperability direction is sound and preserves KDD authority in
principle. But the sample pack must be authored with the corrected profile (five fixes),
because the profile as written (a) can't express `raw-input`, (b) scatters pack-authority
status across concept files, and (c) collides with both existing KDD checkers if OKF's
recommended links or a live `log.md` are used inside an accepted pack. No template or canon
change until the corrected sample proves green against `check-knowledge-pack.mjs` and
`check-knowledge-memory-freshness.mjs`.

---

## Addendum — full source verification (2026-07-02, all four spike-cited sources read directly)

I read all four resources the spike cites. They **confirm and harden** the verdict; none
changes it. Verdict stays **APPROVE WITH FIXES**.

**1. OKF v0.1 SPEC (raw).** Verified in the primary review above. Faithful in the spike.

**2. Google Cloud blog "Introducing the Open Knowledge Format" (2026-06-12, McVeety/Hormati).**
Confirms OKF's own stated philosophy and *sharpens two of my findings*:

- **"Format, not platform … the format is the contract; the tooling at each end is
  independently swappable."** This is OKF authors' explicit intent — OKF is a *format*, never
  an authority. That directly validates the spike's Q1 direction (OKF as interop skin, KDD
  keeps authority) and confirms it is aligned with the source, not a strained reading.
- **Karpathy rationale ("LLMs don't get bored … can touch 15 files in one pass").** This is the
  *why* per-file frontmatter replication is tempting — but it justifies replicating only
  **descriptive** fields (`type/title/description/tags/timestamp`), which OKF is designed for and
  which agents maintain well. It does **not** justify replicating **authority** fields
  (`kdd_status`, validator). This sharpens **fix #2**: replicate descriptive metadata per
  concept (fine, that's OKF); keep authority/status single-sourced in PACK-METADATA.
- New concrete opportunity for the **Spike Shape**: Google ships an enrichment agent, a
  single-file static HTML visualizer, and **three ready sample bundles (GA4, Stack Overflow,
  Bitcoin)**. Use the visualizer as the "generic OKF-aware consumer" in success-criterion #7,
  and use one Google sample bundle *or* the cole-medin bundle (below) as the **import test
  fixture** rather than hand-authoring one — cheaper and more honest evidence.

**3. `coleam00/cole-medin-ai-coding` — a live external OKF bundle.** It is "An OKF bundle of
Cole Medin's best AI-coding videos … mount it in any AI second brain and search it deeply.
Transcript-verified." This is the **strongest single piece of evidence for fix #1**: it is a
textbook `raw-input`-class artifact — curated *external transcripts*, not KDD-validated accepted
knowledge. If VibeThink imported it (exactly the adoption-path §5 case), it MUST enter as
`raw-input` (canon §4: "Evidence only; never source of truth"). The spike's proposed
`kdd_status` enum **cannot express `raw-input`**, so importing this real bundle would force a
false `candidate` tag — status inflation on day one. A real bundle now proves the omission is
not hypothetical. **Fix #1 is mandatory, not cosmetic.**

**4. `knowledge-catalog/tree/main/okf` (repo tree).** Rendered listing only via fetch; the
normative content is `SPEC.md` (already verified). No change.

**Net effect of the extra sources:** direction reconfirmed (OKF is a format/contract by its
authors' own words → interop-skin framing is correct), and the two load-bearing fixes are
hardened — fix #1 by a real `raw-input` bundle, fix #2 by the correct reading of Karpathy's
"touch 15 files" (descriptive-yes, authority-no). Recommend the spike adopt an existing bundle
(cole-medin or a Google sample) as its import fixture instead of authoring one.
