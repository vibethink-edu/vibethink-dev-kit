# Guía de Integración de Datos - VThink 1.0

## ⚠️ REGLAS CRÍTICAS - NUNCA VIOLAR

### 🚫 Dashboard Principal - ZONA PROHIBIDA
```bash
# NUNCA TOCAR ESTOS ARCHIVOS:
src/shared/components/bundui-premium/components/ShadcnDashboardComplete.tsx
src/shared/components/bundui-premium/components/layout/BunduiCompleteLayout.tsx

# Dashboard principal permanece:
- Usando BunduiCompleteLayout
- Con datos mock/estáticos
- Como referencia visual
- INTOCABLE para siempre
```

### 🛡️ Multi-tenant Security - OBLIGATORIO
```typescript
// ✅ SIEMPRE filtrar por company_id
const fetchSalesData = async (userId: string) => {
  const { data } = await supabase
    .from('sales')
    .select('*')
    .eq('company_id', user.company_id)  // ← NUNCA OMITIR
    .eq('user_id', userId);
  
  return data;
};

// ❌ NUNCA hacer queries sin company_id
const fetchSalesData = async () => {
  const { data } = await supabase
    .from('sales')
    .select('*');  // ← VIOLACIÓN DE SEGURIDAD
  
  return data;
};
```

### 📁 Estructura de Archivos - MANTENER
```
apps/dashboard/app/[dashboard-name]/
├── page.tsx                    # ← Página principal (usa DashboardLayout)
├── components/                 # ← Componentes específicos del dashboard
│   ├── [Dashboard]Header.tsx   # ← Header personalizado
│   ├── [Dashboard]Content.tsx  # ← Contenido principal
│   ├── [Dashboard]Charts.tsx   # ← Gráficos específicos
│   └── [Dashboard]Table.tsx    # ← Tablas de datos
├── hooks/                      # ← Hooks para datos
│   ├── use[Dashboard]Data.ts   # ← Hook principal de datos
│   ├── use[Dashboard]Filters.ts # ← Hook para filtros
│   └── use[Dashboard]Export.ts # ← Hook para exportación
├── types/                      # ← Types específicos
│   └── [dashboard].types.ts    # ← Interfaces y tipos
└── utils/                      # ← Utilities específicas
    └── [dashboard].utils.ts    # ← Funciones helper
```

## 🔄 Patrón de Integración de Datos

### 1. Hook de Datos Estándar
```typescript
// apps/dashboard/app/sales-dashboard/hooks/useSalesData.ts
import { useState, useEffect } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { supabase } from '@/shared/integrations/supabase/client';

export interface SalesData {
  id: string;
  company_id: string;
  amount: number;
  date: string;
  customer: string;
  status: 'pending' | 'completed' | 'cancelled';
}

export const useSalesData = (filters?: SalesFilters) => {
  const [data, setData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.company_id) return;

      try {
        setLoading(true);
        
        let query = supabase
          .from('sales')
          .select('*')
          .eq('company_id', user.company_id);

        // Aplicar filtros
        if (filters?.dateRange) {
          query = query
            .gte('date', filters.dateRange.from)
            .lte('date', filters.dateRange.to);
        }

        if (filters?.status) {
          query = query.eq('status', filters.status);
        }

        const { data: salesData, error } = await query
          .order('date', { ascending: false })
          .limit(100);

        if (error) throw error;

        setData(salesData || []);
      } catch (err) {
        setError(err.message);
        console.error('Sales data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.company_id, filters]);

  return { data, loading, error, refetch: fetchData };
};
```

### 2. Componente de Dashboard
```typescript
// apps/dashboard/app/sales-dashboard/page.tsx
'use client';

import DashboardLayout from '@/shared/components/bundui-premium/components/layout/DashboardLayout';
import { SalesHeader } from './components/SalesHeader';
import { SalesCharts } from './components/SalesCharts';
import { SalesTable } from './components/SalesTable';
import { useSalesData } from './hooks/useSalesData';
import { useSalesFilters } from './hooks/useSalesFilters';

export default function SalesDashboardPage() {
  const { filters, updateFilters } = useSalesFilters();
  const { data, loading, error } = useSalesData(filters);

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">Error loading sales data: {error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <SalesHeader 
          totalSales={data.length}
          filters={filters}
          onFiltersChange={updateFilters}
        />
        
        <SalesCharts 
          data={data} 
          loading={loading} 
        />
        
        <SalesTable 
          data={data} 
          loading={loading}
          onRowClick={(sale) => router.push(`/sales/${sale.id}`)}
        />
      </div>
    </DashboardLayout>
  );
}
```

### 3. Real-time Updates
```typescript
// Hook con subscripción real-time
export const useSalesDataRealtime = () => {
  const [data, setData] = useState<SalesData[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.company_id) return;

    // Suscripción real-time
    const subscription = supabase
      .channel('sales_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sales',
          filter: `company_id=eq.${user.company_id}`
        },
        (payload) => {
          console.log('Sales data changed:', payload);
          // Actualizar estado según el tipo de cambio
          if (payload.eventType === 'INSERT') {
            setData(prev => [payload.new as SalesData, ...prev]);
          }
          // ... otros eventos
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.company_id]);

  return { data };
};
```

## 🔒 Seguridad y Validación

### Row Level Security (RLS)
```sql
-- Política para tabla sales
CREATE POLICY "Users can only access their company data" ON sales
FOR ALL USING (company_id = auth.jwt() ->> 'company_id');

-- Política para tabla dashboards
CREATE POLICY "Company isolation" ON dashboard_configs
FOR ALL USING (company_id = (auth.jwt() ->> 'company_id')::uuid);
```

### Validación de Permisos
```typescript
// Hook de permisos
export const usePermissions = () => {
  const { user } = useAuth();
  
  const canViewSales = () => {
    return user?.role && ['ADMIN', 'MANAGER', 'OWNER'].includes(user.role);
  };
  
  const canExportData = () => {
    return user?.role && ['ADMIN', 'OWNER'].includes(user.role);
  };
  
  return { canViewSales, canExportData };
};

// Uso en componente
const SalesDashboard = () => {
  const { canViewSales, canExportData } = usePermissions();
  
  if (!canViewSales()) {
    return <div>No tienes permisos para ver este dashboard</div>;
  }
  
  return (
    <DashboardLayout>
      {/* Dashboard content */}
      {canExportData() && <ExportButton />}
    </DashboardLayout>
  );
};
```

## 📊 Integración con Gráficos

### Recharts con Datos Reales
```typescript
// components/SalesChart.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SalesChartProps {
  data: SalesData[];
  loading: boolean;
}

export const SalesChart: React.FC<SalesChartProps> = ({ data, loading }) => {
  // Procesar datos para el gráfico
  const chartData = useMemo(() => {
    return data.reduce((acc, sale) => {
      const month = format(new Date(sale.date), 'MMM yyyy');
      const existing = acc.find(item => item.month === month);
      
      if (existing) {
        existing.amount += sale.amount;
      } else {
        acc.push({ month, amount: sale.amount });
      }
      
      return acc;
    }, [] as { month: string; amount: number }[]);
  }, [data]);

  if (loading) {
    return <ChartSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventas por Mes</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [`$${value}`, 'Ventas']} />
            <Bar 
              dataKey="amount" 
              fill="hsl(var(--chart-1))"  // ← Usar variables CSS
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
```

## 🚨 Errores Comunes a EVITAR

### ❌ Import Paths Incorrectos
```typescript
// ❌ NUNCA usar estos imports:
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ✅ SIEMPRE usar estos imports:
import { Button } from "@/shared/components/bundui-premium/components/ui/button";
import { cn } from "@/shared/lib/utils";
```

### ❌ Queries Sin Filtros de Compañía
```typescript
// ❌ NUNCA hacer esto:
const allUsers = await supabase.from('users').select('*');

// ✅ SIEMPRE filtrar por company_id:
const companyUsers = await supabase
  .from('users')
  .select('*')
  .eq('company_id', user.company_id);
```

### ❌ Estados No Manejados
```typescript
// ❌ No manejar estados de carga/error:
const { data } = useSalesData();
return <SalesChart data={data} />;

// ✅ Manejar todos los estados:
const { data, loading, error } = useSalesData();

if (loading) return <Skeleton />;
if (error) return <ErrorMessage error={error} />;
if (!data.length) return <EmptyState />;

return <SalesChart data={data} />;
```

### ❌ Modificar Dashboard Principal
```typescript
// ❌ NUNCA tocar:
BunduiCompleteLayout.tsx
ShadcnDashboardComplete.tsx

// ✅ SIEMPRE crear nuevos dashboards usando:
DashboardLayout + navigation.ts
```

## 🔄 Process de Desarrollo

### 1. Planificación
- [ ] Definir estructura de datos en Supabase
- [ ] Crear políticas RLS
- [ ] Planificar permisos por rol
- [ ] Definir filtros y exportaciones

### 2. Desarrollo
- [ ] Crear tipos TypeScript
- [ ] Implementar hook de datos
- [ ] Crear componentes específicos
- [ ] Integrar con DashboardLayout
- [ ] Agregar a navigation.ts

### 3. Testing
- [ ] Probar multi-tenancy (diferentes companies)
- [ ] Validar permisos por rol
- [ ] Testing de performance con datos grandes
- [ ] Verificar real-time updates

### 4. Deployment
- [ ] Migrations de base de datos
- [ ] Verificar imports correctos
- [ ] Testing en producción
- [ ] Monitoreo de errores

## 📋 Checklist de Integración

```markdown
### Pre-desarrollo
- [ ] Dashboard principal INTACTO
- [ ] Estructura de carpetas planificada
- [ ] Base de datos con RLS configurada
- [ ] Tipos TypeScript definidos

### Durante desarrollo
- [ ] Hook de datos implementado
- [ ] Filtrado por company_id en todas las queries
- [ ] Estados de loading/error manejados
- [ ] Componentes responsivos
- [ ] Imports correctos verificados

### Post-desarrollo
- [ ] Navigation.ts actualizado con badge "New"
- [ ] Testing multi-tenant completado
- [ ] Performance optimizada
- [ ] Documentación actualizada
- [ ] Real-time subscriptions funcionando

### Deploy
- [ ] Migraciones aplicadas
- [ ] Políticas RLS verificadas
- [ ] Monitoreo configurado
- [ ] Rollback plan preparado
```

## 🎯 Principios de Diseño

1. **Multi-tenant First**: Toda query debe filtrar por company_id
2. **Security by Default**: RLS + validación de permisos
3. **Performance Conscious**: Paginación, índices, lazy loading
4. **User Experience**: Loading states, error handling, empty states
5. **Maintainable**: Single point of control, tipos estrictos
6. **Scalable**: Real-time updates, caching, optimización

---

**⚠️ RECORDATORIO FINAL**: El dashboard principal (`/`) es SAGRADO. Nunca lo toques, sin importar qué. Es la referencia visual y debe permanecer con datos mock para siempre.

**📞 En caso de dudas**: Consultar este documento antes de hacer cambios. Si algo no está documentado aquí, agregarlo antes de proceder.