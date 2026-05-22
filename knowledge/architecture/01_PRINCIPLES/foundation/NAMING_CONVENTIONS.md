# Reglas de Nomenclatura - VTK 1.0

## 🚨 **Reglas OBLIGATORIAS para evitar errores de tipografía**

### **1. Agente AI vs Agente IA - REGLA CRÍTICA**

#### **✅ CORRECTO:**
- **En español:** "Agente AI"
- **En código:** `AI_SUPPORT_AP_TEAM`
- **En variables:** `aiAgent`, `aiSupport`, `aiTeam`
- **En campos DB:** `ai_agent_id`, `ai_team_name`

#### **❌ INCORRECTO:**
- **En español:** "Agente IA" (NO usar)
- **En código:** `IA_SUPPORT_AP_TEAM` (NO usar)
- **En variables:** `iaAgent`, `iaSupport` (NO usar)
- **En campos DB:** `ia_agent_id` (NO usar)

#### **Justificación:**
- Evita confusión entre "AI" (Artificial Intelligence) e "IA" (Inteligencia Artificial)
- Previene errores de tipografía en nombres de variables, campos de base de datos, etc.
- Mantiene consistencia en todo el código y documentación

---

### **2. Nomenclatura de Equipos del CREW**

#### **Estructura:**
```
[NOMBRE]_AP_TEAM
```

#### **Ejemplos:**
- `SUPPORT_AP_TEAM`
- `SALES_AP_TEAM`
- `BILLING_AP_TEAM`
- `DEVELOPMENT_AP_TEAM`
- `ADMINISTRATION_AP_TEAM`
- `OPERATIONS_AP_TEAM`
- `ANALYTICS_AP_TEAM`
- `INTEGRATION_AP_TEAM`
- `SECURITY_AP_TEAM`

---

### **3. Nomenclatura de Agentes AI**

#### **Estructura:**
```
AI_[NOMBRE_DEL_EQUIPO]
```

#### **Ejemplos:**
- `AI_CREW_AP`
- `AI_SUPPORT_AP_TEAM`
- `AI_SALES_AP_TEAM`
- `AI_BILLING_AP_TEAM`
- `AI_DEVELOPMENT_AP_TEAM`
- `AI_ADMINISTRATION_AP_TEAM`
- `AI_OPERATIONS_AP_TEAM`
- `AI_ANALYTICS_AP_TEAM`
- `AI_INTEGRATION_AP_TEAM`
- `AI_SECURITY_AP_TEAM`

---

### **4. Nomenclatura de Roles**

#### **Estructura:**
```
[ROL]_AP (para roles internos)
[ROL]_CUST (para roles de clientes)
```

#### **Ejemplos:**
- `SUPER_ADMIN_AP`
- `SUPPORT_AP`
- `ADMIN_AP`
- `TECH_LEAD_AP`
- `DEVELOPER_AP`
- `MANAGER_AP`
- `EMPLOYEE_AP`

---

### **5. Nomenclatura de Variables en Código**

#### **TypeScript/JavaScript:**
```typescript
// ✅ CORRECTO
const aiAgent = 'AI_SUPPORT_AP_TEAM';
const aiTeamMembers = [];
const aiAgentConfig = {};

// ❌ INCORRECTO
const iaAgent = 'IA_SUPPORT_AP_TEAM'; // NO usar
const iaTeamMembers = []; // NO usar
```

#### **Base de Datos:**
```sql
-- ✅ CORRECTO
CREATE TABLE ai_agents (
    ai_agent_id SERIAL PRIMARY KEY,
    ai_team_name VARCHAR(100),
    ai_agent_config JSONB
);

-- ❌ INCORRECTO
CREATE TABLE ia_agents ( -- NO usar
    ia_agent_id SERIAL PRIMARY KEY, -- NO usar
    ia_team_name VARCHAR(100) -- NO usar
);
```

---

### **6. Nomenclatura de Archivos**

#### **Estructura:**
```
[FUNCIONALIDAD]_[TIPO].ts
```

#### **Ejemplos:**
- `ai_agent_config.ts`
- `crew_teams_organization.md`
- `role_permissions.ts`
- `team_analytics.ts`

---

### **7. Nomenclatura de Funciones**

#### **Estructura:**
```
[acción][Entidad][Contexto]
```

#### **Ejemplos:**
```typescript
// ✅ CORRECTO
function getAiAgentConfig(teamName: string) {}
function updateCrewTeamMembers(teamId: string) {}
function validateRolePermissions(role: UserRole) {}

// ❌ INCORRECTO
function getIaAgentConfig(teamName: string) {} // NO usar
function updateCrewTeamMembers(teamId: string) {} // NO usar
```

---

### **8. Nomenclatura de Interfaces/Types**

#### **TypeScript:**
```typescript
// ✅ CORRECTO
interface AiAgentConfig {
    agentId: string;
    teamName: string;
    capabilities: string[];
}

type CrewTeam = {
    teamId: string;
    teamName: string;
    aiAgent: AiAgentConfig;
};

// ❌ INCORRECTO
interface IaAgentConfig { // NO usar
    agentId: string;
    teamName: string;
}
```

---

### **9. Nomenclatura de Constantes**

#### **Ejemplos:**
```typescript
// ✅ CORRECTO
const AI_AGENT_TYPES = {
    SUPPORT: 'AI_SUPPORT_AP_TEAM',
    SALES: 'AI_SALES_AP_TEAM',
    BILLING: 'AI_BILLING_AP_TEAM'
};

const CREW_TEAMS = {
    SUPPORT: 'SUPPORT_AP_TEAM',
    SALES: 'SALES_AP_TEAM',
    BILLING: 'BILLING_AP_TEAM'
};

// ❌ INCORRECTO
const IA_AGENT_TYPES = { // NO usar
    SUPPORT: 'IA_SUPPORT_AP_TEAM' // NO usar
};
```

---

### **10. Validaciones y Linting**

#### **ESLint Rules:**
```json
{
  "rules": {
    "no-ia-prefix": "error",
    "prefer-ai-prefix": "error"
  }
}
```

#### **Regex para validación:**
```typescript
// ✅ Validar que no se use "IA_" como prefijo
const iaPrefixRegex = /^IA_/;
if (iaPrefixRegex.test(variableName)) {
    throw new Error('No usar prefijo IA_, usar AI_ en su lugar');
}

// ✅ Validar que se use "AI_" como prefijo para agentes
const aiAgentRegex = /^AI_[A-Z_]+$/;
if (!aiAgentRegex.test(agentName)) {
    throw new Error('Agentes AI deben usar prefijo AI_');
}
```

---

## 📋 **Checklist de Validación**

### **Antes de commit:**
- [ ] No hay referencias a "IA_" en el código
- [ ] Todos los agentes usan prefijo "AI_"
- [ ] Variables y funciones siguen la nomenclatura
- [ ] Documentación usa "Agente AI" (no "Agente IA")
- [ ] Campos de base de datos usan "ai_" (no "ia_")

### **En documentación:**
- [ ] Siempre usar "Agente AI"
- [ ] Ejemplos de código usan prefijo "AI_"
- [ ] No hay referencias a "IA" en español

---

**Nota:** Estas reglas son OBLIGATORIAS para mantener consistencia y evitar errores de tipografía en todo el proyecto VTK 1.0. 
