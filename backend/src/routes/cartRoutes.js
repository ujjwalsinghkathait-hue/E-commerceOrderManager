import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../controllers/cartController.js';
import { protect } from '../middleware/auth.js';
import validateRequest from '../middleware/validateRequest.js';
import { validateMongoIdParam } from '../middleware/mongoId.js';
import {
  addCartItemValidators,
  updateCartItemValidators,
} from '../validators/cartValidators.js';

const router = Router();

router.use(protect);

router.get('/', getCart);
router.post('/items', addCartItemValidators, validateRequest, addToCart);
router.patch(
  '/items/:productId',
  validateMongoIdParam('productId'),
  updateCartItemValidators,
  validateRequest,
  updateCartItem
);
router.delete('/items/:productId', validateMongoIdParam('productId'), removeCartItem);
router.delete('/', clearCart);

export default router;
