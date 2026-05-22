# 🎯 VThink Command Center - Centro de Comandos

## 📌 Acceso Rápido

### 🚀 Iniciar Dashboard
```powershell
# Opción 1: Script nuevo creado hoy
.\start-dashboard.bat

# Opción 2: PowerShell avanzado
.\Start-VThinkDashboard.ps1

# Opción 3: Comando directo
cd apps/dashboard && npx next dev -p 3001
```

### 🎛️ Master Orchestrator (Sistema Central)
```powershell
# Ver todas las categorías de scripts
.\dev-tools\master-orchestrator.ps1 -List

# Ver información del sistema
.\dev-tools\master-orchestrator.ps1 -Info

# Listar scripts de una categoría
.\dev-tools\master-orchestrator.ps1 -Category testing -List

# Ejecutar un script específico
.\dev-tools\master-orchestrator.ps1 -Category testing -Script test-bundui.js
```

## 📊 Comandos NPM Principales

### Desarrollo
```bash
npm run dev                    # Iniciar servidor desarrollo
npm run build                  # Construir para producción
npm run start                  # Iniciar servidor producción
npm run lint                   # Ejecutar ESLint
```

### Testing
```bash
npm run test                   # Ejecutar tests
npm run test:watch            # Tests en modo watch
npm run test:coverage         # Tests con cobertura
npm run type-check            # Verificación de tipos TypeScript
```

### Validación y Calidad
```bash
# Validaciones Core
npm run validate:reports       # Validar reportes documentación
npm run validate:organization  # Validar organización código
npm run validate:architecture  # Validar reglas arquitectura
npm run validate:root         # Validar limpieza directorio raíz
npm run pre-commit            # Ejecutar todas las validaciones

# Validaciones Avanzadas del Ecosistema
npm run validate:ecosystem              # Validación completa del ecosistema
npm run validate:dependencies          # Verificar compatibilidad dependencias
npm run validate:shared-components     # Análisis uso componentes compartidos
npm run validate:cross-app-compatibility # Validación integración cross-app
npm run validate:performance           # Validación métricas rendimiento
npm run validate:security             # Verificación cumplimiento seguridad
npm run validate:external-update      # Evaluación riesgo dependencias externas
npm run validate:sidebar-consistency  # Consistencia UI entre apps
npm run validate:workspace-compatibility # Validación workspace monorepo
```

### Bundui y Componentes
```bash
npm run validate:bundui-compatibility # Validación integración Bundui
npm run validate:graphics            # Configuración gráficos y charts
npm run validate:shared-component    # Análisis impacto componentes compartidos
npm run validate:new-feature         # Verificación cumplimiento nuevas features
npm run evaluate:components          # Evaluar cumplimiento metodología VThink
```

### Documentación Docusaurus
```bash
npm run start:sites           # Iniciar todos los sitios Docusaurus
npm run create:sites          # Crear nuevos sitios Docusaurus
npm run migrate:docs          # Migrar documentación
npm run orchestrate           # Ejecutar Master Orchestrator
```

## 📁 Estructura de Scripts por Categoría

### 🔒 Security (dev-tools/security/)
- `check-auth-users.js` - Verificar usuarios autenticación
- `check-hardcoding.js` - Detectar hardcoding
- `security-audit.ts` - Auditoría seguridad
- `validate-branding.cjs` - Validar branding

### 🧪 Testing (dev-tools/testing/)
- `test-api.js` - Tests API
- `test-auth-system-e2e.js` - Tests E2E autenticación
- `test-bundui.js` - Tests componentes Bundui
- `test-forms.js` - Tests formularios
- `test-supabase-connection.js` - Test conexión Supabase

### 🚀 Deployment (dev-tools/deployment/)
- `backup-bombaproof.ps1` - Backup a prueba de bombas
- `deploy-production.js` - Despliegue a producción
- `deploy-staging.js` - Despliegue a staging

### 📊 Monitoring (dev-tools/monitoring/)
- `health-check.js` - Verificación salud sistema
- `quality-monitor.js` - Monitor calidad código
- `database-monitor.ts` - Monitor base datos
- `monitor-component-version.js` - Monitor versiones componentes

### 🤖 Automation (dev-tools/automation/)
- `clean-console-logs.js` - Limpiar console.logs
- `fix-imports.js` - Arreglar imports
- `fix-naming-conventions.js` - Estandarizar nombres
- `version-automation.js` - Automatización versiones

### 📝 Documentation (dev-tools/documentation/)
- `DocumentXTR.js` - Sistema documentación XTR
- `generate-documentation.js` - Generar documentación
- `generate-cmmi-evidence.js` - Generar evidencia CMMI
- `generate-route-map.js` - Generar mapa rutas

### 🔧 Utilities (dev-tools/utilities/)
- 80+ scripts utilitarios diversos
- `quick-start.js` - Inicio rápido
- `debug-styles.js` - Debug estilos
- `simple-test.js` - Tests simples

## 🎨 Scripts Especiales Creados Hoy

1. **`start-dashboard.bat`** - Iniciar dashboard con auto-limpieza puerto
2. **`Start-VThinkDashboard.ps1`** - Script PowerShell avanzado con opciones
3. **`.env.local`** en apps/dashboard - Configuración puerto fijo

## 💡 Tips de Uso

### Ver todos los scripts NPM disponibles:
```bash
npm run
```

### Buscar scripts específicos:
```powershell
# Buscar todos los scripts .ps1
Get-ChildItem -Path dev-tools -Recurse -Filter "*.ps1" | Select-Object FullName

# Buscar todos los scripts .js
Get-ChildItem -Path dev-tools -Recurse -Filter "*.js" | Select-Object FullName
```

### Crear alias personalizados:
```powershell
# Agregar a tu perfil de PowerShell
function vthink { .\dev-tools\master-orchestrator.ps1 @args }
function dashboard { .\Start-VThinkDashboard.ps1 }
```

## 🔍 Búsqueda Rápida de Comandos

### Por función:
- **Iniciar algo**: Busca scripts con `start-`, `run-`, `dev`
- **Validar**: Busca scripts con `validate-`, `check-`, `verify-`
- **Limpiar**: Busca scripts con `clean-`, `fix-`, `cleanup-`
- **Generar**: Busca scripts con `generate-`, `create-`, `build-`

### Por tecnología:
- **Bundui**: `bundui`, `validate:bundui`
- **Docusaurus**: `docusaurus`, `start:sites`
- **Testing**: `test-`, `e2e`, `spec`
- **Database**: `supabase`, `db`, `migration`

## 📱 Dashboard Visual (Próximamente)

Estamos trabajando en un dashboard HTML interactivo que mostrará:
- Todos los scripts disponibles
- Última ejecución
- Estado de salud del sistema
- Métricas de rendimiento

---

💡 **TIP**: Guarda este archivo en tus favoritos o créale un acceso directo en el escritorio para tener siempre a mano todos los comandos del proyecto.