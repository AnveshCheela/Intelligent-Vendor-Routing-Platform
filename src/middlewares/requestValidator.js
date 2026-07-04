import { error } from '../utils/responseFormatter.js';
import { CAPABILITIES, STRATEGY_NAMES } from '../config/constants.js';

export const validateVendor = (req, res, next) => {
  const { name, capability } = req.body;
  
  if (!name || typeof name !== 'string') {
    return res.status(400).json(error('Vendor name is required and must be a string', 400));
  }
  
  if (!capability || !Object.values(CAPABILITIES).includes(capability)) {
    return res.status(400).json(error(`Valid capability is required. Options: ${Object.values(CAPABILITIES).join(', ')}`, 400));
  }
  
  next();
};

export const validateRoute = (req, res, next) => {
  const { capability, payload } = req.body;
  
  if (!capability) {
    return res.status(400).json(error('Capability is required', 400));
  }
  
  if (!payload || typeof payload !== 'object') {
    return res.status(400).json(error('Request payload object is required', 400));
  }
  
  next();
};

export const validateStrategy = (req, res, next) => {
  const { name, strategy } = req.body;
  
  if (!name) {
    return res.status(400).json(error('Rule name is required', 400));
  }
  
  if (!strategy || !Object.values(STRATEGY_NAMES).includes(strategy)) {
    return res.status(400).json(error(`Valid strategy is required. Options: ${Object.values(STRATEGY_NAMES).join(', ')}`, 400));
  }
  
  next();
};
