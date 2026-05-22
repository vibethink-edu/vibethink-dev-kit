# ⚡ VibeCoding Stack - The "Flow" Preservation Kit

**Purpose:** Tools designed to maintain "flow" (speed) by delegating repetitive tasks to AI and ultra-fast tooling.
**Philosophy:** "Let the AI write messy code, let the tools clean it instantly."

---

## 🏎️ 1. The "Sprinters" (Rust-based Speed)

> **Goal:** Zero-latency formatting and linting.

### **Biome (formerly Rome)**
- **Language:** JavaScript, TypeScript, JSON.
- **Why it fits VibeCoding:**
  - ⚡ **35x faster** than Prettier/ESLint.
  - 🛠️ **Zero Config:** No fighting with `.eslintrc`.
  - 🔄 **Fix-on-Save:** AI writes messy code -> Biome formats it instantly.
- **Role:** Replaces Prettier + ESLint for purely speed-focused projects.

### **Ruff**
- **Language:** Python.
- **Why it fits VibeCoding:**
  - ⚡ **10-100x faster** than existing Python linters.
  - 🐍 Replaces Flake8, Black, isort, Pylint.
- **Role:** The only tool needed for Python linting/formatting.

---

## 🛡️ 2. The Guardians (Automation)

> **Goal:** Prevent AI "hallucinations" from entering the repo.

### **Husky + lint-staged**
- **Function:** Runs checks *before* you commit.
- **Vibe Rule:** "If the AI broke the build, it doesn't leave the laptop."
- **Setup:**
  ```json
  "lint-staged": {
    "*.{js,ts,tsx}": ["biome check --apply", "git add"]
  }
  ```

### **ls-lint**
- **Function:** File naming police.
- **Vibe Rule:** Enforces the `NAMING_STANDARDS.md` automatically.
- **Why:** AI often messes up casing (`userProfile.ts` vs `user-profile.ts`). This catches it instantly.

---

## 📦 3. The "No-Think" Versioning

> **Goal:** Release without thinking about version numbers.

### **Commitizen**
- **Function:** Interactive commit messages.
- **Vibe Rule:** AI can write `feat: add login` but Commitizen ensures it matches Conventional Commits exactly.

### **Semantic Release**
- **Function:** Automated versioning/publishing.
- **Magic:** `fix` commit -> v1.0.1. `feat` commit -> v1.1.0. No human math involved.

---

## 🧱 4. The Architect (Validation)

### **Zod**
- **Function:** Runtime schema validation.
- **Vibe Rule:** Defining the "Interface" first allows the AI to output specifically structured data (Structured Outputs) that is guaranteed to match your application code.

---

## 📊 Summary: VibeThink vs VibeCoding

| Category | Standard VibeThink (Robust) | VibeCoding (Flow/Speed) |
|----------|-----------------------------|-------------------------|
| **JS Linter** | ESLint + Prettier | **Biome** |
| **Python** | Flake8/Black | **Ruff** |
| **Commits** | Manual / Rules | **Commitizen + Husky** |
| **Naming** | Manual Review | **ls-lint** |
| **Versioning**| Manual / Scripts | **Semantic Release** |

> **Recommendation:** Adopt the VibeCoding stack for new, high-velocity projects. Keep standard stack for legacy/enterprise maintenance where tooling migration is costly.
