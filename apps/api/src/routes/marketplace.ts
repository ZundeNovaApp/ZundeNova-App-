import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';
import { authenticateToken, AuthenticatedRequest, requireRole } from '../middleware/auth';

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

export { router as marketplaceRoutes };
