import { body } from 'express-validator';

const imageUrlRules = [
  body('images')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Images must be an array with at most 20 entries'),
  body('images.*')
    .optional()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Each image must be a valid http(s) URL'),
];

export const createProductValidators = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 200 })
    .withMessage('Name cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 10000 })
    .withMessage('Description is too long'),
  body('price')
    .toFloat()
    .isFloat({ min: 0 })
    .withMessage('Price must be a number greater than or equal to 0'),
  body('stock')
    .toInt()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('category').isMongoId().withMessage('A valid category id is required'),
  body('sku')
    .trim()
    .notEmpty()
    .withMessage('SKU is required')
    .isLength({ max: 64 })
    .withMessage('SKU cannot exceed 64 characters'),
  ...imageUrlRules,
];

export const updateProductValidators = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Name cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 10000 })
    .withMessage('Description is too long'),
  body('price')
    .optional()
    .toFloat()
    .isFloat({ min: 0 })
    .withMessage('Price must be a number greater than or equal to 0'),
  body('stock')
    .optional()
    .toInt()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('category').optional().isMongoId().withMessage('Category must be a valid id'),
  body('sku')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('SKU cannot be empty')
    .isLength({ max: 64 })
    .withMessage('SKU cannot exceed 64 characters'),
  ...imageUrlRules,
];
