import PriorityStrategy from '../strategies/PriorityStrategy.js';
import WeightedStrategy from '../strategies/WeightedStrategy.js';
import RoundRobinStrategy from '../strategies/RoundRobinStrategy.js';
import LowestLatencyStrategy from '../strategies/LowestLatencyStrategy.js';
import LowestCostStrategy from '../strategies/LowestCostStrategy.js';
import FeatureBasedStrategy from '../strategies/FeatureBasedStrategy.js';
import HealthBasedStrategy from '../strategies/HealthBasedStrategy.js';
import { STRATEGY_NAMES } from '../config/constants.js';
import logger from '../utils/logger.js';

/**
 * Strategy Factory
 * Creates strategy instances based on the strategy name.
 */
export default class StrategyFactory {
  
  /**
   * Create a strategy instance
   * @param {string} strategyName 
   * @returns {import('../strategies/BaseStrategy.js').default}
   */
  static create(strategyName) {
    if (!strategyName) {
      logger.warn('No strategy name provided, defaulting to WEIGHTED');
      strategyName = STRATEGY_NAMES.WEIGHTED;
    }

    switch (strategyName.toLowerCase()) {
      case STRATEGY_NAMES.PRIORITY:
        return new PriorityStrategy();
      case STRATEGY_NAMES.WEIGHTED:
        return new WeightedStrategy();
      case STRATEGY_NAMES.ROUND_ROBIN:
        return new RoundRobinStrategy();
      case STRATEGY_NAMES.LOWEST_LATENCY:
        return new LowestLatencyStrategy();
      case STRATEGY_NAMES.LOWEST_COST:
        return new LowestCostStrategy();
      case STRATEGY_NAMES.FEATURE_BASED:
        return new FeatureBasedStrategy();
      case STRATEGY_NAMES.HEALTH_BASED:
        return new HealthBasedStrategy();
      default:
        logger.warn(`Unknown strategy '${strategyName}', defaulting to WEIGHTED`);
        return new WeightedStrategy();
    }
  }

  /**
   * Get all available strategy names
   * @returns {string[]}
   */
  static getAvailableStrategies() {
    return Object.values(STRATEGY_NAMES);
  }
}
