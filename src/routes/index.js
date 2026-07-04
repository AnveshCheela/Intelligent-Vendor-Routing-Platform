import express from 'express';
import vendorController from '../controllers/vendorController.js';
import routeController from '../controllers/routeController.js';
import metricsController from '../controllers/metricsController.js';
import logsController from '../controllers/logsController.js';
import strategyController from '../controllers/strategyController.js';
import healthController from '../controllers/healthController.js';
import simulateController from '../controllers/simulateController.js';
import aiController from '../controllers/aiController.js';
import settingsController from '../controllers/settingsController.js';

import { validateVendor, validateRoute, validateStrategy } from '../middlewares/requestValidator.js';
import { apiRateLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Health Check
/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: System Health Check
 *     description: Returns the health status of the API, Database, and Redis
 *     responses:
 *       200:
 *         description: System is healthy
 */
router.get('/health', healthController.getHealth);

// Global Settings
router.get('/settings', settingsController.getSettings);
router.put('/settings', settingsController.updateSettings);

// Core Routing Endpoint
/**
 * @swagger
 * /api/route:
 *   post:
 *     summary: Route a vendor request
 *     description: Evaluates active strategies and returns the optimal vendor for the request payload
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               capability:
 *                 type: string
 *               routing_preference:
 *                 type: string
 *               payload:
 *                 type: object
 *             example:
 *               capability: "kyc"
 *               routing_preference: "lowest_cost"
 *               payload: { "firstName": "John", "lastName": "Doe" }
 *               requirements: { "maxLatencyMs": 2000, "preferLowCost": true }
 *     responses:
 *       200:
 *         description: Successfully routed
 */
router.post('/route', apiRateLimiter, validateRoute, routeController.routeRequest);
router.post('/simulate', validateRoute, simulateController.simulate);

// Vendors CRUD
/**
 * @swagger
 * /api/vendors:
 *   get:
 *     summary: Retrieve a list of all vendors
 *     description: Returns paginated vendor data
 *     responses:
 *       200:
 *         description: A list of vendors
 *   post:
 *     summary: Register a new vendor
 *     description: Creates a new vendor configuration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               name: "Acme Identity"
 *               capability: "kyc"
 *               priority: 1
 *               weight: 70
 *               costPerRequest: 0.08
 *               rateLimit: 500
 *               timeoutMs: 3000
 *               supportedFeatures: ["kyc", "identity_verification"]
 *     responses:
 *       201:
 *         description: Vendor created successfully
 */
router.post('/vendors', validateVendor, vendorController.createVendor);
router.get('/vendors', vendorController.getVendors);
router.get('/vendors/summary', vendorController.getVendorSummary);
router.get('/vendors/:id', vendorController.getVendorById);
router.put('/vendors/:id', validateVendor, vendorController.updateVendor);
router.delete('/vendors/:id', vendorController.deleteVendor);

// Strategies
router.get('/strategies', strategyController.getStrategies);
router.get('/strategy/active', strategyController.getActiveStrategy);
router.post('/strategy', validateStrategy, strategyController.setStrategy);

// Metrics
/**
 * @swagger
 * /api/vendor-metrics:
 *   get:
 *     summary: Retrieve metrics for all vendors
 *     description: Returns success rate, latency, and cost metrics
 *     responses:
 *       200:
 *         description: Metrics data returned successfully
 */
router.get('/metrics', metricsController.getSystemMetrics);
router.get('/vendor-metrics', metricsController.getSystemMetrics); // Alias for mandatory assignment API
router.get('/metrics/latency-trends', metricsController.getLatencyTrends);
router.get('/metrics/traffic-distribution', metricsController.getTrafficDistribution);
router.get('/metrics/:vendorId', metricsController.getVendorMetrics);

// Logs
/**
 * @swagger
 * /api/routing-logs:
 *   get:
 *     summary: Retrieve routing logs
 *     description: Returns paginated history of all routing decisions
 *     responses:
 *       200:
 *         description: Logs returned successfully
 */
router.get('/routing-logs', logsController.getRoutingLogs);
router.get('/routing-logs/:id', logsController.getLogById);

// AI Integration
router.get('/ai/settings', aiController.getSettings);
router.post('/ai/settings', aiController.updateSettings);
router.post('/ai/generate-config', aiController.generateConfig);
router.post('/ai/recommend', aiController.getRecommendation);

export default router;
