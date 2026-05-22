# ▲ Vercel Deployment Logic - VibeThink Standard

**Ubicación:** `knowledge/stack-guides/vercel-deployment.md`
**Propósito:** Guía estándar para desplegar Frontends (Next.js/Astro) en la red Edge de Vercel.

---

## 1. Filosofía de Despliegue Frontend
En VibeThink, **NO alojamos Frontends en VPS** (salvo excepciones Dockerizadas estrictas).
Usamos **Vercel** por defecto para Next.js y Astro.

### ¿Por qué Vercel?
*   **Infrastructure as Code:** Todo se configura en `vercel.json` o el framework config.
*   **Previews:** Cada Pull Request genera una URL única para validación visual.
*   **Edge Network:** Cero latencia global.
*   **ISR (Incremental Static Regeneration):** Actualización de contenido sin rebuilds completos.

---

## 2. Configuración por Framework

### A. Next.js (App Router)
Next.js es nativo de Vercel. Zero-config usualmente.
*   **Command:** `npm run build`
*   **Output Directory:** `.next`

### B. Astro 5+
Astro requiere un adaptador explícito para usar funciones SSR/ISR.

**Instalación:**
```bash
npx astro add vercel
```

**`astro.config.mjs`:**
```javascript
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  output: 'hybrid', // Permite mezclar páginas estáticas y dinámicas
  adapter: vercel({
    webAnalytics: { enabled: true },
    isr: {
      expiration: 60 * 60, // Revalidar caché cada hora por defecto
    }
  }),
});
```

---

## 3. Variables de Entorno (Environment Variables)

Las env vars en Vercel se dividen en 3 entornos. **NUNCA subir .env al repo.**

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PUBLIC_PAYLOAD_API_URL` | URL del CMS (Backend) | `https://cms.ovitality.org` |
| `PAYLOAD_API_KEY` | (Solo Server) API Key segura | `ab34...` |
| `CRON_SECRET` | Para revalidación on-demand | `xyz...` |

### Configuración en Project Settings:
1.  Ir a **Settings > Environment Variables**.
2.  Desmarcar "Preview" si la variable es solo para Producción (ej: Stripe Live Keys).
3.  Para conectarse al Backend (VPS): Asegúrate de que el VPS acepte peticiones desde Vercel (CORS).

---

## 4. Vercel Content Link (Payload CMS Integration)

Esta es una "Killer Feature" para editores. Permite hacer click en el Frontend y saltar a editar en el CMS.

### Setup Básico:
1.  **En Vercel:** Habilitar "Content Source Maps" (beta en algunas cuentas).
2.  **En Payload CMS:** Instalar `@payloadcms/plugin-vercel-content-link`.
    ```typescript
    // payload.config.ts
    import { vercelContentLink } from '@payloadcms/plugin-vercel-content-link'

    plugins: [
      vercelContentLink({
        userId: '...', // Vercel Team ID
        token: process.env.VERCEL_TOKEN
      })
    ]
    ```

---

## 5. Advanced: Legacy Express Apps (Serverless Shim)

Si necesitas desplegar una API Express pura (Legacy) en Vercel, no funciona "out of the box". Necesitas un wrapper serverless.

**`api/index.js` (Serverless Entry Point):**
```javascript
import app from '../server/app.js'; // Tu Express App exportada
export default app;
```

**`vercel.json`:**
```json
{
  "version": 2,
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index.js" }
  ]
}
```

*Nota: Esto tiene limitaciones con WebSockets. Para WebSockets reales, se recomienda usar DigitalOcean (VPS).*

---

## 6. Troubleshooting Común

*   **Error:** *404 en rutas dinámicas tras deploy.*
    *   **Causa:** Falta configurar `output: 'server'` o `'hybrid'` en Astro/Next. Vercel asumió estático.
    *   **Solución:** Revisar el Adapter.
*   **Error:** *CORS Error al llamar al API.*
    *   **Causa:** El Backend (VPS) no tiene el dominio de Vercel en la whitelist.
    *   **Solución:** Agregar `vercel.app` a los `cors: [...]` en `payload.config.ts`.

---

**Fuente del Conocimiento:** OVI Platform Architecture.
**Estado:** Válido para 2025.
