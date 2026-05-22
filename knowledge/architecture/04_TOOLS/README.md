# 🛠️ Principios de Heramientas (VThink 1.0)

> [!IMPORTANT]
> Este documento define los **Principios Metodológicos**. Para la **implementación técnica** y el uso del CLI, ver [VThink Dev-Kit](../../packages/cli/README.md).

## 🎯 Filosofía
En VThink, las herramientas no son opcionales; son la codificación de nuestra metodología. "Si es importante, debe ser automatizable".

## 📜 Estándares para Herramientas

### 1. Zero Friction
Las herramientas deben reducir la fricción, no aumentarla. Un desarrollador no debería necesitar consultar 5 manuales para ejecutar una tarea común.

### 2. Idempotencia
Los scripts deben ser capaces de ejecutarse múltiples veces sin causar efectos secundarios dañinos.

### 3. Validación Continua
Las herramientas deben actuar como "Quality Gates" automáticos, impidiendo que código que no cumple los estándares (definidos en [05_BEST_PRACTICES](../05_BEST_PRACTICES/)) llegue a producción.

## 🗂️ Categorías Metodológicas

- **Orquestación**: Coordinación de múltiples servicios (ej. `vtk start`).
- **Validación Pragmática**: Comprobaciones rápidas y útiles (ej. `vtk validate`).
- **Codemods**: Transformación automática de código (ej. actualizaciones de dependencias).
