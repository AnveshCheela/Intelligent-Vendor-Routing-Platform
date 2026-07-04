import { GoogleGenerativeAI } from '@google/generative-ai';
import MetricCollector from '../services/MetricCollector.js';
import prisma from '../config/database.js';
import logger from '../utils/logger.js';

class AIRoutingAdvisor {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: "application/json" }
      });
    }
  }

  async recommend() {
    try {
      // Gather system state
      const vendors = await prisma.vendor.findMany({ select: { id: true, name: true, status: true, capability: true, costPerRequest: true }});
      
      const metricsDump = {};
      for (const v of vendors) {
        metricsDump[v.name] = await MetricCollector.getVendorMetrics(v.id);
      }
      
      const activeRule = await prisma.routingRule.findFirst({ where: { isActive: true } });

      const prompt = `
        You are an AI Routing Advisor. Analyze the current system state and recommend strategy changes.
        
        Current Active Strategy: ${activeRule ? activeRule.strategy : 'None'}
        Current Vendors and Metrics: ${JSON.stringify(metricsDump)}
        
        Provide a recommendation in JSON:
        {
          "insight": "What you noticed about the current state (e.g., 'Vendor A latency is spiking')",
          "recommendation": "What action should be taken",
          "suggested_strategy": "The exact strategy name to switch to",
          "severity": "info" | "warning" | "critical"
        }
      `;

      if (!this.apiKey) {
        return this.getRuleBasedRecommendation(vendors, metricsDump);
      }

      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      return JSON.parse(text);

    } catch (error) {
      logger.error('Gemini API Error in RoutingAdvisor:', error);
      return {
        insight: "Unable to reach AI service.",
        recommendation: "Monitor dashboard manually.",
        severity: "info"
      };
    }
  }

  getRuleBasedRecommendation(vendors, metrics) {
    // Basic rule-based fallback if no AI
    const degraded = vendors.find(v => v.status === 'degraded' || v.status === 'down');
    
    if (degraded) {
      return {
        insight: `${degraded.name} is currently ${degraded.status}.`,
        recommendation: `Switch to Lowest Latency or Priority strategy to automatically route traffic away from ${degraded.name}.`,
        suggested_strategy: "lowest_latency",
        severity: "warning"
      };
    }
    
    return {
      insight: "All systems operating normally.",
      recommendation: "Current strategy is performing well. Consider 'Lowest Cost' during off-peak hours.",
      suggested_strategy: "lowest_cost",
      severity: "info"
    };
  }
}

export default new AIRoutingAdvisor();
