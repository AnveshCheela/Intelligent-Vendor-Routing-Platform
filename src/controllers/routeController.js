import VendorRouter from '../services/VendorRouter.js';

class RouteController {
  
  /**
   * Main routing endpoint
   * POST /api/route
   */
  async routeRequest(req, res, next) {
    try {
      // req.body is validated by requestValidator middleware
      const response = await VendorRouter.route(req.body);
      
      // The router returns the exact format needed by the client,
      // including the routing_decision metadata
      const isSuccess = response.status === 'success' || response.status === 'SUCCESS';
      res.status(isSuccess ? 200 : 500).json(response);
      
    } catch (err) {
      next(err);
    }
  }
}

export default new RouteController();
