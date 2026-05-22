#!/bin/bash

# Script para documentar nuevas decisiones
# Uso: ./scripts/document-decision.sh "Título de la Decisión"

if [ -z "$1" ]; then
    echo "❌ Error: Debes proporcionar un título para la decisión"
    echo "Uso: ./scripts/document-decision.sh \"Título de la Decisión\""
    exit 1
fi

TITLE=$1
DATE=$(date +%Y-%m-%d)
TIMESTAMP=$(date +%Y%m%d)
FILENAME="docs/decisions/${TIMESTAMP}-${TITLE// /-}.md"

# Crear directorio si no existe
mkdir -p docs/decisions

# Crear archivo de decisión
cat > "$FILENAME" << EOF
# Decisión: $TITLE

## Fecha
$DATE

## Decisor
Marcelo Escallón

## Contexto
[Describir el problema o necesidad que llevó a esta decisión]

## Decisión Tomada
[Descripción clara y específica de la decisión tomada]

## Justificación
[Explicar por qué se tomó esta decisión específica]

## Alternativas Consideradas
- [Alternativa 1]: [Por qué se rechazó]
- [Alternativa 2]: [Por qué se rechazó]
- [Alternativa 3]: [Por qué se rechazó]

## Impacto
### Técnico
- [Impacto en la arquitectura]
- [Impacto en el desarrollo]

### Negocio
- [Impacto en costos]
- [Impacto en timeline]
- [Impacto en funcionalidad]

### Operacional
- [Impacto en mantenimiento]
- [Impacto en escalabilidad]

## Estado
- [ ] Pendiente
- [ ] En Progreso
- [ ] Implementado
- [ ] Revisión Requerida

## Próximos Pasos
1. [Acción específica]
2. [Acción específica]
3. [Acción específica]

## Revisión
- [ ] Revisar en 30 días
- [ ] Revisar en 90 días
- [ ] Revisar en 180 días

## Métricas de Éxito
- [Métrica 1]: [Valor objetivo]
- [Métrica 2]: [Valor objetivo]
- [Métrica 3]: [Valor objetivo]

## Riesgos y Mitigación
### Riesgos Identificados
- [Riesgo 1]: [Probabilidad] - [Impacto]
- [Riesgo 2]: [Probabilidad] - [Impacto]

### Estrategias de Mitigación
- [Estrategia 1]: [Para riesgo 1]
- [Estrategia 2]: [Para riesgo 2]

## Referencias
- [Enlace a documentación relevante]
- [Enlace a recursos externos]
- [Enlace a decisiones relacionadas]

---
**Documentado por:** Marcelo Escallón
**Fecha de documentación:** $DATE
EOF

echo "📝 Decisión documentada en: $FILENAME"
echo ""
echo "🔗 Acciones requeridas:"
echo "1. Actualizar el registro principal: docs/CRITICAL_DECISIONS_REGISTRY.md"
echo "2. Agregar recordatorios en: docs/DECISION_REMINDERS.md"
echo "3. Revisar y completar la información en el archivo creado"
echo ""
echo "💡 Comando para abrir el archivo:"
echo "code $FILENAME" 