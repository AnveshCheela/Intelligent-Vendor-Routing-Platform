import BaseStrategy from './BaseStrategy.js';
import { STRATEGY_NAMES } from '../config/constants.js';

export default class FeatureBasedStrategy extends BaseStrategy {
  
  getName() {
    return STRATEGY_NAMES.FEATURE_BASED;
  }

  async select(vendors, context = {}) {
    if (!vendors || vendors.length === 0) {
      throw new Error('No vendors available for selection');
    }

    const requiredCapability = context.capability;
    if (!requiredCapability) {
      // If no feature requested, fallback to priority
      return {
        vendor: vendors.sort((a, b) => (a.priority || 1) - (b.priority || 1))[0],
        reasons: [`No specific feature requested, fell back to Priority`]
      };
    }

    // Filter vendors that support this capability
    // (This is redundant if VendorRouter already filtered by capability, but good for safety)
    const capableVendors = vendors.filter(v => 
      v.capability === requiredCapability || 
      (v.metadata && v.metadata.capabilities && v.metadata.capabilities.includes(requiredCapability))
    );

    if (capableVendors.length === 0) {
      // If none match perfectly, pick the highest priority one available as fallback
      const fallback = vendors.sort((a, b) => (a.priority || 1) - (b.priority || 1))[0];
      return {
        vendor: fallback,
        reasons: [`No vendor perfectly matches feature '${requiredCapability}', fell back to '${fallback.name}'`]
      };
    }

    // If multiple match, pick the one with highest priority
    const selectedVendor = capableVendors.sort((a, b) => (a.priority || 1) - (b.priority || 1))[0];
    
    return {
      vendor: selectedVendor,
      reasons: [
        `Feature match: '${selectedVendor.name}' supports '${requiredCapability}'`
      ]
    };
  }
}
