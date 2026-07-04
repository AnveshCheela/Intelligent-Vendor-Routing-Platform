/**
 * Normalizes different vendor responses into a consistent internal format
 * @param {string} vendorName
 * @param {Object} rawResponse
 * @param {number} latencyMs
 * @returns {Object} Normalized response
 */
export const normalizeResponse = (vendorName, rawResponse, latencyMs) => {
  // A real implementation would have vendor-specific normalizers
  // For the simulator, we format it based on the expected UI schema
  
  return {
    status: 'success',
    vendor_response: rawResponse,
    meta: {
      routed_at: new Date().toISOString(),
      vendor_latency_ms: latencyMs,
      provider: vendorName
    }
  };
};

/**
 * Normalizes vendor error responses
 */
export const normalizeError = (vendorName, error, latencyMs) => {
  return {
    status: 'error',
    error: {
      message: error.message || 'Vendor API Error',
      code: error.code || 'VENDOR_ERROR',
    },
    meta: {
      routed_at: new Date().toISOString(),
      vendor_latency_ms: latencyMs,
      provider: vendorName
    }
  };
};
