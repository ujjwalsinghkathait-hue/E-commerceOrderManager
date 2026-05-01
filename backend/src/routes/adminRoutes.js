import { Router } from 'express';
import { protect, authorizeRoles } from '../middleware/auth.js';
import validateRequest from '../middleware/validateRequest.js';
import { validateMongoIdParam } from '../middleware/mongoId.js';
import { adminUpdateOrderValidators } from '../validators/adminValidators.js';
import {
  getAdminAnalytics,
  listAdminUsers,
  listAdminOrders,
  getAdminOrderById,
  patchAdminOrder,
} from '../controllers/adminController.js';

const router = Router();

router.use(protect, authorizeRoles('admin'));

router.get('/analytics', getAdminAnalytics);
router.get('/users', listAdminUsers);
router.get('/orders', listAdminOrders);
router.get('/orders/:id', validateMongoIdParam(), getAdminOrderById);
router.patch(
  '/orders/:id',
  validateMongoIdParam(),
  adminUpdateOrderValidators,
  validateRequest,
  patchAdminOrder
);

export default router;
