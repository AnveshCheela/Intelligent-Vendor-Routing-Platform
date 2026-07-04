/**
 * Abstract Base Class for Routing Strategies
 * Uses the Strategy Design Pattern.
 */
export default class BaseStrategy {
  constructor() {
    if (this.constructor === BaseStrategy) {
      throw new Error("Abstract classes can't be instantiated.");
    }
  }

  /**
   * Select the optimal vendor from a list of candidates
   * @param {Array<Object>} vendors - List of available healthy vendors
   * @param {Object} context - The routing context (request payload, config, etc.)
   * @returns {Promise<{vendor: Object, reasons: string[]}>}
   */
  async select(vendors, context) {
    throw new Error("Method 'select()' must be implemented.");
  }

  /**
   * Get the name of the strategy
   * @returns {string}
   */
  getName() {
    throw new Error("Method 'getName()' must be implemented.");
  }
}
