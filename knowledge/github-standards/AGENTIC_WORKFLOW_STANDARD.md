# 🤖 Agentic Workflow Standard (The "Linear-on-GitHub" Protocol)

**Status:** ✅ VibeThink Standard
**Inspiration:** Linear Method / Cole Medin / Ray Fernando
**Goal:** Enable strict collaboration between Humans and AI Agents using GitHub as the message bus.

---

## 1. The Core Philosophy
AI Agents struggle with ambiguity. "Fix the button" is bad.
Agents thrive on **Context, Constraints, and Criteria**.

We emulate the **Linear Issue Structure** inside GitHub to give Agents what they need.

---

## 2. Issue Structure (The "Prompt")
Every Issue is a Prompt. We use **GitHub Issue Forms (`.yml`)** to enforce this.

### Standard Fields:
1.  **Context (The "Why"):** What user problem are we solving?
2.  **Technical Specs (The "How"):** pointing to specific files/functions.
3.  **Acceptance Criteria (The "Test"):** "I know this is done when..."
4.  **Skills Required:** `frontend`, `backend`, `research`.

---

## 3. The Lifecycle (State Machine)
We enforce strict states to prevent "Zombie Issues".

1.  **Triage:** New ideas. Agent Action: **Categorize**.
2.  **Backlog:** Approved but not active.
3.  **To Do (Ready):** Fully specified. Agent Action: **Pick Up**.
4.  **In Progress:** Agent is coding. Label: `agent:active`.
5.  **Review:** PR created. Agent Action: **Self-Critique**.
6.  **Done:** Merged & Verified.

---

## 4. Signal Labels (Communication)
Use labels to "talk" to the Agent without comments.

*   `@agent:research`: "Go analyze this first, don't code."
*   `@agent:optimize`: "Refactor this, don't change logic."
*   `@status:blocked-on-human`: "I need a decision."
*   `@priority:urgent`: "Drop everything."

---

## 5. Implementation Guide
1.  **Delete** old markdown templates (`.github/ISSUE_TEMPLATE/*.md`).
2.  **Install** YAML forms (`.github/ISSUE_TEMPLATE/task.yml`).
3.  **Configure** GitHub Projects (Title: "Agent Board").

> **Why GitHub?** It keeps code and tasks in the same place. Transitioning to Linear later is easy because the *structure* is compatible.
