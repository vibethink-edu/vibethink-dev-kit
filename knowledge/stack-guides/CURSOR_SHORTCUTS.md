# 🚀 Cursor Shortcuts & Configuration

**Versión:** 1.0.0  
**Última actualización:** 2025-12-12  
**Basado en:** Rob (Switch Dimension) - Cursor 2.0 Power Features

---

## 🎯 Propósito

Esta guía contiene los **atajos y configuraciones esenciales** de Cursor para maximizar productividad y mantener el **Flow State** (estado de flujo).

**Filosofía de Rob:**
- ⚡ Velocidad > Precisión (la IA corrige errores)
- 🎯 Teclado > Mouse (no romper el flujo)
- 🔇 Configuración > Distracciones (sonidos útiles, notificaciones off)

---

## ⚡ Atajos de Teclado (Memorízalos)

### **🤖 IA Commands (Los Más Importantes)**

| Atajo | Comando | Cuándo Usar |
|-------|---------|-------------|
| **`CMD/CTRL + I`** | **Composer** | Multi-file editing, refactors grandes, Design Mode |
| **`CMD/CTRL + K`** | **Inline Edit** | Cambios rápidos en selección, refactors pequeños |
| **`CMD/CTRL + L`** | **Chat Sidebar** | Preguntas, debugging, explicaciones |

**💡 Tip de Rob:** `CMD+I` (Composer) es el 80% de tu trabajo en Cursor 2.0. Domínalo.

---

### **🧭 Navegación (Flow State)**

| Atajo | Comando | Cuándo Usar |
|-------|---------|-------------|
| **`CMD/CTRL + E`** | **Toggle Focus** | Cambiar entre Editor ↔ Agent (sin mouse) |
| **`CMD/CTRL + B`** | **Toggle Sidebar** | Mostrar/ocultar explorador de archivos |
| **`CMD/CTRL + J`** | **Toggle Terminal** | Abrir/cerrar terminal |
| **`CMD/CTRL + SHIFT + B`** | **Build/Browser** | Compilar o abrir navegador (si está configurado) |

**💡 Tip de Rob:** `CMD+E` es el atajo más infrautilizado. Te ahorra 50+ clicks al día.

---

### **📝 Edición Rápida**

| Atajo | Comando | Cuándo Usar |
|-------|---------|-------------|
| **`CMD/CTRL + D`** | **Select Next** | Seleccionar siguiente ocurrencia |
| **`CMD/CTRL + SHIFT + L`** | **Select All** | Seleccionar todas las ocurrencias |
| **`ALT + UP/DOWN`** | **Move Line** | Mover línea arriba/abajo |
| **`CMD/CTRL + /`** | **Toggle Comment** | Comentar/descomentar |

---

### **🔍 Búsqueda y Navegación**

| Atajo | Comando | Cuándo Usar |
|-------|---------|-------------|
| **`CMD/CTRL + P`** | **Quick Open** | Abrir archivo por nombre |
| **`CMD/CTRL + SHIFT + F`** | **Search in Files** | Buscar en todo el proyecto |
| **`CMD/CTRL + G`** | **Go to Line** | Ir a línea específica |
| **`F12`** | **Go to Definition** | Ir a definición de función/variable |

---

## ⚙️ Configuración Recomendada

### **1. 🧠 Indexing & Docs (CRÍTICO)**

**Codebase Indexing:**
- ✅ **DEBE estar al 100%**
- Ubicación: `Cursor Settings > Features > Codebase Indexing`
- Sin esto, Cursor es solo ChatGPT sin contexto

**Docs (Documentación Externa):**
- ✅ **Agregar URLs de tu stack**
- Ubicación: `Cursor Settings > Features > Docs > Add Docs`
- Ver `CURSOR_SETUP.md` para lista completa de URLs

**Por qué es crítico:**
- Los modelos tienen conocimiento desactualizado (6+ meses)
- React 19, Vite 6, Next.js 15 son MUY nuevos
- Sin docs indexadas, la IA alucinará código obsoleto

---

### **2. 🔇 Notificaciones y Sonido**

**Completion Sound:**
- ✅ **ON** (activar)
- Ubicación: `Cursor Settings > Features > Completion Sound`

**Por qué activarlo (Tip de Rob):**
- Generaciones largas (Composer, Worktrees) tardan tiempo
- El sonido te avisa cuando termina
- Puedes hacer otra cosa mientras esperas (revisar Slack, etc.)
- No tienes que mirar la pantalla fijamente

**Otras notificaciones:**
- ❌ **OFF** (desactivar notificaciones innecesarias)
- Solo mantener completion sound

---

### **3. 🛡 Beta Features (Calidad de Código)**

**Agent Review (Bug Finder):**
- ✅ **ON** (activar)
- Ubicación: `Cursor Settings > Beta > Agent Review`

**Qué hace:**
- Revisa cambios antes de commit
- Detecta bugs lógicos (no solo syntax)
- Encuentra errores que ESLint no ve

**Cuándo se activa:**
- Automáticamente antes de commits
- Puedes invocar manualmente

---

### **4. 🔌 MCP Management (Gestión de Recursos)**

**MCP Servers:**
- ❌ **OFF por defecto**
- Ubicación: `Cursor Settings > Features > MCP`

**Qué son MCPs:**
- Model Context Protocol
- Herramientas externas (Google Search, Jira, etc.)
- Consumen ventana de contexto

**Estrategia de Rob:**
- Apagar TODOS al inicio
- Activar solo cuando necesites uno específico
- Desactivar cuando termines

**Ejemplo:**
```
Inicio de día: Todos OFF
Necesitas buscar en Google: Activar Google MCP
Terminas búsqueda: Desactivar Google MCP
```

---

### **5. 🔒 Privacy Mode (Opcional pero Importante)**

**Privacy Mode:**
- ⚠️ **Evaluar según proyecto**
- Ubicación: `Cursor Settings > Privacy > Privacy Mode`

**Cuándo activar:**
- Código propietario/sensible
- Proyectos de clientes
- Datos personales en código

**Qué hace:**
- Evita que tu código se use para entrenar modelos
- Desactiva telemetría
- Mantiene código local

**Cuándo NO activar:**
- Proyectos open source
- Código de aprendizaje
- No hay datos sensibles

---

## 📁 Archivos de Configuración

### **`.vscode/settings.json`**

Configuración pre-cargada para el equipo:

```json
{
  "cursor.cpp.enablePartialAccepts": true,
  "cursor.general.enableSound": true,
  "files.exclude": {
    "**/.git": true,
    "**/.DS_Store": true,
    "**/node_modules": true,
    "**/.vite": true,
    "**/dist": true
  },
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

**Ubicación:**
- Template en `_vibethink-dev-kit/.vscode/settings.json`
- Copiar a cada proyecto

---

### **`.vscode/keybindings.json`**

Atajos personalizados (opcional):

```json
[
  {
    "key": "ctrl+e",
    "command": "workbench.action.focusActiveEditorGroup",
    "when": "sideBarFocus"
  },
  {
    "key": "ctrl+e",
    "command": "workbench.action.focusSideBar",
    "when": "editorTextFocus"
  }
]
```

**Qué hace:**
- `CTRL+E` cambia foco entre Editor y Sidebar
- Funciona en ambas direcciones

---

## 🎯 Workflow Recomendado (Flow State)

### **Inicio de Sesión:**

1. **Verificar indexing:**
   - Abrir Cursor
   - Verificar que indexing esté al 100%
   - Si no, esperar a que termine

2. **Apagar MCPs:**
   - Ir a Settings > MCP
   - Desactivar todos los MCPs
   - Solo activar si necesitas uno específico

3. **Verificar docs:**
   - Settings > Docs
   - Verificar que URLs estén indexadas
   - Agregar nuevas si actualizaste dependencias

---

### **Durante el Día:**

**Usar atajos (no mouse):**
```
CMD+I → Composer (refactors grandes)
CMD+K → Inline edit (cambios rápidos)
CMD+E → Cambiar foco (Editor ↔ Agent)
CMD+B → Toggle sidebar (cuando necesites archivos)
CMD+J → Toggle terminal (para comandos)
```

**Escuchar el sonido:**
- Cuando Composer/Agent esté trabajando
- Haz otra cosa productiva
- El sonido te avisa cuando termina

**Usar Agent Review:**
- Antes de commits importantes
- Después de refactors grandes
- Cuando agregues features nuevas

---

### **Fin de Sesión:**

1. **Verificar cambios:**
   ```bash
   git status
   ```

2. **Agent Review:**
   - Revisar sugerencias
   - Aplicar fixes necesarios

3. **Commit:**
   ```bash
   git add -A
   git commit -m "descripción"
   ```

---

## 💡 Tips de Productividad (Rob)

### **1. Composer es tu mejor amigo**

**Cuándo usar Composer (`CMD+I`):**
- Refactors que afectan múltiples archivos
- Crear features nuevas (componente + service + types)
- Design Mode (experimentos de UI)
- Migraciones grandes

**Cuándo NO usar Composer:**
- Cambios de 1-2 líneas (usa `CMD+K`)
- Preguntas simples (usa `CMD+L`)

---

### **2. El atajo `CMD+E` te ahorra 50+ clicks al día**

**Antes:**
- Click en editor
- Click en agent
- Click en editor
- Click en agent
- ...

**Después:**
- `CMD+E` → Agent
- `CMD+E` → Editor
- `CMD+E` → Agent
- ...

**Ahorro:** ~2 segundos por cambio × 25 cambios/día = 50 segundos/día = 4 minutos/semana

---

### **3. Completion Sound = Multitasking**

**Sin sonido:**
- Miras pantalla esperando
- Pierdes 30-60 segundos mirando fijamente
- No puedes hacer otra cosa

**Con sonido:**
- Inicias generación
- Respondes Slack/Email
- Sonido te avisa
- Vuelves al código

**Ahorro:** ~30 segundos por generación larga × 10 generaciones/día = 5 minutos/día

---

### **4. Agent Review = Menos bugs en producción**

**Antes:**
- Commit sin revisar
- Bug pasa a producción
- 30 minutos debuggeando

**Después:**
- Agent Review detecta bug
- Arreglas en 2 minutos
- No pasa a producción

**Ahorro:** 28 minutos por bug evitado

---

## 🚨 Problemas Comunes

### **"Cursor está lento"**

**Solución:**
1. Verificar indexing (debe estar al 100%)
2. Apagar MCPs innecesarios
3. Cerrar archivos no usados
4. Reiniciar Cursor

---

### **"La IA usa código obsoleto"**

**Solución:**
1. Verificar que docs estén indexadas
2. Agregar URLs de documentación oficial
3. Reiniciar chat (contexto viejo persiste)

---

### **"`CMD+E` no funciona"**

**Solución:**
1. Verificar que no haya conflicto de atajos
2. Agregar keybinding manual (ver `.vscode/keybindings.json`)
3. Reiniciar Cursor

---

### **"No escucho el completion sound"**

**Solución:**
1. Verificar que esté activado en Settings
2. Verificar volumen del sistema
3. Probar con generación larga (Composer)

---

## 📊 Impacto Esperado

**Antes de optimizar:**
- ❌ 50+ clicks al día (cambiar foco)
- ❌ 10+ minutos esperando generaciones
- ❌ Bugs que pasan a producción
- ❌ Código obsoleto de la IA

**Después de optimizar:**
- ✅ 0 clicks (todo con teclado)
- ✅ 5 minutos recuperados (multitasking con sonido)
- ✅ Bugs detectados antes de commit
- ✅ Código actualizado (docs indexadas)

**Total:** ~15-20 minutos ahorrados por día = **1.5 horas por semana**

---

## 🔗 Referencias

- **Video de Rob:** Cursor 2.0 Power Features (Switch Dimension)
- **Cursor Docs:** https://docs.cursor.com
- **CURSOR_SETUP.md:** URLs de documentación oficial
- **AGENTS.md:** Design Mode y workflows

---

## ✅ Checklist de Setup

**Primera vez:**
- [ ] Verificar indexing al 100%
- [ ] Agregar URLs de docs (ver CURSOR_SETUP.md)
- [ ] Activar completion sound
- [ ] Activar Agent Review
- [ ] Desactivar MCPs innecesarios
- [ ] Copiar `.vscode/settings.json` a proyecto
- [ ] Probar atajos: `CMD+I`, `CMD+K`, `CMD+E`

**Mantenimiento semanal:**
- [ ] Verificar indexing
- [ ] Actualizar docs si cambiaron dependencias
- [ ] Revisar MCPs activos (apagar innecesarios)

---

**Última actualización:** 2025-12-12  
**Mantenido por:** VibeThink Team  
**Basado en:** Rob (Switch Dimension) - Cursor 2.0 Analysis
