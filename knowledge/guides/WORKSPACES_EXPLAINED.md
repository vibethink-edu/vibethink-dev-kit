# Guía de Workspaces: Entendiendo la "Visión" del Agente 👁️

## 🏠 El Concepto de "Caja de Arena" (Sandbox)

Para entender por qué a veces un Agente (ya sea en Cursor, Antigravity o GitHub Copilot) no puede ver o tocar ciertos archivos, hay que entender el concepto de **Workspace Activo**.

Imagina que tu disco duro es una ciudad enorme.
- Cuando abres una carpeta en tu editor (ej: `vibethink-orchestrator-main`), estás invitando al agente a **entrar a esa casa específica**.
- El agente **cierra la puerta**. Por seguridad, no puede salir a la calle ni entrar a la casa del vecino (`_vibethink-dev-kit`), aunque esté justo al lado.

### 🔒 Por qué existe esta restricción?
1.  **Seguridad:** Evita que una extensión maliciosa o un error de código borre archivos de tu sistema operativo o de otros proyectos.
2.  **Contexto:** Ayuda a la IA a enfocarse. Si pudiera ver todo tu disco C:, se abrumaría con información irrelevante.

---

## 🚀 La Solución: Multi-Root Workspaces

Si estás trabajando en una arquitectura desacoplada (como nuestro `Orchestrator` + `Dev-Kit`), necesitas que el Agente tenga llaves de **ambas casas**.

Esto se logra con un **Multi-Root Workspace**.

### ¿Qué es?
Es un archivo de configuración (`.code-workspace`) que le dice al editor: *"Trata a estas carpetas separadas como si fueran un solo gran proyecto lógico"*.

### 🛠️ Cómo crear uno en Cursor / VS Code

1.  Abre tu proyecto principal (`vibethink-orchestrator-main`).
2.  Ve al menú: **File** > **Add Folder to Workspace...**
3.  Selecciona tu segunda carpeta (`_vibethink-dev-kit`).
4.  Verás que ahora tienes dos raíces en tu explorador de archivos.
5.  **IMPORTANTE:** Guarda esta configuración. Ve a **File** > **Save Workspace As...** y guárdalo como `VibeThink-System.code-workspace`.

### ✨ Beneficios para la IA (Antigravity/Cursor)
Cuando abres ese archivo `.code-workspace`:
- ✅ El Agente puede leer archivos de ambos proyectos.
- ✅ Puede mover archivos de uno a otro sin trucos.
- ✅ Entiende las referencias cruzadas y symlinks mejor.
- ✅ La búsqueda global (`Ctrl+Shift+F`) busca en ambos.

---

## 🧠 Resumen para Desarrolladores

| Tipo de Acceso | Single Folder Mode | Workspace Mode (.code-workspace) |
| :--- | :--- | :--- |
| **Visibilidad** | Solo la carpeta abierta | Múltiples carpetas raíz |
| **Acceso IA** | Restringido al root | Acceso a todos los roots definidos |
| **Ideal para** | Proyectos simples, Monolitos | Monorepos, Arquitecturas Desacopladas |
| **Symlinks** | Los ve como archivos | Los navega transparentemente |

**Recomendación VibeThink:**
Usa siempre un Workspace guardado cuando trabajes coordinando el `Orchestrator` y el `Dev-Kit`.
