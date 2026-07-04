import logger from '../utils/logger.js';
import { error } from '../utils/responseFormatter.js';

/**
 * Global Error Handler Middleware
 */
export const errorHandler = (err, req, res, next) => {
  logger.error(`Unhandled Error [${req.method} ${req.url}]:`, err);

  const statusCode = err.statusCode || err.code || 500;
  
  // Normalize Prisma errors
  if (err.code && typeof err.code === 'string' && err.code.startsWith('P')) {
    return res.status(400).json(error('Database operation failed', 400, { code: err.code }));
  }

  // Generic errors
  return res.status(typeof statusCode === 'number' && statusCode >= 100 && statusCode < 600 ? statusCode : 500)
            .json(error(err.message || 'Internal Server Error', statusCode));
};
