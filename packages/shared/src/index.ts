export type { User, UserRole, FarmerProfile, ExpertProfile } from './types/user';
export type { Farm, Crop, Livestock } from './types/farm';
export type { DiagnosticRequest, DiagnosticResult, TreatmentOption } from './types/diagnostic';
export type { Product, Order, OrderItem, Address } from './types/marketplace';
export type { AIModelConfig, ChatMessage, EdgeAIResult, ModelPerformanceMetrics, AIServiceStatus } from './types/ai';

export const ZUNDENOVA_COLORS = {
  primary: '#228B22',
  accent: '#FFD700',
  white: '#FFFFFF'
} as const;
