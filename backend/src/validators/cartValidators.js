import { body } from 'express-validator';

export const addCartItemValidators = [
  body('product').isMongoId().withMessage('A valid product id is required'),
  body('quantity')
    .optional()
    .toInt()
    .isInt({ min: 1, max: 999 })
    .withMessage('Quantity must be an integer between 1 and 999'),
];

export const updateCartItemValidators = [
  body('quantity')
    .toInt()
    .isInt({ min: 1, max: 999 })
    .withMessage('Quantity must be an integer between 1 and 999'),
];
