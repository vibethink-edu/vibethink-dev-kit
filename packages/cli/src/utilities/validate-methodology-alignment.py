#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Validación Rápida de Cumplimiento Metodológico (XTP, CMMI) y Colaboración Humano-IA (AIPAIR)
"""

import os
import json
from pathlib import Path
from datetime import datetime

class QuickValidation:
    def __init__(self, project_root: str = "."):
        self.project_root = Path(project_root)
        self.results = {}
        self.timestamp = datetime.now().isoformat()

    def validate_xtp(self):
        score = 0
        max_score = 9
        details = []
        xtp_logs = self.project_root / ".ide+ai-xtp" / "logs"
        if xtp_logs.exists():
            score += 3
            details.append("✅ Logs de acciones XTP encontrados")
        else:
            details.append("❌ Logs de acciones XTP no encontrados")
        cmmi_evidence = self.project_root / "cmmi-evidence"
        if cmmi_evidence.exists():
            score += 3
            details.append("✅ Estructura de evidencias CMMI encontrada")
        else:
            details.append("❌ Estructura de evidencias CMMI no encontrada")
        project_docs = self.project_root / "docs" / "project"
        if project_docs.exists():
            score += 3
            details.append("✅ Documentación de proyecto encontrada")
        else:
            details.append("❌ Documentación de proyecto no encontrada")
        return score, max_score, details

    def validate_cmmi(self):
        score = 0
        max_score = 9
        details = []
        cmmi_evidence = self.project_root / "cmmi-evidence"
        if cmmi_evidence.exists():
            practice_areas = ["01-data-management", "03-workforce-empowerment", "04-technical-solution"]
            found_areas = 0
            for area in practice_areas:
                if (cmmi_evidence / area).exists():
                    found_areas += 1
            if found_areas >= 2:
                score += 3
                details.append(f"✅ {found_areas}/3 áreas de práctica CMMI encontradas")
            else:
                details.append(f"⚠️ Solo {found_areas}/3 áreas de práctica CMMI encontradas")
        else:
            details.append("❌ Estructura CMMI no encontrada")
        xtp_config = self.project_root / ".ide+ai-xtp" / "config"
        if xtp_config.exists():
            score += 3
            details.append("✅ Configuración XTP encontrada")
        else:
            details.append("❌ Configuración XTP no encontrada")
        methodology_docs = self.project_root / "docs" / "methodology"
        if methodology_docs.exists():
            score += 3
            details.append("✅ Documentación metodológica encontrada")
        else:
            details.append("❌ Documentación metodológica no encontrada")
        return score, max_score, details

    def indicators_aipair(self):
        # Indicadores de colaboración humano-IA (no afectan score)
        indicators = {}
        # Ejemplo: eficiencia de handoff
        handoff_metric = self.project_root / "cmmi-evidence" / "03-workforce-empowerment" / "metrics" / "example-metrics-2025-06-26.json"
        if handoff_metric.exists():
            try:
                with open(handoff_metric, encoding="utf-8") as f:
                    data = json.load(f)
                indicators["handoff_efficiency_min"] = data.get("valor", None)
                indicators["handoff_efficiency_desc"] = data.get("descripcion", "")
            except Exception:
                indicators["handoff_efficiency_min"] = None
        else:
            indicators["handoff_efficiency_min"] = None
        # Ejemplo: balance humano-IA (dummy)
        indicators["balance_humano_ia"] = "60/40"  # Puedes automatizarlo si tienes métricas reales
        # Ejemplo: productividad mejorada (dummy)
        indicators["productividad_mejorada"] = "55%"
        return indicators

    def run_validation(self):
        print("\n🔍 Validación de Cumplimiento Metodológico (XTP, CMMI) y Colaboración Humano-IA (AIPAIR)")
        print(f"📅 Timestamp: {self.timestamp}")
        print(f"📁 Proyecto: {self.project_root.absolute()}")
        print()
        xtp_score, xtp_max, xtp_details = self.validate_xtp()
        cmmi_score, cmmi_max, cmmi_details = self.validate_cmmi()
        # Score solo de XTP y CMMI
        total_score = xtp_score + cmmi_score
        total_max = xtp_max + cmmi_max
        total_percentage = (total_score/total_max)*100
        # Indicadores de colaboración
        aipair_indicators = self.indicators_aipair()
        # Consola
        print("📋 Cumplimiento Metodológico:")
        print(f"  XTP: {xtp_score}/{xtp_max}")
        for d in xtp_details:
            print(f"    - {d}")
        print(f"  CMMI: {cmmi_score}/{cmmi_max}")
        for d in cmmi_details:
            print(f"    - {d}")
        print(f"  SCORE TOTAL: {total_score}/{total_max} ({total_percentage:.1f}%)")
        if total_percentage >= 85:
            nivel = "🟢 EXCELENTE"
        elif total_percentage >= 70:
            nivel = "🟡 BUENO"
        elif total_percentage >= 50:
            nivel = "🟠 NECESITA MEJORA"
        else:
            nivel = "🔴 CRÍTICO"
        print(f"  NIVEL: {nivel}")
        print("\n🤖 Indicadores de Colaboración Humano-IA (AIPAIR):")
        for k, v in aipair_indicators.items():
            print(f"  {k}: {v}")
        # Guardar resultados
        self.results = {
            "cumplimiento_metodologico": {
                "xtp": f"{xtp_score}/{xtp_max}",
                "cmmi": f"{cmmi_score}/{cmmi_max}",
                "score_total": f"{total_score}/{total_max}",
                "porcentaje": total_percentage,
                "nivel": nivel
            },
            "indicadores_colaboracion_aipair": aipair_indicators,
            "timestamp": self.timestamp
        }
        return total_percentage, nivel

    def save_report(self, output_file: str = "validation-report.json"):
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)
        print(f"\n💾 Reporte guardado en: {output_file}")

def main():
    import sys
    project_root = sys.argv[1] if len(sys.argv) > 1 else "."
    validator = QuickValidation(project_root)
    total_percentage, nivel = validator.run_validation()
    validator.save_report()
    # Exit code solo depende de score metodológico
    if total_percentage >= 70:
        exit(0)
    else:
        exit(1)

if __name__ == "__main__":
    main() 