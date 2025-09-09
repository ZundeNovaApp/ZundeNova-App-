export type { User, UserRole, FarmerProfile, ExpertProfile } from './types/user';
export type { Farm, Crop, Livestock } from './types/farm';
export type { DiagnosticRequest, DiagnosticResult, TreatmentOption } from './types/diagnostic';
export type { Product, Order, OrderItem, Address } from './types/marketplace';
export type { AIModelConfig, ChatMessage, EdgeAIResult, ModelPerformanceMetrics, AIServiceStatus } from './types/ai';
export type { TenantConfig, TenantTheme, WhiteLabelConfig } from './types/tenant';

export const ZUNDENOVA_COLORS = {
  primary: '#228B22',
  accent: '#FFD700',
  white: '#FFFFFF'
} as const;

export * from './utils/validation';

export const LoadingSpinner = ({ size = 'md', color = '#00684b', className = '' }: {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}) => null; // Placeholder for now

export const ErrorMessage = ({ message, onRetry, className = '' }: {
  message: string;
  onRetry?: () => void;
  className?: string;
}) => null; // Placeholder for now

export const Toast = ({ toast, onClose }: {
  toast: any;
  onClose: (id: string) => void;
}) => null; // Placeholder for now
