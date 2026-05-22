# 🛡️ **POLÍTICAS DE SEGURIDAD - VThink 1.0**

## 🎯 **RESUMEN EJECUTIVO**

**Versión:** 1.0  
**Fecha:** 19/7/2025  
**Estado:** ✅ **ACTIVO**  
**Cumplimiento:** VThink 1.0 + CMMI-ML3

## 🔒 **PRINCIPIOS DE SEGURIDAD**

### **Multi-tenant Isolation:**
- ✅ **Aislamiento completo** entre empresas
- ✅ **Filtrado obligatorio** por company_id
- ✅ **Políticas RLS** en todas las tablas
- ✅ **Validación de permisos** en cada operación

### **Defense in Depth:**
- ✅ **Autenticación** en múltiples capas
- ✅ **Autorización** granular por roles
- ✅ **Validación de datos** en frontend y backend
- ✅ **Encriptación** de datos sensibles

## 🏢 **POLÍTICAS MULTI-TENANT**

### **Aislamiento de Datos:**
```typescript
// ✅ OBLIGATORIO - Siempre filtrar por company_id
const getUserData = async (userId: string, companyId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .eq('company_id', companyId) // ✅ FILTRO OBLIGATORIO
    .single();
    
  if (error) throw error;
  return data;
};

// ❌ PROHIBIDO - Sin filtro de company_id
const getUserData = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId) // ❌ SIN FILTRO DE COMPANY_ID
    .single();
    
  if (error) throw error;
  return data;
};
```

### **Políticas RLS (Row Level Security):**
```sql
-- ✅ OBLIGATORIO - Política RLS para usuarios
CREATE POLICY "Users can only access their company data" ON users
  FOR ALL USING (company_id = auth.jwt() ->> 'company_id');

-- ✅ OBLIGATORIO - Política RLS para perfiles
CREATE POLICY "User profiles company isolation" ON user_profiles
  FOR ALL USING (company_id = auth.jwt() ->> 'company_id');

-- ✅ OBLIGATORIO - Política RLS para configuraciones
CREATE POLICY "Company settings isolation" ON company_configurations
  FOR ALL USING (company_id = auth.jwt() ->> 'company_id');
```

## 👥 **POLÍTICAS DE ROLES Y PERMISOS**

### **Jerarquía de Roles:**
```typescript
// ✅ ESTRUCTURA DE ROLES
enum UserRole {
  EMPLOYEE = 'EMPLOYEE',      // Acceso básico
  MANAGER = 'MANAGER',        // Gestión de equipo
  ADMIN = 'ADMIN',            // Administración de empresa
  OWNER = 'OWNER',            // Propietario de empresa
  SUPER_ADMIN = 'SUPER_ADMIN' // Acceso cross-company
}

// ✅ PERMISOS POR ROL
const rolePermissions = {
  EMPLOYEE: ['VIEW_OWN_PROFILE', 'EDIT_OWN_PROFILE'],
  MANAGER: ['VIEW_TEAM', 'MANAGE_TEAM', 'VIEW_REPORTS'],
  ADMIN: ['MANAGE_USERS', 'MANAGE_SETTINGS', 'VIEW_BILLING'],
  OWNER: ['MANAGE_COMPANY', 'MANAGE_BILLING', 'MANAGE_PLANS'],
  SUPER_ADMIN: ['CROSS_COMPANY_ACCESS', 'SYSTEM_ADMIN']
};
```

### **Verificación de Permisos:**
```typescript
// ✅ OBLIGATORIO - Verificar permisos antes de operaciones
const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    
    if (!hasPermission(user, permission)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    
    next();
  };
};

// ✅ USO EN RUTAS
app.get('/api/users', 
  requirePermission('VIEW_USERS'),
  async (req, res) => {
    // Lógica de la ruta
  }
);
```

## 🔐 **POLÍTICAS DE AUTENTICACIÓN**

### **Autenticación Multi-factor:**
```typescript
// ✅ OBLIGATORIO - Validación MFA
const validateMFA = async (userId: string, token: string) => {
  const user = await getUser(userId);
  
  if (user.mfa_enabled) {
    const isValid = await verifyMFAToken(userId, token);
    if (!isValid) {
      throw new Error('Token MFA inválido');
    }
  }
  
  return true;
};
```

### **Gestión de Sesiones:**
```typescript
// ✅ OBLIGATORIO - Sesiones seguras
const createSecureSession = (user: User) => {
  const session = {
    userId: user.id,
    companyId: user.company_id,
    role: user.role,
    permissions: getUserPermissions(user),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
    mfaVerified: user.mfa_enabled ? false : true
  };
  
  return encryptSession(session);
};
```

## 📊 **POLÍTICAS DE VALIDACIÓN DE DATOS**

### **Validación de Entrada:**
```typescript
// ✅ OBLIGATORIO - Validación estricta
const validateUserInput = (data: any): UserData => {
  const schema = z.object({
    email: z.string().email('Email inválido'),
    name: z.string().min(2, 'Nombre muy corto').max(100, 'Nombre muy largo'),
    role: z.enum(['EMPLOYEE', 'MANAGER', 'ADMIN', 'OWNER']),
    company_id: z.string().uuid('Company ID inválido')
  });
  
  return schema.parse(data);
};

// ✅ USO EN SERVICIOS
const createUser = async (userData: any) => {
  const validatedData = validateUserInput(userData);
  
  // Continuar con datos validados
  const { data, error } = await supabase
    .from('users')
    .insert(validatedData)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};
```

### **Sanitización de Datos:**
```typescript
// ✅ OBLIGATORIO - Sanitizar entrada
import DOMPurify from 'dompurify';

const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input);
};

// ✅ USO EN COMPONENTES
const UserInput: React.FC = () => {
  const handleSubmit = (data: any) => {
    const sanitizedData = {
      ...data,
      name: sanitizeInput(data.name),
      description: sanitizeInput(data.description)
    };
    
    // Enviar datos sanitizados
    submitUserData(sanitizedData);
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
};
```

## 🔒 **POLÍTICAS DE ENCRIPTACIÓN**

### **Encriptación de Datos Sensibles:**
```typescript
// ✅ OBLIGATORIO - Encriptar datos sensibles
import crypto from 'crypto';

const encryptSensitiveData = (data: string): string => {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipher(algorithm, key);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return `${iv.toString('hex')}:${encrypted}`;
};

const decryptSensitiveData = (encryptedData: string): string => {
  const [ivHex, encrypted] = encryptedData.split(':');
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  
  const decipher = crypto.createDecipher('aes-256-gcm', key);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};
```

### **Hashing de Contraseñas:**
```typescript
// ✅ OBLIGATORIO - Hash seguro de contraseñas
import bcrypt from 'bcrypt';

const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};
```

## 🚨 **POLÍTICAS DE AUDITORÍA**

### **Logging de Seguridad:**
```typescript
// ✅ OBLIGATORIO - Logging de eventos de seguridad
const logSecurityEvent = (event: SecurityEvent) => {
  logger.warn({
    event: 'security_event',
    type: event.type,
    userId: event.userId,
    companyId: event.companyId,
    ipAddress: event.ipAddress,
    userAgent: event.userAgent,
    timestamp: new Date().toISOString()
  }, `Evento de seguridad: ${event.type}`);
};

// ✅ TIPOS DE EVENTOS
interface SecurityEvent {
  type: 'LOGIN_ATTEMPT' | 'PERMISSION_DENIED' | 'DATA_ACCESS' | 'MFA_FAILED';
  userId?: string;
  companyId?: string;
  ipAddress: string;
  userAgent: string;
}
```

### **Monitoreo de Actividad:**
```typescript
// ✅ OBLIGATORIO - Monitorear actividad sospechosa
const monitorActivity = (activity: UserActivity) => {
  // Detectar patrones sospechosos
  if (activity.failedLogins > 5) {
    logSecurityEvent({
      type: 'LOGIN_ATTEMPT',
      userId: activity.userId,
      ipAddress: activity.ipAddress,
      userAgent: activity.userAgent
    });
    
    // Bloquear temporalmente
    blockUser(activity.userId, 30); // 30 minutos
  }
};
```

## 🔍 **POLÍTICAS DE DETECCIÓN**

### **Detección de Intrusos:**
```typescript
// ✅ OBLIGATORIO - Detectar actividad sospechosa
const detectSuspiciousActivity = (activity: ActivityLog) => {
  const suspiciousPatterns = [
    { pattern: 'multiple_failed_logins', threshold: 5 },
    { pattern: 'cross_company_access', threshold: 1 },
    { pattern: 'unusual_data_access', threshold: 100 },
    { pattern: 'privilege_escalation', threshold: 1 }
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (activity.matches(pattern.pattern) >= pattern.threshold) {
      triggerSecurityAlert(activity);
    }
  }
};
```

### **Alertas de Seguridad:**
```typescript
// ✅ OBLIGATORIO - Sistema de alertas
const triggerSecurityAlert = (activity: ActivityLog) => {
  // Log del evento
  logger.error({
    event: 'security_alert',
    activity: activity.type,
    userId: activity.userId,
    companyId: activity.companyId,
    severity: 'HIGH'
  }, `Alerta de seguridad: ${activity.type}`);
  
  // Notificar a administradores
  notifyAdmins({
    type: 'SECURITY_ALERT',
    activity: activity,
    timestamp: new Date().toISOString()
  });
};
```

## 📋 **CHECKLIST DE SEGURIDAD**

### **Antes de Deploy:**
- [ ] **Políticas RLS** configuradas en todas las tablas
- [ ] **Validación de datos** implementada
- [ ] **Encriptación** de datos sensibles
- [ ] **Logging de seguridad** activo
- [ ] **Monitoreo** configurado
- [ ] **Alertas** configuradas
- [ ] **Backup** de datos implementado

### **Auditoría Mensual:**
- [ ] **Revisar logs** de seguridad
- [ ] **Verificar políticas** RLS
- [ ] **Actualizar dependencias** de seguridad
- [ ] **Revisar permisos** de usuarios
- [ ] **Validar encriptación** de datos
- [ ] **Probar backup** y recuperación

### **Incidentes de Seguridad:**
- [ ] **Documentar** el incidente
- [ ] **Contener** la amenaza
- [ ] **Investigar** la causa raíz
- [ ] **Implementar** correcciones
- [ ] **Notificar** a stakeholders
- [ ] **Actualizar** políticas si es necesario

## 🚨 **PROCEDIMIENTOS DE EMERGENCIA**

### **En caso de Breach:**
1. **Inmediatamente** aislar sistemas afectados
2. **Documentar** todo el incidente
3. **Notificar** a autoridades si es necesario
4. **Investigar** causa raíz
5. **Implementar** correcciones
6. **Comunicar** a usuarios afectados
7. **Actualizar** políticas de seguridad

### **Contactos de Emergencia:**
- **CISO:** security@vibethink.com
- **DevOps:** devops@vibethink.com
- **Legal:** legal@vibethink.com

---

**📌 NOTA: Estas políticas son OBLIGATORIAS y NO se pueden omitir bajo ninguna circunstancia.** 