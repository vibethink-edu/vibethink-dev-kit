"use client";

/**
 * SystemDebugPanelFixed - Debug version to check chart rendering
 * Simplified version to debug chart visibility issues
 */

import React, { useState, useEffect } from 'react';

// Mock de useAuth para demo
const mockUseAuth = () => ({
  user: { id: '1', email: 'demo@vthink.com', profile: { role: 'ADMIN' } },
  isAuthenticated: true,
  loading: false
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
import { Switch } from './components/ui/switch';
import { Separator } from './components/ui/separator';

// Chart components
import { RevenueChart } from '@/shared/components/dashboard/RevenueChart';
import { MetricCard } from '@/shared/components/dashboard/MetricCard';

interface SystemDebugPanelFixedProps {
  collapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
  className?: string;
}

const SystemDebugPanelFixed: React.FC<SystemDebugPanelFixedProps> = ({ 
  collapsed: externalCollapsed = false, 
  onToggle,
  className = ''
}) => {
  const { user, isAuthenticated, loading } = mockUseAuth();
  const { theme } = useBunduiPremium();
  const [timestamp, setTimestamp] = useState('');
  const [showRawData, setShowRawData] = useState(false); // Explicitly false
  const [internalCollapsed, setInternalCollapsed] = useState(externalCollapsed);
  const [isClient, setIsClient] = useState(false);
  const [errors, setErrors] = useState<Array<{
    message: string;
    source: string;
    timestamp: string;
    stack?: string;
  }>>([]);
  const [consoleErrors, setConsoleErrors] = useState<string[]>([]);

  const collapsed = onToggle ? externalCollapsed : internalCollapsed;
  const toggleCollapsed = onToggle || setInternalCollapsed;

  useEffect(() => {
    setIsClient(true);
    setTimestamp(new Date().toISOString());
    
    const interval = setInterval(() => {
      setTimestamp(new Date().toISOString());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const [clientSideData, setClientSideData] = useState({
    userAgent: 'Loading...',
    currentUrl: 'Loading...',
    language: 'Loading...'
  });

  useEffect(() => {
    setClientSideData({
      userAgent: navigator.userAgent.slice(0, 60) + '...',
      currentUrl: window.location.href,
      language: navigator.language
    });
  }, []);

  const systemVars = {
    user: {
      id: user?.id || 'No authenticated',
      email: user?.email || 'No email',
      authenticated: isAuthenticated,
      loading: loading,
      role: user?.profile?.role || 'No role'
    },
    ui: {
      theme: theme,
      timestamp: timestamp,
      userAgent: clientSideData.userAgent,
      currentUrl: clientSideData.currentUrl,
      language: clientSideData.language
    },
    environment: {
      mode: process.env.NODE_ENV || 'unknown',
      timestamp: timestamp ? timestamp.split('T')[1]?.split('.')[0] || 'Loading...' : 'Loading...',
      locale: clientSideData.language,
      timeZone: typeof window !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Loading...'
    },
    performance: {
      memoryUsage: (performance as any).memory ? 
        Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024) + ' MB' : 
        'No disponible',
      renderTime: Date.now() % 1000 + 'ms',
      userTiming: performance.now().toFixed(2) + 'ms'
    },
    errors: {
      javascriptErrors: errors.length,
      consoleErrors: consoleErrors.length,
      lastError: errors[0]?.message.slice(0, 50) + '...' || 'None',
      recentErrors: errors.slice(0, 3)
    },
    debugging: {
      totalErrors: errors.length + consoleErrors.length,
      errorSources: [...new Set(errors.map(e => e.source))],
      errorTypes: {
        runtime: errors.filter(e => !e.source.includes('Promise')).length,
        promises: errors.filter(e => e.source.includes('Promise')).length,
        console: consoleErrors.length
      }
    }
  };

  if (collapsed) {
    return (
      <Card className={`border-2 border-blue-200 dark:border-blue-800 ${className}`}>
        <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleCollapsed(false)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">🔧</Badge>
              <span className="text-sm font-medium">Debug Panel - FIXED</span>
            </div>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              ↗️
            </Button>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={`border-2 border-green-200 dark:border-green-800 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              🔧 System Debug Panel - FIXED VERSION
              <Badge variant="secondary" className="text-xs animate-pulse">LIVE</Badge>
            </CardTitle>
            <CardDescription className="text-sm">
              DEBUG: Force showing charts • {isClient && `• ${systemVars.environment.timestamp}`}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="raw-data-fixed" className="text-xs">JSON</Label>
            <Switch 
              id="raw-data-fixed"
              checked={showRawData}
              onCheckedChange={setShowRawData}
            />
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => toggleCollapsed(true)}
              className="h-8 w-8 p-0"
            >
              ✕
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* ALWAYS SHOW CHARTS - REMOVE JSON CONDITION FOR DEBUG */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg flex items-center gap-2 text-green-600">
            📊 Chart Components Demo - FORCED RENDER
            <Badge variant="outline" className="text-xs bg-green-100">Always Visible</Badge>
          </h4>
          
          {/* Debug Info */}
          <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
            <div><strong>showRawData:</strong> {showRawData.toString()}</div>
            <div><strong>isClient:</strong> {isClient.toString()}</div>
            <div><strong>timestamp:</strong> {timestamp}</div>
          </div>
          
          {/* Metrics Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 border border-blue-200 p-4 rounded">
            <div className="col-span-full text-sm font-medium text-blue-600">MetricCard Tests:</div>
            <MetricCard 
              title="Total Errors" 
              value={systemVars.debugging.totalErrors.toString()} 
              subtitle={systemVars.debugging.totalErrors > 0 ? "Needs attention" : "All good"} 
              subtitleColor={systemVars.debugging.totalErrors > 0 ? "text-red-600" : "text-green-600"} 
            />
            <MetricCard 
              title="Memory Usage" 
              value={systemVars.performance.memoryUsage} 
              subtitle="Current allocation" 
              subtitleColor="text-blue-600" 
            />
            <MetricCard 
              title="Active Sessions" 
              value="1" 
              subtitle="Current user" 
              subtitleColor="text-green-600" 
            />
            <MetricCard 
              title="Uptime" 
              value={systemVars.performance.userTiming} 
              subtitle="Since last refresh" 
              subtitleColor="text-gray-600" 
            />
          </div>

          {/* Revenue Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 border border-purple-200 p-4 rounded">
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-purple-600">📈 RevenueChart Component:</h5>
              <div className="border-2 border-dashed border-purple-300 p-2 rounded">
                <RevenueChart />
              </div>
            </div>
            
            {/* System Stats Chart */}
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-purple-600">🔧 System Stats Chart:</h5>
              <div className="border-2 border-dashed border-purple-300 p-2 rounded">
                <div className="rounded-xl bg-white dark:bg-neutral-900 shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Debug Stats</h3>
                    <div className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
                      Real-time ⚡
                    </div>
                  </div>
                  
                  <div className="h-32 bg-gradient-to-b from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-lg p-4 flex items-end justify-between">
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-8 bg-gradient-to-t from-red-500 to-red-300 rounded-t-sm" 
                           style={{height: `${Math.max(10, (systemVars.debugging.totalErrors * 20))}%`}}></div>
                      <div className="text-xs font-semibold mt-2 text-red-600">{systemVars.debugging.totalErrors}</div>
                      <div className="text-xs text-gray-500">Errors</div>
                    </div>
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-8 bg-gradient-to-t from-green-500 to-green-300 rounded-t-sm" 
                           style={{height: `60%`}}></div>
                      <div className="text-xs font-semibold mt-2 text-green-600">✓</div>
                      <div className="text-xs text-gray-500">Status</div>
                    </div>
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-8 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-sm" 
                           style={{height: `${Math.min(80, parseInt(systemVars.performance.memoryUsage) || 40)}%`}}></div>
                      <div className="text-xs font-semibold mt-2 text-blue-600">{systemVars.performance.memoryUsage.split(' ')[0]}</div>
                      <div className="text-xs text-gray-500">Memory</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">System Health</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {systemVars.debugging.totalErrors === 0 ? '🟢 Healthy' : '🟡 Warning'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* JSON View if toggled */}
        {showRawData && (
          <>
            <Separator className="my-4" />
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <h5 className="font-medium text-yellow-800 mb-2">JSON Data View:</h5>
              <pre className="text-xs bg-muted p-4 rounded-md overflow-auto max-h-60 font-mono">
                {JSON.stringify(systemVars, null, 2)}
              </pre>
            </div>
          </>
        )}
        
        <Separator className="my-3" />
        
        {/* Quick Actions */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => console.log('System Variables:', systemVars)}>
              📄 Log to Console
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowRawData(!showRawData)}>
              🔄 Toggle JSON View
            </Button>
            <Button variant="outline" size="sm" onClick={() => console.error('Test console error from debug panel')}>
              🧪 Test Console Error
            </Button>
          </div>
          <Badge variant="outline" className="text-xs bg-green-100">
            🔧 Debug Panel FIXED v1.0
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export { SystemDebugPanelFixed };
export default SystemDebugPanelFixed;
