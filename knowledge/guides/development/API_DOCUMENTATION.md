# 🔌 **DOCUMENTACIÓN DE API - VThink 1.0**

## 🎯 **RESUMEN EJECUTIVO**

**Versión:** 1.0  
**Fecha:** 19/7/2025  
**Estado:** ✅ **ACTIVO**  
**Cumplimiento:** VThink 1.0 + CMMI-ML3

## 📋 **INFORMACIÓN GENERAL**

### **Base URL:**
```
Development:  http://localhost:3000/api
Staging:      https://staging-api.vibethink.com
Production:   https://api.vibethink.com
```

### **Autenticación:**
```typescript
// ✅ Headers requeridos
{
  'Authorization': 'Bearer <jwt_token>',
  'Content-Type': 'application/json',
  'X-Company-ID': '<company_id>'
}
```

### **Respuestas Estándar:**
```typescript
// ✅ Respuesta exitosa
{
  "success": true,
  "data": { /* datos */ },
  "message": "Operación exitosa",
  "timestamp": "2025-07-19T10:30:00Z"
}

// ✅ Respuesta de error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Datos inválidos",
    "details": [ /* errores específicos */ ]
  },
  "timestamp": "2025-07-19T10:30:00Z"
}
```

## 👥 **API DE USUARIOS**

### **GET /api/users**
**Descripción:** Obtener lista de usuarios de la empresa

**Headers requeridos:**
```typescript
{
  'Authorization': 'Bearer <jwt_token>',
  'X-Company-ID': '<company_id>'
}
```

**Parámetros de query:**
```typescript
{
  page?: number;        // Página (default: 1)
  limit?: number;       // Límite por página (default: 20)
  role?: UserRole;      // Filtrar por rol
  search?: string;      // Búsqueda por nombre/email
  active?: boolean;     // Filtrar por estado activo
}
```

**Respuesta exitosa:**
```typescript
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "user@company.com",
        "name": "John Doe",
        "role": "EMPLOYEE",
        "company_id": "company_uuid",
        "is_active": true,
        "created_at": "2025-07-19T10:30:00Z",
        "updated_at": "2025-07-19T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

**Códigos de error:**
- `401` - No autenticado
- `403` - Sin permisos para ver usuarios
- `400` - Parámetros inválidos

### **POST /api/users**
**Descripción:** Crear nuevo usuario

**Headers requeridos:**
```typescript
{
  'Authorization': 'Bearer <jwt_token>',
  'X-Company-ID': '<company_id>',
  'Content-Type': 'application/json'
}
```

**Body:**
```typescript
{
  "email": "newuser@company.com",
  "name": "New User",
  "role": "EMPLOYEE",
  "password": "secure_password",
  "send_invitation": true
}
```

**Respuesta exitosa:**
```typescript
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "newuser@company.com",
      "name": "New User",
      "role": "EMPLOYEE",
      "company_id": "company_uuid",
      "is_active": true,
      "created_at": "2025-07-19T10:30:00Z"
    },
    "invitation_sent": true
  }
}
```

**Códigos de error:**
- `401` - No autenticado
- `403` - Sin permisos para crear usuarios
- `400` - Datos inválidos
- `409` - Email ya existe

### **PUT /api/users/:id**
**Descripción:** Actualizar usuario

**Headers requeridos:**
```typescript
{
  'Authorization': 'Bearer <jwt_token>',
  'X-Company-ID': '<company_id>',
  'Content-Type': 'application/json'
}
```

**Body:**
```typescript
{
  "name": "Updated Name",
  "role": "MANAGER",
  "is_active": true
}
```

**Respuesta exitosa:**
```typescript
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@company.com",
      "name": "Updated Name",
      "role": "MANAGER",
      "company_id": "company_uuid",
      "is_active": true,
      "updated_at": "2025-07-19T10:30:00Z"
    }
  }
}
```

## 🏢 **API DE EMPRESAS**

### **GET /api/companies/:id**
**Descripción:** Obtener información de la empresa

**Headers requeridos:**
```typescript
{
  'Authorization': 'Bearer <jwt_token>',
  'X-Company-ID': '<company_id>'
}
```

**Respuesta exitosa:**
```typescript
{
  "success": true,
  "data": {
    "company": {
      "id": "company_uuid",
      "name": "Mi Empresa",
      "domain": "miempresa.com",
      "plan": "PREMIUM",
      "max_users": 100,
      "current_users": 45,
      "created_at": "2025-01-01T00:00:00Z",
      "settings": {
        "theme": "dark",
        "language": "es",
        "timezone": "America/Mexico_City"
      }
    }
  }
}
```

### **PUT /api/companies/:id**
**Descripción:** Actualizar configuración de la empresa

**Headers requeridos:**
```typescript
{
  'Authorization': 'Bearer <jwt_token>',
  'X-Company-ID': '<company_id>',
  'Content-Type': 'application/json'
}
```

**Body:**
```typescript
{
  "name": "Nuevo Nombre",
  "settings": {
    "theme": "light",
    "language": "en",
    "timezone": "UTC"
  }
}
```

## 💰 **API DE FACTURACIÓN**

### **GET /api/billing/current**
**Descripción:** Obtener información de facturación actual

**Headers requeridos:**
```typescript
{
  'Authorization': 'Bearer <jwt_token>',
  'X-Company-ID': '<company_id>'
}
```

**Respuesta exitosa:**
```typescript
{
  "success": true,
  "data": {
    "billing": {
      "plan": "PREMIUM",
      "monthly_cost": 99.99,
      "current_usage": {
        "users": 45,
        "storage_gb": 2.5,
        "api_calls": 15000
      },
      "limits": {
        "max_users": 100,
        "max_storage_gb": 10,
        "max_api_calls": 50000
      },
      "next_billing_date": "2025-08-01T00:00:00Z"
    }
  }
}
```

### **GET /api/billing/history**
**Descripción:** Obtener historial de facturación

**Parámetros de query:**
```typescript
{
  page?: number;        // Página (default: 1)
  limit?: number;       // Límite por página (default: 12)
  year?: number;        // Filtrar por año
}
```

**Respuesta exitosa:**
```typescript
{
  "success": true,
  "data": {
    "invoices": [
      {
        "id": "inv_uuid",
        "amount": 99.99,
        "status": "PAID",
        "billing_date": "2025-07-01T00:00:00Z",
        "due_date": "2025-07-15T00:00:00Z",
        "pdf_url": "https://api.vibethink.com/invoices/inv_uuid.pdf"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 24,
      "totalPages": 2
    }
  }
}
```

## 🤖 **API DE IA**

### **POST /api/ai/chat**
**Descripción:** Enviar mensaje al chat de IA

**Headers requeridos:**
```typescript
{
  'Authorization': 'Bearer <jwt_token>',
  'X-Company-ID': '<company_id>',
  'Content-Type': 'application/json'
}
```

**Body:**
```typescript
{
  "message": "¿Cuál es el estado de mis proyectos?",
  "context": {
    "project_id": "proj_uuid",
    "conversation_id": "conv_uuid"
  },
  "model": "gpt-4" // opcional, default: gpt-3.5-turbo
}
```

**Respuesta exitosa:**
```typescript
{
  "success": true,
  "data": {
    "response": "Basándome en los datos de tus proyectos...",
    "conversation_id": "conv_uuid",
    "usage": {
      "tokens_used": 150,
      "cost": 0.002
    },
    "model": "gpt-4"
  }
}
```

### **GET /api/ai/usage**
**Descripción:** Obtener uso de IA

**Parámetros de query:**
```typescript
{
  start_date?: string;  // YYYY-MM-DD
  end_date?: string;    // YYYY-MM-DD
  model?: string;       // Filtrar por modelo
}
```

**Respuesta exitosa:**
```typescript
{
  "success": true,
  "data": {
    "usage": {
      "total_tokens": 15000,
      "total_cost": 0.15,
      "daily_usage": [
        {
          "date": "2025-07-19",
          "tokens": 2500,
          "cost": 0.025
        }
      ]
    }
  }
}
```

## 📊 **API DE MÉTRICAS**

### **GET /api/metrics/dashboard**
**Descripción:** Obtener métricas del dashboard

**Headers requeridos:**
```typescript
{
  'Authorization': 'Bearer <jwt_token>',
  'X-Company-ID': '<company_id>'
}
```

**Respuesta exitosa:**
```typescript
{
  "success": true,
  "data": {
    "metrics": {
      "users": {
        "total": 45,
        "active": 42,
        "growth": 12.5
      },
      "usage": {
        "storage_gb": 2.5,
        "api_calls": 15000,
        "ai_requests": 500
      },
      "performance": {
        "avg_response_time": 120,
        "uptime": 99.9,
        "error_rate": 0.1
      }
    }
  }
}
```

### **GET /api/metrics/analytics**
**Descripción:** Obtener analytics detallados

**Parámetros de query:**
```typescript
{
  metric: 'users' | 'usage' | 'performance';
  period: 'day' | 'week' | 'month' | 'year';
  start_date?: string;
  end_date?: string;
}
```

## 🔧 **API DE CONFIGURACIÓN**

### **GET /api/config/company**
**Descripción:** Obtener configuración de la empresa

**Respuesta exitosa:**
```typescript
{
  "success": true,
  "data": {
    "config": {
      "theme": {
        "mode": "dark",
        "primary_color": "#3b82f6",
        "secondary_color": "#64748b"
      },
      "notifications": {
        "email": true,
        "push": false,
        "sms": false
      },
      "security": {
        "mfa_required": true,
        "session_timeout": 24,
        "password_policy": "strong"
      },
      "integrations": {
        "slack": false,
        "teams": true,
        "google_workspace": false
      }
    }
  }
}
```

### **PUT /api/config/company**
**Descripción:** Actualizar configuración de la empresa

**Body:**
```typescript
{
  "theme": {
    "mode": "light",
    "primary_color": "#10b981"
  },
  "notifications": {
    "email": true,
    "push": true
  }
}
```

## 🚨 **CÓDIGOS DE ERROR ESTÁNDAR**

### **Errores de Autenticación:**
```typescript
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token de autenticación inválido",
    "details": {
      "expired": true,
      "invalid_signature": false
    }
  }
}
```

### **Errores de Autorización:**
```typescript
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "No tienes permisos para esta operación",
    "details": {
      "required_permission": "MANAGE_USERS",
      "user_permissions": ["VIEW_USERS"]
    }
  }
}
```

### **Errores de Validación:**
```typescript
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Datos inválidos",
    "details": [
      {
        "field": "email",
        "message": "Email inválido"
      },
      {
        "field": "password",
        "message": "Contraseña debe tener al menos 8 caracteres"
      }
    ]
  }
}
```

### **Errores de Recurso:**
```typescript
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Usuario no encontrado",
    "details": {
      "resource": "user",
      "id": "uuid"
    }
  }
}
```

## 📚 **EJEMPLOS DE USO**

### **Crear Usuario con JavaScript:**
```javascript
const createUser = async (userData) => {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Company-ID': companyId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error.message);
  }
  
  return result.data.user;
};
```

### **Obtener Métricas con TypeScript:**
```typescript
interface DashboardMetrics {
  users: {
    total: number;
    active: number;
    growth: number;
  };
  usage: {
    storage_gb: number;
    api_calls: number;
    ai_requests: number;
  };
}

const getDashboardMetrics = async (): Promise<DashboardMetrics> => {
  const response = await fetch('/api/metrics/dashboard', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Company-ID': companyId
    }
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error.message);
  }
  
  return result.data.metrics;
};
```

## 🔄 **RATE LIMITING**

### **Límites por Endpoint:**
```typescript
{
  'GET /api/users': '100 requests/hour',
  'POST /api/users': '10 requests/hour',
  'PUT /api/users/:id': '50 requests/hour',
  'GET /api/metrics/*': '200 requests/hour',
  'POST /api/ai/chat': '100 requests/hour'
}
```

### **Headers de Rate Limiting:**
```typescript
{
  'X-RateLimit-Limit': '100',
  'X-RateLimit-Remaining': '95',
  'X-RateLimit-Reset': '1640995200'
}
```

---

**📌 NOTA: Todas las APIs requieren autenticación y autorización apropiada.** 