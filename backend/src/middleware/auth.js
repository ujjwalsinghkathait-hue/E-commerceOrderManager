import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from './asyncHandler.js';

/**
 * Requires `Authorization: Bearer <JWT>`. Attaches full user document to `req.user` (password excluded).
 */
export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  const token =
    header && header.startsWith('Bearer ') ? header.slice(7).trim() : null;

  if (!token) {
    throw new ApiError(401, 'Not authorized. No bearer token provided.');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, 'Not authorized. Invalid or expired token.');
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    throw new ApiError(401, 'Not authorized. User no longer exists.');
  }

  req.user = user;
  next();
});

/**
 * Use after `protect`. Restricts route to given roles.
 * @param  {...string} roles - e.g. 'admin'
 */
export const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, 'Forbidden: insufficient permissions.'));
  }
  next();
};
