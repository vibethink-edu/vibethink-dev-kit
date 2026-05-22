# 🧠 Matriz de Decisión de Stack (Tech Decision Matrix)

**Propósito:** Guiar a la Inteligencia Artificial (y a los developers) para elegir la tecnología correcta según el tipo de problema, y **advertir** sobre elecciones subóptimas.

---

## 🏗️ 1. Matriz de Selección de Arquetipo

| Objetivo del Proyecto | 🟢 **Stack Recomendado (Gold Standard)** | 🔴 **Stack Desaconsejado (Anti-Pattern)** | ⚠️ **Advertencia (Warning)** |
| :--- | :--- | :--- | :--- |
| **Landing Page / Web Corporativa** | **Astro** ó **Next.js (Static Export)** | React (SPA), Vite puro | No usar SPAs para sitios que necesitan SEO estático. |
| **Panel de Control (Admin)** | **Vite + React + Shadcn UI** | Next.js (SSR excesivo), jQuery | Evitar Next.js si es un panel 100% privado (SSR es overhead innecesario). |
| **SaaS Fullstack (App + API)** | **Next.js + Payload CMS** | Express + React separado | No separar repositorios innecesariamente. Usar Monolito Modular. |
| **Agente de Voz (Realtime)** | **Vite + React (AudioWorklet)** | Next.js (Latencia en API routes) | El procesamiento de audio debe ser Client-Side (AudioWorklet), no server-side. |
| **Agente Backend (Lógica Pura)** | **Python (Agno + FastAPI)** | Node.js (Si hay mucha IA pesada) | Node es bueno, pero el ecosistema AI es nativo de Python. |
| **Automatización Rápida** | **n8n (Self-hosted)** | Scripts sueltos de Python | No escribir código para algo que n8n resuelve en 5 clicks. |

---

## 🐍 2. Estándar Python (AI Agents)

Cuando el proyecto es **"Solo Agente"** o **"Backend de IA"**, este es el stack obligatorio:

| Capa | Tecnología | Justificación |
| :--- | :--- | :--- |
| **Runtime** | **Python 3.11+** | Estándar de industria AI. |
| **Package Manager** | **uv** (by Astral) | Reemplaza `pip`, `poetry`, `venv`. Es 10-100x más rápido. |
| **Agent Framework** | **Agno** (ex-Phidata) | Estándar VibeThink para orquestación multi-agente. |
| **Web Server** | **FastAPI** | Solo si se necesita exponer API REST. |
| **Type Safety** | **Pydantic v2** | Validación estricta de datos. Obligatorio. |
| **Testing** | **Pytest** | Estándar de testing. |

**🚨 Warning de IA:** Si detectas un `requirements.txt` con `flask` o `django` para un microservicio de IA, **DETÉNTE** y sugiere migrar a FastAPI/Agno.

---

## 🏗️ 3. Build & Runtime Hazards (The Kill List)

**Combinaciones "Bomba de Tiempo" (Prohibidas):**

| Combinación | Riesgo/Problema | Acción Requerida |
| :--- | :--- | :--- |
| **Node.js Odd Versions** (19.x, 21.x, 23.x) | No son LTS. Soporte termina abruptamente. Bugs no parchados. | **Bloquear CI/CD.** Forzar uso de versiones PARES (18, 20, 22). |
| **Bun + Next.js App Router** | Inestabilidad crítica en `bun install` con dependencias canarias de Next. | Usar `npm` o `pnpm` para Next.js. Dejar Bun para scripts o APIs simples. |
| **Mixed Lockfiles** (`package-lock` + `yarn.lock`) | "It works on my machine" garantizado. Conflictos de árbol de dependencias. | **Borrar UNO.** Definir el manager en `.env`. |
| **Tailwind v4 (Alpha/Beta)** | Breaking changes en compilador CSS. | Usar v3.4 estable hasta release oficial de v4. |
| **Express 5** | Incompatibilidad con ciertos middlewares legacy. | Mantener Express 4.x para estabilidad Enterprise. |

### 🐍 Python Hazards

| Combinación | Riesgo/Problema | Acción Requerida |
| :--- | :--- | :--- |
| **Global `pip install`** | Rompe dependencias del sistema operativo (Linux/Mac). |  **PROHIBIDO.** Usar siempre `uv`, `venv` o `poetry`. |
| **Mixed Conda + Pip** | Corrupción binaria de librerías (C++ bindings). | Elegir UNO. Recomendación: `uv` puro (sin Conda). |
| **`requirements.txt` sin pin** (`pandas`) | Builds irreproducibles. | Usar `pandas==2.2.0` o mejor: `uv.lock`. |
| **Python 3.13 (Bleeding Edge)** | Incompatibilidad con Torch/Tensorflow. | Mantenerse en 3.11 o 3.12 hasta que el ecosistema AI alcance. |

### 🔷 C# / .NET Hazards

| Combinación | Riesgo/Problema | Acción Requerida |
| :--- | :--- | :--- |
| **.NET Framework 4.x** | Legacy, Windows-only, sin soporte Cross-Platform. | **MIGRAR** a .NET 8.0+ (Core). |
| **Local DLL References** | "It works on my machine". | Empaquetar en NuGet privado (Azure Artifacts / GitHub Packages). |
| **`Newtonsoft.Json`** | Lento, alto consumo de memoria. | Preferir `System.Text.Json` (Nativo y mas rápido) en proyectos nuevos. |
| **EF Core Tracking Queries** (en Read-Only) | Memory Leaks en dashboards de alto tráfico. | Usar `.AsNoTracking()` por defecto en consultas de lectura. |

---

## 🌐 4. Estándar Web (Frontend)

| Capa | Tecnología | Justificación |
| :--- | :--- | :--- |
| **Framework** | **React 19** | Estándar global. |
| **Build Tool** | **Vite 6** | Rápido, ligero, estándar moderno. |
| **Styling** | **Tailwind CSS v4** | Utility-first. Cuidado con breaking changes de v4. |
| **Components** | **Shadcn/ui** | Copypasteable, accesible, personalizable. |
| **State** | **Zustand** | Redux es overkill. Context es lento. Zustand es el balance. |
| **Data Fetching** | **TanStack Query** | Manejo de caché y estado asíncrono. |

**🚨 Warning de IA:** Si ves `Bootstrap`, `Material UI` (viejo) o `Create-React-App`, **ALERTA ROJA**. Es deuda técnica inmediata.

---

## 4. Protocolo de "Advertencia Temprana"

Si un Agente detecta una desviación de esta matriz, debe emitir el siguiente mensaje:

> "⚠️ **ALERTA DE ARQUITECTURA:**
> Estás intentando usar **[Tecnología X]** para **[Propósito Y]**.
> VibeThink Standard recomienda **[Tecnología Z]** por razones de **[Performance/Mantenibilidad]**.
> ¿Deseas proceder bajo tu propio riesgo o refactorizar al estándar?"
