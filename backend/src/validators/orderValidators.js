import { body } from 'express-validator';
import { PAYMENT_METHODS } from '../models/Order.js';

export const placeOrderValidators = [
  body('paymentMethod')
    .trim()
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(PAYMENT_METHODS)
    .withMessage(`Payment method must be one of: ${PAYMENT_METHODS.join(', ')}`),
  body('shippingAddress.fullName')
    .trim()
    .notEmpty()
    .withMessage('Recipient full name is required')
    .isLength({ max: 120 })
    .withMessage('Recipient full name is too long'),
  body('shippingAddress.line1')
    .trim()
    .notEmpty()
    .withMessage('Address line 1 is required')
    .isLength({ max: 200 })
    .withMessage('Address line 1 is too long'),
  body('shippingAddress.line2')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address line 2 is too long'),
  body('shippingAddress.city')
    .trim()
    .notEmpty()
    .withMessage('City is required')
    .isLength({ max: 120 })
    .withMessage('City is too long'),
  body('shippingAddress.state')
    .optional()
    .trim()
    .isLength({ max: 120 })
    .withMessage('State / region is too long'),
  body('shippingAddress.postalCode')
    .trim()
    .notEmpty()
    .withMessage('Postal code is required')
    .isLength({ max: 32 })
    .withMessage('Postal code is too long'),
  body('shippingAddress.country')
    .trim()
    .notEmpty()
    .withMessage('Country is required')
    .isLength({ max: 120 })
    .withMessage('Country is too long'),
  body('shippingAddress.phone')
    .optional()
    .trim()
    .isLength({ max: 32 })
    .withMessage('Phone is too long'),
];
