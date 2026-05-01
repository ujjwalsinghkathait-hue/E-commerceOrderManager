import { body, check } from 'express-validator';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '../models/Order.js';

export const adminUpdateOrderValidators = [
  body('orderStatus')
    .optional()
    .trim()
    .isIn(ORDER_STATUSES)
    .withMessage(`orderStatus must be one of: ${ORDER_STATUSES.join(', ')}`),
  body('paymentStatus')
    .optional()
    .trim()
    .isIn(PAYMENT_STATUSES)
    .withMessage(`paymentStatus must be one of: ${PAYMENT_STATUSES.join(', ')}`),
  check().custom((_, { req }) => {
    if (req.body.orderStatus === undefined && req.body.paymentStatus === undefined) {
      throw new Error('At least one of orderStatus or paymentStatus is required.');
    }
    return true;
  }),
];
