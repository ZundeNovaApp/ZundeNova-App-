import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';
import { authenticateToken, AuthenticatedRequest, requireRole } from '../middleware/auth';
import { paymentService } from '../services/paymentService';

const router: Router = Router();

router.use(authenticateToken);

router.get('/products', async (req: AuthenticatedRequest, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    
    const where: any = {};
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        seller: {
          select: { id: true, name: true, profileImage: true }
        }
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.product.count({ where });

    res.json({
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.post('/products', requireRole(['AGRO_DEALER', 'ADMIN']), async (req: AuthenticatedRequest, res) => {
  try {
    const { name, description, category, price, currency, images, availability } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        category,
        price,
        currency,
        images,
        availability,
        sellerId: req.user!.uid
      }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.post('/orders', async (req: AuthenticatedRequest, res) => {
  try {
    const { items, shippingAddress } = req.body;

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: itemTotal
      });
    }

    const order = await prisma.order.create({
      data: {
        buyerId: req.user!.uid,
        sellerId: items[0].sellerId,
        totalAmount,
        currency: 'USD',
        status: 'PENDING',
        paymentStatus: 'PENDING',
        shippingAddress,
        items: {
          create: orderItems
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

router.post('/payment/verify', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { transactionId, paymentMethod, orderId } = req.body;

    if (!transactionId || !paymentMethod || !orderId) {
      return res.status(400).json({ error: 'Transaction ID, payment method, and order ID are required' });
    }

    const verificationResult = await paymentService.verifyPayment(transactionId, paymentMethod);

    if (verificationResult.status === 'success' || verificationResult.data?.status === 'success') {
      const order = await prisma.order.findUnique({
        where: { id: orderId }
      });
      if (order && order.buyerId === req.user!.uid) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'PAID',
            status: 'CONFIRMED'
          }
        });

        const updatedOrder = await prisma.order.findUnique({
          where: { id: orderId }
        });
        
        res.json({
          success: true,
          message: 'Payment verified successfully',
          order: {
            id: updatedOrder?.id,
            status: updatedOrder?.status,
            totalAmount: updatedOrder?.totalAmount
          }
        });
      } else {
        res.status(404).json({ error: 'Order not found' });
      }
    } else {
      res.status(400).json({
        success: false,
        error: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

router.post('/payment/refund', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { orderId, reason } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });
    if (!order || order.buyerId !== req.user!.uid) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.paymentStatus !== 'PAID') {
      return res.status(400).json({ error: 'Only paid orders can be refunded' });
    }

    const refundResult = await paymentService.refundPayment(
      order.id,
      order.totalAmount
    );

    if (refundResult.success) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
          paymentStatus: 'REFUNDED'
        }
      });

      res.json({
        success: true,
        message: 'Refund processed successfully',
        refundId: refundResult.transactionId
      });
    } else {
      res.status(400).json({
        success: false,
        error: refundResult.error
      });
    }
  } catch (error) {
    console.error('Refund processing error:', error);
    res.status(500).json({ error: 'Refund processing failed' });
  }
});

export { router as marketplaceRoutes };
