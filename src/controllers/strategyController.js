import prisma from '../config/database.js';
import { success, error } from '../utils/responseFormatter.js';
import StrategyFactory from '../factory/StrategyFactory.js';

class StrategyController {
  
  async getStrategies(req, res, next) {
    try {
      const strategies = StrategyFactory.getAvailableStrategies();
      res.json(success(strategies));
    } catch (err) {
      next(err);
    }
  }

  async getActiveStrategy(req, res, next) {
    try {
      const rule = await prisma.routingRule.findFirst({
        where: { isActive: true }
      });
      
      if (!rule) {
        return res.json(success({ strategy: 'weighted', config: {} })); // Default
      }
      
      res.json(success(rule));
    } catch (err) {
      next(err);
    }
  }

  async setStrategy(req, res, next) {
    try {
      const { name, strategy, config } = req.body;
      
      // Deactivate current active rule
      await prisma.routingRule.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
      
      // Create new active rule
      const newRule = await prisma.routingRule.create({
        data: {
          name,
          strategy,
          config: config || {},
          isActive: true,
          version: '1.0.0'
        }
      });
      
      res.json(success(newRule, 'Routing strategy updated successfully'));
    } catch (err) {
      next(err);
    }
  }
}

export default new StrategyController();
