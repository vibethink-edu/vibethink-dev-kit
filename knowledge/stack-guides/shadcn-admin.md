# 🎨 Shadcn Admin Template Guide

**Estado:** ⏳ PENDIENTE DE DOCUMENTACIÓN (Esperando input de usuario)
**Fecha:** 2025-12-13
**Versión de Referencia:** Shadcn UI (Dec 2025 Update)

---

## 🚨 ADVERTENCIA CRÍTICA DE VERSIONES (Dic 2025)

**⚠️ LEER ANTES DE USAR CUALQUIER PLANTILLA O CÓDIGO EXTERNO**

En Diciembre 2025, Shadcn UI introdujo **Breaking Changes masivos**:
1.  **React 19 & Tailwind v4:** Ahora son el default para proyectos nuevos (`canary`).
2.  **`forwardRef` Deprecado:** React 19 elimina `forwardRef`. Componentes viejos fallarán.
3.  **Hooks Deprecados:** `toast` reemplazado por `sonner`. `tailwindcss-animate` reemplazado por `tw-animate-css`.
4.  **Estructura de CLI:** Nuevo comando `npx shadcn create` reescribe componentes.

**RIESGO:** Si tu "Admin Template" comprado fue creado antes de Dic 2025, **NO SERÁ COMPATIBLE** con una instalación fresca de Shadcn o Next.js 15/React 19 sin migración manual.

---

## ✅ Protocolo de Verificación de Plantilla

Antes de intentar integrar tu plantilla, debes auditar su versión:

### 1. Verificar `package.json` de la Plantilla
Busca estas dependencias clave:
```json
// Si ves esto, es versión ANTIGUA (Pre-Dic 2025):
"react": "^18.x",
"tailwindcss": "^3.x",
"class-variance-authority": "^0.7.0"

// Si ves esto, es versión NUEVA (Post-Dic 2025):
"react": "^19.0.0",
"tailwindcss": "^4.0.0",
"tw-animate-css": "..."
```

### 2. Verificar Sintaxis de Componentes
Abre cualquier componente UI (ej: `components/ui/button.tsx`).
*   **Antiguo:** Usa `React.forwardRef`.
*   **Nuevo:** Usa `ref` como prop directa (React 19).

### 3. Verificar Imports CSS
*   **Antiguo:** `@tailwind base;` en `globals.css`.
*   **Nuevo:** `@import "tailwindcss";` (Tailwind v4 syntax).

---

## 🛠️ Estrategia de integración

### Opción A: La Plantilla es Antigua (React 18 / Tailwind 3)
*   **Recomendación:** Crear un proyecto **Legacy** para alojarla.
*   **NO intentes** forzarla en un proyecto React 19 / Next.js 15 nuevo.
*   Usa el script de setup del Kit pero **fuerza versiones viejas** manualmente si es necesario.

### Opción B: La Plantilla es Nueva (React 19 / Tailwind 4)
*   **Recomendación:** Usar el stack más reciente del Kit (Voice Agent stack).
*   Asegúrate de que tu entorno (Node.js) soporte las nuevas herramientas.

---

## 📝 Tareas Pendientes para el Usuario

1.  [ ] **Identificar la plantilla:** (Nombre comercial, URL, Versión).
2.  [ ] **Ejecutar Auditoría de Versión:** (Usar checklist de arriba).
3.  [ ] **Confirmar Stack Objetivo:** ¿Quieres usar React 19 o hacer downgrade para la plantilla?

---

## 🔗 Referencias de Migración
*   [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
*   [Tailwind v4 Upgrade](https://tailwindcss.com/docs/upgrade-guide)
*   [Shadcn CLI Updates](https://ui.shadcn.com/docs/cli)
