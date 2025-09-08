export const ZundeNovaColors = {
  primary: {
    green: '#00684b',
    teal: '#007f82', 
    gold: '#dbc600',
    white: '#FFFFFF'
  },
  semantic: {
    success: '#00684b',
    warning: '#dbc600',
    error: '#EF4444',
    info: '#007f82'
  },
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827'
  }
} as const;

export type ZundeNovaColorScheme = typeof ZundeNovaColors;
