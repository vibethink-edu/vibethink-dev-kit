# 🎨 UI Generic Principles - VThink 1.0

## 📋 **PRINCIPIOS FUNDAMENTALES**

### **1. 🏗️ ARQUITECTURA GENÉRICA**

#### **Componentes Reutilizables**
```typescript
// ✅ CORRECTO: Componente genérico
interface GenericCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

// ❌ INCORRECTO: Componente específico
interface RevenueCardProps {
  revenue: number;
  currency: string;
  period: string;
}
```

#### **Patrones de Layout**
```typescript
// ✅ CORRECTO: Layout genérico
<DashboardLayout>
  <div className="space-y-6">
    <HeaderSection />
    <MetricsGrid />
    <ContentSection />
  </div>
</DashboardLayout>

// ❌ INCORRECTO: Layout específico
<RevenueDashboardLayout>
  <RevenueHeader />
  <RevenueMetrics />
  <RevenueContent />
</RevenueDashboardLayout>
```

### **2. 🎯 PRINCIPIOS DE DISEÑO**

#### **Consistencia Visual**
- **Espaciado**: `space-y-6` para secciones principales
- **Grid**: `grid gap-4 md:grid-cols-2 lg:grid-cols-4` para métricas
- **Cards**: Uso consistente de `Card`, `CardHeader`, `CardContent`
- **Tipografía**: Jerarquía clara con `text-3xl`, `text-2xl`, `text-sm`

#### **Responsive Design**
```typescript
// ✅ CORRECTO: Responsive genérico
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  <MetricCard />
  <MetricCard />
  <MetricCard />
  <MetricCard />
</div>

// ❌ INCORRECTO: Responsive específico
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
  <RevenueCard />
  <UsersCard />
  <SalesCard />
  <ActivityCard />
</div>
```

### **3. 🔄 PATRONES DE REUTILIZACIÓN**

#### **Componentes Base**
```typescript
// ✅ CORRECTO: Componente base genérico
export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  trend,
  variant = 'default'
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground">{trend}</p>
        )}
      </CardContent>
    </Card>
  );
};
```

#### **Hooks Genéricos**
```typescript
// ✅ CORRECTO: Hook genérico
export const useMetricData = (metricType: string) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchMetricData(metricType).then(setData);
  }, [metricType]);
  
  return { data, loading };
};

// ❌ INCORRECTO: Hook específico
export const useRevenueData = () => {
  const [revenue, setRevenue] = useState(0);
  // Lógica específica para revenue
};
```

### **4. 🎨 SISTEMA DE TEMAS GENÉRICO**

#### **Variables CSS Genéricas**
```css
/* ✅ CORRECTO: Variables genéricas */
:root {
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96%;
  --accent: 210 40% 96%;
  --muted: 210 40% 96%;
  --border: 214.3 31.8% 91.4%;
  --radius: 0.5rem;
  --scale: 1rem;
}

/* ❌ INCORRECTO: Variables específicas */
:root {
  --revenue-color: #10b981;
  --users-color: #3b82f6;
  --sales-color: #f59e0b;
}
```

#### **Presets de Tema**
```typescript
// ✅ CORRECTO: Presets genéricos
const THEME_PRESETS = [
  { value: 'default', label: 'Default', colors: ['hsl(221.2 83.2% 53.3%)'] },
  { value: 'zinc', label: 'Zinc', colors: ['hsl(240 5% 34%)'] },
  { value: 'slate', label: 'Slate', colors: ['hsl(215 20% 65%)'] },
  // ... más presets genéricos
];

// ❌ INCORRECTO: Presets específicos
const REVENUE_THEMES = [
  { value: 'profit', label: 'Profit', colors: ['#10b981'] },
  { value: 'loss', label: 'Loss', colors: ['#ef4444'] },
];
```

### **5. 📱 PATRONES MOBILE GENÉRICOS**

#### **Sidebar Responsive**
```typescript
// ✅ CORRECTO: Sidebar genérico
const Sidebar = () => {
  const { isMobile, isCollapsed } = useSidebar();
  
  return (
    <aside className={cn(
      "fixed inset-y-0 z-50 flex w-64 flex-col",
      isMobile && "translate-x-0",
      isCollapsed && "w-16"
    )}>
      {/* Contenido genérico */}
    </aside>
  );
};

// ❌ INCORRECTO: Sidebar específico
const RevenueSidebar = () => {
  return (
    <aside className="revenue-sidebar">
      {/* Contenido específico para revenue */}
    </aside>
  );
};
```

#### **Layout Mobile**
```typescript
// ✅ CORRECTO: Layout mobile genérico
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  {/* Cards se adaptan automáticamente */}
</div>

// ❌ INCORRECTO: Layout mobile específico
<div className="revenue-mobile-layout">
  {/* Layout específico para revenue */}
</div>
```

### **6. 🔧 UTILIDADES GENÉRICAS**

#### **Funciones de Formateo**
```typescript
// ✅ CORRECTO: Funciones genéricas
export const formatCurrency = (amount: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};

export const formatPercentage = (value: number) => {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
};

export const formatNumber = (value: number) => {
  return new Intl.NumberFormat('en-US').format(value);
};

// ❌ INCORRECTO: Funciones específicas
export const formatRevenue = (revenue: number) => {
  return `$${revenue.toFixed(2)}`;
};
```

#### **Validaciones Genéricas**
```typescript
// ✅ CORRECTO: Validaciones genéricas
export const validateMetric = (value: any, type: 'number' | 'currency' | 'percentage') => {
  switch (type) {
    case 'number':
      return typeof value === 'number' && !isNaN(value);
    case 'currency':
      return typeof value === 'number' && value >= 0;
    case 'percentage':
      return typeof value === 'number' && value >= -100 && value <= 100;
    default:
      return false;
  }
};

// ❌ INCORRECTO: Validaciones específicas
export const validateRevenue = (revenue: number) => {
  return revenue >= 0;
};
```

### **7. 📊 PATRONES DE DATOS GENÉRICOS**

#### **Interfaces de Datos**
```typescript
// ✅ CORRECTO: Interfaces genéricas
interface MetricData {
  id: string;
  title: string;
  value: number;
  trend?: number;
  icon?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

interface TableData {
  id: string;
  [key: string]: any;
}

// ❌ INCORRECTO: Interfaces específicas
interface RevenueData {
  revenue: number;
  currency: string;
  period: string;
  growth: number;
}
```

#### **Mocks Genéricos**
```typescript
// ✅ CORRECTO: Mocks genéricos
export const generateMockMetrics = (count: number): MetricData[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `metric-${i}`,
    title: `Metric ${i + 1}`,
    value: Math.floor(Math.random() * 10000),
    trend: Math.floor(Math.random() * 100) - 50,
    variant: 'default' as const
  }));
};

// ❌ INCORRECTO: Mocks específicos
export const generateRevenueMocks = () => {
  return {
    revenue: 45231.89,
    growth: 20.1,
    period: 'last month'
  };
};
```

### **8. 🧪 TESTING GENÉRICO**

#### **Tests de Componentes**
```typescript
// ✅ CORRECTO: Tests genéricos
describe('MetricCard', () => {
  it('should render with generic props', () => {
    render(<MetricCard title="Test" value={100} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });
  
  it('should handle different variants', () => {
    const { rerender } = render(
      <MetricCard title="Test" value={100} variant="success" />
    );
    // Test success variant
    
    rerender(<MetricCard title="Test" value={100} variant="error" />);
    // Test error variant
  });
});

// ❌ INCORRECTO: Tests específicos
describe('RevenueCard', () => {
  it('should display revenue correctly', () => {
    render(<RevenueCard revenue={45231.89} />);
    expect(screen.getByText('$45,231.89')).toBeInTheDocument();
  });
});
```

### **9. 📚 DOCUMENTACIÓN GENÉRICA**

#### **Storybook Stories**
```typescript
// ✅ CORRECTO: Stories genéricos
export default {
  title: 'Components/MetricCard',
  component: MetricCard,
  parameters: {
    docs: {
      description: {
        component: 'A generic metric card component for displaying key metrics.'
      }
    }
  }
} as Meta;

export const Default: Story<MetricCardProps> = (args) => (
  <MetricCard {...args} />
);

Default.args = {
  title: 'Total Revenue',
  value: '$45,231.89',
  trend: '+20.1% from last month',
  icon: <DollarSign className="h-4 w-4" />
};

// ❌ INCORRECTO: Stories específicos
export const RevenueCard: Story<RevenueCardProps> = (args) => (
  <RevenueCard {...args} />
);
```

### **10. 🚀 IMPLEMENTACIÓN PRÁCTICA**

#### **Ejemplo de Dashboard Genérico**
```typescript
// ✅ CORRECTO: Dashboard genérico
export default function GenericDashboard() {
  const metrics = useMetrics();
  const tableData = useTableData();
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <HeaderSection title="Dashboard" />
        
        <MetricsGrid>
          {metrics.map(metric => (
            <MetricCard key={metric.id} {...metric} />
          ))}
        </MetricsGrid>
        
        <ContentSection>
          <DataTable data={tableData} />
        </ContentSection>
      </div>
    </DashboardLayout>
  );
}

// ❌ INCORRECTO: Dashboard específico
export default function RevenueDashboard() {
  const revenue = useRevenue();
  const sales = useSales();
  
  return (
    <RevenueLayout>
      <RevenueHeader />
      <RevenueMetrics revenue={revenue} sales={sales} />
      <RevenueTable />
    </RevenueLayout>
  );
}
```

## 🎯 **BENEFICIOS DEL UI GENÉRICO**

### **1. Reutilización**
- Componentes que funcionan en múltiples contextos
- Menos código duplicado
- Mantenimiento más fácil

### **2. Consistencia**
- Experiencia de usuario uniforme
- Patrones de diseño coherentes
- Branding consistente

### **3. Escalabilidad**
- Fácil agregar nuevas funcionalidades
- Componentes que crecen con el proyecto
- Arquitectura que soporta el crecimiento

### **4. Testing**
- Tests más simples y genéricos
- Mejor cobertura de código
- Menos casos edge específicos

### **5. Documentación**
- Patrones claros y documentados
- Onboarding más fácil para nuevos desarrolladores
- Decisiones de diseño justificadas

## 📋 **CHECKLIST DE IMPLEMENTACIÓN**

### **Antes de Crear un Componente:**
- [ ] ¿Existe un componente genérico que pueda reutilizar?
- [ ] ¿Puedo hacer este componente más genérico?
- [ ] ¿Sigue los patrones establecidos?
- [ ] ¿Es responsive por defecto?
- [ ] ¿Soporta temas dinámicos?

### **Al Implementar:**
- [ ] ¿Uso interfaces genéricas?
- [ ] ¿Implemento props opcionales?
- [ ] ¿Sigo la jerarquía de tipografía?
- [ ] ¿Uso el sistema de espaciado consistente?
- [ ] ¿Implemento variantes genéricas?

### **Al Documentar:**
- [ ] ¿Explico el propósito genérico?
- [ ] ¿Proporciono ejemplos de uso?
- [ ] ¿Documento las props y variantes?
- [ ] ¿Incluyo casos de uso comunes?

## 🔄 **MANTENIMIENTO CONTINUO**

### **Revisión Periódica**
- Revisar componentes cada sprint
- Identificar oportunidades de generalización
- Refactorizar componentes específicos a genéricos

### **Evolución del Sistema**
- Agregar nuevos patrones según sea necesario
- Mantener compatibilidad hacia atrás
- Documentar cambios y decisiones

### **Comunicación**
- Compartir principios con el equipo
- Revisar código en PRs
- Mantener documentación actualizada

---

**Este documento debe ser revisado y actualizado regularmente para mantener la consistencia del sistema de UI genérico.** 