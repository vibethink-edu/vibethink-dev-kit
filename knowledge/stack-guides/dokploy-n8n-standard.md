# n8n Deployment Standard (Dokploy)

**Stack:** Dokploy + Traefik + n8n + PostgreSQL 17 Alpine
**Status:** ✅ VibeThink Standard
**Source:** Harvested from `VozFood-Agent` (Battle-tested)

---

## 🎯 Overview

This standard defines the **mandatory configuration** for deploying n8n agents on Dokploy infrastructure. It addresses specific challenges related to timezone synchronization and reverse proxy security.

## 🚨 Critical Configuration Protocol

### 1. 🕒 Timezone Synchronization (The Alpine Fix)
**Problem:** Docker containers (specifically Alpine-based) drift time or default to UTC, breaking cron jobs and logs.
**Solution:** You MUST mount the host's timezone files.

```yaml
services:
  n8n:
    volumes:
      - /etc/localtime:/etc/localtime:ro  # ⚠️ MANDATORY
      - /etc/timezone:/etc/timezone:ro    # ⚠️ MANDATORY
    environment:
      - GENERIC_TIMEZONE=America/Bogota
      - TZ=America/Bogota
```

### 2. 🛡️ Proxy Trust (Traefik compatibility)
**Problem:** n8n rejects webhooks from Traefik due to security policies on `X-Forwarded-For`.
**Solution:** Trust the first proxy hop.

```yaml
services:
  n8n:
    environment:
      - N8N_PROXY_HOPS=1  # ⚠️ MANDATORY for Traefik
```

### 3. 💾 Database Persistence (PostgreSQL 17)
**Standard:** Use `postgres:17-alpine` for footprint efficiency.
**Healthcheck:** Mandatory to prevent n8n boot loops.

```yaml
services:
  postgres:
    image: postgres:17-alpine
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
```

---

## 📋 Docker Compose Template (Copy-Paste Ready)

```yaml
services:
  postgres:
    image: postgres:17-alpine
    restart: unless-stopped
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      start_period: 30s
      interval: 10s
      timeout: 5s
      retries: 5

  n8n:
    image: n8nio/n8n:latest
    restart: unless-stopped
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=${POSTGRES_DB}
      - DB_POSTGRESDB_USER=${POSTGRES_USER}
      - DB_POSTGRESDB_PASSWORD=${POSTGRES_PASSWORD}
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
      - N8N_HOST=${N8N_HOST}
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://${N8N_HOST}/
      - N8N_PROXY_HOPS=1                  # CRITICAL
      - GENERIC_TIMEZONE=${GENERIC_TIMEZONE}
      - TZ=${GENERIC_TIMEZONE}
    volumes:
      - n8n_data:/home/node/.n8n
      - /etc/localtime:/etc/localtime:ro  # CRITICAL
      - /etc/timezone:/etc/timezone:ro    # CRITICAL
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  n8n_data:
  postgres_data:
```

## 🔧 Environment Variables (.env)

```bash
# Identity
STACK_TYPE=n8n-agent-backend

# Dokploy Params
POSTGRES_USER=n8n
POSTGRES_PASSWORD=[SECURE]
POSTGRES_DB=n8n
N8N_ENCRYPTION_KEY=[SECURE]
N8N_HOST=agents.vibethink.dev
GENERIC_TIMEZONE=America/Bogota
```

---

## 📚 Troubleshooting (Knowledge Base)

**Error: `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR`**
*   **Cause:** Missing `N8N_PROXY_HOPS=1`.
*   **Fix:** Add variable and restart container.

**Error: Cron jobs running 5 hours late**
*   **Cause:** Host timezone not mounted.
*   **Fix:** Ensure `/etc/localtime` volume mount exists and host has correct time.
