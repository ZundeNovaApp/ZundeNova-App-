import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';
import { authenticateToken, AuthenticatedRequest, requireRole } from '../middleware/auth';

const router: Router = Router();

router.use(authenticateToken);

router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const farms = await prisma.farm.findMany({
      where: { ownerId: req.user!.uid },
      include: {
        crops: true,
        livestock: true
      }
    });

    res.json(farms);
  } catch (error) {
    console.error('Farms fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch farms' });
  }
});

router.post('/', requireRole(['FARMER']), async (req: AuthenticatedRequest, res) => {
  try {
    const { name, latitude, longitude, address, size, sizeUnit, soilType } = req.body;

    const farm = await prisma.farm.create({
      data: {
        ownerId: req.user!.uid,
        name,
        latitude,
        longitude,
        address,
        size,
        sizeUnit,
        soilType
      }
    });

    res.status(201).json(farm);
  } catch (error) {
    console.error('Farm creation error:', error);
    res.status(500).json({ error: 'Failed to create farm' });
  }
});

router.post('/:farmId/crops', requireRole(['FARMER']), async (req: AuthenticatedRequest, res) => {
  try {
    const { farmId } = req.params;
    const { name, variety, plantingDate, expectedHarvestDate, area, status, notes } = req.body;

    const farm = await prisma.farm.findFirst({
      where: { id: farmId, ownerId: req.user!.uid }
    });

    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    const crop = await prisma.crop.create({
      data: {
        farmId,
        name,
        variety,
        plantingDate: new Date(plantingDate),
        expectedHarvestDate: new Date(expectedHarvestDate),
        area,
        status,
        notes
      }
    });

    res.status(201).json(crop);
  } catch (error) {
    console.error('Crop creation error:', error);
    res.status(500).json({ error: 'Failed to create crop' });
  }
});

export { router as farmRoutes };
