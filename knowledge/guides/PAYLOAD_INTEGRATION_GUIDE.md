# PayloadCMS Integration Standard (VibeThink) ☁️

**Status:** Draft Standard
**Target:** React/Vite Projects (Ovi-Portal, etc.)

---

## 🏗️ Architecture Overview

For VibeThink projects, we use PayloadCMS.

**SEO/AEO CRITICAL NOTE:**
If your project requires high SEO or AEO (Answer Engine Optimization), **DO NOT USE THIS VITE SETUP**.
Instead, migrate to **Next.js (App Router)** where Payload 3.0 runs natively.
See: `knowledge/architecture/SEO_ARCHITECTURE_DECISION.md`

## 🏗️ Architecture Overview (Legacy / SPA Mode)

This guide describes the configuration for **Headless** configuration served by a custom Express server that also serves the Vite frontend.

```mermaid
graph TD
    A[Browser] -->|Request| B[Express Server :3000]
    B -->|/admin| C[Payload Admin Panel]
    B -->|/api| D[Payload API (REST/GraphQL)]
    B -->|/*| E[Vite Frontend (SSR/SPA)]
    D --> F[MongoDB / Postgres]
```

---

## 📁 Standard Directory Structure

When "Porting" Payload to a project (like Ovi), enforce this structure to keep it clean:

```
project-root/
├── src/                  # Existing Frontend
├── server/               # Backend Logic
│   ├── index.ts          # Express Entrypoint (Merges Frontend + Payload)
│   └── payload.config.ts # Payload Configuration
├── payload/              # Payload CMS Logic
│   ├── collections/      # Data Models (Pages, Users, Media)
│   ├── globals/          # Global Settings (SEO, Footer)
│   └── cron-jobs/        # Scheduled Tasks
├── .env                  # PAYLOAD_SECRET, MONGODB_URI
└── package.json
```

---

## 🚀 Integration Steps (Generic Protocol)

### 1. Dependencies
```bash
npm install payload @payloadcms/bundler-webpack @payloadcms/db-mongodb @payloadcms/richtext-slate express
npm install --save-dev nodemon ts-node cross-env
```

### 2. Environment (`.env`)
```ini
PORT=3000
PAYLOAD_SECRET=YOUR_SECRET_KEY_HERE
MONGODB_URI=mongodb://localhost:27017/vibethink-cms
SERVER_URL=http://localhost:3000
```

### 3. Server Entrypoint (`server/index.ts`)
We do NOT use the default Payload server. We wrap it in our **ProcessManager** compatible server.

```typescript
import express from 'express';
import payload from 'payload';

const app = express();

const start = async () => {
  // 1. Init Payload
  await payload.init({
    secret: process.env.PAYLOAD_SECRET,
    express: app,
    onInit: async () => {
      payload.logger.info(`✨ Payload Admin URL: ${payload.getAdminURL()}`);
    },
  });

  // 2. Serve Frontend (Vite Build) in Production
  if (process.env.NODE_ENV === 'production') {
      app.use(express.static('dist'));
      app.get('*', (_, res) => res.sendFile('dist/index.html'));
  }

  // 3. Start Listener
  app.listen(process.env.PORT || 3000);
};

start();
```

---

## 🧩 Best Practices

1.  **Strict Typing:** Always generate types (`npm run generate:types`) and import them in the frontend.
2.  **Separate Media:** Use an abstract `Media` collection for all images.
3.  **Globals for Config:** Use Globals for "Site Settings", "Social Links", "SEO Defaults".
4.  **Zero-Conflict Ports:** Ensure `PAYLOAD_PORT` matches the `.env` assigned ports (3010 for Ovi).
