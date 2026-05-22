"use client";

/**
 * BunduiPremiumDashboard - VThink 1.0 Integration
 * 
 * Dashboard premium de exploración completa que muestra todos los componentes
 * premium de Bundui disponibles para VibeThink.
 */

import React, { useState } from 'react';
import { 
  BunduiPremiumProvider, 
  PremiumComponentWrapper,
  useBunduiPremium 
} from './BunduiPremiumProvider';

// Componentes Bundui UI (solo los que existen)
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Progress } from './components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from './components/ui/dropdown-menu';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Switch } from './components/ui/switch';
import { Slider } from './components/ui/slider';
import { Checkbox } from './components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from './components/ui/radio-group';
import { Textarea } from './components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Skeleton } from './components/ui/skeleton';
import { Separator } from './components/ui/separator';
import { Alert, AlertDescription } from './components/ui/alert';

// Componentes especializados Bundui (solo los que existen y exportan correctamente)
import { DateTimePicker } from './components/date-time-picker';
import CustomDateRangePicker from './components/custom-date-range-picker';
import { ExportButton as CardActionMenus } from './components/CardActionMenus';
import Icon from './components/icon';
import ActiveTheme from './components/ActiveTheme';

// Componentes de Dashboard con Charts
import { RevenueChart } from '@/shared/components/dashboard/RevenueChart';
import { MetricCard } from '@/shared/components/dashboard/MetricCard';

// Importaciones de React para componentes client-side

// Mock de useAuth para demo
const mockUseAuth = () => ({
  user: { id: '1', email: 'demo@vthink.com', profile: { role: 'ADMIN' } },
  isAuthenticated: true,
  loading: false,
  hasPermission: () => true
});

// Mock de useBunduiPremium para demo
const mockUseBunduiPremium = () => ({
  isPremiumEnabled: true,
  theme: 'light'
});

/**
 * Componente principal del dashboard premium de exploración
 */
const BunduiPremiumDashboard: React.FC = () => {
  const { user, hasPermission } = mockUseAuth();
  const { isPremiumEnabled, theme } = mockUseBunduiPremium();
  const [activeTab, setActiveTab] = useState('overview');
  const [sliderValue, setSliderValue] = useState([50]);
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [radioValue, setRadioValue] = useState('option1');
  const [selectValue, setSelectValue] = useState('');
  const [switchValue, setSwitchValue] = useState(false);
  const [textareaValue, setTextareaValue] = useState('');
  const [inputValue, setInputValue] = useState('');

  // Verificar permisos premium
  if (typeof hasPermission === 'function' ? !hasPermission() : false) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Acceso Premium Requerido
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Necesitas permisos de administrador para acceder al dashboard premium.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              🎨 Bundui Premium Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Explorador completo de componentes premium integrados
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              ✅ Premium Activo
            </Badge>
            <Badge variant="secondary">
              Tema: {theme}
            </Badge>
          </div>
        </div>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Estado de Integración Premium
              <Badge variant="outline" className="animate-pulse">
                LIVE
              </Badge>
            </CardTitle>
            <CardDescription>
              Estado actual de los componentes premium de Bundui integrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Componentes UI</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="default">45+ Componentes</Badge>
                  <span className="text-sm text-muted-foreground">Disponibles</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Theme System</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Activo</Badge>
                  <span className="text-sm text-muted-foreground">Tema: {theme}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Premium Features</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    ✅ Habilitado
                  </Badge>
                  <span className="text-sm text-muted-foreground">Usuario: {user?.email}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs de exploración */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="charts">📊 Charts</TabsTrigger>
            <TabsTrigger value="ui">Componentes UI</TabsTrigger>
            <TabsTrigger value="forms">Formularios</TabsTrigger>
            <TabsTrigger value="advanced">Avanzados</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Métricas principales con charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <MetricCard 
                title="Total Revenue" 
                value="$45,231.89" 
                subtitle="+20.1% from last month" 
                subtitleColor="text-green-600" 
              />
              <MetricCard 
                title="Subscriptions" 
                value="+2,350" 
                subtitle="+180.1% from last month" 
                subtitleColor="text-green-600" 
              />
              <MetricCard 
                title="Sales" 
                value="+12,234" 
                subtitle="+19% from last month" 
                subtitleColor="text-green-600" 
              />
              <MetricCard 
                title="Active Now" 
                value="+573" 
                subtitle="+201 since last hour" 
                subtitleColor="text-green-600" 
              />
            </div>

            {/* Charts y componentes principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="col-span-1">
                <RevenueChart />
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📊 Progress Overview</CardTitle>
                  <CardDescription>Indicadores de rendimiento del sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>CPU Usage</span>
                        <span>75%</span>
                      </div>
                      <Progress value={75} className="w-full" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Memory</span>
                        <span>45%</span>
                      </div>
                      <Progress value={45} className="w-full" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Storage</span>
                        <span>60%</span>
                      </div>
                      <Progress value={60} className="w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Componentes adicionales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🎨 Temas</CardTitle>
                  <CardDescription>Sistema de temas integrado</CardDescription>
                </CardHeader>
                <CardContent>
                  <ActiveTheme />
                  <div className="mt-4">
                    <Badge variant="outline">Tema actual: {theme}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📅 Date Picker</CardTitle>
                  <CardDescription>Selector de fechas avanzado</CardDescription>
                </CardHeader>
                <CardContent>
                  <DateTimePicker 
                    date={new Date()}
                    setDate={() => {}}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📈 Quick Stats</CardTitle>
                  <CardDescription>Estadísticas rápidas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Users</span>
                      <Badge>1,234</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">New Orders</span>
                      <Badge variant="secondary">87</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pending</span>
                      <Badge variant="outline">23</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Charts Tab */}
          <TabsContent value="charts" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>📊 Revenue Chart (Bar)</CardTitle>
                  <CardDescription>Gráfico de barras con datos de ingresos</CardDescription>
                </CardHeader>
                <CardContent>
                  <RevenueChart />
                </CardContent>
              </Card>

              {/* Line Chart Example */}
              <Card>
                <CardHeader>
                  <CardTitle>📈 Line Chart Example</CardTitle>
                  <CardDescription>Gráfico de líneas con datos de ejemplo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <div className="rounded-xl bg-white dark:bg-neutral-900 shadow-sm p-6">
                      <h3 className="text-lg font-medium mb-4">Users Growth</h3>
                      <div className="h-32 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">📈</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            Chart de líneas: 400 → 900 usuarios
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            Jan-Jun Growth Trend
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mixed Metrics */}
              <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                  <CardTitle>📊 Complete Dashboard Metrics</CardTitle>
                  <CardDescription>Combinación de métricas y gráficos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <MetricCard 
                      title="Total Users" 
                      value="54,231" 
                      subtitle="+12.5% from last month" 
                      subtitleColor="text-blue-600" 
                    />
                    <MetricCard 
                      title="Active Sessions" 
                      value="3,421" 
                      subtitle="+5.2% from yesterday" 
                      subtitleColor="text-green-600" 
                    />
                    <MetricCard 
                      title="Bounce Rate" 
                      value="2.4%" 
                      subtitle="-0.8% from last week" 
                      subtitleColor="text-red-600" 
                    />
                    <MetricCard 
                      title="Conversion" 
                      value="8.7%" 
                      subtitle="+2.1% from last month" 
                      subtitleColor="text-green-600" 
                    />
                  </div>
                  
                  <div className="h-64 bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-blue-900 dark:via-gray-800 dark:to-green-900 rounded-lg p-6">
                    <div className="h-full flex items-end justify-between gap-4">
                      {/* Desktop Bar */}
                      <div className="flex flex-col items-center flex-1">
                        <div className="w-12 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg" style={{height: '60%'}}></div>
                        <div className="text-xs font-semibold mt-2 text-blue-600">4,000</div>
                        <div className="text-xs text-gray-500">Desktop</div>
                      </div>
                      
                      {/* Mobile Bar */}
                      <div className="flex flex-col items-center flex-1">
                        <div className="w-12 bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg" style={{height: '45%'}}></div>
                        <div className="text-xs font-semibold mt-2 text-green-600">3,000</div>
                        <div className="text-xs text-gray-500">Mobile</div>
                      </div>
                      
                      {/* Tablet Bar */}
                      <div className="flex flex-col items-center flex-1">
                        <div className="w-12 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg" style={{height: '30%'}}></div>
                        <div className="text-xs font-semibold mt-2 text-purple-600">2,000</div>
                        <div className="text-xs text-gray-500">Tablet</div>
                      </div>
                      
                      {/* Other Bar */}
                      <div className="flex flex-col items-center flex-1">
                        <div className="w-12 bg-gradient-to-t from-orange-600 to-orange-400 rounded-t-lg" style={{height: '40%'}}></div>
                        <div className="text-xs font-semibold mt-2 text-orange-600">2,780</div>
                        <div className="text-xs text-gray-500">Other</div>
                      </div>
                    </div>
                    
                    <div className="text-center mt-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        📊 Visitors by Device Type
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* UI Components Tab */}
          <TabsContent value="ui" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Botones */}
              <Card>
                <CardHeader>
                  <CardTitle>Botones</CardTitle>
                  <CardDescription>Variaciones de botones disponibles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="default">Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="destructive">Destructive</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Badges */}
              <Card>
                <CardHeader>
                  <CardTitle>Badges</CardTitle>
                  <CardDescription>Etiquetas y estados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="default">Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Avatar */}
              <Card>
                <CardHeader>
                  <CardTitle>Avatares</CardTitle>
                  <CardDescription>Componentes de usuario</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 items-center">
                    <Avatar>
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <Avatar>
                      <AvatarFallback>VT</AvatarFallback>
                    </Avatar>
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>LG</AvatarFallback>
                    </Avatar>
                  </div>
                </CardContent>
              </Card>

              {/* Skeleton */}
              <Card>
                <CardHeader>
                  <CardTitle>Skeleton</CardTitle>
                  <CardDescription>Estados de carga</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Forms Tab */}
          <TabsContent value="forms" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Input */}
              <Card>
                <CardHeader>
                  <CardTitle>Input</CardTitle>
                  <CardDescription>Campos de entrada</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="input-demo">Texto</Label>
                    <Input 
                      id="input-demo" 
                      placeholder="Ingresa tu texto" 
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="textarea-demo">Textarea</Label>
                    <Textarea 
                      id="textarea-demo" 
                      placeholder="Escribe tu mensaje"
                      value={textareaValue}
                      onChange={(e) => setTextareaValue(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Controls */}
              <Card>
                <CardHeader>
                  <CardTitle>Controles</CardTitle>
                  <CardDescription>Switches, checkboxes y sliders</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="switch-demo" 
                      checked={switchValue}
                      onCheckedChange={setSwitchValue}
                    />
                    <Label htmlFor="switch-demo">Switch</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                      <Checkbox 
                      id="checkbox-demo"
                      checked={checkboxValue}
                      onCheckedChange={(v) => setCheckboxValue(v === true)}
                    />
                    <Label htmlFor="checkbox-demo">Checkbox</Label>
                  </div>

                  <div className="space-y-2">
                    <Label>Slider: {sliderValue[0]}</Label>
                    <Slider
                      value={sliderValue}
                      onValueChange={setSliderValue}
                      max={100}
                      step={1}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Select & Radio */}
              <Card>
                <CardHeader>
                  <CardTitle>Selección</CardTitle>
                  <CardDescription>Select y Radio Group</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Select</Label>
                    <Select value={selectValue} onValueChange={setSelectValue}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una opción" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="option1">Opción 1</SelectItem>
                        <SelectItem value="option2">Opción 2</SelectItem>
                        <SelectItem value="option3">Opción 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Radio Group</Label>
                    <RadioGroup value={radioValue} onValueChange={setRadioValue}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="option1" id="r1" />
                        <Label htmlFor="r1">Opción 1</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="option2" id="r2" />
                        <Label htmlFor="r2">Opción 2</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-4">
            <div className="grid grid-cols-1 gap-6">
              {/* Date Range Picker */}
              <Card>
                <CardHeader>
                  <CardTitle>Date Range Picker</CardTitle>
                  <CardDescription>Selector de rango de fechas avanzado</CardDescription>
                </CardHeader>
                <CardContent>
                  <CustomDateRangePicker />
                </CardContent>
              </Card>

              {/* Card Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Card Actions</CardTitle>
                  <CardDescription>Acciones avanzadas para tarjetas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <CardActionMenus />
                  </div>
                </CardContent>
              </Card>

              {/* Alert */}
              <Alert>
                <Icon name="info" className="h-4 w-4" />
                <AlertDescription>
                  Este dashboard muestra todos los componentes premium de Bundui integrados 
                  exitosamente en VThink 1.0. Todos los componentes están funcionando correctamente.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>
      </div>
  );
};

export default BunduiPremiumDashboard;

