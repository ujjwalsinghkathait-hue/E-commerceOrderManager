import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../middleware/asyncHandler.js';

const productPopulate = {
  path: 'items.product',
  select: 'name price stock images sku description category',
  populate: { path: 'category', select: 'name slug' },
};

const getOrCreateCartDoc = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

const pruneStaleLines = async (cart) => {
  await cart.populate(productPopulate);

  const cleaned = cart.items
    .filter((line) => line.product != null)
    .map((line) => ({
      product: line.product._id,
      quantity: line.quantity,
    }));

  if (cleaned.length !== cart.items.length) {
    cart.items = cleaned;
    cart.markModified('items');
    await cart.save();
    await cart.populate(productPopulate);
  }
};

const buildSummary = (cart) => {
  let subtotal = 0;
  let unitCount = 0;
  for (const line of cart.items) {
    if (!line.product) {
      continue;
    }
    subtotal += line.product.price * line.quantity;
    unitCount += line.quantity;
  }
  return {
    lineCount: cart.items.length,
    unitCount,
    subtotal: Math.round(subtotal * 100) / 100,
  };
};

export const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCartDoc(req.user._id);
  await pruneStaleLines(cart);

  res.status(200).json({
    success: true,
    data: {
      cart,
      summary: buildSummary(cart),
    },
  });
});

export const addToCart = asyncHandler(async (req, res) => {
  const productId = req.body.product;
  const quantity = req.body.quantity != null ? Number(req.body.quantity) : 1;

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found.');
  }
  if (product.stock < 1) {
    throw new ApiError(400, 'This product is out of stock.');
  }

  const cart = await getOrCreateCartDoc(req.user._id);

  const idx = cart.items.findIndex((line) => line.product.equals(product._id));
  const currentQty = idx >= 0 ? cart.items[idx].quantity : 0;
  const newQty = currentQty + quantity;

  if (newQty > product.stock) {
    throw new ApiError(
      400,
      `Only ${product.stock} unit(s) available in stock. Your cart already has ${currentQty}.`
    );
  }

  if (idx >= 0) {
    cart.items[idx].quantity = newQty;
  } else {
    cart.items.push({ product: product._id, quantity });
  }

  await cart.save();
  await cart.populate(productPopulate);

  res.status(200).json({
    success: true,
    message: 'Cart updated.',
    data: { cart, summary: buildSummary(cart) },
  });
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const productId = req.params.productId;
  const quantity = Number(req.body.quantity);

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found.');
  }

  const cart = await getOrCreateCartDoc(req.user._id);
  const idx = cart.items.findIndex((line) => line.product.equals(productId));

  if (idx < 0) {
    throw new ApiError(404, 'This product is not in your cart.');
  }

  if (quantity > product.stock) {
    throw new ApiError(
      400,
      `Only ${product.stock} unit(s) available in stock.`
    );
  }

  cart.items[idx].quantity = quantity;
  await cart.save();
  await cart.populate(productPopulate);

  res.status(200).json({
    success: true,
    message: 'Cart item updated.',
    data: { cart, summary: buildSummary(cart) },
  });
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const productId = req.params.productId;

  const cart = await getOrCreateCartDoc(req.user._id);

  const before = cart.items.length;
  cart.items = cart.items.filter((line) => !line.product.equals(productId));

  if (cart.items.length === before) {
    throw new ApiError(404, 'This product is not in your cart.');
  }

  await cart.save();
  await cart.populate(productPopulate);

  res.status(200).json({
    success: true,
    message: 'Item removed from cart.',
    data: { cart, summary: buildSummary(cart) },
  });
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCartDoc(req.user._id);
  cart.items = [];
  await cart.save();
  await cart.populate(productPopulate);

  res.status(200).json({
    success: true,
    message: 'Cart cleared.',
    data: { cart, summary: buildSummary(cart) },
  });
});
