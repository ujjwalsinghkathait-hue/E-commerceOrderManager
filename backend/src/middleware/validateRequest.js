import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

/**
 * Run after express-validator chains on a route.
 */
const validateRequest = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const message = result
      .array({ onlyFirstError: true })
      .map((e) => e.msg)
      .join('. ');
    return next(new ApiError(400, message));
  }
  next();
};

export default validateRequest;
