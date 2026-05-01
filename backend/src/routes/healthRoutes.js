import { Router } from 'express';

const router = Router();

/**
 * Liveness check for load balancers and local verification.
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
