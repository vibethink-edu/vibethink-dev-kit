# 🚀 VibeThink Dev Kit

[![AGENTS.md](https://img.shields.io/badge/AGENTS-md-blue)](https://agents.md)
[![Version](https://img.shields.io/badge/version-1.0.0-green)](https://github.com/vibethink/dev-kit)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

**The world's most complete AI-aware development kit**

Prevent architectural conflicts automatically, work with multiple editors, and inherit best practices from 16+ leading projects.

---

## ✨ Features

- ✅ **Stack Detection** - Automatically detects your tech stack
- ✅ **Conflict Prevention** - Validates dependencies before installation
- ✅ **Multi-Editor** - Works with Cursor, VS Code, Claude Code, Antigravity
- ✅ **Knowledge Harvest** - Extracts best practices from your projects
- ✅ **AI-Aware** - Optimized for AI coding assistants
- ✅ **Standards Compliant** - Follows AGENTS.md, Cursor Best Practices

---

## 💡 Real-World Problems Solved

### **Problem 1: AI installs incompatible dependencies**

**Without this kit:**
```
You: "Add Refine.dev for admin panel"
AI: *installs @refinedev/core*
You: *project breaks because you already use Prisma*
Result: Hours debugging why Refine doesn't work
```

**With this kit:**
```
You: "Add Refine.dev for admin panel"
AI: *reads .vibethink.config.json*
AI: "⚠️ Detected: You use Prisma. Prisma + Refine are incompatible."
AI: "Solution: Use Drizzle ORM instead, or use Prisma without Refine."
Result: Problem prevented before it happens ✅
```

---

### **Problem 2: Production breaks after "harmless" update**

**Without this kit:**
```
AI: "Express 5 is available, updating to latest version..."
You: *deploys to DigitalOcean*
Result: 500 errors, production down, 2 AM emergency 🚨
```

**With this kit:**
```
AI: *attempts to suggest Express 5*
vibe-doctor: ❌ "Express 5.x prohibited - known issues in DigitalOcean"
AI: "Keeping Express 4.21.2 (stable and tested)"
Result: Production stays stable ✅
```

---

### **Problem 3: Repeating mistakes across projects**

**Without this kit:**
```
Project 1: Waste 2 hours debugging Vite + Next.js conflict
Project 2: Same mistake again (forgot about the issue)
Project 3: Same mistake AGAIN (different team member)
```

**With this kit:**
```
Project 1: Encounter issue → add to rules/conflicts.json
Project 2: vibe-doctor prevents it automatically
Project 3: Never happens
Result: Learn once, benefit forever ✅
```

---

### **Problem 4: Working across multiple projects**

**Without this kit:**
```
Each project has different rules, different setup
You forget which project uses what
AI suggests solutions that worked in Project A but break Project B
```

**With this kit:**
```
One dev-kit, one source of truth
Copy to any project, automatic stack detection
Accumulated knowledge from all 4 projects benefits all future work
Result: Consistency + accumulated wisdom ✅
```

---

## 🤖 How Multiple IAs Read This Kit

**The REAL superpower:** This kit ensures **multiple AIs work together** without contradicting each other.

### **The Problem:**
```
Monday - Cursor AI: Adds Express backend
Tuesday - Claude: Suggests upgrading to Express 5
Wednesday - You: 💥 Production breaks
```

### **The Solution:**
```
All AIs read the same source of truth:
✅ AGENTS.md - Project constitution (OpenAI standard)
✅ .vibethink.config.json - Detected stack
✅ rules/conflicts.json - What NOT to do

Result: Coherent suggestions across all AIs
```

### **Compatibility Matrix:**

| AI | Reads AGENTS.md | Reads .cursorrules | Reads config.json |
|----|----------------|--------------------| ------------------|
| **Cursor** | ✅ | ✅ (primary) | ⚠️ If asked |
| **Claude** | ✅ | ⚠️ If asked | ✅ |
| **ChatGPT** | ✅ | ❌ | ⚠️ If asked |
| **Copilot** | ⚠️ Partial | ⚠️ Partial | ❌ |

**Best Practice:** Always start with: *"Read AGENTS.md and .vibethink.config.json first"*

**Full Guide:** [docs/MULTI_IA_GUIDE.md](docs/MULTI_IA_GUIDE.md)

---

## 🚀 Quick Start

> **⚠️ IMPORTANT:** The files `AGENTS.md` and `.vibethink.config.json` are **AUTO-GENERATED** by `setup-project.ps1`
>
> They don't exist in this kit repo. They are created in YOUR project when you run the setup script.
>
> See `templates/` folder for examples of what gets generated.

```powershell
# 1. Copy dev-kit to your project
Copy-Item "_vibethink-dev-kit\*" "your-project\" -Recurse

# 2. Run setup (MANDATORY - generates AGENTS.md and .vibethink.config.json)
#    Automatically organizes kit into .vibethink/ folder
.\scripts\setup-project.ps1

# 3. Run health check (note: scripts are now in .vibethink/)
.\vibethink\scripts\vibe-doctor.ps1
```

> **📁 Structure:** After setup, the kit is organized in `.vibethink/` folder (isolated from your project), while `AGENTS.md` and `.vibethink.config.json` remain in root (standard for AI agents).

---

## 📊 Stats

- **36 files** - Complete development kit
- **11,000+ lines** - Code and documentation
- **27 sources analyzed** - 16 projects + 6 experts + 4 own + 1 internal
- **8+ unique features** - Not found anywhere else

---

## 🎯 What Makes It Unique

**No other kit has ALL of these:**

1. ✅ Stack detection + autodetection
2. ✅ Architectural conflict validation (Prisma vs Refine, etc.)
3. ✅ Multi-editor support from single source
4. ✅ Knowledge harvesting between projects
5. ✅ Executable policies (not just docs)

---

## 📚 Documentation

**Core Guides:**
- [Quick Start](NEXT_STEPS.md) - Get started in 5 minutes
- [Multi-IA Guide](docs/MULTI_IA_GUIDE.md) - ⭐ How multiple AIs work together
- [When to Use](docs/WHEN_TO_USE.md) - Decision guides (Prisma vs Supabase, Zustand vs Redux, etc.)
- [Sync Guide](docs/SYNC_GUIDE.md) - Keep projects updated

**Templates (see what gets auto-generated):**
- [templates/AGENTS.md.example](templates/AGENTS.md.example) - Example of auto-generated AGENTS.md
- [templates/.vibethink.config.json.example](templates/.vibethink.config.json.example) - Example of auto-generated config

**Reference:**
- [ROADMAP](ROADMAP.md) - v2.0 features and timeline
- [Stack Compatibility](STACK_COMPATIBILITY.md) - Known conflicts
- [Knowledge Inheritance](KNOWLEDGE_INHERITANCE.md) - 27 sources analyzed
- [Tools & Stack](TOOLS_AND_STACK.md) - Recommended tools

---

## 🛠️ Commands

```powershell
# Setup new project
.\scripts\setup-project.ps1

# Health check
.\scripts\vibe-doctor.ps1

# Sync from central kit (update rules)
.\scripts\sync-from-kit.ps1

# Validate dependencies
.\scripts\hooks\pre-install.ps1 <package-name>

# Validate configuration
.\scripts\validate-rules.ps1          # Validate conflicts.json
.\scripts\validate-agents.ps1         # Validate AGENTS.md structure
.\scripts\validate-multi-ia.ps1       # Validate Multi-IA coherence

# Harvest knowledge
.\tools\harvest-knowledge.ps1
```

---

## 🎓 Inspired By

- **Spec Kit** (GitHub) - CLI and phases
- **Claude Code Development Kit** - Auto-loading protocol
- **Cursor.directory** - Community rules
- **T3 Stack** - Modularity
- **AGENTS.md** (OpenAI) - Standard format
- **Cursor Best Practices** - Rule structure

---

## 📅 Version History

- **v1.0.0** (2025-12-12) - Initial release with conflict prevention, stack detection, and 27 sources analyzed

---

## 🤝 Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 📄 License

MIT License - See [LICENSE](LICENSE)

---

## 🙏 Acknowledgments

Created by analyzing and inheriting best practices from 16 leading projects.

Special thanks to:
- Peter Krueck (Claude Code Development Kit)
- GitHub (Spec Kit)
- OpenAI (AGENTS.md)
- Cursor Community
- T3 Stack Team

---

**Made with ❤️ by VibeThink Team**
