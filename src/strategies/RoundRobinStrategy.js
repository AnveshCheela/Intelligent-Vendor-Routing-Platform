import BaseStrategy from './BaseStrategy.js';
import { STRATEGY_NAMES } from '../config/constants.js';
import cache from '../utils/cache.js';

export default class RoundRobinStrategy extends BaseStrategy {
  
  getName() {
    return STRATEGY_NAMES.ROUND_ROBIN;
  }

  async select(vendors, context = {}) {
    if (!vendors || vendors.length === 0) {
      throw new Error('No vendors available for selection');
    }

    const capability = context.capability || 'default';
    const counterKey = `strategy:roundrobin:counter:${capability}`;
    
    // Get current counter from cache, default to 0
    let currentIdx = await cache.get(counterKey) || 0;
    
    // Ensure index is within bounds
    if (currentIdx >= vendors.length) {
      currentIdx = 0;
    }

    const selectedVendor = vendors[currentIdx];
    
    // Increment and wrap around
    const nextIdx = (currentIdx + 1) % vendors.length;
    await cache.set(counterKey, nextIdx, 86400); // Expire in 1 day

    return {
      vendor: selectedVendor,
      reasons: [
        `Round-robin cycle: selected '${selectedVendor.name}' (position ${currentIdx + 1} of ${vendors.length})`
      ]
    };
  }
}
