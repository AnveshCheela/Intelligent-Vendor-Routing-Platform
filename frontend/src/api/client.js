import axios from 'axios';
import { API_BASE_URL } from '../utils/api.js';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`, // Proxy is setup in vite.config.js for local dev
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a response interceptor for unified error handling
apiClient.interceptors.response.use(
  (response) => {
    // Return just the data part of the response to simplify components
    return response.data;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error.response?.data || { message: 'Network error occurred' });
  }
);

export const api = {
  // Dashboard
  getSystemMetrics: () => apiClient.get('/metrics'),
  getLatencyTrends: () => apiClient.get('/metrics/latency-trends'),
  getTrafficDistribution: () => apiClient.get('/metrics/traffic-distribution'),
  
  // Vendors
  getVendors: (params) => apiClient.get('/vendors', { params }),
  getVendorSummary: () => apiClient.get('/vendors/summary'),
  createVendor: (data) => apiClient.post('/vendors', data),
  updateVendor: (id, data) => apiClient.put(`/vendors/${id}`, data),
  deleteVendor: (id) => apiClient.delete(`/vendors/${id}`),
  
  // Vendor Metrics
  getVendorMetrics: (id) => apiClient.get(`/metrics/${id}`),
  
  // Routing Logs
  getLogs: (params) => apiClient.get('/routing-logs', { params }),
  getLogById: (id) => apiClient.get(`/routing-logs/${id}`),
  
  // Strategy Configuration
  getActiveStrategy: () => apiClient.get('/strategy/active'),
  setStrategy: (data) => apiClient.post('/strategy', data),
  
  // AI
  generateAiConfig: (prompt) => apiClient.post('/ai/generate-config', { prompt }),
  getAiRecommendation: () => apiClient.post('/ai/recommend'),
  
  // Simulation
  simulateRoute: (data) => apiClient.post('/simulate', data),
  
  // Health
  getHealth: () => apiClient.get('/health'),
};

export default apiClient;
