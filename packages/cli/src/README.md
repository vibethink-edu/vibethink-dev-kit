# Dev-Tools - VThink 1.0

## 🎯 **Estructura Organizada de Herramientas de Desarrollo**

```
dev-tools/
├── docusaurus/          # ✅ Gestión de sitios Docusaurus
│   ├── start-sites.ps1      # Iniciar todos los sitios
│   ├── validate-sites.ps1   # Validar funcionamiento
│   ├── create-sites.ps1     # Crear nuevos sitios
│   └── orchestrator.ps1     # Script maestro
├── monitoring/          # ✅ Monitoreo y health checks
│   ├── health-check.js
│   ├── health-check-local.js
│   ├── quality-monitor.js
│   ├── performance-monitor.js
│   ├── database-monitor.ts
│   └── status-check.ts
├── testing/            # ✅ Scripts de testing y validación
│   ├── test-auth-system-e2e.js
│   ├── test-bundui.js
│   ├── test-bundui-pages.js
│   ├── run-bundui-tests.js
│   ├── run-bundui-demo.js
│   ├── setup-test-db.ts
│   └── cleanup-test-db.ts
├── security/           # ✅ Auditoría y validación de seguridad
│   ├── security-audit.ts
│   ├── check-auth-users.js
│   ├── check-hardcoding.js
│   └── validate-branding.cjs
├── deployment/         # ✅ Despliegue y backups
│   ├── deploy-production.js
│   ├── deploy-staging.js
│   ├── backup.ps1
│   ├── backup-bombaproof.ps1
│   ├── backup-pre-reorganization.ps1
│   └── backup-simple.ps1
├── validation/         # ✅ Validación de stack y proyectos
│   ├── stack-validation.js
│   ├── validate-vtk-pendientes.js
│   ├── check-project-status.ps1
│   └── check-migration-status.js
├── automation/         # ✅ Automatización y limpieza
│   ├── version-automation.js
│   ├── version-control-system.js
│   ├── version-status.js
│   ├── quick-version-check.js
│   ├── naming-conventions-standardization.js
│   ├── fix-naming-conventions.js
│   ├── fix-imports.js
│   ├── frontend-cleanup.js
│   ├── cleanup-frontend.js
│   ├── clean-console-logs.js
│   └── pre-commit-validation.js
├── documentation/      # ✅ Generación y gestión de documentación
│   ├── documentation-automation.js
│   ├── generate-documentation.js
│   ├── generate-vtk-report.js
│   ├── generate-route-map.js
│   ├── DocumentXTR.js
│   ├── generate-*.cjs
│   ├── generate-*.js
│   ├── generate-*.ps1
│   ├── generate-*.ts
│   ├── setup-documentxtr-*.ps1
│   ├── setup-documentxtr-*.sh
│   ├── update_documentation.py
│   └── validate-documentxtr.js
├── setup/             # ✅ Configuración y setup
│   ├── setup-env.js
│   ├── setup-dartai.js
│   ├── setup-test-db.ts
│   ├── dart-setup.ts
│   ├── dart-integration.ts
│   ├── create-vibethink-users.ts
│   └── apply-migrations.ts
├── migration/          # ✅ Migración de contenido
│   ├── migrate-content.ps1
│   ├── doc-inventory.js
│   ├── migration-tracker.js
│   ├── doc-dashboard.js
│   └── generate-dashboard.ps1
├── utilities/         # ✅ Scripts utilitarios diversos
│   ├── simple-test.js
│   ├── simple-status.js
│   ├── quick-start.js
│   ├── quick-css-test.js
│   ├── optimize-dev.js
│   ├── dev-optimized.js
│   ├── build-css-only.js
│   ├── debug-styles.js
│   ├── debug-panels.js
│   ├── check-css-content.js
│   ├── check-css-errors.js
│   ├── check-database-structure.js
│   ├── check-encoding.cjs
│   ├── check-db.cjs
│   ├── get-supabase-info.js
│   ├── generate-types.ts
│   ├── generate-mocks.ts
│   ├── create-backup.js
│   ├── apply-confidentiality-notice.js
│   ├── mark-rule-task-done.js
│   ├── rollback.js
│   ├── porte-update-tracker.js
│   ├── knowledge-base-strategy-tracker.js
│   ├── roadmap-tracker.js
│   ├── postiz-alpha-evaluator.js
│   ├── notify-violations.js
│   ├── commandxtr-demo.js
│   ├── zero-friction-evaluator.js
│   ├── analyze-dependencies.js
│   ├── improved-real-world-tests.cjs
│   ├── run-hierarchical-tests.cjs
│   ├── analyze-candidate-stack.cjs
│   ├── analyze-impact.ps1
│   ├── api-evidence-generator.js
│   ├── app-component-matrix.js
│   ├── apply-billing-migration.ps1
│   ├── apply-billing-sql.ps1
│   ├── apply-compliance-migration.ps1
│   ├── apply-migration-manual.sql
│   ├── apply-multi-country-migration.ps1
│   ├── automated-evaluation.cjs
│   ├── automated-onboarding.js
│   ├── backup-bundui-extensions.sh
│   ├── calibrate-scoring.cjs
│   ├── check-blockers.cjs
│   ├── clean-and-setup.cjs
│   ├── clean-companies.cjs
│   ├── configure-application.js
│   ├── configure-component.js
│   ├── correct-evidence-generator.js
│   ├── create-continuation-point.ps1
│   ├── decision-manager.js
│   ├── demo-evaluation-process.cjs
│   ├── demo-form-testing.js
│   ├── demo-third-party-monitoring.cjs
│   ├── deploy-final.ps1
│   ├── deploy-simple.ps1
│   ├── deploy-timeline-system.ps1
│   ├── detect-antipatterns.cjs
│   ├── dev
│   ├── dev-clean.ps1
│   ├── dev-python-optimized.py
│   ├── dev-startup.cjs
│   ├── disable-rls-for-testing.sql
│   ├── disable-rls-temporarily.cjs
│   ├── document-decision.sh
│   ├── documentxtp-dry-run.js
│   ├── documentxtp-integration-test.js
│   ├── documentxtp-simple-dry-run.js
│   ├── enable-rls-secure.sql
│   ├── enhanced-evidence-generator.js
│   ├── estimate-effort-by-scenario.cjs
│   ├── evaluate-candidate-component.cjs
│   ├── evaluate-integration-possibilities.cjs
│   ├── evaluate-porte-candidate.cjs
│   ├── execute-move.js
│   ├── fase1-evaluacion-inicial.cjs
│   ├── quality
│   └── testing
└── master-orchestrator.ps1  # 🎯 Script maestro centralizado
```

## 🚀 **Comandos Principales**

### **Master Orchestrator (Recomendado)**
```powershell
# Ver todas las categorías
.\dev-tools\master-orchestrator.ps1 -List

# Ver información del sistema
.\dev-tools\master-orchestrator.ps1 -Info

# Listar scripts de una categoría
.\dev-tools\master-orchestrator.ps1 -Category docusaurus -List

# Ejecutar un script específico
.\dev-tools\master-orchestrator.ps1 -Category docusaurus -Script start-sites.ps1
```

### **Comandos Directos por Categoría**

#### **Docusaurus**
```powershell
# Iniciar todos los sitios
.\dev-tools\docusaurus\start-sites.ps1

# Validar sitios
.\dev-tools\docusaurus\validate-sites.ps1

# Orquestador de Docusaurus
.\dev-tools\docusaurus\orchestrator.ps1 -All
```

#### **Monitoreo**
```powershell
# Health check
node dev-tools/monitoring/health-check.js

# Quality monitor
node dev-tools/monitoring/quality-monitor.js

# Database monitor
npx ts-node dev-tools/monitoring/database-monitor.ts
```

#### **Testing**
```powershell
# Test auth system
node dev-tools/testing/test-auth-system-e2e.js

# Test Bundui
node dev-tools/testing/test-bundui.js

# Setup test database
npx ts-node dev-tools/testing/setup-test-db.ts
```

#### **Seguridad**
```powershell
# Security audit
npx ts-node dev-tools/security/security-audit.ts

# Check auth users
node dev-tools/security/check-auth-users.js

# Check hardcoding
node dev-tools/security/check-hardcoding.js
```

#### **Despliegue**
```powershell
# Deploy production
node dev-tools/deployment/deploy-production.js

# Deploy staging
node dev-tools/deployment/deploy-staging.js

# Backup
.\dev-tools\deployment\backup.ps1
```

#### **Validación**
```powershell
# Stack validation
node dev-tools/validation/stack-validation.js

# Validate VTK pendientes
node dev-tools/validation/validate-vtk-pendientes.js

# Check project status
.\dev-tools\validation\check-project-status.ps1
```

#### **Automatización**
```powershell
# Version automation
node dev-tools/automation/version-automation.js

# Fix naming conventions
node dev-tools/automation/fix-naming-conventions.js

# Pre-commit validation
node dev-tools/automation/pre-commit-validation.js
```

#### **Documentación**
```powershell
# Documentation automation
node dev-tools/documentation/documentation-automation.js

# Generate documentation
node dev-tools/documentation/generate-documentation.js

# DocumentXTR
node dev-tools/documentation/DocumentXTR.js
```

#### **Setup**
```powershell
# Setup environment
node dev-tools/setup/setup-env.js

# Setup DartAI
node dev-tools/setup/setup-dartai.js

# Dart setup
npx ts-node dev-tools/setup/dart-setup.ts
```

#### **Migración**
```powershell
# Migrate content
.\dev-tools\migration\migrate-content.ps1

# Document inventory
node dev-tools/migration/doc-inventory.js

# Generate dashboard
.\dev-tools\migration\generate-dashboard.ps1
```

#### **Utilidades**
```powershell
# Simple test
node dev-tools/utilities/simple-test.js

# Quick start
node dev-tools/utilities/quick-start.js

# Debug styles
node dev-tools/utilities/debug-styles.js
```

## 🌐 **Sitios Docusaurus**

| Sitio | Puerto | URL | Descripción |
|-------|--------|-----|-------------|
| docusaurus-docs | 3000 | http://localhost:3000 | Documentación de Usuario |
| docusaurus-dev | 3001 | http://localhost:3001 | Documentación de Desarrollador |
| docusaurus-api | 3002 | http://localhost:3002 | Documentación de API |
| docusaurus-vthink | 3003 | http://localhost:3003 | Metodología VThink |
| docusaurus-archives | 3004 | http://localhost:3004 | Documentación Histórica |

## 📊 **Dashboard de Migración**

El dashboard se genera automáticamente y muestra:
- Progreso general de migración
- Estado de cada sitio
- Estadísticas de archivos migrados
- Categorías de documentación

**Ubicación:** `dev-tools/migration/migration-dashboard.html`

## 🔧 **Configuración**

### **Requisitos**
- Node.js 18+
- PowerShell 5.1+
- NPM

### **Instalación**
```powershell
# Instalar dependencias en cada sitio
cd docusaurus-docs && npm install
cd ../docusaurus-dev && npm install
cd ../docusaurus-api && npm install
cd ../docusaurus-vthink && npm install
cd ../docusaurus-archives && npm install
```

## 📋 **Flujo de Trabajo**

### **1. Desarrollo Inicial**
```powershell
# Crear sitios (solo primera vez)
.\dev-tools\docusaurus\create-sites.ps1
```

### **2. Desarrollo Diario**
```powershell
# Iniciar todos los sitios
.\dev-tools\master-orchestrator.ps1 -Category docusaurus -Script start-sites.ps1

# Validar funcionamiento
.\dev-tools\master-orchestrator.ps1 -Category docusaurus -Script validate-sites.ps1
```

### **3. Migración de Contenido**
```powershell
# Migrar contenido existente
.\dev-tools\master-orchestrator.ps1 -Category migration -Script migrate-content.ps1

# Generar dashboard
.\dev-tools\master-orchestrator.ps1 -Category migration -Script generate-dashboard.ps1
```

### **4. Secuencia Completa**
```powershell
# Ejecutar todo el flujo
.\dev-tools\docusaurus\orchestrator.ps1 -All
```

## 🛠️ **Scripts Específicos**

### **Docusaurus**
- **start-sites.ps1**: Inicia todos los sitios en puertos diferentes
- **validate-sites.ps1**: Verifica que todos los sitios estén funcionando
- **create-sites.ps1**: Crea nuevos sitios Docusaurus
- **orchestrator.ps1**: Script maestro que coordina todas las operaciones

### **Monitoreo**
- **health-check.js**: Verifica la salud de los servicios
- **quality-monitor.js**: Monitorea la calidad del código
- **database-monitor.ts**: Monitorea la base de datos
- **status-check.ts**: Verifica el estado general del sistema

### **Testing**
- **test-auth-system-e2e.js**: Tests end-to-end del sistema de autenticación
- **test-bundui.js**: Tests de componentes Bundui
- **setup-test-db.ts**: Configura base de datos de testing
- **cleanup-test-db.ts**: Limpia base de datos de testing

### **Seguridad**
- **security-audit.ts**: Auditoría completa de seguridad
- **check-auth-users.js**: Verifica usuarios de autenticación
- **check-hardcoding.js**: Detecta hardcoding en el código
- **validate-branding.cjs**: Valida branding del proyecto

### **Despliegue**
- **deploy-production.js**: Despliegue a producción
- **deploy-staging.js**: Despliegue a staging
- **backup.ps1**: Crear backups del sistema
- **backup-bombaproof.ps1**: Backup robusto

### **Validación**
- **stack-validation.js**: Valida el stack tecnológico
- **validate-vtk-pendientes.js**: Valida pendientes de VThink
- **check-project-status.ps1**: Verifica estado del proyecto
- **check-migration-status.js**: Verifica estado de migraciones

### **Automatización**
- **version-automation.js**: Automatización de versiones
- **fix-naming-conventions.js**: Corrige convenciones de nombres
- **fix-imports.js**: Corrige imports
- **pre-commit-validation.js**: Validación pre-commit

### **Documentación**
- **documentation-automation.js**: Automatización de documentación
- **generate-documentation.js**: Genera documentación
- **DocumentXTR.js**: Herramienta de extracción de documentación
- **generate-*.js**: Scripts de generación específicos

### **Setup**
- **setup-env.js**: Configura el entorno
- **setup-dartai.js**: Configura DartAI
- **dart-setup.ts**: Setup de Dart
- **apply-migrations.ts**: Aplica migraciones

### **Migración**
- **migrate-content.ps1**: Migra contenido de documentación
- **doc-inventory.js**: Inventario de archivos de documentación
- **migration-tracker.js**: Rastrea el progreso de migración
- **generate-dashboard.ps1**: Genera dashboard de migración

### **Utilidades**
- **simple-test.js**: Test simple
- **quick-start.js**: Inicio rápido
- **debug-styles.js**: Debug de estilos
- **check-css-*.js**: Verificaciones de CSS
- **analyze-*.js**: Scripts de análisis
- **apply-*.ps1**: Scripts de aplicación

## 🔍 **Troubleshooting**

### **Sitios No Responden**
```powershell
# Verificar procesos
Get-Process | Where-Object { $_.ProcessName -eq "node" }

# Detener todos los sitios
.\dev-tools\master-orchestrator.ps1 -Category docusaurus -Script orchestrator.ps1 -Stop

# Reiniciar
.\dev-tools\master-orchestrator.ps1 -Category docusaurus -Script start-sites.ps1
```

### **Errores de Sidebar**
- Verificar que los archivos markdown existan
- Revisar configuración en `sidebars.ts`
- Validar enlaces en la documentación

### **Problemas de Puerto**
```powershell
# Verificar puertos en uso
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :3002
netstat -ano | findstr :3003
netstat -ano | findstr :3004
```

## 📈 **Métricas y KPIs**

- **Cobertura de Documentación**: Porcentaje de archivos migrados
- **Tiempo de Respuesta**: Velocidad de carga de sitios
- **Errores de Enlaces**: Enlaces rotos en documentación
- **Completitud de Sidebars**: Configuración correcta de navegación

## 🔄 **Actualizaciones**

### **Agregar Nuevo Script**
1. Colocar en la categoría apropiada
2. Actualizar master-orchestrator.ps1
3. Documentar en README
4. Probar funcionamiento

### **Modificar Scripts**
1. Editar script específico
2. Probar en entorno de desarrollo
3. Actualizar documentación
4. Commit y push

## 📞 **Soporte**

Para problemas o mejoras:
1. Revisar logs de PowerShell
2. Verificar configuración de sitios
3. Validar dependencias
4. Consultar documentación de Docusaurus

---

**VThink 1.0 - Documentación Multi-sitio**  
*Generado automáticamente el $(Get-Date -Format 'dd/MM/yyyy HH:mm')* 