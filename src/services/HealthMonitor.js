import cron from 'node-cron';
import prisma from '../config/database.js';
import VendorFactory from '../factory/VendorFactory.js';
import cache from '../utils/cache.js';
import logger from '../utils/logger.js';
import SettingsService from './SettingsService.js';
import { HEALTH_CHECK_INTERVAL_MS } from '../config/constants.js';

class HealthMonitor {
  constructor() {
    this.task = null;
    this.isRunning = false;
  }

  /**
   * Start the background health monitoring cron job
   */
  start() {
    if (this.isRunning) return;
    
    // Convert ms to cron expression (e.g. 30000ms = every 30 seconds)
    // For simplicity, we'll use a setInterval instead of node-cron for sub-minute intervals
    this.intervalId = setInterval(
      () => this.checkAll(), 
      HEALTH_CHECK_INTERVAL_MS
    );
    
    this.isRunning = true;
    logger.info(`Health Monitor started. Checking every ${HEALTH_CHECK_INTERVAL_MS}ms`);
    
    // Run immediately on start
    this.checkAll();
  }

  /**
   * Stop the health monitor
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.isRunning = false;
      logger.info('Health Monitor stopped.');
    }
  }

  /**
   * Check health of all vendors
   */
  async checkAll() {
    try {
      // Get all vendors that aren't manually disabled (we still check 'down' vendors to see if they recovered)
      const vendors = await prisma.vendor.findMany();
      
      if (!vendors || vendors.length === 0) return;

      const checkPromises = vendors.map(vendor => this.checkVendor(vendor));
      await Promise.allSettled(checkPromises);
      
    } catch (error) {
      logger.error('Health Monitor - checkAll error:', error);
    }
  }

  /**
   * Check an individual vendor and update status
   * @param {Object} vendorConfig 
   */
  async checkVendor(vendorConfig) {
    try {
      const vendor = VendorFactory.create(vendorConfig);
      const healthResult = await vendor.healthCheck();
      
      const healthData = {
        isHealthy: healthResult.isHealthy,
        latencyMs: healthResult.latencyMs,
        errorRate: healthResult.errorRate,
        availability: healthResult.isHealthy ? 100 : 0,
        lastChecked: new Date().toISOString()
      };

      // Update Redis Cache
      await cache.setVendorHealth(vendorConfig.id, healthData);

      // Determine new status based on global settings
      const settings = await SettingsService.getSettings();
      let newStatus = vendorConfig.status;
      
      if (!healthResult.isHealthy) {
        newStatus = 'down';
      } else if (healthResult.latencyMs > settings.latencyExclusionThreshold || healthResult.errorRate > settings.highErrorRateThreshold) {
        newStatus = 'degraded';
      } else {
        newStatus = 'healthy';
      }

      // Update DB if status changed
      if (newStatus !== vendorConfig.status) {
        await prisma.vendor.update({
          where: { id: vendorConfig.id },
          data: { status: newStatus }
        });
        logger.warn(`Vendor ${vendorConfig.name} status changed: ${vendorConfig.status} -> ${newStatus}`);
      }

    } catch (error) {
      logger.error(`Health Monitor - checkVendor error (${vendorConfig.name}):`, error);
      
      // Update DB to down on unhandled error
      if (vendorConfig.status !== 'down') {
        await prisma.vendor.update({
          where: { id: vendorConfig.id },
          data: { status: 'down' }
        });
      }
    }
  }

  /**
   * Get all currently healthy vendors from DB
   * @returns {Promise<Array>}
   */
  async getHealthyVendors() {
    return prisma.vendor.findMany({
      where: {
        status: { in: ['healthy', 'degraded'] }
      }
    });
  }
}

export default new HealthMonitor();
