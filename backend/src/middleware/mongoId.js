import mongoose from 'mongoose';
import ApiError from '../utils/ApiError.js';

/**
 * Validates `req.params[param]` as a MongoDB ObjectId.
 */
export const validateMongoIdParam =
  (param = 'id') =>
  (req, res, next) => {
    const value = req.params[param];
    if (!value || !mongoose.Types.ObjectId.isValid(value)) {
      return next(new ApiError(400, `Invalid ${param}.`));
    }
    next();
  };
