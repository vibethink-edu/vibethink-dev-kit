# 🕵️ Estándar de Code Review Costo-Eficiente

**Propósito:** Optimizar el uso de herramientas de IA SaaS (CodeRabbit, Jules, SonarQube) para evitar quemar créditos gratuitos en commits irrelevantes.
**Principio:** "Review on Demand" (No Review on Push).

---

## 1. El Problema "Token Burn"
Si configuramos estas herramientas en `on: [push]`, cada commit trivial (`fix typo`, `update readme`) gatilla una revisión costosa.
*   **Resultado:** Llegamos al límite del plan Free en 3 días.

## 2. La Solución: "Manual Dispatch & Label Trigger"
Configuramos los workflows de GitHub Actions para que **SOLO** corran cuando:
1.  Aplicamos una etiqueta específica (`run-review`).
2.  Escribimos un comando en el PR (`/review`).
3.  Lo lanzamos manualmente (Workflow Dispatch).

---

## 3. Variables de Entorno (.env)
Todo proyecto debe declarar qué herramientas tiene disponibles y en qué modo operan.

```ini
# ==============================================
# 5. QUALITY & COMPLIANCE
# ==============================================
STACK_REVIEW_TOOLS=coderabbit,jules,sonarqube
STACK_REVIEW_MODE=manual-dispatch    # Opciones: manual-dispatch, pr-only, on-push
```

---

## 4. Configuración de GitHub Actions (Template)

### Para CodeRabbit (`.github/workflows/coderabbit.yml`):
*Nota: CodeRabbit suele correr por defecto en cada PR. Debes ir a su Dashboard y cambiar "Trigger Mode" a "Manual" o usar filtros de archivos.*

### Para Herramientas Custom (ej. SonarQube / Custom AI):
```yaml
name: "AI Code Review"
on:
  workflow_dispatch:          # Opción Manual desde la UI
  pull_request:
    types: [labeled]          # Solo si etiquetamos

jobs:
  review:
    if: github.event.label.name == 'run-review'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Expensive AI Review
        run: ./scripts/run-ai-review.sh
```

---

## 5. El Workflow del Desarrollador
1.  **Codea:** Hace commits y pushes normales.
2.  **Abre PR:** "Feature: Voice Agent V2".
3.  **Decide:** "¿Vale la pena revisar esto?"
    *   *Si es un fix menor:* No hace nada. Ahorra créditos.
    *   *Si es lógica compleja:* Agrega etiqueta `run-review` en GitHub.
4.  **Bot Actúa:** El bot despierta, revisa y comenta.
