# 🐛 PROTOCOLO DE DEBUGGING - COMPONENTES QUE SE CUELGAN

## 📋 **REGLA #1: Siempre revisar en este orden**

1. **Console Errors** (F12 en navegador) → La pista más importante
2. **Dependencias faltantes** → Módulos no encontrados
3. **Hooks con bucles infinitos** → useEffect/useState
4. **Store management** → Zustand/state problems

---

## 🔍 **PASOS RÁPIDOS (5 minutos o menos)**

### **Paso 1: Verificar Console Errors**
```bash
# Abrir F12 en navegador → Buscar errores específicos
# Errores comunes:
# - "Module not found"
# - "getServerSnapshot should be cached"
# - "Maximum update depth exceeded"
# - "infinite loop"
```

### **Paso 2: Checar dependencias específicas**
```bash
# Si hay "Module not found":
cd apps/[nombre-app] && npm list [modulo-faltante]
# Ejemplo: cd apps/dashboard && npm list @fullcalendar/react
```

### **Paso 3: Buscar patrones problemáticos en hooks**
```typescript
// ❌ BUSCAR Y ELIMINAR ESTOS PATRONES:
setTimeout(() => {...}, 500);  // Artificial delays

// ❌ ESTO CAUSA LOOP INFINITO:
useEffect(() => {
  fetchEvents();
}, [fetchEvents, user?.company_id]); // fetchEvents cambia cada render

// ✅ CORREGIR A:
useEffect(() => {
  fetchEvents();
}, [user?.company_id]); // Dependencias estables
```

### **Paso 4: Revisar store management (solo si usa Zustand)**
```typescript
// ❌ PROBLEMAS COMUNES:
persist(calendarStoreCreator, {...})  // Causa hydration errors

const selector = (state) => ({ a: state.a, b: state.b });
useStore(selector);  // getServerSnapshot error

// ✅ SOLUCIONES RÁPIDAS:
// 1. Quitar persist temporalmente
// 2. Usar acceso directo:
const a = useStore(state => state.a);
const b = useStore(state => state.b);
```

---

## 🎯 **CHECKLIST DE 30 SEGUNDOS**

Cuando un componente se cuelga, preguntar:

1. ✅ **¿Qué error muestra la consola?**
2. ✅ **¿Falta alguna dependencia?** (npm list)
3. ✅ **¿Hay setTimeout artificial en hooks?**
4. ✅ **¿El useEffect tiene dependencias que cambian?**
5. ✅ **¿Usa Zustand con persist o selectors complejos?**

---

## 🚀 **SOLUCIONES INMEDIATAS**

### **Si el componente muestra loading infinito:**
- Buscar `setTimeout` en hooks y eliminarlo
- Verificar que `useEffect` no tenga funciones como dependencia

### **Si hay error de hidratación:**
- Quitar `persist` del store de Zustand
- Convertir selectors a acceso directo

### **Si hay "Maximum update depth exceeded":**
- Revisar useEffect con dependencias inestables
- Buscar setState dentro de otros setState

---

## 📚 **APRENDIZAJE CLAVE**

**Los componentes se cuelgan por 4 razones principales:**
1. **Dependencias faltantes** → Fáciles de identificar
2. **Bucles infinitos** → useEffect/useState mal configurados
3. **Problemas de hidratación** → Server/Client mismatch
4. **Operaciones asíncronas** → setTimeout, promesas mal manejadas

**Siempre revisar en este orden exacto.**

---

## ⚡ **COMANDOS ÚTILES**

```bash
# Verificar dependencias de app específica
cd apps/[app] && npm list [modulo]

# Reiniciar servidor development
# (matar proceso node y volver a correr npm run dev)

# Validación rápida del proyecto
npm run validate:quick
```

---

**Nota:** Este protocolo aplica a cualquier componente React (Next.js, Vite, etc.). Los patrones son universales.