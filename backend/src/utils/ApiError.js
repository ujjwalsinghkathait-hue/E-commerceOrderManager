/**
 * Operational errors the API can return with a specific HTTP status.
 * Used by controllers and middleware; avoid throwing generic Error for expected failures.
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
