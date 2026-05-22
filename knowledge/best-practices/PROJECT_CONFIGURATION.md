# 📋 PROJECT CONFIGURATION SYSTEM

**Versión:** 1.0.0
**Última actualización:** 2025-12-12
**Propósito:** Sistema de configuración automática de proyectos con prevención de conflictos

---

## 🎯 Propósito

Este sistema previene que la IA instale dependencias incompatibles mediante:
- ✅ Detección automática del stack
- ✅ Configuración en `.vibethink.config.json`
- ✅ Reglas de compatibilidad
- ✅ Conflictos conocidos documentados

---

## 🚀 Quick Start

### **Setup de Proyecto Nuevo**

```powershell
# 1. Copiar archivos del dev-kit al proyecto
Copy-Item "C:\IA Marcelo Labs\_vibethink-dev-kit\*" . -Recurse

# 2. Ejecutar setup
.\scripts\setup-project.ps1

# 3. Revisar configuración generada
code .vibethink.config.json
```

**Tiempo:** 2 minutos

---

## 📁 Archivos del Sistema

### **1. `.vibethink.config.json`** (Raíz del proyecto)

**Propósito:** Configuración del stack y reglas de compatibilidad

**Generado por:** `setup-project.ps1`

**Ejemplo:**
```json
{
  "project": {
    "name": "Voice Agent",
    "type": "web-app"
  },
  "stack": {
    "frontend": {
      "framework": "react",
      "buildTool": "vite"
    },
    "backend": {
      "framework": "express",
      "frameworkVersion": "4.21.2"
    }
  },
  "compatibility": {
    "prohibited": ["express@5.x", "next", "prisma"],
    "conflicts": [
      {
        "package1": "prisma",
        "package2": "@refinedev/core",
        "reason": "Incompatible data providers",
        "solution": "Use Drizzle ORM with Refine"
      }
    ]
  }
}
```

---

### **2. `setup-project.ps1`** (scripts/)

**Propósito:** Script interactivo de setup

**Qué hace:**
1. Detecta stack automáticamente (lee package.json)
2. Pregunta información faltante
3. Genera `.vibethink.config.json`
4. Crea reglas de compatibilidad

**Uso:**
```powershell
.\scripts\setup-project.ps1
```

---

### **3. `STACK_COMPATIBILITY.md`** (Raíz)

**Propósito:** Documentación de compatibilidades generales

**Contenido:**
- Matriz de compatibilidades
- Dependencias prohibidas
- Migraciones peligrosas
- Errores comunes

---

### **4. `AGENTS.md`** (Raíz)

**Propósito:** Constitución del proyecto

**Actualizado con:** Referencia a `.vibethink.config.json`

---

## 🔧 Cómo Funciona

### **Flujo Completo**

```
1. Usuario ejecuta setup-project.ps1
   ↓
2. Script detecta stack (package.json)
   ↓
3. Script pregunta info faltante
   ↓
4. Script genera .vibethink.config.json
   ↓
5. IA lee .vibethink.config.json
   ↓
6. IA verifica compatibilidad ANTES de sugerir cambios
   ↓
7. Si hay conflicto → IA pregunta o sugiere alternativa
```

---

### **Detección Automática**

El script detecta automáticamente:

**Frontend:**
- ✅ React (dependencies.react)
- ✅ Next.js (dependencies.next)
- ✅ Vite (devDependencies.vite)
- ✅ TypeScript (devDependencies.typescript)
- ✅ Tailwind (devDependencies.tailwindcss)

**Backend:**
- ✅ Express (dependencies.express)
- ✅ Fastify (dependencies.fastify)
- ✅ Prisma (dependencies.prisma)
- ✅ Drizzle (dependencies.drizzle-orm)

**Package Manager:**
- ✅ npm (package-lock.json)
- ✅ pnpm (pnpm-lock.yaml)
- ✅ yarn (yarn.lock)

---

## ⚠️ Conflictos Conocidos

### **Prisma vs Refine.dev**

**Problema:**
- Prisma genera schemas que conflictúan con Refine's data providers
- Refine espera estructura diferente de datos

**Solución:**
```json
{
  "compatibility": {
    "conflicts": [
      {
        "package1": "prisma",
        "package2": "@refinedev/core",
        "reason": "Prisma's schema conflicts with Refine",
        "solution": "Use Drizzle ORM instead"
      }
    ]
  }
}
```

**Alternativa:**
- ✅ Usar Drizzle ORM con Refine
- ✅ Usar Prisma sin Refine
- ❌ NO usar Prisma + Refine juntos

---

### **Vite vs Next.js**

**Problema:**
- Next.js tiene su propio bundler
- No necesita ni es compatible con Vite

**Solución:**
```json
{
  "compatibility": {
    "conflicts": [
      {
        "package1": "vite",
        "package2": "next",
        "reason": "Next.js has its own bundler",
        "solution": "Choose either Vite (SPA) or Next.js (SSR)"
      }
    ]
  }
}
```

---

### **Express 4 vs Express 5**

**Problema:**
- Express 5 tiene problemas en producción (DigitalOcean)
- Muchas librerías aún no lo soportan

**Solución:**
```json
{
  "compatibility": {
    "prohibited": ["express@5.x"],
    "required": ["express@^4.21.2"]
  }
}
```

---

## 📋 Configuración por Stack

### **React + Vite (SPA)**

```json
{
  "stack": {
    "frontend": {
      "framework": "react",
      "buildTool": "vite"
    }
  },
  "compatibility": {
    "prohibited": ["next", "webpack", "react-scripts"],
    "required": ["react@^19.0.0", "vite@^6.0.0"]
  }
}
```

---

### **Next.js (SSR/SSG)**

```json
{
  "stack": {
    "frontend": {
      "framework": "next.js",
      "buildTool": "next.js"
    }
  },
  "compatibility": {
    "prohibited": ["vite", "react-router-dom", "express"],
    "required": ["next@^15.0.0"]
  }
}
```

---

### **Express Backend**

```json
{
  "stack": {
    "backend": {
      "framework": "express",
      "frameworkVersion": "4.21.2"
    }
  },
  "compatibility": {
    "prohibited": ["express@5.x"],
    "required": ["express@^4.21.2"]
  }
}
```

---

## 🤖 Reglas para la IA

La IA debe seguir estas reglas al leer `.vibethink.config.json`:

### **Regla #1: Leer Primero**
```
ANTES de sugerir CUALQUIER cambio en dependencias:
1. Leer .vibethink.config.json
2. Leer STACK_COMPATIBILITY.md
3. Verificar compatibilidad
```

### **Regla #2: Verificar Prohibidas**
```
NUNCA instalar paquetes en compatibility.prohibited
```

### **Regla #3: Verificar Conflictos**
```
ANTES de sugerir un paquete:
1. Buscar en compatibility.conflicts
2. Si hay conflicto → Sugerir alternativa
3. Si no estás seguro → Preguntar al usuario
```

### **Regla #4: Sugerir Alternativas**
```
Si detectas conflicto:
1. Explicar el problema
2. Sugerir alternativa de TOOLS_AND_STACK.md
3. Esperar confirmación del usuario
```

---

## 💡 Ejemplos de Uso

### **Ejemplo 1: IA Intenta Instalar Prisma en Proyecto con Refine**

**Antes (Sin config):**
```
IA: "Voy a instalar Prisma para el ORM"
Usuario: *Prisma se instala*
Usuario: *Refine deja de funcionar*
```

**Después (Con config):**
```
IA: *Lee .vibethink.config.json*
IA: *Ve conflicto Prisma vs Refine*
IA: "Detecto que usas Refine. Prisma es incompatible con Refine."
IA: "Alternativa: Drizzle ORM (compatible con Refine)"
IA: "¿Quieres que instale Drizzle en lugar de Prisma?"
```

---

### **Ejemplo 2: IA Intenta Instalar Vite en Next.js**

**Antes (Sin config):**
```
IA: "Voy a instalar Vite para mejorar el build"
Usuario: *Vite se instala*
Usuario: *Next.js se rompe*
```

**Después (Con config):**
```
IA: *Lee .vibethink.config.json*
IA: *Ve que framework es next.js*
IA: *Ve que vite está en prohibited*
IA: "No puedo instalar Vite porque usas Next.js"
IA: "Next.js tiene su propio bundler optimizado"
```

---

### **Ejemplo 3: IA Intenta Actualizar Express 4 → 5**

**Antes (Sin config):**
```
IA: "Hay una nueva versión de Express (5.x)"
IA: "¿Quieres actualizar?"
Usuario: "Sí"
Usuario: *Express 5 se instala*
Usuario: *Producción se rompe*
```

**Después (Con config):**
```
IA: *Lee .vibethink.config.json*
IA: *Ve que express@5.x está prohibido*
IA: *Ve el conflicto con razón*
IA: "Express 5 está prohibido en este proyecto"
IA: "Razón: Problemas de compatibilidad en DigitalOcean"
IA: "Solución: Mantener Express 4.21.2"
```

---

## ✅ Checklist de Setup

**Al iniciar proyecto nuevo:**

- [ ] Ejecutar `.\scripts\setup-project.ps1`
- [ ] Revisar `.vibethink.config.json` generado
- [ ] Verificar que `compatibility.prohibited` esté correcto
- [ ] Verificar que `compatibility.conflicts` incluya casos conocidos
- [ ] Actualizar AGENTS.md si es necesario
- [ ] Commit de `.vibethink.config.json`

---

## 🔄 Mantenimiento

**Cuándo actualizar `.vibethink.config.json`:**

1. **Cambio de framework:**
   - Ejecutar `setup-project.ps1` de nuevo
   - O actualizar manualmente

2. **Nueva dependencia mayor:**
   - Agregar a `compatibility.required`

3. **Descubres nuevo conflicto:**
   - Agregar a `compatibility.conflicts`
   - Documentar razón y solución

4. **Migración de stack:**
   - Ejecutar `setup-project.ps1` de nuevo
   - Verificar reglas generadas

---

## 📚 Referencias

- **STACK_COMPATIBILITY.md** - Compatibilidades generales
- **TOOLS_AND_STACK.md** - Herramientas y alternativas
- **AGENTS.md** - Constitución del proyecto
- **setup-project.ps1** - Script de setup

---

## 🚨 Troubleshooting

### **"IA sigue sugiriendo dependencias prohibidas"**

**Solución:**
1. Verificar que `.vibethink.config.json` existe
2. Verificar que AGENTS.md apunta al config
3. Reiniciar chat de IA (contexto viejo)

---

### **"Setup no detecta mi stack"**

**Solución:**
1. Verificar que `package.json` existe
2. Ejecutar con `-SkipDetection` y configurar manualmente
3. Editar `.vibethink.config.json` manualmente

---

### **"Necesito agregar nuevo conflicto"**

**Solución:**
```json
{
  "compatibility": {
    "conflicts": [
      {
        "package1": "paquete-a",
        "package2": "paquete-b",
        "reason": "Por qué son incompatibles",
        "solution": "Qué usar en su lugar"
      }
    ]
  }
}
```

---

**Última actualización:** 2025-12-12 15:35
**Mantenido por:** VibeThink Team
**CRÍTICO:** Ejecutar setup-project.ps1 en cada proyecto nuevo
