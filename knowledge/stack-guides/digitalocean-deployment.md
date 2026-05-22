# 🌊 DigitalOcean Deployment Logic - VibeThink Standard
**Ubicación:** `knowledge/stack-guides/digitalocean-deployment.md`
**Propósito:** Guía destilada de despliegues robustos en DigitalOcean.

---

## 1. La "Regla de Oro" del Droplet
**Nunca despliegues manualmente en el servidor.**

*   **Mal:** Entrar por SSH -> `git pull` -> `npm install` -> `pm2 restart`.
*   **Bien:** GitHub Actions -> Dokploy / Docker Registry -> Server pull.

---

## 2. Estrategia de CI/CD (Filosofía VibeThink)

Para evitar "over-engineering", adoptamos una estrategia híbrida:

### A. Validación (CI "Lite") - **MANUAL / LOCAL**
*   **Decisión:** No ejecutamos `vibe-doctor` ni linters en cada push a GitHub.
*   **Razón:** Evitar costos de runners, tiempos de espera y ruido en el correo.
*   **Protocolo:** El desarrollador es responsable de correr `.\scripts\vibe-doctor.ps1` localmente antes de hacer push.

### B. Despliegue (CD Crítico) - **AUTOMATIZADO**
*   **Decisión:** El despliegue a producción **SIEMPRE** debe ser por GitHub Actions.
*   **Razón:** Garantiza idempotencia. Si borras tu PC local, el proyecto sigue desplegable desde la nube. Elimina el factor "funciona en mi máquina".
*   **Protocolo:** Todo merge a `main` dispara el deploy automáticamente.

---

## 3. Configuración Estándar (Infrastructure as Code)
Para cualquier proyecto Node.js/Next.js/Docker en DigitalOcean:

### A. Preparación del SO (Ubuntu LTS)
Evita configurar servidores desde cero cada vez. Hereda este script de inicialización:
1.  **Seguridad:** Deshabilitar root login, configurar UFW (firewall).
2.  **Swap:** Crear 2GB de Swap (crítico para builds de Next.js en servidores pequeños).
    ```bash
    fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
    ```
3.  **Timezone:** Configurar siempre a UTC para evitar locura en logs.

### B. Gestión de Puertos (VibeThink Standard)
Usamos un Proxy Inverso (Traefik o Nginx) para no exponer puertos de apps.
*   **App 1:** `localhost:3000`
*   **App 2:** `localhost:3001`
*   **Proxy:** Recibe tráfico en 80/443 y rutea internamente.

---

## 3. GitHub Actions para DigitalOcean (Estrategia Docker First)

**Estándar 2025:** Preferimos Contenedores (Docker) sobre PM2.
*   **PM2 (Legacy):** Rápido de configurar, pero el servidor "envejece" (drift) y las versiones de Node pueden desincronizarse.
*   **Docker (Standard):** Inmutable. Lo que corre en tu laptop corre en Producción.

### Workflow Típico (Dokploy / Coolify):
1.  **Push a Main.**
2.  **Webhook:** GitHub avisa a Dokploy.
3.  **Build en Server:** Dokploy baja el repo y construye el `Dockerfile`.
4.  **Zero Downtime:** Dokploy levanta el nuevo contenedor antes de matar el viejo.

*Si DEBES usar PM2 (servidores muy pequeños < 1GB RAM), asegúrate de usar `nvm` y un `ecosystem.config.js` versionado.*

**Nota Crítica de Ovi Portal:**
En aplicaciones Next.js pesadas, **NO hagas el build en el servidor** si es un Droplet de $6.
*   *Opción A:* Build en GitHub Actions (Artifact) -> SCP al servidor.
*   *Opción B:* Build en Docker Hub -> Server hace `docker pull`.

## 4. Dokploy / Coolify (Gestión Moderna)
Si usas Dokploy (estándar en V4):
1.  **No toques el servidor.** Conecta el repo en el panel de Dokploy.
2.  **Variables de Entorno:** Nunca hardcodeadas. Siempre en el panel de Dokploy/Coolify.
3.  **Clean Up:** Configura un cron job para `docker system prune -af` semanal, o el disco se llenará de imágenes viejas.

---

## 5. Troubleshooting Común (Lo que siempre olvidamos)
*   **Error:** "JavaScript heap out of memory" durante build.
    *   **Solución:** `NODE_OPTIONS="--max-old-space-size=4096"` (o aumentar Swap).
*   **Error:** Permisos de archivos subidos.
    *   **Solución:** Asegurar que el usuario de Docker/Node tenga ownership de la carpeta `uploads/`.

---
**Fuente del Conocimiento:** Heredado de V4-ovi-Portal y experiencias previas.
**Estado:** Válido para 2025.
