# REVIEW (adversarial architecture advisor) — KDD/OKF hardened compatibility guardrail

**From:** Claude Opus (independent architecture advisor, Cursor session), 2026-07-02
**To:** Codex dev-kit session (implementer) → Marcelo for direction
**Reviews:**
- `docs/ai-coordination/comms/2026-07-02-SPIKE-KDD-OKF-COMPATIBILITY.md`
- `docs/ai-coordination/comms/2026-07-02-REVIEW-ADVERSARIAL-KDD-OKF-COMPATIBILITY-OPUS.md` (my prior review)
- `docs/ai-coordination/comms/2026-07-02-DELIVERY-KDD-OKF-HARDENED-SAMPLE.md`
- `tools/check-knowledge-pack{,.test}.mjs`, `tools/check-knowledge-memory-freshness{,.test}.mjs`,
  `tools/kdd-refresh{,.test}.mjs`, `tools/knowledge-memory.config.example.json`,
  `setup/templates/knowledge-memory/knowledge-memory.config.json`, `.../README.md`
**Status:** review output only. Not sealed law. Does not amend templates or canon.

---

## Verdict

**APPROVE WITH FIXES.**

The hardened work is **safe as a pre-adoption mechanical guardrail** and I recommend keeping it
as one. All five fixes from my prior review are implemented with real teeth, the tests prove
both directions (pass *and* RED), authority stays single-sourced in `PACK-METADATA.md` **by
construction** (the only file consulted for status), and no external content is copied into the
kit. I re-ran all three suites independently: **12 + 10 + 6 = 28 passed, 0 failed** (the two
`✗` lines in the refresh suite are intentional negative-test output; exit 0).

But there are **two real findings** that must be resolved **before moving to optional template
support / shipping the config defaults to consumers** — one of which I reproduced empirically as
a working silent-staleness exploit. Hence APPROVE (as guardrail) WITH FIXES (before template
adoption).

**Guardrail vs template:** keep this as an internal guardrail now. Do **not** promote to optional
template support until F-1 and F-2 below are fixed **and** the delivery's own proposed
agent-behavior test shows OKF navigation actually improves context selection. The `knowledge-
memory` template already ships `sourceExclusions: ["index.md","log.md"]` as a **default** — that
default is where F-1 bites a consumer.

---

## Findings, ordered by severity

### F-1 — HIGH · Basename-global `sourceExclusions` can silently hide accepted knowledge *(reproduced)*

`includeSource()` (in both `check-knowledge-memory-freshness.mjs:108` and `kdd-refresh.mjs:97`)
excludes a file when **either its repo-relative path OR its basename** is in `sourceExclusions`.
The shipped default (`knowledge-memory.config.json:7`, `knowledge-memory.config.example.json:8`)
uses **basenames**: `["index.md","log.md"]`. That excludes **every** `index.md`/`log.md` at any
depth, in any pack — including an `accepted` pack — from the source fingerprint.

OKF §6 *permits* `index.md` to carry substantive content (progressive-disclosure descriptions),
and teams hand-author curation into index/log files. If any such file holds load-bearing
accepted knowledge, it becomes **freshness-invisible**: it can change and the derived
memory (graphify/engram) goes stale against real accepted content while the gate reports GREEN.
This is precisely the silent-staleness the harness exists to prevent — reintroduced by naming.

**Reproduced empirically** (throwaway fixture, real tools, then cleaned up):

```
accepted pack: kb/mypack/{PACK-METADATA(status: accepted), BUSINESS-CONTEXT.md, index.md}
config: sourceExclusions ["index.md","log.md"]

kdd-refresh            → sources: 2   (index.md already NOT counted)
mutate index.md (load-bearing) → check-freshness → GREEN, exit 0   ← SILENT STALENESS
mutate BUSINESS-CONTEXT.md     → check-freshness → RED,   exit 1   ← control behaves correctly
```

The manifest-recorded exclusion list (F-2) does **not** save this case: the exclusion is
"correct" per config, so nothing is RED — the hole is that an excluded name can be authoritative.

**Disposition — FIX before template adoption (not before keeping the guardrail):**
- Prefer **path-scoped** exclusions (the code already matches `fileRel`) over basenames in the
  shipped defaults, OR
- gate exclusion to *generated* surfaces only — e.g. only exclude an `index.md`/`log.md` that is
  **not** a required pack artifact **and** is declared generated (no `kdd-*` authored content), OR
- at minimum, keep basenames but add a **known-sharp-edge test** that locks and documents the
  silent-GREEN behavior, and make the template README warn in bold that any `index.md`/`log.md`
  under an accepted pack MUST be generated/derived — never hand-authored accepted knowledge —
  because exclusion makes it freshness-invisible. (The README §3 hint exists but is far too soft
  for a default that ships active.)

### F-2 — MEDIUM · Recording `sourceExclusions` in the manifest is necessary but not sufficient

The manifest stores `sourceExclusions` (`kdd-refresh.mjs:172`) and the checker REDs when config
and manifest disagree (`check-knowledge-memory-freshness.mjs:173`), tested at
`check-knowledge-memory-freshness.test.mjs:164`. Normalization is symmetric (lowercase,
slash-normalize, strip leading `/`, sort), so no false RED from formatting. Good — this closes
**silent** drift (config changed without re-refresh).

It does **not** close **sanctioned** drift: an agent that adds a bad/broad exclusion **and
re-runs refresh** blesses the new list, and everything returns to GREEN. So `sourceExclusions`
is a governance-sensitive field. Recording it (auditable in the manifest) is the right control,
but it must be paired with F-1's scope-tightening + review discipline; recording alone answers
"did the config change since refresh?", not "is an excluded file load-bearing?".

**Disposition — DOCUMENT + pair with F-1.** Treat the exclusion list as an audited,
review-required field; the manifest already makes it visible. No code change strictly required
here beyond F-1.

### F-3 — MEDIUM · Status enum vs canon §8.2 (`lapsed` / `stale-by-pivot`) — latent false-RED

`check-knowledge-pack.mjs:270` accepts exactly the five §4 states
(`raw-input|candidate|accepted|superseded|rejected`). Canon §8.2 (SEALED 2026-06-29) adds two
transitions — `accepted → lapsed` (TTL) and `accepted → stale-by-pivot` (declared pivot). It is
**ambiguous in the canon** whether these are persisted `status:` values or computed conditions.
If a consumer, reading §8.2 literally, writes `status: lapsed` into `PACK-METADATA.md`, the
structural gate false-REDs it as "invalid status". Conversely, the tools implement **no** TTL /
revalidation / pivot detection at all (consistent with §8.1 being hash-based and §8.2 conceding
semantic staleness "cannot be auto-detected") — so today the §8.2 nets are **human-only** with no
mechanical surface (`kdd status` not implemented here).

**Disposition — RECONCILE before template adoption.** Decide and record: are
`lapsed`/`stale-by-pivot` (a) `status:` enum values → add them to the allowed list, or (b)
computed conditions → note in the gate/canon that they are not stored statuses. Either is fine;
the ambiguity is the risk. This is a spine/canon clarification, so it goes to Marcelo's canon
authority (§6.1: agents propose, do not auto-edit canon).

### F-4 — LOW · Per-concept `kdd_status` is not mechanically forbidden (display-vs-authority split)

Authority is safe: `metadataStatus()` reads **only** `PACK-METADATA.md`, so a lying
`kdd_status: accepted` on a concept file cannot confer authority — stronger than my prior review
credited. The residual is purely **display**: a generic OKF agent reading one concept file could
see a `kdd_status`/`status` string and mistake it for pack acceptance (risk #1's cosmetic tail).

**Disposition — OPTIONAL lint + test.** Consider a soft check that forbids `status:`/`kdd_status:`
in non-`PACK-METADATA` pack files, and a test asserting a lying per-concept status does not confer
authority. Not blocking.

### F-5 — LOW · Known-bad test coverage gaps

- The slash-absolute known-bad test (`check-knowledge-pack.test.mjs:298`) covers only an
  `index.md` link. Add a **concept-file** variant and an OKF `/subdir/file.md` variant so the
  "OKF absolute links are known-bad for the current gate" contract is fully pinned.
- No test documents the F-1 silent-GREEN edge (see F-1 disposition).

**Disposition — ADD tests before template adoption** (cheap, and they lock the contracts).

---

## Answers to the review questions

1. **Preserves constitutional/KDD authority?** **Yes.** Accepted Markdown Pack remains source of
   truth; OKF surfaces are treated as derived (excluded from the source fingerprint) and
   descriptive frontmatter only; authority is single-sourced in `PACK-METADATA.md` *by
   construction*. Consistent with canon §1/§4/§8. No content catalog entered the kit.

2. **`raw-input` handled / any inflation path?** **Handled correctly.** `raw-input` is now a
   valid status (`check-knowledge-pack.mjs:270`), tested GREEN with descriptive-only frontmatter.
   Freshness only fingerprints `accepted` packs (`sourcePackStatuses` default `["accepted"]`,
   tested at freshness:133), so raw-input/candidate churn never masquerades as accepted baseline.
   No path inflates an external OKF bundle into candidate/accepted — import stays external
   (`git ls-remote` only, not copied).

3. **Are `index.md`/`log.md` exclusions safe, or could they hide real accepted knowledge?**
   **They can hide it — see F-1, reproduced.** Safe *for genuinely generated surfaces*; unsafe as
   a *basename-global default* because an authored `index.md`/`log.md` with accepted content goes
   silently GREEN on change. Fix scope before shipping the default.

4. **Is recording `sourceExclusions` enough to prevent silent freshness drift?** **Necessary, not
   sufficient — see F-2.** It catches config-vs-manifest divergence (silent drift). It does not
   prevent a sanctioned-but-wrong exclusion (re-refreshed) from hiding accepted knowledge; that
   needs F-1 + review of the (now auditable) exclusion list.

5. **Are known-bad tests strong enough (slash-absolute links, changed exclusions)?** **Mostly.**
   Slash-absolute → RED and changed-exclusions → RED are both proven. Gaps in F-5: no
   concept-file absolute-link variant, and no test documenting the F-1 silent-GREEN edge.

6. **Contradiction with `CANON-KNOWLEDGE-NATIVE-VT-METHOD-001`?** **No direct contradiction; one
   latent tension (F-3).** The OKF-as-derived + raw-input + accepted-only-fingerprint model
   aligns with §1/§4/§8/§11. The latent tension is the status-enum vs §8.2 `lapsed`/
   `stale-by-pivot` ambiguity, which could produce a false-RED — reconcile in canon.

7. **Exact fix before optional template support?** F-1 (tighten exclusion scope or gate to
   generated-only + hard-warn in README + sharp-edge test) and F-3 (reconcile the §8.2 status
   question in canon). F-5 tests are strongly recommended in the same pass. F-2/F-4 are
   document/optional. None of these block keeping the work as an internal guardrail.

---

## Should this remain a guardrail or proceed to optional template support?

**Remain a guardrail now.** Proceed to optional template support only after **(a)** F-1 + F-3 are
fixed, and **(b)** the delivery's own agent-behavior test (raw-input OKF bundle navigation vs a
plain-doc baseline) shows measurable better context selection *without* the agent claiming the
content is accepted. Shipping the `sourceExclusions` basename default to consumers before F-1 is
the one move that could actively harm a consumer (silent staleness on an authored index).

---

## Adversarial exploits I ran / would run next

- **[RAN — confirmed] Accepted knowledge hidden behind a reserved name.** Load-bearing content in
  an `accepted` pack's `index.md` + default basename exclusion → mutate after refresh →
  freshness **GREEN/exit 0** (control on `BUSINESS-CONTEXT.md` → RED/exit 1). This is F-1.
- **[NEXT] `status: lapsed` false-RED.** Write §8.2's `lapsed` into `PACK-METADATA.md` → expect
  structural gate "invalid status" RED. Proves F-3's enum gap.
- **[NEXT] mtime bypass via exclusion.** With a required index and `requireArtifactNewerThanSources`,
  exclude the newest accepted-ish file so `maxSourceMtime` drops, letting a stale index artifact
  pass the "newer than sources" check. Ties to F-1.
- **[NEXT] per-concept status spoof.** `BUSINESS-CONTEXT.md` frontmatter `kdd_status: accepted`
  while `PACK-METADATA` says `raw-input` → gate authority unaffected (good), but a generic OKF
  reader is misled → argues for the F-4 lint.

---

## Bottom line for Marcelo

The guardrail is honest, tested (28/28 verified independently), authority-preserving, and does
not turn the kit into a content catalog — safe to keep. Two things must change **before** it
graduates to a consumer-facing template: (F-1) the default basename exclusion can silently hide an
authored `index.md`/`log.md` that carries accepted knowledge — reproduced as a live silent-GREEN
exploit; and (F-3) reconcile whether §8.2 `lapsed`/`stale-by-pivot` are `status:` values or
computed conditions, to avoid a future false-RED. Everything else is documentation or optional
hardening.
