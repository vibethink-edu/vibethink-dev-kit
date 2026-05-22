# 🚀 Lecciones Aprendidas - Inicio del Proyecto

## 📋 **Problemas Identificados y Soluciones**

### **1. Problema de Puertos**
**Síntoma:**
```bash
Port 8080 is in use, trying another one...
Port 8081 is in use, trying another one...
Port 8082 is in use, trying another one...
```

**Causas:**
- Múltiples instancias de Vite ejecutándose
- Procesos Node.js no terminados correctamente
- Puertos ocupados por otros servicios

**Soluciones:**
- ✅ Script de limpieza de puertos (`clean-ports.ps1`)
- ✅ Puerto estándar 3000 en `vite.config.ts`
- ✅ `strictPort: false` para búsqueda automática
- ✅ `open: true` para apertura automática del navegador

### **2. Estructura de Archivos**
**Problema:** `main.tsx` en ubicación incorrecta
**Solución:** Ubicación correcta en `src/apps/login/main.tsx`

### **3. Dependencias Faltantes**
**Problema:** Errores de importación `@/lib/utils`
**Solución:** 
- Crear `src/lib/utils.ts`
- Instalar dependencias: `clsx`, `tailwind-merge`, etc.

### **4. Routing Issues**
**Problema:** `useNavigate()` sin contexto de Router
**Solución:** Componente App con BrowserRouter

## 🛠️ **Scripts de Automatización**

### **Script de Limpieza**
```powershell
.\scripts\clean-ports.ps1
```

### **Script de Inicio Mejorado**
```powershell
.\scripts\start-dev.ps1
```

## 📁 **Estructura Correcta**
```
src/
├── apps/
│   └── login/
│       ├── main.tsx          # Punto de entrada
│       ├── App.tsx           # Componente principal
│       ├── Login.tsx         # Componente de login
│       ├── CompanyLogin.tsx  # Login empresarial
│       └── styles.css        # Estilos
├── lib/
│   └── utils.ts              # Utilidades
└── shared/
    └── components/
        └── ui/               # Componentes UI
```

## 🎯 **Checklist de Inicio**

### **Antes de Iniciar:**
- [ ] Verificar que no hay procesos Node.js corriendo
- [ ] Verificar que los puertos 3000, 8080-8083 están libres
- [ ] Verificar que todos los archivos críticos existen
- [ ] Verificar que las dependencias están instaladas

### **Durante el Inicio:**
- [ ] Ejecutar script de limpieza si es necesario
- [ ] Usar script de inicio mejorado
- [ ] Verificar que el navegador se abre automáticamente
- [ ] Verificar que no hay errores en la consola

### **Después del Inicio:**
- [ ] Verificar que la aplicación carga correctamente
- [ ] Verificar que los estilos se aplican
- [ ] Verificar que la funcionalidad básica funciona

## 🔧 **Comandos Útiles**

### **Limpieza de Puertos:**
```bash
# Windows
taskkill /f /im node.exe
netstat -ano | findstr :808

# PowerShell
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force
```

### **Verificación de Archivos:**
```bash
# Verificar archivos críticos
ls src/apps/login/main.tsx
ls src/lib/utils.ts
ls src/apps/login/App.tsx
```

### **Reinstalación de Dependencias:**
```bash
rm -rf node_modules
npm install
```

## 📊 **Métricas de Éxito**

- ✅ **Tiempo de inicio:** < 30 segundos
- ✅ **Puerto estable:** Sin cambios automáticos
- ✅ **Navegador automático:** Se abre sin intervención
- ✅ **Sin errores:** Consola limpia
- ✅ **Funcionalidad:** Login básico funciona

## 🚨 **Problemas Comunes y Soluciones**

### **Error: "Port X is in use"**
**Solución:** Ejecutar `.\scripts\clean-ports.ps1`

### **Error: "Failed to resolve import @/lib/utils"**
**Solución:** Verificar que `src/lib/utils.ts` existe

### **Error: "useNavigate() may be used only in the context of a Router"**
**Solución:** Verificar que el componente está envuelto en BrowserRouter

### **Error: "Module not found"**
**Solución:** Ejecutar `npm install` y verificar dependencias 