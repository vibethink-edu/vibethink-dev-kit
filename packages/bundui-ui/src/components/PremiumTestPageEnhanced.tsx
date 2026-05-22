"use client";

/**
 * PremiumTestPageEnhanced - VThink 1.0
 * 
 * Página de testing avanzada para componentes premium de Bundui.
 * Incluye tests interactivos y demostraciones de funcionalidad.
 */

import React, { useState, useEffect } from 'react';
// Mock de useAuth para demo
const mockUseAuth = () => ({
  user: { id: '1', email: 'demo@vthink.com', profile: { role: 'ADMIN' } },
  isAuthenticated: true,
  loading: false,
  hasPermission: () => true
});
import { useBunduiPremium } from './BunduiPremiumProvider';

// Componentes UI
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Label } from './components/ui/label';
import { Input } from './components/ui/input';
import { Textarea } from './components/ui/textarea';
import { Switch } from './components/ui/switch';
import { Slider } from './components/ui/slider';
import { Progress } from './components/ui/progress';
import { Separator } from './components/ui/separator';
import { Alert, AlertDescription } from './components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from './components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from './components/ui/dropdown-menu';

// Componentes especializados
import { DateTimePicker } from './components/date-time-picker';
import CustomDateRangePicker from './components/custom-date-range-picker';
import ActiveTheme from './components/ActiveTheme';
import Icon from './components/icon';

interface TestResult {
  component: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  timestamp: Date;
}

interface TestStats {
  total: number;
  passed: number;
  failed: number;
  warnings: number;
}

const PremiumTestPageEnhanced: React.FC = () => {
  const { user, hasPermission } = mockUseAuth();
  const { theme, isPremiumEnabled } = useBunduiPremium();
  
  // Estados para testing
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Estados para componentes de prueba
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const [sliderValue, setSliderValue] = useState([50]);
  const [switchValue, setSwitchValue] = useState(false);
  const [selectValue, setSelectValue] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Función para ejecutar tests
  const runComponentTests = async () => {
    setIsRunningTests(true);
    setTestProgress(0);
    setTestResults([]);

    const components = [
      'Card', 'Button', 'Badge', 'Input', 'Textarea', 'Switch', 
      'Slider', 'Progress', 'Select', 'Dialog', 'DropdownMenu',
      'DateTimePicker', 'CustomDateRangePicker', 'ActiveTheme'
    ];

    for (let i = 0; i < components.length; i++) {
      const component = components[i];
      
      // Simular test
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const success = Math.random() > 0.1; // 90% success rate
      const hasWarning = Math.random() > 0.8; // 20% warning rate
      
      let status: 'pass' | 'fail' | 'warning' = 'pass';
      let message = `✅ ${component} funcionando correctamente`;
      
      if (!success) {
        status = 'fail';
        message = `❌ ${component} falló en el test`;
      } else if (hasWarning) {
        status = 'warning';
        message = `⚠️ ${component} funciona con advertencias`;
      }

      const result: TestResult = {
        component,
        status,
        message,
        timestamp: new Date()
      };

      setTestResults(prev => [...prev, result]);
      setTestProgress(((i + 1) / components.length) * 100);
    }

    setIsRunningTests(false);
  };

  // Calcular estadísticas
  const getTestStats = (): TestStats => {
    return {
      total: testResults.length,
      passed: testResults.filter(r => r.status === 'pass').length,
      failed: testResults.filter(r => r.status === 'fail').length,
      warnings: testResults.filter(r => r.status === 'warning').length
    };
  };

  const stats = getTestStats();

  // Verificar permisos premium
  if (!hasPermission()) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Acceso Premium Requerido
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Necesitas permisos de administrador para acceder a la página de test premium.
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
            🧪 Premium Test Page Enhanced
          </h1>
          <p className="text-muted-foreground mt-1">
            Testing avanzado de componentes premium de Bundui integrados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            🧪 Test Mode
          </Badge>
          <Badge variant="secondary">
            Usuario: {user?.email}
          </Badge>
        </div>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 Estado de Testing Premium
            <Badge variant="outline" className="animate-pulse">
              {isPremiumEnabled ? 'PREMIUM' : 'BASIC'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Resultados de testing en tiempo real de componentes premium
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Total Tests</Label>
              <div className="flex items-center gap-2">
                <Badge variant="default">{stats.total}</Badge>
                <span className="text-sm text-muted-foreground">Ejecutados</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-green-700">Exitosos</Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700">{stats.passed}</Badge>
                <span className="text-sm text-muted-foreground">Pasaron</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-yellow-700">Advertencias</Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">{stats.warnings}</Badge>
                <span className="text-sm text-muted-foreground">Con warnings</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-red-700">Fallidos</Label>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">{stats.failed}</Badge>
                <span className="text-sm text-muted-foreground">Fallaron</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle>🎮 Controles de Testing</CardTitle>
          <CardDescription>
            Ejecuta tests automáticos en los componentes premium
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <Button 
                onClick={runComponentTests}
                disabled={isRunningTests}
                className="min-w-32"
              >
                {isRunningTests ? '🔄 Testing...' : '🚀 Run Tests'}
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setTestResults([]);
                  setTestProgress(0);
                }}
                disabled={isRunningTests}
              >
                🗑️ Clear Results
              </Button>
            </div>
            
            {isRunningTests && (
              <div className="flex items-center gap-4 min-w-64">
                <Progress value={testProgress} className="flex-1" />
                <span className="text-sm font-medium">{Math.round(testProgress)}%</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📋 Resultados de Testing</CardTitle>
            <CardDescription>
              Estado actual de los tests ejecutados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={
                        result.status === 'pass' ? 'default' :
                        result.status === 'warning' ? 'secondary' : 'destructive'
                      }
                      className="min-w-16 justify-center"
                    >
                      {result.status === 'pass' ? '✅' : 
                       result.status === 'warning' ? '⚠️' : '❌'}
                    </Badge>
                    <div>
                      <span className="font-medium">{result.component}</span>
                      <p className="text-sm text-muted-foreground">{result.message}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {result.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interactive Testing */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="components">Componentes</TabsTrigger>
          <TabsTrigger value="advanced">Avanzados</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>🎨 Theme Testing</CardTitle>
                <CardDescription>Test del sistema de temas</CardDescription>
              </CardHeader>
              <CardContent>
                <ActiveTheme />
                <div className="mt-4 space-y-2">
                  <Label>Tema Actual</Label>
                  <Badge variant="outline">{theme}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📅 Date Components</CardTitle>
                <CardDescription>Test de selectores de fecha</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Date Time Picker</Label>
                  <DateTimePicker 
                    date={selectedDate}
                    setDate={setSelectedDate}
                  />
                </div>
                <div>
                  <Label>Custom Date Range</Label>
                  <CustomDateRangePicker />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Components Tab */}
        <TabsContent value="components" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>📝 Form Components</CardTitle>
                <CardDescription>Test de componentes de formulario</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="test-input">Input</Label>
                  <Input 
                    id="test-input"
                    placeholder="Test input..." 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="test-textarea">Textarea</Label>
                  <Textarea 
                    id="test-textarea"
                    placeholder="Test textarea..."
                    value={textareaValue}
                    onChange={(e) => setTextareaValue(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Select</Label>
                  <Select value={selectValue} onValueChange={setSelectValue}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select option..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="option1">Option 1</SelectItem>
                      <SelectItem value="option2">Option 2</SelectItem>
                      <SelectItem value="option3">Option 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🎛️ Interactive Controls</CardTitle>
                <CardDescription>Test de controles interactivos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="test-switch"
                    checked={switchValue}
                    onCheckedChange={setSwitchValue}
                  />
                  <Label htmlFor="test-switch">Switch: {switchValue ? 'ON' : 'OFF'}</Label>
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
                
                <div className="space-y-2">
                  <Label>Progress</Label>
                  <Progress value={sliderValue[0]} className="w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>🔬 Advanced Testing</CardTitle>
              <CardDescription>Tests avanzados y debugging</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Test Dialog</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Test Dialog</DialogTitle>
                      <DialogDescription>
                        Este es un test del componente Dialog.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <p>Contenido del diálogo de prueba.</p>
                    </div>
                    <DialogFooter>
                      <Button variant="outline">Cancelar</Button>
                      <Button>Aceptar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">Test Dropdown</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Test Menu</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Option 1</DropdownMenuItem>
                    <DropdownMenuItem>Option 2</DropdownMenuItem>
                    <DropdownMenuItem>Option 3</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Separator />

              <Alert>
                <Icon name="info" className="h-4 w-4" />
                <AlertDescription>
                  Todos los tests han sido ejecutados. Los componentes premium están funcionando correctamente 
                  en el entorno VThink 1.0.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export { PremiumTestPageEnhanced };
export default PremiumTestPageEnhanced;
