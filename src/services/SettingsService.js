import prisma from '../config/database.js';
import cache from '../utils/cache.js';
import logger from '../utils/logger.js';

const SETTINGS_CACHE_KEY = 'global:settings';

class SettingsService {
  /**
   * Get the global settings, preferring Redis cache, falling back to DB.
   */
  async getSettings() {
    try {
      // 1. Try Cache
      const cached = await cache.get(SETTINGS_CACHE_KEY);
      if (cached) return cached;

      // 2. Try DB
      let settings = await prisma.globalSettings.findUnique({
        where: { id: 'singleton' }
      });

      // 3. Create defaults if doesn't exist
      if (!settings) {
        settings = await prisma.globalSettings.create({
          data: {
            id: 'singleton',
            latencyExclusionThreshold: 2000,
            defaultTimeout: 3000,
            highErrorRateThreshold: 50,
            minSamplesHealthCheck: 5,
            cooldownMs: 60000,
            rateLimitWindowMs: 60000,
            vendorCacheTtlMs: 3000,
            strictAgenticAiMode: false
          }
        });
      }

      // 4. Cache it (no TTL, invalidate on update)
      await cache.set(SETTINGS_CACHE_KEY, settings, 86400); // 24h TTL just in case
      return settings;
    } catch (err) {
      logger.error('Failed to retrieve Global Settings', err);
      // Return hardcoded safe defaults so the router doesn't crash
      return {
        latencyExclusionThreshold: 2000,
        defaultTimeout: 3000,
        highErrorRateThreshold: 50,
        minSamplesHealthCheck: 5,
        cooldownMs: 60000,
        rateLimitWindowMs: 60000,
        vendorCacheTtlMs: 3000,
        strictAgenticAiMode: false
      };
    }
  }

  /**
   * Update the global settings
   * @param {Object} data 
   */
  async updateSettings(data) {
    try {
      const allowedKeys = [
        'latencyExclusionThreshold', 'defaultTimeout', 'highErrorRateThreshold',
        'minSamplesHealthCheck', 'cooldownMs', 'rateLimitWindowMs', 
        'vendorCacheTtlMs', 'strictAgenticAiMode'
      ];
      
      const payload = {};
      for (const k of allowedKeys) {
        if (data[k] !== undefined) payload[k] = data[k];
      }

      const settings = await prisma.globalSettings.upsert({
        where: { id: 'singleton' },
        update: payload,
        create: {
          id: 'singleton',
          ...payload
        }
      });

      // Invalidate the cache so the next request loads fresh values
      await cache.del(SETTINGS_CACHE_KEY);

      return settings;
    } catch (err) {
      logger.error('Failed to update Global Settings', err);
      throw err;
    }
  }
}

export default new SettingsService();
