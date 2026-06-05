# Orchestration prior-art — our spine vs the field (RESEARCH)

**Status:** RESEARCH / intelligence — *informs, does not decide* (per the research tier:
research never becomes canon directly; it's evaluated, then an ADR/canon may follow).
**Date:** 2026-05-25
**Why it exists:** Marcelo asked "are we ahead, or reinventing what's already built?" and
then: *"no me dejes luchar haciendo algo que ya está hecho."* This is the shield: an
**ADOPT / ALIGN / KEEP** verdict per component so we never re-build a solved problem.
**Note:** this is a *research* doc looked up on demand — not a context file loaded every
session — so it does not add to the per-session context-bloat the Gloaguen-2026 finding
warns about (below).

## Verdict (honest, no hype)

**We are mostly re-deriving things that are already built.** The multi-agent
coordination field matured in 2026. Almost every piece of our spine has an existing
standard. **The only piece that is genuinely ours is the thin human-reading UX layer
(the compass / status-message contracts).** Everything else: align or adopt.

## The map — what's already built, and the verdict

| Our piece | Already built by | Verdict |
|-----------|------------------|---------|
| **The dance** (git as bus; agents read/write files in a repo; no server; human + AI first-class) | **GNAP — Git-Native Agent Protocol** (RFC draft): a `.gnap/` dir with `version`, `agents.json` (id/role/`type: ai\|human`/status), `tasks/`, `runs/`, `messages/`; workflow = pull → read tasks/messages → work → commit → push; git log = audit | 🛑 **ALIGN, don't grow our own.** GNAP *is* our danza, formalized — incl. humans as first-class. Evaluate aligning our `inbox.config.json`/comms-lane file structure + naming to GNAP (it's an RFC draft → align/contribute, not blindly switch). |
| **Cross-agent comms over the wire** (future, if networked) | **A2A v1.0** (Linux Foundation, 150+ orgs, Google/MS/AWS): Agent Cards (capability advertisement), Tasks, transport HTTP/SSE/JSON-RPC | 🛑 **ADOPT if we ever go networked.** Don't invent a wire format. Our git-async model = GNAP; A2A is the wire standard for server-to-server agents. |
| **AGENTS.md + L1/L2/L3 layering** | **AGENTS.md** open community standard (+ MCP for data, A2A for comms) | 🟡 **Already on it — stay interoperable.** Don't grow a private dialect; keep our files valid AGENTS.md. |
| **VT-Method / canon-first / "constitution"** | **Spec-Driven Development** (SpecKit, "project constitution", supervision checkpoints) | 🟡 **Mostly done — we already use SpecKit.** Our flavor is fine; don't re-derive SDD theory. |
| Decision gate / judgment escalation | **Human-in-the-loop approval gates** (mainstream; LangGraph HITL checkpoints; the 5 patterns: sequential/parallel/hierarchical/handoff/loop) | 🛑 Established — adopt the pattern names. |
| ADR + fitness functions (decision→enforcement) | Nygard (ADR) / Neal Ford (fitness functions) | 🛑 Decades old — use as-is. |
| **The compass / status-message contracts** (§5.1, §5.1.A, §5.1.B — how a *human* reads agent output) | — (protocols cover machine↔machine, not human-reading UX) | 🟢 **KEEP — this is genuinely ours.** The one slice worth our effort. |
| **Handoff completeness** (a handoff that looks complete but isn't — §2.3) | **Closed-loop / read-back confirmation** (high-reliability comms: aviation, medicine) · **critic/verifier agent** (agentic-workflow pattern: a pass that hunts what's *missing*) · **"trust then verify" / the builder doesn't grade** (fresh-eval verification, Anthropic Claude Code best-practices) · **Definition of Done** checklists | 🛑 **ADOPT the patterns.** echo-back = read-back · completeness-critic = critic agent · fresh-context check = builder-doesn't-grade. **Ours** = applying them to the *handoff artifact* + the completeness rubric. Sealed into `CANON-MULTI-AGENT-ORCHESTRATION §2.3` (2026-06-05). |

## The key evidence (backs "lean", not "more")

**Gloaguen et al. 2026** (138 real repos): LLM-generated context files **reduce agent task
success** and **raise inference cost >20%**; manual AGENTS.md files **go stale**. → More
canon/context is not better; it can be worse. Empirical backing for build-on-pain and the
anti-rooms discipline.

## The principle (the shield, reusable)

> **Prior-art check before building coordination/methodology.** Before building any
> orchestration, comms, or methodology piece, check the standards first — **GNAP, A2A,
> AGENTS.md, MCP, SDD/SpecKit**. If it exists: align or adopt. Build *only* the
> genuinely-missing connective tissue. (This is Rule-#28's "verify before declaring a
> blocker", applied to ideas: verify it's not already built before building it.)

## Recommendation (not yet decided — pending GO)

1. **Evaluate aligning the danza to GNAP** (file structure + naming + the `agents.json`
   shape). Biggest anti-reinvention win. → would become an ADR if GO.
2. **Keep the compass/status contracts** — they're ours; protocols don't cover them.
3. **Don't re-derive** SDD, AGENTS.md, HITL, ADR/fitness — adopt by name, stay interoperable.
4. **A2A** only matters if/when we go networked (server agents) — park until then.

## §7-provenance — handoff completeness (2026-06-05)

This row satisfies the **SOTA-informed seal gate** (`CANON-DEVELOPMENT-PROCESS §7.2`)
for the `CANON-MULTI-AGENT-ORCHESTRATION §2.3` amendment — the **first** method canon
authored under §7. Prior-art checked (≥2 independent leading sources), pattern
extracted not depended-on, sources registered here for the §7.3 watchlist sweep:

- **Closed-loop / read-back** (high-reliability domains) → the **echo-back** mechanism (receiver confirms understanding before acting).
- **Critic/verifier agent** (agentic-workflow pattern — a pass that asks "what's missing?") → the **completeness-critic** mechanism (author, before declaring ready).
- **Builder-doesn't-grade / fresh-eval** (Anthropic Claude Code best-practices) → the **fresh-context gap check** for high-stakes handoffs.
- **Definition of Done** (engineering practice) → the **completeness rubric**.

Extraction, not dependency: the patterns are reimplemented in our own terms against
our *handoff artifact* — no external tool adopted.

## Sources

- GNAP (Git-Native Agent Protocol), RFC draft — https://github.com/farol-team/gnap
- A2A Protocol v1.0 (Linux Foundation) — https://a2a-protocol.org/latest/ · https://github.com/a2aproject/A2A
- AGENTS.md spec + Gloaguen 2026 finding — https://asdlc.io/practices/agents-md-spec/
- Spec-Driven Development — https://www.augmentcode.com/guides/what-is-spec-driven-development
- Multi-agent orchestration patterns 2026 — https://www.codebridge.tech/articles/mastering-multi-agent-orchestration-coordination-is-the-new-scale-frontier
- Human-in-the-loop 2026 — https://www.strata.io/blog/agentic-identity/practicing-the-human-in-the-loop/
