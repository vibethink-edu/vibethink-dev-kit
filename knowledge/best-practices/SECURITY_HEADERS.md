# Security Headers & CSP Standards

**Status:** Harvested from `vibethink-orchestrator-main`
**Source:** `src/shared/utils/utils/security/index.ts`
**Category:** Backend Security

## 1. Mandatory Headers

All Next.js applications in VibeThink must implement the following headers in `middleware.ts` or `next.config.js`.

### Configuration Object
```typescript
export const securityHeaders = {
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',

  // Protect against MIME snacking
  'X-Content-Type-Options': 'nosniff',

  // Strict Transport Security (HSTS)
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',

  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions Policy (Lock down hardware access)
  'Permissions-Policy': [
    'geolocation=()',
    'microphone=()',
    'camera=()', // Enable if using Video
    'payment=()',
    'usb=()'
  ].join(', ')
};
```

## 2. Content Security Policy (CSP)

**Strict Mode:** Default to 'self' and whitelist specific CDNs.

```typescript
'Content-Security-Policy': [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval needed for some dev tools
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https:",
  "connect-src 'self' https://your-api.com wss://your-api.com", // Add your API/WebSocket
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'"
].join('; ')
```

## 3. Cache Control for Sensitive Data

For API routes returning user data:

```typescript
'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
'Pragma': 'no-cache',
'Expires': '0'
```
