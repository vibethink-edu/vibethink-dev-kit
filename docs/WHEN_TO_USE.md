# 🤔 WHEN TO USE - Guía de Decisiones

**Versión:** 1.0.0
**Última actualización:** 2025-12-12

Esta guía te ayuda a decidir **cuándo usar** (y cuándo NO usar) tecnologías clave en tu stack.

---

## 📚 Tabla de Contenidos

- [Prisma vs Supabase Client](#prisma-vs-supabase-client)
- [Zustand vs Redux](#zustand-vs-redux)
- [Agno Orchestration](#agno-orchestration)
- [Pydantic Versions](#pydantic-versions)
- [Supabase with or without ORM](#supabase-with-or-without-orm)

---

## 🗄️ Prisma vs Supabase Client

### ✅ USA Prisma si:

- **Backend en Node.js** (Express, Next.js API routes, NestJS)
- **Necesitas migraciones versionadas** con control total
- **Trabajas con PostgreSQL/MySQL tradicional** (NO Supabase)
- **Múltiples desarrolladores** necesitan sincronizar esquemas
- **Type-safety end-to-end** desde DB hasta frontend (con tRPC por ejemplo)

### ❌ NO uses Prisma si:

- **Usas Supabase** → El cliente de Supabase ya maneja queries SQL de forma elegante
- **Backend en Python** → Usa SQLAlchemy, Supabase Python client, o Drizzle si quieres TypeScript
- **Proyecto simple/pequeño** → Prisma agrega overhead innecesario (migraciones, generación de código)
- **Solo necesitas CRUD básico** → Supabase client es más que suficiente

### 🎯 Alternativas:

| Escenario | Usar |
|-----------|------|
| Supabase + Node.js | `@supabase/supabase-js` directamente |
| Supabase + ORM necesario | **Drizzle ORM** (más ligero que Prisma) |
| PostgreSQL tradicional | **Prisma** o **Drizzle** |
| Backend Python | **SQLAlchemy** o **Tortoise ORM** |

---

## 🧠 Zustand vs Redux

### ✅ USA Zustand si:

- **React app mediana/grande** con state global
- **Quieres simplicidad** - menos boilerplate que Redux
- **Performance crítica** - Zustand es más rápido
- **Proyecto nuevo** - Zustand es el estándar moderno
- **No necesitas time-travel debugging**

**Ejemplo:**
```typescript
// Zustand - Simple y directo
import create from 'zustand'

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 }))
}))
```

### ✅ USA Redux si:

- **Legacy codebase grande** ya usa Redux
- **Necesitas Redux DevTools** con time-travel
- **Equipo grande** familiarizado con Redux
- **Necesitas middleware complejo** (sagas, thunks extensivos)

**⚠️ NO mezcles ambos** - Genera confusión y duplicación

### 🎯 Decisión rápida:

| Criterio | Zustand | Redux |
|----------|---------|-------|
| **Líneas de código** | ~50 | ~200+ |
| **Curva de aprendizaje** | Baja | Alta |
| **Performance** | ⚡ Excelente | ✅ Buena |
| **DevTools** | Básico | Avanzado |
| **Proyecto nuevo** | ✅ Sí | ❌ No |

---

## 🤖 Agno Orchestration

### ✅ USA Agno si:

- **Orquestación de agentes AI** con múltiples pasos
- **Workflows complejos** que requieren coordinación
- **Necesitas validación con Pydantic** (type-safe AI responses)
- **Backend en Python** (Agno es Python-first)
- **RAG pipelines** con múltiples fuentes de datos

**Casos de uso:**
- Multi-agent systems (investigación, análisis, generación)
- Workflows de procesamiento de documentos
- Chatbots con memoria y context switching
- Pipelines de data enrichment

### ❌ NO uses Agno si:

- **Solo necesitas un chatbot simple** → Usa LangChain o llamar API directamente
- **No trabajas con Python** → Agno requiere Python
- **No necesitas orquestación** → Un solo LLM call es suficiente
- **Proyecto sin Pydantic** → Agno depende de Pydantic para validación

### 🎯 Alternativas:

| Necesidad | Usar |
|-----------|------|
| Chatbot simple | OpenAI SDK directamente |
| RAG básico | **LangChain** |
| Multi-agent Python | **Agno** ⭐ |
| Multi-agent TypeScript | **LangGraph** o **AutoGPT** |

### 📋 Checklist antes de usar Agno:

- [ ] Backend en Python ✅
- [ ] Pydantic v2+ instalado ✅
- [ ] Necesitas más de 1 agente/paso
- [ ] Necesitas validación de tipos estricta

---

## 🔢 Pydantic Versions

### ✅ USA Pydantic v2+ si:

- **Proyecto nuevo** (siempre v2)
- **FastAPI 0.100+** (recomienda v2)
- **Necesitas performance** (v2 es 5-50x más rápido)
- **Type hints modernos** (mejor soporte para Python 3.10+)

### ⚠️ Mantén Pydantic v1 SOLO si:

- **Legacy codebase grande** con breaking changes costosos
- **Dependencias externas** que no soportan v2 aún
- **Migración planificada** para v2 en roadmap

### 🔄 Migración v1 → v2

**Breaking changes principales:**
```python
# v1
from pydantic import BaseModel

class User(BaseModel):
    name: str

    class Config:
        orm_mode = True  # v1

# v2
from pydantic import BaseModel, ConfigDict

class User(BaseModel):
    model_config = ConfigDict(from_attributes=True)  # v2
    name: str
```

**Guía completa:** https://docs.pydantic.dev/latest/migration/

### 🎯 Regla de oro:

> **Si puedes, usa Pydantic v2**. Solo mantén v1 si tienes razones muy específicas.

---

## 🔥 Supabase with or without ORM

### 🤔 ¿Necesitas ORM con Supabase?

**Supabase client YA INCLUYE:**
- ✅ Query builder (`.from().select().insert()`)
- ✅ Type inference (con TypeScript)
- ✅ Real-time subscriptions
- ✅ Auth integration
- ✅ Storage integration

### ✅ USA Supabase client SIN ORM si:

- **CRUD simple** (80% de los casos)
- **Queries directas** son suficientes
- **Real-time** es importante
- **Menos abstracción** = menos bugs

**Ejemplo:**
```typescript
// Supabase client - Directo y poderoso
const { data, error } = await supabase
  .from('users')
  .select('*, posts(*)')
  .eq('active', true)
  .order('created_at', { ascending: false })
```

### ✅ USA ORM (Drizzle) CON Supabase si:

- **Migraciones complejas** versionadas
- **Schema as code** con type-safety total
- **Múltiples desarrolladores** sincronizando DB
- **Relaciones complejas** con joins múltiples
- **Seed data** y fixtures para testing

**Ejemplo:**
```typescript
// Drizzle ORM - Type-safe queries
import { db } from './db'
import { users, posts } from './schema'

const result = await db
  .select()
  .from(users)
  .innerJoin(posts, eq(users.id, posts.userId))
  .where(eq(users.active, true))
```

### ❌ NO uses Prisma con Supabase

**Razones:**
1. **Redundancia** - Supabase ya maneja migraciones via Dashboard
2. **Overhead** - Prisma genera client extra innecesario
3. **Complejidad** - Dos fuentes de verdad (Prisma schema vs Supabase schema)
4. **Performance** - Capa extra de abstracción

### 🎯 Matriz de decisión:

| Criterio | Supabase Client | + Drizzle | + Prisma |
|----------|----------------|-----------|----------|
| **Simplicidad** | ⭐⭐⭐ | ⭐⭐ | ⭐ |
| **Type-safety** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Performance** | ⭐⭐⭐ | ⭐⭐ | ⭐ |
| **Migraciones** | Manual | ⭐⭐⭐ | ⭐⭐⭐ |
| **Real-time** | ⭐⭐⭐ | ⭐⭐⭐ | ❌ |
| **Recomendado** | ✅ 80% casos | ✅ Proyectos grandes | ❌ No |

### 💡 Recomendación:

```
Proyecto simple/mediano → Supabase client directo
Proyecto grande/complejo → Supabase + Drizzle
NUNCA → Supabase + Prisma
```

---

## 🎯 Quick Decision Tree

```
¿Backend en Python?
├─ Sí
│  ├─ ¿Necesitas orquestación multi-agente? → Agno + Pydantic v2
│  ├─ ¿Solo API REST? → FastAPI + Pydantic v2
│  └─ ¿Database? → SQLAlchemy o Supabase Python client
└─ No (Node.js/TypeScript)
   ├─ ¿Usas Supabase?
   │  ├─ ¿Proyecto simple? → Supabase client directo
   │  └─ ¿Proyecto complejo? → Supabase + Drizzle
   ├─ ¿PostgreSQL tradicional? → Prisma o Drizzle
   └─ ¿State management?
      ├─ Proyecto nuevo → Zustand
      └─ Legacy grande → Redux (si ya lo tienes)
```

---

## 📊 Stack Recommendations por Tipo de Proyecto

### 🚀 SaaS Moderna (Full-stack)

**Frontend:**
- React + Vite + Zustand
- TypeScript

**Backend:**
- Supabase (Auth + DB + Storage)
- Edge Functions (si necesitas backend custom)

**ORM:**
- Supabase client directo (sin ORM)

**Estado:**
- Zustand para global state
- React Query para server state

---

### 🤖 AI/ML Application

**Frontend:**
- React + Vite + Zustand
- TypeScript

**Backend:**
- Python + FastAPI + Pydantic v2
- Agno para orquestación de agentes

**Database:**
- Supabase (para app data)
- Vector DB (Pinecone/Weaviate para embeddings)

**Deployment:**
- Frontend → Vercel
- Backend → Railway/Fly.io

---

### 📱 MVP Rápido

**Frontend:**
- React + Vite (sin state management complejo)
- TypeScript

**Backend:**
- Supabase (todo incluido: Auth, DB, Storage)

**ORM:**
- ❌ Ninguno - Supabase client es suficiente

**Estado:**
- useState + useContext (sin Zustand ni Redux)

---

## 🔗 Referencias

- [STACK_COMPATIBILITY.md](../STACK_COMPATIBILITY.md) - Matriz de compatibilidad
- [ROADMAP.md](../ROADMAP.md) - Features planeadas
- [TOOLS_AND_STACK.md](../TOOLS_AND_STACK.md) - Herramientas recomendadas

---

**Última actualización:** 2025-12-12
**Mantenido por:** VibeThink Team
**Feedback:** Si descubres nuevos casos de uso o conflictos, agrégalos a `rules/conflicts.json`
