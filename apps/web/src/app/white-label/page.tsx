'use client';

import React, { useState } from 'react';
import { TenantProvider, useTenant } from '@zundenova/ui';
import { TenantConfig } from '@zundenova/shared';

const mockTenants: TenantConfig[] = [
  {
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
  },
  {
    id: 'ngo-africa-green',
    name: 'Africa Green Initiative',
    slug: 'africa-green',
    logo: {
      primary: '/tenants/africa-green/logo-primary.svg',
      secondary: '/tenants/africa-green/logo-white.svg',
      favicon: '/tenants/africa-green/favicon.ico',
    },
    branding: {
      primaryColor: '#059669',
      secondaryColor: '#F59E0B',
      accentColor: '#10B981',
    },
    theme: {
      name: 'Africa Green Theme',
      mode: 'light',
    },
    localization: {
      defaultLanguage: 'en',
      supportedLanguages: ['en', 'sw', 'fr'],
      currency: 'USD',
      timezone: 'Africa/Nairobi',
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
      supportEmail: 'support@africagreen.org',
      website: 'https://africagreen.org',
    },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      subscriptionTier: 'premium',
    },
  },
  {
    id: 'gov-kenya-agriculture',
    name: 'Kenya Ministry of Agriculture',
    slug: 'kenya-agriculture',
    logo: {
      primary: '/tenants/kenya-agriculture/logo-primary.svg',
      secondary: '/tenants/kenya-agriculture/logo-white.svg',
      favicon: '/tenants/kenya-agriculture/favicon.ico',
    },
    branding: {
      primaryColor: '#DC2626',
      secondaryColor: '#000000',
      accentColor: '#059669',
    },
    theme: {
      name: 'Kenya Government Theme',
      mode: 'light',
    },
    localization: {
      defaultLanguage: 'en',
      supportedLanguages: ['en', 'sw'],
      currency: 'KES',
      timezone: 'Africa/Nairobi',
    },
    features: {
      aiDiagnostics: true,
      marketplace: false,
      expertConsult: true,
      communityForum: true,
      blockchainTraceability: true,
      mobileApp: true,
    },
    contact: {
      supportEmail: 'support@agriculture.go.ke',
      website: 'https://agriculture.go.ke',
    },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      subscriptionTier: 'enterprise',
    },
  },
  {
    id: 'ngo-rural-development',
    name: 'Rural Development Foundation',
    slug: 'rural-development',
    logo: {
      primary: '/tenants/rural-development/logo-primary.svg',
      secondary: '/tenants/rural-development/logo-white.svg',
      favicon: '/tenants/rural-development/favicon.ico',
    },
    branding: {
      primaryColor: '#7C3AED',
      secondaryColor: '#F59E0B',
      accentColor: '#8B5CF6',
    },
    theme: {
      name: 'Rural Development Theme',
      mode: 'light',
    },
    localization: {
      defaultLanguage: 'en',
      supportedLanguages: ['en', 'fr', 'ha'],
      currency: 'USD',
      timezone: 'Africa/Lagos',
    },
    features: {
      aiDiagnostics: true,
      marketplace: true,
      expertConsult: true,
      communityForum: true,
      blockchainTraceability: false,
      mobileApp: true,
    },
    contact: {
      supportEmail: 'support@ruraldevelopment.org',
      website: 'https://ruraldevelopment.org',
    },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      subscriptionTier: 'premium',
    },
  },
];

function WhiteLabelDemo() {
  const { tenant, setTenant, resetToDefault } = useTenant();
  const [selectedTenantId, setSelectedTenantId] = useState(tenant?.id || 'zundenova-default');

  const handleTenantChange = (tenantId: string) => {
    setSelectedTenantId(tenantId);
    if (tenantId === 'zundenova-default') {
      resetToDefault();
    } else {
      const selectedTenant = mockTenants.find(t => t.id === tenantId);
      if (selectedTenant) {
        setTenant(selectedTenant);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">White-Label Demo</h1>
              <p className="mt-1 text-sm text-gray-500">
                Switch between different tenant themes to see white-label customization
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <label htmlFor="tenant-select" className="text-sm font-medium text-gray-700">
                Select Theme:
              </label>
              <select
                id="tenant-select"
                value={selectedTenantId}
                onChange={(e) => handleTenantChange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {mockTenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {tenant && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-primary)' }}>
              Current Theme: {tenant.name}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Brand Colors</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: tenant.branding.primaryColor }}
                    ></div>
                    <div>
                      <p className="text-sm font-medium">Primary</p>
                      <p className="text-xs text-gray-500">{tenant.branding.primaryColor}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: tenant.branding.secondaryColor }}
                    ></div>
                    <div>
                      <p className="text-sm font-medium">Secondary</p>
                      <p className="text-xs text-gray-500">{tenant.branding.secondaryColor}</p>
                    </div>
                  </div>
                  {tenant.branding.accentColor && (
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: tenant.branding.accentColor }}
                      ></div>
                      <div>
                        <p className="text-sm font-medium">Accent</p>
                        <p className="text-xs text-gray-500">{tenant.branding.accentColor}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Organization Info</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> {tenant.name}</p>
                  <p><span className="font-medium">Slug:</span> {tenant.slug}</p>
                  <p><span className="font-medium">Email:</span> {tenant.contact.supportEmail}</p>
                  <p><span className="font-medium">Website:</span> {tenant.contact.website}</p>
                  <p><span className="font-medium">Tier:</span> {tenant.metadata.subscriptionTier}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Features</h3>
                <div className="space-y-2">
                  {Object.entries(tenant.features).map(([feature, enabled]) => (
                    <div key={feature} className="flex items-center justify-between">
                      <span className="text-sm capitalize">
                        {feature.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        enabled 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                🌱
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">AI Diagnostics</h3>
                <p className="text-sm text-gray-500">Plant disease detection</p>
              </div>
            </div>
            <button 
              className="w-full py-2 px-4 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Start Diagnosis
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: 'var(--color-secondary)' }}
              >
                🛒
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">Marketplace</h3>
                <p className="text-sm text-gray-500">Farm supplies and tools</p>
              </div>
            </div>
            <button 
              className="w-full py-2 px-4 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--color-secondary)' }}
            >
              Browse Products
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: 'var(--color-accent, var(--color-primary))' }}
              >
                👨‍⚕️
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">Expert Consult</h3>
                <p className="text-sm text-gray-500">Professional advice</p>
              </div>
            </div>
            <button 
              className="w-full py-2 px-4 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--color-accent, var(--color-primary))' }}
            >
              Book Consultation
            </button>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Theme Integration Guide</h3>
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-4">
              This white-label system allows organizations to customize the ZundeNova platform with their own branding:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li><strong>Custom Colors:</strong> Primary, secondary, and accent colors are applied throughout the interface</li>
              <li><strong>Logo Integration:</strong> Organization logos replace ZundeNova branding</li>
              <li><strong>Feature Control:</strong> Enable/disable specific features based on subscription tier</li>
              <li><strong>Localization:</strong> Support for multiple languages and currencies</li>
              <li><strong>Contact Information:</strong> Custom support emails and websites</li>
              <li><strong>Theme Persistence:</strong> User preferences are saved and restored</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WhiteLabelPage() {
  return (
    <TenantProvider>
      <WhiteLabelDemo />
    </TenantProvider>
  );
}
