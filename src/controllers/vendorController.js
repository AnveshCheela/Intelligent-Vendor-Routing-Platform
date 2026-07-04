import prisma from '../config/database.js';
import { success, error } from '../utils/responseFormatter.js';
import logger from '../utils/logger.js';

class VendorController {
  
  async createVendor(req, res, next) {
    try {
      const { supportedFeatures, metadata, ...restData } = req.body;
      
      // Merge supportedFeatures into metadata.capabilities for the DB
      const dbMetadata = metadata || {};
      if (supportedFeatures && Array.isArray(supportedFeatures)) {
        dbMetadata.capabilities = supportedFeatures;
      }
      
      const vendor = await prisma.vendor.create({
        data: {
          ...restData,
          metadata: dbMetadata
        }
      });
      res.status(201).json(success(vendor, 'Vendor created successfully', 201));
    } catch (err) {
      next(err);
    }
  }

  async getVendors(req, res, next) {
    try {
      const { capability, search, page = 1, limit = 50 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      
      const where = {};
      if (capability && capability !== 'all') {
        where.capability = capability;
      }
      if (search) {
        where.name = { contains: search, mode: 'insensitive' };
      }

      const [vendors, total] = await Promise.all([
        prisma.vendor.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: [{ priority: 'asc' }, { weight: 'desc' }]
        }),
        prisma.vendor.count({ where })
      ]);

      res.json(success({
        vendors,
        pagination: { total, page: Number(page), limit: Number(limit) }
      }));
    } catch (err) {
      next(err);
    }
  }

  async getVendorById(req, res, next) {
    try {
      const vendor = await prisma.vendor.findUnique({
        where: { id: req.params.id }
      });
      
      if (!vendor) {
        return res.status(404).json(error('Vendor not found', 404));
      }
      
      res.json(success(vendor));
    } catch (err) {
      next(err);
    }
  }

  async updateVendor(req, res, next) {
    try {
      const vendor = await prisma.vendor.update({
        where: { id: req.params.id },
        data: req.body
      });
      res.json(success(vendor, 'Vendor updated successfully'));
    } catch (err) {
      next(err);
    }
  }

  async deleteVendor(req, res, next) {
    try {
      await prisma.vendor.delete({
        where: { id: req.params.id }
      });
      res.json(success(null, 'Vendor deleted successfully'));
    } catch (err) {
      next(err);
    }
  }

  async getVendorSummary(req, res, next) {
    try {
      const vendors = await prisma.vendor.findMany();
      
      const totalActive = vendors.filter(v => v.status === 'healthy').length;
      const degradedDown = vendors.filter(v => v.status === 'degraded' || v.status === 'down').length;
      
      // Fetch real metrics instead of mocking
      let realAvgLatency = 0;
      let realTotalSpend = 0;
      try {
        const { default: MetricCollector } = await import('../services/MetricCollector.js');
        const sysMetrics = await MetricCollector.getSystemMetrics();
        realAvgLatency = sysMetrics.avg_latency_ms || 0;
        realTotalSpend = sysMetrics.total_spend || 0;
      } catch (err) {
        logger.error('Failed to fetch real metrics for summary', err);
      }

      res.json(success({
        totalActive,
        degradedDown,
        avgLatencyMs: Math.round(realAvgLatency), 
        monthlySpendEst: realTotalSpend 
      }));
    } catch (err) {
      next(err);
    }
  }
}

export default new VendorController();
