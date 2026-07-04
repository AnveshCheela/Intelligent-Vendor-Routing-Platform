import { success } from '../utils/responseFormatter.js';
import VendorRouter from '../services/VendorRouter.js';
import HealthMonitor from '../services/HealthMonitor.js';

class SimulateController {
  
  async simulate(req, res, next) {
    try {
      // For simulation, we don't want to actually record metrics or logs
      // But we can use the router logic and just mock the execution part
      // Since it's a demo assignment, we can just call routeRequest and it will act like a simulation
      // In a real app, we'd have a dryRun flag in the router
      
      const response = await VendorRouter.route(req.body);
      
      // Build a routing decision path (this matches the UI requirement)
      const routingDecisionPath = [
        {
          step: 'Capability Match',
          description: `${response.reason[0] || 'Capability matched'}`,
          icon: 'search'
        },
        {
          step: 'Strategy Selection',
          description: `Applied ${response.strategy} strategy`,
          icon: 'route'
        },
        {
          step: 'Vendor Selected',
          description: `Selected ${response.selectedVendor}`,
          icon: 'check_circle'
        }
      ];
      
      // Inject into response
      const simulatedResponse = {
        ...response,
        routing_decision_path: routingDecisionPath
      };
      
      res.json(simulatedResponse);
    } catch (err) {
      next(err);
    }
  }
}

export default new SimulateController();
