import mongoose from 'mongoose';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import ApiError from '../utils/ApiError.js';

export const runWithTransaction = async (fn) => {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result;
  } finally {
    session.endSession();
  }
};

/**
 * Creates an order from the user's cart, decrements stock, and clears the cart.
 * Uses a MongoDB transaction (requires a replica set, e.g. MongoDB Atlas).
 */
export const placeOrderFromCart = async ({
  userId,
  shippingAddress,
  paymentMethod,
}) =>
  runWithTransaction(async (session) => {
    const cart = await Cart.findOne({ user: userId })
      .session(session)
      .populate({ path: 'items.product' });

    if (!cart || !cart.items.length) {
      throw new ApiError(400, 'Your cart is empty.');
    }

    for (const line of cart.items) {
      if (!line.product) {
        throw new ApiError(
          400,
          'Your cart contains a product that is no longer available. Please refresh your cart.'
        );
      }
      if (line.product.stock < line.quantity) {
        throw new ApiError(
          400,
          `Insufficient stock for "${line.product.name}". Available: ${line.product.stock}, requested: ${line.quantity}.`
        );
      }
    }

    const orderItems = cart.items.map((line) => ({
      product: line.product._id,
      name: line.product.name,
      sku: line.product.sku,
      unitPrice: line.product.price,
      quantity: line.quantity,
    }));

    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );

    for (const line of cart.items) {
      const updated = await Product.findOneAndUpdate(
        { _id: line.product._id, stock: { $gte: line.quantity } },
        { $inc: { stock: -line.quantity } },
        { new: true, session }
      );

      if (!updated) {
        throw new ApiError(
          400,
          `Could not reserve stock for "${line.product.name}". Please try again.`
        );
      }
    }

    const [order] = await Order.create(
      [
        {
          user: userId,
          items: orderItems,
          shippingAddress,
          paymentMethod,
          paymentStatus: 'pending',
          orderStatus: 'pending',
          subtotal,
          total: subtotal,
        },
      ],
      { session }
    );

    cart.items = [];
    await cart.save({ session });

    return order;
  });

/**
 * Customer cancellation while the order is still `pending` (before fulfillment).
 * Restores product stock and sets `orderStatus` to `cancelled`.
 */
export const cancelPendingOrderForUser = async ({ userId, orderId }) =>
  runWithTransaction(async (session) => {
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    }).session(session);

    if (!order) {
      throw new ApiError(404, 'Order not found.');
    }

    if (order.orderStatus !== 'pending') {
      throw new ApiError(
        400,
        'Only orders that are still pending can be cancelled this way.'
      );
    }

    for (const item of order.items) {
      await Product.updateOne(
        { _id: item.product },
        { $inc: { stock: item.quantity } },
        { session }
      );
    }

    order.orderStatus = 'cancelled';
    if (order.paymentStatus === 'paid') {
      order.paymentStatus = 'refunded';
    }

    await order.save({ session });

    return order;
  });
