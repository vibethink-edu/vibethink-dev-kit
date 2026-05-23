# Asignación Global de Puertos - VibeThink Projects

> **Versión:** 2.0
> **Última actualización:** 2026-04-06
> **Propósito:** Definir puertos fijos globales para todos los proyectos VibeThink
> **Alcance:** Todos los proyectos que heredan de `_vibethink-dev-kit`

---

## 🎯 Principio Fundamental

**Cada puerto tiene un propósito único y fijo.**
Los puertos asignados aquí son **estándar global** para todos los proyectos VibeThink.

### Regla de Split Producción / Revisión (v2.0)

| Rango | Propósito |
|-------|-----------|
| `< 5000` | **Producción / Canonical** — puertos estables del monorepo |
| `>= 5000` | **Review / Dev / Branch** — worktrees y branches de revisión |

**Patrón review:** `review_port = prod_port + 2000`
Ejemplos: Dashboard 3005 → review 5005, Admin 3010 → review 5010, Twin Studio 3031 → review 5031.

---

## 📋 Estrategia de Asignación Global

### **Rango 3000-3049: Aplicaciones Principales (Producción)**
Puertos para aplicaciones de producción y desarrollo de proyectos VibeThink.

### **Rango 3050-3099: Referencias y Demos Externas**
Puertos fijos para proyectos de referencia, demos de productos externos y documentación visual.

### **Rango 4000-4999: Servicios y Documentación**
Documentación (Starlight 4321), servicios auxiliares.

### **Rango 5000-5999: Review / Worktree / Branch Lane**
Puertos de revisión de Marcelo. Patrón `prod + 2000`. NUNCA usarlos para apps canónicas.

### **Rango 8000+: Backends y GPU Services**
Servicios backend, servidores GPU, proxies. Ej: Whisper Server (8765).

### **Rango 3100+: Testing y Desarrollo Temporal**
Puertos para pruebas temporales, experimentación y desarrollo ad-hoc.

---

## 🚀 Puertos Fijos Globales

### Aplicaciones Principales (Producción — < 5000)

#### **VibeThink Orchestrator** (3000-3099)
| Puerto | Aplicación | Estado | Notas |
|--------|------------|--------|-------|
| **3005** | Dashboard | SAGRADO | NEVER CHANGE |
| **3007** | Portal (tenant-web) | Activo | |
| **3010** | Admin / Control Tower | SAGRADO | NEVER CHANGE |
| **3031** | Twin Studio | Activo | |
| **3040** | Collab Server (Hocuspocus) | Activo | |
| **3050** | LABs Host | Activo | |
| **3060** | Viewer | Activo | |
| **4321** | Docs (Starlight) | Activo | |
| **5173** | FreeCut / Media Studio | Activo | Vite default, keep as-is |
| **8765** | Whisper Server (GPU, Python WS) | Activo | Backend only |

#### **Otros Proyectos VibeThink** (3010+)
| Puerto | Proyecto | Aplicación | Notas |
|--------|----------|------------|-------|
| **3010-3019** | Admin / Control Tower | Frontend/API | Ver tabla arriba |
| **3020-3029** | Mobile App | Dev Server | Reservado |
| **3030-3039** | Otros proyectos | - | Disponible |

> **📌 Regla v2.0:** Producción < 5000. Review >= 5000 (patrón prod+2000).

---

### Referencias y Demos Externas (3050-3099)

#### **Productos de Referencia Estándar**

| Puerto | Producto | Tipo | Ubicación |
|--------|----------|------|-----------|
| **3050** | **Bundui Premium** | Dashboard Kit | external reference codebase (lives in `vibethink-asset-library/codebases/`) |
| **3051** | **Shadcn UI Oficial** | Component Library | external reference codebase (`vibethink-asset-library/codebases/`) |
| **3052** | **React Flow** | Node-based UI | external reference codebase (`vibethink-asset-library/codebases/`) |
| **3053-3099** | **Disponibles** | Nuevas referencias | - |

> The reference-server start scripts live in each consuming project, not in this
> supra-repo. The reference codebases themselves live in `vibethink-asset-library`.

> **🔒 Puertos Fijos:** Estos puertos están **bloqueados globalmente** para estos productos específicos.
> **No cambiar** sin actualizar este documento y todos los scripts afectados.

---

### Testing y Desarrollo Temporal (3100+)

| Rango | Propósito | Uso |
|-------|-----------|-----|
| **3100-3199** | Testing temporal | Pruebas rápidas, experimentación |
| **3200-3299** | Desarrollo ad-hoc | Prototipos, POCs |
| **3300+** | Libre | Cualquier uso temporal |

### Review / Worktree / Branch Lane (5000-5999)

Los puertos de revisión siguen el patrón `prod_port + 2000`:

| Puerto Review | Puerto Prod | Módulo |
|---------------|-------------|--------|
| **5005** | 3005 | Dashboard review |
| **5007** | 3007 | Portal review |
| **5010** | 3010 | Admin review |
| **5031** | 3031 | Twin Studio review |
| **5050** | 3050 | LABs Host review |
| **5060** | 3060 | Viewer review |
| **5009** | — | Email Studio review |
| **5021** | — | Documents (Expedientes) review |
| **5023** | — | Meeting Companion review |
| **5025** | — | Correspondencia review (NEW) |
| **5173** | — | FreeCut review (Vite default) |

**Regla:** NUNCA usar puertos >= 5000 para la app canónica en `main`. Solo para worktrees y branches de revisión.

### Backends y GPU Services (8000+)

| Puerto | Servicio | Notas |
|--------|----------|-------|
| **8765** | Whisper Server (Python WebSocket) | GPU backend para transcripción |

---

## 🔄 Migración desde Puertos Antiguos

### Cambios Requeridos

Si tu proyecto usa puertos antiguos, migra a los nuevos:

| Puerto Antiguo | Puerto Nuevo | Producto |
|----------------|--------------|----------|
| 3006 | **3050** | Bundui Premium |
| 3007 | **3051** | Shadcn UI Oficial |
| 3008 | **3052** | React Flow |
| 8766 (erróneo) | **8765** | Whisper Server (bug fix offscreen.js) |

### Script de Migración

```powershell
# Actualizar scripts de referencia
# Reemplazar en todos los scripts:
# $PORT = 3006 → $PORT = 3050
# $PORT = 3007 → $PORT = 3051
# $PORT = 3008 → $PORT = 3052
```

---

## 📝 Convenciones de Nomenclatura

### Scripts de Referencia
- **Formato:** `start-{nombre}-reference.ps1`
- **Ubicación:** `scripts/` en cada proyecto
- **Puerto:** Variable `$PORT` definida al inicio (usar puertos 3050+)

### Variables de Entorno
- **Formato:** `PORT_{PRODUCTO}` (ej: `PORT_BUNDUI=3050`)
- **Ubicación:** `.env.example` en cada proyecto

---

## 🛠️ Herramientas de Gestión

### Verificar Puertos en Uso

```powershell
# Ver todos los puertos VibeThink (3000-3100)
Get-NetTCPConnection -State Listen |
    Where-Object { $_.LocalPort -ge 3000 -and $_.LocalPort -le 3100 } |
    Select-Object LocalPort, @{Name='Process';Expression={(Get-Process -Id $_.OwningProcess).ProcessName}}, State |
    Format-Table -AutoSize
```

---

## ✅ Checklist para Nuevos Proyectos

Al crear un nuevo proyecto VibeThink:

- [ ] Asignar bloque de 10 puertos (ej: 3040-3049)
- [ ] Documentar en `AGENTS.md` del proyecto
- [ ] Crear scripts con puertos fijos
- [ ] Actualizar este documento global
- [ ] Verificar que no hay conflictos

---

## 📋 Checklist para Nuevas Referencias

Al agregar una nueva referencia externa:

- [ ] Asignar puerto en rango 3050-3099
- [ ] Crear script `start-{nombre}-reference.ps1`
- [ ] Crear script `stop-{nombre}-reference.ps1`
- [ ] Actualizar `AGENTS.md` del proyecto
- [ ] Actualizar este documento global
- [ ] Verificar que no hay conflictos

---

## 🔗 Referencias Relacionadas

### En Dev-Kit
- **Methodology layer:** `knowledge/ai-agents/AGENTS_METHODOLOGY_VIBETHINK.md` §2 - cita este mapa de puertos como capa org (level 2)
- **AI Agents:** `knowledge/ai-agents/AGENTS_UNIVERSAL.md` - Reglas universales para AI agents

### En Proyectos
- `AGENTS.md` - Reglas específicas del proyecto (debe heredar este documento)
- `scripts/*.ps1` - Scripts de gestión de puertos (deben usar Port Manager)

---

## 📊 Tabla de Resumen Rápido

```
┌─────────────────────────────────────────────────────────┐
│ ASIGNACIÓN GLOBAL DE PUERTOS - VIBETHINK v2.0           │
├─────────────────────────────────────────────────────────┤
│ REGLA: Producción < 5000  |  Review >= 5000 (prod+2000) │
├─────────────────────────────────────────────────────────┤
│ 3000-3099: Aplicaciones Canónicas (Producción)         │
│   ├─ 3005: Dashboard  [SAGRADO]                        │
│   ├─ 3007: Portal                                      │
│   ├─ 3010: Admin/Control Tower  [SAGRADO]              │
│   ├─ 3031: Twin Studio                                 │
│   ├─ 3040: Collab Server                               │
│   ├─ 3050: LABs Host                                   │
│   └─ 3060: Viewer                                      │
├─────────────────────────────────────────────────────────┤
│ 4000-4999: Docs y Servicios                            │
│   └─ 4321: Docs (Starlight)                            │
├─────────────────────────────────────────────────────────┤
│ 5000-5999: Review / Worktree / Branch Lane             │
│   ├─ 5005: Dashboard review                            │
│   ├─ 5010: Admin review                                │
│   ├─ 5031: Twin Studio review                          │
│   └─ ...  (patrón: prod_port + 2000)                   │
├─────────────────────────────────────────────────────────┤
│ 5173: FreeCut / Media Studio (Vite default)            │
├─────────────────────────────────────────────────────────┤
│ 8000+: Backends y GPU Services                         │
│   └─ 8765: Whisper Server (Python WebSocket)           │
├─────────────────────────────────────────────────────────┤
│ 3100+: Testing y Desarrollo Temporal                   │
└─────────────────────────────────────────────────────────┘
```

---

## 🚨 Conflictos Conocidos y Soluciones

### Problema: Puerto en Uso
**Solución:** Usar scripts oficiales que verifican disponibilidad antes de iniciar.

### Problema: Múltiples Proyectos
**Solución:** Cada proyecto tiene su bloque de 10 puertos asignado.

### Problema: Referencias Manuales
**Solución:** Siempre usar scripts oficiales, nunca iniciar manualmente.

---

**Mantenedor:** VibeThink Team
**Versión:** 2.0
**Última revisión:** 2026-04-06
**Heredado por:** Todos los proyectos VibeThink
**Cambios v2.0:** Split rule prod<5000 / review>=5000. Tabla VTO completa. Whisper 8765 registrado. Patrón prod+2000 documentado.

