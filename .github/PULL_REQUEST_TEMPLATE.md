<!--
¡Gracias por tu contribución!
Para asegurar la calidad y consistencia de nuestro codebase, por favor completa la siguiente información.
-->

## 🎯 **Propósito del Pull Request**

<!-- 
Describe de manera clara y concisa el "porqué" de este PR.
- ¿Qué problema soluciona?
- ¿Qué feature añade?
- ¿A qué ticket o issue está ligado? (Ej: Cierra #123)
-->

## 🚀 **Tipo de Cambio**

<!-- Marca con una 'x' la opción que aplique -->
- [ ] 🐛 **Bug Fix** (Un cambio no disruptivo que soluciona un problema)
- [ ] ✨ **Nueva Feature** (Un cambio no disruptivo que añade funcionalidad)
- [ ] 💥 **Breaking Change** (Arreglo o feature que podría causar que la funcionalidad existente no trabaje como se esperaba)
- [ ] 📝 **Documentación** (Cambios exclusivos en la documentación)
- [ ] 🧹 **Refactorización** (Un cambio de código que no arregla un bug ni añade una feature)
- [ ] ⏪ **Reversión** (Revierte un commit anterior)
- [ ] ✅ **Tests** (Añadir tests faltantes o refactorizar tests existentes)
- [ ] 📦 **Build/CI** (Cambios en nuestro sistema de build o pipeline de CI/CD)
- [ ] ⚙️ **Configuración** (Cambios en archivos de configuración)


## 🖼️ **¿Cómo ha sido probado?**

<!-- 
Describe las pruebas que has realizado para verificar tus cambios.
Proporciona instrucciones para que podamos reproducir las pruebas.
Incluye capturas de pantalla, GIFs o videos si ayudan a visualizar el cambio.
-->

- [ ] **Test Manual**
  - Pasos para reproducir:
    1. `...`
    2. `...`
    3. `...`
  - *Adjuntar capturas de pantalla aquí*

- [ ] **Tests Unitarios**
- [ ] **Tests de Integración**
- [ ] **Tests E2E**


## 📋 **Checklist de "Definition of Done" (DoD)**

<!-- 
Asegúrate de que tu PR cumpla con todos los siguientes puntos.
Marca con una 'x' cada caja que hayas completado. Si alguna no aplica, explica por qué.
-->

### **Código y Arquitectura**
- [ ] **Sigue Patrones de Desarrollo**: Mi código sigue los estándares definidos en `DEVELOPMENT_PATTERNS.md`.
- [ ] **Nomenclatura Clara**: He usado nombres de variables, funciones y clases descriptivos y consistentes.
- [ ] **Componentes Pequeños**: Mis componentes son cohesivos y cumplen con el principio de responsabilidad única (< 150 líneas).
- [ ] **Sin `any`**: No he introducido el tipo `any` en el codebase.
- [ ] **Manejo de Errores**: Se ha implementado un manejo de errores robusto (try/catch, Error Boundaries).
- [ ] **Seguridad Multi-tenant**: Si aplica, las queries y la lógica de negocio están correctamente aisladas por `company_id`.

### **Testing**
- [ ] **Tests Unitarios Añadidos/Actualizados**: He añadido tests que prueban mis cambios.
- [ ] **Tests de Integración Añadidos/Actualizados**: Si aplica, he añadido tests para las interacciones entre componentes/servicios.
- [ ] **Cobertura de Código**: La cobertura de los tests es igual o superior al 80% para las áreas modificadas.
- [ ] **Todos los Tests Pasan**: El pipeline de CI (`npm run test:ci`) pasa exitosamente.

### **Documentación**
- [ ] **JSDoc/TSDoc**: He documentado funciones y lógica complejas.
- [ ] **Guías de Usuario Actualizadas**: Si este cambio afecta al usuario final, la documentación en `docs/user-documentation` ha sido actualizada.
- [ ] **Comandos Documentados**: Si se añadieron nuevos scripts, están documentados en `COMMANDS.md`.

### **Revisión y Despliegue**
- [ ] **Auto-Revisión**: He realizado una auto-revisión de mi propio código.
- [ ] **Cambios en la Base de Datos**: Si hay cambios en la BD, se ha creado el correspondiente archivo de migración.
- [ ] **Variables de Entorno**: Si se añadieron nuevas variables de entorno, están documentadas y actualizadas en `.env.example`.

## 🤔 **Consideraciones Adicionales**

<!--
¿Hay algo más que los revisores deban saber?
- Dependencias nuevas
- Decisiones de arquitectura importantes
- Posibles riesgos o deuda técnica introducida
-->

...

## Description
Brief description of the changes made in this PR.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)
- [ ] Performance improvement
- [ ] Test addition/update

## How Has This Been Tested?
- [ ] Manual testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] Cross-browser testing

Test Configuration:
* Browser/Device:
* Node version:
* Operating System:

## Screenshots (if applicable)
Add screenshots to help reviewers understand the changes.

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

## Related Issues
Closes #(issue_number)
Fixes #(issue_number)
Resolves #(issue_number)

## Database Changes
- [ ] No database changes
- [ ] Database schema changes (requires migration)
- [ ] New tables/columns added
- [ ] Data migration required

If database changes, please describe:

## Breaking Changes
If this is a breaking change, please describe the impact and migration path:

## Additional Notes
Any additional information that reviewers should know:

### Checklist de cierre de solicitud

- [ ] Implementación realizada
- [ ] Documentación actualizada
- [ ] Tarea pendiente encontrada y cerrada
- [ ] Evidencia registrada en backlog central
- [ ] Validación de reglas y gobernanza ejecutada
- [ ] Notificación/comunicación al equipo (si aplica)
- [ ] Cumplimiento CMMI verificado

---

### Documentación de resolución de tareas pendientes (si aplica)

- Descripción de la tarea resuelta:
- Qué se hizo y por qué:
- Evidencia (commits, PRs, scripts, capturas, etc.):
- Referencias cruzadas (backlog, issues, docs):
- Notas técnicas o lecciones aprendidas:
