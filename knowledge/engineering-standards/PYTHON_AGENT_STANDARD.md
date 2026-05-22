# 🐍 Python Agent Standard (VibeThink)

**Objetivo:** Estandarizar el desarrollo de Agentes de IA en Python, priorizando velocidad (`uv`), tipado fuerte (`Pydantic`) y orquestación robusta (`Agno`).

---

## 1. El Stack del Agente (The Agent Stack)

| Componente | Selección Oficial | ¿Por qué? |
| :--- | :--- | :--- |
| **Gestor de Paquetes** | **`uv`** | Velocidad extrema. Reemplaza `pip`, `poetry`, `pyenv` en una sola herramienta. |
| **Framework Agéntico** | **Agno** | (Antes Phidata). Ligero, modular, excelente manejo de memoria y tools. |
| **API Server** | **FastAPI** | Asíncrono nativo, autogenera OpenAPI (Swagger). |
| **Validación** | **Pydantic v2** | Rendimiento (Core en Rust). Indispensable para Structured Outputs de LLMs. |
| **Linter/Formatter** | **Ruff** | (Del creador de `uv`). Reemplaza Flake8, Black, Isort. Velocidad Rust. |

---

## 2. Estructura del Proyecto (Clean Agent)

```
my-agent/
├── .venv/               # Gestionado por uv
├── src/
│   ├── agents/          # Definición de Agentes (Agno)
│   ├── tools/           # Herramientas (Funciones Pydantic)
│   ├── knowledge/       # Bases de conocimiento (Vectores)
│   └── api/             # Endpoints FastAPI (si aplica)
├── pyproject.toml       # Configuración única (deps + tools)
├── .env.example
└── .python-version      # Definido por uv
```

---

## 3. Comandos Esenciales (`uv`)

Olvídate de `pip install`. Usa esto:

```bash
# Inicializar proyecto
uv init

# Agregar dependencias
uv add agno pydantic fastapi uvicorn

# Correr script (sin activar entorno manualmente!)
uv run main.py

# Bloquear versiones
uv lock
```

---

## 4. Snippet: Agente Básico (Agno + Pydantic)

```python
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from pydantic import BaseModel, Field

# 1. Definir Estructura de Salida
class AnalysisResult(BaseModel):
    summary: str = Field(..., description="Resumen ejecutivo")
    risk_score: int = Field(..., ge=0, le=100)

# 2. Configurar Agente
analyst = Agent(
    model=OpenAIChat(id="gpt-4o"),
    description="Eres un analista de riesgo financiero.",
    response_model=AnalysisResult,  # Structured Output nativo
    markdown=True
)

# 3. Ejecutar
def analyze_market(data: str):
    response = analyst.run(f"Analiza esto: {data}")
    return response.content
```

---

## 5. Reglas de Oro
1.  **Tipos Siempre:** Toda función debe tener Type Hints (`def fn(x: int) -> str:`).
2.  **No `print`, sí `logging`:** Usa logs estructurados, no prints perdidos.
3.  **Secretos:** Nunca hardcoded. Siempre `os.getenv` o `pydantic_settings`.
