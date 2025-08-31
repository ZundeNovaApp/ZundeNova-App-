import { Router, Request, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { aiService } from '../services/aiService';

const router: Router = Router();

router.use(authenticateToken);

router.post('/message', async (req: AuthenticatedRequest, res) => {
  try {
    const { message, language = 'en', context = 'agriculture' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const botResponse = await aiService.generateChatResponse(message, language, context);

    res.json({
      response: botResponse,
      language,
      context,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

router.get('/history', async (req: AuthenticatedRequest, res) => {
  try {
    res.json({
      conversations: [],
      message: 'Chat history feature coming soon'
    });
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

export { router as chatRoutes };
