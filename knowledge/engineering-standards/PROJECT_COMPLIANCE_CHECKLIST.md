# ✅ VibeThink Project Compliance Checklist

Use this checklist to audit any project for compliance with VibeThink Engineering Standards.

## 1. 🧬 DNA & Identity (.env)
- [ ] **Exists:** `.env.example` (NEVER `.env` in repo).
- [ ] **Stack Type:** `STACK_TYPE` is defined (e.g., `next-payload`, `n8n-agent-backend`).
- [ ] **Orchestration:** `STACK_ORCHESTRATION_MODE` is defined (`standalone`, `candidate`, `integrated`).
- [ ] **Methodology:** `STACK_DOCS_METHODOLOGY` captures the process (e.g., `openspec`).
- [ ] **Origin:** `GITHUB_REPO_URL` is present.

## 2. 🧹 Clean Root Protocol
- [ ] **Root is minimal:** Contains only config files (`package.json`, `.gitignore`, `docker-compose.yml`) and `README.md`.
- [ ] **No Source Code in Root:** Code is in `src/`, `app/`, or `n8n/`.
- [ ] **No Docs in Root:** Documentation is in `docs/` or `.agents/`.
- [ ] **No Secrets:** No `.pem`, `.key`, or filled `.env` files committed.

## 3. 🧠 Agent Integration
- [ ] **Manifest:** `.agents/MANIFEST.md` exists as the entry point.
- [ ] **Context:** `.agents/context/` contains requirements/analysis.
- [ ] **Private Vault:** `.agents/private/` exists and is in `.gitignore` (for secrets staging).

## 4. 📚 Documentation Structure
- [ ] **Clean Docs:** `docs/` is organized (not flat), e.g., `specs/`, `architecture/`.
- [ ] **API Reference:** If API exists, `docs/api-ref/` or `openapi/` is present.
- [ ] **Evidence:** `docs/validations/` contains audit reports (if applicable).

## 5. 🚀 Deployment Readiness
- [ ] **Metadata:** `DEPLOY_PLATFORM_WEB` (or API) is defined in `.env`.
- [ ] **Ports:** `PORT_WEB` / `PORT_API` are strict integers (Zero-Conflict).
