# 🛡️ Política de Antivirus y Automatización - VibeThink Orchestrator

## Resumen

Para evitar bloqueos, falsos positivos y problemas de seguridad con antivirus (como Avast), **toda la automatización del entorno de desarrollo debe realizarse exclusivamente con scripts Node.js (`.js` o `.cjs`)**. Se prohíbe el uso de PowerShell para automatización en este proyecto.

---

## 🚨 Contexto y Lecciones Aprendidas

- **PowerShell** es frecuentemente bloqueado por antivirus modernos debido a su capacidad de manipular procesos y puertos.
- **Avast y otros antivirus** pueden marcar scripts legítimos como amenazas (falsos positivos) bajo heurísticas como `IDP.HELU.PSE46 - Command line detection`.
- Esto puede bloquear el flujo de trabajo, impedir la automatización y generar alertas innecesarias.

---

## ✅ Decisión de Mejor Práctica (Política Oficial)

- **Toda automatización debe migrarse a Node.js** (`.js` o `.cjs`).
- **No se permite PowerShell** para scripts de limpieza, verificación o inicio.
- **Scripts Node.js** son multiplataforma, más fáciles de mantener y menos propensos a bloqueos por antivirus.
- **No se deben agregar excepciones de antivirus** para PowerShell en entornos de desarrollo.

### ⚠️ Notación explícita de decisión (2025-07-05)
> A partir de esta fecha, **toda la automatización del entorno de desarrollo y build se migrará a Node.js**. Se eliminarán los scripts PowerShell existentes y no se crearán nuevos. Esta decisión es permanente y obligatoria para todo el equipo.

---

## 📝 Ejemplo de Documentación de Decisión

> "Siempre que se requiera automatización en el entorno de desarrollo, la solución debe implementarse en Node.js puro. Esto garantiza portabilidad, mantenibilidad y evita conflictos con antivirus. No se permite el uso de PowerShell para automatización en este proyecto."

---

## 🛠️ Ventajas de Node.js para Automatización
- ✅ No es bloqueado por antivirus
- ✅ Funciona igual en Windows, Mac y Linux
- ✅ No requiere permisos de administrador
- ✅ Fácil de mantener y auditar
- ✅ Integrable en pipelines CI/CD

## ⚠️ Desventajas de PowerShell
- ❌ Falsos positivos frecuentes en antivirus
- ❌ Bloqueos inesperados del entorno
- ❌ No portable (solo Windows)
- ❌ Requiere permisos elevados
- ❌ Difícil de mantener en equipos grandes

---

## 📋 Protocolo para Nuevos Scripts
1. **Automatización = Node.js**
2. **No PowerShell**
3. **Documentar la decisión en el PR**
4. **Verificar que el script funciona en Windows, Mac y Linux**
5. **Agregar tests si es posible**

---

## 🏷️ Etiquetas
- #seguridad
- #automatizacion
- #nodejs
- #mejores-practicas
- #antivirus

---

**Decisión documentada el 2025-07-05 por Marcelo Escallón, CEO, Euphorianet.**

**Nota de confidencialidad: Esta política es de cumplimiento obligatorio para todo el equipo de desarrollo.** 