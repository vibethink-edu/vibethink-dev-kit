# Estrategia de Documentación: Metodología VThink

## 1. Docusaurus privado para VThink
- **Ubicación:** `docusaurus-vthink/`
- **Acceso:** Solo equipo interno (privado, no público ni para clientes).
- **Contenido:**  
  - Documentación completa y profunda de la metodología VThink.
  - Decisiones de diseño, patrones, fundamentos, evolución y know-how propietario.
  - Roadmaps, versiones, debates internos y experimentación metodológica.

## 2. `/docs/methodologies/` (público o compartido)
- **Propósito:** Solo contiene guías de aplicación, plantillas, ejemplos de compliance y casos de uso.
- **Contenido:**  
  - Cómo aplicar VThink en empresas, proyectos o industrias específicas.
  - Plantillas de compliance (ISO, CMMI, etc.) y ejemplos de adaptación.
  - Casos de éxito, mejores prácticas y guías de adopción.
- **No debe incluir:** El detalle completo de la metodología ni el know-how propietario.

## 3. Ventajas de este enfoque
- **Protección de propiedad intelectual:** El core de la metodología queda seguro y controlado.
- **Facilita la adopción:** Los clientes y empresas solo ven lo necesario para aplicar y cumplir.
- **Escalabilidad y mantenimiento:** Permite evolucionar la metodología internamente sin exponer cambios prematuros.
- **Cumplimiento y trazabilidad:** Puedes mostrar compliance y adaptación sin exponer el detalle.

---

## Referencias rápidas para preguntas frecuentes

### ¿Cómo se maneja la metodología VThink?
- La metodología VThink se documenta y evoluciona en el Docusaurus privado (`docusaurus-vthink/`).
- En `/docs/methodologies/` solo se documenta cómo se aplica, con plantillas y ejemplos.

### ¿Cómo es la estructura del monorepo?
- El monorepo sigue la estructura recomendada en la documentación de arquitectura y en los archivos de Docusaurus (`docusaurus-dev/docs/architecture/`).
- Incluye apps, shared, integrations, modules, docs, tests, y herramientas de desarrollo.

### ¿Cómo se implementa Bundui en un nuevo componente?
- La integración y mejores prácticas de Bundui están documentadas en `docusaurus-dev/docs/ui/` y en la sección de integraciones.
- Para crear un nuevo componente Bundui, sigue las guías y ejemplos en esa carpeta y revisa los patrones de integración en `docusaurus-dev/docs/integrations/`.

---

> **Actualiza este documento cada vez que evolucione la estrategia o la estructura del repositorio.** 