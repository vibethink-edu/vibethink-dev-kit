# Templates de KPIs por Cliente - CMMI v3 + XTP + VibeThink

## Resumen Ejecutivo

Este documento proporciona **templates específicos** para que cada cliente pueda aterrizar y personalizar los KPIs según su área de negocio, industria y contexto específico.

---

## Template 1: Fintech & Regulados

### Contexto del Cliente
```yaml
industry: "Fintech / Regulado"
size: "Mediana a Grande"
business_model: "B2B / B2B2C"
regulations: ["PCI DSS", "SOX", "GDPR", "Regulaciones locales"]
risk_tolerance: "Muy Bajo"
```

### KPIs Prioritarios
```yaml
critical_kpis:
  security_compliance:
    - compliance_audit_score: "> 98%"
    - security_vulnerabilities: "= 0"
    - data_protection: "> 99.9%"
  
  process_quality:
    - defect_density: "< 0.3/KLOC"
    - defect_removal_efficiency: "> 98%"
    - process_compliance: "> 95%"
  
  code_quality:
    - code_coverage: "> 90%"
    - technical_debt: "< 3%"
    - code_reviews: "100%"
```

### Umbrales y Metas
```yaml
thresholds:
  green:
    - security_score: "> 95%"
    - quality_score: "> 90%"
    - compliance_score: "> 98%"
  
  yellow:
    - security_score: "85-95%"
    - quality_score: "80-90%"
    - compliance_score: "90-98%"
  
  red:
    - security_score: "< 85%"
    - quality_score: "< 80%"
    - compliance_score: "< 90%"
```

### Frecuencia de Revisión
```yaml
review_frequency:
  daily: ["security_vulnerabilities", "system_uptime"]
  weekly: ["compliance_audit_score", "defect_density"]
  monthly: ["process_compliance", "code_quality"]
  quarterly: ["risk_assessment", "regulatory_updates"]
```

---

## Template 2: Healthcare & Life Sciences

### Contexto del Cliente
```yaml
industry: "Healthcare / Life Sciences"
size: "Mediana a Grande"
business_model: "B2B / B2C"
regulations: ["HIPAA", "FDA", "ISO 13485", "GDPR"]
risk_tolerance: "Muy Bajo"
```

### KPIs Prioritarios
```yaml
critical_kpis:
  data_protection:
    - data_breach_incidents: "= 0"
    - encryption_coverage: "100%"
    - access_control_effectiveness: "> 99%"
  
  functional_quality:
    - requirements_coverage: "> 98%"
    - user_story_completion: "> 95%"
    - acceptance_criteria_met: "100%"
  
  process_predictability:
    - schedule_variance: "< 5%"
    - effort_variance: "< 10%"
    - estimation_accuracy: "> 95%"
```

### Umbrales y Metas
```yaml
thresholds:
  green:
    - data_security: "100%"
    - functional_quality: "> 95%"
    - predictability: "> 90%"
  
  yellow:
    - data_security: "95-99%"
    - functional_quality: "90-95%"
    - predictability: "85-90%"
  
  red:
    - data_security: "< 95%"
    - functional_quality: "< 90%"
    - predictability: "< 85%"
```

---

## Template 3: E-commerce & Retail

### Contexto del Cliente
```yaml
industry: "E-commerce / Retail"
size: "Startup a Grande"
business_model: "B2C / B2B2C"
regulations: ["GDPR", "PCI DSS", "Regulaciones locales"]
risk_tolerance: "Medio"
```

### KPIs Prioritarios
```yaml
critical_kpis:
  experience_quality:
    - performance_metrics: "< 2s load time"
    - accessibility_score: "> 95%"
    - user_satisfaction: "> 4.5/5"
  
  business_value:
    - feature_usage: "> 70%"
    - conversion_rate: "> 3%"
    - customer_retention: "> 80%"
  
  operational_excellence:
    - system_uptime: "> 99.9%"
    - deployment_frequency: "> 5/day"
    - change_failure_rate: "< 5%"
```

### Umbrales y Metas
```yaml
thresholds:
  green:
    - performance: "< 2s"
    - business_impact: "> 10% improvement"
    - operational: "> 99%"
  
  yellow:
    - performance: "2-3s"
    - business_impact: "5-10% improvement"
    - operational: "95-99%"
  
  red:
    - performance: "> 3s"
    - business_impact: "< 5% improvement"
    - operational: "< 95%"
```

---

## Template 4: Enterprise & Corporativo

### Contexto del Cliente
```yaml
industry: "Enterprise / Corporativo"
size: "Grande"
business_model: "B2B / Interno"
regulations: ["SOX", "GDPR", "Regulaciones internas"]
risk_tolerance: "Bajo"
```

### KPIs Prioritarios
```yaml
critical_kpis:
  process_predictability:
    - schedule_variance: "< 10%"
    - effort_variance: "< 15%"
    - scope_creep: "< 5%"
  
  stakeholder_management:
    - stakeholder_satisfaction: "> 85%"
    - communication_effectiveness: "> 90%"
    - change_approval_time: "< 72h"
  
  resource_management:
    - team_utilization: "> 80%"
    - knowledge_transfer: "Documentado"
    - skill_gap_analysis: "Trimestral"
```

### Umbrales y Metas
```yaml
thresholds:
  green:
    - predictability: "> 90%"
    - stakeholder_satisfaction: "> 85%"
    - resource_efficiency: "> 80%"
  
  yellow:
    - predictability: "80-90%"
    - stakeholder_satisfaction: "75-85%"
    - resource_efficiency: "70-80%"
  
  red:
    - predictability: "< 80%"
    - stakeholder_satisfaction: "< 75%"
    - resource_efficiency: "< 70%"
```

---

## Template 5: Startup & Innovación

### Contexto del Cliente
```yaml
industry: "Startup / Innovación"
size: "Pequeña a Mediana"
business_model: "B2B / B2C / B2B2C"
regulations: ["GDPR", "Regulaciones básicas"]
risk_tolerance: "Alto"
```

### KPIs Prioritarios
```yaml
critical_kpis:
  innovation_metrics:
    - innovation_rate: "> 20%"
    - adaptation_speed: "Rápida"
    - learning_effectiveness: "Documentada"
  
  business_value:
    - feature_usage: "> 60%"
    - business_impact: "Medible"
    - customer_value: "> 4.0/5"
  
  development_velocity:
    - velocity: "Alta"
    - cycle_time: "< 1 semana"
    - deployment_frequency: "> 10/day"
```

### Umbrales y Metas
```yaml
thresholds:
  green:
    - innovation: "> 20%"
    - business_impact: "Positivo"
    - velocity: "Alta"
  
  yellow:
    - innovation: "10-20%"
    - business_impact: "Neutral"
    - velocity: "Media"
  
  red:
    - innovation: "< 10%"
    - business_impact: "Negativo"
    - velocity: "Baja"
```

---

## Template 6: Consultoría & Servicios

### Contexto del Cliente
```yaml
industry: "Consultoría / Servicios"
size: "Mediana a Grande"
business_model: "B2B / Servicios"
regulations: ["GDPR", "Regulaciones del sector"]
risk_tolerance: "Medio"
```

### KPIs Prioritarios
```yaml
critical_kpis:
  resource_management:
    - team_utilization: "> 85%"
    - knowledge_transfer: "Documentado"
    - skill_gap_analysis: "Trimestral"
  
  stakeholder_management:
    - stakeholder_satisfaction: "> 90%"
    - communication_effectiveness: "> 95%"
    - requirement_stability: "> 80%"
  
  process_quality:
    - defect_removal_efficiency: "> 95%"
    - process_compliance: "> 90%"
    - rework_percentage: "< 10%"
```

### Umbrales y Metas
```yaml
thresholds:
  green:
    - resource_efficiency: "> 85%"
    - stakeholder_satisfaction: "> 90%"
    - process_quality: "> 90%"
  
  yellow:
    - resource_efficiency: "75-85%"
    - stakeholder_satisfaction: "80-90%"
    - process_quality: "80-90%"
  
  red:
    - resource_efficiency: "< 75%"
    - stakeholder_satisfaction: "< 80%"
    - process_quality: "< 80%"
```

---

## Template 7: Gobierno & Sector Público

### Contexto del Cliente
```yaml
industry: "Gobierno / Sector Público"
size: "Grande"
business_model: "B2G / Servicios Públicos"
regulations: ["Regulaciones gubernamentales", "Transparencia", "Accesibilidad"]
risk_tolerance: "Muy Bajo"
```

### KPIs Prioritarios
```yaml
critical_kpis:
  compliance_audit:
    - compliance_audit_score: "> 95%"
    - transparency_metrics: "100%"
    - accessibility_score: "> 95%"
  
  stakeholder_management:
    - stakeholder_satisfaction: "> 90%"
    - change_approval_time: "< 48h"
    - communication_effectiveness: "> 95%"
  
  process_predictability:
    - schedule_variance: "< 10%"
    - effort_variance: "< 15%"
    - estimation_accuracy: "> 90%"
```

### Umbrales y Metas
```yaml
thresholds:
  green:
    - compliance: "> 95%"
    - stakeholder_satisfaction: "> 90%"
    - predictability: "> 90%"
  
  yellow:
    - compliance: "85-95%"
    - stakeholder_satisfaction: "80-90%"
    - predictability: "80-90%"
  
  red:
    - compliance: "< 85%"
    - stakeholder_satisfaction: "< 80%"
    - predictability: "< 80%"
```

---

## Template 8: Mobile & Apps

### Contexto del Cliente
```yaml
industry: "Mobile / Apps"
size: "Startup a Mediana"
business_model: "B2C / B2B2C"
regulations: ["GDPR", "App Store Guidelines", "Google Play Policies"]
risk_tolerance: "Medio"
```

### KPIs Prioritarios
```yaml
critical_kpis:
  experience_quality:
    - performance_metrics: "< 1s load time"
    - accessibility_score: "> 85%"
    - user_satisfaction: "> 4.0/5"
  
  app_store_metrics:
    - app_store_rating: "> 4.0"
    - crash_rate: "< 1%"
    - user_retention: "> 70%"
  
  development_velocity:
    - deployment_frequency: "> 3/day"
    - cycle_time: "< 3 días"
    - change_failure_rate: "< 7%"
```

### Umbrales y Metas
```yaml
thresholds:
  green:
    - performance: "< 1s"
    - app_store_rating: "> 4.0"
    - velocity: "Alta"
  
  yellow:
    - performance: "1-2s"
    - app_store_rating: "3.5-4.0"
    - velocity: "Media"
  
  red:
    - performance: "> 2s"
    - app_store_rating: "< 3.5"
    - velocity: "Baja"
```

---

## Proceso de Implementación

### Paso 1: Selección de Template
```yaml
selection_criteria:
  - industry_match: "Coincidencia con industria"
  - size_match: "Coincidencia con tamaño"
  - regulation_match: "Coincidencia con regulaciones"
  - risk_tolerance: "Tolerancia al riesgo"
```

### Paso 2: Personalización
```yaml
customization_steps:
  1. review_template: "Revisar template base"
  2. adjust_thresholds: "Ajustar umbrales"
  3. add_specific_kpis: "Agregar KPIs específicos"
  4. define_frequency: "Definir frecuencias"
  5. setup_monitoring: "Configurar monitoreo"
```

### Paso 3: Validación
```yaml
validation_checklist:
  - cmmi_compliance: "Cumple CMMI v3"
  - business_alignment: "Alineado con negocio"
  - measurability: "Medible y accionable"
  - sustainability: "Sostenible a largo plazo"
```

---

## Conclusión

Estos templates proporcionan una **base sólida y flexible** para que cada cliente pueda:

1. **Identificar rápidamente** su contexto y necesidades
2. **Adaptar los KPIs** según su industria y regulaciones
3. **Establecer umbrales realistas** para su situación
4. **Implementar monitoreo efectivo** desde el inicio
5. **Mantener cumplimiento CMMI** con métricas relevantes

**Cada cliente puede usar estos templates como punto de partida y personalizarlos según sus necesidades específicas.**

---

*Documento generado como parte de la metodología XTP + CMMI v3 + VibeThink*
*Versión: 1.0 | Fecha: 2025-01-22 | Autor: Marcelo Escallón* 