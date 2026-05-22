# 🔧 VHELP UPDATE PROCESS - Proceso de Actualización

> **🎯 PURPOSE:** Documentación formal para mantener vhelp.cjs sincronizado con cambios del proyecto  
> **📋 SCOPE:** Cuándo, cómo y qué actualizar en el sistema de ayuda  
> **⚡ USAGE:** Consultar después de cambios significativos

---

## 🚨 **CUÁNDO ACTUALIZAR VHELP**

### **🔴 TRIGGER EVENTS CRÍTICOS (ACTUALIZACIÓN OBLIGATORIA)**

#### **1. 📦 Cambios en package.json scripts**
```bash
# WHEN: Se agregan, modifican o eliminan comandos npm
"scripts": {
  "new-command": "...",           # ✅ TRIGGER - comando nuevo
  "validate:quick": "modified"    # ✅ TRIGGER - comando modificado
}

# ACTION: Actualizar descriptions en generateDescription()
```

#### **2. 🏗️ Cambios de Workflow**
```bash
# WHEN: Se modifican workflows en AI_UNIFIED_RULES.md
# EXAMPLES:
- 4 niveles de validación → 3 niveles
- Cambio en workflow AI (Claude, OpenAI)
- Nuevas prioridades de comandos

# ACTION: Actualizar printFooter() workflow section
```

#### **3. 📚 Consolidación de Documentación**
```bash
# WHEN: Se consolidan o mueven archivos de documentación
# EXAMPLES:
- NPM_MONOREPO_RULES.md → AI_UNIFIED_RULES.md ✅ DONE
- Nuevos archivos de referencia crítica
- Cambios en SINGLE SOURCE OF TRUTH

# ACTION: Actualizar references en printFooter()
```

#### **4. 🎯 Cambios de Prioridades**
```bash
# WHEN: Se cambian comandos esenciales o prioridades
# EXAMPLES:
- validate:universal ya no es prioridad #1
- Nuevos comandos diarios esenciales
- Cambios en categoria priorities

# ACTION: Actualizar priorities object y printFooter()
```

### **🟡 TRIGGER EVENTS MENORES (ACTUALIZACIÓN RECOMENDADA)**

#### **5. 📝 Mejoras de Descripciones**
- Descripciones más claras o precisas
- Correcciones de typos o gramática
- Mejor categorización de comandos

#### **6. 🎨 Mejoras de UI/UX**
- Nuevos emojis o colores
- Mejor organización de output
- Más información contextual

---

## 🔧 **CÓMO ACTUALIZAR VHELP**

### **📋 PROCESO STEP-BY-STEP**

#### **STEP 1: 🔍 ANÁLISIS PRE-UPDATE**
```bash
# 1. Verificar comandos actuales vs vhelp
npm run vhelp > current_vhelp_output.txt
grep '"scripts"' package.json -A 50 > current_scripts.txt

# 2. Comparar para identificar gaps
diff current_vhelp_output.txt expected_output.txt
```

#### **STEP 2: 📝 ACTUALIZAR SECCIONES**

##### **A. generateDescription() - Líneas ~115-167**
```javascript
const descriptions = {
  // ✅ AGREGAR comandos nuevos
  'new-command': 'Descripción clara y concisa',
  
  // ✅ MODIFICAR descripciones existentes  
  'validate:quick': 'NIVEL 1 - Validación rápida (antes de empezar trabajo)',
  
  // ✅ USAR PREFIJOS para jerarquías
  'validate:universal': 'NIVEL 2 - Validación completa (antes de commit)',
};
```

##### **B. priorities object - Líneas ~270-282**
```javascript
const priorities = {
  development: ['npm run dev', 'npm run build', ...],
  validation: ['validate:quick', 'validate:universal', ...], // ✅ ORDEN CORRECTO
  fixing: ['npm run fix:npm-duplications', ...],
  ai: ['npm run ai:before-changes', ...]
};
```

##### **C. printFooter() - Líneas ~298-318**
```javascript
// ✅ COMANDOS ESENCIALES DIARIOS
log.command('npm run validate:quick', 'Validación rápida (empezar trabajo)');

// ✅ WORKFLOW AI ACTUALIZADO
log.title('\n🚨 WORKFLOW AI - 4 NIVELES VALIDACIÓN:');

// ✅ DOCUMENTACIÓN CRÍTICA ACTUALIZADA
log.info('• AI_UNIFIED_RULES.md - SINGLE SOURCE OF TRUTH');
```

#### **STEP 3: ✅ VALIDACIÓN POST-UPDATE**
```bash
# 1. Ejecutar vhelp para verificar output
npm run vhelp

# 2. Verificar que todos los comandos aparezcan
npm run vhelp | grep -E "(validate:|npm run)" | wc -l

# 3. Verificar workflow actualizado
npm run vhelp | grep -A 10 "WORKFLOW AI"

# 4. Verificar documentación actualizada  
npm run vhelp | grep -A 5 "DOCUMENTACIÓN CRÍTICA"
```

---

## 📊 **QUÉ ACTUALIZAR EN CADA SECCIÓN**

### **🎯 SECCIONES CRÍTICAS (ALWAYS UPDATE)**

#### **1. generateDescription() - Command Descriptions**
```javascript
// ✅ REQUIRED: Todos los comandos deben tener descripción clara
// ✅ PATTERN: Usar prefijos para jerarquías (NIVEL 1, NIVEL 2)
// ✅ FORMAT: Máximo 60 caracteres para alignment
```

#### **2. printFooter() - Essential Commands & Workflow**
```javascript
// ✅ REQUIRED: Comandos esenciales diarios actualizados
// ✅ REQUIRED: Workflow AI con niveles correctos  
// ✅ REQUIRED: Referencias de documentación válidas
```

#### **3. priorities object - Command Prioritization**
```javascript
// ✅ REQUIRED: Orden correcto de prioridades por categoría
// ✅ REQUIRED: Máximo 5-8 comandos por categoría mostrados
```

### **🔧 SECCIONES OPCIONALES (UPDATE IF NEEDED)**

#### **4. categories object - Category Definitions**
```javascript
// 🟡 OPTIONAL: Solo si se agregan nuevos tipos de comandos
// 🟡 OPTIONAL: Cambios en keywords o icons
```

#### **5. addManualCommands() - PowerShell & Direct Commands**
```javascript
// 🟡 OPTIONAL: Solo si se agregan alias PowerShell nuevos
// 🟡 OPTIONAL: Comandos node.js directos adicionales
```

---

## 📋 **CHECKLIST DE ACTUALIZACIÓN**

### **PRE-UPDATE CHECKLIST:**
- [ ] ✅ **Identificar trigger event** - ¿Qué cambió que requiere update?
- [ ] ✅ **Revisar package.json** - ¿Comandos nuevos/modificados?
- [ ] ✅ **Revisar AI_UNIFIED_RULES.md** - ¿Workflow changes?
- [ ] ✅ **Ejecutar vhelp actual** - Capturar output para comparación

### **UPDATE CHECKLIST:**
- [ ] ✅ **generateDescription()** - Agregar/modificar descripciones
- [ ] ✅ **priorities object** - Actualizar orden de prioridades  
- [ ] ✅ **printFooter()** - Comandos esenciales + workflow + docs
- [ ] ✅ **Verificar longitud** - Descripciones ≤60 caracteres
- [ ] ✅ **Usar prefijos** - NIVEL 1, NIVEL 2 para jerarquías

### **POST-UPDATE CHECKLIST:**
- [ ] ✅ **Ejecutar npm run vhelp** - Verificar output correcto
- [ ] ✅ **Contar comandos** - Verificar que aparezcan todos
- [ ] ✅ **Verificar workflow** - 4 niveles visibles y correctos
- [ ] ✅ **Verificar docs** - Referencias válidas y actualizadas  
- [ ] ✅ **Commit changes** - Con mensaje descriptivo

---

## 🚨 **CASOS DE USO ESPECÍFICOS**

### **CASO 1: Nuevo Comando en package.json**
```bash
# EXAMPLE: Se agregó "validate:newcommand": "..."
# STEPS:
1. Agregar en generateDescription():
   'validate:newcommand': 'Descripción del nuevo comando',

2. Verificar categorización automática (por keywords)

3. Ejecutar npm run vhelp para verificar aparece
```

### **CASO 2: Cambio de Workflow AI**  
```bash
# EXAMPLE: De 4 niveles a 3 niveles de validación
# STEPS:
1. Modificar printFooter() workflow section
2. Actualizar priorities object si necesario
3. Actualizar COMANDOS ESENCIALES si cambian
```

### **CASO 3: Consolidación de Documentación**
```bash
# EXAMPLE: NPM_MONOREPO_RULES.md → AI_UNIFIED_RULES.md
# STEPS:  
1. Actualizar printFooter() DOCUMENTACIÓN CRÍTICA:
   - Remove: NPM_MONOREPO_RULES.md
   - Add: AI_UNIFIED_RULES.md

2. Verificar que referencias sean válidas
```

### **CASO 4: Cambio de Prioridades**
```bash
# EXAMPLE: validate:quick ahora es prioridad #1
# STEPS:
1. Actualizar priorities object:
   validation: ['validate:quick', 'validate:universal', ...]

2. Actualizar COMANDOS ESENCIALES DIARIOS:
   log.command('npm run validate:quick', 'Validación rápida...');

3. Actualizar workflow AI si necesario
```

---

## 🎯 **MAINTENANCE SCHEDULE**

### **FREQUENCY:**
- **🔴 Immediate:** Después de trigger events críticos
- **🟡 Weekly:** Review minor improvements
- **🟢 Monthly:** Full validation and cleanup

### **OWNER:**
- **Primary:** Lead Developer
- **Secondary:** AI Coordinator  
- **Validator:** Any team member can verify output

### **TOOLS:**
```bash
# Quick validation commands
npm run vhelp | head -20                    # Verify header
npm run vhelp | grep -E "(validate:|NIVEL)" # Verify validation commands
npm run vhelp | tail -15                    # Verify footer references
```

---

## 🏆 **SUCCESS METRICS**

### **QUALITY INDICATORS:**
- ✅ All package.json commands have descriptions
- ✅ All 4 validation levels clearly shown  
- ✅ All documentation references are valid
- ✅ Workflow matches AI_UNIFIED_RULES.md exactly
- ✅ No broken links or missing files referenced

### **USAGE INDICATORS:**
- 📊 Developers use `npm run vhelp` regularly
- 📊 No questions about "what commands are available"
- 📊 AI systems can easily understand available commands
- 📊 New team members onboard faster with clear help

---

**📅 Last Updated:** $(date)  
**🔄 Version:** 1.0.0 - Initial Documentation  
**👥 Maintained By:** VibeThink Orchestrator Team

**💡 TIP:** Bookmark this process - update vhelp immediately after any major changes!