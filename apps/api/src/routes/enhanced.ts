import express from 'express';
import { microLendingService } from '../services/microLendingService';
import { marketPriceService } from '../services/marketPriceService';
import { logisticsService } from '../services/logisticsService';
import { blockchainService } from '../services/blockchainService';

const router: express.Router = express.Router();

router.post('/micro-loans/apply', async (req, res) => {
  try {
    const application = req.body;
    const results = await microLendingService.submitLoanApplication(application);
    res.json({ success: true, results });
  } catch (error) {
    console.error('Loan application error:', error);
    res.status(500).json({ error: 'Failed to process loan application' });
  }
});

router.get('/micro-loans/status/:loanId/:lender', async (req, res) => {
  try {
    const { loanId, lender } = req.params;
    const status = await microLendingService.getLoanStatus(loanId, lender);
    res.json(status);
  } catch (error) {
    console.error('Loan status error:', error);
    res.status(500).json({ error: 'Failed to get loan status' });
  }
});

router.get('/market-prices/:commodity/:location', async (req, res) => {
  try {
    const { commodity, location } = req.params;
    const prices = await marketPriceService.getCurrentPrices(commodity, location);
    res.json(prices);
  } catch (error) {
    console.error('Market prices error:', error);
    res.status(500).json({ error: 'Failed to get market prices' });
  }
});

router.get('/market-alerts/:location', async (req, res) => {
  try {
    const { location } = req.params;
    const alerts = await marketPriceService.getMarketAlerts(location);
    res.json(alerts);
  } catch (error) {
    console.error('Market alerts error:', error);
    res.status(500).json({ error: 'Failed to get market alerts' });
  }
});

router.post('/logistics/quote', async (req, res) => {
  try {
    const deliveryRequest = req.body;
    const quotes = await logisticsService.requestDelivery(deliveryRequest);
    res.json(quotes);
  } catch (error) {
    console.error('Logistics quote error:', error);
    res.status(500).json({ error: 'Failed to get delivery quotes' });
  }
});

router.get('/logistics/track/:trackingId/:provider', async (req, res) => {
  try {
    const { trackingId, provider } = req.params;
    const tracking = await logisticsService.trackDelivery(trackingId, provider);
    res.json(tracking);
  } catch (error) {
    console.error('Tracking error:', error);
    res.status(500).json({ error: 'Failed to track delivery' });
  }
});

router.post('/logistics/schedule', async (req, res) => {
  try {
    const { deliveryRequest, selectedQuote } = req.body;
    const result = await logisticsService.schedulePickup(deliveryRequest, selectedQuote);
    res.json(result);
  } catch (error) {
    console.error('Schedule pickup error:', error);
    res.status(500).json({ error: 'Failed to schedule pickup' });
  }
});

router.post('/blockchain/register-animal', async (req, res) => {
  try {
    const animalData = req.body;
    const result = await blockchainService.registerAnimal(animalData);
    res.json(result);
  } catch (error) {
    console.error('Animal registration error:', error);
    res.status(500).json({ error: 'Failed to register animal' });
  }
});

router.post('/blockchain/health-record', async (req, res) => {
  try {
    const { animalId, healthRecord } = req.body;
    const result = await blockchainService.recordHealthEvent(animalId, healthRecord);
    res.json(result);
  } catch (error) {
    console.error('Health record error:', error);
    res.status(500).json({ error: 'Failed to record health event' });
  }
});

router.get('/blockchain/animal-history/:animalId', async (req, res) => {
  try {
    const { animalId } = req.params;
    const history = await blockchainService.getAnimalHistory(animalId);
    res.json(history);
  } catch (error) {
    console.error('Animal history error:', error);
    res.status(500).json({ error: 'Failed to get animal history' });
  }
});

router.post('/blockchain/register-produce', async (req, res) => {
  try {
    const produceData = req.body;
    const result = await blockchainService.registerProduce(produceData);
    res.json(result);
  } catch (error) {
    console.error('Produce registration error:', error);
    res.status(500).json({ error: 'Failed to register produce' });
  }
});

router.get('/blockchain/batch-history/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    const history = await blockchainService.getBatchHistory(batchId);
    res.json(history);
  } catch (error) {
    console.error('Batch history error:', error);
    res.status(500).json({ error: 'Failed to get batch history' });
  }
});

router.post('/blockchain/qr-code', async (req, res) => {
  try {
    const data = req.body;
    const qrCode = await blockchainService.generateQRCode(data);
    res.json({ qrCode });
  } catch (error) {
    console.error('QR code generation error:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

export default router;
