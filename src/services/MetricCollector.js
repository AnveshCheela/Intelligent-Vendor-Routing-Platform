import prisma from '../config/database.js';
import redis from '../config/redis.js';
import logger from '../utils/logger.js';

class MetricCollector {
  /**
   * Record a routing request to Redis (real-time) and PostgreSQL (persistent)
   * @param {string} vendorId
   * @param {number} latencyMs
   * @param {boolean} success
   * @param {number} cost
   */
  async recordRequest(vendorId, latencyMs, success, cost = 0) {
    if (!vendorId) return;

    try {
      const now = new Date();
      const minuteKey = `metrics:vendor:${vendorId}:min:${Math.floor(now.getTime() / 60000)}`;
      const allTimeKey = `metrics:vendor:${vendorId}:all`;

      // Pipeline for Redis (real-time stats)
      const pipeline = redis.pipeline();
      
      // Increment request counts
      pipeline.hincrby(minuteKey, 'requests', 1);
      pipeline.hincrby(allTimeKey, 'requests', 1);
      
      if (success) {
        pipeline.hincrby(minuteKey, 'success', 1);
        pipeline.hincrby(allTimeKey, 'success', 1);
      } else {
        pipeline.hincrby(minuteKey, 'error', 1);
        pipeline.hincrby(allTimeKey, 'error', 1);
      }
      
      // Add latency to a list for p95 calculation (keep last 100)
      pipeline.lpush(`${minuteKey}:latencies`, latencyMs);
      pipeline.ltrim(`${minuteKey}:latencies`, 0, 99);
      pipeline.expire(minuteKey, 3600); // Keep minute data for 1 hour
      pipeline.expire(`${minuteKey}:latencies`, 3600);

      await pipeline.exec();

      // For persistent metrics, we should ideally batch these or use a background worker.
      // For this implementation, we'll write directly.
      // We upsert a metric record for the current hour
      const hourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
      
      // We'll let a separate cron job aggregate Redis metrics into Postgres to avoid DB lock contention on every request
      // But for simplicity in this assignment, we'll just track it in Redis for live dashboards.
      
    } catch (error) {
      logger.error('Error recording metrics:', error);
    }
  }

  /**
   * Get system-wide metrics
   */
  async getSystemMetrics() {
    try {
      const vendors = await prisma.vendor.findMany({ where: { status: { not: 'down' } } });
      const totalVendors = await prisma.vendor.count();
      
      // Simplified: in a real system we'd aggregate from Redis/DB
      // For now, we mock the system-wide stats based on active vendors
      return {
        total_requests_today: 2450123, // mock
        active_vendors: vendors.length,
        total_vendors: totalVendors,
        avg_latency_ms: 142, // mock
        success_rate: 99.98, // mock
        latency_change_ms: -12
      };
    } catch (error) {
      logger.error('Error getting system metrics:', error);
      throw error;
    }
  }

  /**
   * Get metrics for a specific vendor
   * @param {string} vendorId 
   */
  async getVendorMetrics(vendorId) {
    try {
      const allTimeKey = `metrics:vendor:${vendorId}:all`;
      const data = await redis.hgetall(allTimeKey);
      
      const requests = parseInt(data.requests || 0);
      const success = parseInt(data.success || 0);
      const errors = parseInt(data.error || 0);
      
      const successRate = requests > 0 ? (success / requests) * 100 : 100;
      const errorRate = requests > 0 ? (errors / requests) * 100 : 0;
      
      return {
        requests,
        successRate,
        errorRate,
        avgLatencyMs: 145, // mock calculation
        p95LatencyMs: 160, // mock calculation
      };
    } catch (error) {
      logger.error(`Error getting vendor metrics (${vendorId}):`, error);
      throw error;
    }
  }
}

export default new MetricCollector();
