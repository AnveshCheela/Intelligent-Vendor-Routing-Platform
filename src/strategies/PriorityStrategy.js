import BaseStrategy from './BaseStrategy.js';
import { STRATEGY_NAMES } from '../config/constants.js';

export default class PriorityStrategy extends BaseStrategy {
  
  getName() {
    return STRATEGY_NAMES.PRIORITY;
  }

  async select(vendors, context = {}) {
    if (!vendors || vendors.length === 0) {
      throw new Error('No vendors available for selection');
    }

    // Sort by priority (lowest number = highest priority)
    // If priority is equal, sort by weight as a tiebreaker
    const sortedVendors = [...vendors].sort((a, b) => {
      if (a.priority === b.priority) {
        return (b.weight || 0) - (a.weight || 0);
      }
      return a.priority - b.priority;
    });

    const selectedVendor = sortedVendors[0];
    
    return {
      vendor: selectedVendor,
      reasons: [
        `Selected '${selectedVendor.name}' with highest priority level [${selectedVendor.priority}]`
      ]
    };
  }
}
