import BaseStrategy from './BaseStrategy.js';
import { STRATEGY_NAMES } from '../config/constants.js';

export default class WeightedStrategy extends BaseStrategy {
  
  getName() {
    return STRATEGY_NAMES.WEIGHTED;
  }

  async select(vendors, context = {}) {
    if (!vendors || vendors.length === 0) {
      throw new Error('No vendors available for selection');
    }

    // Calculate total weight
    const totalWeight = vendors.reduce((sum, vendor) => sum + (vendor.weight || 0), 0);
    
    if (totalWeight <= 0) {
      // Fallback to random if all weights are 0
      const randomIdx = Math.floor(Math.random() * vendors.length);
      return {
        vendor: vendors[randomIdx],
        reasons: [`All weights 0, selected '${vendors[randomIdx].name}' randomly`]
      };
    }

    // Random number between 0 and totalWeight
    let random = Math.random() * totalWeight;
    let selectedVendor = vendors[vendors.length - 1]; // Default to last

    for (const vendor of vendors) {
      const weight = vendor.weight || 0;
      if (random < weight) {
        selectedVendor = vendor;
        break;
      }
      random -= weight;
    }

    const percentage = ((selectedVendor.weight || 0) / totalWeight * 100).toFixed(1);

    return {
      vendor: selectedVendor,
      reasons: [
        `Traffic distributed by weight: '${selectedVendor.name}' (weight: ${percentage}%)`
      ]
    };
  }
}
