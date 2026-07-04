import redis from '../config/redis.js';
import logger from './logger.js';

class Cache {
  /**
   * Get value from cache
   * @param {string} key
   * @returns {Promise<any>}
   */
  async get(key) {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error(`Redis Get Error (key: ${key}):`, error);
      return null;
    }
  }

  /**
   * Set value in cache
   * @param {string} key
   * @param {any} value
   * @param {number} ttlSeconds
   */
  async set(key, value, ttlSeconds = 3600) {
    try {
      await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (error) {
      logger.error(`Redis Set Error (key: ${key}):`, error);
    }
  }

  /**
   * Delete value from cache
   * @param {string} key
   */
  async del(key) {
    try {
      await redis.del(key);
    } catch (error) {
      logger.error(`Redis Del Error (key: ${key}):`, error);
    }
  }

  /**
   * Get vendor health data
   * @param {string} vendorId
   * @returns {Promise<Object>}
   */
  async getVendorHealth(vendorId) {
    return this.get(`vendor:health:${vendorId}`);
  }

  /**
   * Set vendor health data
   * @param {string} vendorId
   * @param {Object} data
   */
  async setVendorHealth(vendorId, data) {
    // Keep health data for 5 minutes (300s)
    return this.set(`vendor:health:${vendorId}`, data, 300);
  }
}

export default new Cache();
