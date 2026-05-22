# ============================================================================
# SETUP PROJECT - V1.0.0
# ============================================================================
# Configura un proyecto nuevo con VibeThink Dev Kit
# Genera .vibethink.config.json automáticamente
# ============================================================================

param(
  [switch]$SkipDetection = $false
)

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         VIBETHINK DEV KIT - PROJECT SETUP                 ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# PASO 1: Detectar Stack Automáticamente
# ============================================================================

Write-Host "🔍 Detectando stack del proyecto..." -ForegroundColor Yellow
Write-Host ""

$config = @{
  project       = @{
    name        = ""
    type        = "web-app"
    description = ""
  }
  stack         = @{
    frontend       = @{
      framework        = "none"
      frameworkVersion = ""
      buildTool        = "none"
      buildToolVersion = ""
      language         = "typescript"
      languageVersion  = ""
      styling          = @{
        framework = "none"
        version   = ""
        uiLibrary = "none"
      }
    }
    backend        = @{
      framework        = "none"
      frameworkVersion = ""
      runtime          = "node"
      runtimeVersion   = ""
      database         = @{
        provider = "none"
        orm      = "none"
      }
    }
    packageManager = "npm"
    nodeVersion    = ""
    preferences    = @{
      vibeCoding = $false
    }
  }
  compatibility = @{
    prohibited = @()
    required   = @()
    warnings   = @()
    conflicts  = @()
  }
}

# Detectar package.json
if (Test-Path "package.json") {
  Write-Host "   ✅ package.json encontrado" -ForegroundColor Green
  $pkg = Get-Content "package.json" | ConvertFrom-Json

  # Detectar framework frontend
  if ($pkg.dependencies.next) {
    $config.stack.frontend.framework = "next.js"
    $config.stack.frontend.frameworkVersion = $pkg.dependencies.next -replace '\^|~', ''
    $config.stack.frontend.buildTool = "next.js"
    Write-Host "   📦 Framework: Next.js $($config.stack.frontend.frameworkVersion)" -ForegroundColor Cyan
  }
  elseif ($pkg.dependencies.react) {
    $config.stack.frontend.framework = "react"
    $config.stack.frontend.frameworkVersion = $pkg.dependencies.react -replace '\^|~', ''

    # Detectar build tool
    if ($pkg.devDependencies.vite) {
      $config.stack.frontend.buildTool = "vite"
      $config.stack.frontend.buildToolVersion = $pkg.devDependencies.vite -replace '\^|~', ''
      Write-Host "   📦 Framework: React $($config.stack.frontend.frameworkVersion) + Vite $($config.stack.frontend.buildToolVersion)" -ForegroundColor Cyan
    }
    elseif ($pkg.dependencies.'react-scripts') {
      $config.stack.frontend.buildTool = "create-react-app"
      Write-Host "   📦 Framework: React $($config.stack.frontend.frameworkVersion) + CRA" -ForegroundColor Cyan
    }
  }

  # Detectar TypeScript
  if ($pkg.devDependencies.typescript) {
    $config.stack.frontend.language = "typescript"
    $config.stack.frontend.languageVersion = $pkg.devDependencies.typescript -replace '\^|~', ''
    Write-Host "   📝 Lenguaje: TypeScript $($config.stack.frontend.languageVersion)" -ForegroundColor Cyan
  }
  else {
    $config.stack.frontend.language = "javascript"
    Write-Host "   📝 Lenguaje: JavaScript" -ForegroundColor Cyan
  }

  # Detectar Tailwind
  if ($pkg.devDependencies.tailwindcss) {
    $config.stack.frontend.styling.framework = "tailwind"
    $config.stack.frontend.styling.version = $pkg.devDependencies.tailwindcss -replace '\^|~', ''
    Write-Host "   🎨 Styling: Tailwind CSS $($config.stack.frontend.styling.version)" -ForegroundColor Cyan
  }

  # Detectar backend framework
  if ($pkg.dependencies.express) {
    $config.stack.backend.framework = "express"
    $config.stack.backend.frameworkVersion = $pkg.dependencies.express -replace '\^|~', ''
    Write-Host "   🔧 Backend: Express $($config.stack.backend.frameworkVersion)" -ForegroundColor Cyan
  }
  elseif ($pkg.dependencies.fastify) {
    $config.stack.backend.framework = "fastify"
    $config.stack.backend.frameworkVersion = $pkg.dependencies.fastify -replace '\^|~', ''
    Write-Host "   🔧 Backend: Fastify $($config.stack.backend.frameworkVersion)" -ForegroundColor Cyan
  }

  # Detectar ORM
  if ($pkg.dependencies.prisma) {
    $config.stack.backend.database.orm = "prisma"
    Write-Host "   🗄️  ORM: Prisma" -ForegroundColor Cyan
  }
  elseif ($pkg.dependencies.'drizzle-orm') {
    $config.stack.backend.database.orm = "drizzle"
    Write-Host "   🗄️  ORM: Drizzle" -ForegroundColor Cyan
  }

  # Detectar package manager
  if (Test-Path "pnpm-lock.yaml") {
    $config.stack.packageManager = "pnpm"
    Write-Host "   📦 Package Manager: pnpm" -ForegroundColor Cyan
  }
  elseif (Test-Path "yarn.lock") {
    $config.stack.packageManager = "yarn"
    Write-Host "   📦 Package Manager: yarn" -ForegroundColor Cyan
  }
  else {
    $config.stack.packageManager = "npm"
    Write-Host "   📦 Package Manager: npm" -ForegroundColor Cyan
  }
}
else {
  Write-Host "   ⚠️  package.json no encontrado" -ForegroundColor Yellow
  Write-Host "   Se usará configuración manual" -ForegroundColor Gray
}

Write-Host ""

# ============================================================================
# PASO 2: Preguntar Información Faltante
# ============================================================================

Write-Host "📝 Información del proyecto:" -ForegroundColor Yellow
Write-Host ""

# Nombre del proyecto
$projectName = Read-Host "Nombre del proyecto"
if ($projectName) {
  $config.project.name = $projectName
}

# Descripción
$projectDesc = Read-Host "Descripción breve"
if ($projectDesc) {
  $config.project.description = $projectDesc
}

Write-Host ""

# Preferencia de Stack
Write-Host "⚡ Estilo de Desarrollo:" -ForegroundColor Yellow
Write-Host "   [1] Standard (Robust/Enterprise) - ESLint, Prettier, strict rules" -ForegroundColor Cyan
Write-Host "   [2] VibeCoding (Speed/Flow)      - Biome, Ruff, Husky, Semantic Release" -ForegroundColor Cyan
$stackPref = Read-Host "Selecciona una opción (1/2) [Default: 1]"

if ($stackPref -eq "2") {
  $config.stack.preferences.vibeCoding = $true
  Write-Host "   🚀 Modo VibeCoding activado" -ForegroundColor Green
}
else {
  Write-Host "   🛡️  Modo Standard activado" -ForegroundColor Green
}

Write-Host ""

# ============================================================================
# PASO 3: Generar Reglas de Compatibilidad
# ============================================================================

Write-Host "🔧 Generando reglas de compatibilidad..." -ForegroundColor Yellow
Write-Host ""

# Reglas basadas en el stack detectado
if ($config.stack.frontend.framework -eq "react" -and $config.stack.frontend.buildTool -eq "vite") {
  $config.compatibility.prohibited = @("next", "webpack", "react-scripts", "express@5.x")
  $config.compatibility.required = @("react@^19.0.0", "vite@^6.0.0")
  $config.compatibility.warnings = @(
    "Do not mix Vite + Webpack",
    "Do not install Next.js in Vite project"
  )

  # Conflicto Prisma + Refine
  if ($config.stack.backend.database.orm -eq "prisma") {
    $config.compatibility.conflicts += @{
      package1 = "prisma"
      package2 = "@refinedev/core"
      reason   = "Prisma's schema generation conflicts with Refine's data provider"
      solution = "Use Drizzle ORM instead of Prisma with Refine"
    }
    $config.compatibility.prohibited += "refine.dev"
    $config.compatibility.warnings += "Prisma and Refine.dev are incompatible - use Drizzle instead"
  }
}
elseif ($config.stack.frontend.framework -eq "next.js") {
  $config.compatibility.prohibited = @("vite", "react-router-dom", "express")
  $config.compatibility.required = @("next@^15.0.0", "react@^19.0.0")
  $config.compatibility.warnings = @(
    "Next.js has its own bundler - do not install Vite",
    "Next.js uses App Router - do not install react-router-dom"
  )
}

# Regla universal de Express
if ($config.stack.backend.framework -eq "express") {
  $config.compatibility.conflicts += @{
    package1 = "express@5.x"
    package2 = "any"
    reason   = "Express 5 has compatibility issues in production (DigitalOcean)"
    solution = "Use Express 4.21.2"
  }
}

Write-Host "   ✅ Reglas generadas" -ForegroundColor Green
Write-Host ""

# ============================================================================
# PASO 4: Generar .vibethink.config.json
# ============================================================================

Write-Host "💾 Generando .vibethink.config.json..." -ForegroundColor Yellow
Write-Host ""

$configJson = @{
  '$schema'     = "https://vibethink.dev/schema/config.json"
  version       = "1.0.0"
  project       = $config.project
  stack         = $config.stack
  compatibility = $config.compatibility
  ai            = @{
    readFirst               = @(
      "AGENTS.md",
      "STACK_COMPATIBILITY.md",
      ".vibethink.config.json"
    )
    beforeDependencyChanges = @(
      "Read .vibethink.config.json to understand current stack",
      "Check compatibility.prohibited for forbidden packages",
      "Check compatibility.conflicts for known incompatibilities",
      "Verify in STACK_COMPATIBILITY.md",
      "Ask user if unsure"
    )
    rules                   = @(
      "NEVER install packages in compatibility.prohibited",
      "ALWAYS check compatibility.conflicts before suggesting packages",
      "ALWAYS verify compatibility with current stack.frontend.framework",
      "ALWAYS verify compatibility with current stack.backend.framework",
      "If conflict detected, suggest alternative from TOOLS_AND_STACK.md"
    )
  }
}

$configJson | ConvertTo-Json -Depth 10 | Out-File ".vibethink.config.json" -Encoding UTF8

Write-Host "   ✅ .vibethink.config.json creado" -ForegroundColor Green
Write-Host ""

# ============================================================================
# PASO 4.5: Reorganizar Kit en .vibethink/ (Estructura Híbrida)
# ============================================================================

Write-Host "🗂️  Reorganizando kit en .vibethink/..." -ForegroundColor Yellow
Write-Host ""

$kitFolders = @("scripts", "rules", "docs", "knowledge", "tools")

if (-not (Test-Path ".vibethink")) {
  # Crear carpeta .vibethink
  New-Item -ItemType Directory -Path ".vibethink" -Force | Out-Null
  Write-Host "   ✅ Carpeta .vibethink/ creada" -ForegroundColor Green

  # Mover carpetas del kit a .vibethink/
  foreach ($folder in $kitFolders) {
    if (Test-Path $folder) {
      $destPath = Join-Path ".vibethink" $folder
      Move-Item $folder $destPath -Force
      Write-Host "   ✅ Movido: $folder/ → .vibethink/$folder/" -ForegroundColor Green
    }
  }

  # Mover archivos de documentación del kit (si existen en raíz)
  $kitRootFiles = @("STACK_COMPATIBILITY.md", "DOCS_ROUTING.md", "KNOWLEDGE_INHERITANCE.md", "ROADMAP.md")
  foreach ($file in $kitRootFiles) {
    if (Test-Path $file -and $file -ne "README.md") {
      $destPath = Join-Path ".vibethink" $file
      Move-Item $file $destPath -Force
      Write-Host "   ✅ Movido: $file → .vibethink/$file" -ForegroundColor Green
    }
  }

  Write-Host ""
  Write-Host "   ✅ Kit organizado en .vibethink/" -ForegroundColor Green
  Write-Host ""
}

# ============================================================================
# PASO 4.6: Generar AGENTS.md
# ============================================================================

Write-Host "📝 Generando AGENTS.md..." -ForegroundColor Yellow
Write-Host ""

# Función para generar AGENTS.md basado en config
function Generate-AgentsMD {
  param($Config)

  $agentsMD = @"
# Project Constitution

[![AGENTS.md](https://img.shields.io/badge/AGENTS-md-blue)](https://agents.md)

This document defines the project's tech stack, rules, and constraints for AI assistants working on this project.

> **📍 Kit Location:** The VibeThink Dev Kit is located in `.vibethink/` folder.
> **⚙️ Config:** Project configuration is in `.vibethink.config.json` (this directory).
> **📚 Quick Access:** Run health check with `.\vibethink\scripts\vibe-doctor.ps1`

---

## Tech Stack

> **🔥 Dev Mode:** $(if ($Config.stack.preferences.vibeCoding) { "Vibecoding (Speed)" } else { "Standard (Robust)" })

**Frontend:**
- Framework: $($Config.stack.frontend.framework)$(if ($Config.stack.frontend.frameworkVersion) { " $($Config.stack.frontend.frameworkVersion)" } else { "" })
- Build Tool: $($Config.stack.frontend.buildTool)$(if ($Config.stack.frontend.buildToolVersion) { " $($Config.stack.frontend.buildToolVersion)" } else { "" })
- Language: $($Config.stack.frontend.language)
"@

  # State Management
  if ($Config.stack.frontend.stateManagement -and $Config.stack.frontend.stateManagement -ne "none") {
    $stateMgmt = $Config.stack.frontend.stateManagement
    $altState = if ($stateMgmt -eq "zustand") { "Redux" } elseif ($stateMgmt -eq "redux") { "Zustand" } else { "" }
    $altText = if ($altState) { " (DO NOT use $altState)" } else { "" }
    $agentsMD += "`n- State Management: $stateMgmt$altText"
  }

  $agentsMD += @"

**Backend:**
- Runtime: $($Config.stack.backend.runtime)
"@

  # Backend Framework
  if ($Config.stack.backend.framework -and $Config.stack.backend.framework -ne "none") {
    $backendFw = $Config.stack.backend.framework
    $backendVer = if ($Config.stack.backend.frameworkVersion) { " v$($Config.stack.backend.frameworkVersion)" } else { "" }
    $backendConstraint = ""
    if ($backendFw -eq "express" -and $backendVer -match "5\.|^5") {
      $backendConstraint = " (ONLY use Express 4.21.2)"
    }
    $agentsMD += "`n- Framework: $backendFw$backendVer$backendConstraint"
  }

  $agentsMD += @"

**Database:**
"@

  # Database
  if ($Config.stack.backend.database.provider -and $Config.stack.backend.database.provider -ne "none") {
    $agentsMD += "- Provider: $($Config.stack.backend.database.provider)`n"
  }

  if ($Config.stack.backend.database.orm -and $Config.stack.backend.database.orm -ne "none") {
    $agentsMD += "- ORM: $($Config.stack.backend.database.orm)`n"
  }
  else {
    $agentsMD += "- ORM: None (use client directly)`n"
  }

  $agentsMD += @"

---

## Critical Rules

### Before Making Changes
1. **ALWAYS** read `.vibethink.config.json` first (this directory)
2. **ALWAYS** read `.vibethink/rules/conflicts.json` before installing packages
3. **ALWAYS** run `.\vibethink\scripts\vibe-doctor.ps1` before installing new dependencies

### Prohibited Actions
"@

  # Prohibited packages
  if ($Config.compatibility.prohibited -and $Config.compatibility.prohibited.Count -gt 0) {
    foreach ($prohibited in $Config.compatibility.prohibited) {
      $agentsMD += "`n- ❌ **NEVER** install ``$prohibited``"
    }
  }
  else {
    $agentsMD += @"
- ❌ **NEVER** mix state managers
- ❌ **NEVER** install Prisma with Supabase (use Supabase client directly)
- ❌ **NEVER** install Vite with Next.js (Next.js has its own bundler)
- ❌ **NEVER** install Express 5.x (use Express 4.21.2)
"@
  }

  $agentsMD += @"

### Required Actions
- ✅ Use `.vibethink.config.json` as single source of truth
- ✅ Check `.vibethink/STACK_COMPATIBILITY.md` for known conflicts
- ✅ Ask user before installing packages in `compatibility.prohibited`
- ✅ Verify compatibility before suggesting updates
"@

  if ($Config.stack.preferences.vibeCoding) {
    $agentsMD += @"
- ⚡ **Use Biome** for linting/formatting (JS/TS)
- ⚡ **Use Ruff** for linting/formatting (Python)
- ⚡ **Prioritize Speed** and flow over strict configuration
"@
  }
  else {
    $agentsMD += @"
- 🛡️ **Use ESLint + Prettier** for linting/formatting
- 🛡️ **Prioritize Strictness** and robust configuration
"@
  }

  $agentsMD += @"

---

## Naming & Versioning Rules

### Naming Conventions
"@

  # Stack-specific naming rules
  if ($Config.stack.frontend.language -eq "typescript" -or $Config.stack.frontend.language -eq "javascript") {
    $agentsMD += @"
- **Files:** `kebab-case` (default), `PascalCase` (React Components), `camelCase` (Utils/Hooks)
- **Variables/Functions:** `camelCase`
- **Classes:** `PascalCase`
- **Constants:** `UPPER_SNAKE_CASE`
"@
  }
  elseif ($Config.stack.backend.runtime -eq "python" -or $Config.stack.backend.framework -match "django|flask|fastapi") {
    $agentsMD += @"
- **Files:** `snake_case` (Python modules)
- **Variables/Functions:** `snake_case`
- **Classes:** `PascalCase`
- **Constants:** `UPPER_SNAKE_CASE`
"@
  }
  else {
    $agentsMD += @"
- Follow standard conventions for the detecting language.
"@
  }

  $agentsMD += @"

### Versioning Strategy
- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`)
- **Releases:** $(if ($Config.stack.preferences.vibeCoding) { "Semantic Release (Automated)" } else { "Manual Versioning (vX.Y.Z)" })

---

## Stack Constraints

- Maintain consistency with detected stack
- Do not mix incompatible technologies
- Prefer tested and stable versions
"@

  # Stack-specific constraints
  if ($Config.stack.frontend.framework -eq "react" -and $Config.stack.frontend.buildTool -eq "vite") {
    $agentsMD += "`n- Do not install Next.js in Vite project"
    $agentsMD += "`n- Do not mix Vite + Webpack"
  }
  elseif ($Config.stack.frontend.framework -eq "next.js") {
    $agentsMD += "`n- Do not install Vite (Next.js has its own bundler)"
  }

  if ($Config.stack.backend.framework -eq "express") {
    $agentsMD += "`n- Only use Express 4.x (NEVER 5.x)"
  }

  if ($Config.stack.backend.database.provider -eq "supabase" -and $Config.stack.backend.database.orm -eq "prisma") {
    $agentsMD += "`n- Do not use Prisma with Supabase (use Supabase client directly)"
  }

  $agentsMD += @"

---

## AI Assistant Instructions

When working on this project:

1. **Read First:** `.vibethink.config.json` (this directory), `.vibethink/STACK_COMPATIBILITY.md`, `.vibethink/rules/conflicts.json`
2. **Validate Before:** Run `.\vibethink\scripts\vibe-doctor.ps1` before installing packages
3. **Ask If Unsure:** If a package is not in the config, ask the user
4. **Respect Constraints:** Do not suggest packages in `compatibility.prohibited`
5. **Check Conflicts:** Verify no conflicts in `compatibility.conflicts`

### Kit Structure
- **Scripts:** `.vibethink/scripts/`
- **Rules:** `.vibethink/rules/conflicts.json`
- **Documentation:** `.vibethink/docs/`
- **Knowledge:** `.vibethink/knowledge/` (if methodology included)

---

**Last Updated:** $(Get-Date -Format "yyyy-MM-dd")
**Generated by:** VibeThink Dev Kit v1.0.0
"@

  return $agentsMD
}

# Generar AGENTS.md
$agentsContent = Generate-AgentsMD -Config $config
$agentsContent | Out-File "AGENTS.md" -Encoding UTF8

Write-Host "   ✅ AGENTS.md creado" -ForegroundColor Green
Write-Host ""

# ============================================================================
# PASO 5: Resumen
# ============================================================================

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              ✅ SETUP COMPLETADO                           ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📊 Configuración generada:" -ForegroundColor Yellow
Write-Host "   Proyecto: $($config.project.name)" -ForegroundColor Cyan
Write-Host "   Framework: $($config.stack.frontend.framework)" -ForegroundColor Cyan
Write-Host "   Build Tool: $($config.stack.frontend.buildTool)" -ForegroundColor Cyan
Write-Host "   Backend: $($config.stack.backend.framework)" -ForegroundColor Cyan
Write-Host "   Package Manager: $($config.stack.packageManager)" -ForegroundColor Cyan
Write-Host "   Mode: $(if ($config.stack.preferences.vibeCoding) { "VibeCoding 🚀" } else { "Standard 🛡️" })" -ForegroundColor Cyan
Write-Host ""

Write-Host "⚠️  Dependencias prohibidas:" -ForegroundColor Yellow
foreach ($dep in $config.compatibility.prohibited) {
  Write-Host "   ❌ $dep" -ForegroundColor Red
}
Write-Host ""

if ($config.compatibility.conflicts.Count -gt 0) {
  Write-Host "⚠️  Conflictos conocidos:" -ForegroundColor Yellow
  foreach ($conflict in $config.compatibility.conflicts) {
    Write-Host "   ⚠️  $($conflict.package1) vs $($conflict.package2)" -ForegroundColor Yellow
    Write-Host "      Razón: $($conflict.reason)" -ForegroundColor Gray
    Write-Host "      Solución: $($conflict.solution)" -ForegroundColor Green
  }
  Write-Host ""
}

Write-Host "💡 Próximos pasos:" -ForegroundColor Yellow
Write-Host "   1. Revisar .vibethink.config.json" -ForegroundColor Gray
Write-Host "   2. Revisar AGENTS.md (generado automáticamente)" -ForegroundColor Gray
Write-Host "   3. Las IAs leerán estos archivos antes de sugerir cambios" -ForegroundColor Gray
Write-Host "   4. Ejecutar .\scripts\vibe-doctor.ps1 para validar el stack" -ForegroundColor Gray
Write-Host ""
