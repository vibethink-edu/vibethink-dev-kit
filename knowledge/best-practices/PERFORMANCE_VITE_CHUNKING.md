# Performance & Best Practices

## Bundle Optimization
We use **Vite** + **Rollup** for bundling. To ensure fast load times and efficient caching, we implement a granular **Code Splitting** strategy.

### Why split chunks?
1.  **Cacheability**: If you change your application code, the user doesn't need to re-download the massive `react` or `framer-motion` libraries (which change rarely).
2.  **Parallel Loading**: Modern browsers can download multiple small files faster than one giant file.

### Current Strategy (`vite.config.ts`)
We separate dependencies into logical groups using `manualChunks`:

-   **`react-vendor`**: Core framework (`react`, `react-dom`, `react-router-dom`, `react-helmet-async`). Stable, rarely changes.
-   **`animation-vendor`**: Animation libraries (`framer-motion`). Heavy, distinct responsibility.
-   **`ui-vendor`**: UI utilities (`lucide-react`, `date-fns`). Helpers.

## Best Practices for Development

### 1. Lazy Loading Routes
For pages that are not immediately visible (like `Terms`, `Privacy`, or deep detail pages), use `React.lazy()` to load them only when requested.

```tsx
// Instead of: import Terms from './pages/Terms';
const Terms = React.lazy(() => import('./pages/Terms'));
```

### 2. Import Specifics
Avoid importing entire libraries if possible.
*   **Good**: `import { format } from 'date-fns'` (date-fns is tree-shakeable, so this is fine).
*   **Bad**: Importing a massive utility library like `lodash` entirely without checking if it supports tree-shaking.

### 3. Image Optimization
*   Use `.webp` formats when possible.
*   Compressed videos (H.264, optimized bitrate).
*   Lazy load off-screen images (`loading="lazy"`).

### 4. Tailwind Usage
Since we use Tailwind via CDN for development speed (currently), verify that unused styles are not bloating the experience. *Note: Migrating to PostCSS build step is recommended for production to purge unused CSS.*
