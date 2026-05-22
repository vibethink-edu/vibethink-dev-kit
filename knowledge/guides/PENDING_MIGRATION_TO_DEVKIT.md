# 📦 Pending Migration Queue

> [!WARNING]
> **SPLIT MIGRATION:** We have decoupled the Methodology from the Kit.
> - **Methodology** -> Move `_vibethink_doc` (Staging) to `../_vibethink_doc` (New Repo).
> - **Dev-Kit** -> Move `packages/*` to `../vibethink-dev-kit` (Existing Repo).

## 📚 Documentation (Global Standard)
- [x] **VThink 1.0 Methodology**
  - **Status:** **STAGED** in `/_vibethink_doc`.
  - **Action:** Move the entire folder to the workspace root.

## 🛠️ Dev-Kit (Code Implementation)
- [x] **CLI Tools**
  - **Status:** Ready in `packages/cli`.
  - **Action:** Move to `vibethink-dev-kit/packages/cli`.

- [x] **Shared Config**
  - **Status:** Ready in `packages/eslint-config`.
  - **Action:** Move to `vibethink-dev-kit/packages/eslint-config`.

## 📦 Shared Utilities
- [x] **Shared Utilities**
  - **Status:** Moved `logger`, `themes`, `ROLES`, `cn`.
  - **Action:** Move `packages/utils` to `vibethink-dev-kit/packages/utils`.

## 📂 Kit Documentation
- [ ] **Dev-Kit Docs**
  - **Source:** `docs/Kit`
  - **Action:** Move content to `vibethink-dev-kit/docs` or root `README.md`.
