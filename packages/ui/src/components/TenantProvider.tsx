'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { TenantConfig, TenantTheme, WhiteLabelConfig } from '@zundenova/shared';
import { tenantThemeManager } from '../theme/tenantTheme';

interface TenantContextType {
  tenant: TenantConfig | null;
  theme: TenantTheme | null;
  isLoading: boolean;
  setTenant: (tenant: TenantConfig) => void;
  resetToDefault: () => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
  defaultTenant?: TenantConfig;
  tenantSlug?: string; // For loading tenant by slug
}

export const TenantProvider: React.FC<TenantProviderProps> = ({
  children,
  defaultTenant,
  tenantSlug,
}) => {
  const [tenant, setTenantState] = useState<TenantConfig | null>(defaultTenant || null);
  const [theme, setTheme] = useState<TenantTheme | null>(null);
  const [isLoading, setIsLoading] = useState(!!tenantSlug);

  const setTenant = (newTenant: TenantConfig) => {
    setTenantState(newTenant);
    tenantThemeManager.setTenant(newTenant);
    setTheme(tenantThemeManager.getCurrentTheme());
  };

  const resetToDefault = () => {
    setTenantState(null);
    setTheme(tenantThemeManager.getDefaultZundeNovaTheme());
    const defaultTenant: TenantConfig = {
      id: 'zundenova-default',
      name: 'ZundeNova',
      slug: 'zundenova',
      logo: {
        primary: '/logo-primary.svg',
        secondary: '/logo-white.svg',
        favicon: '/favicon.ico',
      },
      branding: {
        primaryColor: '#228B22',
        secondaryColor: '#FFD700',
      },
      theme: {
        name: 'ZundeNova Default',
        mode: 'light',
      },
      localization: {
        defaultLanguage: 'en',
        supportedLanguages: ['en', 'sw', 'zu', 'ha', 'fr'],
        currency: 'USD',
        timezone: 'UTC',
      },
      features: {
        aiDiagnostics: true,
        marketplace: true,
        expertConsult: true,
        communityForum: true,
        blockchainTraceability: true,
        mobileApp: true,
      },
      contact: {
        supportEmail: 'support@zundenova.com',
        website: 'https://zundenova.com',
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        subscriptionTier: 'enterprise',
      },
    };
    tenantThemeManager.setTenant(defaultTenant);
  };

  useEffect(() => {
    if (tenantSlug && !tenant) {
      setIsLoading(true);
      setTimeout(() => {
        const mockTenant: TenantConfig = {
          id: `tenant-${tenantSlug}`,
          name: tenantSlug.charAt(0).toUpperCase() + tenantSlug.slice(1),
          slug: tenantSlug,
          logo: {
            primary: `/tenants/${tenantSlug}/logo-primary.svg`,
            secondary: `/tenants/${tenantSlug}/logo-white.svg`,
            favicon: `/tenants/${tenantSlug}/favicon.ico`,
          },
          branding: {
            primaryColor: '#2563EB', // Different color for demo
            secondaryColor: '#F59E0B',
          },
          theme: {
            name: `${tenantSlug} Theme`,
            mode: 'light',
          },
          localization: {
            defaultLanguage: 'en',
            supportedLanguages: ['en', 'sw'],
            currency: 'USD',
            timezone: 'UTC',
          },
          features: {
            aiDiagnostics: true,
            marketplace: true,
            expertConsult: true,
            communityForum: false,
            blockchainTraceability: false,
            mobileApp: true,
          },
          contact: {
            supportEmail: `support@${tenantSlug}.org`,
            website: `https://${tenantSlug}.org`,
          },
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true,
            subscriptionTier: 'premium',
          },
        };
        setTenant(mockTenant);
        setIsLoading(false);
      }, 1000);
    } else if (!tenant) {
      resetToDefault();
    }
  }, [tenantSlug, tenant]);

  useEffect(() => {
    if (tenant) {
      tenantThemeManager.setTenant(tenant);
      setTheme(tenantThemeManager.getCurrentTheme());
    }
  }, [tenant]);

  const contextValue: TenantContextType = {
    tenant,
    theme,
    isLoading,
    setTenant,
    resetToDefault,
  };

  return (
    <TenantContext.Provider value={contextValue}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

export const useTheme = (): TenantTheme | null => {
  const { theme } = useTenant();
  return theme;
};
