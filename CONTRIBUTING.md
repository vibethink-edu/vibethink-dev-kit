# CONTRIBUIR A LA PRÓXIMA GENERACIÓN DE SOFTWARE EMPRESARIAL

Este documento es más que una guía de contribución; es nuestro manifiesto. Define nuestra filosofía de desarrollo, nuestros principios arquitectónicos y los estándares que nos garantizan construir software excepcional. Al contribuir, te unes a una misión: crear una plataforma que sea predecible, segura, inteligente, rentable y escalable.

## 🚀 Nuestra Filosofía: El Marco PACE

Toda decisión técnica, de producto o de arquitectura se filtra a través de nuestro sistema de valores: el **Marco PACE**. Este marco equilibra las demandas del mundo real y garantiza que construyamos un sistema robusto y preparado para el futuro.

- **P - Predictable & Secure (Predecible y Seguro):**
  - **Predecible:** El sistema debe comportarse como se espera, siempre. La consistencia en la UI, los datos y el rendimiento no es negociable.
  - **Seguro:** La seguridad es la base. Implementamos aislamiento de tenants (company_id en CADA consulta), políticas RLS a nivel de base de datos y permisos granulares por rol y departamento. La seguridad no se añade, se integra desde el diseño.

- **A - Augmented Experience (Experiencia Aumentada):**
  - Vamos más allá de una buena UX. Integramos la IA para potenciar al usuario, automatizar tareas tediosas y proporcionar insights proactivos.
  - El rendimiento es una feature clave. Interfaces que manejan miles de registros sin pestañear (virtualización), metadatos pre-compilados para carga instantánea y respuestas optimistas son el estándar.

- **C - Cost-Efficient (Rentable):**
  - Diseñamos soluciones que son eficientes en costos tanto para nosotros como para nuestros clientes.
  - Optimizamos el uso de recursos en la nube, elegimos tecnologías que ofrecen el mejor valor y construimos flujos de trabajo que reducen el costo operativo.

- **E - Extensible & Scalable (Extensible y Escalable):**
  - Construimos sobre una base que puede crecer. La arquitectura es modular, permitiendo añadir nuevas funcionalidades sin romper las existentes (Principio Abierto/Cerrado).
  - La plataforma está diseñada para escalar horizontalmente, desde la base de datos hasta los servicios, para soportar desde una startup hasta una gran corporación.

---

## 🏛️ Nuestros Pilares Arquitectónicos

Nuestra filosofía se traduce en decisiones arquitectónicas concretas que nos diferencian.

### 1. Modelo de Usuario Centrado en la Persona
- **Concepto:** Un `Usuario` (persona física) es una entidad global que puede tener `Membresías` en múltiples `Compañías Cliente` (Workspaces).
- **Porqué:** Resuelve de forma nativa casos de uso complejos como consultores que trabajan para varios clientes o dueños con múltiples empresas, ofreciendo una experiencia de usuario fluida y unificada.

### 2. Arquitectura de Conocimiento de Triple Capa
- **Concepto:** Un sistema de RAG (Retrieval-Augmented Generation) que consulta información en tres capas jerárquicas:
    1. **Capa 3 (Privada del Cliente):** Conocimiento normativo y operativo, específico y seguro de cada compañía.
    2. **Capa 2 (Global Curada):** Nuestra base de conocimiento centralizada con leyes, decretos y guías validadas por expertos.
    3. **Capa 1 (Internet Pública):** Un fallback para información general cuando las capas internas no tienen respuesta.
- **Porqué:** Garantiza respuestas de IA relevantes, seguras, auditables y precisas, protegiendo la confidencialidad del cliente.

### 3. Global por Diseño (Global by Design)
- **Concepto:** La plataforma tiene una lógica base estándar y un **Modelo de "Overrides" Jurisdiccionales**. Las variaciones por país (impuestos, formatos de fecha, regulaciones) se gestionan como excepciones sobre la norma.
- **Porqué:** Nos permite escalar a nuevos mercados de forma rápida y ordenada, sin duplicar código ni lógica de negocio.

### 4. Documentación Continua como Código
- **Concepto:** Toda decisión de negocio, arquitectura o técnica relevante **debe** ser documentada inmediatamente como una Pregunta Frecuente (FAQ) estructurada.
- **Porqué:** Crea una base de conocimiento viva y sincronizada con el producto, acelera el onboarding, reduce la ambigüedad y preserva el "porqué" detrás de nuestras decisiones.

---

## 🛠️ Guía Práctica de Contribución

Ahora que entiendes nuestra filosofía, aquí tienes las reglas prácticas del juego.

### Flujo de Trabajo (Git)

1.  **Crea una Rama:** Desde la rama `main`, crea una rama descriptiva.
    ```bash
    # Para nuevas funcionalidades
    git checkout -b feature/nombre-descriptivo-de-feature

    # Para corrección de errores
    git checkout -b fix/bug-a-corregir
    ```
2.  **Nomenclatura de Ramas:**
    - `feature/`: Para nuevas características.
    - `fix/`: Para corrección de bugs.
    - `docs/`: Para cambios exclusivos en documentación.
    - `refactor/`: Para refactoring de código sin cambio de funcionalidad.
    - `test/`: Para añadir o corregir tests.
    - `chore/`: Para tareas de mantenimiento (actualizar dependencias, etc.).

3.  **Commits Convencionales:** Usamos [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). Es obligatorio.
    ```bash
    # Ejemplo de commit para una nueva feature
    git commit -m "feat(billing): añadir soporte para facturación en USD y COP"

    # Ejemplo de commit para un bug fix
    git commit -m "fix(auth): corregir redirección después del login en Safari"
    ```
    - **Tipos permitidos:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`.

4.  **Pull Requests (PRs):**
    - Empuja tu rama a GitHub y crea un Pull Request contra `main`.
    - Utiliza la plantilla de PR proporcionada en GitHub.
    - Asegúrate de que los checks de CI/CD pasen (linting, tests, build).
    - Un PR debe ser revisado y aprobado por al menos otro miembro del equipo antes de hacer merge.

### Estándares de Código

- **Idioma:** Todo el código, comentarios y documentación deben estar en **inglés**, excepto los archivos de localización (`.json`).
- **TypeScript Estricto:** `strict: true` es la norma. Evita el uso de `any` a toda costa.
- **React:**
    - Componentes funcionales con Hooks.
    - Interfaces de Props claras y explícitas (`interface ComponentProps`).
    - Mantén los componentes pequeños y enfocados (Principio de Responsabilidad Única).
- **Estilos:**
    - **Tailwind CSS** es la única herramienta para estilos. No se permite CSS personalizado.
    - Utiliza los componentes de **shadcn/ui** siempre que sea posible.
- **Nomenclatura:**
    - `PascalCase` para componentes React y tipos/interfaces (`MyComponent`, `UserRole`).
    - `camelCase` para funciones, hooks y variables (`useAuth`, `companyId`).

### Testing
- El código nuevo debe venir acompañado de tests relevantes.
- Usamos Vitest para tests unitarios y de integración.
- Los flujos críticos deben tener tests E2E con Playwright (en el futuro).

---

## 🤝 Protocolos de Colaboración

### Sesiones de Pair Programming
- **Inicio de Sesión:** Al comenzar una sesión, se debe confirmar la identidad de los participantes y la fecha para la correcta atribución de la documentación generada.
- **Cierre de Sesión:** Al finalizar, se debe resumir lo logrado, los próximos pasos y documentar cualquier decisión en el sistema de FAQs.

### Toma de Decisiones Arquitectónicas
- Las decisiones significativas que afecten la estructura, la tecnología o los principios del proyecto deben ser documentadas a través de un **Architecture Decision Record (ADR)**.

---

Al contribuir, no solo estás escribiendo código. Estás construyendo un sistema de acuerdo a una visión.

**¡Gracias por ser parte de esta misión!** 🎉

## Gestión y Sincronización de Reglas de Proyecto e IDE

> **Las reglas de proyecto son la fuente de verdad. Toda regla nueva o modificada debe ser validada y sincronizada con las reglas del IDE y herramientas automáticas.**

### Flujo Obligatorio

1. **Creación/Modificación de Regla de Proyecto**
   - Toda nueva regla se documenta en el repositorio (ej: `CONTRIBUTING.md`, `docs/naming_convention.md`, etc.).
2. **Validación Automática**
   - Se ejecuta un script o proceso (manual o CI/CD) que:
     - Revisa las reglas del IDE (`.CursorRules`, `.vscode/settings.json`, linters, etc.).
     - Compara la nueva regla con las existentes en el IDE/herramientas.
     - Detecta conflictos, duplicidades o desalineaciones.
3. **Notificación y Confirmación**
   - Si hay conflicto, el sistema (o la IA) notifica al responsable.
   - Se solicita confirmación para proceder con el cambio necesario (en el IDE o en la regla de proyecto).
4. **Sincronización**
   - Se actualizan las reglas del IDE y/o del proyecto para mantener coherencia.
   - Se documenta el cambio y se comunica al equipo.
5. **Auditoría y Seguimiento**
   - Todo el proceso queda registrado (en logs, PRs, o documentación).
   - Se revisa periódicamente la alineación entre reglas de proyecto y del IDE.

### Ejemplo de Implementación

- **Script de validación**:  Un script en `scripts/validate-rules-sync.js` que compara las reglas de naming, linting, formateo, etc., entre los archivos de configuración del proyecto y los del IDE.
- **Integración en CI/CD**:  Añadir un paso en el pipeline que ejecute este script y bloquee el merge si hay desalineación.
- **Notificación automática**:  El script puede enviar un mensaje (por ejemplo, por Slack, email, o comentario en PR) si detecta conflicto.

## Integración recomendada en CI/CD

> **Recomendación:**  
> Se recomienda integrar el script `scripts/validate-rules-sync.js` en el pipeline de CI/CD para asegurar que todas las reglas de naming, linting y formateo estén alineadas entre el proyecto y el IDE.  
> Esto previene conflictos, mejora la calidad del código y garantiza una experiencia de desarrollo consistente para todo el equipo.

### Ejemplo de integración en GitHub Actions

```yaml
# .github/workflows/ci.yml
jobs:
  validate-rules:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Instalar dependencias
        run: npm ci
      - name: Validar sincronización de reglas de proyecto e IDE
        run: node scripts/validate-rules-sync.js
```

**¿Por qué dejarlo documentado aunque no se use aún?**
- Permite adopción rápida en el futuro.
- Facilita auditorías y revisiones de calidad.
- Demuestra madurez y visión de ingeniería.
- Sirve como referencia para nuevos miembros del equipo.

## Trazabilidad y cierre de tareas de reglas de proyecto

- Antes de implementar una nueva regla de proyecto, consulta el sistema único de tareas pendientes (backlog central del proyecto).
- Si existe una tarea relacionada (de tipo "Regla del Proyecto"), márcala como realizada tras la implementación exitosa de la regla.
- Si no existe, crea la tarea en el backlog y ciérrala tras la implementación.
- El backlog central es la única fuente de verdad para el seguimiento de reglas y pendientes.
- Este flujo asegura trazabilidad, evita duplicidades y permite auditoría completa del proceso de mejora continua.

## Principio de Documentación Automática

Todo cambio solicitado que afecte reglas, procesos, scripts, automatizaciones, arquitectura u otros aspectos relevantes del proyecto será documentado de forma inmediata y trazable, salvo que el usuario indique explícitamente lo contrario.

- No es necesario recordarlo en cada solicitud: la documentación es automática por defecto.
- Cada cambio quedará registrado en el lugar adecuado (README, CONTRIBUTING.md, changelog, backlog, etc.), con contexto, fecha y responsable.
- Esto garantiza trazabilidad, auditoría y mejora continua en el proyecto.

# Resumen de Gobernanza Documental

## 1. Metodología de Gestión de Proyectos
- Este proyecto utiliza la metodología VTK 1.0 como marco de referencia para la gestión de tareas, reglas, procesos y mejora continua.
- Documentación oficial: `docs/methodology/VTK_METHODOLOGY.md`

## 2. Sistema de Testing Centralizado
- Herramientas principales: Vitest (unit/integration), Playwright (E2E)
- Estructura de tests: `/tests/unit/`, `/tests/integration/`, `/tests/e2e/`
- Documentación de testing: `docs/testing/`
- Para ejecutar todos los tests: `npm run test:all`

## 3. Reglas de Proyecto y Backlog Central
- Todas las reglas de proyecto (naming, linting, automatización, etc.) están documentadas y versionadas en el repositorio.
- El backlog central único para tareas y reglas se encuentra en: `docs/vtk_backlog.yaml`

## 4. Principio de Documentación Automática
- Todo cambio relevante solicitado será documentado de forma inmediata y trazable, salvo que el usuario indique lo contrario.

## 5. Checklist de Gobernanza para Nuevos Proyectos
- [x] Metodología definida y referenciada
- [x] Sistema de testing documentado y centralizado
- [x] Reglas de proyecto documentadas y versionadas
- [x] Backlog central único para tareas y reglas
- [x] Principio de documentación automática explícito

## Documentación obligatoria al resolver tareas pendientes

Siempre que se resuelva una tarea pendiente, desde cualquier punto (PR, issue, script, merge, automatización, etc.), se debe adjuntar o enlazar toda la documentación relevante que clarifique la resolución para el equipo de desarrollo.

- Explicación clara de qué se hizo, por qué y cómo se resolvió.
- Evidencia: enlaces a commits, scripts, pruebas, capturas, logs, etc.
- Referencia cruzada: enlace a la tarea en el backlog, issue, PR, o documento relacionado.
- Lecciones aprendidas o notas técnicas (si aplica).

### Ejemplo de cierre de tarea pendiente

```
### Resolución de tarea pendiente: "Definir naming convention"

- Implementación: Se creó y documentó la convención en `docs/naming_convention.md`.
- Script de validación actualizado: `scripts/validate-rules-sync.js`.
- Tarea marcada como realizada en `docs/vtk_backlog.yaml`.
- Evidencia: [Commit abc123](enlace), [PR #45](enlace).
- Notas: Se detectó y resolvió un conflicto previo con ESLint.
```

# Principios de Evidencia y Gobernanza para Sistemas de Calidad y Metodología

## 1. Evidencia aislada y organizada
- Toda evidencia relevante para sistemas de calidad/metodología (CMMI, ISO, VTK, etc.) debe almacenarse en una carpeta dedicada y organizada (ej: `docs/cmmi/evidence/`).
- Los reportes deben tener formato estandarizado: fecha, responsable, descripción, referencia a proceso/metodología, categoría, cumplimiento_metodologia.

## 2. Automatización y centralización
- Los scripts y procesos automáticos deben copiar la evidencia relevante a la carpeta de evidencia de calidad/metodología.
- Se debe mantener un índice actualizado de la evidencia para facilitar la auditoría por parte de los equipos de calidad/metodología.
- La evidencia de QA de software debe mantenerse separada de la evidencia de calidad/metodología.

## 3. Principio de documentación automática
- Todo cambio relevante solicitado será documentado de forma inmediata y trazable, salvo que el usuario indique lo contrario.

## 4. Principio de trazabilidad y cierre de tareas
- Toda tarea pendiente resuelta debe dejar evidencia clara, enlazada y comprensible para el equipo de desarrollo y de calidad.

## 5. Principio de checklist de cierre de solicitud
- Al finalizar cualquier solicitud relevante, se debe generar un resumen estructurado de cumplimiento (implementación, documentación, cierre de tarea, evidencia, validación, notificación, cumplimiento CMMI).

## 6. Principio de notificación y escalado automático
- Si un proceso automático no puede resolver una tarea tras N intentos, debe crear un caso de desarrollo y notificar/escalar automáticamente.

## 7. Principio de centralización y acceso para equipos de calidad/metodología
- La evidencia debe estar accesible, categorizada y documentada para los equipos de calidad/metodología, independiente de los detalles técnicos de desarrollo.

---

### Ejemplo de política

> Todo proyecto que implemente un sistema de calidad (CMMI, ISO, VTK, etc.) debe almacenar la evidencia relevante para ese sistema en una carpeta dedicada y organizada (ej: `docs/cmmi/evidence/`). Los reportes deben estar en formato estandarizado, con campos de fecha, responsable, descripción, referencia a proceso/metodología y categoría. Los scripts y procesos automáticos deben copiar la evidencia relevante a esta carpeta. Se debe mantener un índice actualizado de la evidencia para facilitar la auditoría por parte de los equipos de calidad/metodología. La evidencia de QA de software debe mantenerse separada de la evidencia de calidad/metodología.

> Nota: El sistema de control de acceso y seguridad para la evidencia y los logs de calidad/metodología está pendiente de implementación. Actualmente el acceso es abierto por ser unipersonal, pero está planificado para futuras fases conforme crezca el equipo. Esto afecta temporalmente la madurez de la metodología VTK en el área de seguridad y gobernanza, pero está documentado y trazado como tarea pendiente.
