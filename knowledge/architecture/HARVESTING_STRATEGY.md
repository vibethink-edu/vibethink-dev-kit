# 🌱 Estrategia de Cosecha (Harvesting Strategy)

**Resumen:** En VibeThink, la duplicación controlada de archivos entre Proyectos y el Dev-Kit es una característica, no un error.

## 🔄 El Concepto: Semilla vs. Planta

Para evitar dependencias rígidas (symlinks que rompen proyectos si cambia el core), utilizamos un modelo de **Herencia por Copia**.

### 1. La Planta (Instancia Viva)
*   **Ubicación:** En el repositorio del proyecto (ej: `V4-ovi-Portal/.agents/MANIFEST.md`).
*   **Propósito:** Servir a ESE proyecto específico.
*   **Evolución:** Cambia libremente para adaptarse a las necesidades del proyecto.
*   **Regla:** "El proyecto siempre tiene la razón sobre su propia configuración."

### 2. La Semilla (Template/Patrón)
*   **Ubicación:** En el Dev-Kit (ej: `_vibethink-dev-kit/knowledge/templates/MANIFEST_TEMPLATE.md`).
*   **Propósito:** Servir como punto de partida para **nuevos** proyectos.
*   **Evolución:** Solo cambia cuando se "Cosecha" una mejora probada de un proyecto exitoso.
*   **Regla:** "El Dev-Kit es un almacén de las mejores prácticas demostradas, no un entorno de pruebas."

## 🚜 El Proceso de Cosecha (Harvest Protocol)

El flujo de información y mejoras es **Ascendente** (de abajo hacia arriba):

1.  **Innovación:** Un proyecto (ej: Ovi) crea una nueva estructura útil (ej: OpenSpec).
2.  **Validación:** Se prueba y refina dentro del proyecto.
3.  **Cosecha:** Si es útil para otros, se copia al Dev-Kit y se generaliza (se quitan nombres específicos).
4.  **Siembra:** El siguiente proyecto copia ese template del Dev-Kit.

```mermaid
graph TD
    A[Proyecto A (Innovación)] -->|Cosecha| B(Dev-Kit / Semillas)
    B -->|Siembra (Copy)| C[Proyecto B]
    B -->|Siembra (Copy)| D[Proyecto C]
    C -.->|No afecta| A
```

## ⚠️ ¿Por qué no usar Symlinks para todo?

Los Symlinks (`.cursorrules`, `AGENTS.md`) se usan **SOLO** para:
1.  Instrucciones Globales de IA (Meta-reglas).
2.  Estándares inmutables de la empresa.

Para **Arquitectura y Configuración**, preferimos duplicación (Templates) para permitir que cada proyecto diverja y evolucione sin romper a los demás.
