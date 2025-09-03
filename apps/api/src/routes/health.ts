import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';

const router: ExpressRouter = Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

export default router;
