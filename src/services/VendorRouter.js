import { v4 as uuidv4 } from 'uuid';
import HealthMonitor from './HealthMonitor.js';
import MetricCollector from './MetricCollector.js';
import StrategyFactory from '../factory/StrategyFactory.js';
import VendorFactory from '../factory/VendorFactory.js';
import { normalizeResponse, normalizeError } from '../utils/normalizer.js';
import logger from '../utils/logger.js';
import prisma from '../config/database.js';

class VendorRouter {
  
  /**
   * Main routing orchestrator
   * @param {Object} request - { capability, payload, max_latency_ms?, routing_preference? }
   */
  async route(request) {
    const requestId = uuidv4();
    const startTime = Date.now();
    const context = { ...request, requestId };
    
    let selectedVendorConfig = null;
    let strategyInstance = null;
    let reasons = [];
    
    try {
      // 1. Get healthy vendors
      const healthyVendors = await HealthMonitor.getHealthyVendors();
      if (healthyVendors.length === 0) {
        throw new Error('No healthy vendors available');
      }

      // 2. Filter by capability
      const capableVendors = healthyVendors.filter(v => 
        v.capability === request.capability || 
        (v.metadata && v.metadata.capabilities && v.metadata.capabilities.includes(request.capability))
      );
      
      if (capableVendors.length === 0) {
        throw new Error(`No vendors available for capability: ${request.capability}`);
      }
      
      reasons.push(`${capableVendors.length} vendors found for '${request.capability}'`);

      // 3. Apply latency threshold filter if requested
      let candidateVendors = capableVendors;
      if (request.max_latency_ms) {
        candidateVendors = candidateVendors.filter(v => (v.metadata?.avgLatency || 500) <= request.max_latency_ms);
        if (candidateVendors.length === 0) {
          reasons.push(`All vendors exceeded max latency ${request.max_latency_ms}ms. Ignoring threshold.`);
          candidateVendors = capableVendors; // Fallback
        } else {
          reasons.push(`Filtered out vendors exceeding ${request.max_latency_ms}ms`);
        }
      }

      // 4. Get Strategy (from request preference or DB)
      let strategyName = request.routing_preference;
      if (!strategyName) {
        const activeRule = await prisma.routingRule.findFirst({ where: { isActive: true } });
        strategyName = activeRule ? activeRule.strategy : 'weighted';
      }
      
      strategyInstance = StrategyFactory.create(strategyName);
      
      // 5 & 6. Select Vendor and Execute (with automatic failover)
      let rawResponse = null;
      let vendorInstance = null;
      let latency = 0;
      let attempt = 0;
      const maxAttempts = 3;

      while (candidateVendors.length > 0 && attempt < maxAttempts) {
        attempt++;
        try {
          const selection = await strategyInstance.select(candidateVendors, context);
          selectedVendorConfig = selection.vendor;
          reasons.push(`Attempt ${attempt}: ` + selection.reasons.join(' | '));
          
          vendorInstance = VendorFactory.create(selectedVendorConfig);
          
          const vendorStartTime = Date.now();
          rawResponse = await vendorInstance.execute(request.payload);
          latency = Date.now() - vendorStartTime;
          
          // If successful, break out of the retry loop
          break;
        } catch (error) {
          latency = Date.now() - startTime;
          logger.warn(`Attempt ${attempt} failed with vendor ${selectedVendorConfig?.name}:`, error.message);
          reasons.push(`Attempt ${attempt} failed (${selectedVendorConfig?.name}): ${error.message}`);
          
          if (selectedVendorConfig) {
            await MetricCollector.recordRequest(selectedVendorConfig.id, latency, false, 0);
            // Remove the failed vendor from candidates so we pick the NEXT best one
            candidateVendors = candidateVendors.filter(v => v.id !== selectedVendorConfig.id);
          }
          
          if (candidateVendors.length === 0 || attempt >= maxAttempts) {
            throw new Error(`All failover attempts exhausted. Last error: ${error.message}`);
          }
        }
      }

      // 7. Normalize Response
      const normalizedResponse = normalizeResponse(vendorInstance.getName(), rawResponse, latency);
      
      // 8. Record Metrics (Success)
      await MetricCollector.recordRequest(selectedVendorConfig.id, latency, true, vendorInstance.getCost());
      
      // 9. Log Decision
      await this.logDecision({
        requestId,
        vendorId: selectedVendorConfig.id,
        capability: request.capability,
        strategyUsed: strategyInstance.getName(),
        reason: reasons,
        latencyMs: latency,
        cost: vendorInstance.getCost(),
        status: 'success',
        statusCode: 200,
        requestPayload: request.payload,
        responsePayload: normalizedResponse
      });
      
      return {
        status: "SUCCESS",
        vendorUsed: vendorInstance.getName(),
        strategyUsed: strategyInstance.getName(),
        routingReason: reasons.join(' || '),
        latencyMs: latency,
        cost: vendorInstance.getCost(),
        response: normalizedResponse
      };
      
    } catch (error) {
      // Complete Failover Exhaustion Handling
      const latency = Date.now() - startTime;
      const strategyName = strategyInstance ? strategyInstance.getName() : 'Unknown';
      
      logger.error(`Routing failed completely for request ${requestId}:`, error);
      
      const errorResponse = normalizeError('System Exhaustion', error, latency);
      
      await this.logDecision({
        requestId,
        vendorId: null,
        capability: request.capability,
        strategyUsed: strategyName,
        reason: [...reasons, `Final Failure: ${error.message}`],
        latencyMs: latency,
        cost: 0,
        status: 'failed',
        statusCode: error.code || 500,
        requestPayload: request.payload,
        responsePayload: errorResponse,
        fallbackReason: error.message
      });
      
      return {
        status: "FAILED",
        vendorUsed: 'None (All Attempts Failed)',
        routingReason: [...reasons, `Final Failure: ${error.message}`].join(' || '),
        latencyMs: latency,
        cost: 0,
        response: errorResponse
      };
    }
  }

  /**
   * Write log to DB
   */
  async logDecision(logData) {
    try {
      await prisma.routingLog.create({
        data: logData
      });
    } catch (error) {
      logger.error('Error saving routing log:', error);
    }
  }
}

export default new VendorRouter();
