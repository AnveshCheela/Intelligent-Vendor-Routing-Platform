import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import routes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { requestLogger } from './middlewares/requestLogger.js';
import logger from './utils/logger.js';
import HealthMonitor from './services/HealthMonitor.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Swagger API Documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Intelligent Vendor Routing Platform API',
      version: '1.0.0',
      description: 'API for routing requests to vendors using multiple strategies',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'], // files containing annotations
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount Routes
app.use('/api', routes);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Intelligent Vendor Routing API. Docs at /api-docs' });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found', statusCode: 404 });
});

// Global Error Handler
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  logger.info(`API Docs available at http://localhost:${PORT}/api-docs`);
  
  // Start background services
  HealthMonitor.start();
});

// Graceful shutdown
const shutdown = () => {
  logger.info('Shutting down server...');
  HealthMonitor.stop();
  server.close(() => {
    logger.info('Server closed.');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export default app;
