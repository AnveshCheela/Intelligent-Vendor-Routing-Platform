import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redis from '../config/redis.js';
import { error } from '../utils/responseFormatter.js';
import logger from '../utils/logger.js';

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000;
const max = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100;

export const apiRateLimiter = rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }),
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json(error('Too many requests, please try again later.', 429));
  },
});
