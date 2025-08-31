export interface TenantConfig {
  id: string;
  name: string;
  slug: string;
  logo: {
    primary: string; // URL to primary logo
    secondary?: string; // URL to secondary/white logo
    favicon?: string; // URL to favicon
  };
  branding: {
    primaryColor: string; // Main brand color (replaces #228B22)
    secondaryColor: string; // Secondary brand color (replaces #FFD700)
    accentColor?: string; // Optional accent color
    backgroundColor?: string; // Background color override
    textColor?: string; // Primary text color override
  };
  theme: {
    name: string; // Theme variant name
    mode: 'light' | 'dark' | 'auto';
    customCSS?: string; // Additional custom CSS
  };
  localization: {
    defaultLanguage: string;
    supportedLanguages: string[];
    currency: string;
    timezone: string;
  };
  features: {
    aiDiagnostics: boolean;
    marketplace: boolean;
    expertConsult: boolean;
    communityForum: boolean;
    blockchainTraceability: boolean;
    mobileApp: boolean;
  };
  contact: {
    supportEmail: string;
    supportPhone?: string;
    website?: string;
    address?: string;
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    subscriptionTier: 'basic' | 'premium' | 'enterprise';
  };
}

export interface TenantTheme {
  colors: {
    primary: string;
    secondary: string;
    accent?: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
    semantic: {
      success: string;
      warning: string;
      error: string;
      info: string;
    };
  };
  typography: {
    fontFamily: string;
    headingFontFamily?: string;
  };
  spacing: {
    unit: number; // Base spacing unit in pixels
  };
  borderRadius: {
    small: string;
    medium: string;
    large: string;
  };
}

export interface WhiteLabelConfig {
  tenant: TenantConfig;
  theme: TenantTheme;
  customizations: {
    headerLayout?: 'default' | 'centered' | 'minimal';
    navigationStyle?: 'sidebar' | 'topbar' | 'hybrid';
    dashboardLayout?: 'grid' | 'list' | 'cards';
    showBranding?: boolean;
    customFooter?: string;
  };
}
