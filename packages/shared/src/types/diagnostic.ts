export interface DiagnosticRequest {
  id: string;
  userId: string;
  farmId?: string;
  type: 'crop' | 'livestock' | 'soil';
  images: string[];
  description?: string;
  symptoms?: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
}

export interface DiagnosticResult {
  id: string;
  requestId: string;
  confidence: number;
  diagnosis: string;
  recommendations: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  treatmentOptions?: TreatmentOption[];
  followUpRequired: boolean;
  processedAt: Date;
  modelVersion: string;
}

export interface TreatmentOption {
  name: string;
  description: string;
  products?: string[];
  cost?: number;
  duration?: string;
  effectiveness: number;
}
