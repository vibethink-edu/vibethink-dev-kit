# 🚀 New Project Bootstrap Protocol

**Status:** ✅ VibeThink Standard
**Trigger:** Start of ANY new project or repository.
**Goal:** Ensure "VibeThink DNA" compliance from Minute 0.

---

## 1. Identity & DNA (The "Who")
Before writing code, define what this is.

- [ ] **Create `.env`**: Copy from `ENV_VAR_STANDARD.md`.
- [ ] **Define Archetype**: Set `STACK_TYPE` and `STACK_AI_*` from `ARCHETYPE_STANDARD.md`.
- [ ] **Define PM Strategy**: Set `STACK_PM_STRATEGY` (Github vs Linear).

## 2. Structure (The "Where")
Don't clutter the root.

- [ ] **Apply Clean Root**: Create `.agents/` directory.
- [ ] **Manifest**: Create `.agents/MANIFEST.md` using `MANIFEST_TEMPLATE.md`.
- [ ] **Ignore**: Setup `.gitignore` and `.antigravityignore` to exclude `private/`.

## 3. Specialized Capabilities (The "Skills")
Check if your project needs these specific "Superpowers":

### 🎙️ If using Voice/AI:
- [ ] **Read:** `VOICE_PROMPT_STANDARD.md` (Language Lock is mandatory).
- [ ] **Read:** `RETELL_CONFIG_STANDARD.md` (Use Baseline configs).

### 🧶 If using n8n/Automation:
- [ ] **Read:** `N8N_SCALING_STANDARD.md` (Trace IDs are mandatory).
- [ ] **Read:** `SECURITY_CREDENTIALS_STANDARD.md` (No API Keys in code).

### 🤝 If using Human Collab:
- [ ] **Setup:** `.github/ISSUE_TEMPLATE/agent_task.yml` (`AGENTIC_WORKFLOW_STANDARD.md`).

## 4. Documentation (The "Brain")
- [ ] **Input Analysis**: Use `DATA_ANALYSIS_TEMPLATE.md` for client specs.
- [ ] **Research**: Use `RESEARCH_LOG_TEMPLATE.md` for hard decisions.

---

> **Agent Instruction:** If you are starting a project, **DO NOT PROCEED** until this checklist is verified.
