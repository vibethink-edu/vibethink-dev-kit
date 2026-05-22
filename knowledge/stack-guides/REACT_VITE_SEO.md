# React Vite SEO Standards (Helmet)

**Status:** Harvested from `V4-ovi-Portal`
**Category:** Frontend / SEO

## 1. The React Helmet Async Pattern
For Vite-based SPA (Single Page Applications) where Next.js Metadata API is not available, use `react-helmet-async`.

### Component Structure (`SEO.tsx`)
Create a reusable SEO component that accepts metadata overrides.

```tsx
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  name?: string;
  type?: string;
}

export default function SEO({
  title,
  description,
  name = 'VibeThink App',
  type = 'website'
}: SEOProps) {
  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{title ? `${title} | ${name}` : name}</title>
      <meta name="description" content={description} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />

      {/* Twitter Card */}
      <meta name="twitter:creator" content={name} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
}
```

## 2. Usage in Pages
Wrap your page content (or just add it at the top) with the `SEO` component.

```tsx
<SEO
  title="Dashboard"
  description="Manage your orders and voice agents."
/>
```

## 3. Provider Setup (`index.tsx`)
You MUST wrap your entire app in `HelmetProvider`.

```tsx
import { HelmetProvider } from 'react-helmet-async';

<HelmetProvider>
  <App />
</HelmetProvider>
```
