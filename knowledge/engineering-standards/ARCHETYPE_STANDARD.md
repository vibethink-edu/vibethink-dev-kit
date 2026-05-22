# 🧬 VibeThink Arquetipo Estándar (DNA)

**Estado:** ✅ Aprobado / Estándar Oficial
**Objetivo:** Inyectar inteligencia y estandarización en cada repositorio para que las herramientas (y las IAs) puean operarlos sin "adivinar".

---

## 1. Stack Identity (Identidad Tecnológica)
Actualmente, un script tiene que *buscar archivos* (`package.json`, `vite.config.ts`) para saber qué es el proyecto.
**Propuesta:** Declararlo explícitamente en `.env` o `project.json`.

```ini
# .env
STACK_ID=next-payload          # ID único del arquetipo
STACK_FRONTEND=nextjs-app      # Informa a v-doctor que busque .next/
STACK_BACKEND=payload-cms      # Informa a v-doctor que busque payload.config
STACK_DB=postgres              # Informa que se necesita docker-compose up db

# Ejemplo Arquetipo Agente
STACK_ID=n8n-agent-backend     # Backend Logic-as-a-Flow
STACK_FRONTEND=none
STACK_BACKEND=n8n-workflow
STACK_DB=postgres-alpine

# Ejemplo Stack AI & Automation
STACK_AI_PROVIDER=openai,anthropic  # Proveedores principales
STACK_AI_MODEL=gpt-4o,claude-3.5-sonnet # Modelos en uso
STACK_AUTOMATION=n8n                # n8n, make, zapier
STACK_VECTOR_DB=none                # pinecone, qdrant, pgvector

# Project Management Strategy
STACK_PM_STRATEGY=github            # github, linear, github-linear, none

# Orchestration Identity
STACK_ORCHESTRATION_MODE=standalone # standalone, candidate, integrated
```

**Beneficio:**
*   `vibe-doctor` se vuelve polimórfico: "Si es `nextjs`, chequea el tamaño del bundle. Si es `vite`, chequea el build output."
*   Los Agentes de IA leen esto y descartan alucinaciones (ej: no intentar importar `getServerSideProps` en Vite).

---

## 2. Universal Heartbeat (/health)
Cada servicio VibeThink debe exponer un endpoint estandarizado **público**.

**Request:** `GET /health`
**Response (JSON):**
```json
{
  "status": "ok",
  "app": "ovi-portal",
  "version": "1.0.0",
  "timestamp": "2025-12-15T21:00:00Z",
  "services": {
    "db": "connected",   // Opcional: Estado real de la conexión
    "redis": "n/a"
  }
}
```

**Beneficio:**
*   Dokploy/K8s pueden auto-reiniciar contenedores trabados.
*   El dashboard de monitoreo es genérico.

---

## 3. DNA Traceability (Trazabilidad)
Saber EXACTAMENTE qué código está corriendo en producción.

**Propuesta:** Inyectar el SHA de Git al momento del build.

```bash
# Durante CI/CD
NEXT_PUBLIC_APP_VERSION=$npm_package_version
NEXT_PUBLIC_COMMIT_SHA=$GITHUB_SHA
```

**Beneficio:**
*   Cuando un cliente reporta un bug, vemos en el `<footer>`: `v1.2.0 (fe4a10e)`.
*   Sabemos si el deploy se actualizó realmente o no.

---

## 4. Error Code Registry (Diccionario de Errores)
Dejar de retornar "Internal Server Error" o strings random.

**Propuesta:** Estándar de códigos `E-XXX`.
*   `E-AUTH-01`: Token expirado.
*   `E-PAYLOAD-01`: Collection not found.

**Beneficio:**
*   La IA puede buscar `E-AUTH-01` en el Dev-Kit y proponerte la solución exacta inmediatamente.

---

## 5. Data Agnosticism (Patrón de Adaptadores)
**Regla:** El Frontend NUNCA debe conocer la estructura cruda del CMS.
**Implementación:**
*   Capa de Adaptadores (`lib/adapters/*.ts`) obligatoria.
*   Transforma `CMS_Response` -> `UI_Props`.
*   *Por qué:* Permite cambiar de Payload a Strapi sin reescribir componentes.
