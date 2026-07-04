import React, { useState, useEffect } from 'react';
import { api } from '../api/client';

export default function VendorMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await api.getSystemMetrics();
      setMetrics(res.data);
    } catch (err) {
      console.error("Failed to fetch metrics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const getMetricColor = (val, threshold) => {
    if (val >= threshold.good) return 'bg-emerald-500';
    if (val >= threshold.warn) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-surface-inverse">Vendor Metrics</h1>
          <p className="text-sm text-outline-default mt-1">Per-vendor performance tracked across all routed requests.</p>
        </div>
        <button className="btn-secondary" onClick={fetchMetrics} disabled={loading}>
          <span className={`material-symbols-rounded ${loading ? 'animate-spin' : ''}`}>refresh</span>
          Refresh
        </button>
      </div>

      {/* Top Stats - Exact Match to Friend's UI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-5">
          <h3 className="text-sm font-medium text-surface-inverse/70 mb-2">Total Vendors</h3>
          <div className="text-3xl font-bold text-primary">{metrics?.total_vendors || 0}</div>
        </div>
        <div className="card p-5">
          <h3 className="text-sm font-medium text-surface-inverse/70 mb-2">Healthy Vendors</h3>
          <div className="text-3xl font-bold text-emerald-400">{metrics?.active_vendors || 0}</div>
        </div>
        <div className="card p-5">
          <h3 className="text-sm font-medium text-surface-inverse/70 mb-2">Total Requests</h3>
          <div className="text-3xl font-bold text-primary">{metrics?.total_requests_today || 0}</div>
        </div>
        <div className="card p-5 border-l-4 border-l-emerald-500">
          <h3 className="text-sm font-medium text-surface-inverse/70 mb-2">Overall Success Rate</h3>
          <div className="text-3xl font-bold text-emerald-400">{metrics ? metrics.success_rate.toFixed(2) : '0.00'}%</div>
        </div>
      </div>

      {/* Detailed Vendor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && !metrics ? (
          <div className="col-span-full py-12 text-center text-outline-default">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            Loading metrics...
          </div>
        ) : (
          metrics?.vendor_metrics?.map((vendor, idx) => {
            const isDown = vendor.status === 'down';
            
            // Using actual perfect metrics from backend
            const successRate = vendor.successRate;
            const avgLatency = vendor.avgLatencyMs;
            const total = vendor.totalRequests;
            const successCount = vendor.successfulRequests;
            const failCount = vendor.errors;
            
            // Availability calculation based on success rate if there are requests, otherwise 100 if healthy
            const availability = total > 0 ? successRate : (isDown ? 0 : 100);
            const errorRate = vendor.errorRate;
            const isHealthy = vendor.status === 'active' && successRate >= 50;

            return (
              <div key={idx} className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-surface-inverse">{vendor.vendorName}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${isHealthy ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {isHealthy ? 'healthy' : 'unhealthy'}
                  </span>
                </div>

                <div className="space-y-5">
                  {/* Success Rate Bar */}
                  <div>
                    <div className="flex justify-between text-xs mb-1 text-outline-default">
                      <span>Success Rate</span>
                      <span className="font-medium text-surface-inverse">{successRate.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-surface-high h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${getMetricColor(successRate, {good: 90, warn: 70})}`} style={{ width: `${successRate}%` }}></div>
                    </div>
                  </div>

                  {/* Availability Bar */}
                  <div>
                    <div className="flex justify-between text-xs mb-1 text-outline-default">
                      <span>Availability</span>
                      <span className="font-medium text-surface-inverse">{availability.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-surface-high h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${getMetricColor(availability, {good: 95, warn: 80})}`} style={{ width: `${availability}%` }}></div>
                    </div>
                  </div>

                  {/* Error Rate Bar */}
                  <div>
                    <div className="flex justify-between text-xs mb-1 text-outline-default">
                      <span>Error Rate</span>
                      <span className="font-medium text-surface-inverse">{errorRate.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-surface-high h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${errorRate > 10 ? 'bg-red-500' : errorRate > 5 ? 'bg-amber-500' : 'bg-surface-inverse/20'}`} style={{ width: `${Math.min(100, errorRate * 5)}%` }}></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-surface-high">
                    <div>
                      <div className="text-xs text-outline-default mb-1">Requests</div>
                      <div className="text-lg font-semibold text-surface-inverse">{total}</div>
                      <div className="text-[10px] text-outline-default mt-1">Fail: <span className="text-red-400">{failCount}</span></div>
                    </div>
                    <div>
                      <div className="text-xs text-outline-default mb-1">Avg Latency</div>
                      <div className="text-lg font-semibold text-surface-inverse">{avgLatency.toFixed(0)}ms</div>
                      <div className="text-[10px] text-emerald-400 mt-1">Success: {successCount}</div>
                    </div>
                    <div>
                      <div className="text-xs text-outline-default mb-1">Total Spend</div>
                      <div className="text-lg font-semibold text-surface-inverse">₹{(vendor.totalSpend || 0).toFixed(2)}</div>
                      <div className="text-[10px] text-outline-default mt-1">₹{vendor.costPerRequest}/req</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
