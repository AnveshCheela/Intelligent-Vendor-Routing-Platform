import BaseVendor from './BaseVendor.js';
import { CAPABILITIES } from '../config/constants.js';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Jumio Core Simulator
 */
export default class VendorB extends BaseVendor {
  async execute(requestPayload) {
    // Simulate ~210ms latency
    const baseLatency = 180;
    const jitter = Math.floor(Math.random() * 60);
    const latency = baseLatency + jitter;
    
    await delay(latency);

    // Simulate 0.5% error rate
    if (Math.random() < 0.005) {
      const err = new Error('Gateway Timeout');
      err.code = 504;
      throw err;
    }

    // Success response
    return {
      transaction_reference: `jumio_${Date.now()}`,
      identity_verified: true,
      risk_score: (1 + Math.random() * 0.5).toFixed(2),
      details: {
        document_valid: true,
        face_match: true
      }
    };
  }

  async healthCheck() {
    const start = Date.now();
    await delay(80 + Math.random() * 20);
    
    // 0.5% chance of failing health check
    const isHealthy = Math.random() > 0.005;
    
    return {
      isHealthy,
      latencyMs: Date.now() - start,
      errorRate: isHealthy ? 0 : 100
    };
  }
}
