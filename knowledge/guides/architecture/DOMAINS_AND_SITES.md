# Domains and Sites Architecture

## Purpose
Definir, documentar y aislar las responsabilidades entre el website público (marketing) y la aplicación SaaS, para evitar confusiones y violaciones de reglas.

## Domains
- Producto (marketing): `vibethink.co`
  - `www.vibethink.co` → Website público (Next.js) en `apps/website`
  - `docs.vibethink.co` → Documentación y blog (Docusaurus) en `docusaurus-docs`
  - `status.vibethink.co` → Status page (externo recomendado; opcional `apps/status`)
- Aplicación (SaaS): `vibethink.ai`
  - `app.vibethink.ai` → Dashboard (Next.js) en `apps/dashboard`
  - `admin.vibethink.ai` → Admin (Next.js) en `apps/admin`
  - `help.vibethink.ai` → Helpdesk (Next.js) en `apps/helpdesk`
  - `api.vibethink.ai` → APIs (según despliegue)

## Website (apps/website)
- Rol: sitio de bienvenida/marketing, SEO, landing, features, pricing, contacto, legales.
- No persiste sesión, no integra Supabase/Auth. CTA → redirección a `app.vibethink.ai/login`.
- Exención: no requiere multi-tenant ni RLS. Sí hereda reglas mínimas del monorepo:
  - Dependencias y versiones exactas solo en root (sin node_modules locales).
  - Builds vía script root (`npm run build:website`).
  - Sin duplicar componentes compartidos; usar `src/shared/*` cuando aplique.

## Supabase/Auth Policy
- Allowed Redirect URLs: incluir `https://app.vibethink.ai` y `https://www.vibethink.co`.
- El flujo de autenticación termina siempre en `.ai`. El website `.co` solo redirige.

## CI/CD & DNS
- DNS: CNAME por subdominio según proveedor.
- Despliegue: proyectos/builds por app (website vs app), sin mezclar artefactos.

## Documentación Canónica
- Branding: producto «VibeThink Orchestrator», metodología «VThink 1.0».
- Este documento prevalece ante cualquier referencia contradictoria.


