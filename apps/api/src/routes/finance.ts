import { Router } from 'express';
import { authenticateToken, AuthenticatedRequest, requireRole } from '../middleware/auth';
import { prisma } from '../config/database';

const router: Router = Router();

router.use(authenticateToken);

router.get('/transactions/:farmId', async (req: AuthenticatedRequest, res) => {
  try {
    const { farmId } = req.params;
    const { page = 1, limit = 20, type } = req.query;

    const farm = await prisma.farm.findFirst({
      where: { id: farmId, ownerId: req.user!.uid }
    });

    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    const whereClause: any = { farmId };
    if (type && (type === 'income' || type === 'expense')) {
      whereClause.type = type;
    }

    const transactions: any[] = [];
    const total = 0;

    res.json({
      transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Transactions fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

router.post('/transactions', requireRole(['FARMER']), async (req: AuthenticatedRequest, res) => {
  try {
    const { farmId, type, amount, currency, description, category, paymentMethod, receiptUrl, tags, cropId, livestockId } = req.body;

    const farm = await prisma.farm.findFirst({
      where: { id: farmId, ownerId: req.user!.uid }
    });

    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    const transaction = {
      id: `trans_${Date.now()}`,
      farmId,
      type,
      amount: parseFloat(amount),
      currency: currency || 'USD',
      description,
      category,
      paymentMethod,
      receiptUrl,
      tags: tags || [],
      cropId,
      livestockId,
      date: new Date()
    };

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Transaction creation error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

router.get('/summary/:farmId', async (req: AuthenticatedRequest, res) => {
  try {
    const { farmId } = req.params;
    const { period = 'month' } = req.query;

    const farm = await prisma.farm.findFirst({
      where: { id: farmId, ownerId: req.user!.uid }
    });

    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    let startDate = new Date();
    if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'quarter') {
      startDate.setMonth(startDate.getMonth() - 3);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const transactions: any[] = [];

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryBreakdown = transactions.reduce((acc: any, t) => {
      if (!acc[t.category]) {
        acc[t.category] = { income: 0, expense: 0 };
      }
      acc[t.category][t.type] += t.amount;
      return acc;
    }, {});

    res.json({
      period,
      summary: {
        totalIncome: income,
        totalExpenses: expenses,
        netProfit: income - expenses,
        transactionCount: transactions.length
      },
      categoryBreakdown
    });
  } catch (error) {
    console.error('Financial summary error:', error);
    res.status(500).json({ error: 'Failed to generate financial summary' });
  }
});

router.post('/bnpl/apply', requireRole(['FARMER']), async (req: AuthenticatedRequest, res) => {
  try {
    const { farmId, requestedAmount, currency, purpose, products } = req.body;

    const farm = await prisma.farm.findFirst({
      where: { id: farmId, ownerId: req.user!.uid }
    });

    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    const mockCreditAssessment = {
      score: Math.floor(Math.random() * 300) + 500,
      riskLevel: 'medium',
      recommendedLimit: requestedAmount * 0.8,
      factors: [
        { factor: 'Farm size', value: farm.size, weight: 0.3, impact: 'positive' },
        { factor: 'Transaction history', value: 85, weight: 0.4, impact: 'positive' },
        { factor: 'Crop diversity', value: 3, weight: 0.3, impact: 'positive' }
      ]
    };

    const application: any = {
      id: `bnpl_${Date.now()}`,
      farmerId: req.user!.uid,
      farmId,
      requestedAmount: parseFloat(requestedAmount),
      currency: currency || 'USD',
      purpose,
      products: products || [],
      creditAssessment: mockCreditAssessment,
      status: mockCreditAssessment.score > 650 ? 'approved' : 'pending',
      applicationDate: new Date()
    };

    if (application.status === 'approved') {
      application.approvedAmount = mockCreditAssessment.recommendedLimit;
      application.interestRate = 12.5;
      application.repaymentTerms = {
        totalAmount: mockCreditAssessment.recommendedLimit * 1.125,
        installments: 6,
        installmentAmount: (mockCreditAssessment.recommendedLimit * 1.125) / 6,
        frequency: 'monthly',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000)
      };
    }

    res.status(201).json(application);
  } catch (error) {
    console.error('BNPL application error:', error);
    res.status(500).json({ error: 'Failed to process BNPL application' });
  }
});

router.post('/insurance/apply', requireRole(['FARMER']), async (req: AuthenticatedRequest, res) => {
  try {
    const { farmId, policyType, coverageAmount, parameters } = req.body;

    const farm = await prisma.farm.findFirst({
      where: { id: farmId, ownerId: req.user!.uid }
    });

    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    const basePremium = coverageAmount * 0.05;
    const riskAdjustment = policyType === 'weather_index' ? 0.8 : 1.0;
    const premium = basePremium * riskAdjustment;

    const policy = {
      id: `ins_${Date.now()}`,
      farmerId: req.user!.uid,
      farmId,
      policyType,
      policyNumber: `POL-${Date.now()}`,
      coverageAmount: parseFloat(coverageAmount),
      premium,
      currency: 'USD',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      status: 'active',
      parameters: parameters || [],
      claims: []
    };

    res.status(201).json(policy);
  } catch (error) {
    console.error('Insurance application error:', error);
    res.status(500).json({ error: 'Failed to process insurance application' });
  }
});

export { router as financeRoutes };
