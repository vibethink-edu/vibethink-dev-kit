# REVIEW — Adversarial independiente del PR #222 (policy engine S2) — verbatim

**From:** independent reviewer (Opus, via chat relay 2026-07-02) — filed by dev-kit architect per the persist-audits rule (an audit that arrives via chat is filed in comms before/while acting on it; chat is not the record).
**Subject:** PR #222 `claude/feat-policy-engine-s2` at `ef5a164`.
**Verdict:** **REQUEST CHANGES** (1 P1 verified-with-exploit · 1 P2 · 1 P3).
**Disposition:** all three ACCEPTED → fixed in `44685f7` (response addendum: `2026-07-02-DELIVERY-DEVKIT-POLICY-ENGINE-S2.md`). Re-review dispatched by Marcelo same day; verdict pending.

---

## Findings (verbatim)

**P1 — Approval/session state is not protected from the agent tool plane.**
`tools/policy-engine/session-store.mjs:70-75`, `tools/policy-engine.mjs:80-89`, `tools/policy-engine/hook-adapter.mjs:81-84`

> The engine treats `approve` or any matching `PostToolUse` as authority to apply withheld ASK writes, but there is no proof that the exact ASK was approved by a human. More importantly, the session file defaults into `.policy-sessions` under the workspace, and labels are plain JSON. A governed agent with shell access can mutate that store or invoke the approve/post path unless the harness externally prevents it.
>
> I verified the comm-lane bypass: `git push origin main` is DENY with normal state, then ALLOW after `labels.commLane=true` is written into the session JSON. I also verified a generic `node -e ...` command is ALLOW under the current git manifest, so the engine does not protect its own session state.
>
> Required fix: make approval/session state a protected boundary. At minimum: store sessions outside agent-writable workspace, deny tool-plane mutation/invocation of policy-engine approve/hook post, or add signed/provenance-checked protected labels. Add known-bad tests: agent attempts to set `labels.commLane`; agent attempts to self-settle pending ASK; forged `PostToolUse` without harness approval must not apply writes.

**P2 — `GIT-MUST-ALL-VIA-PR` matcher false-positives normal feature branch names.**
`knowledge/policy/canon-git-hygiene.policy.json:74`

> Pattern matches any `main`/`master` word anywhere after `git push`, so `git push origin feature/main-fix` is denied even though it is not a default-branch push. I verified: `git push origin main` → match · `git push origin feature/main-fix` → match · `git push origin HEAD` → no match. The declared partial coverage handles false negatives, but not this false positive. Tighten to refspec/default-branch shapes or document the tradeoff and add tests.

**P3 — Last-writer-wins risk is declared in code, not strongly in the adoption/reference surface.**
`tools/policy-engine/session-store.mjs:17-19`

> The risk is honestly stated in the code comment, but consumers wiring S2 need to see it in `REFERENCE-POLICY-ENGINE-001`/delivery guidance: one writer only, protected store, no shared mutable session file across parallel agents.

**Reviewer validation run:** `policy-engine.test.mjs` 22/22 · `policy-engine-session.test.mjs` 15/15 · `check-policy-manifests.test.mjs` 20/20 · manifests GREEN 32/32. Graphify index absent locally; review used targeted PR diff/files. No files modified by the reviewer.

---

## Disposition (§4 — one row per finding)

| Finding | Disposition | Link |
|---|---|---|
| P1 | ACCEPTED → FIXED (structural: `unlessGrant` call-time provenance + floor `self-protection` + store outside workspace + 4 known-bad tests; declared harness-backstop limit) | `44685f7` |
| P2 | ACCEPTED → FIXED (ref-token pattern on BOTH rules + tests; residual declared in coverage) | `44685f7` |
| P3 | ACCEPTED → FIXED (one-writer/protected-store deployment contract lifted into reference §7) | `44685f7` |

**Prior cycle, same front (for the record):** S1 review (PR #221) = APPROVE WITH FIXES, 2 P2 (fail-closed compiler · declared partial port coverage) → fixed `3046e7b`, addendum in the S1 delivery.

---

## Re-review (2026-07-02, same day, verbatim) — **Verdict final: APPROVE**

> Verifiqué el fix `44685f7`.
>
> El exploit exacto quedó cerrado: `state.labels.commLane=true` forjado en el JSON de sesión ya no exime. Ahora la exención usa `unlessGrant`, leído solo desde `event.labels` por `--grant commLane` en la invocación gobernada. Probé: estado forjado → `DENY`; grant por llamada → `ALLOW`.
>
> El floor self-protection cubre las formas directas: `policy-engine approve/deny`, `hook-adapter.mjs`, `.policy-sessions` y `vibethink-policy-sessions`. También hay tests known-bad para self-settlement, tamper y forged Post. Un `node -e` genérico puede construir strings dinámicos, pero eso está declarado honestamente como límite del pattern-floor y queda en el backstop sellado del harness static deny (§8 / no arbitrary-exec wildcard). Me parece suficiente como frontera de S2.
>
> El patrón ref-token ahora da lo esperado: `git push origin main` → match/DENY · `git push origin feature/main-fix` → no match · `git push origin HEAD` → no match · `git push origin HEAD:main` → match/DENY · `git push origin refs/heads/main` → match/DENY · `git push origin release/main` → match, residual declarado en coverage.
>
> Validación: `policy-engine.test.mjs` 22/22 · `policy-engine-session.test.mjs` 22/22 · `check-policy-manifests.test.mjs` 20/20 · manifests GREEN 32/32.
>
> No findings restantes.

**Disposition final:** P1/P2/P3 → FIXED (`44685f7`) → re-verified by the independent reviewer → **APPROVE, no findings restantes**. PR #222 queda a sello+merge del chief architect.
