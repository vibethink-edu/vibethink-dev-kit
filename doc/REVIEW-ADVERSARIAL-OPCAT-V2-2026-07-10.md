# Adversarial validation record — REFERENCE-OPERATOR-COMMAND-CATALOG v2 (D-065)

- **Artifact under review:** `REFERENCE-OPERATOR-COMMAND-CATALOG` v2 amendment + new gate `check-operator-catalog` (kit PR #254, branch `claude/ops-catalog-canonical-only-v2`).
- **Builder:** dev-kit seat (Claude Code, Opus 4.8) — drafted the amendment, gate, tests.
- **Validator:** independent `devkit-rev` (Fable 5), no authorship of the change. "The builder does not grade."
- **Round 1 commit reviewed:** `6019c0b`.
- **Date:** 2026-07-10.
- Filed per `CANON-AUDIT-PROTOCOL §9` (persist the adversarial verdict verbatim before acting).

---

## Round 1 — `VERDICT: REQUEST-CHANGES` (verbatim)

Validator ran the gate + test itself (gate GREEN on the shipped example, 16 commands; test 14/14; `check-gate-integrity` 19 GREEN; `check-canon-links` GREEN — the D-065 claims on those honest). Built adversarial adapter inputs and demonstrated **false GREENs** on two of the gate's three RED conditions, plus a self-contradiction in the flagship rule.

### MAJOR

- **M1 — False GREEN: an explicitly-configured adapter that doesn't exist is silently skipped (exit 0).** When a config EXISTS and its `adapter` points at a missing file, the gate printed "nothing to lint (skip)" and exited 0 — contradicting its own header and §5.1 ("skip only when neither a config nor the example is present"). Compounding: the shipped config example carries a placeholder `adapter` path, so a consumer who copies it unedited gets a permanently GREEN gate that never lints. The test pinned the wrong behaviour as correct. Fix: config-declared adapter missing → exit 2; flip the test.
- **M2 — False GREEN: any parser miss on the `matches:` line silently skips the whole file.** `matches:` required `/^matches:\s*$/`; a trailing comment (`matches: # my commands`) → parsed `[]` → GREEN-skip over a real duplicate. Any future parse gap degrades to silence. Fix: tolerate the comment AND treat "file present, 0 matches parsed" as setup error (exit 2).
- **M3 — False GREEN on two of the three RED conditions via `#` comment handling.** `replace: # TODO` → body taken as the comment text → dead-command passes GREEN. `- trigger: ":x" # again` → trigger captured with the comment appended → duplicate/prefix missed. Fix: strip an unquoted trailing `#…` from scalar values (a `#` inside quotes stays); a comment-only `replace:` is empty.
- **M4 — Self-contradiction: rule 8 vs the new `explain` rows.** Rule 8 says "exactly one canonical trigger per command id" and "`commands-help` lists exactly the canonical set", but the explain rows say the canonical trigger "localizes" — i.e. there is no L1 trigger for `explain-plain`/`explain-teach`, so "the canonical set" is undefined for two of the catalog's own ids. Fix: state that for localizing commands the L1 identity is the id; the consumer binds exactly one canonical trigger at L3 — still one per intention.

### MEDIUM

- **D1 — False REDs on valid Espanso shapes:** `replace:` before `trigger:` (regex lacked `-?`); a block body whose first content line is a markdown bullet (`- step`) read as end-of-body; a match using `form:`/`markdown:`/`html:`/`image_path:` instead of `replace:` → dead-command on a valid match. A consumer whose valid file goes RED will unwire the gate. Fix: `-?\s*replace:`, end block bodies by indentation not shape, count the alternative body keys.
- **D2 — Phantom triggers harvested from block-scalar bodies.** A body line `- ":foo"` under `replace: >-` was consumed as a trigger (guard `cur.triggers.length >= 0` always true) → false duplicate RED. Fix: accept bare list items only under an open `triggers:` list; skip block content by indentation.
- **D3 — Language leak in L1.** Rule 9 set the Spanish string `COMANDO EJECUTADO: :xxx — <intención>` as THE canonical format; the "neutral seed" demo ships Spanish triggers. Not a vendor/store/path leak (that half of the fire-test holds — rules 11/12 L1 bodies are clean), but rule 9 elevated Spanish to the L1 format string. Fix: state the neutral form (`COMMAND EXECUTED`, localized label allowed per rule 5); mark the demo's Spanish as intentional localization.
- **D4 — The templates directory disagrees with itself.** README still said "11-command DEMO" (yml header now 16); `vscode-snippets.example.json` was not brought under rules 9–12. Fix: update the count; update or mark the VS Code example pre-v2.
- **D5 — Dangling command id `dk-health` in §3.** `related_commands` referenced an id absent from §4 (only `dk-refresh`). Pre-existing, but rule 8 is precisely about exact canonical identities. Fix: `dk-health` → `dk-refresh`.

### MINOR

- **N1 — Rule framing + a rule-3 gap.** Rule 3 ("every command ends with `RECOMMENDATION`") got no static-list carve-out while rule 9 did, so the demo `:commands-help` violates rule 3 as literally reaffirmed. One clause fixes both.
- **N2 — CLI run-guard fallback is loose** (`endsWith`). Suggest `fileURLToPath(import.meta.url) === resolve(argv[1])`.
- **N3 — Dead condition** `cur.triggers.length >= 0` (always true), the enabler of D2.

### Explicitly clean (verified, round 1)

Prefix-collision logic (`b.startsWith(a)` over de-duped sets, proper-prefix semantics); test integrity (known-bad asserts real, apart from M1's pinned assertion); the `repo-status` collapse (no live dangling ref); category enumeration consistent (incl. `explain` + `dk`); the GO'd L3 splits hold (rule 11 names no secret store, rule 12 no inbox/lane path); D-065 row ascending + honestly DRAFT (only overclaim: "Fire-test PASS" glosses the language axis, D3).

**Disposition:** all 4 MAJOR + 5 MEDIUM + the 3 MINOR applied in commit `16e105c`. See the APPROVE record for the round-2 re-verification.
