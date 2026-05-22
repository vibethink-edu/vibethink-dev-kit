# 🛰️ Orchestrator Candidate Protocol (Satellite Incubation)

**Status:** ✅ VibeThink Standard
**Context:** Independent Agents aiming for Federation.
**Goal:** Prepare a "Satellite" agent to be integrated into the "Motherbase" (Orchestrator).

---

## 1. The Core Concept
Agents often start as independent experiments (`standalone`) but aim to join the central platform (`integrated`).
The **"Candidate"** mode is the bridge.

| Mode | Description | Auth Strategy | Secrets Location |
|------|-------------|---------------|------------------|
| `standalone` | Independent Tool | Local / Basic | `.env` |
| `candidate` | **Simulation Mode** | Local Mocks | `.agents/private/` |
| `integrated` | Part of Motherbase | Orchestrator SSO | Orchestrator Vault |

---

## 2. The "Private Folder" Strategy 🕵️‍♂️
While in `candidate` mode, you don't have access to the Orchestrator's real database or secrets.
**Protocol:**
1.  Create `.agents/private/`.
2.  **GITIGNORE IT.** (Crucial).
3.  Store "Shadow Secrets" here:
    *   `CREDENTIALS_PRODUCTION.md` (Real keys for testing).
    *   `USER_SCHEMA_DUMP.sql` (Mock of the User table).
4.  **Why?** When you migrate, you just delete this folder and switch ENV vars to the real Orchestrator.

---

## 3. Compliance Checklist (The "Entry Exam")
To be accepted into the Orchestrator, the Satellite MUST:

### 🔒 Security
- [ ] **No Secrets in Code:** Scanned with Gitleaks?
- [ ] **RLS Ready:** Do your Supabase tables rely on `auth.uid()`?
- [ ] **Separation:** Is `src/` free of dev-scripts? (Move to `dev-tools/`).

### 🧬 DNA
- [ ] **Identity:** `STACK_ORCHESTRATION_MODE=candidate` in .env.
- [ ] **Traceability:** Does your Agent send `trace_id` in headers?

---

## 4. Migration Path
When the call comes ("Welcome to the Team"):
1.  **Change Mode:** `STACK_ORCHESTRATION_MODE=integrated`.
2.  **Point Auth:** Switch `NEXT_PUBLIC_SUPABASE_URL` to Orchestrator's URL.
3.  **Delete Private:** Remove `.agents/private/`.
4.  **Deploy:** Push to the Monorepo.
