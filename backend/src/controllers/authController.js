import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { signToken } from '../utils/signToken.js';
import asyncHandler from '../middleware/asyncHandler.js';

const invalidCredentialsMessage = 'Invalid email or password.';

/**
 * POST /api/auth/register
 * Always creates a `customer`. Role escalation via registration is not allowed.
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: 'customer',
  });

  const token = signToken(user._id.toString());

  res.status(201).json({
    success: true,
    message: 'Registration successful.',
    data: {
      user: user.toSafeObject(),
      token,
    },
  });
});

/**
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(401, invalidCredentialsMessage);
  }

  const match = await user.comparePassword(password);
  if (!match) {
    throw new ApiError(401, invalidCredentialsMessage);
  }

  const token = signToken(user._id.toString());

  res.status(200).json({
    success: true,
    message: 'Login successful.',
    data: {
      user: user.toSafeObject(),
      token,
    },
  });
});

/**
 * GET /api/auth/me
 */
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: { user: req.user.toSafeObject() },
  });
});
