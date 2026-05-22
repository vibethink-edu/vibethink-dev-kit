# SEO Documentation

## Overview
The application uses `react-helmet-async` to manage document head rendering, enabling dynamic SEO meta tags (title, description, OpenGraph, Twitter Cards) for each page within the Single Page Application (SPA) architecture.

## How it Works
1. **HelmetProvider**: The entire application is wrapped in a `<HelmetProvider>` in `index.tsx`.
2. **SEO Component**: A reusable `<SEO />` component (`components/SEO.tsx`) abstracts the complex meta tag logic.
3. **Usage**: Each page component imports and renders `<SEO />` with page-specific data.

## SEO Component API
The `SEO` component accepts the following props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | (Required) | The page title. Will be rendered as "Title \| OVI". |
| `description` | string | (Required) | The meta description for search engines. |
| `type` | string | 'website' | OpenGraph type (e.g., 'article', 'website'). |
| `image` | string | '/logo.png' | URL of the image used for social sharing cards. |
| `url` | string | window.location | Canonical URL of the page. |

## Implementation Guide

To add SEO to a new page:

1. Import the component and language hook:
   ```tsx
   import SEO from '../components/SEO';
   import { useLanguage } from '../contexts/LanguageContext';
   ```

2. Get translation helpers:
   ```tsx
   const { t } = useLanguage();
   ```

3. Add the `<SEO />` component as the **first child** of your main wrapper (e.g., inside `motion.div`):
   ```tsx
   <motion.div ...>
       <SEO 
           title={t.newPage.title}
           description={t.newPage.description}
       />
       {/* Rest of the page content */}
   </motion.div>
   ```

## Best Practices
- **Titles**: Keep them under 60 characters.
- **Descriptions**: Keep them under 160 characters.
- **i18n**: Always use `t.xxx` keys for titles and descriptions to ensure the correct language is shown.
- **SSR**: While this is an SPA, these tags are crucial for Googlebot. For 100% improved social sharing previews (e.g., WhatsApp), consider Server Side Rendering (Next.js) or Prerendering services in the future.
