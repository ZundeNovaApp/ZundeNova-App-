import { Router, Request, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { aiService } from '../services/aiService';

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

export { router as aiRoutes };
