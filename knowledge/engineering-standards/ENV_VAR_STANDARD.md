# 🔐 Estándar de Variables de Entorno (.env)

**Propósito:** Estandarizar la estructura de archivos `.env` para facilitar el **CI/CD** y el **Zero-Conflict Protocol**.

---

## 1. Estructura Obligatoria

Todo archivo `.env` en la raíz de un proyecto debe seguir estas secciones:

```bash
# ==============================================
# 1. NETWORK & PORTS (Zero-Conflict Protocol)
# ==============================================
PORT_WEB=30xx
PORT_API=30xy

# ==============================================
# 2. DEPLOYMENT METADATA (CI/CD Reference)
# ==============================================
# Dónde vive este proyecto en Producción
DEPLOY_PLATFORM_WEB=vercel          # opciones: vercel, digitalocean, coolify, dokploy, s3
DEPLOY_PLATFORM_API=digitalocean    # options: (same), none
DEPLOY_PROD_URL=https://...
GITHUB_REPO_URL=https://github.com/org/repo

# ==============================================
# 3. STACK IDENTITY (VibeThink DNA)
# ==============================================
STACK_TYPE=next-payload             # next-payload, astro-payload, vite-express
STACK_CMS=payload
STACK_PM_STRATEGY=github # github, linear, github-linear, none
STACK_ORCHESTRATION_MODE=standalone # standalone, candidate, integrated
STACK_OBSERVABILITY=trace-id        # trace-id, langfuse, none

# ==============================================
# 4. COMPLIANCE & METHODOLOGY
# ==============================================
STACK_DOCS_METHODOLOGY=openspec,cmmi-3 # openspec, cmmi-3, iso-27001, bmad
STACK_DOCS_ENGINE=redocly              # redocly, docusaurus, openspec-cli

# CODE REVIEW (Cost Efficiency)
STACK_REVIEW_TOOLS=coderabbit,jules    # coderabbit, jules, sonarqube, none
STACK_REVIEW_MODE=manual-dispatch      # manual-dispatch (ahorro), pr-only, on-push

# BUILD & RUNTIME (Strict Enforcer)
STACK_PACKAGE_MANAGER=npm              # npm, bun, pnpm, yarn (ONLY ONE)
STACK_NODE_VERSION=20.18.0             # LTS Version (Avoid Odd versions)
STACK_PYTHON_VERSION=3.12              # 3.11, 3.12 (For AI Stacks)
STACK_DOTNET_VERSION=8.0               # 8.0, 9.0 (No Framework 4.x)

# ==============================================
# 5. APP SECRETS & CONFIG
# ==============================================
DATABASE_URL=...
API_KEYS=...
```

## 2. Definiciones de Plataforma

*   `vercel`: Frontend desplegado en Vercel Edge Network. Requiere `vercel.json`.
*   `digitalocean`: VPS o Droplet. Requiere `docker-compose.yml` o gestión vía PM2/Dokploy.
*   `coolify`: Self-hosted PaaS.
*   `dokploy`: Self-hosted PaaS (VibeThink Standard para VPS).

## 3. Reglas de Oro

1.  **Nunca comitear `.env`:** Usar siempre `.env.example` para el repositorio.
2.  **Paridad:** `PORT_WEB` debe coincidir con la configuración de `vite.config.ts` o `next.config.js`.
3.  **Documentación:** La sección METADATA sirve para que los Agentes de IA sepan cómo desplegar sin adivinar.
