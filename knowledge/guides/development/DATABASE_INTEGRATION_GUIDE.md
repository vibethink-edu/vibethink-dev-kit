# 🗄️ Database Integration Guide - VibeThink Orchestrator

## 📋 Overview

Este documento describe cómo integrar el dashboard con una base de datos real, reemplazando los datos mock actuales.

## ⚠️ Current Status

**Estado Actual:** Usando datos MOCK  
**Base de Datos Objetivo:** Supabase/PostgreSQL  
**Multi-tenancy:** Requerido (company_id filtering)  
**Autenticación:** Supabase Auth  

## 🔄 Migration Steps

### 1. Setup Database Schema

```sql
-- Companies table (multi-tenancy)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'EMPLOYEE',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Metrics table
CREATE TABLE metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  metric_type VARCHAR(50) NOT NULL,
  value DECIMAL(15,2) NOT NULL,
  change_percentage DECIMAL(5,2),
  period VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'processing',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Create Database Hooks

```typescript
// src/shared/hooks/useMetrics.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useMetrics(companyId: string) {
  return useQuery({
    queryKey: ['metrics', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('metrics')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!companyId
  });
}

// src/shared/hooks/useTeamMembers.ts
export function useTeamMembers(companyId: string) {
  return useQuery({
    queryKey: ['team-members', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!companyId
  });
}

// src/shared/hooks/usePayments.ts
export function usePayments(companyId: string) {
  return useQuery({
    queryKey: ['payments', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: !!companyId
  });
}
```

### 3. Update Dashboard Page

```typescript
// apps/dashboard/app/page.tsx
"use client";

import { useAuth } from '@/shared/hooks/useAuth';
import { useMetrics } from '@/shared/hooks/useMetrics';
import { useTeamMembers } from '@/shared/hooks/useTeamMembers';
import { usePayments } from '@/shared/hooks/usePayments';

export default function DashboardPage() {
  const { user } = useAuth();
  
  // Replace mock data with real database hooks
  const { data: metrics, isLoading: metricsLoading } = useMetrics(user?.company_id);
  const { data: teamMembers, isLoading: teamLoading } = useTeamMembers(user?.company_id);
  const { data: payments, isLoading: paymentsLoading } = usePayments(user?.company_id);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Layout variant="dashboard">
      {/* Same UI structure, but with real data */}
    </Layout>
  );
}
```

### 4. Authentication Integration

```typescript
// src/shared/hooks/useAuth.ts
import { useSession } from '@supabase/auth-helpers-react';

export function useAuth() {
  const session = useSession();
  
  return {
    user: session?.user,
    company_id: session?.user?.user_metadata?.company_id,
    isAuthenticated: !!session,
    isLoading: !session
  };
}
```

### 5. API Routes (Optional)

```typescript
// apps/dashboard/app/api/metrics/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  
  const { data: { user } } = await supabase.auth.getUser();
  const companyId = user?.user_metadata?.company_id;
  
  const { data, error } = await supabase
    .from('metrics')
    .select('*')
    .eq('company_id', companyId);
    
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  
  return Response.json({ data });
}
```

## 🔐 Security Considerations

### 1. Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can only access their company data" ON users
  FOR ALL USING (company_id = auth.jwt() ->> 'company_id');

CREATE POLICY "Metrics company isolation" ON metrics
  FOR ALL USING (company_id = auth.jwt() ->> 'company_id');

CREATE POLICY "Payments company isolation" ON payments
  FOR ALL USING (company_id = auth.jwt() ->> 'company_id');
```

### 2. Authentication Middleware

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  return res;
}
```

## 📊 Data Migration

### 1. Seed Data

```typescript
// scripts/seed-data.ts
import { supabase } from '@/integrations/supabase/client';

async function seedData() {
  // Create test company
  const { data: company } = await supabase
    .from('companies')
    .insert({ name: 'Test Company' })
    .select()
    .single();

  // Create test users
  await supabase.from('users').insert([
    {
      company_id: company.id,
      email: 'toby@example.com',
      name: 'Toby Belhome',
      role: 'Viewer'
    },
    // ... more users
  ]);

  // Create test metrics
  await supabase.from('metrics').insert([
    {
      company_id: company.id,
      metric_type: 'subscriptions',
      value: 4850,
      change_percentage: 180.1,
      period: 'from last month'
    },
    // ... more metrics
  ]);
}
```

### 2. Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🧪 Testing

### 1. Unit Tests

```typescript
// tests/hooks/useMetrics.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useMetrics } from '@/shared/hooks/useMetrics';

describe('useMetrics', () => {
  it('should fetch metrics for company', async () => {
    const { result } = renderHook(() => useMetrics('test-company-id'));
    
    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });
  });
});
```

### 2. Integration Tests

```typescript
// tests/integration/dashboard.test.ts
import { render, screen } from '@testing-library/react';
import DashboardPage from '@/app/page';

describe('Dashboard Integration', () => {
  it('should display real metrics from database', async () => {
    render(<DashboardPage />);
    
    await screen.findByText('$15,231.89');
    expect(screen.getByText('+4,850')).toBeInTheDocument();
  });
});
```

## 📈 Performance Optimization

### 1. Query Optimization

```typescript
// Use indexes for better performance
CREATE INDEX idx_metrics_company_id ON metrics(company_id);
CREATE INDEX idx_payments_company_id ON payments(company_id);
CREATE INDEX idx_users_company_id ON users(company_id);
```

### 2. Caching Strategy

```typescript
// Implement React Query for caching
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});
```

## 🚀 Deployment Checklist

- [ ] Database schema created
- [ ] RLS policies configured
- [ ] Authentication middleware implemented
- [ ] Environment variables set
- [ ] Seed data loaded
- [ ] Tests passing
- [ ] Performance optimized
- [ ] Monitoring configured

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Database Integration](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [React Query Best Practices](https://tanstack.com/query/latest/docs/react/guides/best-practices)

---

**Nota:** Este documento debe actualizarse conforme evolucione la integración con la base de datos real. 