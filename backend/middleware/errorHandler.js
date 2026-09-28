/**
 * Global Error Handling Middleware for Express
 * Returns unified JSON error responses matching Section 12 specifications.
 */
export const errorHandler = (err, req, res, next) => {
  console.error('[SERVER ERROR]:', err);

  // PostgreSQL specific error handling
  if (err.code === '23505') {
    // Unique violation
    return res.status(409).json({
      success: false,
      message: 'Conflict: A record with this unique field already exists (e.g. duplicate SKU, email, or name).',
      detail: err.detail
    });
  }

  if (err.code === '23503') {
    // Foreign key violation
    return res.status(400).json({
      success: false,
      message: 'Foreign key constraint violation: referenced record does not exist or is currently in use.',
      detail: err.detail
    });
  }

  if (err.code === '23514') {
    // Check constraint violation
    return res.status(400).json({
      success: false,
      message: 'Database check constraint failed (e.g. price cannot be negative, available stock cannot be negative).',
      detail: err.detail
    });
  }

  const statusCode = err.statusCode || res.statusCode !== 200 ? res.statusCode : 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.'
  });
};

/**
 * 404 Route Not Found handler
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.method} ${req.originalUrl}' not found.`
  });
};
