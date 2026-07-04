export const VENDOR_STATUS = {
  HEALTHY: 'healthy',
  DEGRADED: 'degraded',
  DOWN: 'down',
};

export const STRATEGY_NAMES = {
  PRIORITY: 'priority',
  WEIGHTED: 'weighted',
  ROUND_ROBIN: 'round_robin',
  LOWEST_LATENCY: 'lowest_latency',
  LOWEST_COST: 'lowest_cost',
  FEATURE_BASED: 'feature_based',
  HEALTH_BASED: 'health_based',
};

export const CAPABILITIES = {
  KYC: 'kyc',
  KYC_AML: 'kyc_aml',
  IDENTITY: 'identity',
  OCR: 'ocr',
  DOCUMENT: 'document',
  OCR_DATA: 'ocr_data',
  FRAUD: 'fraud',
  SANCTIONS: 'sanctions_screening',
};

export const DEFAULT_TIMEOUT_MS = 5000;
export const HEALTH_CHECK_INTERVAL_MS = parseInt(process.env.HEALTH_CHECK_INTERVAL_MS, 10) || 30000;
