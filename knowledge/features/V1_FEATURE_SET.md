# ✨ VibeThink Dev Kit - Feature Set (v1.0.0)

Este documento detalla todas las funcionalidades activas en la versión 1.0.0.
Fuente de verdad para `ROADMAP.md` y `README.md`.

---

## 🛠️ Core Features

### 1. Stack Detection (`vibe-doctor.ps1`)
Detecta automáticamente la tecnología del proyecto leyendo `package.json`, `requirements.txt` y otros archivos de configuración.
*   **Frontend:** React, Next.js, Vue, Svelte, Astro.
*   **Backend:** Express, NestJS, FastAPI, Django, Python.
*   **Database:** Supabase, Firebase, MongoDB.
*   **ORM:** Prisma, Drizzle, TypeORM.
*   **Build:** Vite, Webpack, Turbopack.

### 2. Conflict Prevention Engine (`vibe-doctor.ps1` + `conflicts.json`)
Evalúa reglas lógicas para prevenir arquitecturas incompatibles.
*   **Motor Dinámico:** Soporta operadores `&&`, `||`, `!`.
*   **Reglas Activas:**
    *   ❌ `nextjs && vite` (Next tiene su propio bundler).
    *   ❌ `prisma && refinedev` (Conflictos de data providers).
    *   ❌ `express@5` (Problemas de estabilidad en producción).
    *   ⚠️ `vite && webpack` (Redundancia).

### 3. Project Initialization (`setup-project.ps1`)
Configura un proyecto nuevo o existente para ser "AI-Ready".
*   **Generador de Contexto:** Crea `AGENTS.md` dinámico basado en el stack detectado.
*   **Configuración:** Genera `.vibethink.config.json`.
*   **Interactivo:** Pregunta detalles del proyecto si no los detecta.

### 4. Multi-IA Validation (`validate-multi-ia.ps1`)
Asegura que todas las IAs (Cursor, Claude, Gemini) vean el mismo contexto.
*   Compara `AGENTS.md` vs `.cursorrules` vs `.vibethink.config.json`.
*   Alerta sobre discrepancias en versiones o reglas.

---

## 📚 Knowledge Management

### 5. Knowledge Harvest (`tools/harvest-knowledge.ps1`)
*Status: Beta*
Extrae lecciones aprendidas de un proyecto para reutilizarlas.
*   Escanea patrones de código.
*   Sugiere actualizaciones a `knowledge/`.

### 6. Sync System (`sync-from-kit.ps1`)
Mantiene los proyectos actualizados con la última versión del Kit.
*   Sincroniza scripts y reglas.
*   Respeta configuraciones locales (no sobrescribe sin preguntar).

---

## 🛡️ Quality Assurance

### 7. Rules Validator (`validate-rules.ps1`)
CI Check para el propio Kit.
*   Valida que `rules/conflicts.json` tenga sintaxis correcta.
*   Asegura que todas las reglas tengan `fix` y `reason`.

### 8. Git Hooks Integration
*   **Pre-install Hook:** Bloquea `npm install` si se detecta un paquete prohibido (ej: `express@5`).

---

## 📊 Resumen de Métricas
*   **Scripts:** 13
*   **Líneas de Código:** ~11,000
*   **Reglas de Compatibilidad:** 10 pre-configuradas
*   **Sistemas Operativos:** Windows (PowerShell Core), Linux/Mac (vía pwsh).
