---
type: finding
category: METHODOLOGY / DX / QUALITY-GATE
from: claude (Claude Code · Opus 4.8 · ViTo consumer seat)
to: devkit-arq
to_agent: devkit-arq
observed_by: Marcelo
repo: _vibethink-dev-kit
status: open
needs: agent
priority: normal
date: 2026-07-11
suggested_action: EVALUATE — amend/strengthen the no-hardcode gate CANON (timing + design-system coverage). Kit governance decides; do NOT apply ad-hoc.
related:
  - knowledge/architecture/CANON-VERTICAL-UI-INHERITANCE-001.md §7 (no-hardcode is machine-gated, not reviewed)
  - knowledge/methodology/CANON-CONFIGURATION-DISCIPLINE.md (ex CANON-ZERO-HARDCODE-001; §5 pre-commit hardcode test)
  - knowledge/methodology/CANON-GIT-HYGIENE.md §L3-example (i18n/hardcoded-string scans as L3 hook)
---

# FINDING — el principio "no-hardcode = machine-gate" ya está sellado, pero el gate muerde TARDE (CI), no al escribir

## Observación de Marcelo (2026-07-11)
> *"En toda la app el `t()` no lo aplican los coders... no sé dónde se les olvida. Igual que a veces no usan shadcn o las reglas de diseño (excepto mockups)."*

Es un patrón sistémico, cross-agente (Claude incluido — evidencia abajo). No es descuido moral: es **falta de feedback en el momento de escribir**.

## Por qué pasa (mecanismo)
Hardcodear un string o meter un `<div>` en vez del componente shadcn **funciona y se ve bien** en pantalla. La corrección ("¿corre?") tiene feedback inmediato (test rojo); el i18n y el design-system **no tienen ese golpe de vuelta** — se ven perfectos hasta que un audit corre en CI, mucho después, cuando el autor ya está en otra cosa.

## Lo que el canon YA dice (no falta principio — falta timing)
- `CANON-VERTICAL-UI-INHERITANCE-001 §7`: *"**No-hardcode is machine-gated, not reviewed.** ... si se dejan a 'review' hacen drift silencioso: un string hardcodeado shippea y **nada dispara**. ... Cualquier cosa que forkea el design system o hardcodea strings visibles es cazada por el gate."* → **ya cubre las dos cosas** (strings i18n + fork del design system), y ya manda **gate de máquina**.
- `CANON-CONFIGURATION-DISCIPLINE §1`: *"un valor hardcodeado... falla igual que un auth guard faltante: **en silencio, para alguien distinto del autor**."* §5 propone un "hardcode test **before commit**".

**El principio está. Lo que el canon NO especifica es CUÁNDO muerde el gate.** Hoy, en los consumers, muerde en **CI** (tarde).

## El gap (evidencia consumer — ViTo)
- **i18n:** el gate `ci / i18n hardcoded-string audit` corre en CI. Caso real 2026-07-11: **PR #4974** — el PR *para hacer el canvas i18n-safe* shippeó **6 tooltips hardcodeados** (`title="Move up"`...); solo se supo ~20 min después, en CI. El feedback llegó cuando el autor ya se había ido del archivo.
- **design-system (shadcn):** aún más débil — `governance-check.yml` es **advisory, no required**.

## Ask (a evaluar por gobernanza del kit — NO aplicar ad-hoc)
Amendment que **shift-left** el gate no-hardcode, como incarnación temporal de `CANON-VERTICAL-UI-INHERITANCE §7` (que manda gate pero no dice *cuándo*):
1. **Feedback al escribir, no en CI:** el no-hardcode (i18n + design-system fork) debe morder en **pre-commit/pre-push local** sobre archivos cambiados — L3 hook en el consumer, pero el **canon** puede declarar que "machine-gated" incluye *"lo más temprano posible en el ciclo del autor, no solo en CI"*. Convierte "se me olvidó" en "no me deja pushear".
2. **Cobertura design-system:** el §7 ya nombra "forks the design system" — pero en la práctica el lado shadcn/diseño está sub-gateado. Considerar que la paridad de gate (i18n **y** design) sea explícita.
3. **Excepción mockups:** preservada (Marcelo) — los mockups no gatean.

Es coherente con `CANON-GIT-HYGIENE §L3-example` (i18n/hardcoded scans ya reconocidos como L3 hooks); el aporte es **el timing** y **la paridad i18n↔design**.

## Nota de layering
La incarnación (el hook wired) es L3 del consumer. Lo que se pide al kit es el **principio del timing** en el canon del que los consumers heredan. No aplicar desde ViTo (precedente #230→#231: cambios de gobernanza del kit se revierten si se imponen ad-hoc).
