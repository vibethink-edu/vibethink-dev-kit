# 🌿 MULTI-BRANCH AI WORKFLOW GUIDE

## 🎯 Trabajar con Múltiples IAs en Paralelo

Esta guía te ayuda a coordinar **múltiples Claude Code/Cursor** trabajando en diferentes ramas simultáneamente.

---

## 🚀 SETUP INICIAL - RAMA NUEVA

### **1. Crear Nueva Rama para Nueva IA**
```bash
# En terminal donde quieres la nueva rama
git checkout -b feat/nueva-funcionalidad

# Verificar que estás en la rama correcta
git branch --show-current
# Output: feat/nueva-funcionalidad
```

### **2. Abrir Nueva Instancia IDE**
```bash
# Opción A: Nueva ventana de Cursor
cursor . 

# Opción B: Nueva ventana de VS Code
code .

# Opción C: Nueva instancia Claude Code (nueva terminal)
# Ejecutar en nueva terminal desde la carpeta del proyecto
```

---

## 🎯 COORDINACIÓN ENTRE RAMAS

### **Claude Code A** (Rama: `feat/website-cosmic-import`)
```bash
# Verificar rama actual
git branch --show-current
# Output: feat/website-cosmic-import

# Puerto de desarrollo
npm run dev:test  # Puerto 3099

# Estado: Trabajando en dashboard y despliegue
```

### **Claude Code B** (Rama: `feat/nueva-funcionalidad`)
```bash
# Verificar rama actual  
git branch --show-current
# Output: feat/nueva-funcionalidad

# Puerto de desarrollo alternativo
npm run dev:dashboard  # Puerto 3001
# O
npm run dev:admin      # Puerto 3002
```

---

## 🔧 COMANDOS ESENCIALES POR RAMA

### **Inicialización de Nueva Rama**
```bash
# 1. Crear y cambiar a nueva rama
git checkout -b feat/mi-nueva-feature

# 2. Verificar estado
git status
npm run vhelp

# 3. Protocolo de inicio AI
npm run validate:quick
npm run dev:dashboard  # O el puerto que necesites
```

### **Sincronización Periodica**
```bash
# Cada rama debe hacer esto regularmente:

# 1. Guardar trabajo actual
git add -A
git commit -m "WIP: trabajo en progreso"

# 2. Sincronizar con main
git fetch origin
git rebase origin/main  # O git merge origin/main

# 3. Resolver conflictos si existen
# 4. Continuar trabajo
```

---

## 🌐 PUERTOS POR RAMA/FUNCIONALIDAD

### **Asignación de Puertos Recomendada:**
```bash
# RAMA PRINCIPAL (main/feat/website-cosmic-import)
Dashboard:  3001  # npm run dev:dashboard
Admin:      3002  # npm run dev:admin  
Login:      3003  # npm run dev:login
Helpdesk:   3004  # npm run dev:helpdesk
Website:    3005  # npm run dev:website
Testing:    3099  # npm run dev:test

# RAMAS DE FEATURES
Feature A:  3011  # cd apps/dashboard && npm run dev -- -p 3011
Feature B:  3012  # cd apps/dashboard && npm run dev -- -p 3012
Feature C:  3013  # cd apps/dashboard && npm run dev -- -p 3013
```

### **Verificar Puertos Ocupados:**
```bash
npm run port-check  # Ver estado de todos los puertos
npm run dev:status  # Detectar puertos automáticamente
```

---

## 🤖 PROTOCOLO DE COMUNICACIÓN ENTRE IAs

### **Archivo de Estado Compartido**
Crear `BRANCH_STATUS.md` en root para coordinación:

```markdown
# 🌿 ESTADO DE RAMAS ACTIVAS

## 📊 RAMAS EN DESARROLLO
- **feat/website-cosmic-import** - Claude A - Puerto 3099
  - Estado: Dashboard deployment y testing
  - Última actualización: 2025-09-19 22:45
  - Progreso: ✅ Desplegado, ⏳ Testing

- **feat/nueva-funcionalidad** - Claude B - Puerto 3011  
  - Estado: [Descripción]
  - Última actualización: [Timestamp]
  - Progreso: [Estado]

## 🚨 CONFLICTOS POTENCIALES
- [Listar archivos que ambas ramas modifican]

## 📋 COORDINACIÓN
- [Notas entre IAs]
```

### **Comandos de Sincronización**
```bash
# Al iniciar sesión de trabajo
git fetch origin  # Actualizar referencias remotas
git status         # Ver estado local
git log --oneline -n 3  # Ver últimos commits

# Al terminar sesión de trabajo  
git push origin [rama-actual]  # Subir cambios
# Actualizar BRANCH_STATUS.md con progreso
```

---

## 🔄 MERGE WORKFLOW

### **Cuando una Rama Está Lista**
```bash
# 1. En la rama feature
git checkout feat/mi-feature
git push origin feat/mi-feature

# 2. Crear Pull Request en GitHub
gh pr create --title "feat: Mi nueva funcionalidad" --body "Descripción"

# 3. Review y merge
# (Puede ser manual o automatizado)

# 4. Cleanup local
git checkout main
git pull origin main
git branch -d feat/mi-feature  # Eliminar rama local
```

### **Sincronizar Otras Ramas Después del Merge**
```bash
# En otras ramas activas
git fetch origin
git rebase origin/main  # Aplicar cambios de main
```

---

## 📱 APPS INDEPENDIENTES - DESARROLLO SEPARADO

### **Dashboard (Puerto 3001)**
```bash
cd apps/dashboard
npm run dev  # Puerto 3001 por defecto
```

### **Admin (Puerto 3002)**  
```bash
cd apps/admin
npm run dev  # Puerto 3002 por defecto
```

### **Website (Puerto 3005)**
```bash
cd apps/website  
npm run dev  # Puerto 3005 por defecto
```

### **Desarrollo Paralelo Sin Conflictos**
- **Dashboard team:** Trabajar en `apps/dashboard/` 
- **Website team:** Trabajar en `apps/website/`
- **Admin team:** Trabajar en `apps/admin/`
- **Shared components:** Coordinar cambios en `src/shared/`

---

## 🛡️ PREVENCIÓN DE CONFLICTOS

### **Archivos de Alto Conflicto** (Coordinar cambios)
```
src/shared/components/     # Componentes compartidos
src/shared/utils/         # Utilidades compartidas  
package.json              # Dependencias root
apps/dashboard/package.json  # Dependencias dashboard
CLAUDE.md                 # Documentación AI
```

### **Archivos Seguros para Modificar** (Sin coordinación)
```
apps/[app-especifica]/src/  # Código específico de app
docs/[feature-especifica]/  # Documentación de feature
dev-tools/[nuevos-scripts]/ # Nuevos scripts de desarrollo
```

---

## 🎯 WORKFLOW RECOMENDADO

### **Claude A** - Dashboard & Core
```bash
# Rama: feat/dashboard-improvements
# Puerto: 3099 (testing)
# Enfoque: Dashboard principal, testing, deployment
```

### **Claude B** - Nueva Funcionalidad
```bash  
# Rama: feat/nueva-funcionalidad
# Puerto: 3011
# Enfoque: Nueva feature específica
```

### **Sincronización Diaria**
```bash
# Morning sync (ambas ramas)
git fetch origin
git rebase origin/main

# Evening sync (ambas ramas)  
git push origin [rama-actual]
# Actualizar BRANCH_STATUS.md
```

---

## 🚨 RESOLUCIÓN DE CONFLICTOS

### **Si Git Se Confunde**
```bash
# Ver estado
git status

# Si hay conflictos de merge
git status  # Ver archivos en conflicto
# Editar archivos manualmente
git add .
git rebase --continue

# Si está muy confuso - reset seguro
git fetch origin
git reset --hard origin/[rama-actual]  # ⚠️ Pierde cambios locales
```

### **Estrategia de Comunicación**
1. **Usar GitHub Issues** para coordinar features grandes
2. **Actualizar BRANCH_STATUS.md** regularmente  
3. **Hacer push frecuente** para evitar divergencias
4. **Comunicar cambios en shared/** antes de hacerlos

---

## 📊 EJEMPLO PRÁCTICO

### **Escenario: Dashboard Improvements + Nueva Feature**

**Terminal 1 (Claude A):**
```bash
git branch --show-current  # feat/website-cosmic-import
npm run dev:test           # Puerto 3099
# Trabajando en: dashboard improvements, testing, deployment
```

**Terminal 2 (Claude B):**  
```bash
git checkout -b feat/user-management    # Nueva rama
npm run dev:admin                       # Puerto 3002  
# Trabajando en: sistema de gestión de usuarios
```

**Coordinación:**
- Claude A: NO toca `apps/admin/`
- Claude B: NO toca dashboard principal 
- Ambos: Coordinar cambios en `src/shared/`
- Sync diario: Push cambios + actualizar BRANCH_STATUS.md

---

## ✅ CHECKLIST RÁPIDO

### **Al Iniciar Nueva Rama:**
- [ ] `git checkout -b feat/nombre-descriptivo`
- [ ] `npm run validate:quick`
- [ ] Asignar puerto único (`npm run port-check`)
- [ ] Actualizar BRANCH_STATUS.md
- [ ] Comunicar enfoque en Discord/Issues

### **Durante Desarrollo:**
- [ ] Commit frecuente (`git add -A && git commit -m "WIP: progreso"`)
- [ ] Push diario (`git push origin [rama]`)
- [ ] Sync con main semanal (`git rebase origin/main`)

### **Al Finalizar:**
- [ ] `git push origin [rama]`
- [ ] Crear PR en GitHub
- [ ] Actualizar BRANCH_STATUS.md
- [ ] Cleanup después del merge

---

## 🎊 ¡LISTO!

Con este workflow puedes tener **múltiples Claude Code/Cursor trabajando simultáneamente** sin conflictos, cada uno en su rama y puerto específico.

**Próximos pasos sugeridos:**
1. Crear `BRANCH_STATUS.md` en root
2. Decidir asignación de ramas/puertos
3. Establecer horarios de sync
4. ¡Desarrollar en paralelo!