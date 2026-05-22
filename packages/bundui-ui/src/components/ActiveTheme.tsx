import React from 'react';
import { useThemeConfig } from './active-theme';

/**
 * ActiveTheme - Componente que muestra información del tema activo
 */
const ActiveTheme: React.FC = () => {
  try {
    const { theme } = useThemeConfig();
    
    return (
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="text-sm text-gray-600">Tema Activo</div>
          <div className="text-lg font-semibold capitalize">{theme.preset || 'Default'}</div>
        </div>
        
        <div className="space-y-1">
          <div className="text-xs text-gray-500">Radio</div>
          <div className="text-sm">{theme.radius || '0.5rem'}</div>
        </div>
        
        {theme.scale && (
          <div className="space-y-1">
            <div className="text-xs text-gray-500">Escala</div>
            <div className="text-sm">{theme.scale}</div>
          </div>
        )}
        
        <div className="space-y-1">
          <div className="text-xs text-gray-500">Layout</div>
          <div className="text-sm capitalize">{theme.contentLayout || 'Default'}</div>
        </div>
      </div>
    );
  } catch (error) {
    // Fallback si no está en un ActiveThemeProvider
    return (
      <div className="space-y-2">
        <div className="text-sm text-gray-600">Tema del Sistema</div>
        <div className="text-lg font-semibold">Auto</div>
        <div className="text-xs text-gray-500">
          Se ajusta automáticamente según las preferencias del sistema
        </div>
      </div>
    );
  }
};

export default ActiveTheme;
