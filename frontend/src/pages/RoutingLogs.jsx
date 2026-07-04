import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/api.js';

export default function RoutingLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [strategyFilter, setStrategyFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [statusFilter, strategyFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        status: statusFilter,
        strategy: strategyFilter,
        search: search
      });
      
      const res = await fetch(`${API_BASE_URL}/api/routing-logs?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch logs');
      const json = await res.json();
      setLogs(json.data?.logs || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-surface-inverse">Routing Logs</h1>
          <p className="text-sm text-outline-default mt-1">View historical vendor routing decisions and outcomes.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-xl border border-surface-high p-4 flex flex-col md:flex-row gap-4 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-outline-default">search</span>
          <input 
            type="text" 
            placeholder="Search by Request ID..." 
            className="w-full bg-surface-low border border-surface-high rounded-lg pl-10 pr-4 py-2 text-surface-inverse placeholder-outline-default focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
        
        <div className="flex gap-4">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface-low border border-surface-high rounded-lg pl-4 pr-10 py-2 text-surface-inverse focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>

          <select 
            value={strategyFilter}
            onChange={(e) => setStrategyFilter(e.target.value)}
            className="bg-surface-low border border-surface-high rounded-lg pl-4 pr-10 py-2 text-surface-inverse focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="all">All Strategies</option>
            <option value="feature_based">AI Routing</option>
            <option value="weighted">Default Weighted</option>
            <option value="lowest_cost">Cost Optimized</option>
            <option value="lowest_latency">Latency Optimized</option>
          </select>
          
          <button 
            onClick={fetchLogs}
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-primary/20 shadow-lg"
          >
            <span className="material-symbols-rounded text-sm">refresh</span>
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-xl border border-surface-high shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-outline-default">
            <thead className="bg-surface-low text-surface-inverse border-b border-surface-high">
              <tr>
                <th className="px-6 py-4 font-medium">Timestamp</th>
                <th className="px-6 py-4 font-medium">Request ID</th>
                <th className="px-6 py-4 font-medium">Vendor</th>
                <th className="px-6 py-4 font-medium">Strategy</th>
                <th className="px-6 py-4 font-medium">Latency</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-high">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-red-400">
                    {error}
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    No routing logs found matching your criteria.
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-surface-low/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                    <td className="px-6 py-4 font-mono text-xs">{log.requestId}</td>
                    <td className="px-6 py-4 font-medium text-surface-inverse">{log.vendor?.name || 'Unknown'}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-surface-high text-xs font-medium">
                        {log.strategyUsed.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">{log.latencyMs}ms</td>
                    <td className="px-6 py-4">
                      {log.status === 'success' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                          Success
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-medium border border-red-500/20" title={log.errorMessage}>
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                          Failed
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
