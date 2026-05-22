# 🔖 Versioning Policy & Best Practices

**Inherited from:**
- Vibethink Orchestrator (Dependency Management)
- V3-Andres.cantor (App Versioning Workflow)

## 🎯 Core Principles

1.  **Single Source of Truth**: Version numbers are defined in ONE file only.
2.  **Explicit Verification**: AI must ask user before bumping versions.
3.  **Exact Dependencies**: No "floating" versions (`^` or `~`) in critical projects.

---

## 📦 Application Versioning (V3-Andres.cantor Model)

### The `types.ts` Pattern
Define version info in a central types file (`src/types.ts` or `src/config/version.ts`):

```typescript
// Single Source of Truth
export const APP_VERSION_NUMBER = '2.7.0'; // Semantic Version
export const APP_VERSION_DESCRIPTOR = 'Connection & Duplication Fix'; // Human readable
export const APP_VERSION = `V${APP_VERSION_NUMBER} (${APP_VERSION_DESCRIPTOR})`; // Auto-generated
```

### Workflow
1.  **Pre-Commit Check**: AI asks: "Actualizamos la versión antes de commit?"
2.  **Update**: Increment `APP_VERSION_NUMBER` (MAJOR.MINOR.PATCH).
3.  **Changelog**: Add entry to `CHANGELOG.md`.
4.  **Commit**: Commit changes with the version bump.
5.  **Tag**: `vX.Y.Z` (e.g., `v2.7.0`). Always prefix with `v`.

---

## 🛡️ Dependency Versioning (Orchestrator Model)

### The "Exact Version" Rule
In `vibethink-orchestrator`, using explicit versions is mandatory to prevent drift and breaking changes in Monorepos.

**Rule**: Remove carets (`^`) and tildes (`~`) from `package.json`.

**Bad:**
```json
"dependencies": {
  "react": "^18.2.0",
  "express": "~4.17.1"
}
```

**Good:**
```json
"dependencies": {
  "react": "18.2.0",
  "express": "4.21.2"
}
```

**Why?**
- Avoids silent upgrades that break specific integrations (like Express 5 incompatibilities).

### Monorepo Strictness (Orchestrator)
- **Core Dependencies**: Must be defined in the *root* `package.json` only.
- **Validation**: Use scripts (e.g., `validate:npm-install`) to detect duplications across workspaces.
- **Lockfile**: `package-lock.json` is the holy grail. Never delete it to "fix" bugs; fix the dependencies instead.


---

## 📝 Changelog Standards

Follow [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format.

```markdown
## [2.7.0] - 2025-12-12
### Added
- Feature A description.

### Fixed
- Bug fix B description.
```

---

## 🔍 Validation System

- **Orchestrator**: Uses `npm run validate:npm-install` to ensure no duplicates.
- **DevKit**: Uses `vibe-doctor.ps1` to check for conflicting tools.

**Last Updated**: 2025-12-12
