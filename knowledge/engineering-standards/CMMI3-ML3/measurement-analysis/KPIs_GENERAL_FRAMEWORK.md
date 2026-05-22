# Framework General de KPIs para CMMI v3 + XTP + VibeThink

## Resumen Ejecutivo

Este documento establece un **framework general de KPIs** que permite a cada cliente adaptar y aterrizar las métricas según su área de negocio específica, manteniendo el cumplimiento de CMMI v3 y la metodología XTP + VibeThink.

---

## 1. KPIs de Proceso (Process Performance)

### 1.1 Calidad del Proceso
```yaml
# Métricas base - Adaptables por cliente
process_quality:
  defect_density: "Defectos por KLOC o puntos de función"
  defect_removal_efficiency: "Porcentaje de defectos removidos antes de producción"
  rework_percentage: "Porcentaje de trabajo que requiere rehacer"
  process_compliance: "Cumplimiento de procesos definidos"
  
# Adaptación por área:
  # Fintech: defect_density < 0.5/KLOC, defect_removal_efficiency > 95%
  # Healthcare: defect_density < 0.3/KLOC, defect_removal_efficiency > 98%
  # E-commerce: defect_density < 0.8/KLOC, defect_removal_efficiency > 90%
```

### 1.2 Productividad del Proceso
```yaml
process_productivity:
  velocity: "Puntos de historia por sprint"
  cycle_time: "Tiempo desde inicio hasta entrega"
  lead_time: "Tiempo total desde solicitud hasta entrega"
  throughput: "Entregas por período de tiempo"
  
# Adaptación por área:
  # Startups: velocity alta, cycle_time bajo
  # Enterprise: velocity estable, cycle_time predecible
  # Consultoría: velocity variable, cycle_time optimizado
```

### 1.3 Predictibilidad del Proceso
```yaml
process_predictability:
  schedule_variance: "Variación en cronogramas"
  effort_variance: "Variación en esfuerzo estimado"
  scope_creep: "Cambios en alcance durante el proyecto"
  estimation_accuracy: "Precisión de estimaciones"
  
# Adaptación por área:
  # Ágil: schedule_variance < 15%, scope_creep controlado
  # Waterfall: schedule_variance < 10%, scope_creep mínimo
  # Híbrido: schedule_variance < 20%, scope_creep gestionado
```

---

## 2. KPIs de Producto (Product Quality)

### 2.1 Calidad del Código
```yaml
code_quality:
  code_coverage: "Cobertura de pruebas unitarias"
  cyclomatic_complexity: "Complejidad ciclomática promedio"
  technical_debt: "Deuda técnica en puntos de historia"
  code_reviews: "Porcentaje de código revisado"
  
# Adaptación por área:
  # Crítico: code_coverage > 90%, technical_debt < 5%
  # Estándar: code_coverage > 80%, technical_debt < 10%
  # Rápido: code_coverage > 70%, technical_debt < 15%
```

### 2.2 Calidad Funcional
```yaml
functional_quality:
  requirements_coverage: "Cobertura de requerimientos"
  user_story_completion: "Historias completadas vs. planificadas"
  acceptance_criteria_met: "Criterios de aceptación cumplidos"
  feature_adoption: "Adopción de nuevas funcionalidades"
  
# Adaptación por área:
  # B2B: requirements_coverage > 95%, feature_adoption > 80%
  # B2C: requirements_coverage > 90%, feature_adoption > 70%
  # Interno: requirements_coverage > 85%, feature_adoption > 60%
```

### 2.3 Calidad de Experiencia
```yaml
experience_quality:
  performance_metrics: "Tiempo de respuesta, throughput"
  accessibility_score: "Puntuación de accesibilidad"
  usability_score: "Puntuación de usabilidad"
  user_satisfaction: "NPS, CSAT, o métricas similares"
  
# Adaptación por área:
  # Retail: performance < 2s, accessibility_score > 95%
  # Enterprise: performance < 3s, accessibility_score > 90%
  # Mobile: performance < 1s, accessibility_score > 85%
```

---

## 3. KPIs de Proyecto (Project Management)

### 3.1 Gestión de Recursos
```yaml
resource_management:
  team_utilization: "Utilización del equipo"
  skill_gap_analysis: "Análisis de brechas de habilidades"
  knowledge_transfer: "Transferencia de conocimiento"
  team_satisfaction: "Satisfacción del equipo"
  
# Adaptación por área:
  # Consultoría: team_utilization > 85%, knowledge_transfer documentado
  # Producto: team_utilization > 80%, skill_gap_analysis trimestral
  # Mantenimiento: team_utilization > 75%, knowledge_transfer continua
```

### 3.2 Gestión de Riesgos
```yaml
risk_management:
  risk_identification: "Riesgos identificados vs. materializados"
  risk_mitigation: "Efectividad de mitigaciones"
  contingency_usage: "Uso de contingencias"
  risk_escalation: "Escalación oportuna de riesgos"
  
# Adaptación por área:
  # Regulado: risk_identification > 95%, risk_mitigation documentada
  # Innovación: risk_identification > 85%, risk_escalation rápida
  # Operacional: risk_identification > 90%, contingency_usage < 20%
```

### 3.3 Gestión de Stakeholders
```yaml
stakeholder_management:
  stakeholder_satisfaction: "Satisfacción de stakeholders"
  communication_effectiveness: "Efectividad de comunicaciones"
  requirement_stability: "Estabilidad de requerimientos"
  change_approval_time: "Tiempo de aprobación de cambios"
  
# Adaptación por área:
  # Gobierno: stakeholder_satisfaction > 90%, change_approval_time < 48h
  # Startup: stakeholder_satisfaction > 80%, change_approval_time < 24h
  # Corporativo: stakeholder_satisfaction > 85%, change_approval_time < 72h
```

---

## 4. KPIs de Tecnología (Technical Excellence)

### 4.1 Arquitectura y Diseño
```yaml
architecture_quality:
  design_coherence: "Coherencia del diseño"
  scalability_metrics: "Métricas de escalabilidad"
  maintainability_index: "Índice de mantenibilidad"
  technology_debt: "Deuda tecnológica"
  
# Adaptación por área:
  # Microservicios: design_coherence > 90%, scalability_metrics documentadas
  # Monolito: design_coherence > 85%, maintainability_index > 80
  # Serverless: design_coherence > 95%, technology_debt < 5%
```

### 4.2 Seguridad y Compliance
```yaml
security_compliance:
  security_vulnerabilities: "Vulnerabilidades de seguridad"
  compliance_audit_score: "Puntuación de auditoría de cumplimiento"
  data_protection: "Protección de datos"
  access_control: "Control de acceso"
  
# Adaptación por área:
  # Fintech: security_vulnerabilities = 0, compliance_audit_score > 95%
  # Healthcare: security_vulnerabilities = 0, data_protection > 99%
  # E-commerce: security_vulnerabilities < 3, compliance_audit_score > 90%
```

### 4.3 DevOps y Operaciones
```yaml
devops_metrics:
  deployment_frequency: "Frecuencia de despliegues"
  lead_time_for_changes: "Tiempo de lead para cambios"
  mean_time_to_recovery: "Tiempo medio de recuperación"
  change_failure_rate: "Tasa de fallos en cambios"
  
# Adaptación por área:
  # CI/CD: deployment_frequency > 10/día, change_failure_rate < 5%
  # Tradicional: deployment_frequency > 1/semana, change_failure_rate < 10%
  # Híbrido: deployment_frequency > 3/día, change_failure_rate < 7%
```

---

## 5. KPIs de IA y Automatización (AI & Automation)

### 5.1 Efectividad de IA
```yaml
ai_effectiveness:
  ai_assistance_accuracy: "Precisión de asistencia de IA"
  code_generation_quality: "Calidad de código generado por IA"
  ai_learning_rate: "Tasa de aprendizaje de la IA"
  human_ai_collaboration: "Efectividad de colaboración humano-IA"
  
# Adaptación por área:
  # Desarrollo: ai_assistance_accuracy > 85%, code_generation_quality > 80%
  # Testing: ai_assistance_accuracy > 90%, ai_learning_rate documentada
  # Análisis: ai_assistance_accuracy > 95%, human_ai_collaboration > 90%
```

### 5.2 Automatización
```yaml
automation_metrics:
  automation_coverage: "Cobertura de automatización"
  manual_effort_reduction: "Reducción de esfuerzo manual"
  automation_reliability: "Confiabilidad de automatización"
  automation_maintenance: "Mantenimiento de automatización"
  
# Adaptación por área:
  # Testing: automation_coverage > 80%, automation_reliability > 95%
  # Deployment: automation_coverage > 90%, manual_effort_reduction > 70%
  # Monitoring: automation_coverage > 85%, automation_maintenance < 10%
```

---

## 6. KPIs de Negocio (Business Value)

### 6.1 Valor de Negocio
```yaml
business_value:
  feature_usage: "Uso de funcionalidades"
  business_impact: "Impacto en métricas de negocio"
  roi_metrics: "Retorno de inversión"
  customer_value: "Valor para el cliente"
  
# Adaptación por área:
  # SaaS: feature_usage > 60%, roi_metrics > 300%
  # E-commerce: business_impact medible, customer_value > 4.5/5
  # Enterprise: business_impact documentado, roi_metrics > 200%
```

### 6.2 Innovación y Mejora
```yaml
innovation_metrics:
  innovation_rate: "Tasa de innovación"
  improvement_velocity: "Velocidad de mejora"
  learning_effectiveness: "Efectividad del aprendizaje"
  adaptation_speed: "Velocidad de adaptación"
  
# Adaptación por área:
  # Startup: innovation_rate > 20%, adaptation_speed alta
  # Corporativo: innovation_rate > 10%, improvement_velocity estable
  # Consultoría: innovation_rate > 15%, learning_effectiveness documentada
```

---

## 7. Framework de Adaptación por Cliente

### 7.1 Matriz de Adaptación
```yaml
client_adaptation_matrix:
  fintech:
    priority_kpis: ["security_compliance", "process_predictability", "code_quality"]
    thresholds: "Más estrictos en seguridad y cumplimiento"
    
  healthcare:
    priority_kpis: ["security_compliance", "functional_quality", "process_quality"]
    thresholds: "Máxima precisión y seguridad"
    
  ecommerce:
    priority_kpis: ["experience_quality", "performance_metrics", "business_value"]
    thresholds: "Enfoque en experiencia de usuario y rendimiento"
    
  enterprise:
    priority_kpis: ["process_predictability", "stakeholder_management", "resource_management"]
    thresholds: "Estabilidad y predictibilidad"
    
  startup:
    priority_kpis: ["innovation_metrics", "adaptation_speed", "business_value"]
    thresholds: "Velocidad y adaptación"
```

### 7.2 Proceso de Aterrizaje
```yaml
customization_process:
  1. assessment: "Evaluación del contexto del cliente"
  2. priority_selection: "Selección de KPIs prioritarios"
  3. threshold_adjustment: "Ajuste de umbrales y metas"
  4. baseline_establishment: "Establecimiento de línea base"
  5. monitoring_setup: "Configuración de monitoreo"
  6. review_cycle: "Ciclo de revisión y ajuste"
```

---

## 8. Implementación y Monitoreo

### 8.1 Dashboard de KPIs
```yaml
kpi_dashboard:
  real_time_monitoring: "Monitoreo en tiempo real"
  trend_analysis: "Análisis de tendencias"
  alert_system: "Sistema de alertas"
  reporting_automation: "Automatización de reportes"
```

### 8.2 Ciclo de Mejora
```yaml
improvement_cycle:
  measure: "Medir KPIs actuales"
  analyze: "Analizar tendencias y patrones"
  improve: "Implementar mejoras"
  control: "Controlar resultados"
  repeat: "Repetir ciclo"
```

---

## 9. Templates de Implementación

### 9.1 Template de KPIs por Cliente
```markdown
# KPIs Personalizados - [Nombre del Cliente]

## Contexto del Cliente
- **Industria**: [Fintech/Healthcare/E-commerce/etc.]
- **Tamaño**: [Startup/Mediana/Grande]
- **Modelo de Negocio**: [B2B/B2C/B2B2C]
- **Regulaciones**: [Específicas del sector]

## KPIs Prioritarios
1. **[KPI Principal]**: [Descripción y meta]
2. **[KPI Secundario]**: [Descripción y meta]
3. **[KPI de Control]**: [Descripción y meta]

## Umbrales y Metas
- **Verde**: [Valor objetivo]
- **Amarillo**: [Valor de advertencia]
- **Rojo**: [Valor crítico]

## Frecuencia de Revisión
- **Diaria**: [KPIs críticos]
- **Semanal**: [KPIs operativos]
- **Mensual**: [KPIs estratégicos]
```

### 9.2 Template de Reporte de KPIs
```markdown
# Reporte de KPIs - [Período]

## Resumen Ejecutivo
- **Estado General**: [Verde/Amarillo/Rojo]
- **Tendencias Principales**: [Descripción]
- **Acciones Requeridas**: [Lista de acciones]

## KPIs por Categoría
### Proceso
- [KPI]: [Valor actual] vs [Meta] - [Estado]

### Producto
- [KPI]: [Valor actual] vs [Meta] - [Estado]

### Proyecto
- [KPI]: [Valor actual] vs [Meta] - [Estado]

## Recomendaciones
1. [Recomendación específica]
2. [Recomendación específica]
3. [Recomendación específica]
```

---

## 10. Conclusión

Este framework general de KPIs proporciona una **base sólida y flexible** que permite:

1. **Adaptación específica** por cliente y área de negocio
2. **Cumplimiento de CMMI v3** con métricas relevantes
3. **Trazabilidad total** en el desarrollo con IA
4. **Mejora continua** basada en datos objetivos
5. **Escalabilidad** para diferentes tipos de proyectos

**Cada cliente puede aterrizar estos KPIs según sus necesidades específicas, manteniendo la robustez y trazabilidad del sistema.**

---

*Documento generado como parte de la metodología XTP + CMMI v3 + VibeThink*
*Versión: 1.0 | Fecha: 2025-01-22 | Autor: Marcelo Escallón* 