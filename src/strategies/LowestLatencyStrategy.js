import BaseStrategy from './BaseStrategy.js';
import { STRATEGY_NAMES } from '../config/constants.js';
import cache from '../utils/cache.js';

export default class LowestLatencyStrategy extends BaseStrategy {
  
  getName() {
    return STRATEGY_NAMES.LOWEST_LATENCY;
  }

  async select(vendors, context = {}) {
    if (!vendors || vendors.length === 0) {
      throw new Error('No vendors available for selection');
    }

    let selectedVendor = null;
    let lowestLatency = Infinity;
    const latencyMap = {};

    // Fetch health data (which contains recent latency) from cache for all vendors
    for (const vendor of vendors) {
      const healthData = await cache.getVendorHealth(vendor.id);
      
      // Fallback to static latency from config if no live data
      const latency = healthData?.latencyMs || vendor.metadata?.avgLatency || 500;
      latencyMap[vendor.name] = latency;
      
      if (latency < lowestLatency) {
        lowestLatency = latency;
        selectedVendor = vendor;
      }
    }

    return {
      vendor: selectedVendor,
      reasons: [
        `Lowest latency: '${selectedVendor.name}' (avg ${Math.round(lowestLatency)}ms) among ${vendors.length} candidates`
      ]
    };
  }
}
