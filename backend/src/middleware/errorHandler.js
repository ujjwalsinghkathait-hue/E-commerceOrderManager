import mongoose from 'mongoose';
import ApiError from '../utils/ApiError.js';

export const notFound = (req, res, next) => {
  next(new ApiError(404, `Not found: ${req.method} ${req.originalUrl}`));
};

/**
 * Central Express error handler. Keep controllers thin: `next(err)` with ApiError or pass-through.
 * Signature must include four arguments so Express treats this as an error-handling middleware.
 */
export const errorHandler = (err, req, res, _next) => {
  let statusCode = typeof err.statusCode === 'number' ? err.statusCode : 500;
  let message = err.message || 'Internal Server Error';

  if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = 'Invalid resource identifier';
  }

  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    message = `Duplicate value for ${field}`;
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    const values = Object.values(err.errors || {}).map((e) => e.message);
    message = values.length ? values.join('. ') : message;
  }

  const isDev = process.env.NODE_ENV !== 'production';

  res.status(statusCode).json({
    success: false,
    message,
    ...(isDev && err.stack ? { stack: err.stack } : {}),
  });
};
