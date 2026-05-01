import { Router } from 'express';
import {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';
import validateRequest from '../middleware/validateRequest.js';
import { validateMongoIdParam } from '../middleware/mongoId.js';
import {
  createCategoryValidators,
  updateCategoryValidators,
} from '../validators/categoryValidators.js';

const router = Router();

router.get('/', listCategories);
router.get('/:id', validateMongoIdParam(), getCategoryById);

router.post(
  '/',
  protect,
  authorizeRoles('admin'),
  createCategoryValidators,
  validateRequest,
  createCategory
);

router.put(
  '/:id',
  protect,
  authorizeRoles('admin'),
  validateMongoIdParam(),
  updateCategoryValidators,
  validateRequest,
  updateCategory
);

router.delete(
  '/:id',
  protect,
  authorizeRoles('admin'),
  validateMongoIdParam(),
  deleteCategory
);

export default router;
