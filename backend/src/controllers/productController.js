import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { buildPagination } from '../utils/pagination.js';
import { slugify } from '../utils/slugify.js';

const SORT_MAP = {
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  name_asc: { name: 1 },
  name_desc: { name: -1 },
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
};

const populateCategory = {
  path: 'category',
  select: 'name slug description',
};

/**
 * Resolves `category` query param as ObjectId string, or null when no match.
 */
const resolveCategoryId = async (raw) => {
  if (!raw) {
    return null;
  }

  const value = String(raw).trim();

  if (mongoose.Types.ObjectId.isValid(value)) {
    const exists = await Category.exists({ _id: value });
    return exists ? value : null;
  }

  const category = await Category.findOne({ slug: slugify(value) });
  return category ? category._id.toString() : null;
};

const assertCategoryExists = async (categoryId) => {
  const exists = await Category.exists({ _id: categoryId });
  if (!exists) {
    throw new ApiError(400, 'Category does not exist.');
  }
};

export const listProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
  const skip = (page - 1) * limit;

  const filter = {};

  if (req.query.category) {
    const categoryId = await resolveCategoryId(req.query.category);
    if (!categoryId) {
      const pagination = buildPagination(page, limit, 0);
      return res.status(200).json({
        success: true,
        data: { products: [], pagination },
      });
    }
    filter.category = categoryId;
  }

  const search = req.query.search ? String(req.query.search).trim() : '';
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } },
    ];
  }

  const minPrice = req.query.minPrice;
  const maxPrice = req.query.maxPrice;
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) {
      const n = Number(minPrice);
      if (!Number.isNaN(n)) {
        filter.price.$gte = n;
      }
    }
    if (maxPrice !== undefined) {
      const n = Number(maxPrice);
      if (!Number.isNaN(n)) {
        filter.price.$lte = n;
      }
    }
    if (Object.keys(filter.price).length === 0) {
      delete filter.price;
    }
  }

  if (req.query.inStock === 'true' || req.query.inStock === '1') {
    filter.stock = { $gt: 0 };
  }

  const sortKey = req.query.sort ? String(req.query.sort) : 'newest';
  const sort = SORT_MAP[sortKey] || SORT_MAP.newest;

  const [total, products] = await Promise.all([
    Product.countDocuments(filter),
    Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(populateCategory)
      .lean(),
  ]);

  const pagination = buildPagination(page, limit, total);

  res.status(200).json({
    success: true,
    data: { products, pagination },
  });
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(populateCategory).lean();
  if (!product) {
    throw new ApiError(404, 'Product not found.');
  }

  res.status(200).json({
    success: true,
    data: { product },
  });
});

export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, stock, category, sku, images } = req.body;

  await assertCategoryExists(category);

  const product = await Product.create({
    name,
    description: description ?? '',
    price,
    stock,
    category,
    sku,
    images: Array.isArray(images) ? images : [],
  });

  const populated = await Product.findById(product._id).populate(populateCategory).lean();

  res.status(201).json({
    success: true,
    message: 'Product created.',
    data: { product: populated },
  });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, 'Product not found.');
  }

  const {
    name,
    description,
    price,
    stock,
    category,
    sku,
    images,
  } = req.body;

  if (category !== undefined) {
    await assertCategoryExists(category);
    product.category = category;
  }
  if (name !== undefined) {
    product.name = name;
  }
  if (description !== undefined) {
    product.description = description;
  }
  if (price !== undefined) {
    product.price = price;
  }
  if (stock !== undefined) {
    product.stock = stock;
  }
  if (sku !== undefined) {
    product.sku = sku;
  }
  if (images !== undefined) {
    product.images = images;
  }

  await product.save();

  const populated = await Product.findById(product._id).populate(populateCategory).lean();

  res.status(200).json({
    success: true,
    message: 'Product updated.',
    data: { product: populated },
  });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, 'Product not found.');
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Product deleted.',
  });
});
