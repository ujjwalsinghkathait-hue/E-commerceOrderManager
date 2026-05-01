import { Router } from 'express';
import {
  createOrderFromCart,
  listMyOrders,
  getMyOrderById,
  cancelMyPendingOrder,
} from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';
import validateRequest from '../middleware/validateRequest.js';
import { validateMongoIdParam } from '../middleware/mongoId.js';
import { placeOrderValidators } from '../validators/orderValidators.js';

const router = Router();

router.use(protect);

router.post('/', placeOrderValidators, validateRequest, createOrderFromCart);
router.get('/my', listMyOrders);
router.get('/my/:id', validateMongoIdParam('id'), getMyOrderById);
router.patch('/my/:id/cancel', validateMongoIdParam('id'), cancelMyPendingOrder);

export default router;
