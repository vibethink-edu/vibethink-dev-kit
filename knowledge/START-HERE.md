# START HERE — how we work (any repo, any agent)

> The 2-minute door. Read this first; it points to the depth — you don't read the
> depth up front. New human or new agent: **start here.**

## In 30 seconds

You're joining a team of humans + AI agents. Work converges through **git**, not
through a person relaying content. You will: pick up work, do it under a shared
**method**, and report back in a shared **shape**. Depth lives behind the links —
pull it on demand, never up front.

## The three things to know

**1 — How we develop: VibeThink Method (VT-Method).**
Six steps: slice → decision gate → specify → execute (governed) → leave the trail →
findings. Governance first (canon precedes code).
→ `knowledge/methodology/VT-METHOD.md`

**2 — How you get & hand off work: the dance.**
Check your inbox at session start **and on demand** (`inbox <you>`); send through the
channel with **`comms:send`** (one governed command: scans for secret values, then
commits + pushes — so the comm actually travels via git, not just sits as a local
file). On a new or second machine, **`comms:sync <you>`** pulls origin + shows your
inbox + warns if this machine has work that hasn't been pushed. The human is **not**
the message bus — git is; the human relays only a one-line signal.
→ `knowledge/ai-agents/CANON-MULTI-AGENT-ORCHESTRATION.md` (§2, §2.1)

**3 — How you talk to the human: the compass.**
Outcome first, plain language first, detail on demand. **Lead with a short, plain
decision layer** — the state and what the human must decide, in a few lines — then put
the depth *after* it (collapsed if your environment supports it, otherwise below a
divider). Don't hand them a flat wall of detail: the gist goes up top, the depth waits
to be pulled. Every message answers: *where I stand · what happened · what's missing.*
**Never close open-ended** — always offer the next step + a recommendation + why.
**When your message implies a handoff to another agent, end with a ready-to-paste
relay block** — a short, self-contained block the human forwards as-is to that
agent's chat, labelled with the **target agent + repo** (the human routes; never
make them translate or copy content).
→ same canon, §5.1 (two layers) / §5.1.A status / §5.1.B router dual-layer

## The few hard rules

- **Governance first.** No code without passing the decision gate; every architecture
  decision is registered as an **ADR** that names the **check that enforces it** (so it
  can't silently drift). → §3.1
- **Only the named authority seals canon.** Sealed = committed + pushed (immutable).
- **Learn before you automate.** Do it by hand until you *understand* it; automate only
  the learned, mechanical part — judgment stays with the human. → §3.1
- **Build on real pain.** Don't add machinery — or canon — ahead of demonstrated need.
- **Use model strengths deliberately.** When the decision gate shows high-judgment
  risk, route a review call to the strongest available reviewer capability (for
  example an Opus/Sonnet-class model) to challenge the frame before implementation.
  The implementer still proves reality in the repo, and the human still owns the
  decision.
- **Per-product specifics** live in that product's own `AGENTS.md`, never here.

## Your first task (prove you've got it)

Take one small, real task and run it end-to-end: **slice it → state the gate →
execute → report back a status message in the compass shape.** If you get lost at any
point, ask: **where am I · what happened · what's missing.**

---

*This is the door. The rooms behind it (the canons) are for depth on demand — you are
the navigator, not the investigator.*
