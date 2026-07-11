# Adversarial re-check record (APPROVE) — REFERENCE-OPERATOR-COMMAND-CATALOG v2 (D-065)

- **Companion:** `REVIEW-ADVERSARIAL-OPCAT-V2-2026-07-10.md` (round 1, REQUEST-CHANGES).
- **Validator:** independent `devkit-rev` (Fable 5) — same reviewer, round 2.
- **Round 2 commit reviewed:** `16e105c` (fixes on top of `6019c0b`).
- **Date:** 2026-07-10.
- Filed per `CANON-AUDIT-PROTOCOL §9`.

---

## Round 2 — `VERDICT: APPROVE` (verbatim)

Re-verified against `16e105c`. Ran the gate (GREEN, 16), the full suite (**25/25**), `check-gate-integrity` (19 GREEN incl. this one), `check-canon-links` (GREEN), and drove ~17 adversarial parser probes plus `stripInlineComment` unit cases.

### Round-1 findings — all closed (EXECUTED-verified, not just claimed)

- **M1** CLOSED — configured-but-missing adapter → `setupError` exit 2; `REGRESSION M1` asserts it.
- **M2** CLOSED two ways — `matches:` regex tolerates a trailing comment, AND a generic safe-failure net (`parsed < headerCount`, or `matches:` present with 0 commands, or no `matches:`) → exit 2. `matches: # comment` + duplicate now RED, not skip.
- **M3** CLOSED — `stripInlineComment` quote-aware; `replace: # todo` → dead RED; `trigger: ":x" # again` → duplicate RED.
- **M4** CLOSED — rule 8 localizing-id clause ("identity is the id; the consumer binds exactly one canonical trigger at L3 — still one per intention").
- **D1** CLOSED — `-?\s*replace:` + alt body keys + block bodies ended by indentation. 4-space indent, block-then-next-match, body-key-first, fake `- trigger:` inside a block body all parse correctly.
- **D2/N3** CLOSED — bare `- ":x"` attaches only when `openByTriggersList`; the always-true guard is gone.
- **D3** CLOSED — rule 9 neutral `COMMAND EXECUTED`, Spanish as the rule-5 localized example; demo header marks its Spanish as intentional.
- **D4** CLOSED — README 11→16; VS Code example marked pre-v2 in README + JSON `//v2`.
- **D5** CLOSED — `dk-refresh`.
- **N1/N2** CLOSED — static-list exception covers rules 3 AND 9; CLI guard `resolve(fileURLToPath(import.meta.url)) === resolve(argv[1])` in try/catch.

### Regression hunt — no MAJOR/MEDIUM regressions

- `stripInlineComment` edges all correct: `:xxx#frag` kept, `http://x#y` kept (`#` not after whitespace), quoted `"# "` kept, `:t # trailing` stripped.
- Base-indent variance: 4-space and 2-space matches parse; block-scalar end-by-indentation handles block→next-match, block→column-0-key, CRLF.
- Completeness self-check not fooled into false GREEN over a real defect: empty `triggers:` list → exit 2; shared-body `triggers:` list yields parsed(2) ≥ header(1) with both linted.
- List-flush does not break body-key-first matches.

### Surviving MINOR (non-blocking, malformed-input only — do not hold the seal)

1. A malformed-YAML trigger `trigger: ":x"  extra` parses to a mangled non-empty value → lints "clean"; but it is invalid YAML Espanso would not load, and it cannot mask a defect in a *valid* adapter.
2. A stray bare `- ":loose"` with no trigger key is silently dropped and doesn't bump `headerCount` — again a non-loadable construct.
3. `triggers:`-list partial drop: one header can yield N commands, so `parsed < headerCount` cannot detect a list that drops *some* items — only one that drops all. Narrow; the list form is unused in the shipped example. **Declared as a known limitation in the gate header.**
4. D-065 register row still read "14/14" / "review (pending)" at review time — refreshed to 25/25 + the two-round record at seal.

**Reviewer's closing:** "The design choice to **fail loud (exit 2) on any parse uncertainty rather than green-skip** is the correct posture for a gate and closes the entire class of false-GREEN holes I found in round 1. Clean to seal once the D-065 row is refreshed with the final numbers."

**Disposition:** MINOR #3 declared in the gate header; MINOR #4 (D-065 numbers) refreshed. Presented to the named authority for seal.
