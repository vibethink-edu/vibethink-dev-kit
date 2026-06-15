# CANON — Multi-Agent Orchestration & Handoff (universal · agent-agnostic)

> **Scope:** every repo where more than one AI agent (and a human) collaborate.
> Vendor-neutral, product-neutral.
> **Status:** SEALED 2026-06-04 by Marcelo (Principal Architect) — Tier C consolidation (fire-test passed: no product, vendor, or agent brand names appear here). **Amendment 2026-06-05 (authorized): §2.3 Handoff completeness (rubric + 4 mechanisms) — first canon authored under the SOTA-informed gate (`CANON-DEVELOPMENT-PROCESS §7`); prior-art recorded in `knowledge/research/ORCHESTRATION-PRIOR-ART-2026-05-25.md`. Seal-confirmed by Marcelo 2026-06-05 ("SEAL DALE").** **Amendment 2026-06-15 (SEALED by Marcelo, Principal Architect): §2.2.1 No-remote local-commit fallback — persistence vs travel + the `COMMITTED-LOCAL` declared exit state with a mandatory developer warning.**
> **Home:** the dev-kit (supra-repo). Inherited by every repo as upstream → fork.
> **Sibling:** `CANON-CROSS-AGENT-CONTEXT-LAYERING.md` (how agents read rules);
> this canon is how agents *hand work between each other and the human*.

## 1. Root principle

> **The human is not the message bus.**

When a human copies output from one agent's window into another's, the human has
become the transport layer between agents. That is the failure mode this canon
removes. The human's value is **judgment and direction**, not relay. Automate the
relay; keep the human for the decisions only a human can make.

## 2. Three classes of transition

Every "what happens next" falls into one of three lanes. Route it by its class.

| Transition | Resolved by | Human role |
|------------|-------------|------------|
| **Machine-verifiable gate** (CI, tests, build, lint, a deploy state) | the **blocked agent watches the source of truth itself** and proceeds when the condition is met | none |
| **Agent → agent handoff** | an **addressed message in the shared channel**; the recipient pulls its inbox at session start **and on demand** (§2.1) | none (it appears in the feed) |
| **Judgment gate** (approval, scope change, conflict between agents, prioritization, "is this worth doing", a blocker only a human can clear) | a **typed escalation signal** routed to the human's single inbox | **decides** |

- Assigning a task to another agent is an **agent → agent handoff**. A local
  `TASK-*` file, roadmap line, or note is only a reference; it is not sent until a
  shared-channel comm exists and is committed/pushed. Use the repo's governed send
  command (`comms:send`, e.g. `node tools/comms-send.mjs ...`) and verify the
  recipient inbox (`node tools/inbox.mjs <agent>`). If the command is unavailable,
  manually create the comm in the shared channel with valid front matter, then
  commit, push, and verify routing. The human must not be the reminder.
- **A comm left in the sender's own feature branch is invisible to the recipient.**
  The shared channel is the lane the recipient actually pulls — not whatever
  worktree/branch you happened to author in. This bites hardest on a **cross-repo
  handoff** (e.g. a vertical → dev-kit elevation): a comm with `to_agent: <other
  repo>` committed only to *your* unmerged branch never reaches that repo's inbox.
  Route it to the **recipient repo's lane** (`comms:send` resolves `repo`/`to_agent`;
  if sending by hand, author the comm **in the recipient repo's worktree** and
  push it there), then verify it appears in the recipient's inbox. The artifact a
  cross-repo handoff *proposes* (a canon, a migration) likewise lands in the
  **recipient repo's** worktree, never only in the sender's.
- **Discovery side — search before declaring absent.** If you are referenced to a
  comm/handoff that is not in your inbox, run `comms:sync` and check the sender's
  worktree/lane before concluding it does not exist; a missing comm is often a
  comm stranded in another worktree, not an absent one.
- A receiving agent must self-orient before acting on any inbox item: compare the
  comm's `repo` / `ref_branch` / `ref_doc` / `ref_pr` / `target_layer` fields
  against its current working directory, branch, and methodology layer. If they
  point elsewhere, switch to the target repo/branch/layer or explicitly report
  that it cannot access them. Do not perform the work in the repo where the inbox
  item happened to be noticed.
- A methodology/governance `task`, `review`, or `audit` must declare
  `target_layer:` (`SUPRA-L1L2`, `product-L3`, or `both`) and `ref_branch:` as
  required front-matter fields, and must include a **Recipient Self-Check** block.
  The recipient audits the declared layer first. Product-specific method bindings
  are real and must not be mistaken for the supra-repo methodology itself.
- "I'll wait for it to go green and tell you when" is wrong. It becomes: *the
  blocked agent watches the gate itself and continues when green* — no relay.
- A fact one agent knows and another needs is **written to the shared channel**
  (a status entry), or both agents check the same source. Never hand-carried.

## 2.1 Pull modes — persistent vs fresh sessions

The handoff row above says "pulls its inbox at session start." That is necessary
but not sufficient: **operators run long-lived sessions, not one session per task.**
A startup pull is a one-time snapshot — it does not keep a running session current,
so messages that land after it began will not surface on their own. The inbox is
therefore pulled two ways:

- **Startup check** — a one-time view when a session begins (where the harness
  supports it). A snapshot, not a live feed.
- **In-session refresh** — an idempotent command a running agent executes **on
  demand** to see what arrived since. This is the **floor, not a fallback**: in a
  long-lived session it is the primary way work is picked up.

A human relaying a one-line "check your inbox" is an acceptable **wake signal** — it
does not make the human the message bus (§1), because the content still travels
through the channel; only the *signal* is relayed. A live poll or push notification
(so a running agent detects new items without the human signal) is **deferred until
the manual signal demonstrably hurts** — coordination machinery is not built
preemptively.

## 2.2 Session closeout — exit states (no fragile WIP)

A session is the inverse of a startup pull (§2.1): you arrive by reading what is
already in the channel; you leave by ensuring no work depends on **this session's
local state alone**. Every active branch / worktree touched during the session
must end in exactly **one intentional, declared state**:

| State | Meaning | Required action |
|-------|---------|-----------------|
| `PUSHED` | Committed and pushed; no uncommitted changes | nothing further this session |
| `READY-PR` | Pushed and a pull request exists (or is being opened) | the PR link travels in the closeout signal |
| `DISCARDED` | The branch / worktree is intentionally abandoned; nothing of value is lost | the branch is removed or explicitly marked, never silently left |
| `COMMITTED-LOCAL` | Committed but **NOT pushed** — no remote reachable (offline / single machine). **Fallback only** (§2.2.1) | declared **with the developer warning**; push and promote to `PUSHED` when a remote returns |

- **Local-only WIP older than the current session is the failure class.** A
  rescue branch, a long-lived uncommitted change, or a stale stash that only the
  local agent can see breaks the §1 principle (the human is not the message bus)
  and breaks the durability assumption (the machine is not the backup). If work
  matters, it lives in `origin`.
- **No silent ambiguity.** A branch left "in progress" with no declared state is
  treated by anyone else as `DISCARDED` — i.e. *cannot* be relied on. Only the
  agent who left it can later promote it.
- The session-end signal (the relay block §5.1.B, and the §5.1.A status shape)
  **names the closing state of each branch the agent touched**. Closing without
  naming the state is a closure bug — fix it in the same message.
- **Detection, not enforcement.** A non-mutating session-start scan (see the
  adoption runbook) flags any registered worktree with uncommitted or unpushed
  work older than today. It reports; the operator decides what to rescue, push,
  or discard. A stricter automation (daemon, watcher, auto-rescue) is
  **deferred until the manual scan is shown to be insufficient** — build-on-pain
  applies here too (§3.1).

## 2.2.1 Persistence vs travel — and the no-remote local-commit fallback

*(Amendment SEALED 2026-06-15 by the Principal Architect.)*

The exit states above assume a reachable remote: `PUSHED` is the default because a
commit *persists* the work but only a push makes it *travel*. Two transports are
distinct, and conflating them is what makes §2.2 read as "local is always wrong":

- **Persistence = the commit** — the work survives the session, in the repo's
  history. **Always required**; an *uncommitted* change is the real failure class.
- **Travel = the push** — the commit reaches other machines and the durable shared
  backup. Required **whenever the recipient is on another machine, or the remote is
  the record of truth.** When a remote exists, push is the default and §2.2's "if
  work matters, it lives in `origin`" stands unchanged.

**The fallback — no remote reachable (offline · single machine · no forge configured):**
a **local commit is an accepted handoff transport.** Both agents on the same machine
read the handoff from the local history; pushing is simply not available. This is
**legitimate — not the silent-WIP failure §2.2 forbids — on two conditions:**

1. **It is a declared state with a loud warning to the developer.** A fourth exit
   state, **`COMMITTED-LOCAL`** — *committed, NOT pushed, local-only.* The
   session-end signal (§5.1.B) must name it and warn, in plain words:
   **"handoff committed LOCALLY only — not pushed; it will not reach other machines
   and is not backed up off this machine; push as soon as a remote is available."**
   Silent local-only is still the failure class; *declared* local-only **with the
   warning** is the offline fallback. The difference is the warning, nothing else.
2. **It carries a reconciliation obligation.** `COMMITTED-LOCAL` is **temporary**:
   the next session that gains a reachable remote **pushes it and promotes the state
   to `PUSHED`.** The session-start scan (§2.2) already flags unpushed work — here
   that flag is *expected*, not an anomaly, until reconciled.

**The governed send degrades, it does not fail.** A send that finds **no remote**
(or whose push fails for lack of one) **falls back to commit-only and emits the
warning** — it must never drop the handoff, and never report success as if it had
travelled. A *deliberate* offline send is an explicit opt-in (the engine's
no-push path); an *unexpected* missing remote still commits, still warns, and is
surfaced — not swallowed. (The concrete detection and warning wording are L3 / the
engine.)

> **Mnemonic:** *commit always; push when you can; when you can't, say so — loudly,*
> *and reconcile when a remote returns.*

## 2.3 Handoff completeness — a handoff that looks complete but isn't

A **handoff** is the durable context one session/agent leaves for the next — broader
than the six per-task artifacts of §8: it transfers a *whole front's* state, not one
task's. Its failure mode is specific: **a handoff the author reads charitably as
complete, while the receiver finds the holes only mid-execution.** The author cannot
see their own gaps — they hold the missing context in their head, so the condensed
doc *reads* complete to them. (Same family as "approved once ≠ still sound": the
author trusts their own artifact instead of verifying it.)

### The completeness rubric

A complete handoff answers **all** of:

- **mission / why** — the purpose to internalize, not just the task;
- **verified state, with proof** — not "X is done" but the command / PR / artifact that shows it;
- **every thread** — paused fronts, backlog, dependencies — not only the active one;
- **level of detail** — the actual detail, or a link to it; never a condensation that drops the only copy;
- **pending decisions** — what the human authority still owes;
- **disciplines** — the non-negotiables for this work;
- **read-first** — the committed docs to load;
- **lessons** — what went wrong before, so it is not repeated;
- **how to start** — the first concrete steps;
- **the boundary: "what is NOT in here"** — condensation made visible, not silent.

A handoff missing any line is **incomplete** — the gap becomes the next session's lost time.

### Four mechanisms (defense in depth)

1. **Completeness-critic (author, before declaring ready).** An active *"what did I
   leave out?"* pass against the rubric — **not** a reread. A reread sees what is
   present; the critic hunts what is **absent**.
2. **Echo-back (receiver, before executing).** The receiver returns a short
   orientation of its understanding (the compass §5.1, a few lines) **before** acting.
   **A hole in the echo means the handoff was incomplete** — close it before work
   starts, not after. This is closed-loop confirmation (read-back), borrowed from
   high-reliability domains.
3. **Committed + explicit boundary.** The handoff lives **committed** in the channel
   (durable — chat memory compresses under pressure), and it **names what it does not
   contain**, so condensation is a visible decision, never a silent loss.
4. **Fresh-context gap check (high-stakes only).** For a high-stakes handoff, an
   independent advisor in a context that did **not** author it reviews it for gaps
   (the gaps lens of the architecture-review canon). The author cannot grade their
   own completeness.

> The author owns mechanisms 1 and 3; the receiver owns 2; 4 escalates for
> high-stakes. The cheap default is **1 + 2 + 3**; reserve 4 for handoffs whose
> failure is expensive (do not ceremonialize every handoff — the over-engineering
> boundary of the architecture-review canon applies).

## 3. The safety boundary

> **Automate where the condition is verifiable by a machine. Escalate where it
> needs judgment. An agent never auto-decides a judgment gate.**

- Auto-proceeding is safe only for facts a machine can confirm (a check is green,
  a file exists, a count matches). It is never safe for "should we do this".
- If you cannot name the machine check that confirms a condition, it is a
  judgment gate — escalate it, do not assume it.

## 3.1 Learn before you automate

A capability is automated only after the manual practice has **learned** it — not
merely repeated it. Doing the work by hand (a human + an agent in a working session)
is the **learning phase**: it reveals the pattern, what varies, and **where judgment
lives**. Automation then encodes that understanding.

> **It is not adapting a practice — it is learning, so that automation becomes
> possible.** You earn the right to automate by learning.

- **Automating what is not yet learned reproduces a misunderstanding at machine
  speed** — worse than no automation. Don't translate an unlearned practice into a
  worker; learn it first.
- **Repeated pain carries two signals:** "this is worth automating" *and* "this has
  been done enough times to be understood." Until the second is true, keep it manual
  (§3). This is why building only on real pain is safe — the pain is the proof of
  learning.
- **The manual session and the automation are two stages of one model, not two
  systems.** The session learns it; the automation runs the learned,
  machine-verifiable part; judgment still escalates to a human (§2–§3). The
  automation layer **expresses** this protocol — it never forks it, and it never
  becomes a parallel coordination system.

## 4. Visibility & interrupt (non-negotiable)

Removing the human from **transport** must never remove the human from
**visibility** or **control**.

- A **read-only activity feed** keeps the human informed ambiently — the human
  watches the flow, does not carry it. (The low percentage of runs a human
  redirects depends entirely on being able to see the flow.)
- The human retains **stop / redirect authority at all times**. Automation
  handles the boring relay; the human keeps the override.
- Because judgment gates still wait for the human, and the feed surfaces even the
  auto-proceeding lanes, drift remains catchable.

## 5. Signal conventions (machine-readable routing)

Messages in the shared channel carry front-matter a machine can route on — not
just prose a human must read:

| Field | Purpose |
|-------|---------|
| `from` | author agent |
| `to_agent` | **canonical** normalized recipient token (one known agent, or `any`) — what routing depends on |
| `to` | human-readable recipient prose (`<agent-token>-dev`, `<agent-token>-<role>`, `<Agent> (...)`) — a known agent token is extracted from it only as a fallback when `to_agent` is absent |
| `status` | `open` \| `closed` |
| `re` | the message this threads from |
| `priority` | ordering hint |
| `needs` | `human` when a judgment gate is reached, else absent |

- An agent's **inbox** = messages whose normalized recipient is itself (or `any`)
  and `status: open`.
- The **human's inbox** = messages where `needs: human`. The human pulls one
  place instead of being polled across every window.
- `to_agent` is the clean token routing depends on; the prose `to:` (and a
  bold-label `**To**:` body header, which predates the YAML convention) is the
  human label. The router prefers `to_agent` and falls back to extracting a known
  agent token from the prose only when `to_agent` is absent — so legacy messages
  still route while new ones use the canonical field. inbox and feed share **one**
  normalizer so they can never disagree on who a message is for.

## 5.1 Human-actionable shape — the orientation contract

§5 routes messages for *machines*. This section makes the same messages
**actionable for a human** — so a human reading an inbox that mixes projects and
repos can act **without opening the thread, reconstructing context, or asking
"what does this even mean?"**

> **The human is the navigator, not the investigator.**
> A message must orient the human; it must never force the human to dig to
> understand it.

### The compass (every human-facing message answers three questions)

A human who is lost must be able to ask for — and always receive — the same three
orientation answers. This triad is the compass:

| Compass question | Answered by |
|------------------|-------------|
| **Where do I stand?** | `project` · `repo` · current `state` |
| **What has happened?** | a one-line, jargon-free summary (`tldr`) |
| **What is missing / what do I do?** | the `action` + the literal next step |

These three are the floor. A message that cannot answer them is not ready to send
to a human. "Tell me where I'm standing, what happened, and what's missing" is a
request any agent must be able to satisfy on demand, for any piece of work.

### Two layers (plain first, complete on demand)

Every human-facing message carries **two layers**:

1. **Plain layer (always visible)** — the compass answers + the one action, in
   non-technical language. Short. No vendor, tool, or implementation jargon. This
   is what a tired human reads at a glance to decide.
2. **Complete layer (on demand)** — everything: references (PR/branch/doc),
   technical detail, links. Folded or linked, never forced. The human opens it
   only if they choose to.

The plain layer is the contract; the complete layer is the backup. **Never invert
them** — do not lead with technical detail and bury the decision.

### The card (plain-layer shape)

```
🧭 WHERE     <project> · <repo>   ·   state: <waiting-you | blocked | fyi | done>
📋 HAPPENED  <one line, no jargon — what this is>
🎯 DO        choose: A (recommended) / B / C   →   <literal next step, paste-able>
⚖️ HEADS-UP  if you choose wrong: <reversible | irreversible>  ·  if you don't reply: <what happens>
📄 FULL      <link / fold to the complete layer>   (cost · confidence · thread live here)
```

### Decision aids (when the message is a decision gate)

A decision gate is neither a bare command nor a neutral menu. When a human must
choose, the plain layer carries three aids so the human decides **fast and safe**:

1. **Options + a recommendation with its reason.** Present the real choices, say
   which one you recommend, and why — in one line. Never a bare imperative; never
   options laid out neutrally with no recommendation. The author already did the
   thinking; surface it.
2. **Consequence of silence.** State what happens if the human does not respond —
   auto-proceeds, blocks, or expires (and when). Silence is a valid input only when
   its effect is known.
3. **Reversibility.** Say whether a wrong choice can be undone. Reversible → the
   human can decide quickly; irreversible → the human is told to slow down. This is
   the safety boundary (§3) made visible to the decider.

Keep these **folded into the existing lines — plug, do not stack.** The card must
stay glanceable; the moment it becomes a form, the human is an investigator again.
Secondary context (effort/cost, the agent's confidence + evidence, the prior thread
this continues) lives in the **complete layer**, never on the plain card.

### Backing fields (machine layer — extends §5, additive & backward-compatible)

The card is rendered from front-matter fields. New fields are **additive**: a
parser that does not know them ignores them, so v1 messages keep working.

| Field | Feeds | Notes |
|-------|-------|-------|
| `project` | WHERE | human project name; **auto-resolved** from the repo's inbox config, not typed per message |
| `repo` | WHERE | git repo to act in; auto-resolved from config |
| `action` | DO | one of `decide` \| `review` \| `implement` \| `handoff` \| `fyi` |
| `tldr` | HAPPENED | one jargon-free line |
| `reversible` | HEADS-UP | `yes` \| `no` — whether a wrong choice can be undone |
| `on_no_reply` | HEADS-UP | what happens if the human stays silent (proceeds / blocks / expires + when) |
| `target_layer` | WHERE | required for governance `task` / `review` / `audit`: `SUPRA-L1L2`, `product-L3`, or `both` |
| `ref_pr` / `ref_branch` / `ref_doc` / `ref_spec` | FULL | **flat keys** — `ref_branch` is required for governance `task` / `review` / `audit`; nested maps are not supported |
| `protocol` | — | schema version marker (e.g. `cross-agent-comm/v2`) |

`project` and `repo` are **per-repo data supplied by the consuming repo's config —
never product vocabulary baked into this neutral core.**

### Comm authoring rules (machine-parseable — Schema v2)

Real failure modes that make a comm silently invisible (2026-05-24 field report):

- **Front-matter is the first line.** A leading HTML comment or blank line before the
  `---` block breaks the parser → the comm appears in no inbox.
- **Address the base agent token** (`codex`, not `codex-rev`). A role suffix written
  verbatim to `to_agent` is invisible to the base inbox the operator queries; the role
  is metadata (see Routing of roles, below).
- **Fields are flat** (`ref_pr`, not a nested `ref:` map) — the front-matter parser
  is flat (Backing fields, above).
- **Self-describing across repos:** carry `project` / `repo` / `ref_*` / `tldr` so a
  human skimming a mixed inbox, or a fresh agent, can orient without opening the file.
- **Governance task self-check:** every governance `task`, `review`, or `audit`
  carries `target_layer`, `ref_branch`, and a body section titled
  `Recipient Self-Check` that names the repo, branch, layer, and primary paths to
  verify before acting.

### Routing of roles

A role suffix (`-arq`, `-dev`, `-rev`) is a **hint about which hat to wear, not a
separate inbox.** Routing normalizes a role-suffixed recipient token to its base
agent token (`codex-rev` → `codex`) so a role-addressed message still reaches the
agent's base inbox; the role travels as displayed metadata. An agent picks up its
inbox regardless of the hat it is asked to wear.

### Implementation note (contract vs engine)

This section is the **contract**. Authoring the fields (the consuming repo's send
tool fills `project`/`repo` from its config) is the zero-risk first step and needs
no engine change. Rendering the card in the inbox/feed listing, and normalizing
role suffixes, are engine changes — made **test-first** in this kit, then inherited
verbatim by every repo (§8). No repo forks the engine.

## 5.1.A Agent→human status-message contract (enforceable profile of §5.1)

This is the **chat** profile of §5.1 (§2.1: operators read in long-lived chats), with
teeth. A status message is read by a human who may hold **zero prior context**; one
read must answer *what happened, what it RESULTED IN, and what to do next.*

> **Outcome before activity.** "I did X" without the outcome of X is non-compliant.
> An analysis reports its verdict; code reports what now works or changed.

It uses §5.1's two layers (plain first, complete on demand). Required order:

1. **Lede (1 line)** — what happened + what you need from the human.
2. **Result / verdict** — the *outcome*, not "done" (the conclusion: verdict, score,
   pass/fail; or what now works/changed). This is §5.1's `HAPPENED`, sharpened to the
   outcome.
3. **Where** — PR / branch / files / artifact (§5.1 `WHERE`).
4. **What's next + the ask** — the explicit next action and the decision needed
   (GO / review / merge / ping X), or "no action needed" (§5.1 `DO` + decision aids).
5. **Detail** — everything else, below the fold (§5.1 `FULL`).

**MUST / MUST NOT (testable):**
- MUST lead with outcome, not activity.
- MUST state the verdict/result of any analysis or evaluation delivered.
- MUST end the top block with an explicit ask or "no action needed".
- MUST NOT assume prior context — name the thing ("the same one as before" = fail).
- MUST be two-layer (plain first, depth on demand) — never a flat dump.
- SHOULD keep the lede ≤2 lines; the top block scannable in <10 seconds.

**Failure modes (a `*-rev` agent MAY reject and ask for a re-issue):** activity-only
with the result missing · buried lede / no ask · context-assuming references ·
wall-of-bullets with no outcome and no next step.

**Self-check (run before sending):** (1) first line = outcome + what I need ·
(2) verdict/result explicit, not "done" · (3) next action + ask present (or "none") ·
(4) a zero-context reader understands it · (5) plain-first, detail-below.

**Enforcement:** referenced from the agent bootstrap so every agent loads it (not
per-agent taste). A lightweight status-message lint is **deferred until the manual
review burden is real** (build-on-pain).

## 5.1.B Agent→router message (dual layer)

When the human acts as a **router** between agents (the operator model, §2.1), the
agent's message MUST carry **two layers**:

- **(A) Human layer** — plain context the human reads to *decide*: what happened,
  what's missing, recommendation + why. This is §5.1's shape.
- **(B) Agent layer** — a **paste-able block, ready to forward as-is** to the other
  agent, with no translation or re-typing by the human.

Rules:
- Block (B) is **self-contained** — the receiving agent understands it without extra
  context — and uses the **base agent token** for routing (see Routing of roles).
- If a handoff is pending and (B) is missing, the message is **incomplete**.
- The human **decides and forwards**; the human never *translates* content (that would
  make the human the message bus, §1). The router relays the block; the channel
  carries the content.

*(Validated live, 2026-05-24: an operator described the dual-layer message as
making the router role low-friction — "me encanta cómo está cambiando".)*

## 6. Red-gate discipline

A red machine gate is **read, not assumed**, before any decision:

- Read the **specific failure line**, not the summary wrapper.
- Do not declare a failure "pre-existing" without confirming it against the
  baseline (it existed before this change and this change does not touch it).
- **Infrastructure flakes** (timeouts, cancellations, runner/billing noise) are
  re-run, not merged-around. A symptom message is not a diagnosis.
- Escalate to the human only a **real blocker that needs judgment** — never an
  unread red, and never a flake.

## 7. Review-call discipline

When work is handed to a second architect (an **advisor**) before it is sealed, the
advisor validates **what the author can prove, not what the author asserts** —
against real data, with negative cases, distinguishing *"passes today"* from
*"correct by design"*. The advisor returns **GO** (with the evidence it actually
ran) or **BLOCKED** (with the specific failing control + file/line) — never an
unread green.

The living, operational checklist of concrete controls (reality over fixtures,
recall *and* precision, gates that bite, boundaries grepped not asserted, enforcement
not authorship, honest close, …) lives in `REVIEW-CALL-CHECKLIST.md` and grows as new
failure modes are found. This principle stays stable.

## 8. Message types — the six artifacts the dance produces

A multi-agent dance produces six recurring artifact types. Each has a clear sender, purpose, and required sections.

| Type | Sender | Purpose | Required sections |
|------|--------|---------|--------------------|
| `briefing` | Architect role | Implementation spec for executor | Objective, branch + base, constraints, file list, verification checklist (V-01..V-xx), worktree if isolated |
| `delivery` | Executor role | Implementation report | Current branch, files touched, V-xx results, notes/blockers |
| `verification` | Architect role | Post-review checks | Merge target, PR number, checks to run, expected results |
| `response` | Any role | Answer to a question or verification | Reference to the original question, answers |
| `question` | Executor (pre-impl) | BLOCKER, SUGGESTION, or OBJECTION **before implementing** | Severity tag (`[BLOCKER]` / `[SUGGESTION]` / `[OBJECTION]`), specific question, proposed resolution if applicable |
| `correction` | Architect role | Fix required after review | What failed, what to fix, updated V-xx |

These types are universal at the **protocol level**. The consuming repo's L3 binding decides the file-naming convention that carries them (sprint letters, ticket numbers, free-form, equivalent).

---

## 9. Workflow pattern — Architect ↔ Executor dance

The dance for any non-trivial implementation task:

```
ARCHITECT                                EXECUTOR
    |                                        |
    +--- briefing -------------------------->|
    |                                        |  ← Phase 0: full pre-read
    |                                        |    If BLOCKER / SUGGESTION found:
    |<-- question [BLOCKER/SUGGESTION] ------+    sends question, STOPS, waits
    |                                        |
    +--- response --------------------------->|  ← Architect resolves (max 1 round)
    |                                        |
    |    (executor implements)               |  ← Phase 1: implementation
    |                                        |
    |<------------------- delivery ----------+
    |                                        |
    |    (architect reviews)                 |
    +--- correction (if needed) ------------>|  ← repeat until PASS
    |                                        |
    |<------------------- delivery ----------+
    |                                        |
    |    (architect commits/pushes/PRs)      |
    +--- verification ---------------------->|  ← post-merge closure + feedback
    |                                        |
    |<------------------- response ----------+  ← executor feedback closes the thread
    +----------------------------------------+
```

### 9.1 Pre-read (Phase 0, mandatory for the executor)

Before writing any code, the executor reads the full briefing and verifies it has execution rights for this front. If the briefing has a:

- **BLOCKER** (missing info, contradictions, missing dependency, security/data-integrity concern) → file a `question` tagged `[BLOCKER]` and **stop**.
- **SUGGESTION** (better approach, optimization, non-blocking concern) → file `[SUGGESTION]` with a proposed resolution and **wait** for response.
- **OBJECTION** (a current rule does not fit the case) → file `[OBJECTION]` rather than silently violating it.

### 9.2 Anti-loop rule — one question round per thread

The executor gets **one round** of questions per thread. After the architect responds, the executor implements based on that response. **No second question round** — any remaining concerns go in the delivery file, not as new questions.

This rule exists because question loops compound: each round invites the next, and the front never gets done. One round is enough to resolve genuine blockers; more is design churn.

### 9.3 Correction loop (post-review)

If the delivery does not pass review, the architect sends a `correction` with what failed and what to fix. The executor sends a new `delivery`. Repeat until PASS. There is **no question round inside the correction loop** — only `correction` ↔ `delivery`.

### 9.4 Post-merge closure

After merge, the architect sends a `verification` containing: independent V-xx results, defects found and how they were fixed, merge confirmation, and a feedback request. The executor sends a `response` with feedback on briefing clarity, checklist appropriateness, and correction fairness. **This closes the thread** and forms a learning loop for future briefings.

---

## 10. Universal collaboration rules

These rules apply to every agent in every dance — independent of tooling.

### 10.1 For all agents

1. **Read the full thread before responding.** Check every artifact bound to the same thread.
2. **Never edit another agent's file.** Write your own response file.
3. **Every message header declares identity** — sender (platform), acting-as (task), execution rights, branch, worktree if isolated. The consuming repo's L3 binding names the full required header.
4. **Reference canon documents by their canonical name**, never by transient comm file paths.
5. **Opinion is not decision.** Discussion comments, including those from the human authority, are treated as opinion until an explicit final decision is recorded (§11).
6. **Silence is not approval.** No agent may treat lack of response as permission to cross a pending boundary.
7. **Decision authority is deterministic.** It may not be reassigned for convenience, load balancing, or impatience. Only the named decider may reassign it.
8. **Constitutional compliance is mandatory during disagreement.** Agents may object, request review, or propose amendment; they may not stop complying with the current rule while review is pending.
9. **Agents solve what is already solved.** If an issue fits an existing rule, pattern, or clearly delegated local authority, resolve it without escalating.
10. **Escalations carry a recommendation.** When a case must reach the human authority, bring the current rule context, the gap or contradiction, the recommended option, and the concrete decision requested.
11. **The human is for unresolved definition, not routine execution.** Escalate for architectural knots, authority conflicts, canon contradictions, new front openings, or gaps the room cannot close within existing rules.
12. **Do not escalate low-level execution noise.** Copy, translation, layout adjustments, and pattern-consistent wiring resolve inside the workstream unless they create a constitutional, architectural, or authority conflict.
13. **When sources disagree** (canon/spec vs real git state vs operational status doc vs informal notes), resolve by precedence: **canon/spec > real git state > operational status doc > informal notes**. Update stale artifacts after reality is verified.

### 10.2 For the architect role

14. **Before opening a new front, run the consuming repo's preflight** (audit of stale threads, decision-gate questions, isolated worktree creation, methodology verification). The consuming repo's L3 binding names these commands.
15. **Every briefing declares its full context** — objective, branch, base branch, constraints, file list, verification checklist (V-01..V-xx), worktree if isolated.
16. **When a `BLOCKER` arrives, respond before anything else.** The executor is stopped and waiting.
17. **Review every delivery before commit.** The architect owns the commit.
18. **Attribute co-authorship** in the commit message for every agent that contributed.
19. **Send the post-merge verification** after merge — with independent V-xx results and a feedback request — to close the thread and create the learning loop (§9.4).

### 10.3 For the executor role

20. **Verify worktree isolation as the first step.** The consuming repo's L3 binding names the isolation rules.
21. **Read the full briefing before writing a single line of code.**
22. **If you do not have execution rights for this front, observe but do not implement.**
23. **Resolve known classes of issues without escalation.** Local, reversible, pattern-consistent issues fix in-place and get reported in the delivery, not as escalations.
24. **When escalation is required, bring a proposed resolution.** Summarize what you checked, why existing rules were insufficient, which option you recommend, and what exact decision is needed.

---

## 11. Decision status markers

To prevent accidental authority leakage, every decision-bearing message declares a status marker:

| Marker | Meaning |
|--------|---------|
| **`OPINION`** | Discussion, not authorization. Does **not** authorize crossing a pending boundary. |
| **`FINAL_DECISION`** | Closes the uncertainty for that case. |
| **`PENDING_REVIEW`** | Discussion may continue, but the current constitutional rule remains in force. |
| **`COUNCIL_DECISION`** | Used only after a council/tribunal concludes **and** the human authority adopts the outcome. |

**Default if absent: `OPINION`.** Agents do **not** infer `FINAL_DECISION` from context.

These markers complement §10.1 rule 5 (*"opinion is not decision"*) by giving every message an explicit status.

---

## 12. Inheritance

This kit is the **upstream** of governance. Each repo is a **fork** that inherits
this protocol. Routing tokens, channel location, inbox/feed tooling, and the set
of known agents are declared per repo; the principles here never change. Anything
specific to a product, a vendor, or a methodology stays in that repo's own layer —
it never flows into this neutral core.

The step-by-step procedure for a repo to **adopt / validate / activate** this
governance lives in the kit's `setup/ADOPT-CROSS-AGENT-GOVERNANCE.md`.
