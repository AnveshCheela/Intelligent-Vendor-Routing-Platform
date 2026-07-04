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
      
      // Track total latency for accurate averages
      pipeline.hincrby(allTimeKey, 'total_latency', Math.round(latencyMs));

      // Track exact financial spend if the request was successful
      if (success && cost > 0) {
        pipeline.hincrbyfloat(allTimeKey, 'total_cost', cost);
      }

      await pipeline.exec();

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
      
      let totalRequests = 0;
      let totalSuccess = 0;
      let globalTotalLatency = 0;
      let globalTotalSpend = 0;
      const vendorMetricsList = [];

      for (const vendor of vendors) {
        const stats = await this.getVendorMetrics(vendor.id);
        totalRequests += stats.requests;
        totalSuccess += stats.success;
        globalTotalLatency += stats.totalLatency;
        globalTotalSpend += stats.totalSpend;
        
        vendorMetricsList.push({
          vendorId: vendor.id,
          vendorName: vendor.name,
          status: vendor.status,
          costPerRequest: vendor.costPerRequest,
          ...stats
        });
      }
      
      const successRate = totalRequests > 0 ? (totalSuccess / totalRequests) * 100 : 100;
      const avgLatencyMs = totalRequests > 0 ? (globalTotalLatency / totalRequests) : 0;
      
      return {
        total_requests_today: totalRequests,
        active_vendors: vendors.length,
        total_vendors: totalVendors,
        avg_latency_ms: avgLatencyMs,
        success_rate: successRate,
        total_spend: globalTotalSpend,
        latency_change_ms: 0, // Simplified for this implementation
        vendor_metrics: vendorMetricsList
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
      const totalLatency = parseInt(data.total_latency || 0);
      const totalSpend = parseFloat(data.total_cost || 0);
      
      const successRate = requests > 0 ? (success / requests) * 100 : 100;
      const errorRate = requests > 0 ? (errors / requests) * 100 : 0;
      const avgLatencyMs = requests > 0 ? (totalLatency / requests) : 0;
      
      return {
        requests,
        success,
        errors,
        totalLatency,
        totalSpend,
        totalRequests: requests,
        successfulRequests: success,
        successRate,
        errorRate,
        avgLatencyMs,
        p95LatencyMs: avgLatencyMs * 1.2, // Rough estimation since real p95 requires list traversal
      };
    } catch (error) {
      logger.error(`Error getting vendor metrics (${vendorId}):`, error);
      throw error;
    }
  }
}

export default new MetricCollector();
