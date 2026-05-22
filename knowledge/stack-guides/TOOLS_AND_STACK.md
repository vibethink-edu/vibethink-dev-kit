# 🛠️ TOOLS AND STACK - Herramientas y Componentes

**Versión:** 1.0.0  
**Última actualización:** 2025-12-12  
**Basado en:** Cole Medin, Rob (Switch Dimension), Ray Fernando

---

## 🎯 Propósito

Esta guía consolida las **mejores herramientas y componentes** para desarrollo de aplicaciones con IA, organizadas por categoría y tipo de licencia.

**Filosofía:**
- ✅ Priorizar Open Source
- ✅ Self-hosting cuando sea posible
- ✅ Evitar vendor lock-in
- ⚠️ Herramientas comerciales solo como aceleradores opcionales

---

## 📊 Categorías

1. [Frameworks de IA](#frameworks-de-ia)
2. [Editores y Desarrollo](#editores-y-desarrollo)
3. [RAG y Datos](#rag-y-datos)
4. [Testing y QA](#testing-y-qa)
5. [Infraestructura](#infraestructura)
6. [UI/UX](#uiux)
7. [Automatización](#automatización)

---

## 🤖 Frameworks de IA

### **✅ Open Source (Gratis)**

#### **Pydantic AI**
- **Licencia:** MIT
- **Propósito:** Framework de agentes con validación de tipos
- **Cuándo usar:** Python + type safety
- **Alternativa a:** LangChain (más simple)

#### **LangGraph**
- **Licencia:** MIT
- **Propósito:** Orquestación de agentes con grafos
- **Cuándo usar:** Workflows complejos de agentes
- **Alternativa a:** Custom orchestration

#### **LangChain**
- **Licencia:** MIT
- **Propósito:** Framework completo de LLM
- **Cuándo usar:** Proyectos grandes con muchas integraciones
- **Nota:** Puede ser complejo para proyectos simples

---

### **💰 Comerciales**

#### **Claude Code (Anthropic)**
- **Tipo:** Propietario
- **Propósito:** Editor con IA integrada
- **Cuándo usar:** Desarrollo con worktrees automáticos
- **Costo:** Por tokens
- **Alternativa OSS:** Cursor + Claude API

---

## 💻 Editores y Desarrollo

### **✅ Open Source / Gratis**

#### **VS Code**
- **Licencia:** MIT
- **Propósito:** Editor base
- **Extensiones recomendadas:**
  - GitHub Copilot (comercial)
  - ESLint
  - Prettier

#### **Cursor**
- **Tipo:** Freemium
- **Propósito:** VS Code fork con IA nativa
- **Cuándo usar:** Desarrollo con IA intensivo
- **Costo:** $20/mes (Pro)

---

### **🔧 Herramientas de Desarrollo**

#### **FastAPI**
- **Licencia:** MIT
- **Propósito:** Framework web Python
- **Cuándo usar:** APIs rápidas con validación

#### **Express.js**
- **Licencia:** MIT
- **Propósito:** Framework web Node.js
- **Cuándo usar:** APIs JavaScript/TypeScript
- **Nota:** Usar Express 4 (no 5) para estabilidad

#### **Vite**
- **Licencia:** MIT
- **Propósito:** Build tool
- **Cuándo usar:** React, Vue, Svelte
- **Alternativa a:** Webpack (más rápido)

---

## 📚 RAG y Datos

### **✅ Open Source (Gratis)**

#### **PostgreSQL + pgvector**
- **Licencia:** PostgreSQL License (OSS)
- **Propósito:** Base de datos con vectores
- **Cuándo usar:** RAG, embeddings
- **Alternativa a:** Pinecone, Weaviate (comerciales)

**Setup:**
```sql
CREATE EXTENSION vector;
CREATE TABLE embeddings (
  id SERIAL PRIMARY KEY,
  content TEXT,
  embedding vector(1536)
);
```

---

#### **Crawl4AI**
- **Licencia:** MIT
- **Propósito:** Web scraping para IA
- **Cuándo usar:** Extraer contenido de sitios web
- **Alternativa a:** Firecrawl (comercial)

#### **Docling**
- **Licencia:** Apache 2.0
- **Propósito:** Parser de documentos (PDF, Word, etc.)
- **Cuándo usar:** RAG con documentos
- **Alternativa a:** Unstructured.io (comercial)

#### **Ragas**
- **Licencia:** Apache 2.0
- **Propósito:** Evaluación de RAG
- **Cuándo usar:** Medir calidad de respuestas
- **Métricas:** Faithfulness, relevance, context recall

---

### **🧠 Memoria y Grafos**

#### **Mem0**
- **Licencia:** Apache 2.0
- **Propósito:** Memoria a largo plazo para agentes
- **Cuándo usar:** Agentes que recuerdan conversaciones
- **Alternativa a:** Custom memory management

#### **Graphiti**
- **Licencia:** MIT
- **Propósito:** Grafos de conocimiento
- **Cuándo usar:** Relaciones complejas entre entidades
- **Alternativa a:** Neo4j Enterprise

#### **Neo4j Community**
- **Licencia:** GPL (Community Edition)
- **Propósito:** Base de datos de grafos
- **Cuándo usar:** Grafos grandes y complejos
- **Nota:** Enterprise es comercial

---

## 🧪 Testing y QA

### **✅ Open Source (Gratis)**

#### **Playwright**
- **Licencia:** Apache 2.0
- **Propósito:** Automatización de navegador
- **Cuándo usar:** E2E testing, scraping
- **Alternativa a:** Selenium (más moderno)

**Ejemplo:**
```typescript
import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example/);
});
```

---

#### **Pytest (Python)**
- **Licencia:** MIT
- **Propósito:** Testing framework
- **Cuándo usar:** Tests de Python

#### **Jest (JavaScript)**
- **Licencia:** MIT
- **Propósito:** Testing framework
- **Cuándo usar:** Tests de React/Node.js

---

### **💰 Comerciales**

#### **CodeRabbit**
- **Tipo:** Freemium
- **Propósito:** Code review con IA
- **Cuándo usar:** PRs automáticos
- **Costo:** Gratis para OSS público

---

## 🏗️ Infraestructura

### **⚠️ Self-Hostable (Gratis si lo alojas)**

#### **Supabase**
- **Licencia:** Apache 2.0
- **Propósito:** Backend as a Service (Firebase OSS)
- **Cuándo usar:** Auth, DB, Storage
- **Opciones:**
  - Cloud: Tier gratuito generoso
  - Self-hosted: Docker compose

**Docker Compose:**
```yaml
services:
  supabase:
    image: supabase/postgres
    environment:
      POSTGRES_PASSWORD: your-password
    ports:
      - "5432:5432"
```

---

#### **LangFuse**
- **Licencia:** MIT
- **Propósito:** Observabilidad de LLM
- **Cuándo usar:** Debugging, analytics
- **Opciones:**
  - Cloud: Tier gratuito
  - Self-hosted: Docker

**Beneficios:**
- Tracing de llamadas a LLM
- Costos por request
- Latencia y errores

---

#### **n8n**
- **Licencia:** Fair Code (Sustainable Use)
- **Propósito:** Automatización de workflows
- **Cuándo usar:** Prototipado rápido, integraciones
- **Opciones:**
  - Cloud: $20/mes
  - Self-hosted: Gratis para uso interno

**Restricción:** No vender servicios basados en n8n self-hosted

---

### **💰 Comerciales**

#### **Browserbase**
- **Tipo:** Propietario
- **Propósito:** Navegadores en la nube
- **Cuándo usar:** Scraping sin ser detectado
- **Alternativa OSS:** Playwright + Proxies

#### **Arcade**
- **Tipo:** Propietario
- **Propósito:** OAuth para agentes
- **Cuándo usar:** Autenticación de agentes
- **Alternativa OSS:** Custom OAuth flow

---

## 🎨 UI/UX

### **✅ Open Source (Gratis)**

#### **React**
- **Licencia:** MIT
- **Propósito:** UI library
- **Cuándo usar:** SPAs, componentes

#### **Tailwind CSS**
- **Licencia:** MIT
- **Propósito:** Utility-first CSS
- **Cuándo usar:** Styling rápido
- **Alternativa a:** Bootstrap, Material UI

#### **Shadcn UI**
- **Licencia:** MIT
- **Propósito:** Componentes React
- **Cuándo usar:** UI moderna y accesible
- **Nota:** Copy-paste (no npm install)

---

### **💰 Comerciales**

#### **Lovable**
- **Tipo:** Propietario
- **Propósito:** UI builder con IA
- **Cuándo usar:** Prototipado rápido de UI
- **Alternativa OSS:** v0.dev (Vercel - freemium)

---

## 🤖 Automatización

### **✅ Open Source (Gratis)**

#### **n8n** (Ver Infraestructura)

#### **Zapier Alternative: Activepieces**
- **Licencia:** MIT
- **Propósito:** Automatización de workflows
- **Cuándo usar:** Alternativa OSS a Zapier
- **Self-hosted:** Sí

---

## 🧠 Modelos Locales (Self-Hosting)

### **✅ Open Source (Gratis)**

#### **Ollama**
- **Licencia:** MIT
- **Propósito:** Correr LLMs localmente
- **Cuándo usar:** Privacidad, desarrollo offline
- **Modelos:** Llama, Mistral, Gemma

**Instalación:**
```bash
# Windows
winget install Ollama.Ollama

# Uso
ollama run llama2
```

---

#### **Open WebUI**
- **Licencia:** MIT
- **Propósito:** Interfaz tipo ChatGPT local
- **Cuándo usar:** UI para Ollama
- **Features:** Chat, RAG, plugins

---

#### **SearXNG**
- **Licencia:** AGPL
- **Propósito:** Buscador web privado
- **Cuándo usar:** Búsquedas sin tracking
- **Self-hosted:** Sí

---

## 📦 Stack Recomendado por Proyecto

### **Voice Agent (Actual)**

**Frontend:**
- ✅ React 19
- ✅ Vite 6
- ✅ Tailwind CSS
- ✅ TypeScript

**Backend:**
- ✅ Express 4
- ✅ Node.js

**IA:**
- ✅ Gemini (Google)
- ✅ ElevenLabs (TTS)
- ✅ Cartesia (TTS)

**Infraestructura:**
- ✅ DigitalOcean
- ✅ PM2

---

### **Next.js + Supabase (Orchestrator)**

**Frontend:**
- ✅ Next.js 15
- ✅ React 19
- ✅ Tailwind CSS
- ✅ Shadcn UI

**Backend:**
- ✅ Supabase (Auth, DB, Storage)
- ✅ Zustand (State)
- ✅ Zod (Validation)

**IA:**
- ⚠️ Por definir

---

### **PayloadCMS (Ovi Portal)**

**Frontend:**
- ✅ Next.js
- ✅ React
- ✅ Tailwind CSS

**Backend:**
- ✅ PayloadCMS
- ✅ MongoDB

**SEO:**
- ✅ Next.js SEO
- ✅ Sitemap generation

---

## 🐳 Docker Compose Template

**Para desarrollo local con herramientas self-hosted:**

```yaml
version: '3.8'

services:
  # PostgreSQL con pgvector
  postgres:
    image: ankane/pgvector
    environment:
      POSTGRES_PASSWORD: dev-password
      POSTGRES_DB: dev-db
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data

  # n8n (Automatización)
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=admin
    volumes:
      - n8n-data:/home/node/.n8n

  # LangFuse (Observabilidad)
  langfuse:
    image: langfuse/langfuse
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:dev-password@postgres:5432/langfuse
    depends_on:
      - postgres

  # Ollama (LLMs locales)
  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama-data:/root/.ollama

  # Open WebUI (Interfaz para Ollama)
  open-webui:
    image: ghcr.io/open-webui/open-webui
    ports:
      - "8080:8080"
    environment:
      - OLLAMA_API_BASE_URL=http://ollama:11434
    depends_on:
      - ollama

volumes:
  postgres-data:
  n8n-data:
  ollama-data:
```

**Uso:**
```bash
# Iniciar todo
docker-compose up -d

# Acceder:
# - n8n: http://localhost:5678
# - LangFuse: http://localhost:3000
# - Open WebUI: http://localhost:8080
# - PostgreSQL: localhost:5432
```

---

## 💡 Recomendaciones por Caso de Uso

### **Prototipado Rápido**
- ✅ n8n (workflows)
- ✅ Supabase (backend)
- ✅ Shadcn UI (componentes)
- ✅ Cursor (desarrollo)

### **Producción Escalable**
- ✅ PostgreSQL + pgvector (datos)
- ✅ FastAPI o Express (backend)
- ✅ React + Vite (frontend)
- ✅ LangFuse (observabilidad)

### **Desarrollo Privado/Offline**
- ✅ Ollama (LLMs locales)
- ✅ Open WebUI (interfaz)
- ✅ SearXNG (búsquedas)
- ✅ Self-hosted Supabase

### **Agentes Complejos**
- ✅ LangGraph (orquestación)
- ✅ Mem0 (memoria)
- ✅ Graphiti (grafos)
- ✅ LangFuse (debugging)

---

## 🚫 Evitar (Vendor Lock-in)

**Herramientas que generan dependencia:**
- ❌ Firebase (usar Supabase)
- ❌ AWS Proprietary Services (usar OSS)
- ❌ Pinecone (usar pgvector)
- ❌ MongoDB Atlas (usar PostgreSQL)

**Excepciones válidas:**
- ✅ GitHub (estándar de facto)
- ✅ Vercel (excelente DX para Next.js)
- ✅ DigitalOcean (simple y predecible)

---

## 🔍 Por Evaluar (Pendientes)

**Herramientas que queremos probar y documentar cuando las necesitemos.**

---

### **🎨 UI/UX Frameworks**

#### **Refine.dev** ⭐ Prioridad Alta
- **Tipo:** Open Source (MIT)
- **Propósito:** Framework para admin panels y dashboards
- **Por qué evaluar:** 
  - Alternativa a crear admin panels desde cero
  - Integración con múltiples backends (Supabase, REST, GraphQL)
  - Componentes pre-built
  - Generación de CRUD automática
- **Cuándo evaluar:** Cuando necesites admin panel o dashboard
- **URL:** https://refine.dev
- **Estado:** ⏳ Pendiente de evaluación

#### **Astro**
- **Tipo:** Open Source (MIT)
- **Propósito:** Framework para sitios de contenido
- **Por qué evaluar:** 
  - Excelente para blogs, docs, marketing sites
  - Muy rápido (ship less JavaScript)
  - Integración con React, Vue, Svelte
- **Cuándo evaluar:** Proyecto de contenido o blog
- **URL:** https://astro.build
- **Estado:** ⏳ Pendiente

#### **Qwik**
- **Tipo:** Open Source (MIT)
- **Propósito:** Framework ultra-rápido
- **Por qué evaluar:** 
  - Resumability (no hydration)
  - Performance extremo
  - Alternativa a React/Next.js
- **Cuándo evaluar:** Proyecto que requiera máxima performance
- **URL:** https://qwik.builder.io
- **Estado:** ⏳ Pendiente

---

### **🔧 Backend & APIs**

#### **tRPC**
- **Tipo:** Open Source (MIT)
- **Propósito:** Type-safe APIs sin código
- **Por qué evaluar:** 
  - End-to-end type safety
  - No necesitas definir schemas
  - Excelente DX con TypeScript
- **Cuándo evaluar:** Proyecto fullstack TypeScript
- **URL:** https://trpc.io
- **Estado:** ⏳ Pendiente

#### **Drizzle ORM**
- **Tipo:** Open Source (Apache 2.0)
- **Propósito:** TypeScript ORM
- **Por qué evaluar:** 
  - Type-safe queries
  - Mejor performance que Prisma
  - SQL-like syntax
- **Cuándo evaluar:** Proyecto con PostgreSQL
- **URL:** https://orm.drizzle.team
- **Estado:** ⏳ Pendiente

---

### **🤖 IA & Agentes**

#### **AutoGen (Microsoft)**
- **Tipo:** Open Source (MIT)
- **Propósito:** Framework de multi-agentes
- **Por qué evaluar:** 
  - Conversaciones entre agentes
  - Respaldo de Microsoft
  - Casos de uso complejos
- **Cuándo evaluar:** Sistema multi-agente
- **URL:** https://microsoft.github.io/autogen
- **Estado:** ⏳ Pendiente

#### **CrewAI**
- **Tipo:** Open Source (MIT)
- **Propósito:** Orquestación de agentes
- **Por qué evaluar:** 
  - Roles y tareas definidas
  - Colaboración entre agentes
  - Alternativa a LangGraph
- **Cuándo evaluar:** Proyecto con múltiples agentes
- **URL:** https://www.crewai.com
- **Estado:** ⏳ Pendiente

---

### **📊 Observabilidad & Testing**

#### **Helicone**
- **Tipo:** Open Source (Apache 2.0)
- **Propósito:** Observabilidad de LLM
- **Por qué evaluar:** 
  - Alternativa a LangFuse
  - Caching de requests
  - Analytics detallado
- **Cuándo evaluar:** Proyecto con muchas llamadas a LLM
- **URL:** https://helicone.ai
- **Estado:** ⏳ Pendiente

---

### **🗄️ Bases de Datos**

#### **Turso (libSQL)**
- **Tipo:** Open Source (MIT)
- **Propósito:** SQLite distribuido
- **Por qué evaluar:** 
  - Edge database
  - Compatible con SQLite
  - Muy rápido
- **Cuándo evaluar:** Proyecto edge/serverless
- **URL:** https://turso.tech
- **Estado:** ⏳ Pendiente

---

## 📋 Checklist de Evaluación

**Cuando evalúes una herramienta:**

1. **Crear proyecto de prueba**
   ```bash
   mkdir test-[herramienta]
   cd test-[herramienta]
   # Seguir quick start oficial
   ```

2. **Documentar experiencia**
   - Setup (fácil/difícil)
   - DX (developer experience)
   - Performance
   - Documentación
   - Comunidad

3. **Comparar con alternativas**
   - ¿Qué hace mejor?
   - ¿Qué le falta?
   - ¿Vale la pena el cambio?

4. **Decidir**
   - ✅ Agregar al stack recomendado
   - ⚠️ Usar solo en casos específicos
   - ❌ No usar (documentar por qué)

5. **Actualizar documentación**
   - Mover de "Por Evaluar" a categoría correspondiente
   - Agregar ejemplos y setup
   - Documentar en AGENTS.md si aplica

---

## 🎯 Prioridades de Evaluación

**Alta (Próximos proyectos):**
- ⭐ Refine.dev (admin panels)
- ⭐ tRPC (type-safe APIs)
- ⭐ Drizzle ORM (mejor que Prisma)

**Media (Cuando sea necesario):**
- 🟡 Astro (sitios de contenido)
- 🟡 Helicone (observabilidad)
- 🟡 CrewAI (multi-agentes)

**Baja (Exploración):**
- 🟢 Qwik (performance extremo)
- 🟢 AutoGen (multi-agentes Microsoft)
- 🟢 Turso (edge database)

---

## 🔌 MCP Servers (Model Context Protocol)

**Inspirado por:** Claude Code Development Kit v2  
**Versión analizada:** Diciembre 2024  
**Próxima revisión:** Enero 2025

### **¿Qué son MCP Servers?**

MCP (Model Context Protocol) permite a la IA acceder a servicios externos en tiempo real:
- Documentación actualizada de librerías
- Consultas a otros LLMs
- Acceso a bases de datos
- Integración con APIs

**Compatible con:** Claude Code (nativo), Cursor (experimental)

---

### **Context7** ⭐⭐⭐

- **Propósito:** Documentación actualizada de librerías
- **Cuándo usar:** Verificar APIs antes de usar
- **Beneficio:** Evita alucinaciones con APIs obsoletas
- **Compatible con:** Claude Code
- **URL:** https://context7.com

**Ejemplo de uso:**
```
AI: "Voy a usar la API de React 19"
AI: *Consulta Context7*
AI: "Verificado: React 19 usa createRoot (no ReactDOM.render)"
```

---

### **Gemini MCP**

- **Propósito:** Consultas arquitectónicas a Gemini
- **Cuándo usar:** Decisiones de diseño complejas
- **Beneficio:** Segunda opinión de otro LLM
- **Compatible con:** Claude Code
- **Concepto:** "Four eyes principle" (dos pares de ojos)

**Ejemplo de uso:**
```
AI: "Decisión compleja sobre arquitectura"
AI: *Consulta Gemini MCP*
AI: "Gemini sugiere: [alternativa]"
AI: "Mi recomendación: [síntesis de ambas opiniones]"
```

---

### **Implementación en Nuestro Kit**

**Estado actual:** ⏳ Documentado (no implementado)

**Razón:** MCP es específico de Claude Code

**Plan futuro:**
1. Documentar MCPs recomendados
2. Cuando Cursor soporte MCP → Implementar
3. Crear guía de setup de MCPs

---

## 📚 Cursor Rules & Community

**Fuente:** [Cursor.directory](https://cursor.directory)  
**Versión analizada:** Diciembre 2024  
**Comunidad:** 66,600+ miembros  
**Próxima revisión:** Enero 2025

### **¿Qué es Cursor.directory?**

Catálogo comunitario de reglas `.cursorrules` específicas por stack.

**Beneficio:** Reglas pre-hechas para tu stack

---

### **Reglas Destacadas por Stack**

#### **Next.js**
- Next.js React TypeScript Cursor Rules
- Next.js TypeScript TailwindCSS Supabase
- Optimized Next.js TypeScript Best Practices

**URL:** https://cursor.directory/next

---

#### **React**
- React Three Fiber Rules
- Modern Web Development
- OnchainKit Cursor Rules

**URL:** https://cursor.directory/react

---

#### **Python**
- FastAPI Python Cursor Rules
- Django Python Cursor Rules
- Deep Learning Developer Python

**URL:** https://cursor.directory/python

---

### **Cómo Usar con Nuestro Kit**

**Opción 1: Complementar AGENTS.md**
```bash
# 1. Buscar reglas en cursor.directory
# 2. Copiar reglas relevantes
# 3. Agregar a AGENTS.md en sección correspondiente
```

**Opción 2: Archivo Separado**
```bash
# 1. Crear .cursor/rules/[stack].md
# 2. Copiar reglas de cursor.directory
# 3. Referenciar desde AGENTS.md
```

**Recomendación:** Opción 1 (mantener todo en AGENTS.md)

---

### **Reglas Aplicables a Nuestros Proyectos**

**Voice Agent (React + Vite):**
- Optimized Next.js TypeScript Best Practices (adaptar para Vite)
- Modern Web Development
- React TypeScript Best Practices

**Orchestrator (Next.js + Supabase):**
- Next.js TypeScript TailwindCSS Supabase Cursor Rules ⭐
- Next.js React TypeScript Cursor Rules

**Ovi Portal (Next.js + PayloadCMS):**
- Next.js React TypeScript Cursor Rules
- Modern Web Development

---

## 📚 Referencias

- **Cole Medin:** Stack de herramientas OSS
- **Rob (Switch Dimension):** Cursor 2.0 power features
- **Ray Fernando:** Estructura jerárquica de AGENTS.md
- **Peter Krueck:** Claude Code Development Kit v2
- **Cursor.directory:** Community rules (66.6k+ miembros)
- **T3 Stack:** create.t3.gg - Modular setup
- **Awesome Self-Hosted:** https://awesome-selfhosted.net

### **Versiones Analizadas (Para Futuras Revisiones)**

| Proyecto | Versión | Fecha Análisis | Próxima Revisión |
|----------|---------|----------------|------------------|
| Claude Code Kit | v2 | 2024-12-12 | 2025-01-12 |
| Cursor.directory | Live | 2024-12-12 | 2025-01-12 |
| T3 Stack | Latest | 2024-12-12 | 2025-02-12 |

**Nota:** Revisar estos proyectos mensualmente para heredar nuevas features

---

## ✅ Checklist de Setup

**Para nuevo proyecto:**
- [ ] Elegir stack (ver recomendaciones arriba)
- [ ] Setup Docker Compose (si self-hosting)
- [ ] Configurar PostgreSQL + pgvector
- [ ] Setup LangFuse (observabilidad)
- [ ] Configurar n8n (si necesitas workflows)
- [ ] Setup Ollama (si desarrollo offline)
- [ ] Documentar en AGENTS.md

---

**Última actualización:** 2025-12-12 06:30 AM  
**Mantenido por:** VibeThink Team  
**Basado en:** Cole Medin, Rob, Ray Fernando
