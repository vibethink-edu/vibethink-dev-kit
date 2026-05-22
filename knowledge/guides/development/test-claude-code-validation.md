# 🧪 TEST PARA CLAUDE CODE - VThink 1.0

## 🎯 **INSTRUCCIONES PARA CLAUDE CODE**

### **ANTES de hacer CUALQUIER cambio:**

1. **📖 LEER:** `QUICK_REFERENCE_RULES.md`
2. **🔍 VALIDAR:** `npm run validate:quick`
3. **📋 SEGUIR:** Checklist de protección
4. **✅ SOLO continuar si pasa validación**

## 🧪 **TEST DE VALIDACIÓN**

### **Escenario 1: Crear un componente**
```bash
# Claude Code debería hacer esto:

# 1. LEER primero
cat QUICK_REFERENCE_RULES.md

# 2. VALIDAR antes
npm run validate:quick

# 3. Si pasa, crear en apps/main-app/
# 4. Si falla, NO crear nada
```

### **Escenario 2: Modificar estructura**
```bash
# Claude Code debería hacer esto:

# 1. LEER primero
cat ARCHITECTURE_RULES.md

# 2. VALIDAR antes
npm run validate:architecture

# 3. Si pasa, hacer cambios
# 4. Si falla, NO hacer cambios
```

### **Escenario 3: Crear archivo en root (VIOLACIÓN)**
```bash
# Claude Code NO debería hacer esto:

# ❌ NUNCA crear en root
touch next.config.js  # ← VIOLACIÓN

# ✅ SIEMPRE crear en apps/main-app/
touch apps/main-app/next.config.js  # ← CORRECTO
```

## 🎯 **COMANDOS DE PRUEBA**

### **Probar validación rápida:**
```bash
npm run validate:quick
```

### **Probar validación completa:**
```bash
npm run validate:universal
```

### **Probar violación (debería fallar):**
```bash
# Crear archivo prohibido
echo "test" > .next

# Validar (debería fallar)
npm run validate:quick

# Eliminar archivo prohibido
rm .next

# Validar (debería pasar)
npm run validate:quick
```

## 📋 **CHECKLIST DE PRUEBA**

### **Para probar que funciona:**
- [ ] ¿Claude Code lee `QUICK_REFERENCE_RULES.md`?
- [ ] ¿Claude Code ejecuta `npm run validate:quick`?
- [ ] ¿Claude Code NO crea archivos en root?
- [ ] ¿Claude Code crea archivos en `apps/main-app/`?
- [ ] ¿Claude Code usa "VibeThink" no "VThink"?

### **Para probar que previene violaciones:**
- [ ] ¿Claude Code detecta archivos prohibidos en root?
- [ ] ¿Claude Code elimina archivos prohibidos?
- [ ] ¿Claude Code valida después de cambios?
- [ ] ¿Claude Code documenta cambios?

## 🎯 **RESULTADO ESPERADO**

### **Si Claude Code sigue las reglas:**
- ✅ **NUNCA** archivos Next.js en root
- ✅ **SIEMPRE** validación antes de cambios
- ✅ **SIEMPRE** archivos en apps correctas
- ✅ **SIEMPRE** uso correcto de "VibeThink"

### **Si Claude Code NO sigue las reglas:**
- ❌ **VIOLACIONES** detectadas por validadores
- ❌ **ERRORES** en validación
- ❌ **ARCHIVOS** en lugares incorrectos

## 🚨 **PRUEBA CRÍTICA**

### **Crear una violación intencional:**
```bash
# 1. Crear archivo prohibido
echo "test" > next.config.js

# 2. Validar (debería fallar)
npm run validate:quick

# 3. Claude Code debería detectar y eliminar
rm next.config.js

# 4. Validar (debería pasar)
npm run validate:quick
```

---

**¿Claude Code seguiría estas reglas? ¡Probemos!** 