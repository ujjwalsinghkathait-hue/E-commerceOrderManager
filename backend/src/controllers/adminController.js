import mongoose from 'mongoose';
import Order from '../models/Order.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { buildPagination } from '../utils/pagination.js';
import { adminUpdateOrder } from '../services/adminOrderService.js';

const adminOrderPopulate = [
  { path: 'user', select: 'name email role createdAt' },
  { path: 'items.product', select: 'name sku price stock images' },
];

export const getAdminAnalytics = asyncHandler(async (req, res) => {
  const [totalOrders, pendingOrders, revenueRows] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ orderStatus: 'pending' }),
    Order.aggregate([
      { $match: { orderStatus: 'delivered' } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
    ]),
  ]);

  const totalRevenue =
    revenueRows.length > 0 ? Math.round(revenueRows[0].totalRevenue * 100) / 100 : 0;

  res.status(200).json({
    success: true,
    data: {
      totalOrders,
      pendingOrders,
      totalRevenue,
    },
  });
});

export const listAdminUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const search = req.query.search ? String(req.query.search).trim() : '';
  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const [total, users] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter)
      .select('name email role createdAt updatedAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: buildPagination(page, limit, total),
    },
  });
});

export const listAdminOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const filter = {};

  if (req.query.orderStatus) {
    filter.orderStatus = String(req.query.orderStatus).trim();
  }
  if (req.query.paymentStatus) {
    filter.paymentStatus = String(req.query.paymentStatus).trim();
  }
  if (req.query.userId && mongoose.Types.ObjectId.isValid(req.query.userId)) {
    filter.user = req.query.userId;
  }
  if (req.query.search) {
    const q = String(req.query.search).trim();
    filter.orderNumber = { $regex: q, $options: 'i' };
  }

  const [total, orders] = await Promise.all([
    Order.countDocuments(filter),
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate(adminOrderPopulate)
      .lean(),
  ]);

  res.status(200).json({
    success: true,
    data: {
      orders,
      pagination: buildPagination(page, limit, total),
    },
  });
});

export const getAdminOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(adminOrderPopulate);

  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }

  res.status(200).json({
    success: true,
    data: { order },
  });
});

export const patchAdminOrder = asyncHandler(async (req, res) => {
  const { orderStatus, paymentStatus } = req.body;

  try {
    const order = await adminUpdateOrder({
      orderId: req.params.id,
      orderStatus,
      paymentStatus,
    });

    const populated = await Order.findById(order._id).populate(adminOrderPopulate);

    res.status(200).json({
      success: true,
      message: 'Order updated.',
      data: { order: populated },
    });
  } catch (err) {
    if (err?.message?.includes('Transaction numbers are only allowed')) {
      throw new ApiError(
        503,
        'This operation requires MongoDB replica set transactions (e.g. MongoDB Atlas).'
      );
    }
    throw err;
  }
});
