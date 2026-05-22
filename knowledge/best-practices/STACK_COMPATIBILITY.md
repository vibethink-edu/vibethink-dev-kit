# 🔧 STACK COMPATIBILITY - Compatibilidades y Warnings

**Versión:** 1.0.0
**Última actualización:** 2025-12-12
**Propósito:** Prevenir que la IA instale dependencias incompatibles o rompa el stack

---

## 🎯 Propósito

Este documento es **CRÍTICO** para que la IA (Cursor, Claude, etc.) sepa:
- ✅ Qué tecnologías son compatibles entre sí
- ❌ Qué combinaciones NUNCA usar
- ⚠️ Warnings importantes antes de instalar algo

**IMPORTANTE:** La IA debe leer este archivo ANTES de sugerir cambios en dependencias.

---

## 🚨 REGLAS UNIVERSALES

### **Regla #1: Verificar Stack Actual**

**ANTES de sugerir cualquier cambio:**
```bash
# Verificar package.json
cat package.json

# Verificar framework
# - ¿Usa Vite o Webpack?
# - ¿Usa React o Next.js?
# - ¿Usa Express o Fastify?
```

### **Regla #2: NO Mezclar Build Tools**

❌ **NUNCA hacer esto:**
- Vite + Webpack en el mismo proyecto
- Create React App + Vite
- Next.js + Vite (Next.js tiene su propio bundler)

✅ **Correcto:**
- Vite para React SPA
- Next.js standalone (no necesita Vite)
- Webpack solo si es proyecto legacy

### **Regla #3: NO Cambiar Versiones Sin Confirmar**

⚠️ **SIEMPRE preguntar antes de:**
- Actualizar versión mayor (ej: React 18 → 19)
- Cambiar de Express 4 → Express 5
- Migrar de Vite 5 → Vite 6

---

## 📦 Compatibilidades por Stack

### **React + Vite (SPA)**

**Stack compatible:**
```json
{
  "react": "^19.0.0",
  "vite": "^6.0.0",
  "typescript": "^5.8.0",
  "tailwindcss": "^3.4.0"
}
```

**✅ Compatible con:**
- React Router (routing)
- Zustand (state management)
- React Query (data fetching)
- Framer Motion (animations)
- Shadcn UI (components)

**❌ NO compatible con:**
- Next.js (son frameworks diferentes)
- Create React App (usa Webpack)
- Remix (framework diferente)

**⚠️ Warnings:**
- NO instalar `react-scripts` (es de CRA)
- NO instalar `next` (framework diferente)
- NO instalar `webpack` (Vite ya es bundler)

---

### **Next.js (SSR/SSG)**

**Stack compatible:**
```json
{
  "next": "^15.0.0",
  "react": "^19.0.0",
  "typescript": "^5.8.0",
  "tailwindcss": "^3.4.0"
}
```

**✅ Compatible con:**
- Supabase (backend)
- Zustand (state management)
- Zod (validation)
- tRPC (type-safe APIs)
- Shadcn UI (components)

**❌ NO compatible con:**
- Vite (Next.js tiene su propio bundler)
- React Router (Next.js usa App Router)
- Express (Next.js tiene API routes)

**⚠️ Warnings:**
- NO instalar `vite` (Next.js no lo necesita)
- NO instalar `react-router-dom` (usar App Router)
- NO mezclar Pages Router + App Router (elegir uno)

---

### **Express (Backend)**

**Stack compatible:**
```json
{
  "express": "^4.21.2",
  "typescript": "^5.8.0",
  "cors": "^2.8.5",
  "dotenv": "^16.0.0"
}
```

**✅ Compatible con:**
- PostgreSQL + pg
- MongoDB + mongoose
- Socket.io (WebSockets)
- Passport (auth)

**❌ NO compatible con:**
- Express 5.x (inestable en producción)
- Fastify (framework diferente)
- Koa (framework diferente)

**⚠️ Warnings:**
- ❌ **NUNCA usar Express 5** (problemas en DigitalOcean)
- ✅ **SIEMPRE usar Express 4.21.x**
- ⚠️ Fijar versión de `express-rate-limit` a `^6.11.2`

---

### **Voice APIs (Gemini, ElevenLabs, Cartesia)**

**Stack compatible:**
```json
{
  "@google/generative-ai": "latest",
  "ws": "^8.18.3"
}
```

**✅ Compatible con:**
- Web Audio API (AudioContext)
- AudioWorklet (audio processing)
- WebSocket (streaming)

**❌ NO compatible con:**
- ScriptProcessorNode (deprecated)
- react-speech-recognition (deprecated)

**⚠️ Warnings:**
- ❌ **NO usar ScriptProcessorNode** (usar AudioWorklet)
- ✅ **SÍ usar AudioWorklet** para audio input
- ⚠️ Gemini requiere `ws@^8.18.3` específicamente

---

### **ORM & Admin Panels (Prisma, Drizzle, Refine)**

**Stack compatible:**
```json
{
  "drizzle-orm": "latest",
  "@refinedev/core": "latest"
}
```

**✅ Compatible con:**
- Drizzle ORM + Refine.dev
- Prisma (sin Refine)
- Refine.dev (sin Prisma)

**❌ NO compatible con:**
- Prisma + Refine.dev (CONFLICTO CRÍTICO)

**⚠️ Warnings:**
- ❌ **NUNCA usar Prisma + Refine juntos**
- ✅ **SÍ usar Drizzle ORM con Refine**
- ⚠️ Si usas Prisma, NO instales Refine
- ⚠️ Si usas Refine, usa Drizzle (no Prisma)

**Razón del conflicto:**
- Prisma genera schemas que conflictúan con Refine's data providers
- Refine espera estructura diferente de datos
- Incompatibilidad en generación de tipos

**Solución:**
```bash
# Si quieres usar Refine
npm install drizzle-orm  # NO prisma
npm install @refinedev/core

# Si quieres usar Prisma
# NO instales Refine
npm install prisma
```

---

## 🔄 Migraciones Peligrosas

### **React 18 → React 19**

**Cambios breaking:**
- `ReactDOM.render` → `createRoot`
- Nuevas reglas de Hooks
- Suspense changes

**Antes de migrar:**
```bash
# 1. Verificar que todas las dependencias soporten React 19
npm outdated

# 2. Revisar changelog
# https://react.dev/blog/2024/12/05/react-19

# 3. Actualizar gradualmente
npm install react@19 react-dom@19
```

---

### **Vite 5 → Vite 6**

**Cambios breaking:**
- Nueva configuración de plugins
- Cambios en HMR

**Antes de migrar:**
```bash
# 1. Revisar changelog
# https://vitejs.dev/guide/migration

# 2. Actualizar
npm install vite@6

# 3. Verificar build
npm run build
```

---

### **Express 4 → Express 5**

**⚠️ NO MIGRAR EN PRODUCCIÓN**

**Razones:**
- Problemas de compatibilidad en DigitalOcean
- Muchas librerías aún no soportan Express 5
- No aporta beneficios críticos

**Decisión:** Mantener Express 4.21.x

---

## 🚫 Dependencias Prohibidas

### **Por Proyecto**

#### **Voice Agent (v3-andres-cantor)**

**❌ NUNCA instalar:**
- `express@5.x` - Inestable
- `react-scripts` - No usa CRA
- `next` - No es Next.js
- `webpack` - Usa Vite
- `react-speech-recognition` - Deprecated

**✅ SIEMPRE usar:**
- `express@^4.21.2`
- `vite@^6.0.0`
- `react@^19.0.0`

---

#### **VozFood Agent**

**❌ NUNCA instalar:**
- Mismas que Voice Agent
- Dependencias de frontend (es backend)

**✅ SIEMPRE usar:**
- `express@^4.21.2`
- PostgreSQL + Supabase
- n8n para workflows

---

#### **Ovi Portal (PayloadCMS)**

**❌ NUNCA instalar:**
- `vite` - Next.js no lo necesita
- `react-router-dom` - Next.js usa App Router

**✅ SIEMPRE usar:**
- `next@latest`
- `payload@latest`
- MongoDB

---

#### **Orchestrator (Next.js + Supabase)**

**❌ NUNCA instalar:**
- `vite` - Next.js no lo necesita
- `express` - Next.js tiene API routes

**✅ SIEMPRE usar:**
- `next@^15.0.0`
- `@supabase/supabase-js`
- `zustand`
- `zod`

---

## ⚠️ Warnings por Tecnología

### **Vite**

```markdown
⚠️ ANTES de sugerir Vite, verificar:
- [ ] ¿El proyecto usa React SPA? ✅ Usar Vite
- [ ] ¿El proyecto usa Next.js? ❌ NO usar Vite
- [ ] ¿El proyecto usa CRA? ⚠️ Migrar a Vite (con cuidado)
```

### **Tailwind CSS**

```markdown
⚠️ ANTES de sugerir Tailwind, verificar:
- [ ] ¿Ya usa otro framework CSS? ⚠️ Preguntar antes
- [ ] ¿Usa Tailwind CDN? ⚠️ NO remover sin permiso
- [ ] ¿Quiere migrar a Tailwind v4? ⚠️ Breaking changes
```

### **TypeScript**

```markdown
⚠️ ANTES de sugerir TypeScript, verificar:
- [ ] ¿El proyecto ya usa TS? ✅ Continuar
- [ ] ¿Es proyecto nuevo? ✅ Usar TS desde inicio
- [ ] ¿Migrar JS → TS? ⚠️ Preguntar (es mucho trabajo)
```

---

## 🔍 Checklist de Verificación

**Antes de sugerir instalar CUALQUIER dependencia:**

```markdown
- [ ] Leí package.json del proyecto
- [ ] Verifiqué el framework actual (React/Next.js/etc)
- [ ] Verifiqué el build tool actual (Vite/Webpack/Next.js)
- [ ] Verifiqué que no esté en la lista de prohibidas
- [ ] Verifiqué compatibilidad con versiones actuales
- [ ] Si es migración mayor, pregunté al usuario
```

---

## 📋 Matriz de Compatibilidad

| Tecnología | Compatible con | NO compatible con | Warnings |
|------------|----------------|-------------------|----------|
| **Vite** | React SPA, Vue, Svelte | Next.js, CRA | NO mezclar con Webpack |
| **Next.js** | React, Supabase, tRPC | Vite, React Router | Tiene su propio bundler |
| **Express 4** | PostgreSQL, MongoDB | Express 5 | NO actualizar a v5 |
| **React 19** | Vite 6, Next.js 15 | Vite 4, Next.js 13 | Verificar deps |
| **Tailwind** | Cualquier framework | - | NO remover CDN sin permiso |
| **AudioWorklet** | Web Audio API | ScriptProcessor | ScriptProcessor deprecated |

---

## 🚨 Errores Comunes y Soluciones

### **Error: "Cannot use import statement outside a module"**

**Causa:** Mezclar CommonJS y ES Modules

**Solución:**
```json
// package.json
{
  "type": "module"  // Para ES Modules
}
```

---

### **Error: "express-rate-limit version mismatch"**

**Causa:** Versión incompatible de express-rate-limit

**Solución:**
```bash
npm install express-rate-limit@6.11.2 --save-exact
```

---

### **Error: "Vite not found in Next.js project"**

**Causa:** Intentar usar Vite en Next.js

**Solución:**
```bash
# NO instalar Vite
# Next.js tiene su propio bundler
```

---

### **Error: "Shadcn Component Type Errors (ref)"**

**Causa:** Mezclar componentes Shadcn viejos (React 18/forwardRef) con proyecto React 19.

**Solución:**
1. **Opción A (Migrar componente):** Remover `forwardRef` y usar `ref` como prop.
2. **Opción B (Codemod):** Usar `npx shadcn@latest diff` para ver diferencias.
3. **Validación:** Comprobar si `package.json` usa `react@19` y `tailwindcss@4`.

---

## 📚 Referencias

- **Express 4 vs 5:** Ver `docs/operations/EXPRESS_VERSION.md`
- **Vite Migration:** https://vitejs.dev/guide/migration
- **React 19 Migration:** https://react.dev/blog/2024/12/05/react-19
- **Next.js 15 Migration:** https://nextjs.org/docs/app/building-your-application/upgrading

---

## ✅ Checklist de Proyecto Nuevo

**Al iniciar proyecto nuevo, decidir:**

1. **Framework:**
   - [ ] React SPA → Vite
   - [ ] SSR/SSG → Next.js
   - [ ] Backend → Express 4

2. **Styling:**
   - [ ] Tailwind CSS
   - [ ] CSS Modules
   - [ ] Styled Components

3. **State:**
   - [ ] Zustand (simple)
   - [ ] Redux (complejo)
   - [ ] React Query (server state)

4. **Backend:**
   - [ ] Supabase (BaaS)
   - [ ] Express + PostgreSQL
   - [ ] Next.js API Routes

---

**Última actualización:** 2025-12-12 15:27
**Mantenido por:** VibeThink Team
**CRÍTICO:** Leer ANTES de sugerir cambios en dependencias
