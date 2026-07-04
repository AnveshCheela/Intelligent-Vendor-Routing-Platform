import prisma from '../config/database.js';
import { success, error } from '../utils/responseFormatter.js';

class LogsController {
  
  async getRoutingLogs(req, res, next) {
    try {
      const { vendorId, strategy, status, search, page = 1, limit = 50 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      
      const where = {};
      
      if (vendorId && vendorId !== 'all') where.vendorId = vendorId;
      if (strategy && strategy !== 'all') where.strategyUsed = strategy;
      if (status && status !== 'all') where.status = status;
      if (search) where.requestId = { contains: search, mode: 'insensitive' };

      const [logs, total] = await Promise.all([
        prisma.routingLog.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: { vendor: { select: { name: true } } }
        }),
        prisma.routingLog.count({ where })
      ]);

      res.json(success({
        logs,
        pagination: { total, page: Number(page), limit: Number(limit) }
      }));
    } catch (err) {
      next(err);
    }
  }

  async getLogById(req, res, next) {
    try {
      const log = await prisma.routingLog.findUnique({
        where: { id: req.params.id },
        include: { vendor: { select: { name: true } } }
      });
      
      if (!log) {
        return res.status(404).json(error('Log not found', 404));
      }
      
      res.json(success(log));
    } catch (err) {
      next(err);
    }
  }
}

export default new LogsController();
