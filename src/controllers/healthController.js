import { success } from '../utils/responseFormatter.js';
import cache from '../utils/cache.js';
import prisma from '../config/database.js';

class HealthController {
  
  async getHealth(req, res, next) {
    try {
      // Get all vendors
      const vendors = await prisma.vendor.findMany({
        select: { id: true, name: true, status: true }
      });
      
      const vendorHealth = [];
      
      for (const vendor of vendors) {
        const healthData = await cache.getVendorHealth(vendor.id);
        vendorHealth.push({
          id: vendor.id,
          name: vendor.name,
          status: vendor.status,
          liveData: healthData || null
        });
      }
      
      const systemStatus = vendors.every(v => v.status === 'down') ? 'down' 
                         : vendors.some(v => v.status === 'down') ? 'degraded' 
                         : 'healthy';

      res.json(success({
        systemStatus,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        vendors: vendorHealth
      }));
    } catch (err) {
      next(err);
    }
  }
}

export default new HealthController();
