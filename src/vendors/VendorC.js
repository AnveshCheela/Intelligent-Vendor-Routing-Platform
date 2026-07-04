import BaseVendor from './BaseVendor.js';
import { CAPABILITIES } from '../config/constants.js';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Microblink OCR Simulator
 */
export default class VendorC extends BaseVendor {
  
  async execute(requestPayload) {
    // Simulate ~300ms latency (image processing is slower)
    const baseLatency = 250;
    const jitter = Math.floor(Math.random() * 100);
    const latency = baseLatency + jitter;
    
    await delay(latency);

    // Simulate 1% error rate
    if (Math.random() < 0.01) {
      const err = new Error('Bad Request: Image Unreadable');
      err.code = 400;
      throw err;
    }

    // Success response
    return {
      scan_id: `mb_${Date.now()}`,
      extracted_data: {
        document_type: "passport",
        issuing_country: "USA",
        first_name: "JOHN",
        last_name: "DOE",
        document_number: "987654321"
      },
      confidence: (90 + Math.random() * 10).toFixed(2)
    };
  }

  async healthCheck() {
    const start = Date.now();
    await delay(100 + Math.random() * 30);
    
    // 1% chance of failing health check
    const isHealthy = Math.random() > 0.01;
    
    return {
      isHealthy,
      latencyMs: Date.now() - start,
      errorRate: isHealthy ? 0 : 100
    };
  }
}
