import { Router, Request, Response } from 'express';
import { DiagnosticRequest, DiagnosticResult } from '@zundenova/database';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router: Router = Router();

router.use(authenticateToken);

router.post('/request', async (req: AuthenticatedRequest, res) => {
  try {
    const { farmId, type, images, description, symptoms, location } = req.body;

    const diagnosticRequest = new DiagnosticRequest({
      userId: req.user!.uid,
      farmId,
      type,
      images,
      description,
      symptoms,
      location
    });

    await diagnosticRequest.save();

    res.status(201).json({
      id: diagnosticRequest._id,
      message: 'Diagnostic request submitted successfully'
    });
  } catch (error) {
    console.error('Diagnostic request error:', error);
    res.status(500).json({ error: 'Failed to submit diagnostic request' });
  }
});

router.get('/requests', async (req: AuthenticatedRequest, res) => {
  try {
    const requests = await DiagnosticRequest.find({
      userId: req.user!.uid
    }).sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Diagnostic requests fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch diagnostic requests' });
  }
});

router.get('/results/:requestId', async (req: AuthenticatedRequest, res) => {
  try {
    const { requestId } = req.params;

    const request = await DiagnosticRequest.findById(requestId);
    if (!request || request.userId !== req.user!.uid) {
      return res.status(404).json({ error: 'Diagnostic request not found' });
    }

    const result = await DiagnosticResult.findOne({ requestId });
    
    if (!result) {
      return res.status(404).json({ error: 'Diagnostic result not available yet' });
    }

    res.json(result);
  } catch (error) {
    console.error('Diagnostic result fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch diagnostic result' });
  }
});

export { router as diagnosticRoutes };
