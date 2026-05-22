# OpenSpec Integration Standards

**Status:** Harvested from `VozFood-Agent`
**Category:** Architecture / Methodology

## 1. The OpenSpec Philosophy
OpenSpec is the "VThink Way" of defining AI Agent behavior before writing code. It separates **Intent** (Proposal) from **Execution** (Tasks).

### Directory Structure
```
project-root/
├── openspec/
│   ├── proposal.md    (The "Contract")
│   ├── tasks.md       (The "Plan")
│   └── changes/       (Architecture Decision Records)
```

## 2. `proposal.md` Structure
This file must clearly define the architecture.

```markdown
# [Project Name] Proposal

## 1. Architecture
- **Trigger**: Webhook / Schedule
- **Process**: N8n Workflow / TypeScript
- **Output**: Database / API Response

## 2. Data Models (Schema)
Define JSON/SQL schemas strictly here.

## 3. Integration Points
- **Inbound**: list webhooks
- **Outbound**: list external APIs
```

## 3. `tasks.md` Structure
This file tracks progress. It MUST be updated by the Agent.

```markdown
# Implementation Tasks

- [ ] **Phase 1: Setup** <!-- id: 1 -->
- [ ] **Phase 2: Core Logic** <!-- id: 2 -->
```

## 4. Why use this?
*   **Context Preservation**: AI Agents read `openspec/` to understand the *entire* system without reading 100 code files.
*   **Human-in-the-Loop**: Humans approve `proposal.md` before code generation.
