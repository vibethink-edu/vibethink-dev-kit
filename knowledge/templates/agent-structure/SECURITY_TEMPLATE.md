# 🔒 Seguridad, Estándares y Mejores Prácticas

> **Guía completa de seguridad, convenciones de código, límites y validaciones para el desarrollo**

---

## 🛡️ Seguridad

### 1. Vulnerabilidades Comunes (OWASP Top 10)

#### ❌ SQL Injection
**Riesgo:** Alto
**Mitigación:** Payload CMS usa Drizzle ORM que sanitiza automáticamente

```typescript
// ✅ SEGURO (Payload ya lo hace internamente)
await payload.find({
  collection: 'posts',
  where: {
    slug: { equals: userInput }  // Sanitizado automáticamente
  }
})

// ❌ NUNCA hacer queries raw sin sanitizar
await db.execute(`SELECT * FROM posts WHERE slug = '${userInput}'`)  // PELIGRO
```

#### ❌ XSS (Cross-Site Scripting)
**Riesgo:** Alto
**Mitigación:** Sanitizar inputs y outputs

```typescript
// ✅ SEGURO - Payload RichText sanitiza HTML
{
  name: 'content',
  type: 'richText',
  // Payload usa DOMPurify internamente
}

// ✅ SEGURO - Astro escapa HTML por defecto
<h1>{post.title}</h1>  // Escapado automáticamente

// ⚠️ PELIGRO - Solo si sabes que el HTML es seguro
<div set:html={post.content} />  // Usar solo con contenido de RichText de Payload
```

**Regla:** NUNCA usar `dangerouslySetInnerHTML` o `set:html` con input de usuario directo.

#### ❌ CSRF (Cross-Site Request Forgery)
**Riesgo:** Medio
**Mitigación:** Payload tiene CSRF protection habilitado por defecto

```typescript
// apps/cms/src/payload.config.ts

export default buildConfig({
  csrf: [
    'https://yourdomain.com',
    'https://admin.yourdomain.com',
  ],
  // Payload automáticamente valida origin headers
})
```

#### ❌ Authentication Bypass
**Riesgo:** Crítico
**Mitigación:** Usar access control de Payload

```typescript
// ✅ SEGURO
access: {
  read: ({ req: { user } }) => {
    if (!user) return false  // No autenticado = sin acceso

    if (user.role === 'admin') return true

    // Solo su propio contenido
    return {
      createdBy: { equals: user.id }
    }
  }
}

// ❌ INSEGURO
access: {
  read: () => true  // TODOS pueden leer TODO (incluso sin autenticación)
}
```

#### ❌ Broken Access Control
**Riesgo:** Crítico
**Mitigación:** Validar permisos en CADA operación

```typescript
// ✅ SEGURO - Validar rol antes de cambiar status
beforeChange: [
  ({ req, data }) => {
    if (data.status === 'published' && req.user?.role !== 'admin') {
      throw new Error('Solo admins pueden publicar')
    }
    return data
  }
]

// ❌ INSEGURO - Confiar en el frontend
// Frontend envía: { status: 'published' }
// Backend acepta sin validar
```

#### ❌ Sensitive Data Exposure
**Riesgo:** Alto
**Mitigación:** Ocultar campos sensibles en API

```typescript
// ✅ SEGURO
{
  name: 'password',
  type: 'text',
  admin: {
    hidden: true,  // No mostrar en admin UI
  },
  access: {
    read: () => false,  // NUNCA exponer en API
  }
}

// ✅ SEGURO - Filtrar en respuesta
hooks: {
  afterRead: [
    ({ doc }) => {
      delete doc.password
      delete doc.resetToken
      return doc
    }
  ]
}
```

#### ❌ File Upload Vulnerabilities
**Riesgo:** Crítico
**Mitigación:** Validar MIME types y tamaños

```typescript
// ✅ SEGURO
{
  name: 'profileImage',
  type: 'upload',
  relationTo: 'media',
  filterOptions: {
    mimeType: { contains: 'image' },  // Solo imágenes
  }
}

// En Media collection:
{
  slug: 'media',
  upload: {
    staticURL: '/media',
    staticDir: 'media',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],  // ✅ Whitelist
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
      }
    ],
    adminThumbnail: 'thumbnail',
  }
}
```

**Reglas críticas:**
1. ❌ NUNCA aceptar cualquier tipo de archivo
2. ✅ Whitelist de MIME types permitidos
3. ✅ Límite de tamaño (ver sección de límites)
4. ✅ Escanear archivos con antivirus (producción)
5. ❌ NUNCA ejecutar archivos subidos

---

### 2. Variables de Entorno (Secrets)

#### ✅ Buenas Prácticas

```bash
# .env (NUNCA commitear a Git)

# ✅ OBLIGATORIO - Secrets críticos
DATABASE_URI=postgresql://user:STRONG_PASSWORD@localhost:5432/db
PAYLOAD_SECRET=GENERAR_CON_openssl_rand_-base64_32
JWT_SECRET=GENERAR_CON_openssl_rand_-base64_32

# ✅ APIs externas
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_live_...

# ✅ URLs públicas (OK exponer en frontend)
PUBLIC_PAYLOAD_API_URL=https://api.yourdomain.com
PUBLIC_SITE_URL=https://yourdomain.com
```

#### ❌ Errores Comunes

```typescript
// ❌ NUNCA hardcodear secrets
const apiKey = 'sk-ant-api03-1234567890'  // PELIGRO

// ✅ SIEMPRE usar variables de entorno
const apiKey = process.env.ANTHROPIC_API_KEY
if (!apiKey) throw new Error('ANTHROPIC_API_KEY no configurada')

// ❌ NUNCA exponer secrets en frontend
const config = {
  apiKey: process.env.STRIPE_SECRET_KEY  // Se expone en bundle JS
}

// ✅ Solo variables PUBLIC_ en Astro
const config = {
  apiUrl: import.meta.env.PUBLIC_PAYLOAD_API_URL  // OK
}
```

#### Validación de Secrets al Inicio

```typescript
// apps/cms/src/server.ts

const requiredEnvVars = [
  'DATABASE_URI',
  'PAYLOAD_SECRET',
  'JWT_SECRET',
]

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`❌ Variable de entorno requerida no encontrada: ${envVar}`)
  }
}

console.log('✅ Todas las variables de entorno requeridas están configuradas')
```

---

### 3. Rate Limiting

```typescript
// apps/cms/src/server.ts

import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 requests por IP
  message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde',
  standardHeaders: true,
  legacyHeaders: false,
})

// Aplicar a todas las rutas de API
app.use('/api', limiter)

// Rate limiting más estricto para auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Solo 5 intentos de login por 15 min
  skipSuccessfulRequests: true,
})

app.use('/api/users/login', authLimiter)
```

---

### 4. CORS (Cross-Origin Resource Sharing)

```typescript
// apps/cms/src/payload.config.ts

export default buildConfig({
  cors: [
    'https://yourdomain.com',        // Frontend production
    'https://admin.yourdomain.com',  // Admin production
    'http://localhost:4321',         // Astro dev
  ],

  // ❌ NUNCA en producción
  // cors: '*'  // Permite CUALQUIER origen (INSEGURO)
})
```

---

### 5. Headers de Seguridad

```typescript
// apps/cms/src/server.ts

import helmet from 'helmet'

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],  // Payload admin UI necesita inline styles
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.anthropic.com'],  // AI API
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  }
}))
```

---

## 📏 Convenciones de Código

### 1. Naming Conventions

#### Collections

```typescript
// ✅ CORRECTO - PascalCase, singular
export const Post: CollectionConfig = {
  slug: 'posts',  // slug en plural, minúsculas
}

// ❌ INCORRECTO
export const posts = { ... }  // camelCase
export const Posts = { ... }  // Plural en variable
```

#### Campos

```typescript
// ✅ CORRECTO - camelCase
{
  name: 'firstName',
  name: 'publishedAt',
  name: 'featuredImage',
}

// ❌ INCORRECTO
{
  name: 'first_name',  // snake_case
  name: 'PublishedAt', // PascalCase
}
```

#### Funciones y Variables

```typescript
// ✅ CORRECTO - camelCase para funciones y variables
const fetchPosts = async () => { ... }
const currentUser = await getUser()

// ✅ CORRECTO - PascalCase para componentes y clases
const PostCard = () => { ... }
class UserService { ... }

// ✅ CORRECTO - SCREAMING_SNAKE_CASE para constantes
const MAX_FILE_SIZE = 5 * 1024 * 1024
const API_VERSION = 'v1'
```

#### Archivos

```typescript
// ✅ CORRECTO
Posts.ts           // Collections en PascalCase
payloadClient.ts   // Utils en camelCase
SECURITY.md        // Docs importantes en UPPERCASE
README.md          // Convencional

// ❌ INCORRECTO
posts.ts           // Collection en minúsculas
PayloadClient.ts   // Util en PascalCase
```

---

### 2. Estructura de Imports

```typescript
// ✅ ORDEN CORRECTO

// 1. Node built-ins
import path from 'path'
import fs from 'fs'

// 2. External packages
import { buildConfig } from 'payload/config'
import express from 'express'

// 3. Internal packages (@agency/...)
import { Posts, Team } from '@agency/payload-core'

// 4. Relative imports (mismo proyecto)
import { seoField } from '../fields/seo'
import { byRole } from '../access/byRole'

// 5. Types (al final)
import type { CollectionConfig } from 'payload/types'
```

---

### 3. TypeScript Strictness

```json
// tsconfig.json

{
  "compilerOptions": {
    "strict": true,                    // ✅ Modo strict obligatorio
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,

    // ❌ NUNCA deshabilitar estas opciones
    // "skipLibCheck": true,  // Solo si es absolutamente necesario
  }
}
```

---

### 4. ESLint Rules

```javascript
// .eslintrc.js

module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:astro/recommended',
  ],
  rules: {
    // ✅ Obligatorias
    'no-console': ['warn', { allow: ['warn', 'error'] }],  // Solo console.warn y console.error
    'no-debugger': 'error',                                 // No debugger en producción
    '@typescript-eslint/no-explicit-any': 'error',          // No usar 'any'
    '@typescript-eslint/no-unused-vars': 'error',
    'prefer-const': 'error',
    'no-var': 'error',                                      // Usar let/const

    // ⚠️ Warnings
    'max-lines': ['warn', 500],                             // Máximo 500 líneas por archivo
    'max-depth': ['warn', 4],                               // Máximo 4 niveles de anidación
    'complexity': ['warn', 20],                             // Complejidad ciclomática máxima
  }
}
```

---

### 5. Prettier Configuration

```json
// .prettierrc

{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

---

## 📊 Límites y Tamaños

### 1. Tamaños de Archivos

#### Código

```typescript
// Límites recomendados por tipo de archivo

// ✅ IDEAL
Component.tsx         < 200 líneas
Collection.ts         < 300 líneas
Page.astro           < 400 líneas
Utils.ts             < 200 líneas

// ⚠️ ACEPTABLE (pero considerar refactorizar)
Component.tsx         200-400 líneas
Collection.ts         300-500 líneas

// ❌ DEMASIADO GRANDE (REFACTORIZAR)
Cualquier archivo    > 500 líneas
```

**Acciones si excede límite:**
1. Extraer componentes/funciones a archivos separados
2. Usar composition pattern
3. Dividir en múltiples archivos relacionados

#### Media

```typescript
// Media collection limits

{
  slug: 'media',
  upload: {
    limits: {
      fileSize: 5 * 1024 * 1024,  // ✅ 5MB máximo para imágenes
    },
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  }
}

// Para PDFs u otros documentos
{
  limits: {
    fileSize: 10 * 1024 * 1024,  // ✅ 10MB para PDFs
  },
  mimeTypes: ['application/pdf'],
}

// ❌ NUNCA permitir archivos gigantes sin límite
```

---

### 2. Database Limits

```typescript
// Campos de texto

{
  name: 'title',
  type: 'text',
  maxLength: 200,  // ✅ SEO-friendly (60 para títulos SEO)
}

{
  name: 'excerpt',
  type: 'textarea',
  maxLength: 500,  // ✅ Resúmenes
}

{
  name: 'slug',
  type: 'text',
  maxLength: 100,  // ✅ URLs razonables
}

// RichText - Payload maneja automáticamente
{
  name: 'content',
  type: 'richText',
  // No maxLength (puede ser muy largo)
}
```

---

### 3. API Response Limits

```typescript
// Paginación obligatoria

// ✅ CORRECTO
await payload.find({
  collection: 'posts',
  limit: 20,        // Máximo 20 por página
  page: 1,
})

// ❌ INCORRECTO - Traer TODO
await payload.find({
  collection: 'posts',
  limit: 0,         // Sin límite (puede crashear si hay 10,000+ posts)
})
```

**Límites recomendados:**
- Listados públicos: 12-20 items
- Admin panel: 50 items
- Búsquedas: 100 items máximo
- Exports: Usar streaming para datasets grandes

---

### 4. Bundle Size Limits

```bash
# Frontend (Astro)

# ✅ IDEAL
Main bundle:     < 200 KB (gzipped)
Total JS:        < 500 KB (gzipped)
Total CSS:       < 50 KB (gzipped)

# ⚠️ ACEPTABLE
Main bundle:     200-400 KB
Total JS:        500 KB - 1 MB

# ❌ DEMASIADO GRANDE
Main bundle:     > 400 KB
Total JS:        > 1 MB
```

**Herramientas de análisis:**
```bash
# Analizar bundle de Astro
pnpm run build
pnpm add -D rollup-plugin-visualizer

# Ver bundle size
du -sh dist/
```

---

## ⚡ Performance

### 1. Database Queries

```typescript
// ✅ OPTIMIZADO - Select solo campos necesarios
await payload.find({
  collection: 'posts',
  select: {
    title: true,
    slug: true,
    excerpt: true,
    featuredImage: true,
  },
  depth: 1,  // Limitar profundidad de relaciones
})

// ❌ LENTO - Trae TODO
await payload.find({
  collection: 'posts',
  depth: 5,  // Trae relaciones hasta 5 niveles (LENTO)
})
```

### 2. Imágenes

```typescript
// ✅ OPTIMIZADO - Generar múltiples tamaños
{
  slug: 'media',
  upload: {
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        crop: 'center',
      },
      {
        name: 'card',
        width: 800,
        height: 600,
      },
      {
        name: 'hero',
        width: 1920,
        height: 1080,
      },
    ],
  }
}

// En frontend, usar el tamaño apropiado
<img
  src={post.featuredImage.sizes.thumbnail.url}  // ✅ Thumbnail para cards
  alt={post.featuredImage.alt}
/>
```

### 3. Caching

```typescript
// apps/web/astro.config.mjs

export default defineConfig({
  output: 'hybrid',  // SSG + ISR

  // Cachear páginas estáticas
  adapter: vercel({
    isr: {
      expiration: 60 * 60,  // Revalidar cada hora
    }
  }),
})
```

---

## ✅ Compatibilidad del Stack

### Versiones Validadas

```json
{
  "engines": {
    "node": ">=20.0.0 <21.0.0",
    "pnpm": ">=8.0.0"
  },
  "dependencies": {
    // Backend
    "payload": "^3.0.0",              // ✅ Estable
    "drizzle-orm": "^0.33.0",         // ✅ Compatible con Payload 3
    "postgres": "^3.4.0",             // ✅ Última versión

    // Frontend
    "astro": "^5.0.0",                // ✅ Última major
    "react": "^19.0.0",               // ✅ Última major
    "react-dom": "^19.0.0",

    // UI
    "tailwindcss": "^4.0.0",          // ✅ Última major
    "framer-motion": "^11.0.0",       // ✅ Compatible React 19

    // Utils
    "typescript": "^5.6.0",           // ✅ Última 5.x
    "zod": "^3.23.0",                 // ✅ Validación
  }
}
```

### Incompatibilidades Conocidas

❌ **React 19 + Framer Motion < 11**
- Solución: Actualizar Framer Motion a v11+

❌ **Payload 3 + MongoDB**
- Payload 3 solo soporta PostgreSQL (Drizzle ORM)
- Migrar de MongoDB a PostgreSQL si venías de Payload 2

❌ **Node 18 + Payload 3**
- Payload 3 requiere Node 20+
- Actualizar a Node 20 LTS

---

## 🧪 Testing Standards

### 1. Coverage Mínimo

```json
// jest.config.js

{
  "coverageThreshold": {
    "global": {
      "branches": 80,      // ✅ 80% mínimo
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
}
```

### 2. Tests Obligatorios

```typescript
// ✅ OBLIGATORIO - Testear acciones críticas

// Collections
describe('Posts Collection', () => {
  test('Creates post with required fields', async () => { ... })
  test('Validates access control', async () => { ... })
  test('Enforces workflow status transitions', async () => { ... })
})

// Hooks
describe('Approval Workflow Hook', () => {
  test('Prevents non-approvers from approving', async () => { ... })
  test('Records workflow history', async () => { ... })
})

// Endpoints
describe('AI Assistant Endpoints', () => {
  test('Returns suggestion within timeout', async () => { ... })
  test('Handles API errors gracefully', async () => { ... })
})
```

---

## 📝 Git Workflow

### 1. Commits

```bash
# ✅ FORMATO OBLIGATORIO
tipo(scope): descripción corta

Cuerpo del commit (opcional)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

# Tipos válidos:
feat, fix, docs, style, refactor, test, chore

# Ejemplos:
feat(cms): add approval workflow to Posts collection
fix(web): resolve calendar grid date formatting
docs(guides): add security best practices guide
```

### 2. Branches

```bash
# ✅ FORMATO
{tipo}/{descripción-corta}

# Ejemplos:
backend/professionals-collection
frontend/directory-page
cicd/playwright-tests
hotfix/security-xss-vulnerability
```

### 3. Pull Requests

**Checklist obligatorio:**
- [ ] Tests pasando
- [ ] Linter sin errores
- [ ] Coverage > 80%
- [ ] Actualizado CHANGELOG.md
- [ ] Documentación actualizada (si aplica)
- [ ] No hay `console.log` o `debugger`
- [ ] Validado contra OpenSpec (para APIs)

---

## 🚨 Pre-commit Checks

```json
// package.json

{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix",
      "prettier --write",
      "jest --findRelatedTests --passWithNoTests"
    ],
    "*.{json,md,yml}": [
      "prettier --write"
    ]
  }
}
```

---

## 📋 Checklist de Seguridad (Pre-Deploy)

### Backend (Payload CMS)

- [ ] Variables de entorno configuradas y validadas
- [ ] `PAYLOAD_SECRET` fuerte (32+ caracteres random)
- [ ] Database con usuario no-root
- [ ] CORS configurado (NO `*`)
- [ ] Rate limiting habilitado
- [ ] Helmet (security headers) configurado
- [ ] HTTPS forzado en producción
- [ ] Backups automáticos configurados
- [ ] Access control revisado en todas las collections
- [ ] Secrets NO commiteados en Git

### Frontend (Astro)

- [ ] Solo variables `PUBLIC_*` expuestas
- [ ] CSP (Content Security Policy) configurado
- [ ] SRI (Subresource Integrity) para CDNs
- [ ] HTTPS forzado
- [ ] Input sanitization en formularios
- [ ] Rate limiting en API calls

---

**Última actualización:** 2025-12-06
**Versión:** 1.0.0
**Mantenido por:** Equipo OVI Platform


---

# 🏷️ PARTE 2: Versionado y Gestión de Secrets

> **Contenido consolidado de VERSIONING_AND_SECRETS.md**


```
MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]

Ejemplos:
1.0.0
1.2.3
2.0.0-alpha.1
2.0.0-beta.2
2.1.0-rc.1
3.0.0+20130313144700
```

### Reglas de Incremento

```
MAJOR (X.0.0): Breaking changes (incompatibilidad con versión anterior)
MINOR (0.X.0): Nuevas features (retrocompatible)
PATCH (0.0.X): Bug fixes (retrocompatible)
```

### Ejemplos Prácticos

```typescript
// Versión actual: 1.2.3

// ✅ PATCH (1.2.4)
- fix(cms): corregir error en validation de email
- fix(web): resolver memory leak en componente

// ✅ MINOR (1.3.0)
- feat(cms): agregar collection Products
- feat(web): implementar dark mode

// ✅ MAJOR (2.0.0)
- BREAKING: cambiar estructura de API response
- BREAKING: eliminar support para Node 18
- BREAKING: renombrar campo 'slug' a 'permalink'
```

---

## 🏷️ Implementación de Versioning

### 1. package.json (Source of Truth)

```json
{
  "name": "@ovitality/platform",
  "version": "1.0.0",
  "description": "OVI Platform - Extensible Multi-Tenant CMS"
}
```

### 2. Version Component (Footer)

```typescript
// packages/ui/src/components/Version.tsx

import { version, name } from '../../../package.json'

export const Version: React.FC = () => {
  const buildDate = new Date().toISOString().split('T')[0]
  const gitHash = process.env.VITE_GIT_HASH || 'dev'

  return (
    <div className="text-xs text-gray-500">
      <span>{name}</span>
      {' v'}
      <span className="font-mono">{version}</span>
      {' • '}
      <span className="text-gray-400">
        {gitHash.substring(0, 7)}
      </span>
      {' • '}
      <span>{buildDate}</span>
    </div>
  )
}

// Uso en Footer:
// OVI Platform v1.2.3 • abc1234 • 2025-12-06
```

### 3. Footer con Version (Astro)

```astro
---
// apps/web/src/components/layout/Footer.astro

import { version } from '../../../package.json'
import Version from '@/components/Version'

const currentYear = new Date().getFullYear()
const buildInfo = {
  version,
  gitHash: import.meta.env.PUBLIC_GIT_HASH || 'dev',
  buildDate: new Date().toISOString().split('T')[0]
}
---

<footer class="bg-gray-900 text-white py-8">
  <div class="container mx-auto px-4">
    <!-- Footer content -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* ... columnas ... */}
    </div>

    <!-- Version info en bottom -->
    <div class="border-t border-gray-800 mt-8 pt-6">
      <div class="flex flex-col md:flex-row justify-between items-center text-sm">
        <div class="text-gray-400">
          © {currentYear} OVI Platform. Todos los derechos reservados.
        </div>

        <!-- ⭐ VERSION VISIBLE -->
        <div class="text-gray-500 font-mono text-xs mt-4 md:mt-0">
          v{buildInfo.version} • {buildInfo.gitHash.substring(0, 7)} • {buildInfo.buildDate}
        </div>
      </div>
    </div>
  </div>
</footer>
```

### 4. Admin Panel Version (Payload)

```typescript
// apps/cms/src/payload.config.ts

import { version } from '../../package.json'

export default buildConfig({
  admin: {
    meta: {
      titleSuffix: `- OVI CMS v${version}`,
      favicon: '/favicon.ico',
      ogImage: '/og-image.jpg',
    },
    components: {
      // Version en sidebar del admin
      afterNavLinks: [
        {
          path: '/version-info',
          Component: () => (
            <div style={{ padding: '1rem', fontSize: '12px', color: '#666' }}>
              <div>OVI CMS</div>
              <div style={{ fontFamily: 'monospace' }}>v{version}</div>
              <div style={{ color: '#999', marginTop: '0.25rem' }}>
                {process.env.GIT_HASH?.substring(0, 7) || 'dev'}
              </div>
            </div>
          )
        }
      ]
    }
  }
})
```

---

## 🔐 Protección de Secrets

### ❌ NUNCA Hacer

```typescript
// ❌ PELIGRO: Hardcodear API keys
const apiKey = 'sk-ant-api03-1234567890abcdef'

// ❌ PELIGRO: Commitear .env
git add .env
git commit -m "Add environment variables"

// ❌ PELIGRO: Exponer en frontend
const config = {
  anthropicKey: process.env.ANTHROPIC_API_KEY  // Se incluye en bundle JS
}

// ❌ PELIGRO: Logs con secrets
console.log('API Key:', process.env.STRIPE_SECRET_KEY)

// ❌ PELIGRO: Error messages con secrets
throw new Error(`Failed to connect with key: ${apiKey}`)
```

### ✅ Buenas Prácticas

#### 1. .env (Local Development)

```bash
# .env (NUNCA commitear)

# ✅ Backend secrets (Payload CMS)
DATABASE_URI=postgresql://user:password@localhost:5432/db
PAYLOAD_SECRET=CAMBIAR_EN_PRODUCCION_openssl_rand_base64_32
JWT_SECRET=CAMBIAR_EN_PRODUCCION_openssl_rand_base64_32

# ✅ APIs externas
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ✅ URLs públicas (OK exponer)
PUBLIC_PAYLOAD_API_URL=http://localhost:3000
PUBLIC_SITE_URL=http://localhost:4321

# ✅ Flags de entorno
NODE_ENV=development
```

#### 2. .env.example (Template para otros devs)

```bash
# .env.example (SÍ commitear)

# Database
DATABASE_URI=postgresql://user:password@localhost:5432/ovitality_dev

# Payload CMS
PAYLOAD_SECRET=GENERAR_CON_openssl_rand_-base64_32
JWT_SECRET=GENERAR_CON_openssl_rand_-base64_32

# AI APIs (opcional)
# ANTHROPIC_API_KEY=sk-ant-api03-...
# OPENAI_API_KEY=sk-...

# Payment (opcional)
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...

# URLs (local development)
PUBLIC_PAYLOAD_API_URL=http://localhost:3000
PUBLIC_SITE_URL=http://localhost:4321
```

#### 3. .gitignore (CRÍTICO)

```bash
# .gitignore

# ✅ OBLIGATORIO - Secrets
.env
.env.local
.env.*.local

# ✅ OBLIGATORIO - Archivos sensibles
*.key
*.pem
*.p12
secrets/
credentials.json

# ✅ Node
node_modules/
.pnpm-store/
dist/
build/

# ✅ IDEs
.vscode/
.idea/
*.swp
*.swo

# ✅ OS
.DS_Store
Thumbs.db
```

#### 4. Validación en Startup

```typescript
// apps/cms/src/server.ts

import dotenv from 'dotenv'
dotenv.config()

const REQUIRED_SECRETS = [
  'DATABASE_URI',
  'PAYLOAD_SECRET',
  'JWT_SECRET',
]

const OPTIONAL_SECRETS = [
  'ANTHROPIC_API_KEY',
  'OPENAI_API_KEY',
  'STRIPE_SECRET_KEY',
]

// Validar secrets requeridos
for (const secret of REQUIRED_SECRETS) {
  if (!process.env[secret]) {
    console.error(`❌ ERROR: Variable de entorno requerida no encontrada: ${secret}`)
    console.error('   Por favor, copia .env.example a .env y configura los valores')
    process.exit(1)
  }
}

// Advertir sobre secrets opcionales
for (const secret of OPTIONAL_SECRETS) {
  if (!process.env[secret]) {
    console.warn(`⚠️ WARNING: ${secret} no configurada (funcionalidad limitada)`)
  }
}

// Validar que secrets tengan longitud mínima
if (process.env.PAYLOAD_SECRET!.length < 32) {
  console.error('❌ ERROR: PAYLOAD_SECRET debe tener al menos 32 caracteres')
  console.error('   Genera uno con: openssl rand -base64 32')
  process.exit(1)
}

console.log('✅ Todas las variables de entorno requeridas están configuradas')
```

#### 5. Sanitización de Logs

```typescript
// packages/utils/src/logger.ts

export function sanitizeLog(data: any): any {
  const SENSITIVE_KEYS = [
    'password',
    'secret',
    'token',
    'apiKey',
    'api_key',
    'authorization',
    'cookie',
  ]

  if (typeof data !== 'object' || data === null) {
    return data
  }

  const sanitized = { ...data }

  for (const key of Object.keys(sanitized)) {
    const lowerKey = key.toLowerCase()

    // Redactar campos sensibles
    if (SENSITIVE_KEYS.some(sensitive => lowerKey.includes(sensitive))) {
      sanitized[key] = '***REDACTED***'
    }

    // Recursivo para objetos anidados
    if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeLog(sanitized[key])
    }
  }

  return sanitized
}

// Uso:
console.log('User data:', sanitizeLog(user))
// Output: { email: "user@example.com", password: "***REDACTED***" }
```

#### 6. API Key Rotation

```typescript
// apps/cms/src/collections/Users.ts

{
  name: 'apiKeys',
  type: 'array',
  admin: {
    description: 'API keys para integración con servicios externos',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Nombre descriptivo (ej: "Anthropic API - Production")',
      },
    },
    {
      name: 'key',
      type: 'text',
      required: true,
      admin: {
        description: 'La API key completa',
        components: {
          Field: () => (
            <input
              type="password"
              autoComplete="new-password"
              // ✅ Nunca mostrar key completa
            />
          )
        }
      },
      access: {
        read: ({ req }) => req.user?.role === 'admin',  // Solo admins pueden leer
      },
    },
    {
      name: 'lastUsed',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      admin: {
        description: 'Fecha de expiración (para rotación automática)',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
```

---

## 🔍 Auditoría de Secrets

### Script de Detección

```bash
#!/bin/bash
# scripts/audit-secrets.sh

echo "🔍 Auditando código en busca de secrets expuestos..."

# Patrones peligrosos
PATTERNS=(
  "sk-ant-api"           # Anthropic API keys
  "sk-[A-Za-z0-9]{48}"   # OpenAI API keys
  "sk_live_"             # Stripe live keys
  "ghp_"                 # GitHub Personal Access Tokens
  "AKIA[0-9A-Z]{16}"     # AWS Access Keys
  "AIza[0-9A-Za-z-_]{35}" # Google API Keys
)

FOUND_ISSUES=0

for pattern in "${PATTERNS[@]}"; do
  echo "  Buscando: $pattern"

  # Buscar en código (excluir node_modules, dist, .git)
  RESULTS=$(grep -r -E "$pattern" \
    --exclude-dir=node_modules \
    --exclude-dir=dist \
    --exclude-dir=build \
    --exclude-dir=.git \
    --exclude-dir=.next \
    --exclude="*.lock" \
    . 2>/dev/null)

  if [ ! -z "$RESULTS" ]; then
    echo "❌ PELIGRO: Posible secret encontrado:"
    echo "$RESULTS"
    FOUND_ISSUES=$((FOUND_ISSUES + 1))
  fi
done

if [ $FOUND_ISSUES -gt 0 ]; then
  echo ""
  echo "❌ AUDITORÍA FALLIDA: $FOUND_ISSUES secretos potenciales encontrados"
  echo "   Revisa los archivos arriba y elimina los secrets antes de commitear"
  exit 1
else
  echo ""
  echo "✅ AUDITORÍA PASADA: No se encontraron secrets expuestos"
  exit 0
fi
```

### Pre-commit Hook

```bash
#!/bin/bash
# .husky/pre-commit

echo "🔐 Ejecutando auditoría de secrets..."

# Ejecutar script de auditoría
./scripts/audit-secrets.sh

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ COMMIT BLOQUEADO: Se encontraron secrets expuestos"
  echo "   Por favor, elimina los secrets y vuelve a intentar"
  exit 1
fi

echo "✅ Auditoría de secrets pasada"
```

---

## 📊 Dashboard de Versiones

### Admin Panel Component

```typescript
// apps/cms/src/components/VersionDashboard.tsx

import React, { useEffect, useState } from 'react'
import { version } from '../../../../package.json'

interface VersionInfo {
  frontend: string
  backend: string
  database: string
  node: string
  gitHash: string
  buildDate: string
  environment: string
}

export const VersionDashboard: React.FC = () => {
  const [info, setInfo] = useState<VersionInfo | null>(null)

  useEffect(() => {
    fetch('/api/version')
      .then(res => res.json())
      .then(setInfo)
  }, [])

  if (!info) return <div>Cargando...</div>

  return (
    <div className="version-dashboard">
      <h2>System Information</h2>

      <table>
        <tbody>
          <tr>
            <td><strong>Frontend Version</strong></td>
            <td className="font-mono">{info.frontend}</td>
          </tr>
          <tr>
            <td><strong>Backend Version</strong></td>
            <td className="font-mono">{info.backend}</td>
          </tr>
          <tr>
            <td><strong>Database Version</strong></td>
            <td className="font-mono">{info.database}</td>
          </tr>
          <tr>
            <td><strong>Node.js Version</strong></td>
            <td className="font-mono">{info.node}</td>
          </tr>
          <tr>
            <td><strong>Git Hash</strong></td>
            <td className="font-mono">{info.gitHash}</td>
          </tr>
          <tr>
            <td><strong>Build Date</strong></td>
            <td>{info.buildDate}</td>
          </tr>
          <tr>
            <td><strong>Environment</strong></td>
            <td>
              <span className={info.environment === 'production' ? 'badge-prod' : 'badge-dev'}>
                {info.environment}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
```

### Version Endpoint

```typescript
// apps/cms/src/endpoints/version.ts

import { version } from '../../../package.json'
import { Endpoint } from 'payload/config'

export const versionEndpoint: Endpoint = {
  path: '/version',
  method: 'get',
  handler: async (req, res) => {
    // Solo admins pueden ver info del sistema
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' })
    }

    // Obtener versión de PostgreSQL
    const dbVersion = await req.payload.db.pool.query('SELECT version()')

    res.json({
      frontend: version,
      backend: version,
      database: dbVersion.rows[0].version.split(' ')[1],
      node: process.version,
      gitHash: process.env.GIT_HASH || 'dev',
      buildDate: process.env.BUILD_DATE || new Date().toISOString(),
      environment: process.env.NODE_ENV,
    })
  },
}
```

---

## 📋 Checklist de Seguridad

### Antes de Commit

- [ ] No hay archivos `.env` staged
- [ ] Script `audit-secrets.sh` pasando
- [ ] No hay `console.log` con datos sensibles
- [ ] API keys solo en variables de entorno
- [ ] Secrets nunca en error messages

### Antes de Deploy

- [ ] Variables de entorno configuradas en plataforma (Vercel/VPS)
- [ ] Secrets rotados (no usar las de development)
- [ ] `PAYLOAD_SECRET` generado con `openssl rand -base64 32`
- [ ] CORS configurado correctamente (no `*`)
- [ ] HTTPS forzado
- [ ] Version visible en footer

### Monitoreo Continuo

- [ ] Configurar alertas de rotación de API keys (cada 90 días)
- [ ] Revisar logs en busca de secretos expuestos
- [ ] Auditoría trimestral de variables de entorno
- [ ] Revocar keys antiguas después de rotación

---

## 🚀 CI/CD Integration

### GitHub Actions - Version Injection

```yaml
# .github/workflows/deploy.yml

name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Inject Version Info
        run: |
          echo "VITE_GIT_HASH=${{ github.sha }}" >> $GITHUB_ENV
          echo "VITE_BUILD_DATE=$(date -u +%Y-%m-%d)" >> $GITHUB_ENV

      - name: Build
        run: pnpm run build
        env:
          # ✅ Secrets desde GitHub Secrets (NUNCA hardcoded)
          DATABASE_URI: ${{ secrets.DATABASE_URI }}
          PAYLOAD_SECRET: ${{ secrets.PAYLOAD_SECRET }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

**Última actualización:** 2025-12-06
**Versión del documento:** 1.0.0
**Próxima revisión:** Con cada release major
