import { offlineStorageService } from './OfflineStorageService';

export interface VisionDiagnosisRequest {
  image_base64: string;
  crop_type: string;
  location?: { lat: number; lon: number };
}

export interface VisionDiagnosisResult {
  diseases: Array<{ label: string; score: number; treatment_uri: string }>;
  severity: string;
  explainability: { saliency_uri: string };
  trace_id: string;
}

export interface NDVIRequest {
  field_id: string;
  date: string;
  bbox: number[];
}

export interface NDVIResult {
  ndvi_mean: number;
  ndvi_std: number;
  map_uri: string;
  advice: string;
}

export interface ChatRequest {
  text: string;
  lang?: string;
  context?: { farm_id: string };
}

export interface ChatResult {
  answer: string;
  citations: string[];
  confidence: number;
  handoff?: { expert_id: string; eta: string };
}

class AIService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
  }

  async diagnoseVision(request: VisionDiagnosisRequest): Promise<VisionDiagnosisResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/vision/diagnose`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Vision diagnosis failed: ${response.status}`);
      }

      const result = await response.json();
      
      await offlineStorageService.storeAIResult({
        id: `vision_${Date.now()}`,
        type: 'vision',
        input: request,
        result,
        confidence: result.diseases[0]?.score || 0,
      });

      return result;
    } catch (error) {
      console.error('Vision diagnosis error:', error);
      
      const cachedResults = await offlineStorageService.getCachedAIResults('vision');
      if (cachedResults.length > 0) {
        console.log('Using cached vision diagnosis result');
        return cachedResults[0].result;
      }
      
      throw error;
    }
  }

  async analyzeNDVI(request: NDVIRequest): Promise<NDVIResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/geo/ndvi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`NDVI analysis failed: ${response.status}`);
      }

      const result = await response.json();
      
      await offlineStorageService.storeAIResult({
        id: `ndvi_${Date.now()}`,
        type: 'ndvi',
        input: request,
        result,
        confidence: 0.8,
      });

      return result;
    } catch (error) {
      console.error('NDVI analysis error:', error);
      
      const cachedResults = await offlineStorageService.getCachedAIResults('ndvi');
      if (cachedResults.length > 0) {
        console.log('Using cached NDVI analysis result');
        return cachedResults[0].result;
      }
      
      throw error;
    }
  }

  async chatWithAI(request: ChatRequest): Promise<ChatResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/chat/enhanced`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`AI chat failed: ${response.status}`);
      }

      const result = await response.json();
      
      await offlineStorageService.storeAIResult({
        id: `chat_${Date.now()}`,
        type: 'chat',
        input: request,
        result,
        confidence: result.confidence || 0.8,
      });

      return result;
    } catch (error) {
      console.error('AI chat error:', error);
      
      const cachedResults = await offlineStorageService.getCachedAIResults('chat');
      if (cachedResults.length > 0) {
        console.log('Using cached AI chat result');
        return cachedResults[0].result;
      }
      
      throw error;
    }
  }

  private async getAuthToken(): Promise<string> {
    return 'demo-token';
  }

  async getCachedResults(type?: 'vision' | 'ndvi' | 'chat') {
    return await offlineStorageService.getCachedAIResults(type);
  }
}

export const aiService = new AIService();
