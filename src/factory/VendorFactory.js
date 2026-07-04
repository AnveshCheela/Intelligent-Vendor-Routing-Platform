import VendorA from '../vendors/VendorA.js';
import VendorB from '../vendors/VendorB.js';
import VendorC from '../vendors/VendorC.js';
import logger from '../utils/logger.js';

/**
 * Vendor Factory
 * Maps vendor records from the DB to instantiated vendor adapter classes.
 */
export default class VendorFactory {
  
  /**
   * Create a vendor instance based on config
   * @param {Object} vendorConfig - Vendor record from DB
   * @returns {import('../vendors/BaseVendor.js').default}
   */
  static create(vendorConfig) {
    if (!vendorConfig || !vendorConfig.name) {
      throw new Error('Invalid vendor configuration');
    }

    // In a real system, you might map by a specific 'adapterType' field
    // Here we use the name to figure out which simulated adapter to use
    const name = vendorConfig.name.toLowerCase();

    try {
      if (name.includes('stripe') || name.includes('identity')) {
        return new VendorA(vendorConfig);
      } 
      else if (name.includes('jumio') || name.includes('core')) {
        return new VendorB(vendorConfig);
      }
      else if (name.includes('microblink') || name.includes('ocr')) {
        return new VendorC(vendorConfig);
      }
      else {
        // Fallback or generic vendor simulator
        logger.warn(`No exact adapter match for vendor '${vendorConfig.name}'. Using generic fallback (VendorA).`);
        return new VendorA(vendorConfig);
      }
    } catch (error) {
      logger.error(`Failed to instantiate vendor '${vendorConfig.name}':`, error);
      throw error;
    }
  }

  /**
   * For testing or listing available adapters
   * @returns {string[]}
   */
  static getAvailableAdapters() {
    return ['VendorA (Stripe)', 'VendorB (Jumio)', 'VendorC (Microblink)'];
  }
}
