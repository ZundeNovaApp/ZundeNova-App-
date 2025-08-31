export interface AIModelConfig {
  name: string;
  version: string;
  type: 'crop' | 'livestock' | 'soil';
  url: string;
  accuracy: number;
  lastUpdated: Date;
}

export interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  response: string;
  language: string;
  context: 'agriculture' | 'veterinary' | 'general';
  timestamp: Date;
}

export interface EdgeAIResult {
  diagnosis: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  source: 'edge' | 'cloud';
  processingTime: number;
}

export interface ModelPerformanceMetrics {
  modelId: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  inferenceTime: number;
  lastEvaluated: Date;
}

export interface AIServiceStatus {
  plantDiseaseModel: boolean;
  livestockHealthModel: boolean;
  chatService: boolean;
  edgeModelsAvailable: string[];
  lastHealthCheck: Date;
}
