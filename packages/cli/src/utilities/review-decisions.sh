#!/bin/bash

# Script para revisar decisiones pendientes y próximas revisiones
# Uso: ./scripts/review-decisions.sh

echo "🔍 Revisando Decisiones Pendientes..."
echo "======================================"
echo ""

# Buscar decisiones pendientes
echo "📋 Decisiones Pendientes:"
echo "------------------------"
grep -r "Pendiente\|Pendiente de Implementación" docs/ | grep -E "(ADR|DECISION)" | head -10

echo ""
echo "🔄 Decisiones En Progreso:"
echo "-------------------------"
grep -r "En Progreso" docs/ | grep -E "(ADR|DECISION)" | head -10

echo ""
echo "📅 Próximas Revisiones:"
echo "----------------------"
grep -r "Próxima Revisión\|Revisión:" docs/ | grep -E "(ADR|DECISION)" | head -5

echo ""
echo "✅ Decisiones Implementadas Recientemente:"
echo "----------------------------------------"
grep -r "Implementado" docs/ | grep -E "(ADR|DECISION)" | tail -5

echo ""
echo "🚨 Alertas Críticas:"
echo "------------------"
grep -r "Críticas\|Alta" docs/ | grep -E "(Prioridad|Estado)" | head -3

echo ""
echo "📊 Resumen:"
echo "----------"
echo "Total de ADRs encontrados: $(grep -r "ADR-" docs/ | wc -l)"
echo "Pendientes: $(grep -r "Pendiente" docs/ | grep -E "(ADR|DECISION)" | wc -l)"
echo "En Progreso: $(grep -r "En Progreso" docs/ | grep -E "(ADR|DECISION)" | wc -l)"
echo "Implementadas: $(grep -r "Implementado" docs/ | grep -E "(ADR|DECISION)" | wc -l)"

echo ""
echo "💡 Próximas Acciones Sugeridas:"
echo "-----------------------------"
echo "1. Revisar decisiones pendientes de alta prioridad"
echo "2. Actualizar estado de decisiones en progreso"
echo "3. Programar revisiones vencidas"
echo "4. Documentar nuevas decisiones si es necesario" 