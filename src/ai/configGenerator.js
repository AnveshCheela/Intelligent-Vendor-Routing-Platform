import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../utils/logger.js';

class AIConfigGenerator {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.currentModelName = 'gemini-2.5-flash';
    this.currentTemperature = 0.2;
    this.initializeModel();
  }

  initializeModel() {
    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ 
        model: this.currentModelName,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: this.currentTemperature
        }
      });
    }
  }

  updateSettings(modelName, temperature) {
    this.currentModelName = modelName;
    this.currentTemperature = parseFloat(temperature);
    this.initializeModel();
    logger.info(`AI Settings updated: ${this.currentModelName} at Temp ${this.currentTemperature}`);
  }

  /**
   * Generates a routing configuration JSON based on a natural language prompt
   * @param {string} prompt 
   * @returns {Object} JSON config
   */
  async generate(prompt) {
    if (!this.apiKey || !this.genAI) {
      logger.warn('GEMINI_API_KEY is not set. Returning mock AI config.');
      return this.getMockConfig(prompt);
    }

    try {
      const systemPrompt = `
        You are an expert systems architect configuring an intelligent vendor routing platform.
        Given the user's natural language request, generate a valid JSON routing configuration.
        
        The JSON MUST have this exact structure:
        {
          "strategy": "weighted" | "priority" | "lowest_latency" | "lowest_cost" | "health_based",
          "config": {
            // For weighted: "weights": { "vendorName": percentageNumber }
            // For priority: "priorities": { "vendorName": priorityNumber } (1 is highest)
          },
          "failover": {
            "max_latency_ms": number (optional),
            "max_error_rate": number (optional)
          },
          "reasoning": "A brief explanation of how you interpreted the prompt"
        }
        
        User Prompt: "${prompt}"
      `;

      const result = await this.model.generateContent(systemPrompt);
      const text = result.response.text();
      
      try {
        return JSON.parse(text);
      } catch (parseError) {
        logger.error('Failed to parse AI response as JSON:', text);
        return this.getMockConfig(prompt);
      }

    } catch (error) {
      logger.error('Gemini API Error in ConfigGenerator:', error);
      return this.getMockConfig(prompt);
    }
  }

  getMockConfig(prompt) {
    return {
      strategy: "weighted",
      config: {
        weights: {
          "Stripe Identity": 70,
          "Jumio Core": 30
        }
      },
      failover: {
        max_latency_ms: 2000,
        max_error_rate: 5.0
      },
      reasoning: "Generated mock configuration because Gemini API key is missing. Evaluated prompt: " + prompt
    };
  }
}

export default new AIConfigGenerator();
