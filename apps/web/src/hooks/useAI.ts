import { useState, useCallback } from 'react';

interface VisionDiagnosisResult {
  diseases: Array<{ label: string; score: number; treatment_uri: string }>;
  severity: string;
  explainability: { saliency_uri: string };
  trace_id: string;
}

interface NDVIResult {
  ndvi_mean: number;
  ndvi_std: number;
  map_uri: string;
  advice: string;
}

interface ChatResult {
  answer: string;
  citations: string[];
  confidence: number;
  handoff?: { expert_id: string; eta: string };
}

export const useAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const diagnoseVision = useCallback(async (
    imageFile: File,
    cropType: string = 'general',
    location?: { lat: number; lon: number }
  ): Promise<VisionDiagnosisResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('cropType', cropType);
      if (location) {
        formData.append('location', JSON.stringify(location));
      }

      const response = await fetch('http://localhost:8001/vision/diagnose', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Vision diagnosis failed: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Vision diagnosis failed';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyzeNDVI = useCallback(async (
    fieldId: string,
    date: string,
    bbox: number[]
  ): Promise<NDVIResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8001/geo/ndvi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ fieldId, date, bbox }),
      });

      if (!response.ok) {
        throw new Error(`NDVI analysis failed: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'NDVI analysis failed';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const chatWithAI = useCallback(async (
    text: string,
    language: string = 'en',
    farmId?: string
  ): Promise<ChatResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8001/chat/enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ text, language, farmId }),
      });

      if (!response.ok) {
        throw new Error(`AI chat failed: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'AI chat failed';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    diagnoseVision,
    analyzeNDVI,
    chatWithAI,
  };
};
