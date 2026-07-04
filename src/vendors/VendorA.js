import BaseVendor from './BaseVendor.js';
import { CAPABILITIES } from '../config/constants.js';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Stripe Identity Simulator
 */
export default class VendorA extends BaseVendor {
  async execute(requestPayload) {
    // Simulate ~120ms latency
    const baseLatency = 100;
    const jitter = Math.floor(Math.random() * 40);
    const latency = baseLatency + jitter;
    
    await delay(latency);

    // Simulate 0.1% error rate
    if (Math.random() < 0.001) {
      const err = new Error('Vendor Internal Server Error');
      err.code = 500;
      throw err;
    }

    // Success response
    return {
      verification_id: `vid_stripe_${Date.now()}`,
      match_score: (95 + Math.random() * 5).toFixed(1),
      flags: []
    };
  }

  async healthCheck() {
    const start = Date.now();
    await delay(50 + Math.random() * 10);
    
    // 0.1% chance of failing health check
    const isHealthy = Math.random() > 0.001;
    
    return {
      isHealthy,
      latencyMs: Date.now() - start,
      errorRate: isHealthy ? 0 : 100
    };
  }
}
