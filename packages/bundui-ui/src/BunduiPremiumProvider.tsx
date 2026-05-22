/**
 * BunduiPremiumProvider - VThink 1.0 Integration
 * Provider para componentes premium de Bundui con integración segura
 */

import React, { createContext, useContext, ReactNode } from 'react';

// Contexto para configuración premium
interface BunduiPremiumContextType {
  isPremiumEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
  features: {
    advancedCharts: boolean;
    customThemes: boolean;
    premiumComponents: boolean;
  };
}

const BunduiPremiumContext = createContext<BunduiPremiumContextType | undefined>(undefined);

interface BunduiPremiumProviderProps {
  children: ReactNode;
  isPremiumEnabled?: boolean;
  theme?: 'light' | 'dark' | 'system';
  features?: {
    advancedCharts?: boolean;
    customThemes?: boolean;
    premiumComponents?: boolean;
  };
}

export const BunduiPremiumProvider: React.FC<BunduiPremiumProviderProps> = ({
  children,
  isPremiumEnabled = true,
  theme = 'system',
  features = {
    advancedCharts: true,
    customThemes: true,
    premiumComponents: true,
  },
}) => {
  const normalizedFeatures: BunduiPremiumContextType['features'] = {
    advancedCharts: features?.advancedCharts ?? true,
    customThemes: features?.customThemes ?? true,
    premiumComponents: features?.premiumComponents ?? true,
  };
  const contextValue: BunduiPremiumContextType = {
    isPremiumEnabled,
    theme,
    features: normalizedFeatures,
  };

  return (
    <BunduiPremiumContext.Provider value={contextValue}>
      {children}
    </BunduiPremiumContext.Provider>
  );
};

// Hook para usar el contexto premium
export const useBunduiPremium = () => {
  const context = useContext(BunduiPremiumContext);
  if (context === undefined) {
    throw new Error('useBunduiPremium must be used within a BunduiPremiumProvider');
  }
  return context;
};

// Componente wrapper para componentes premium
interface PremiumComponentWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  requiredFeature?: keyof BunduiPremiumContextType['features'];
}

export const PremiumComponentWrapper: React.FC<PremiumComponentWrapperProps> = ({
  children,
  fallback = null,
  requiredFeature,
}) => {
  const { isPremiumEnabled, features } = useBunduiPremium();

  // Verificar si el componente premium está habilitado
  if (!isPremiumEnabled) {
    return <>{fallback}</>;
  }

  // Verificar feature específico si se requiere
  if (requiredFeature && !features[requiredFeature]) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default BunduiPremiumProvider; 
