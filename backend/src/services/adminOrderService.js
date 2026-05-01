import Order, { ORDER_STATUSES, PAYMENT_STATUSES } from '../models/Order.js';
import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import { runWithTransaction } from './orderService.js';

/**
 * Admin updates `orderStatus` and/or `paymentStatus`.
 * Moving into `cancelled` restores inventory once (from any non-cancelled status).
 * Cancelled orders cannot change fulfillment status again; `paymentStatus` may still be updated.
 */
export const adminUpdateOrder = async ({ orderId, orderStatus, paymentStatus }) =>
  runWithTransaction(async (session) => {
    const order = await Order.findById(orderId).session(session);

    if (!order) {
      throw new ApiError(404, 'Order not found.');
    }

    if (order.orderStatus === 'cancelled') {
      if (orderStatus !== undefined && orderStatus !== 'cancelled') {
        throw new ApiError(
          400,
          'Cancelled orders cannot change fulfillment status.'
        );
      }
    }

    const prevOrderStatus = order.orderStatus;

    if (orderStatus !== undefined) {
      if (!ORDER_STATUSES.includes(orderStatus)) {
        throw new ApiError(400, 'Invalid order status.');
      }

      if (orderStatus === 'cancelled' && prevOrderStatus !== 'cancelled') {
        for (const item of order.items) {
          await Product.updateOne(
            { _id: item.product },
            { $inc: { stock: item.quantity } },
            { session }
          );
        }
      }

      order.orderStatus = orderStatus;
    }

    if (paymentStatus !== undefined) {
      if (!PAYMENT_STATUSES.includes(paymentStatus)) {
        throw new ApiError(400, 'Invalid payment status.');
      }
      order.paymentStatus = paymentStatus;
    }

    if (orderStatus === undefined && paymentStatus === undefined) {
      throw new ApiError(400, 'Provide orderStatus and/or paymentStatus to update.');
    }

    await order.save({ session });

    return order;
  });
