# 📁 FILE PLACEMENT QUICK REFERENCE - VibeThink Orchestrator

> **🎯 PURPOSE:** Fast lookup guide for correct file placement  
> **📋 SCOPE:** All file types with specific location rules  
> **⚡ USAGE:** Consult before creating/moving any file

---

## 🚀 **QUICK DECISION MATRIX**

| File Type | Pattern | Correct Location | Example |
|-----------|---------|------------------|---------|
| **📊 Analysis Results** | `*_ANALYSIS.md`, `*_EVALUATION.md` | `docs/reports/analysis/` | `COMPONENT_EVALUATION.md` |
| **📈 Status Reports** | `*_STATUS.md`, `*_PROGRESS.md` | `docs/reports/implementation/` | `DASHBOARD_STATUS.md` |
| **🎨 UI Reports** | `UI_*.md`, `*_UX_*.md` | `docs/reports/ui/` | `UI_COMPLIANCE_CHECKLIST.md` |
| **🤖 AI Sessions** | `AI_*.md`, `CLAUDE_*.md` | `docs/reports/ai-coordination/` | `CLAUDE_CODE_HANDOFF.md` |
| **🔧 Fix Scripts** | `fix-*.cjs`, `*-violations.cjs` | `dev-tools/utilities/` | `fix-imports.cjs` |
| **✅ Validators** | `validate-*.cjs`, `*-validator.cjs` | `dev-tools/validation/` | `validate-architecture.cjs` |
| **⚙️ Automation** | `*.ps1`, `start-*.ps1` | `dev-tools/automation/` | `Start-VThinkDashboard.ps1` |
| **📚 User Guides** | `*_GUIDE.md`, `SETUP_*.md` | `docs/guides/` | `COMMAND_CENTER.md` |
| **👨‍💻 Dev Docs** | `DEVELOPMENT_*.md`, `API_*.md` | `docs/development/` | `DEVELOPMENT_GUIDE.md` |
| **🏗️ Architecture** | `ARCHITECTURAL_*.md`, `*_DECISIONS.md` | `docs/architecture/` | `STACK_DECISIONS.md` |
| **🧪 Tests** | `*.test.ts`, `*.spec.ts` | `tests/` or `apps/[app]/__tests__/` | `component.test.ts` |
| **⚙️ Config (Global)** | `*.config.js`, `tsconfig.json` | `root/` | `eslint.config.js` |
| **⚙️ Config (App)** | `next.config.js`, `app.config.ts` | `apps/[app]/` | `apps/dashboard/next.config.js` |
| **📦 Build** | `.next/`, `dist/`, `build/` | `apps/[app]/` | `apps/dashboard/.next/` |
| **🗑️ Temporary** | `*.tmp`, `test-*.html`, `*-temp.*` | **DELETE** | `test-output.html` |

---

## 📊 **EVALUATION & ANALYSIS FILES**

### **🔍 Where do evaluation results go?**

```bash
# ✅ COMPONENT EVALUATIONS
docs/reports/analysis/
├── COMPONENT_EVALUATION_BUNDUI.md     # Third-party component analysis
├── LIBRARY_COMPATIBILITY_ANALYSIS.md  # Library compatibility studies  
├── PERFORMANCE_EVALUATION.md          # Performance analysis results
└── SECURITY_ANALYSIS_RESULTS.md       # Security evaluation outcomes

# ✅ TECHNOLOGY EVALUATIONS  
docs/reports/analysis/
├── STACK_EVALUATION_NEXTJS.md         # Technology stack evaluations
├── DATABASE_MIGRATION_ANALYSIS.md     # Migration analysis results
└── ARCHITECTURE_EVALUATION.md         # Architecture analysis results

# ✅ CODE ANALYSIS
docs/reports/analysis/  
├── CODE_QUALITY_ANALYSIS.md           # Code quality reports
├── DEPENDENCY_ANALYSIS.md              # Dependency analysis results
└── REFACTORING_IMPACT_ANALYSIS.md     # Refactoring impact studies
```

### **🚫 Where evaluations DON'T go:**
- ❌ **Root directory** - Clutters workspace
- ❌ **src/** - Not source code
- ❌ **apps/[app]/** - Not app-specific  
- ❌ **dev-tools/** - Not development tools

---

## 🔧 **SCRIPTS & AUTOMATION FILES**

### **🛠️ Script placement by function:**

```bash
# ✅ UTILITIES - General development helpers
dev-tools/utilities/
├── fix-imports.cjs                     # Code fixing scripts
├── analyze-dependencies.cjs            # Analysis automation  
├── migrate-components.cjs              # Migration scripts
└── cleanup-code.cjs                    # Code cleanup utilities

# ✅ VALIDATION - Quality and compliance  
dev-tools/validation/
├── validate-architecture.cjs           # Architecture compliance
├── validate-dependencies.cjs           # Dependency validation
└── security-validator.cjs              # Security compliance

# ✅ AUTOMATION - Workflow automation
dev-tools/automation/
├── Start-Development.ps1               # Development startup
├── Deploy-Staging.ps1                  # Deployment automation
└── Create-Backups.ps1                  # Backup automation

# ✅ TESTING - Test automation
dev-tools/testing/
├── run-e2e-tests.js                    # Test execution
├── setup-test-env.js                   # Test environment
└── generate-test-data.js               # Test data generation

# ✅ MONITORING - Health and monitoring
dev-tools/monitoring/  
├── health-check.js                     # System health
├── performance-monitor.js              # Performance tracking
└── error-tracker.js                    # Error monitoring
```

### **🚫 Where scripts DON'T go:**
- ❌ **Root directory** - Major architecture violation
- ❌ **src/** - Not application source code
- ❌ **docs/** - Not documentation
- ❌ **tests/** - Reserved for test files, not test scripts

---

## 📚 **DOCUMENTATION FILES**

### **📖 Documentation placement by audience:**

```bash
# ✅ END USERS - Guides and procedures
docs/guides/
├── USER_GUIDE.md                       # End user documentation
├── SETUP_GUIDE.md                      # Setup procedures
├── TROUBLESHOOTING_GUIDE.md            # Problem resolution
└── COMMAND_CENTER.md                   # Operation guides

# ✅ DEVELOPERS - Technical documentation
docs/development/
├── DEVELOPMENT_GUIDE.md                # Development procedures
├── API_DOCUMENTATION.md                # Technical API docs
├── CODING_STANDARDS.md                 # Development standards
└── DEBUGGING_GUIDE.md                  # Development troubleshooting

# ✅ ARCHITECTS - System design
docs/architecture/
├── SYSTEM_ARCHITECTURE.md              # High-level architecture
├── TECHNOLOGY_DECISIONS.md             # Architecture decisions
├── INTEGRATION_PATTERNS.md             # Integration architecture
└── SCALABILITY_DESIGN.md               # Scalability architecture

# ✅ PROJECT MANAGERS - Project info
docs/projects/
├── PROJECT_OVERVIEW.md                 # Project summary
├── MILESTONE_TRACKING.md               # Project milestones
└── RESOURCE_ALLOCATION.md              # Resource planning
```

---

## ⚙️ **CONFIGURATION FILES**

### **🎯 Root vs App configuration:**

```bash
# ✅ ROOT LEVEL - Workspace-wide settings
package.json                            # Root dependencies
tsconfig.json                           # Global TypeScript  
eslint.config.js                        # Workspace linting
tailwind.config.ts                      # Global styling
vitest.config.ts                        # Global testing
playwright.config.ts                    # E2E testing
lerna.json                              # Monorepo config

# ✅ APP LEVEL - App-specific settings  
apps/dashboard/package.json             # Dashboard dependencies
apps/dashboard/next.config.js           # Dashboard Next.js config
apps/dashboard/tailwind.config.ts       # Dashboard styling
apps/website/nuxt.config.ts             # Website specific config

# ❌ FORBIDDEN IN ROOT
next.config.js                          # ❌ App-specific, goes in apps/
nuxt.config.ts                          # ❌ App-specific, goes in apps/
app/                                    # ❌ Next.js router, goes in apps/
pages/                                  # ❌ Next.js pages, goes in apps/
```

---

## 🧪 **TESTING FILES**

### **🔬 Test placement by scope:**

```bash
# ✅ GLOBAL TESTS - Cross-app testing
tests/
├── integration/api-integration.test.ts  # Cross-app integration
├── e2e/user-workflows.spec.ts           # End-to-end workflows  
├── security/auth-security.test.ts       # Security testing
└── performance/load-testing.js          # Performance testing

# ✅ APP-SPECIFIC TESTS - Component testing
apps/dashboard/__tests__/
├── components/Button.test.tsx           # Component unit tests
├── pages/dashboard.test.tsx             # Page testing
└── utils/helpers.test.ts                # App utility testing

# ✅ TEST UTILITIES - Testing helpers
tests/utils/
├── test-helpers.ts                      # Global test utilities
├── mock-data.ts                         # Test data generators
└── setup-tests.ts                       # Test configuration
```

---

## 📦 **BUILD & GENERATED FILES**

### **🏗️ Build artifacts placement:**

```bash
# ✅ APP-SPECIFIC BUILDS
apps/dashboard/.next/                    # Next.js build output
apps/website/dist/                       # Static site build
apps/api/build/                          # API build output

# ✅ GLOBAL REPORTS - Root level
coverage/                                # Test coverage reports
playwright-report/                       # E2E test reports  
test-results/                            # Test execution results
docs/reports/                            # Generated documentation reports

# ❌ FORBIDDEN IN ROOT
.next/                                   # ❌ Should be in apps/[app]/.next/
dist/                                    # ❌ Should be in apps/[app]/dist/
build/                                   # ❌ Should be in apps/[app]/build/
```

---

## 🗑️ **TEMPORARY & UNWANTED FILES**

### **🔥 Files to DELETE immediately:**

```bash
# ❌ TEMPORARY FILES - Delete on sight
*.tmp                                    # Temporary processing files
*.temp                                   # Temporary work files  
*.backup                                 # Backup files
*-temp.md                                # Temporary documentation
test-*.html                              # Test HTML outputs
debug-*.log                              # Debug log files
scratch-*.js                             # Scratch/experiment files

# ❌ ORPHANED FILES - Delete if found
tatus                                    # Incomplete/corrupted files
untitled                                 # Unnamed files
new-file                                 # Default unnamed files
copy-of-*                                # Accidental copies

# ❌ IDE/EDITOR FILES - Should be gitignored
.vscode/settings.json                    # IDE settings (if not shared)
.idea/                                   # JetBrains IDE files
*.swp                                    # Vim swap files
.DS_Store                                # macOS system files
Thumbs.db                                # Windows system files
```

---

## 🎯 **QUICK PLACEMENT WORKFLOW**

### **📋 3-Step Process:**

1. **🤔 IDENTIFY TYPE**
   - What kind of file is this?
   - Who is the intended audience?
   - What is its purpose?

2. **📍 LOOKUP LOCATION**  
   - Use the matrix above
   - Check AI_UNIFIED_RULES.md for detailed rules
   - When in doubt, ask in the decision tree format

3. **✅ VALIDATE PLACEMENT**
   - Does it follow the established patterns?
   - Will other developers find it easily?
   - Does it comply with architecture rules?

### **🚨 RED FLAGS - Stop and reconsider:**
- File going to root directory (unless configuration)
- Multiple similar files in different locations  
- Temporary-looking names in permanent locations
- App-specific files in global locations
- Personal/experimental files in shared areas

---

## 📞 **WHEN IN DOUBT**

### **🤝 Ask these questions:**
1. **"Where would a developer look for this?"**
2. **"Does this follow existing patterns?"**  
3. **"Is this the right level of organization?"**
4. **"Will this file be needed in 6 months?"**

### **📚 Reference sources:**
- **AI_UNIFIED_RULES.md** - Complete placement rules
- **RULES_NAVIGATION.md** - Quick rule navigation  
- **This file** - Quick reference lookup

---

**🎯 REMEMBER:** When in doubt, organize by **audience first**, then by **type**. A well-organized file system is a productive file system!

**⚡ SUCCESS METRIC:** If you can find any file in less than 30 seconds, the organization is working.**