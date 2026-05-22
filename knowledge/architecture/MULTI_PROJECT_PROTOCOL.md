# Protocolo de Ingeniería Multi-Proyecto: El Ciclo Virtuoso ♾️

## 🌟 La Visión: "Un Cerebro, Múltiples Cuerpos"

Este protocolo define cómo `_vibethink-dev-kit` actúa como la **Fuente de Verdad Universal** y el motor de innovación para todos los proyectos de la organización (`Orchestrator`, `Mobile`, `Landing`, etc.).

---

## 🔄 El Ciclo Virtuoso (The Flywheel)

El objetivo no es solo consumir herramientas del Dev-Kit, sino **alimentarlo** constantemente.

1.  **INNOVACIÓN (Edge):** Un proyecto satélite (ej: `Orchestrator`) enfrenta un problema nuevo y crea una solución (un script, un componente, una regla).
2.  **COSECHA (Harvest):** El ingeniero (o Agente) identifica que esa solución es genérica y útil para otros.
3.  **CENTRALIZACIÓN (Core):** La solución se mueve al `_vibethink-dev-kit` (ej: a `packages/utils` o `knowledge/guides`).
4.  **DISTRIBUCIÓN (Scale):** Todos los demás proyectos (ahora y en el futuro) consumen esa solución mejorada desde el Dev-Kit.

---

## 🏗️ Arquitectura de Espacio de Trabajo (Workspace)

Para que este flujo sea fluido, se recomienda configurar un **Multi-Root Workspace** en el IDE:

```text
C:\IA Marcelo Labs\ (VibeThink-System.code-workspace)
 │
 ├─ 🧠 _vibethink-dev-kit       (READ/WRITE: Donde se guarda el conocimiento)
 ├─ 🏭 vibethink-orchestrator   (CONSUMER: Usa el kit, genera nuevos casos)
 └─ 🏗️ vibethink-landing        (CONSUMER: Usa el kit, genera nuevos casos)
```

## 🛠️ Flujo de Trabajo (Paso a Paso)

### Escenario: Creaste una "Super-Función" en el Proyecto A

1.  **Detectar:** "Esto sirve para el Proyecto B también".
2.  **Abstraer:** Quita cualquier lógica de negocio específica del Proyecto A.
3.  **Mover:** Traslada el archivo a `_vibethink-dev-kit/packages/utils/src/`.
4.  **Publicar/Link:**
    *   Si usas enlaces directos (Symlinks/Monorepo): Ya está disponible.
    *   Si usas paquetes NPM: Ejecuta la publicación de `@vibethink/utils`.
5.  **Refactorizar:** En el Proyecto A, borra la función local e impórtala desde `@vibethink/utils`.

---

## 🤖 Rol de la IA (Agentes)

Los Agentes (Antigravity, Claude, Copilot) son los guardianes de este protocolo.
- **Su deber:** Sugerir activamente mover código repetido al Dev-Kit.
- **Tu deber:** Darles permisos de Workspace para que puedan "ver" y editar ambos repositorios simultáneamente.

> **Regla de Oro:** "Todo lo que se hace dos veces, pertenece al Kit."
