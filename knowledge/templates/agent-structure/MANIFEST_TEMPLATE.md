# 🤖 AGENT MANIFEST TEMPLATE (SEED)

> **⚠️ ESTO ES UNA PLANTILLA DEL DEV-KIT**
> No editar este archivo directamente para un proyecto.
> **Instrucción de siembra:** Copia este archivo a `/.agents/MANIFEST.md` en tu proyecto y personalízalo.
> Ver: `knowledge/architecture/HARVESTING_STRATEGY.md`

# 🤖 AGENT MANIFEST - [Project Name] v1

> **⚠️ TODOS LOS AGENTES DEBEN LEER ESTE DOCUMENTO PRIMERO**

Este directorio (`.agents/`) contiene toda la información necesaria para que **agentes autónomos** (de Cursor, Antigravity, Claude Code, etc.) puedan colaborar en el desarrollo de OVI Platform v1.

---

## 📍 Ubicación y Propósito

**Carpeta:** `.agents/` (raíz del proyecto)
**Propósito:** Fuente de verdad para desarrollo multi-agente
**Prioridad:** SIEMPRE en contexto de agentes

---

## 📋 Índice de Documentos

### 📐 ARQUITECTURA (Obligatorio)

**Archivo:** `.agents/ARCHITECTURE.md`

**Descripción:** Arquitectura completa del sistema consolidada en un solo documento
**Contenido:**
- Visión general del proyecto (v0.6.7 → v1.0)
- Stack tecnológico completo
- Estructura del monorepo
- Sistema de Tiers de Payload Core (Tier 1: Esenciales, Tier 2: Comunes, Tier 3: Especializados)
- Multi-tenancy y configuración por opciones
- Frontend con Astro + React Islands
- Estrategias de deployment
- Diagramas de flujo de datos
- Principios de seguridad

**Cuándo Leer:** ⭐ ANTES de empezar cualquier tarea de desarrollo

**📖 Lectura Recomendada:**
Este es el documento más importante. Léelo completo al menos una vez para entender toda la arquitectura.

---

### 🔐 SEGURIDAD Y ESTÁNDARES (Obligatorio)

**Archivo:** `.agents/guides/SECURITY.md`

**Descripción:** Consolidado completo de seguridad, estándares y mejores prácticas
**Contenido:**
- **Parte 1:** Seguridad y Convenciones
  - OWASP Top 10 (SQL Injection, XSS, CSRF, etc.) con ejemplos
  - Naming conventions (Collections, Fields, Components, etc.)
  - File size limits (código, media, database, API)
  - Performance best practices
  - Testing standards
- **Parte 2:** Versionado y Secrets
  - Semantic Versioning 2.0.0
  - Version visibility en footer
  - API key protection
  - Secrets audit scripts
  - Pre-commit hooks

**Cuándo Leer:** ⭐ ANTES de escribir cualquier código y ANTES de hacer commits

---

### 📋 COORDINACIÓN ENTRE AGENTES

**Carpeta:** `.agents/coordination/`

| Archivo | Descripción | Cuándo Usar |
|---------|-------------|-------------|
| **`AGENT_PROTOCOL.md`** | Protocolo de comunicación entre agentes | Antes de crear PRs/Issues |
| **`TASK_ASSIGNMENTS.md`** | Asignaciones de tareas actuales | Al empezar nueva tarea |
| **`GITHUB_WORKFLOW.md`** | Workflow completo de GitHub Projects | Al crear issues/PRs |

**🤝 Colaboración:**
Siempre consulta `TASK_ASSIGNMENTS.md` para evitar conflictos con otros agentes.

---

### 🗂️ CONTEXTO DEL PROYECTO

**Carpeta:** `.agents/context/`

| Archivo | Descripción | Cuándo Leer |
|---------|-------------|-------------|
| **`LEGACY_V0.md`** | Información del proyecto v0.6.7 (React SPA) consolidada | Al migrar código legacy |
| **`DATA_SOURCES.md`** | Ubicación de datos actuales | Al crear scripts de migración |
| **`LOCAL_DEVELOPMENT_STRATEGY.md`** | Setup local y deployment | Al configurar entorno |
| **`GETTING_STARTED.md`** | Guía rápida de inicio | Primera vez en el proyecto |

---

### 📚 GUÍAS ESPECIALIZADAS

**Carpeta:** `.agents/guides/`

| Archivo | Descripción | Cuándo Leer |
|---------|-------------|-------------|
| **`SECURITY.md`** | ⭐ Seguridad, convenciones, versionado y secrets | ANTES de escribir código |
| **`STACK_COMPATIBILITY.md`** | Matriz de compatibilidad validada del stack | Al setup inicial |
| **`APPROVAL_WORKFLOW.md`** | Sistema editorial (draft→review→approved→published) | Al implementar workflow |
| **`AI_ASSISTANT.md`** | Integración de IA para sugerencias de contenido | Al implementar AI features |

---

## 🎯 Protocolo de Trabajo para Agentes

### Al Iniciar una Tarea:

```markdown
1. ✅ Leer este MANIFEST.md
2. ✅ Leer .agents/ARCHITECTURE.md (arquitectura completa)
3. ✅ Leer .agents/guides/SECURITY.md (seguridad y estándares)
4. ✅ Revisar .agents/coordination/TASK_ASSIGNMENTS.md
5. ✅ Leer documentos relevantes en .agents/context/ y .agents/guides/
6. ✅ Iniciar desarrollo siguiendo estándares
```

### Al Completar una Tarea:

```markdown
1. ✅ Ejecutar tests y validaciones
2. ✅ Verificar que cumples estándares de SECURITY.md
3. ✅ Crear PR con formato: `{tipo}({scope}): {descripción}`
4. ✅ Actualizar .agents/coordination/TASK_ASSIGNMENTS.md (marcar completado)
5. ✅ Comentar en issue relacionado
```

### Si Te Bloqueas:

```markdown
1. ✅ Crear comment en issue explicando bloqueo
2. ✅ Agregar label `[blocked]` al issue
3. ✅ Proponer alternativa temporal (mock, stub)
4. ✅ Continuar con otra tarea independiente
```

---

## 🚨 Reglas Críticas

### ❌ NUNCA HACER:

1. **Modificar archivos** en `.legacy/` (están preservados, no modificables)
2. **Cambiar asignaciones** en `TASK_ASSIGNMENTS.md` de otros agentes
3. **Eliminar o renombrar** archivos en `.agents/` sin consenso
4. **Hacer merge a `main`** (solo humanos aprueban merges)
5. **Exponer API keys o secrets** en código (ver SECURITY.md)

### ✅ SIEMPRE HACER:

1. **Seguir SECURITY.md** para convenciones y límites
2. **Crear PRs pequeños** (1 feature = 1 PR)
3. **Escribir tests** para tu código
4. **Validar seguridad** antes de PR (OWASP Top 10)
5. **Comunicar bloqueos** rápidamente

---

## 📊 Estado Actual del Proyecto

**Versión:** 1.0.0-alpha.1
**Fase:** Bootstrap & Setup (Semana 1 de 9)
**Branch Actual:** `v1-payload`

### Tareas en Progreso:

Ver: `.agents/coordination/TASK_ASSIGNMENTS.md`

### Próximos Hitos:

1. **Semana 1:** Monorepo + Payload Setup
2. **Semana 2:** Modelo de datos completo
3. **Semana 3:** Migración de datos
4. **Semana 4-5:** Frontend Astro

---

## 🔗 Enlaces Importantes

- **Arquitectura:** `.agents/ARCHITECTURE.md` (documento principal)
- **Seguridad:** `.agents/guides/SECURITY.md` (obligatorio antes de codear)
- **Protocolo de Agentes:** `.agents/coordination/AGENT_PROTOCOL.md`
- **Asignaciones:** `.agents/coordination/TASK_ASSIGNMENTS.md`
- **GitHub Workflow:** `.agents/coordination/GITHUB_WORKFLOW.md`

---

## 🆘 ¿Dudas?

Si algo no está claro:

1. Busca en los documentos de `.agents/`
2. Consulta ARCHITECTURE.md para contexto general
3. Revisa SECURITY.md para estándares y convenciones
4. Crea un issue con tag `[question]`
5. Espera respuesta humana

---

## 📂 Estructura Final de `.agents/`

```
.agents/
├── MANIFEST.md                      # ⭐ Este archivo (empieza aquí)
├── README.md                        # Instrucciones de uso
├── ARCHITECTURE.md                  # ⭐ Arquitectura completa consolidada
│
├── context/                         # Contexto del proyecto
│   ├── LEGACY_V0.md                # Info v0.6.7 consolidada
│   ├── DATA_SOURCES.md             # Ubicación de datos
│   ├── GETTING_STARTED.md          # Quick start
│   └── LOCAL_DEVELOPMENT_STRATEGY.md
│
├── coordination/                    # Coordinación multi-agente
│   ├── AGENT_PROTOCOL.md           # Protocolo de comunicación
│   ├── TASK_ASSIGNMENTS.md         # Asignaciones actuales
│   └── GITHUB_WORKFLOW.md          # Workflow de GitHub
│
└── guides/                          # Guías especializadas
    ├── SECURITY.md                 # ⭐ Seguridad + estándares consolidados
    ├── STACK_COMPATIBILITY.md      # Compatibilidad del stack
    ├── APPROVAL_WORKFLOW.md        # Sistema editorial
    └── AI_ASSISTANT.md             # Asistente de IA
```

**Total:** 14 archivos markdown (reducido de 22 originales)

---

## 📝 Changelog de `.agents/`

### 2025-12-15 (v1.1.0) - Consolidación Mayor
- ✅ **CONSOLIDADO:** Arquitectura (3 archivos → 1)
  - ARCHITECTURE_OVERVIEW.md + PAYLOAD_CORE_ARCHITECTURE.md + IMPLEMENTATION_GUIDE.md
  - → ARCHITECTURE.md (900+ líneas organizadas)
- ✅ **CONSOLIDADO:** Seguridad y Estándares (2 archivos → 1)
  - SECURITY_AND_STANDARDS.md + VERSIONING_AND_SECRETS.md
  - → guides/SECURITY.md (1,604 líneas)
- ✅ **CONSOLIDADO:** Contexto legacy (2 archivos → 1)
  - AGENTS.md + TECH_STACK.md
  - → context/LEGACY_V0.md (400+ líneas)
- ✅ **MOVIDO A .legacy/:** Documentos duplicados o incluidos en consolidados
  - EXTENSIBILITY_GUIDE.md (incluido en ARCHITECTURE.md)
  - GITHUB_SPECIFICATION.md (duplicado de GITHUB_WORKFLOW.md)
  - UNIVERSAL_COLLECTIONS.md (incluido en ARCHITECTURE.md)
  - PAYLOAD_MIGRATION_PLAN.md (incluido en ARCHITECTURE.md)
- ✅ **RESULTADO:** 22 archivos → 14 archivos (-36% reducción)
- ✅ **PRESERVACIÓN:** 100% de información mantenida en .legacy/

### 2025-12-06 (v1.0.0) - Versión Inicial
- ✅ Creado estructura inicial de `.agents/`
- ✅ Creado MANIFEST.md
- ✅ Documentación completa de 20+ archivos

### Sistema Listo Para:
- ✅ Múltiples agentes colaborando en paralelo
- ✅ GitHub Projects como centro de coordinación
- ✅ Payload Core extensible y reutilizable
- ✅ Workflow de aprobación editorial
- ✅ Asistente de IA integrado
- ✅ Multi-tenancy opcional
- ✅ Seguridad validada (OWASP Top 10 + secrets protection)
- ✅ Stack completamente compatible y validado
- ✅ Versionado SemVer 2.0 con visibility en footer
- ✅ API keys protegidas (nunca expuestas en código)
- ✅ **NUEVO:** Documentación optimizada para consumo de OpenSpec

---

**Última actualización:** 2025-12-15
**Mantenido por:** Equipo OVI Platform
**Versión del Manifest:** 1.1.0
