import { Router, Request, Response } from 'express';
import { DiagnosticRequest, DiagnosticResult } from '@zundenova/database';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { uploadSingle, uploadToFirebaseStorage, handleUploadError } from '../middleware/upload';
import { aiService } from '../services/aiService';

const router: Router = Router();

router.use(authenticateToken);

router.post('/request', uploadSingle, async (req: AuthenticatedRequest, res) => {
  try {
    const { farmId, type, description, symptoms, location } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Image file is required for diagnosis' });
    }

    const imageUrl = await uploadToFirebaseStorage(file, 'diagnostics');

    const diagnosticRequest = new DiagnosticRequest({
      userId: req.user!.uid,
      farmId,
      type,
      images: [imageUrl],
      description,
      symptoms: symptoms ? symptoms.split(',').map((s: string) => s.trim()) : [],
      location
    });

    await diagnosticRequest.save();

    processWithAI(String(diagnosticRequest._id), file.buffer, type);

    res.status(201).json({
      id: diagnosticRequest._id,
      message: 'Diagnostic request submitted successfully. AI analysis in progress.'
    });
  } catch (error) {
    console.error('Diagnostic request error:', error);
    res.status(500).json({ error: 'Failed to submit diagnostic request' });
  }
});

async function processWithAI(requestId: string, imageBuffer: Buffer, type: string) {
  try {
    let aiResult;
    
    if (type === 'crop') {
      aiResult = await aiService.classifyPlantDisease(imageBuffer);
    } else if (type === 'livestock') {
      aiResult = await aiService.classifyLivestockHealth(imageBuffer);
    } else {
      aiResult = {
        diagnosis: 'Soil analysis pending',
        confidence: 0.5,
        severity: 'medium' as const,
        recommendations: ['Soil sample analysis recommended']
      };
    }

    const diagnosticResult = new DiagnosticResult({
      requestId,
      confidence: aiResult.confidence,
      diagnosis: aiResult.diagnosis,
      recommendations: aiResult.recommendations,
      severity: aiResult.severity,
      followUpRequired: aiResult.severity === 'high' || aiResult.severity === 'critical',
      modelVersion: 'v1.0.0'
    });

    await diagnosticResult.save();
    console.log(`✅ AI processing completed for request ${requestId}`);
  } catch (error) {
    console.error(`❌ AI processing failed for request ${requestId}:`, error);
  }
}

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
      return res.status(202).json({ 
        message: 'Diagnostic result not available yet. AI analysis in progress.',
        status: 'processing'
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Diagnostic result fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch diagnostic result' });
  }
});

router.use(handleUploadError);

export { router as diagnosticRoutes };
