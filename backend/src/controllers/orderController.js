import Order from '../models/Order.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { buildPagination } from '../utils/pagination.js';
import {
  placeOrderFromCart,
  cancelPendingOrderForUser,
} from '../services/orderService.js';

const orderPopulate = [
  { path: 'items.product', select: 'name sku price images' },
];

export const createOrderFromCart = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;

  try {
    const order = await placeOrderFromCart({
      userId: req.user._id,
      shippingAddress,
      paymentMethod: String(paymentMethod).toLowerCase(),
    });

    const populated = await Order.findById(order._id).populate(orderPopulate);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      data: { order: populated },
    });
  } catch (err) {
    if (err?.message?.includes('Transaction numbers are only allowed')) {
      throw new ApiError(
        503,
        'Orders require MongoDB replica set transactions. Use MongoDB Atlas or a replica set for local development.'
      );
    }
    throw err;
  }
});

export const listMyOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const filter = { user: req.user._id };

  const [total, orders] = await Promise.all([
    Order.countDocuments(filter),
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate(orderPopulate)
      .lean(),
  ]);

  const pagination = buildPagination(page, limit, total);

  res.status(200).json({
    success: true,
    data: { orders, pagination },
  });
});

export const getMyOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).populate(orderPopulate);

  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }

  res.status(200).json({
    success: true,
    data: { order },
  });
});

export const cancelMyPendingOrder = asyncHandler(async (req, res) => {
  try {
    const order = await cancelPendingOrderForUser({
      userId: req.user._id,
      orderId: req.params.id,
    });

    const populated = await Order.findById(order._id).populate(orderPopulate);

    res.status(200).json({
      success: true,
      message: 'Order cancelled and stock restored.',
      data: { order: populated },
    });
  } catch (err) {
    if (err?.message?.includes('Transaction numbers are only allowed')) {
      throw new ApiError(
        503,
        'Cancelling orders requires MongoDB replica set transactions. Use MongoDB Atlas or a replica set for local development.'
      );
    }
    throw err;
  }
});
