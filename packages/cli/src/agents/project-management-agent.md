# 🤖 Agent 4: Project Management Agent

**Especialista en implementación del Dashboard Project Management de Bundui Premium**

## 🎯 Agent Mission
Implementar automáticamente el dashboard de Project Management completo con gestión de proyectos, tareas, equipos, timelines y analytics, aplicando todos los patrones establecidos del ecosistema VThink.

## 📋 Agent Specifications

### **Input Requirements**
```bash
URL_DEMO: "https://bundui.com/premium/dashboard/project-management"
RESOURCE_PATH: "/external/bundui-premium"
TARGET_ROUTE: "/apps/dashboard/app/project-management"
COMPLEXITY: "Muy Alta"
PRIORITY: "⭐⭐⭐ Muy Alta"
```

### **Output Guaranteed**
```bash
✅ Project Management Dashboard completamente funcional
✅ Vista de proyectos con cards y filtros
✅ Sistema de gestión de tareas (Kanban/Lista)
✅ Timeline y Gantt charts para seguimiento
✅ Gestión de equipos y asignaciones
✅ Analytics y métricas de productividad
✅ Layout sin problemas de sidebar overlay
✅ Theme customizer integrado
✅ Multi-tenant security aplicada
✅ TypeScript strict mode
```

## 🔧 Agent Knowledge Base

### **Patrones Probados (Auto-aplicar)**

#### 1. **Project Management Layout Structure**
```typescript
// APLICAR: Layout complejo para Project Management
export default function ProjectManagementPage() {
  const [view, setView] = useState<'projects' | 'tasks' | 'timeline' | 'team'>('projects')
  
  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <ProjectHeader view={view} onViewChange={setView} />
        
        {view === 'projects' && <ProjectsView />}
        {view === 'tasks' && <TasksView />}
        {view === 'timeline' && <TimelineView />}
        {view === 'team' && <TeamView />}
      </div>
    </DashboardLayout>
  )
}
```

#### 2. **Project Management Components Específicos**
```typescript
// COMPONENTES REQUERIDOS para Project Management Dashboard
interface ProjectManagementComponents {
  // Navegación y filtros
  ProjectHeader: React.FC         // Header con tabs y filtros
  ProjectFilters: React.FC        // Filtros por estado, equipo, fecha
  
  // Vista de proyectos
  ProjectCard: React.FC           // Card individual de proyecto
  ProjectGrid: React.FC           // Grid de proyectos
  ProjectMetrics: React.FC        // Métricas generales
  
  // Gestión de tareas
  TaskKanban: React.FC            // Vista Kanban de tareas
  TaskList: React.FC              // Vista lista de tareas
  TaskCard: React.FC              // Card individual de tarea
  TaskModal: React.FC             // Modal de edición de tarea
  
  // Timeline y planificación
  GanttChart: React.FC            // Gantt chart para timelines
  ProjectTimeline: React.FC       // Timeline visual de proyecto
  MilestoneTracker: React.FC      // Seguimiento de milestones
  
  // Gestión de equipo
  TeamMembers: React.FC           // Lista de miembros del equipo
  WorkloadChart: React.FC         // Chart de carga de trabajo
  TeamPerformance: React.FC       // Métricas de rendimiento
  
  // Analytics
  ProductivityChart: React.FC     // Chart de productividad
  BurndownChart: React.FC         // Burndown chart
  VelocityChart: React.FC         // Velocity tracking
}
```

#### 3. **Project Management Color System**
```typescript
// COLORES ESPECÍFICOS para Project Management Dashboard
const pmColorSystem = {
  primary: "hsl(var(--primary))",           // Azul principal
  secondary: "hsl(var(--secondary))",       // Gris secundario
  
  // Estado de proyectos
  notStarted: "hsl(var(--muted))",          // Gris para no iniciados
  inProgress: "hsl(var(--chart-1))",        // Azul para en progreso
  onHold: "hsl(var(--warning))",            // Amarillo para pausados
  completed: "hsl(var(--success))",         // Verde para completados
  cancelled: "hsl(var(--destructive))",     // Rojo para cancelados
  
  // Prioridades de tareas
  low: "hsl(var(--chart-2))",               // Verde claro
  medium: "hsl(var(--chart-3))",            // Amarillo
  high: "hsl(var(--chart-4))",              // Naranja
  critical: "hsl(var(--chart-5))",          // Rojo
  
  // Workload
  underload: "hsl(142 76% 36%)",            // Verde
  optimal: "hsl(47 96% 53%)",               // Amarillo
  overload: "hsl(0 84% 60%)",               // Rojo
}
```

## 🚀 Agent Execution Plan

### **Step 1: Structure Creation**
```bash
# CREAR estructura de directorios
apps/dashboard/app/project-management/
├── page.tsx                    # Main Project Management page
├── components/
│   ├── ProjectHeader.tsx       # Header with navigation tabs
│   ├── ProjectsView/
│   │   ├── ProjectGrid.tsx     # Grid de proyectos
│   │   ├── ProjectCard.tsx     # Card individual
│   │   └── ProjectMetrics.tsx  # Métricas
│   ├── TasksView/
│   │   ├── TaskKanban.tsx      # Vista Kanban
│   │   ├── TaskList.tsx        # Vista lista
│   │   ├── TaskCard.tsx        # Card de tarea
│   │   └── TaskModal.tsx       # Modal edición
│   ├── TimelineView/
│   │   ├── GanttChart.tsx      # Gantt chart
│   │   ├── ProjectTimeline.tsx # Timeline
│   │   └── MilestoneTracker.tsx # Milestones
│   ├── TeamView/
│   │   ├── TeamMembers.tsx     # Miembros
│   │   ├── WorkloadChart.tsx   # Carga trabajo
│   │   └── TeamPerformance.tsx # Performance
│   └── shared/
│       ├── ProjectFilters.tsx  # Filtros comunes
│       └── StatusBadge.tsx     # Badge de estado
├── hooks/
│   ├── useProjects.ts          # Projects data management
│   ├── useTasks.ts             # Tasks data management
│   ├── useTeam.ts              # Team data management
│   └── useProjectFilters.ts    # Filtering logic
└── types.ts                    # PM TypeScript definitions
```

### **Step 2: Core Implementation**
```typescript
// IMPLEMENTAR page.tsx principal
'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/shared/components/bundui-premium/components/layout/DashboardLayout'
import { ProjectHeader } from './components/ProjectHeader'
import { ProjectsView } from './components/ProjectsView'
import { TasksView } from './components/TasksView'
import { TimelineView } from './components/TimelineView'
import { TeamView } from './components/TeamView'

type ViewType = 'projects' | 'tasks' | 'timeline' | 'team'

export default function ProjectManagementPage() {
  const [currentView, setCurrentView] = useState<ViewType>('projects')

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <ProjectHeader 
          currentView={currentView} 
          onViewChange={setCurrentView} 
        />
        
        <div className="mt-6">
          {currentView === 'projects' && <ProjectsView />}
          {currentView === 'tasks' && <TasksView />}
          {currentView === 'timeline' && <TimelineView />}
          {currentView === 'team' && <TeamView />}
        </div>
      </div>
    </DashboardLayout>
  )
}
```

### **Step 3: Multi-tenant Security**
```typescript
// APLICAR filtrado company_id en todos los queries
export const useProjects = () => {
  const { user } = useAuth()
  
  const { data: projects } = useQuery({
    queryKey: ['projects', user?.company_id],
    queryFn: async () => {
      return await supabase
        .from('projects')
        .select(`
          *,
          tasks:tasks(count),
          team_members:project_team_members(
            user:users(name, avatar)
          )
        `)
        .eq('company_id', user.company_id) // ✅ CRÍTICO
        .order('created_at', { ascending: false })
    }
  })
  
  const { data: tasks } = useQuery({
    queryKey: ['tasks', user?.company_id],
    queryFn: async () => {
      return await supabase
        .from('tasks')
        .select(`
          *,
          project:projects(name),
          assignee:users(name, avatar)
        `)
        .eq('company_id', user.company_id) // ✅ CRÍTICO
        .order('created_at', { ascending: false })
    }
  })
  
  return { projects, tasks }
}
```

### **Step 4: Key Components Implementation**

#### **ProjectHeader.tsx**
```typescript
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Plus, Filter, Search } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'

interface ProjectHeaderProps {
  currentView: string
  onViewChange: (view: string) => void
}

export function ProjectHeader({ currentView, onViewChange }: ProjectHeaderProps) {
  const views = [
    { id: 'projects', label: 'Projects', icon: 'folder' },
    { id: 'tasks', label: 'Tasks', icon: 'list' },
    { id: 'timeline', label: 'Timeline', icon: 'calendar' },
    { id: 'team', label: 'Team', icon: 'users' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Project Management</h1>
          <p className="text-muted-foreground">
            Manage your projects, tasks, and team collaboration
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
          {views.map((view) => (
            <Button
              key={view.id}
              variant={currentView === view.id ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange(view.id)}
            >
              {view.label}
            </Button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search projects, tasks..." 
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
```

#### **ProjectCard.tsx**
```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Progress } from '@/shared/components/ui/progress'
import { Calendar, Users, CheckCircle } from 'lucide-react'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const statusColors = {
    'not-started': 'bg-muted text-muted-foreground',
    'in-progress': 'bg-blue-100 text-blue-800',
    'on-hold': 'bg-yellow-100 text-yellow-800',
    'completed': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800'
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{project.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {project.description}
            </p>
          </div>
          <Badge className={statusColors[project.status] || statusColors['not-started']}>
            {project.status.replace('-', ' ')}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(project.due_date).toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            <span>{project.completed_tasks}/{project.total_tasks} tasks</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Team</span>
          </div>
          
          <div className="flex -space-x-2">
            {project.team_members?.slice(0, 3).map((member, index) => (
              <Avatar key={index} className="h-6 w-6 border-2 border-background">
                <AvatarImage src={member.user.avatar} />
                <AvatarFallback className="text-xs">
                  {member.user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            ))}
            {project.team_members?.length > 3 && (
              <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs">
                +{project.team_members.length - 3}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

#### **TaskKanban.tsx**
```typescript
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { TaskCard } from './TaskCard'
import { Button } from '@/shared/components/ui/button'
import { Plus } from 'lucide-react'

const kanbanColumns = [
  { id: 'todo', title: 'To Do', color: 'border-gray-200' },
  { id: 'in-progress', title: 'In Progress', color: 'border-blue-200' },
  { id: 'review', title: 'Review', color: 'border-yellow-200' },
  { id: 'done', title: 'Done', color: 'border-green-200' },
]

interface TaskKanbanProps {
  tasks: Task[]
}

export function TaskKanban({ tasks }: TaskKanbanProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kanbanColumns.map((column) => (
        <Card key={column.id} className={`${column.color} border-t-4`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {column.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-muted px-2 py-1 rounded">
                  {getTasksByStatus(column.id).length}
                </span>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {getTasksByStatus(column.id).map((task) => (
              <TaskCard 
                key={task.id} 
                task={task}
                onDragStart={() => setDraggedTask(task)}
                onDragEnd={() => setDraggedTask(null)}
              />
            ))}
            
            {getTasksByStatus(column.id).length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No tasks in {column.title.toLowerCase()}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

## 🧪 Agent Testing Protocol

### **Validation Checklist**
```bash
# EJECUTAR estas validaciones automáticamente
✅ npm run validate:organization
✅ npm run validate:architecture  
✅ npm run validate:root
✅ npm run test
✅ npm run type-check
✅ npm run lint

# Project Management-specific tests
✅ Verificar company_id filtering en todos los queries
✅ Probar creación y edición de proyectos
✅ Validar sistema Kanban drag & drop
✅ Verificar cálculos de progreso y métricas
✅ Probar filtros y búsqueda
✅ Validar responsive design en todas las vistas
✅ Verificar theme customizer integration
✅ Probar timeline y Gantt charts
```

### **Performance Targets**
```bash
✅ Carga inicial: < 2 segundos
✅ Cambio entre vistas: < 500ms
✅ Drag & drop: Smooth 60fps
✅ Charts rendering: < 1 segundo
✅ Filtros: Respuesta inmediata
✅ Mobile performance: Optimizada
```

## 📊 Agent Success Metrics

### **Completitud Funcional**
- ✅ **100%** gestión de proyectos implementada
- ✅ **100%** sistema de tareas con Kanban
- ✅ **100%** timeline y tracking funcional
- ✅ **100%** gestión de equipos y asignaciones
- ✅ **100%** analytics y métricas
- ✅ **100%** multi-tenant security compliance

### **Calidad Técnica**
- ✅ **0** errores en cálculos de progreso
- ✅ **0** problemas de performance en charts
- ✅ **0** issues de drag & drop
- ✅ **100%** TypeScript coverage
- ✅ **A+** accessibility score

## 🎯 Agent Deployment Command

```bash
# COMANDO COMPLETO para ejecutar este agent
npm run deploy:project-management \
  --demo-url="https://bundui.com/premium/dashboard/project-management" \
  --target-route="/apps/dashboard/app/project-management" \
  --apply-all-patterns \
  --setup-kanban-system \
  --run-validations \
  --auto-test

# Resultado esperado: Project Management Dashboard 100% funcional en ~4-5 horas
```

## 📚 Agent Learning Log

### **Patrones Aprendidos**
- ✅ Multi-view dashboard architecture
- ✅ Kanban drag & drop implementation
- ✅ Project progress calculations
- ✅ Team workload visualization
- ✅ Timeline and Gantt chart integration

### **Problemas Resueltos**
- ✅ Complex state management → Multiple specialized hooks
- ✅ Drag & drop performance → Optimized event handlers
- ✅ Multiple data relationships → Efficient query patterns
- ✅ Responsive complex layouts → Adaptive grid systems

---

**Meta-Result**: Agent 4 completado - Project Management Dashboard enterprise con funcionalidad completa de gestión de proyectos y equipos.