# 📚 Guía de Terminología - VThink 1.0

## 🎯 **Distinción OBLIGATORIA**

### **VThink 1.0 = METODOLOGÍA** ✅
- **Qué es:** Framework de desarrollo y procesos
- **Propósito:** "Cómo construimos"
- **Alcance:** Estándares, procesos, calidad
- **Compliance:** CMMI-ML3

### **VibeThink Orchestrator = PRODUCTO** ✅
- **Qué es:** Plataforma SaaS multi-tenant
- **Propósito:** "Qué vendemos"
- **Alcance:** Aplicación comercial
- **Mercado:** SaaS enterprise

---

## 📋 **Reglas de Uso OBLIGATORIAS**

### **✅ CORRECTO:**
```markdown
- "Aplicamos metodología VThink 1.0"
- "Desarrollamos VibeThink Orchestrator"
- "Equipo de VibeThink Orchestrator"
- "Procesos VThink 1.0"
- "Producto VibeThink Orchestrator"
```

### **❌ INCORRECTO:**
```markdown
- "Equipo VThink 1.0" ❌
- "Producto VThink 1.0" ❌
- "VThink como plataforma" ❌
- "VThink SaaS" ❌
```

---

## 🔧 **Validación Automática**

### **Script de Validación:**
```bash
# Validar terminología en documentación
npm run validate:terminology

# Verificar uso correcto
npm run check:naming-conventions
```

### **Reglas de Linting:**
```json
{
  "rules": {
    "vtk-naming": {
      "error": "VThink 1.0 es metodología, VibeThink Orchestrator es producto"
    }
  }
}
```

---

## 📝 **Plantillas de Documentación**

### **Para Documentación Técnica:**
```markdown
# [Título] - VibeThink Orchestrator

## Contexto
Este documento describe [funcionalidad] en **VibeThink Orchestrator** 
siguiendo la metodología **VThink 1.0**.

## Equipo
- **Producto:** VibeThink Orchestrator
- **Metodología:** VThink 1.0
- **Compliance:** CMMI-ML3
```

### **Para Commits:**
```bash
# ✅ CORRECTO
git commit -m "feat(vibe-think): add user management
- Implements VThink 1.0 methodology
- VibeThink Orchestrator feature"

# ❌ INCORRECTO
git commit -m "feat(vthink): add user management"
```

---

## 🎯 **Checklist de Validación**

### **Antes de Publicar:**
- [ ] Verificar que "VThink 1.0" = metodología
- [ ] Verificar que "VibeThink Orchestrator" = producto
- [ ] Validar terminología en commits
- [ ] Revisar documentación técnica
- [ ] Confirmar con equipo

### **En Reuniones:**
- [ ] Usar "Equipo VibeThink Orchestrator"
- [ ] Referir a "metodología VThink 1.0"
- [ ] Distinguir producto vs metodología
- [ ] Documentar decisiones claramente

---

## 🚨 **Alertas Automáticas**

### **Git Hooks:**
```bash
# pre-commit hook
if grep -r "Equipo VThink" .; then
  echo "❌ ERROR: VThink 1.0 es metodología, no equipo"
  exit 1
fi
```

### **CI/CD Validation:**
```yaml
# .github/workflows/terminology-check.yml
- name: Validate Terminology
  run: |
    npm run validate:terminology
    npm run check:naming-conventions
```

---

## 📚 **Recursos de Referencia**

### **Documentación Principal:**
- `docs/methodologies/VThink-1.0/` - Metodología
- `docs/projects/VibeThink-Orchestrator/` - Producto

### **Validación Automática:**
- `scripts/validate-terminology.js`
- `scripts/check-naming-conventions.js`

---

**Esta guía es OBLIGATORIA y debe seguirse en todo el proyecto.** 