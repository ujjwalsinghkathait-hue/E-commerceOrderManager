import Category from '../models/Category.js';
import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../middleware/asyncHandler.js';

export const listCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 }).lean();

  res.status(200).json({
    success: true,
    data: { categories },
  });
});

export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id).lean();
  if (!category) {
    throw new ApiError(404, 'Category not found.');
  }

  res.status(200).json({
    success: true,
    data: { category },
  });
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const category = await Category.create({
    name,
    description: description ?? '',
  });

  res.status(201).json({
    success: true,
    message: 'Category created.',
    data: { category },
  });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new ApiError(404, 'Category not found.');
  }

  if (req.body.name !== undefined) {
    category.name = req.body.name;
  }
  if (req.body.description !== undefined) {
    category.description = req.body.description;
  }

  await category.save();

  res.status(200).json({
    success: true,
    message: 'Category updated.',
    data: { category },
  });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new ApiError(404, 'Category not found.');
  }

  const linked = await Product.countDocuments({ category: category._id });
  if (linked > 0) {
    throw new ApiError(
      400,
      `Cannot delete category: ${linked} product(s) still reference it.`
    );
  }

  await category.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Category deleted.',
  });
});
