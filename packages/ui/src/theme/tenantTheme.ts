import { TenantConfig, TenantTheme } from '@zundenova/shared';
import { ZundeNovaColors } from './colors';

export class TenantThemeManager {
  private static instance: TenantThemeManager;
  private currentTenant: TenantConfig | null = null;
  private currentTheme: TenantTheme | null = null;

  private constructor() {}

  public static getInstance(): TenantThemeManager {
    if (!TenantThemeManager.instance) {
      TenantThemeManager.instance = new TenantThemeManager();
    }
    return TenantThemeManager.instance;
  }

  public setTenant(tenant: TenantConfig): void {
    this.currentTenant = tenant;
    this.currentTheme = this.generateThemeFromTenant(tenant);
    this.applyThemeToDOM();
  }

  public getCurrentTenant(): TenantConfig | null {
    return this.currentTenant;
  }

  public getCurrentTheme(): TenantTheme | null {
    return this.currentTheme;
  }

  private generateThemeFromTenant(tenant: TenantConfig): TenantTheme {
    return {
      colors: {
        primary: tenant.branding.primaryColor,
        secondary: tenant.branding.secondaryColor,
        accent: tenant.branding.accentColor || tenant.branding.primaryColor,
        background: tenant.branding.backgroundColor || '#FFFFFF',
        surface: '#FFFFFF',
        text: {
          primary: tenant.branding.textColor || '#111827',
          secondary: '#6B7280',
          disabled: '#9CA3AF',
        },
        semantic: {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        },
      },
      typography: {
        fontFamily: 'Inter, system-ui, sans-serif',
        headingFontFamily: 'Inter, system-ui, sans-serif',
      },
      spacing: {
        unit: 8,
      },
      borderRadius: {
        small: '0.375rem',
        medium: '0.5rem',
        large: '0.75rem',
      },
    };
  }

  private applyThemeToDOM(): void {
    if (!this.currentTheme) return;

    const root = document.documentElement;
    const theme = this.currentTheme;

    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-accent', theme.colors.accent || theme.colors.primary);
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-surface', theme.colors.surface);
    root.style.setProperty('--color-text-primary', theme.colors.text.primary);
    root.style.setProperty('--color-text-secondary', theme.colors.text.secondary);
    root.style.setProperty('--color-text-disabled', theme.colors.text.disabled);
    root.style.setProperty('--color-success', theme.colors.semantic.success);
    root.style.setProperty('--color-warning', theme.colors.semantic.warning);
    root.style.setProperty('--color-error', theme.colors.semantic.error);
    root.style.setProperty('--color-info', theme.colors.semantic.info);
    root.style.setProperty('--font-family', theme.typography.fontFamily);
    root.style.setProperty('--font-family-heading', theme.typography.headingFontFamily || theme.typography.fontFamily);
    root.style.setProperty('--spacing-unit', `${theme.spacing.unit}px`);
    root.style.setProperty('--border-radius-small', theme.borderRadius.small);
    root.style.setProperty('--border-radius-medium', theme.borderRadius.medium);
    root.style.setProperty('--border-radius-large', theme.borderRadius.large);
  }

  public getDefaultZundeNovaTheme(): TenantTheme {
    return {
      colors: {
        primary: ZundeNovaColors.primary.green,
        secondary: ZundeNovaColors.primary.gold,
        accent: ZundeNovaColors.primary.green,
        background: ZundeNovaColors.primary.white,
        surface: ZundeNovaColors.primary.white,
        text: {
          primary: ZundeNovaColors.neutral[900],
          secondary: ZundeNovaColors.neutral[600],
          disabled: ZundeNovaColors.neutral[400],
        },
        semantic: {
          success: ZundeNovaColors.semantic.success,
          warning: ZundeNovaColors.semantic.warning,
          error: ZundeNovaColors.semantic.error,
          info: ZundeNovaColors.semantic.info,
        },
      },
      typography: {
        fontFamily: 'Inter, system-ui, sans-serif',
        headingFontFamily: 'Inter, system-ui, sans-serif',
      },
      spacing: {
        unit: 8,
      },
      borderRadius: {
        small: '0.375rem',
        medium: '0.5rem',
        large: '0.75rem',
      },
    };
  }
}

export const tenantThemeManager = TenantThemeManager.getInstance();
