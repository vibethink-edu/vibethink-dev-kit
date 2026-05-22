#!/usr/bin/env node

/**
 * DartAI Integration Script - VThink 1.0
 *
 * Este script integra el proyecto con DartAI para gestión inteligente de proyectos
 * usando el protocolo MCP (Model Context Protocol)
 */

import "dotenv/config";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

interface DartAIConfig {
  apiKey: string;
  projectId: string;
  workspace: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  assignee?: string;
  dueDate?: string;
  tags: string[];
}

class DartAIIntegration {
  private config: DartAIConfig;
  private supabase: any;

  constructor() {
    this.config = this.loadConfig();
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  private loadConfig(): DartAIConfig {
    const configPath = path.join(process.cwd(), ".dartai.config.json");

    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, "utf8"));
    }

    // Configuración por defecto
    const defaultConfig: DartAIConfig = {
      apiKey: process.env.DART_TOKEN || "",
      projectId: "vibethink-orchestrator",
      workspace: "VThink-1.0",
    };

    // Guardar configuración por defecto
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    return defaultConfig;
  }

  /**
   * Crear tarea desde GitHub Issue
   */
  async createTaskFromIssue(issue: any): Promise<Task> {
    const task: Task = {
      id: `task-${Date.now()}`,
      title: issue.title,
      description: issue.body || "",
      status: "TODO",
      priority: this.mapPriority(issue.labels),
      assignee: issue.assignee?.login,
      dueDate: issue.due_on,
      tags: issue.labels?.map((label: any) => label.name) || [],
    };

    // Guardar en Supabase
    await this.supabase.from("tasks").insert({
      ...task,
      source: "github",
      source_id: issue.id,
      created_at: new Date().toISOString(),
    });

    // TODO: log `✅ Tarea creada: ${task.title}`
    return task;
  }

  /**
   * Actualizar estado de tarea
   */
  async updateTaskStatus(taskId: string, status: Task["status"]): Promise<void> {
    await this.supabase
      .from("tasks")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId);

    // TODO: log `✅ Tarea ${taskId} actualizada a: ${status}`
  }

  /**
   * Generar reporte automático
   */
  async generateReport(): Promise<any> {
    const { data: tasks } = await this.supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    const report = {
      total: tasks.length,
      byStatus: {
        TODO: tasks.filter((t: Task) => t.status === "TODO").length,
        IN_PROGRESS: tasks.filter((t: Task) => t.status === "IN_PROGRESS").length,
        REVIEW: tasks.filter((t: Task) => t.status === "REVIEW").length,
        DONE: tasks.filter((t: Task) => t.status === "DONE").length,
      },
      byPriority: {
        CRITICAL: tasks.filter((t: Task) => t.priority === "CRITICAL").length,
        HIGH: tasks.filter((t: Task) => t.priority === "HIGH").length,
        MEDIUM: tasks.filter((t: Task) => t.priority === "MEDIUM").length,
        LOW: tasks.filter((t: Task) => t.priority === "LOW").length,
      },
      recentTasks: tasks.slice(0, 10),
    };

    // TODO: log '📊 Reporte generado:' report
    return report;
  }

  /**
   * Mapear prioridades de GitHub a DartAI
   */
  private mapPriority(labels: any[]): Task["priority"] {
    if (!labels) return "MEDIUM";

    const labelNames = labels.map((l: any) => l.name.toLowerCase());

    if (labelNames.includes("critical") || labelNames.includes("urgent")) {
      return "CRITICAL";
    }
    if (labelNames.includes("high") || labelNames.includes("important")) {
      return "HIGH";
    }
    if (labelNames.includes("low") || labelNames.includes("nice-to-have")) {
      return "LOW";
    }

    return "MEDIUM";
  }

  /**
   * Sincronizar con GitHub Issues
   */
  async syncWithGitHub(): Promise<void> {
    // TODO: log '🔄 Sincronizando con GitHub Issues...'
    // Aquí iría la lógica para obtener issues de GitHub
    // Por ahora es un placeholder
    // TODO: log '✅ Sincronización completada'
  }
}

export { DartAIIntegration };
export type { Task, DartAIConfig };

// --- CLI Entrypoint compatible con ES Modules ---

const args = process.argv.slice(2);

(async () => {
  const integration = new DartAIIntegration();

  if (args.includes("--report")) {
    await integration.generateReport();
    process.exit(0);
  }
  if (args.includes("--setup")) {
    // Aquí podrías agregar lógica de setup si es necesario
    // TODO: log '✅ DartAI Integration setup listo'
    process.exit(0);
  }
  // Por defecto: sincronizar y reportar
  await integration.syncWithGitHub();
  await integration.generateReport();
  // TODO: log '🎉 DartAI Integration completada'
  process.exit(0);
})();
