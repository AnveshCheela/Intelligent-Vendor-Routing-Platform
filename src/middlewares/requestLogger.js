import morgan from 'morgan';
import logger from '../utils/logger.js';

// Setup Morgan to use Winston for HTTP request logging
const stream = {
  write: (message) => logger.info(message.trim())
};

export const requestLogger = morgan(
  ':remote-addr - :method :url :status :res[content-length] - :response-time ms',
  { stream }
);
