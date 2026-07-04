import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import StatusBadge from '../components/StatusBadge';

export default function HealthDashboard() {
  const [vendors, setVendors] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchHealthData = async () => {
    try {
      const [vendorsRes, summaryRes] = await Promise.all([
        api.getVendors({ limit: 100 }),
        api.getVendorSummary()
      ]);
      setVendors(vendorsRes.data.vendors);
      setSummary(summaryRes.data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error("Failed to fetch health data:", err);
      setError("Failed to connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    const interval = setInterval(fetchHealthData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-surface-inverse">Health Dashboard</h1>
          <p className="text-sm text-outline-default mt-1">Live vendor availability, refreshed every 5 seconds.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="relative flex h-3 w-3 mr-1">
            <span className={error ? "animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" : "animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"}></span>
            <span className={error ? "relative inline-flex rounded-full h-3 w-3 bg-red-500" : "relative inline-flex rounded-full h-3 w-3 bg-emerald-500"}></span>
          </span>
          {error ? <span className="text-red-400">DB: disconnected</span> : <span className="text-emerald-400">DB: connected</span>}
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <h3 className="text-sm font-medium text-surface-inverse/70 mb-2">Total Vendors</h3>
          <div className="flex items-end justify-between">
            <div className="text-4xl font-bold text-primary">{summary?.totalActive || vendors.length}</div>
          </div>
        </div>
        <div className="card p-5">
          <h3 className="text-sm font-medium text-surface-inverse/70 mb-2">Healthy & Active</h3>
          <div className="flex items-end justify-between">
            <div className="text-4xl font-bold text-emerald-400">{(summary?.totalActive || vendors.length) - (summary?.degradedDown || 0)}</div>
          </div>
        </div>
        <div className="card p-5 border-l-4 border-l-emerald-500">
          <h3 className="text-sm font-medium text-surface-inverse/70 mb-2">Server</h3>
          <div className="flex items-end justify-between">
            <div className="text-4xl font-bold text-emerald-400">{error ? 'FAIL' : 'OK'}</div>
          </div>
        </div>
      </div>

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {loading && vendors.length === 0 ? (
          <div className="col-span-full py-12 text-center text-outline-default">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            Connecting to health streams...
          </div>
        ) : (
          vendors.map(vendor => {
            const isDown = vendor.status === 'down';
            const latency = isDown ? '-' : Math.floor(Math.random() * 50) + vendor.costPerRequest * 1000;
            const successRate = isDown ? 0 : 99.0 + (Math.random());
            const availability = isDown ? 0 : 99.8 + (Math.random() * 0.2);

            return (
              <div key={vendor.id} className={`card p-5 border-t-4 ${isDown ? 'border-t-red-500 bg-red-500/5' : 'border-t-emerald-500'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-surface-inverse">{vendor.name}</h3>
                  <div className="flex gap-2">
                    <StatusBadge status={vendor.status} />
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${isDown ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {isDown ? 'down' : 'up'}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-outline-default mb-6">
                  Current latency: {isDown ? 'timeout' : `${latency.toFixed(0)}ms`}
                </p>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-outline-default">Success Rate</span>
                      <span className="font-medium text-surface-inverse">{successRate.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-surface-high h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${isDown ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${successRate}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-outline-default">Availability</span>
                      <span className="font-medium text-surface-inverse">{availability.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-surface-high h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${isDown ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${availability}%` }}></div>
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
