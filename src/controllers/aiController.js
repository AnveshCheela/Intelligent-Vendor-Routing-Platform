import aiConfigGenerator from '../ai/configGenerator.js';
import aiRoutingAdvisor from '../ai/routingAdvisor.js';
import { success } from '../utils/responseFormatter.js';
import logger from '../utils/logger.js';

class AIController {
  
  async getSettings(req, res, next) {
    res.json(success({
      model: aiConfigGenerator.currentModelName,
      temperature: aiConfigGenerator.currentTemperature
    }, 'Settings retrieved'));
  }

  async updateSettings(req, res, next) {
    try {
      const { model, temperature } = req.body;
      aiConfigGenerator.updateSettings(model, temperature);
      res.json(success(null, 'AI settings updated successfully'));
    } catch (err) {
      logger.error('Failed to update AI settings:', err);
      next(err);
    }
  }

  async generateConfig(req, res, next) {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ success: false, message: 'Prompt is required' });
      }
      
      const config = await aiConfigGenerator.generate(prompt);
      res.json(success(config, 'Config generated successfully'));
    } catch (err) {
      logger.error('AI Config Generation Error:', err);
      next(err);
    }
  }

  async getRecommendation(req, res, next) {
    try {
      const recommendation = await aiRoutingAdvisor.recommend();
      res.json(success(recommendation, 'Recommendation generated successfully'));
    } catch (err) {
      logger.error('AI Routing Advisor Error:', err);
      next(err);
    }
  }
}

export default new AIController();
