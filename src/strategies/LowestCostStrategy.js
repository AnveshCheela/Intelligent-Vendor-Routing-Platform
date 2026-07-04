import BaseStrategy from './BaseStrategy.js';
import { STRATEGY_NAMES } from '../config/constants.js';

export default class LowestCostStrategy extends BaseStrategy {
  
  getName() {
    return STRATEGY_NAMES.LOWEST_COST;
  }

  async select(vendors, context = {}) {
    if (!vendors || vendors.length === 0) {
      throw new Error('No vendors available for selection');
    }

    // Sort by cost (lowest first)
    // If costs are equal, sort by priority as a tiebreaker
    const sortedVendors = [...vendors].sort((a, b) => {
      const costA = a.costPerRequest || 0;
      const costB = b.costPerRequest || 0;
      
      if (costA === costB) {
        return (a.priority || 1) - (b.priority || 1);
      }
      return costA - costB;
    });

    const selectedVendor = sortedVendors[0];
    
    return {
      vendor: selectedVendor,
      reasons: [
        `Lowest cost: '${selectedVendor.name}' at $${selectedVendor.costPerRequest.toFixed(4)}/request`
      ]
    };
  }
}
