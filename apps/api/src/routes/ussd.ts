import { Router, Request, Response } from 'express';
import { africasTalkingService } from '../services/africasTalkingService';

const router: Router = Router();

interface USSDRequest {
  sessionId: string;
  serviceCode: string;
  phoneNumber: string;
  text: string;
}

router.post('/session', async (req: Request, res: Response) => {
  try {
    const { sessionId, serviceCode, phoneNumber, text }: USSDRequest = req.body;
    
    console.log('USSD session:', { sessionId, serviceCode, phoneNumber, text });
    
    const menuResponse = await africasTalkingService.handleUSSDSession({
      sessionId,
      serviceCode,
      phoneNumber,
      text
    });
    
    res.set('Content-Type', 'text/plain');
    res.send(menuResponse);
  } catch (error) {
    console.error('USSD session error:', error);
    res.status(500).send('END Service temporarily unavailable. Please try again later.');
  }
});

router.post('/sms-callback', async (req: Request, res: Response) => {
  try {
    const { from, to, text, date, id, linkId } = req.body;
    
    console.log('SMS received:', { from, to, text, date, id });
    
    if (text.toLowerCase().includes('photo') || text.toLowerCase().includes('image')) {
      await africasTalkingService.sendSMS(
        from,
        'Thank you for your photo submission. Our AI is analyzing your crop. You will receive results within 30 minutes.'
      );
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('SMS callback error:', error);
    res.status(500).json({ error: 'SMS processing failed' });
  }
});

router.post('/delivery-report', async (req: Request, res: Response) => {
  try {
    const { id, status, phoneNumber, failureReason } = req.body;
    
    console.log('SMS delivery report:', { id, status, phoneNumber, failureReason });
    
    if (status === 'Failed') {
      console.error('SMS delivery failed:', { phoneNumber, failureReason });
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Delivery report error:', error);
    res.status(500).json({ error: 'Delivery report processing failed' });
  }
});

router.post('/send-alert', async (req: Request, res: Response) => {
  try {
    const { phoneNumbers, message, alertType } = req.body;
    
    if (!phoneNumbers || !Array.isArray(phoneNumbers) || !message) {
      return res.status(400).json({ error: 'Phone numbers and message are required' });
    }
    
    const formattedMessage = `🚨 ZundeNova Alert: ${message}`;
    const success = await africasTalkingService.sendBulkSMS(phoneNumbers, formattedMessage);
    
    res.json({ 
      success, 
      message: success ? 'Alert sent successfully' : 'Failed to send alert',
      recipients: phoneNumbers.length
    });
  } catch (error) {
    console.error('Bulk SMS alert error:', error);
    res.status(500).json({ error: 'Failed to send alert' });
  }
});

router.post('/sms', async (req: Request, res: Response) => {
  try {
    const { from, text, to } = req.body;
    
    const response = await africasTalkingService.handleSMS({
      from,
      text,
      to
    });
    
    res.json({ success: true, response });
  } catch (error) {
    console.error('SMS handling error:', error);
    res.status(500).json({ error: 'SMS processing failed' });
  }
});

router.get('/test', (req: Request, res: Response) => {
  res.json({ 
    message: 'USSD service is running',
    endpoints: [
      'POST /session - Handle USSD sessions',
      'POST /sms-callback - Handle incoming SMS',
      'POST /delivery-report - Handle delivery reports',
      'POST /send-alert - Send bulk SMS alerts',
      'POST /sms - Legacy SMS handler'
    ]
  });
});

export { router as ussdRoutes };
