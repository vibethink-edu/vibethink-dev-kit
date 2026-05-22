# 📁 Templates Folder

## ⚠️ IMPORTANT: These files are EXAMPLES

The files in this folder are **templates/examples** to show you what gets auto-generated when you run `setup-project.ps1`.

**These files are NOT used by the kit itself.**

---

## 🎯 Purpose

When you run:

```powershell
.\scripts\setup-project.ps1
```

The script will:
1. Detect your project's stack (React? Express? Supabase?)
2. Generate `AGENTS.md` in your project root (see `AGENTS.md.example`)
3. Generate `.vibethink.config.json` in your project root (see `.vibethink.config.json.example`)

---

## 📄 Files in This Folder

### `AGENTS.md.example`
**What it shows:** Example of auto-generated AGENTS.md file

**What it contains:**
- Detected tech stack
- List of prohibited packages
- Known conflicts
- Recommended patterns
- Multi-IA coordination instructions

**Real file location:** Generated at `YOUR_PROJECT_ROOT/AGENTS.md`

---

### `.vibethink.config.json.example`
**What it shows:** Example of auto-generated config file

**What it contains:**
- Detected stack (frontend, backend, database)
- Prohibited packages list
- Known conflicts
- Multi-IA settings
- Validation metadata

**Real file location:** Generated at `YOUR_PROJECT_ROOT/.vibethink.config.json`

---

## 🔄 Workflow

### For New Projects:

```powershell
# 1. Create your project
npm create vite@latest my-project
cd my-project

# 2. Copy VibeThink Dev Kit
Copy-Item "path\to\_vibethink-dev-kit\*" . -Recurse

# 3. Run setup (generates AGENTS.md and .vibethink.config.json)
.\scripts\setup-project.ps1

# 4. Check what was generated
cat AGENTS.md
cat .vibethink.config.json
```

### For Existing Projects:

```powershell
# 1. Copy VibeThink Dev Kit to your project
Copy-Item "path\to\_vibethink-dev-kit\*" . -Recurse

# 2. Run setup (detects existing stack)
.\scripts\setup-project.ps1

# 3. Verify detection was correct
cat AGENTS.md  # Should match your actual stack
```

---

## 🤔 Common Questions

### Q: Why aren't these files in the kit root?

**A:** Because they're project-specific. Each project has different stack:
- Project A: React + Vite + Express
- Project B: Next.js + Prisma + PostgreSQL
- Project C: React + Supabase

The kit **detects** your stack and generates the appropriate files.

---

### Q: Do I need to edit these template files?

**A:** **NO.** These are read-only examples for reference.

When you run `setup-project.ps1`, it generates fresh files based on YOUR actual project.

---

### Q: What if the generated files are wrong?

**A:** Two options:

1. **Re-run setup:**
   ```powershell
   .\scripts\setup-project.ps1  # Re-detects and regenerates
   ```

2. **Manual edit:**
   - Edit `.vibethink.config.json` to fix detection
   - Re-run setup to regenerate AGENTS.md

---

## 🎓 Example Scenarios

### Scenario 1: React + Vite Project

**Your package.json:**
```json
{
  "dependencies": {
    "react": "19.0.0",
    "vite": "6.0.0"
  }
}
```

**What setup-project.ps1 generates:**

AGENTS.md will say:
- Framework: React 19.0.0 ✅
- Build Tool: Vite 6.0.0 ✅
- Prohibited: next, webpack, express@5.x

.vibethink.config.json will have:
```json
{
  "stack": {
    "frontend": {
      "framework": "react",
      "buildTool": "vite"
    }
  }
}
```

---

### Scenario 2: Next.js Project

**Your package.json:**
```json
{
  "dependencies": {
    "next": "14.0.0",
    "react": "18.2.0"
  }
}
```

**What setup-project.ps1 generates:**

AGENTS.md will say:
- Framework: Next.js 14.0.0 ✅
- Build Tool: Next.js (built-in) ✅
- Prohibited: vite, webpack, react-scripts

---

## 🚀 Summary

| File | Status | Purpose |
|------|--------|---------|
| `AGENTS.md.example` | Template/Example | Shows what AGENTS.md looks like |
| `.vibethink.config.json.example` | Template/Example | Shows what config looks like |
| `YOUR_PROJECT/AGENTS.md` | Auto-generated | Real file used by AIs |
| `YOUR_PROJECT/.vibethink.config.json` | Auto-generated | Real config used by kit |

---

**Remember:** Always run `setup-project.ps1` after copying the kit to your project!

---

**Created by:** VibeThink Team
**Version:** 1.0.0
**Last Updated:** 2025-12-12
