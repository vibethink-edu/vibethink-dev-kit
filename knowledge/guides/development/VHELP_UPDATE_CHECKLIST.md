# ✅ VHELP UPDATE CHECKLIST - Lista Rápida

> **🎯 PURPOSE:** Checklist ultra-rápido para actualizaciones de vhelp.cjs  
> **⚡ USAGE:** Usar después de cambios significativos al proyecto  
> **📋 TIME:** 5-10 minutos de verificación

---

## 🚨 **¿NECESITA ACTUALIZACIÓN?**

### **🔴 TRIGGER EVENTS - Actualizar INMEDIATAMENTE si:**
- [ ] ❓ **Se agregaron comandos** en package.json scripts?
- [ ] ❓ **Se modificó workflow** en AI_UNIFIED_RULES.md?
- [ ] ❓ **Se consolidó documentación** (archivos movidos/eliminados)?
- [ ] ❓ **Cambiaron prioridades** de comandos esenciales?

**Si respondiste SÍ a alguna → CONTINUAR con actualización**

---

## 🔧 **ACTUALIZACIÓN RÁPIDA - 5 PASOS**

### **PASO 1: 🔍 IDENTIFICAR CAMBIOS**
```bash
# Ejecutar vhelp actual para comparar después
npm run vhelp > before_update.txt
```

### **PASO 2: 📝 ACTUALIZAR SECCIONES**

#### **A. Comandos Nuevos/Modificados**
```javascript
// Archivo: dev-tools/utilities/vhelp.cjs
// Ubicación: generateDescription() ~línea 115

const descriptions = {
  // ✅ AGREGAR comandos nuevos aquí
  'nuevo-comando': 'Descripción clara',
  
  // ✅ MODIFICAR descripciones existentes
  'comando-existente': 'Nueva descripción',
};
```

#### **B. Prioridades (si cambió orden)**
```javascript  
// Archivo: dev-tools/utilities/vhelp.cjs
// Ubicación: priorities object ~línea 277

const priorities = {
  validation: ['validate:quick', 'validate:universal', ...], // ✅ ORDEN CORRECTO
};
```

#### **C. Footer - Comandos Esenciales/Workflow/Docs**
```javascript
// Archivo: dev-tools/utilities/vhelp.cjs  
// Ubicación: printFooter() ~línea 299

// ✅ COMANDOS ESENCIALES (si cambiaron)
log.command('npm run validate:quick', 'Descripción actualizada');

// ✅ WORKFLOW AI (si cambió)
log.title('\n🚨 WORKFLOW AI - X NIVELES VALIDACIÓN:');

// ✅ DOCUMENTACIÓN (si hay archivos nuevos/consolidados)
log.info('• AI_UNIFIED_RULES.md - SINGLE SOURCE OF TRUTH');
```

### **PASO 3: ✅ VERIFICACIÓN RÁPIDA**
```bash
# Ejecutar vhelp actualizado
npm run vhelp

# ¿Se ve bien? ✅ Continuar | ❌ Corregir errores
```

### **PASO 4: 🧪 TESTS RÁPIDOS**
```bash
# Test 1: ¿Aparecen comandos nuevos?
npm run vhelp | grep "nuevo-comando"

# Test 2: ¿Workflow correcto?
npm run vhelp | grep -A 5 "WORKFLOW AI"

# Test 3: ¿Documentación válida?
npm run vhelp | grep -A 3 "DOCUMENTACIÓN CRÍTICA"
```

### **PASO 5: 💾 COMMIT**
```bash
git add dev-tools/utilities/vhelp.cjs
git commit -m "update(vhelp): sync with [DESCRIBE CHANGE]

- Add descriptions for new commands
- Update workflow/priorities/documentation
- Maintain consistency with AI_UNIFIED_RULES.md"
```

---

## 🎯 **VERIFICACIÓN FINAL - 30 SEGUNDOS**

### **✅ SUCCESS INDICATORS:**
- [ ] ✅ `npm run vhelp` ejecuta sin errores
- [ ] ✅ Todos los comandos nuevos aparecen con descripción
- [ ] ✅ Workflow AI matches AI_UNIFIED_RULES.md
- [ ] ✅ Referencias documentación son válidas (archivos existen)
- [ ] ✅ Comandos esenciales están actualizados

### **❌ RED FLAGS - Corregir antes de commit:**
- [ ] ❌ Errores JavaScript al ejecutar vhelp
- [ ] ❌ Comandos nuevos sin descripción ("Comando personalizado")
- [ ] ❌ Referencias a archivos eliminados (ej: NPM_MONOREPO_RULES.md)
- [ ] ❌ Workflow inconsistente con reglas actuales
- [ ] ❌ Descripcionesuuuu > 60 caracteres (rompe alignment)

---

## 🚀 **CASOS COMUNES - SOLUCIONES RÁPIDAS**

### **CASO: Comando nuevo en package.json**
```javascript
// ✅ SOLUCIÓN RÁPIDA:
'validate:newcommand': 'Descripción del nuevo comando (max 60 chars)',
```

### **CASO: Workflow cambió (ej: 4→3 niveles)**  
```javascript
// ✅ SOLUCIÓN RÁPIDA en printFooter():
log.title('\n🚨 WORKFLOW AI - 3 NIVELES VALIDACIÓN:');
log.command('🟢 NIVEL 1: npm run validate:quick', '...');
log.command('🟡 NIVEL 2: npm run validate:universal', '...');  
log.command('🔴 NIVEL 3: npm run validate:guard', '...');
// Eliminar NIVEL 4 si ya no existe
```

### **CASO: Archivo documentación consolidado**
```javascript
// ✅ SOLUCIÓN RÁPIDA en printFooter():
// ANTES:
log.info('• NPM_MONOREPO_RULES.md - Reglas NPM');

// DESPUÉS:  
log.info('• AI_UNIFIED_RULES.md - SINGLE SOURCE OF TRUTH (incluye NPM)');
```

### **CASO: Prioridad comando cambió**
```javascript
// ✅ SOLUCIÓN RÁPIDA:
// 1. Mover en priorities object:
validation: ['validate:quick', 'validate:universal', ...], // nuevo orden

// 2. Actualizar en COMANDOS ESENCIALES:
log.command('npm run validate:quick', 'Validación rápida (empezar trabajo)');
```

---

## 🕐 **TIEMPO ESTIMADO POR TIPO**

| Tipo de Cambio | Tiempo Estimado | Archivos Afectados |
|-----------------|-----------------|-------------------|
| **Comandos nuevos** | 2-3 minutos | vhelp.cjs |
| **Workflow update** | 3-5 minutos | vhelp.cjs |
| **Doc consolidation** | 2-3 minutos | vhelp.cjs |
| **Prioridades** | 2-4 minutos | vhelp.cjs |
| **Todo lo anterior** | 5-10 minutos | vhelp.cjs |

---

## 📞 **AYUDA RÁPIDA**

### **🆘 Si algo falla:**
1. **Revert cambios:** `git checkout -- dev-tools/utilities/vhelp.cjs`
2. **Revisar sintaxis:** JavaScript syntax errors
3. **Ejecutar original:** `npm run vhelp` should work
4. **Check documentation:** `docs/development/VHELP_UPDATE_PROCESS.md`

### **🎯 Quick Commands:**
```bash
# Ver vhelp actual
npm run vhelp

# Ver comandos disponibles
grep '".*":' package.json | head -20

# Ver si archivo existe  
ls AI_UNIFIED_RULES.md
```

---

**💡 TIP:** Mantén este checklist a mano - actualizar vhelp es responsabilidad de quien hace cambios que lo requieren!

**⚡ QUICK RULE:** Si tardas más de 10 minutos, consulta VHELP_UPDATE_PROCESS.md completo.

---

**📅 Created:** August 11, 2025  
**⚡ Quick Reference** - Para proceso detallado ver VHELP_UPDATE_PROCESS.md