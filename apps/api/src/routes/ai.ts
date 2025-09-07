import { Router, Request, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { uploadSingle } from '../middleware/upload';
import { aiService } from '../services/aiService';
import { aiProxyService } from '../services/aiProxyService';

const router: Router = Router();

router.use(authenticateToken);

router.get('/status', async (req: AuthenticatedRequest, res) => {
  try {
    const status = {
      plantDiseaseModel: aiService['plantDiseaseModel'] !== null,
      livestockHealthModel: aiService['livestockHealthModel'] !== null,
      chatService: aiService['chatPipeline'] !== null,
      edgeModelsAvailable: ['crop-disease-v1', 'livestock-health-v1'],
      lastHealthCheck: new Date()
    };

    res.json(status);
  } catch (error) {
    console.error('AI status check error:', error);
    res.status(500).json({ error: 'Failed to check AI service status' });
  }
});

router.get('/models', async (req: AuthenticatedRequest, res) => {
  try {
    const models = [
      {
        name: 'Plant Disease Classifier',
        version: 'v1.0.0',
        type: 'crop' as const,
        url: process.env.PLANT_DISEASE_MODEL_URL || '',
        accuracy: 0.87,
        lastUpdated: new Date('2024-01-01')
      },
      {
        name: 'Livestock Health Assessor',
        version: 'v1.0.0',
        type: 'livestock' as const,
        url: process.env.LIVESTOCK_MODEL_URL || '',
        accuracy: 0.82,
        lastUpdated: new Date('2024-01-01')
      }
    ];

    res.json(models);
  } catch (error) {
    console.error('AI models fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch AI models' });
  }
});

router.post('/vision/diagnose', uploadSingle, async (req: AuthenticatedRequest, res) => {
  try {
    const { cropType, location } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const imageBase64 = file.buffer.toString('base64');
    const result = await aiProxyService.diagnoseVision(imageBase64, cropType, location);
    
    res.json(result);
  } catch (error) {
    console.error('Vision diagnosis error:', error);
    res.status(500).json({ error: 'Vision diagnosis failed' });
  }
});

router.post('/geo/ndvi', async (req: AuthenticatedRequest, res) => {
  try {
    const { fieldId, date, bbox } = req.body;
    
    if (!fieldId || !date || !bbox) {
      return res.status(400).json({ error: 'fieldId, date, and bbox are required' });
    }

    const result = await aiProxyService.getFieldNDVI(fieldId, date, bbox);
    res.json(result);
  } catch (error) {
    console.error('NDVI analysis error:', error);
    res.status(500).json({ error: 'NDVI analysis failed' });
  }
});

router.post('/chat/enhanced', async (req: AuthenticatedRequest, res) => {
  try {
    const { text, language = 'en', farmId } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const context = farmId ? { farm_id: farmId } : undefined;
    const result = await aiProxyService.chatWithAI(text, language, context);
    
    res.json(result);
  } catch (error) {
    console.error('Enhanced chat error:', error);
    res.status(500).json({ error: 'Enhanced chat failed' });
  }
});

router.get('/health/fastapi', async (req: AuthenticatedRequest, res) => {
  try {
    const isHealthy = await aiProxyService.healthCheck();
    res.json({ 
      fastapi_healthy: isHealthy,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Health check failed' });
  }
});

export { router as aiRoutes };
