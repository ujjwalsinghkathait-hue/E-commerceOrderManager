import { Router } from 'express';
import {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';
import validateRequest from '../middleware/validateRequest.js';
import { validateMongoIdParam } from '../middleware/mongoId.js';
import {
  createProductValidators,
  updateProductValidators,
} from '../validators/productValidators.js';

const router = Router();

router.get('/', listProducts);
router.get('/:id', validateMongoIdParam(), getProductById);

router.post(
  '/',
  protect,
  authorizeRoles('admin'),
  createProductValidators,
  validateRequest,
  createProduct
);

router.put(
  '/:id',
  protect,
  authorizeRoles('admin'),
  validateMongoIdParam(),
  updateProductValidators,
  validateRequest,
  updateProduct
);

router.delete(
  '/:id',
  protect,
  authorizeRoles('admin'),
  validateMongoIdParam(),
  deleteProduct
);

export default router;
