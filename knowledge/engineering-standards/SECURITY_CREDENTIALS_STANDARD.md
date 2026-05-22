# 🔐 Credential Management Standard (Security Vault)

**Status:** ✅ VibeThink Standard
**Purpose:** Prevent secret leakage while maintaining developer accessibility.

---

## 1. The "Zero-Commit" Rule
**NEVER** commit API Keys, Passwords, or Secrets to Git.
*   ❌ `Check this API Key: sk-123...` (In Code)
*   ❌ `config/secrets.json` (Committed)
*   ✅ `.env` (Ignored)

---

## 2. Directory Structure: The "Private Vault"
Every project must have a dedicated, git-ignored directory for sensitive documentation (like client credentials that cannot go into .env).

**Locations:**
*   `.agents/private/` (Recommended)
*   `private/` (Legacy)

**Standard `.gitignore`:**
```gitignore
# Security
.env*
!.env.example
private/
.agents/private/
*.pem
*.key
```

---

## 3. Credential Files (The Vault Content)
Inside `.agents/private/`, use standardized markdown files:
*   `CREDENTIALS_PROD.md` (Production Secrets)
*   `CREDENTIALS_DEV.md` (Dev/Sandbox Secrets)

**Format:**
```markdown
# 🔒 PRODUCTION CREDENTIALS
> WARNING: DO NOT COMMIT.

## 1. Database
*   **Host:** `aws-prod-db...`
*   **Password:** `Ask Team Lead or Check Vault 1Password`

## 2. API Keys
*   **Google:** `AIzaSy...`
```

---

## 4. Environment Variables (`.env`)
The operative secrets must live in `.env`.
*   `.env` = Local Development (Private)
*   `.env.example` = Template (Public, safe values only)
*   `.env.production` = Production (Private, usually injected via CI/CD)

## 5. Secret Rotation
If a secret is committed by mistake:
1.  **Revoke** the secret immediately.
2.  **Rotate** (Generate new secret).
3.  **Purge** the commit history (using BFG Repo-Cleaner or git filter-branch).
