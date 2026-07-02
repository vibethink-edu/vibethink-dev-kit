# REVIEW ADVERSARIAL — PR #227 telemetry consumption lens — R1 (verbatim)

- **Reviewer:** independent adversarial reviewer (relayed by Marcelo, 2026-07-02)
- **PR:** https://github.com/vibethink-edu/vibethink-dev-kit/pull/227
- **Filed by:** claude (Fable 5, dev-kit seat) — verbatim BEFORE acting (CANON-AUDIT-PROTOCOL §9)

## Verdict (verbatim)

> Review PR #227 (telemetry consumption lens): REQUEST CHANGES. Neutralidad CLEAN (lens
> puro, sin evaluate, exit 0 siempre para condiciones de datos), exit codes honestos,
> interleaving entre sesiones OK. Dos findings en el streak detector: P2 under-report
> (streak de misma regla se dropea cuando la misma sesión cambia de regla en un DENY —
> la pared real desaparece; verificado en CLI) y P3 over-report (línea corrupta que era
> rompe-corrida une 2 corridas en un streak fantasma de 4). Fix P2 = flush antes de
> overwrite + 2 known-bad; P3 = anotar streaks cuando malformed>0 o romper corrida en
> malformed. Suites 20/22/37 + manifests 32/32 GREEN.

## Disposition

- **P2 (under-report, rule-switch drops a live streak): ACCEPTED — real bug.** The
  DENY branch overwrote a session's live run on rule change without flushing a
  threshold-crossing run first. Fix: flush before overwrite + 2 known-bads (the drop
  case, and the no-false-positive case where the dropped run was short).
- **P3 (over-report, corrupt run-breaker joins runs): ACCEPTED — annotate option.**
  Of the two offered fixes, annotation is chosen over break-on-malformed: a malformed
  line carries no session id, so breaking would sever ALL live runs (turning a rare
  corrupt line into P2-style under-reporting for unrelated sessions, and splitting a
  real streak below threshold). Annotation keeps the signal and declares the
  uncertainty: when malformed > 0, the streak section carries an explicit
  upper-bound caveat. + known-bad tests both ways (annotated when malformed>0 with
  streaks; silent when clean).

---

## R2 — re-review @ 5b20148 (verbatim): APPROVE

> VERDICT: APPROVE
>
> P2 — streak drop on same-session rule change → FIXED (correcto). El fix hace flush de
> la corrida previa si ≥ streakThreshold antes de sobreescribir en el else del rule-switch.
> Re-corrí mi repro exacto de R1 y edge cases nuevos: R/WALL×3 + DENY R/OTHER → R/WALL:3
> reportado (antes se dropeaba) · cadena A×3,B×3,C×3 (C abierto en EOL) → los 3 flushed,
> sin dup, sin miss · A×5 luego switch a B → 1 sola streak A length 5 (no doble conteo) ·
> short run A×2 luego switch → nada inventado · dos paredes A separadas por ALLOW → 2
> streaks correctas. Los 2 known-bads pedidos están.
>
> P3 — corrupt-join phantom streak → ANOTADO (correcto). Cotas superiores cuando
> malformed>0, con mi repro exacto 2+corrupt+2 → 4-streak como known-bad. El rationale
> anotar-vs-romper es sólido y está documentado en código. La anotación es la elección
> honesta.
>
> Residual observado (direction-safe, NO blocker): una línea corrupta que era un DENY
> extensor real puede enmascarar una streak (under-report), y el caveat "upper bounds"
> solo se renderiza dentro de la sección de streaks — si la corrupción suprime todas,
> no hay caveat. Aceptable; a lo sumo doc-only futuro.
>
> Focos que seguían CLEAN (sin regresión): neutralidad (funciones puras, sin
> evaluate/state/IO) · exit codes (0 para datos, 2 solo setup). Validación re-run en
> 5b20148: telemetry-lens 24/24 · policy-engine 22/22 · session 37/37 · manifests 32/32
> GREEN. El hueco §8.7a de R1 (transición rule-change sin known-bad) quedó cerrado.
>
> Disposition R2: P2 ACCEPTED → FIXED · P3 ACCEPTED → FIXED (anotado) · residual
> under-report enmascarado NOTED — direction-safe, no blocker. Precedente honrado:
> como S2 (3 rondas → APPROVE), acá 2 rondas → APPROVE. GO merge en #227.

**Owner disposition:** R2 APPROVE registrado; residual under-report NOTED queda declarado
aquí como límite honesto conocido (doc-only candidate, no arranca frente). Merge ejecutado
con el GO de Marcelo.
