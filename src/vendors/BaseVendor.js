/**
 * Abstract base class for all Vendors
 * Implements the Vendor interface required by the Router
 */
export default class BaseVendor {
  constructor(config) {
    if (this.constructor === BaseVendor) {
      throw new Error("Abstract classes can't be instantiated.");
    }
    this.config = config;
    this.id = config.id;
  }

  /**
   * Execute the routing request
   * @param {Object} requestPayload 
   * @returns {Promise<Object>}
   */
  async execute(requestPayload) {
    throw new Error("Method 'execute()' must be implemented.");
  }

  /**
   * Perform a health check ping
   * @returns {Promise<Object>} { isHealthy, latencyMs, errorRate }
   */
  async healthCheck() {
    throw new Error("Method 'healthCheck()' must be implemented.");
  }

  /**
   * Get the display name of the vendor
   * @returns {string}
   */
  getName() {
    return this.config.name;
  }

  /**
   * Get supported capabilities
   * @returns {string[]}
   */
  getCapabilities() {
    return this.config.metadata?.capabilities || [this.config.capability];
  }

  // --- Common Methods ---

  isHealthy() {
    return this.config.status === 'healthy';
  }

  getLatency() {
    // Return typical latency for planning/simulation if live metrics aren't available
    return this.config.metadata?.avgLatency || 500;
  }

  getCost() {
    return this.config.costPerRequest || 0;
  }
}
