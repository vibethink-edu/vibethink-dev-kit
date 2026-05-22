# 🤖 Agent: Notes Application Agent

**Especialista en implementación del Notes Application siguiendo patrones exitosos aprendidos**

## 🎯 Agent Mission
Implementar el Notes Application aplicando los patrones exitosos del CRM Dashboard, corrigiendo errores sistemáticos de Supabase imports y structure.

## 📋 Agent Specifications

### **Input Requirements**
```bash
REFERENCE_PATTERN: "/dev-tools/agents/crm-dashboard-agent.md"
ERROR_ANALYSIS: "/dev-tools/agents/DASHBOARD_PATTERNS_LEARNED.md"
TARGET_ROUTE: "/apps/dashboard/app/notes"
LAYOUT_PATTERN: "DashboardLayout"
DATA_PATTERN: "Mock Supabase in hooks (NOT real client)"
IMPORT_PATTERN: "@/ aliases only"
```

### **Output Guaranteed**
```bash
✅ Notes Application completamente funcional
✅ DashboardLayout implementation
✅ Mock Supabase pattern en hooks
✅ Rich text editor funcional
✅ Folder/Label management
✅ Search and filtering
✅ Multi-tenant security mockado
✅ Build sin errores
```

## 🔧 Agent Knowledge Base

### **CRITICAL ERROR IDENTIFIED**
```typescript
// ❌ ERROR COMETIDO: Import real Supabase client
import { supabase } from '@/integrations/supabase/client'

// ✅ SOLUCIÓN: Mock Supabase en hook (patrón CRM)
const supabase = {
  from: (table: string) => ({
    select: (columns: string) => ({
      eq: (column: string, value: string) => ({
        order: (column: string, options: any) => Promise.resolve({ 
          data: mockNotesData, 
          error: null 
        })
      })
    })
  })
}
```

### **PATTERN CORRECTIONS TO APPLY**

#### 1. **Fix Hook Data Pattern**
```typescript
// ARREGLAR: useNotesData.ts
'use client'

import { useState, useEffect, useCallback } from 'react'

// ✅ CORRECTO: Mock Supabase (NO importar cliente real)
const supabase = {
  from: (table: string) => ({
    select: (columns: string) => ({
      eq: (column: string, value: string) => ({
        order: (column: string, options: any) => Promise.resolve({ 
          data: mockNotes, 
          error: null 
        })
      })
    })
  })
}

// ✅ CORRECTO: Mock user (patrón CRM)
const mockUser = {
  id: '1',
  company_id: 'company_1',
  role: 'ADMIN'
}

// Mock notes data
const mockNotes = [
  {
    id: '1',
    title: 'Project Planning Notes',
    content: 'Lorem ipsum dolor sit amet...',
    type: 'text',
    folder_id: 'folder_1',
    labels: ['work', 'planning'],
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
    company_id: 'company_1'
  },
  // ... more mock notes
]

export const useNotesData = () => {
  const [notes, setNotes] = useState(mockNotes)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setNotes(mockNotes)
      setLoading(false)
    }, 1000)
  }, [])

  const createNote = useCallback(async (noteData: any) => {
    // Mock create
    const newNote = { ...noteData, id: Date.now().toString() }
    setNotes(prev => [newNote, ...prev])
    return newNote
  }, [])

  const updateNote = useCallback(async (id: string, updates: any) => {
    // Mock update
    setNotes(prev => prev.map(note => 
      note.id === id ? { ...note, ...updates } : note
    ))
  }, [])

  const deleteNote = useCallback(async (id: string) => {
    // Mock delete
    setNotes(prev => prev.filter(note => note.id !== id))
  }, [])

  return { 
    notes, 
    loading, 
    error, 
    createNote, 
    updateNote, 
    deleteNote 
  }
}
```

#### 2. **Fix Other Hooks Pattern**
```typescript
// ARREGLAR: useNoteFolders.ts
// ARREGLAR: useNoteLabels.ts
// Aplicar el mismo patrón mock a TODOS los hooks de Notes
```

#### 3. **Layout Pattern**
```typescript
// VERIFICAR: page.tsx usa DashboardLayout
import DashboardLayout from '@/shared/components/bundui-premium/components/layout/DashboardLayout'

export default function NotesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <NotesHeader />
        <NotesContent />
      </div>
    </DashboardLayout>
  )
}
```

## 🚀 Agent Execution Plan

### **Step 1: Fix Critical Import Errors**
```bash
# IDENTIFICAR archivos con imports incorrectos
FILES_TO_FIX=(
  "apps/dashboard/app/notes/hooks/useNotesData.ts"
  "apps/dashboard/app/notes/hooks/useNoteFolders.ts" 
  "apps/dashboard/app/notes/hooks/useNoteLabels.ts"
)

# BUSCAR pattern incorrecto
grep -r "from '@/integrations/supabase/client'" apps/dashboard/app/notes/
grep -r "from '@/shared/integrations/supabase/client'" apps/dashboard/app/notes/
```

### **Step 2: Apply Mock Pattern**
```typescript
// TEMPLATE para todos los hooks de Notes
'use client'

import { useState, useEffect } from 'react'

// ✅ Mock Supabase (NO importar cliente real)
const supabase = {
  from: (table: string) => ({
    select: (columns: string) => ({
      eq: (column: string, value: string) => ({
        order: (column: string, options: any) => Promise.resolve({ 
          data: MOCK_DATA_FOR_THIS_HOOK, 
          error: null 
        })
      })
    })
  })
}

// ✅ Mock user
const mockUser = {
  id: '1',
  company_id: 'company_1',
  role: 'ADMIN'
}

export const useHookName = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Mock data loading
  useEffect(() => {
    setTimeout(() => {
      setData(MOCK_DATA_FOR_THIS_HOOK)
      setLoading(false)
    }, 1000)
  }, [])

  return { data, loading, error }
}
```

### **Step 3: Mock Data Structures**
```typescript
// DEFINIR mock data para Notes
const mockNotesData = {
  notes: [
    {
      id: '1',
      title: 'Meeting Notes - Q1 Planning',
      content: '# Q1 Planning Meeting\n\n## Agenda\n- Review Q4 results\n- Set Q1 goals\n- Resource allocation',
      type: 'markdown',
      folder_id: 'work',
      labels: ['meeting', 'planning', 'q1'],
      created_at: '2025-01-15T10:00:00Z',
      updated_at: '2025-01-15T10:30:00Z',
      company_id: 'company_1',
      created_by: '1'
    },
    {
      id: '2', 
      title: 'Project Ideas',
      content: 'List of potential projects for 2025:\n\n- Dashboard improvements\n- Mobile app\n- API enhancements',
      type: 'text',
      folder_id: 'ideas',
      labels: ['projects', 'brainstorm'],
      created_at: '2025-01-10T14:00:00Z',
      updated_at: '2025-01-12T09:15:00Z',
      company_id: 'company_1',
      created_by: '1'
    }
  ],
  folders: [
    {
      id: 'work',
      name: 'Work',
      color: 'hsl(var(--chart-1))',
      parent_id: null,
      company_id: 'company_1'
    },
    {
      id: 'ideas',
      name: 'Ideas',
      color: 'hsl(var(--chart-2))',
      parent_id: null,
      company_id: 'company_1'
    }
  ],
  labels: [
    { id: 'meeting', name: 'Meeting', color: 'hsl(var(--chart-3))' },
    { id: 'planning', name: 'Planning', color: 'hsl(var(--chart-4))' },
    { id: 'projects', name: 'Projects', color: 'hsl(var(--chart-5))' }
  ]
}
```

## 🧪 Agent Testing Protocol

### **Pre-Fix Error Detection**
```bash
# DETECTAR errores específicos de Notes
npm run build 2>&1 | grep "notes.*supabase"
npm run type-check 2>&1 | grep "notes.*integrations"

# Debe fallar con errores de Supabase client
```

### **Post-Fix Validation**
```bash
# VERIFICAR arreglos
✅ npm run build (debe pasar)
✅ npm run type-check (debe pasar)
✅ No imports de cliente real Supabase en Notes
✅ Todos los hooks usan mock pattern
✅ Notes app carga sin errores
```

### **Functional Testing**
```bash
# PROBAR funcionalidad en browser
✅ Notes app loads at /notes
✅ Can create new note (mock)
✅ Can edit note (mock)
✅ Can delete note (mock)
✅ Folder management works (mock)
✅ Label management works (mock)
✅ Search functionality works
```

## 📊 Agent Success Metrics

### **Error Resolution**
- ✅ **0** imports de cliente Supabase real
- ✅ **100%** hooks usando mock pattern
- ✅ **0** errores de build relacionados a Notes
- ✅ **0** errores de TypeScript en Notes

### **Functionality Preserved**
- ✅ **Rich text editor** funcional
- ✅ **Folder management** UI completa
- ✅ **Label system** completamente funcional
- ✅ **Search and filtering** operativo
- ✅ **Responsive design** maintained

### **Pattern Compliance**
- ✅ **Mock Supabase** pattern consistent with CRM
- ✅ **DashboardLayout** usage correct
- ✅ **Company_id filtering** mockado correctamente
- ✅ **Loading states** and error handling preserved

## 🎯 Commands for Execution

```bash
# EJECUTAR arreglos automáticamente
cd apps/dashboard/app/notes/hooks/

# Fix useNotesData.ts
sed -i 's|import { supabase } from.*|// Mock Supabase - see implementation|g' useNotesData.ts

# Fix useNoteFolders.ts  
sed -i 's|import { supabase } from.*|// Mock Supabase - see implementation|g' useNoteFolders.ts

# Fix useNoteLabels.ts
sed -i 's|import { supabase } from.*|// Mock Supabase - see implementation|g' useNoteLabels.ts

# Test the fixes
cd ../../.. && npm run build
```

## 📚 Critical Learning Applied

### **Root Cause Analysis**
- **Problem**: Imported real Supabase client instead of using mock pattern
- **Impact**: Build failures, runtime errors, inconsistent patterns
- **Solution**: Apply same mock pattern used successfully in CRM Dashboard

### **Pattern Consistency**
- **CRM Dashboard**: Uses mock Supabase ✅
- **Sales Dashboard**: Uses mock Supabase ✅ 
- **Notes Application**: Was using real Supabase ❌ → Fixed ✅

### **Prevention Strategy**
- Always reference CRM dashboard before implementing data hooks
- Never import real external clients in dashboard components
- Use consistent mock patterns across all dashboards
- Validate build success after any data layer changes

---

**Meta-Result**: Notes Application corregido siguiendo patrón exitoso de mock Supabase del CRM Dashboard, eliminando errores de build y manteniendo funcionalidad UI completa.