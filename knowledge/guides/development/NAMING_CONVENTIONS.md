# 📝 **CONVENCIONES DE NOMENCLATURA - VThink 1.0**

## 🎯 **RESUMEN EJECUTIVO**

**Versión:** 1.0  
**Fecha:** 19/7/2025  
**Estado:** ✅ **ACTIVO**  
**Cumplimiento:** VThink 1.0 + CMMI-ML3

## 📋 **CONVENCIONES GENERALES**

### **Principios Fundamentales:**
- ✅ **Claridad** - Nombres descriptivos y autoexplicativos
- ✅ **Consistencia** - Patrones uniformes en todo el proyecto
- ✅ **Escalabilidad** - Nombres que soporten crecimiento
- ✅ **Mantenibilidad** - Fácil de entender y modificar

## 🏗️ **ESTRUCTURA DE ARCHIVOS**

### **Monorepo Structure:**
```
src/
├── apps/                    # Aplicaciones independientes
│   ├── admin/              # Panel de administración
│   ├── dashboard/          # Dashboard principal
│   ├── ai-chat/            # Chat con IA
│   ├── helpdesk/           # Sistema de soporte
│   └── login/              # Autenticación
├── shared/                 # Componentes y utilidades compartidas
│   ├── components/         # Componentes reutilizables
│   ├── hooks/              # Custom hooks
│   ├── utils/              # Utilidades
│   ├── types/              # Definiciones de tipos
│   └── services/           # Servicios compartidos
├── integrations/           # Integraciones externas
│   ├── supabase/           # Base de datos
│   ├── bundui/             # UI components
│   └── external/           # APIs externas
└── modules/                # Módulos de negocio
    ├── migration-engine/   # Motor de migración
    └── theme-management/   # Gestión de temas
```

## 🎨 **COMPONENTES Y ARCHIVOS**

### **Componentes React:**
```typescript
// ✅ Correcto - PascalCase para componentes
UserProfile.tsx
CompanySettings.tsx
DashboardMetrics.tsx
AIAssistant.tsx

// ❌ Incorrecto
userProfile.tsx
company_settings.tsx
dashboard-metrics.tsx
ai_assistant.tsx
```

### **Hooks Personalizados:**
```typescript
// ✅ Correcto - camelCase con prefijo 'use'
useAuth.ts
useCompanyData.tsx
useOperationalQueries.tsx
useMultiCountryConfiguration.ts

// ❌ Incorrecto
Auth.ts
CompanyData.tsx
operational-queries.tsx
multi_country_config.ts
```

### **Utilidades y Servicios:**
```typescript
// ✅ Correcto - camelCase descriptivo
logger.ts
apiClient.ts
validationUtils.ts
performanceMonitor.ts

// ❌ Incorrecto
Logger.ts
API_CLIENT.ts
validation-utils.ts
performance_monitor.ts
```

## 🗄️ **BASE DE DATOS**

### **Tablas:**
```sql
-- ✅ Correcto - snake_case para tablas
users
user_profiles
companies
monthly_billing
ai_usage_logs
meetings
configurations

-- ❌ Incorrecto
Users
userProfiles
Companies
monthlyBilling
aiUsageLogs
Meetings
Configurations
```

### **Columnas:**
```sql
-- ✅ Correcto - snake_case para columnas
user_id
company_id
created_at
updated_at
is_active
subscription_plan
max_users

-- ❌ Incorrecto
userId
companyId
createdAt
updatedAt
isActive
subscriptionPlan
maxUsers
```

## 🔐 **AUTENTICACIÓN Y ROLES**

### **Roles de Usuario:**
```typescript
// ✅ Correcto - UPPER_CASE para roles
enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN',
  OWNER = 'OWNER',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

// ❌ Incorrecto
enum UserRole {
  employee = 'employee',
  manager = 'manager',
  admin = 'admin'
}
```

### **Permisos:**
```typescript
// ✅ Correcto - camelCase para permisos
const permissions = {
  canViewUsers: true,
  canEditCompany: false,
  canAccessAdmin: true,
  canManageBilling: false
}

// ❌ Incorrecto
const permissions = {
  CAN_VIEW_USERS: true,
  CAN_EDIT_COMPANY: false,
  can_access_admin: true
}
```

## 🎯 **VARIABLES Y FUNCIONES**

### **Variables:**
```typescript
// ✅ Correcto - camelCase descriptivo
const currentUser = user;
const companySettings = settings;
const isAuthenticated = true;
const hasPermission = checkPermission();

// ❌ Incorrecto
const user = user;
const settings = settings;
const auth = true;
const perm = checkPermission();
```

### **Funciones:**
```typescript
// ✅ Correcto - camelCase descriptivo
const fetchUserData = async () => {};
const updateCompanySettings = async () => {};
const validateUserPermissions = () => {};
const handleUserLogin = () => {};

// ❌ Incorrecto
const getUser = async () => {};
const updateSettings = async () => {};
const validate = () => {};
const login = () => {};
```

## 🎨 **CSS Y ESTILOS**

### **Clases CSS:**
```css
/* ✅ Correcto - kebab-case para clases */
.user-profile { }
.company-settings { }
.dashboard-metrics { }
.ai-assistant { }

/* ❌ Incorrecto */
.userProfile { }
.companySettings { }
.dashboardMetrics { }
.aiAssistant { }
```

### **Variables CSS:**
```css
/* ✅ Correcto - kebab-case para variables */
:root {
  --primary-color: #3b82f6;
  --secondary-color: #64748b;
  --border-radius: 0.5rem;
  --font-size-base: 1rem;
}

/* ❌ Incorrecto */
:root {
  --primaryColor: #3b82f6;
  --secondaryColor: #64748b;
  --borderRadius: 0.5rem;
  --fontSizeBase: 1rem;
}
```

## 📁 **ESTRUCTURA DE CARPETAS**

### **Organización por Funcionalidad:**
```
components/
├── ui/                     # Componentes base de UI
│   ├── Button.tsx
│   ├── Input.tsx
│   └── Modal.tsx
├── admin/                  # Componentes específicos de admin
│   ├── UserManagement.tsx
│   ├── CompanySettings.tsx
│   └── BillingPanel.tsx
└── dashboard/              # Componentes de dashboard
    ├── MetricsCard.tsx
    ├── ChartComponent.tsx
    └── ActivityFeed.tsx
```

### **Organización por Tipo:**
```
hooks/
├── auth/                   # Hooks de autenticación
│   ├── useAuth.ts
│   └── usePermissions.ts
├── data/                   # Hooks de datos
│   ├── useCompanyData.tsx
│   └── useUserData.tsx
└── ui/                     # Hooks de UI
    ├── useModal.ts
    └── useToast.ts
```

## 🔧 **CONFIGURACIÓN Y ENV**

### **Variables de Entorno:**
```bash
# ✅ Correcto - UPPER_CASE con guiones bajos
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
OPENAI_API_KEY=your_openai_key

# ❌ Incorrecto
nextPublicSupabaseUrl=your_url
supabaseAnonKey=your_key
openaiApiKey=your_openai_key
```

### **Configuración de Archivos:**
```typescript
// ✅ Correcto - camelCase para config
const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  enableDebug: process.env.NODE_ENV === 'development'
}

// ❌ Incorrecto
const config = {
  API_URL: process.env.NEXT_PUBLIC_API_URL,
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  ENABLE_DEBUG: process.env.NODE_ENV === 'development'
}
```

## 🧪 **TESTING**

### **Archivos de Test:**
```typescript
// ✅ Correcto - .test.ts o .spec.ts
UserProfile.test.tsx
useAuth.test.ts
logger.test.ts
apiClient.spec.ts

// ❌ Incorrecto
UserProfileTest.tsx
useAuthTest.ts
loggerTest.ts
apiClientSpec.ts
```

### **Nombres de Tests:**
```typescript
// ✅ Correcto - Descriptivo y claro
describe('UserProfile Component', () => {
  it('should render user information correctly', () => {});
  it('should handle user updates', () => {});
  it('should validate user permissions', () => {});
});

// ❌ Incorrecto
describe('UserProfile', () => {
  it('renders', () => {});
  it('updates', () => {});
  it('validates', () => {});
});
```

## 📚 **DOCUMENTACIÓN**

### **Archivos de Documentación:**
```markdown
# ✅ Correcto - PascalCase con guiones
README.md
DEVELOPMENT_GUIDE.md
API_DOCUMENTATION.md
SECURITY_POLICIES.md

# ❌ Incorrecto
readme.md
development-guide.md
api-documentation.md
security-policies.md
```

### **Secciones de Documentación:**
```markdown
# ✅ Correcto - Jerarquía clara
## 🎯 **RESUMEN EJECUTIVO**
### 📋 **CONVENCIONES GENERALES**
#### 🏗️ **ESTRUCTURA DE ARCHIVOS**

# ❌ Incorrecto
# Resumen Ejecutivo
## Convenciones Generales
### Estructura de Archivos
```

## 🔄 **MIGRACIÓN Y ACTUALIZACIONES**

### **Archivos de Migración:**
```sql
-- ✅ Correcto - Timestamp + descripción
20240719_001_create_users_table.sql
20240719_002_add_company_id_to_users.sql
20240719_003_create_rls_policies.sql

-- ❌ Incorrecto
create_users_table.sql
add_company_id.sql
create_policies.sql
```

### **Versiones de API:**
```typescript
// ✅ Correcto - Semántico
const API_VERSION = 'v1';
const API_BASE_URL = '/api/v1';

// ❌ Incorrecto
const API_VERSION = '1.0';
const API_BASE_URL = '/api/1.0';
```

## ✅ **CHECKLIST DE CUMPLIMIENTO**

### **Antes de Commit:**
- [ ] **Nombres descriptivos** y autoexplicativos
- [ ] **Consistencia** con convenciones establecidas
- [ ] **Sin abreviaciones** confusas
- [ ] **Documentación** actualizada
- [ ] **Tests** con nombres claros
- [ ] **Variables de entorno** correctamente nombradas

### **Revisión de Código:**
- [ ] **Convenciones** seguidas consistentemente
- [ ] **Nombres** reflejan funcionalidad
- [ ] **Estructura** organizada lógicamente
- [ ] **Documentación** clara y actualizada

---

**📌 NOTA: Estas convenciones son OBLIGATORIAS para mantener la calidad y consistencia del código en el proyecto VThink 1.0.**
