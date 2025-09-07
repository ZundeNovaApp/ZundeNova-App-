import axios from 'axios';

export class AIProxyService {
  private fastApiUrl: string;

  constructor() {
    this.fastApiUrl = process.env.FASTAPI_AI_URL || 'http://ai-service:8000';
  }

  async diagnoseVision(imageBase64: string, cropType: string, location?: { lat: number; lon: number }): Promise<{
    diseases: Array<{ label: string; score: number; treatment_uri: string }>;
    severity: string;
    explainability: { saliency_uri: string };
    trace_id: string;
  }> {
    try {
      const response = await axios.post(`${this.fastApiUrl}/vision/diagnose`, {
        image_base64: imageBase64,
        crop_type: cropType,
        location,
        device: 'api',
        app_version: '1.0.0'
      }, {
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' }
      });

      return response.data;
    } catch (error) {
      console.error('FastAPI vision diagnosis failed:', error);
      throw new Error('AI vision service temporarily unavailable');
    }
  }

  async getFieldNDVI(fieldId: string, date: string, bbox: number[]): Promise<{
    ndvi_mean: number;
    ndvi_std: number;
    map_uri: string;
    advice: string;
  }> {
    try {
      const response = await axios.post(`${this.fastApiUrl}/geo/ndvi`, {
        field_id: fieldId,
        date,
        bbox
      }, {
        timeout: 15000,
        headers: { 'Content-Type': 'application/json' }
      });

      return response.data;
    } catch (error) {
      console.error('FastAPI NDVI analysis failed:', error);
      throw new Error('NDVI analysis service temporarily unavailable');
    }
  }

  async chatWithAI(text: string, language: string = 'en', context?: { farm_id: string }): Promise<{
    answer: string;
    citations: string[];
    confidence: number;
    handoff?: { expert_id: string; eta: string };
  }> {
    try {
      const response = await axios.post(`${this.fastApiUrl}/chat`, {
        text,
        lang: language,
        context
      }, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
      });

      return response.data;
    } catch (error) {
      console.error('FastAPI chat failed:', error);
      throw new Error('AI chat service temporarily unavailable');
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.fastApiUrl}/health`, { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

export const aiProxyService = new AIProxyService();
