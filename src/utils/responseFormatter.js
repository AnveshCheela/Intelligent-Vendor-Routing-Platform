/**
 * Standard API success response
 */
export const success = (data, message = 'Success', statusCode = 200) => {
  return {
    success: true,
    message,
    data,
    statusCode,
  };
};

/**
 * Standard API error response
 */
export const error = (message = 'Internal Server Error', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
    statusCode,
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  return response;
};

/**
 * Enriched routing response (Signzy JD requirement)
 */
export const routingResponse = (vendorName, strategyName, reasonArray, metrics, normalizedResponse) => {
  return {
    selectedVendor: vendorName,
    strategy: strategyName,
    reason: reasonArray,
    metrics: metrics,
    ...normalizedResponse
  };
};
