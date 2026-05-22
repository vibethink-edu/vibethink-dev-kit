# Next.js App Router Structure Template

**Status:** Harvested from `vibethink-orchestrator-main`
**Source:** `external/bundui-premium` (UI Kit Template)
**Category:** Stack Guide

## 1. Directory Structure

VibeThink follows the standard Next.js 15 App Router structure with a clear separation of UI and Logic.

```
src/ (or root project folder)
├── app/
│   ├── (auth)/             # Route Group: Authentication (Login/Register)
│   ├── (dashboard)/        # Route Group: Protected App
│   │   ├── layout.tsx      # Dashboard Shell (Sidebar/Header)
│   │   └── page.tsx        # Main Overview
│   ├── api/                # Route Group: Backend API
│   ├── layout.tsx          # Root Layout (Providers)
│   └── page.tsx            # Landing Page
├── components/
│   ├── ui/                 # Shadcn UI primitives (Button, Input)
│   └── dashboard/          # Feature-specific components
├── lib/
│   ├── utils.ts            # cn() helper
│   └── supabase.ts         # Client factory
└── hooks/
    ├── use-toast.ts        # UI feedback
    └── use-auth.ts         # User session state
```

## 2. Layout Pattern

Wrap your app in global providers in the *root* layout, but keep state local to route groups where possible.

```typescript
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system">
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

## 3. Auth Group Pattern
Use `(auth)` folder to group login/register routes that share a simpler layout (no sidebar).
-   `app/(auth)/layout.tsx`: Centered content container.
-   `app/(auth)/login/page.tsx`: Sign-in form.
