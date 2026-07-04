import BaseStrategy from './BaseStrategy.js';
import { STRATEGY_NAMES } from '../config/constants.js';
import cache from '../utils/cache.js';

export default class HealthBasedStrategy extends BaseStrategy {
  
  getName() {
    return STRATEGY_NAMES.HEALTH_BASED;
  }

  async select(vendors, context = {}) {
    if (!vendors || vendors.length === 0) {
      throw new Error('No vendors available for selection');
    }

    let selectedVendor = null;
    let highestScore = -Infinity;
    
    const scores = {};

    for (const vendor of vendors) {
      const healthData = await cache.getVendorHealth(vendor.id);
      
      // Default values if no live data
      const latencyMs = healthData?.latencyMs || vendor.metadata?.avgLatency || 500;
      const errorRate = healthData?.errorRate || 0; // percentage 0-100
      const availability = healthData?.availability || 100; // percentage 0-100
      
      // Calculate composite health score
      // Higher is better. 
      // 100% availability is good.
      // Lower error rate is better: (100 - errorRate)
      // Lower latency is better: (1000 / max(latency, 1))
      
      const errorScore = 100 - errorRate;
      const latencyScore = 1000 / Math.max(latencyMs, 1);
      
      const score = (availability / 100) * (errorScore / 100) * latencyScore;
      
      scores[vendor.name] = { score, latencyMs, errorRate, availability };
      
      if (score > highestScore) {
        highestScore = score;
        selectedVendor = vendor;
      }
    }

    const s = scores[selectedVendor.name];

    return {
      vendor: selectedVendor,
      reasons: [
        `Health score: '${selectedVendor.name}' scored ${highestScore.toFixed(2)} (latency: ${Math.round(s.latencyMs)}ms, availability: ${s.availability}%, error rate: ${s.errorRate}%)`
      ]
    };
  }
}
