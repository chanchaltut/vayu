// api/middleware/errorHandler.js
// Global error handler — catches anything thrown in controllers

export const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message)

  const statusCode = err.statusCode || 500

  res.status(statusCode).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

// Helper: create an error with a custom status code
// Usage: throw createError(400, 'Missing required field: aqi')
export const createError = (statusCode, message) => {
  const err = new Error(message)
  err.statusCode = statusCode
  return err
}
