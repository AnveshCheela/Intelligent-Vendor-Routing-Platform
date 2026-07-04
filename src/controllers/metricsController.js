import MetricCollector from '../services/MetricCollector.js';
import { success } from '../utils/responseFormatter.js';
import prisma from '../config/database.js';

class MetricsController {
  
  async getSystemMetrics(req, res, next) {
    try {
      const metrics = await MetricCollector.getSystemMetrics();
      res.json(success(metrics));
    } catch (err) {
      next(err);
    }
  }

  async getVendorMetrics(req, res, next) {
    try {
      const metrics = await MetricCollector.getVendorMetrics(req.params.vendorId);
      res.json(success(metrics));
    } catch (err) {
      next(err);
    }
  }

  async getLatencyTrends(req, res, next) {
    try {
      // For the UI dashboard, we need time-series data.
      // In a real system, we'd query Redis time-series or Postgres metrics table.
      // For this assignment, we mock realistic trend data that matches the UI mockup.
      
      const hours = 24;
      const data = [];
      const now = new Date();
      
      for (let i = hours; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 3600000);
        data.push({
          timestamp: time.toISOString(),
          'Vendor A': 120 + Math.random() * 20,
          'Vendor B': 200 + Math.random() * 30,
          'Vendor C': 300 + Math.random() * 50
        });
      }
      
      res.json(success(data));
    } catch (err) {
      next(err);
    }
  }

  async getTrafficDistribution(req, res, next) {
    try {
      // Mock data for Donut chart
      const data = [
        { name: 'Stripe Identity', value: 60, fill: '#3525cd' },
        { name: 'Jumio Core', value: 30, fill: '#818cf8' },
        { name: 'Microblink OCR', value: 10, fill: '#c7c4d8' }
      ];
      res.json(success(data));
    } catch (err) {
      next(err);
    }
  }
}

export default new MetricsController();
