# Component Evaluation & Adoption Guidelines

> **ES:** Guía para evaluar, adaptar e implementar componentes inspirados en Bundui Premium (o cualquier SaaS premium) en VibeThink Orchestrator, asegurando desacoplamiento, cumplimiento legal y calidad.
>
> **EN:** Guidelines for evaluating, adapting, and implementing components inspired by Bundui Premium (or any premium SaaS) in VibeThink Orchestrator, ensuring decoupling, legal compliance, and quality.

---

## 1. Inspiración vs. Implementación
- **Se permite inspirarse visual y funcionalmente** en Bundui Premium, Bundui Free o cualquier SaaS de referencia.
- **No se permite copiar código fuente** ni dependencias propietarias.
- **Todo componente debe ser reimplementado** usando React, Tailwind y utilidades propias.

## 2. Criterios de Evaluación para Nuevos Componentes

### 2.1. Desacoplamiento
- El componente **no debe depender de librerías propietarias** (ni Bundui Premium, ni Free, ni closed source).
- Debe estar implementado en `src/shared/components/` o la carpeta correspondiente.
- Usar solo dependencias open source aprobadas (React, Tailwind, etc.).

### 2.2. Branding y Arquitectura
- Cumplir con las reglas de branding: **nunca usar nombres, logos ni estilos propietarios**.
- Seguir la arquitectura y convenciones de VibeThink Orchestrator (naming, estructura, imports).
- Documentar el componente con JSDoc/TSDoc y ejemplos de uso.

### 2.3. Legal y Licenciamiento
- Verificar que **no se copia código ni assets** sujetos a copyright/licencia restrictiva.
- Registrar la fuente de inspiración (ej: "Inspirado en Bundui Premium vX.X, sección Dashboard") en el comentario inicial del archivo.
- Validar que la implementación es 100% propia antes de mergear.

### 2.4. Calidad y Mantenibilidad
- El componente debe ser **fácil de testear** (unit, integration, e2e).
- Debe tener ejemplos de uso y documentación interna.
- Seguir patrones de desacoplamiento y reutilización (props claros, sin lógica hardcodeada).
- Cumplir con los linters, tests y validaciones automáticas del monorepo.

---

## 3. Proceso de Adopción

1. **Propuesta:**
   - Registrar el componente a evaluar (nombre, inspiración, objetivo).
2. **Evaluación Técnica:**
   - Revisar si existe ya un componente similar en el monorepo.
   - Analizar la viabilidad de reimplementación desacoplada.
3. **Implementación:**
   - Crear el componente desde cero, siguiendo los criterios anteriores.
   - Documentar y testear.
4. **Revisión:**
   - Validar desacoplamiento, branding, legalidad y calidad.
   - Revisar con el equipo antes de mergear.
5. **Adopción:**
   - Integrar en el dashboard o app correspondiente.
   - Registrar la decisión en la documentación técnica.

---

## 4. Ejemplo de Comentario Inicial en un Componente

```typescript
/**
 * @component ActivityTimeline
 * @description Timeline de actividad inspirado visualmente en Bundui Premium v2.0 (no se copia código, solo UX/UI)
 * @author Equipo VibeThink
 * @compliance
 *   - Desacoplado de Bundui
 *   - Cumple branding y arquitectura VibeThink
 *   - 100% código propio
 * @example
 * <ActivityTimeline events={events} />
 */
```

---

## 5. Checklist de Validación
- [ ] ¿El componente es 100% propio y desacoplado?
- [ ] ¿No hay código ni assets propietarios?
- [ ] ¿Cumple branding y arquitectura?
- [ ] ¿Está documentado y testeado?
- [ ] ¿Se registró la fuente de inspiración?
- [ ] ¿Pasó linters y validaciones automáticas?

---

## 6. Ejemplo de evaluación y adopción: React Flow

> **Caso real:** Integración de un componente open source premium para diagramas interactivos.

### 6.1. Propuesta
- **Componente:** [React Flow](https://reactflow.dev/)
- **Inspiración:** Necesidad de diagramas tipo flowchart, similar a SaaS premium de automatización.
- **Objetivo:** Permitir a los usuarios crear, editar y visualizar flujos de trabajo visuales.

### 6.2. Evaluación Técnica y Legal
- **Licencia:** MIT (open source, uso comercial permitido).
- **Desacoplamiento:** No depende de Bundui ni de SaaS propietarios. Se instala vía npm/yarn.
- **Branding:** Se personaliza el theme y los nodos para cumplir con la UX/UI de VibeThink Orchestrator.
- **Legal:** Se documenta la fuente y la licencia en el comentario inicial y en la documentación técnica.
- **Calidad:** Wrapper propio para facilitar upgrades y desacoplamiento futuro. Testeable con Vitest/testing-library.

### 6.3. Implementación

```typescript
/**
 * @component WorkflowEditor
 * @description Editor visual de flujos basado en React Flow (MIT License). Inspirado en UX de SaaS premium de automatización.
 * @author Equipo VibeThink
 * @compliance
 *   - 100% desacoplado de Bundui y cualquier SaaS propietario
 *   - Cumple branding y arquitectura VibeThink
 *   - Licencia MIT, uso permitido y documentado
 * @example
 * <WorkflowEditor nodes={nodes} edges={edges} onNodesChange={...} onEdgesChange={...} />
 */
import React from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

export const WorkflowEditor = ({ nodes, edges, onNodesChange, onEdgesChange }) => (
  <div style={{ width: "100%", height: 500 }}>
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      fitView
    >
      <Background />
      <Controls />
    </ReactFlow>
  </div>
);
```

### 6.4. Proceso de revisión y adopción
- Validar checklist de desacoplamiento, branding, legalidad y calidad.
- Revisar con el equipo antes de mergear.
- Integrar en el dashboard o app correspondiente.
- Registrar la decisión en la documentación técnica.

---

> **Actualizado por VITA – Última revisión: 2024-07-25** 