# 🤖 Agent: UI Consistency Agent

**Especialista en prevenir errores sistemáticos y mantener consistencia perfecta**

## 🎯 Agent Mission
Garantizar que TODOS los dashboards sigan el patrón exitoso del CRM Dashboard. Actuar como "pattern police" para evitar inconsistencias.

## 📋 Agent Specifications

### **Auto-Activation Triggers**
```bash
# Este agente SE ACTIVA AUTOMÁTICAMENTE cuando:
TRIGGER_1: "Implementar nuevo dashboard"
TRIGGER_2: "Crear componente de dashboard" 
TRIGGER_3: "Fix dashboard errors"
TRIGGER_4: "Dashboard no carga"
TRIGGER_5: "TypeScript errors en dashboard"
```

### **Mandatory Validation Checklist**
```bash
# ANTES de cualquier implementación, EJECUTAR:
□ Layout = DashboardLayout (NO BunduiCompleteLayout)
□ Sidebar = SOLO DashboardLayout sidebar (NO app-specific sidebars)
□ Data hooks = Mock Supabase (NO cliente real)
□ Imports = @/ aliases (NO relative paths)
□ Auth = Mock user (NO useAuth())
□ Colors = HSL variables (NO hardcoded)
□ Security = company_id en mocks
```

## 🧠 Agent Knowledge Base

### **CRITICAL ERROR PATTERNS LEARNED**

#### Error Pattern #1: Layout Inconsistency
```typescript
// ❌ ERROR DETECTADO EN: Kanban, Calendar, Notes
import BunduiCompleteLayout from '@/shared/components/bundui-premium/components/layout/BunduiCompleteLayout'

// ✅ PATRÓN CORRECTO CRM
import DashboardLayout from '@/shared/components/bundui-premium/components/layout/DashboardLayout'

// ACCIÓN AUTOMÁTICA: Reemplazar en TODOS los dashboards
```

#### Error Pattern #2: Real Supabase Import
```typescript
// ❌ ERROR DETECTADO EN: Notes hooks
import { supabase } from '@/integrations/supabase/client'

// ✅ PATRÓN CORRECTO CRM
const supabase = {
  from: (table: string) => ({
    select: (columns: string) => ({
      eq: (column: string, value: string) => ({
        order: (column: string, options: any) => Promise.resolve({ 
          data: mockData, 
          error: null 
        })
      })
    })
  })
}

// ACCIÓN AUTOMÁTICA: Implementar mock pattern
```

#### Error Pattern #3: useAuth() Usage
```typescript
// ❌ ERROR DETECTADO EN: Notes useNotesData
const { user } = useAuth()

// ✅ PATRÓN CORRECTO CRM
const mockUser = {
  id: '1',
  company_id: 'company_1',
  role: 'ADMIN' as const
}
const user = mockUser

// ACCIÓN AUTOMÁTICA: Usar mock user
```

#### Error Pattern #4: Missing Exports
```typescript
// ❌ ERROR DETECTADO EN: ThemeCustomizer
// ThemeCustomizerPanel no exportado en index.ts

// ✅ SOLUCIÓN AUTOMÁTICA
export * from "./panel"

// ACCIÓN AUTOMÁTICA: Verificar exports
```

#### Error Pattern #5: App-Specific Sidebars (CRÍTICO)
```typescript
// ❌ ERROR DETECTADO EN: Notes, Calendar
<DashboardLayout>
  <AppSpecificSidebar />  // VIOLA arquitectura universal
  <AppContent />
</DashboardLayout>

// ✅ PATRÓN CORRECTO
<DashboardLayout>  // Contiene ÚNICO sidebar universal
  <div className="space-y-6 p-6">
    <AppHeader />    // Funcionalidades específicas aquí
    <AppContent />
  </div>
</DashboardLayout>

// ACCIÓN AUTOMÁTICA: Eliminar sidebars específicos, mover a headers
```

### **PREVENTION STRATEGIES**

#### Strategy #1: Template Enforcement
```bash
# SIEMPRE usar CRM como template base
TEMPLATE_SOURCE="/apps/dashboard/app/crm-dashboard/"
COPY_STRUCTURE="mantener archivos, adaptar contenido"
FORBIDDEN_CHANGES="layout, data patterns, import patterns"
```

#### Strategy #2: Automated Pattern Detection
```bash
# Commands para detectar violaciones ANTES de build
grep -r "BunduiCompleteLayout" apps/dashboard/app/  # Debe estar vacío
grep -r "from.*supabase.*client" apps/dashboard/app/  # Debe estar vacío  
grep -r "useAuth()" apps/dashboard/app/  # Debe estar vacío
```

#### Strategy #3: Build-Time Validation
```bash
# Integrar en CI/CD
npm run validate:dashboard-patterns  # Custom script
npm run build  # Must pass
npm run type-check  # Must pass
```

## 🚀 Agent Execution Protocol

### **Phase 1: Pre-Implementation Scan**
```typescript
// Auto-ejecutar ANTES de cualquier dashboard work
function preImplementationScan(dashboardPath: string) {
  checkLayoutPattern(dashboardPath)
  checkDataHookPatterns(dashboardPath)  
  checkImportPatterns(dashboardPath)
  checkAuthPatterns(dashboardPath)
  
  if (violationsFound) {
    return "STOP: Fix violations before proceeding"
  }
  return "PROCEED: Patterns valid"
}
```

### **Phase 2: Implementation Enforcement**
```typescript
// Auto-aplicar DURANTE implementación
function enforcePatterns(dashboardName: string) {
  // Force DashboardLayout
  replaceLayoutPattern(dashboardName)
  
  // Force Mock Supabase
  implementMockSupabasePattern(dashboardName)
  
  // Force @/ imports
  convertToAliasImports(dashboardName)
  
  // Force mock auth
  implementMockAuthPattern(dashboardName)
}
```

### **Phase 3: Post-Implementation Validation**
```typescript
// Auto-validar DESPUÉS de implementación
function postImplementationValidation(dashboardName: string) {
  runBuildTest()
  runTypeCheckTest()
  runRuntimeTest()
  validateConsistencyWithCRM()
  
  if (anyTestsFail) {
    return "ROLLBACK: Implementation failed validation"
  }
  return "SUCCESS: Implementation validated"
}
```

## 🎯 Agent Success Metrics

### **Consistency Score**
```bash
Target: 100% pattern consistency across ALL dashboards
Measurement: Automated pattern scanning
Frequency: Every commit
```

### **Error Prevention Rate**
```bash
Target: 0 pattern-related errors in new implementations
Measurement: Build success rate
Frequency: Every dashboard implementation
```

### **Implementation Speed**
```bash
Target: 50% faster dashboard implementation (due to pattern reuse)
Measurement: Time from start to working dashboard
Frequency: Track per dashboard
```

## 🔧 Agent Tools Integration

### **Claude Code Integration**
```typescript
// Auto-suggestion prompts for Claude
const PATTERN_PROMPTS = {
  layoutDetection: "Use DashboardLayout, not BunduiCompleteLayout",
  dataHookDetection: "Use mock Supabase pattern from CRM dashboard",
  importDetection: "Convert relative imports to @/ aliases",
  authDetection: "Use mock user, not useAuth() hook"
}
```

### **VS Code Integration**
```json
// .vscode/settings.json additions
{
  "dashboard.patterns.enforcement": true,
  "dashboard.patterns.autofix": true,
  "dashboard.patterns.validation": "strict"
}
```

## 📚 Knowledge Evolution

### **Learning Cycle**
```bash
1. Error occurs in dashboard
2. Pattern analysis and root cause identification
3. Update this agent with new pattern/prevention
4. Apply fix to ALL existing dashboards
5. Prevent in future implementations
```

### **Pattern Database Updates**
```bash
# Cada error encontrado DEBE resultar en:
1. Actualización de error patterns
2. Actualización de prevention strategies  
3. Actualización de validation commands
4. Testing en TODOS los dashboards existentes
```

## 🎯 Agent Commands

### **Instant Pattern Check**
```bash
# Comando para validación instantánea
./check-dashboard-patterns.sh [dashboard-name]
```

### **Auto-Fix Patterns**
```bash
# Comando para auto-corrección
./fix-dashboard-patterns.sh [dashboard-name]
```

### **Consistency Report**
```bash
# Comando para reporte de consistencia
./generate-consistency-report.sh
```

---

**AGENT ACTIVATION**: Este agente se activa AUTOMÁTICAMENTE en cualquier work relacionado con dashboards. Su conocimiento se actualiza INMEDIATAMENTE cuando se encuentran nuevos patterns o errores.

**EVOLUTION PRINCIPLE**: Cada error es una oportunidad de hacer el sistema más robusto. Nunca permitir que el mismo error ocurra dos veces.