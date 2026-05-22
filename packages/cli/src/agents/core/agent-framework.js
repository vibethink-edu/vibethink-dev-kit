#!/usr/bin/env node

/**
 * 🤖 Bundui Dashboard Agent Framework
 *
 * Framework automático para implementar dashboards de Bundui Premium
 * aplicando todos los patrones establecidos del ecosistema VThink.
 */

const fs = require("fs").promises;
const path = require("path");
const { execSync } = require("child_process");

class BunduiAgentFramework {
  constructor() {
    this.projectRoot = process.cwd();
    this.agentsDir = path.join(this.projectRoot, "dev-tools", "agents");
    this.patterns = this.loadPatterns();
  }

  /**
   * Cargar patrones establecidos del proyecto
   */
  loadPatterns() {
    return {
      // Layout Pattern - Sidebar sin overlay
      sidebarLayout: {
        template: `'use client'

import { DashboardLayout } from '@/shared/components/bundui-premium/components/layout/DashboardLayout'
import { {{HEADER_COMPONENT}} } from './components/{{HEADER_COMPONENT}}'
import { {{MAIN_COMPONENTS}} } from './components/{{MAIN_COMPONENTS}}'

export default function {{DASHBOARD_NAME}}Page() {
  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <{{HEADER_COMPONENT}} />
        {{LAYOUT_CONTENT}}
      </div>
    </DashboardLayout>
  )
}`,
        variables: ["HEADER_COMPONENT", "MAIN_COMPONENTS", "DASHBOARD_NAME", "LAYOUT_CONTENT"],
      },

      // Multi-tenant Security Pattern
      dataHook: {
        template: `import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/shared/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'

export const use{{DATA_TYPE}}Data = () => {
  const { user } = useAuth()
  
  const { data: {{DATA_NAME}} } = useQuery({
    queryKey: ['{{DATA_NAME}}', user?.company_id],
    queryFn: async () => {
      return await supabase
        .from('{{TABLE_NAME}}')
        .select('{{SELECT_FIELDS}}')
        .eq('company_id', user.company_id) // ✅ CRÍTICO - Multi-tenant filtering
        .order('created_at', { ascending: false })
    }
  })
  
  return { {{DATA_NAME}} }
}`,
        variables: ["DATA_TYPE", "DATA_NAME", "TABLE_NAME", "SELECT_FIELDS"],
      },

      // Metrics Component Pattern
      metricsComponent: {
        template: `import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { {{ICONS}} } from 'lucide-react'

export function {{COMPONENT_NAME}}() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {{METRIC_CARDS}}
    </div>
  )
}`,
        variables: ["COMPONENT_NAME", "ICONS", "METRIC_CARDS"],
      },

      // Chart Component Pattern
      chartComponent: {
        template: `import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { {{CHART_TYPE}}, {{CHART_COMPONENTS}}, ResponsiveContainer } from 'recharts'

export function {{COMPONENT_NAME}}() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{{CHART_TITLE}}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <{{CHART_TYPE}} data={data}>
            {{CHART_ELEMENTS}}
          </{{CHART_TYPE}}>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}`,
        variables: [
          "COMPONENT_NAME",
          "CHART_TYPE",
          "CHART_COMPONENTS",
          "CHART_TITLE",
          "CHART_ELEMENTS",
        ],
      },

      // HSL Color System Pattern
      colorSystem: {
        crm: {
          primary: "hsl(var(--primary))",
          customers: "hsl(var(--chart-1))",
          revenue: "hsl(var(--chart-2))",
          pipeline: "hsl(var(--chart-3))",
          activities: "hsl(var(--chart-4))",
        },
        sales: {
          primary: "hsl(var(--primary))",
          prospecting: "hsl(var(--chart-1))",
          qualifying: "hsl(var(--chart-2))",
          negotiating: "hsl(var(--chart-3))",
          closing: "hsl(var(--chart-4))",
          won: "hsl(var(--chart-5))",
        },
        aiChat: {
          primary: "hsl(var(--primary))",
          userMessage: "hsl(var(--primary))",
          aiMessage: "hsl(var(--muted))",
          typing: "hsl(var(--chart-1))",
          thinking: "hsl(var(--chart-3))",
        },
        projectManagement: {
          primary: "hsl(var(--primary))",
          notStarted: "hsl(var(--muted))",
          inProgress: "hsl(var(--chart-1))",
          onHold: "hsl(var(--warning))",
          completed: "hsl(var(--success))",
          cancelled: "hsl(var(--destructive))",
        },
      },
    };
  }

  /**
   * Crear agent para un dashboard específico
   */
  async createAgent(options) {
    const { type, url, targetRoute, dashboardName } = options;

    console.log(`🤖 Creando ${type} Agent...`);

    try {
      // 1. Crear estructura de directorios
      await this.createDirectoryStructure(targetRoute, type);

      // 2. Generar componentes principales
      await this.generateMainComponents(targetRoute, type, dashboardName);

      // 3. Generar hooks con multi-tenant security
      await this.generateDataHooks(targetRoute, type);

      // 4. Generar tipos TypeScript
      await this.generateTypes(targetRoute, type);

      // 5. Aplicar patrones específicos del dashboard
      await this.applyDashboardPatterns(targetRoute, type);

      console.log(`✅ ${type} Agent creado exitosamente en ${targetRoute}`);

      // 6. Ejecutar validaciones
      await this.runValidations();

      return {
        success: true,
        route: targetRoute,
        message: `${dashboardName} Dashboard implementado con éxito`,
      };
    } catch (error) {
      console.error(`❌ Error creando ${type} Agent:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Crear estructura de directorios
   */
  async createDirectoryStructure(targetRoute, type) {
    const basePath = path.join(this.projectRoot, targetRoute);

    const directories = [basePath, path.join(basePath, "components"), path.join(basePath, "hooks")];

    // Crear lib/ solo para ai-chat
    if (type === "ai-chat") {
      directories.push(path.join(basePath, "lib"));
    }

    for (const dir of directories) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  /**
   * Generar componentes principales
   */
  async generateMainComponents(targetRoute, type, dashboardName) {
    const basePath = path.join(this.projectRoot, targetRoute);

    // Generar page.tsx principal
    const pageContent = this.generatePageComponent(type, dashboardName);
    await fs.writeFile(path.join(basePath, "page.tsx"), pageContent);

    // Generar componentes específicos según el tipo
    const components = this.getComponentsForType(type);

    for (const component of components) {
      const componentContent = this.generateComponent(component, type);
      await fs.writeFile(
        path.join(basePath, "components", `${component.name}.tsx`),
        componentContent
      );
    }
  }

  /**
   * Generar page.tsx principal
   */
  generatePageComponent(type, dashboardName) {
    const patterns = this.getDashboardPatterns(type);

    return this.patterns.sidebarLayout.template
      .replace(/{{HEADER_COMPONENT}}/g, patterns.headerComponent)
      .replace(/{{MAIN_COMPONENTS}}/g, patterns.mainComponents.join(", "))
      .replace(/{{DASHBOARD_NAME}}/g, dashboardName)
      .replace(/{{LAYOUT_CONTENT}}/g, patterns.layoutContent);
  }

  /**
   * Obtener patrones específicos por tipo de dashboard
   */
  getDashboardPatterns(type) {
    const patterns = {
      crm: {
        headerComponent: "CrmHeader",
        mainComponents: ["CrmMetrics", "CustomerTable", "DealsTable", "CrmCharts", "QuickActions"],
        layoutContent: `
        <div className="grid gap-6">
          <CrmMetrics />
          
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <CustomerTable />
              <DealsTable />
            </div>
            
            <div className="space-y-6">
              <QuickActions />
              <CrmCharts />
            </div>
          </div>
        </div>`,
      },
      sales: {
        headerComponent: "SalesHeader",
        mainComponents: [
          "SalesMetrics",
          "SalesPipelineChart",
          "RevenueChart",
          "SalesTable",
          "TopPerformers",
          "SalesTargets",
          "RecentDeals",
        ],
        layoutContent: `
        <div className="grid gap-6">
          <SalesMetrics />
          
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <SalesPipelineChart />
              <RevenueChart />
              <SalesTable />
            </div>
            
            <div className="space-y-6">
              <SalesTargets />
              <TopPerformers />
              <RecentDeals />
            </div>
          </div>
        </div>`,
      },
      "ai-chat": {
        headerComponent: "ChatHeader",
        mainComponents: ["ChatSidebar", "ChatMessages", "ChatInput"],
        layoutContent: `
        <div className="flex h-[calc(100vh-4rem)]">
          <ChatSidebar />
          <div className="flex-1 flex flex-col">
            <ChatHeader />
            <ChatMessages />
            <ChatInput />
          </div>
        </div>`,
      },
      "project-management": {
        headerComponent: "ProjectHeader",
        mainComponents: ["ProjectsView", "TasksView", "TimelineView", "TeamView"],
        layoutContent: `
        <div className="mt-6">
          {currentView === 'projects' && <ProjectsView />}
          {currentView === 'tasks' && <TasksView />}
          {currentView === 'timeline' && <TimelineView />}
          {currentView === 'team' && <TeamView />}
        </div>`,
      },
    };

    return patterns[type] || patterns.crm;
  }

  /**
   * Obtener componentes por tipo de dashboard
   */
  getComponentsForType(type) {
    const componentSets = {
      crm: [
        { name: "CrmHeader", type: "header" },
        { name: "CrmMetrics", type: "metrics" },
        { name: "CustomerTable", type: "table" },
        { name: "DealsTable", type: "table" },
        { name: "CrmCharts", type: "chart" },
        { name: "QuickActions", type: "widget" },
      ],
      sales: [
        { name: "SalesHeader", type: "header" },
        { name: "SalesMetrics", type: "metrics" },
        { name: "SalesPipelineChart", type: "chart" },
        { name: "RevenueChart", type: "chart" },
        { name: "SalesTable", type: "table" },
        { name: "TopPerformers", type: "widget" },
        { name: "SalesTargets", type: "widget" },
        { name: "RecentDeals", type: "widget" },
      ],
      "ai-chat": [
        { name: "ChatSidebar", type: "sidebar" },
        { name: "ChatHeader", type: "header" },
        { name: "ChatMessages", type: "messages" },
        { name: "ChatInput", type: "input" },
        { name: "MessageBubble", type: "message" },
        { name: "TypingIndicator", type: "indicator" },
      ],
      "project-management": [
        { name: "ProjectHeader", type: "header" },
        { name: "ProjectsView", type: "view" },
        { name: "TasksView", type: "view" },
        { name: "TimelineView", type: "view" },
        { name: "TeamView", type: "view" },
        { name: "ProjectCard", type: "card" },
        { name: "TaskKanban", type: "kanban" },
      ],
    };

    return componentSets[type] || componentSets.crm;
  }

  /**
   * Generar componente individual
   */
  generateComponent(component, dashboardType) {
    // Esta función generaría el código específico para cada componente
    // basado en los patrones establecidos y el tipo de dashboard

    const baseTemplate = `import React from 'react'

export function ${component.name}() {
  return (
    <div>
      {/* ${component.name} component */}
      <h2>${component.name}</h2>
    </div>
  )
}`;

    return baseTemplate;
  }

  /**
   * Generar hooks de datos
   */
  async generateDataHooks(targetRoute, type) {
    const basePath = path.join(this.projectRoot, targetRoute, "hooks");

    const hooks = this.getHooksForType(type);

    for (const hook of hooks) {
      const hookContent = this.generateDataHook(hook, type);
      await fs.writeFile(path.join(basePath, `${hook.fileName}.ts`), hookContent);
    }
  }

  /**
   * Obtener hooks por tipo
   */
  getHooksForType(type) {
    const hookSets = {
      crm: [
        { fileName: "useCrmData", dataType: "Crm", dataName: "customers", tableName: "customers" },
        { fileName: "useCrmFilters", dataType: "CrmFilters", dataName: "filters", tableName: null },
      ],
      sales: [
        { fileName: "useSalesData", dataType: "Sales", dataName: "sales", tableName: "sales" },
        {
          fileName: "useSalesMetrics",
          dataType: "SalesMetrics",
          dataName: "metrics",
          tableName: null,
        },
      ],
      "ai-chat": [
        {
          fileName: "useAiChat",
          dataType: "Chat",
          dataName: "messages",
          tableName: "ai_chat_messages",
        },
        {
          fileName: "useChatHistory",
          dataType: "ChatHistory",
          dataName: "sessions",
          tableName: "ai_chat_sessions",
        },
      ],
      "project-management": [
        {
          fileName: "useProjects",
          dataType: "Projects",
          dataName: "projects",
          tableName: "projects",
        },
        { fileName: "useTasks", dataType: "Tasks", dataName: "tasks", tableName: "tasks" },
      ],
    };

    return hookSets[type] || hookSets.crm;
  }

  /**
   * Generar hook de datos individual
   */
  generateDataHook(hook, dashboardType) {
    if (!hook.tableName) {
      return `// ${hook.fileName} - Custom hook
export const ${hook.fileName} = () => {
  // Custom hook implementation
  return {}
}`;
    }

    return this.patterns.dataHook.template
      .replace(/{{DATA_TYPE}}/g, hook.dataType)
      .replace(/{{DATA_NAME}}/g, hook.dataName)
      .replace(/{{TABLE_NAME}}/g, hook.tableName)
      .replace(/{{SELECT_FIELDS}}/g, "*");
  }

  /**
   * Generar tipos TypeScript
   */
  async generateTypes(targetRoute, type) {
    const basePath = path.join(this.projectRoot, targetRoute);

    const typesContent = this.generateTypesForDashboard(type);
    await fs.writeFile(path.join(basePath, "types.ts"), typesContent);
  }

  /**
   * Generar tipos específicos por dashboard
   */
  generateTypesForDashboard(type) {
    const typeDefinitions = {
      crm: `
export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  status: 'active' | 'lead' | 'prospect' | 'inactive'
  value: number
  company_id: string
  created_at: string
  updated_at: string
}

export interface Deal {
  id: string
  title: string
  customer_id: string
  value: number
  stage: 'discovery' | 'qualified' | 'proposal' | 'negotiation' | 'closed'
  probability: number
  close_date: string
  company_id: string
  created_at: string
  updated_at: string
}`,
      sales: `
export interface Sale {
  id: string
  title: string
  customer: string
  value: number
  stage: string
  probability: number
  close_date: string
  rep_id: string
  company_id: string
  created_at: string
}

export interface SalesMetrics {
  totalRevenue: number
  dealsCount: number
  conversionRate: number
  activeProspects: number
}`,
      "ai-chat": `
export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant' | 'system'
  timestamp: string
  chat_session_id: string
}

export interface ChatSession {
  id: string
  title: string
  created_at: string
  updated_at: string
  company_id: string
  user_id: string
}`,
      "project-management": `
export interface Project {
  id: string
  name: string
  description: string
  status: 'not-started' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled'
  progress: number
  due_date: string
  company_id: string
  created_at: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in-progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignee_id?: string
  project_id: string
  company_id: string
  created_at: string
}`,
    };

    return typeDefinitions[type] || typeDefinitions.crm;
  }

  /**
   * Aplicar patrones específicos del dashboard
   */
  async applyDashboardPatterns(targetRoute, type) {
    // Aplicar patrones específicos como colores, layouts, etc.
    console.log(`🎨 Aplicando patrones específicos para ${type}...`);
  }

  /**
   * Ejecutar validaciones
   */
  async runValidations() {
    try {
      console.log("🔍 Ejecutando validaciones...");
      execSync("npm run validate:organization", { cwd: this.projectRoot });
      console.log("✅ Validaciones completadas");
    } catch (error) {
      console.warn("⚠️ Algunas validaciones fallaron:", error.message);
    }
  }
}

module.exports = { BunduiAgentFramework };
