# 🏷️ Naming Conventions & Standards

> **AUTOMATION STATUS:** ✅ Enforced by `ls-lint` and `Biome`.
> **ACTION:** Run `npm run validate:names` to check filenames. Run `npm run check` to check code style.

**Inherited from:**
- **Vibethink Orchestrator** (Strict Standards)
- V3-Andres.cantor (Voice Agent Pattern)

---

## 📜 The "Golden Rules" (Automated)

### 1. 📁 File & Directory Naming (Enforced by ls-lint)

| Type | Extension | Naming Convention | Example |
|------|-----------|-------------------|---------|
| **Directories** | N/A | `kebab-case` | `components/`, `user-modules/` |
| **Scripts** | `.ps1` | `kebab-case` | `setup-project.ps1` |
| **Logic/Utils** | `.ts` | `camelCase` (Orchestrator Rule) | `apiClient.ts`, `validationUtils.ts` |
| **React Components** | `.tsx` | `PascalCase` | `UserProfile.tsx` |
| **Config** | `.json`, `.yml` | `kebab-case` | `package.json`, `config.yml` |
| **Documentation** | `.md` | `UPPER_SNAKE_CASE` or `snake_case` | `README.md`, `task.md` |
| **Methodologies** | `.md` | `METHODOLOGY_[NAME].md` | `METHODOLOGY_VTHINK.md` |

> [!NOTE]
> `kebab-case` is allowed for legacy `.ts` files, but `camelCase` is preferred for new logic.

### 2. 💻 Code Style (Enforced by Biome)

- **Variables/Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE` or `camelCase`
- **Classes**: `PascalCase`
- **Formatting**: 2 spaces indent, Double quotes, Semicolons.

---

## 🚫 Anti-Patterns

- ❌ **Mixed Case**: `userProfile.tsx` (Component) or `Auth.ts` (Hook).
- ❌ **Snake in JS**: `const user_id` (Use `userId`).
- ❌ **Ambiguous Names**: `data.ts`, `info.js`.

---

## 📚 Terminology

| Term | Usage |
|------|-------|
| **VThink** | The **Methodology** / Philosophy. |
| **VibeThink** | The **Software** / Dev Kit. |

---

**Last Updated**: 2025-12-13
**Status**: Automated via VibeCoding Stack
