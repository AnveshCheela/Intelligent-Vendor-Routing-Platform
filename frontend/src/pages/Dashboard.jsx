import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import MetricCard from '../components/MetricCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { useToast } from '../context/ToastContext';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [latencyData, setLatencyData] = useState([]);
  const [trafficData, setTrafficData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');
  const { addToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sysMetrics, latencyTrends, trafficDist] = await Promise.all([
          api.getSystemMetrics(),
          api.getLatencyTrends(),
          api.getTrafficDistribution()
        ]);
        
        setMetrics(sysMetrics.data);
        
        // Format latency data for Recharts
        const formattedLatency = latencyTrends.data.map(d => ({
          ...d,
          time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        setLatencyData(formattedLatency);
        
        setTrafficData(trafficDist.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  const handleExport = () => {
    if (!latencyData.length || !trafficData.length) {
      addToast('No data available to export', 'error');
      return;
    }
    
    // Create CSV content for traffic
    const trafficHeader = 'Vendor,Traffic Percentage\n';
    const trafficRows = trafficData.map(d => `${d.name},${d.value}%`).join('\n');
    
    const csvContent = "data:text/csv;charset=utf-8," + "--- Traffic Distribution ---\n" + trafficHeader + trafficRows;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vendor-routing-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addToast('Report exported successfully!', 'success');
  };

  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
    addToast(`Filtering by ${e.target.value === '24h' ? 'Last 24 Hours' : 'Last 7 Days'} (Simulated)`, 'info');
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-surface-inverse">Dashboard</h1>
          <p className="text-sm text-outline-default mt-1">System Overview & Routing Analytics</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary" onClick={handleExport}>
            <span className="material-symbols-rounded">download</span>
            Export Report
          </button>
          <button className="btn-primary" onClick={() => window.location.reload()}>
            <span className="material-symbols-rounded">refresh</span>
            Refresh Data
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Total Requests (24h)" 
          value={(metrics?.total_requests_today / 1000000).toFixed(1)} 
          suffix="M"
        />
        <MetricCard 
          title="Active Vendors" 
          value={`${metrics?.active_vendors} / ${metrics?.total_vendors}`}
          change="All Healthy"
          trend="neutral"
        />
        <MetricCard 
          title="Avg Routing Latency" 
          value={metrics?.avg_latency_ms}
          suffix="ms"
        />
        <div className="card p-5 relative overflow-hidden">
          <h3 className="text-sm font-medium text-surface-inverse/70 mb-2">Routing Success Rate</h3>
          <div className="text-3xl font-bold text-surface-inverse">{metrics?.success_rate}%</div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-surface-low">
            <div className="h-full bg-emerald-500" style={{ width: `${metrics?.success_rate}%` }}></div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latency Trends */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-surface-inverse">Latency Trends (p95)</h2>
            <select 
              className="bg-surface-lowest border border-outline-variant rounded-lg pl-4 pr-10 py-2 text-sm text-surface-inverse focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium shadow-sm cursor-pointer"
              value={timeRange}
              onChange={handleTimeRangeChange}
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={latencyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f8" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#777587' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#777587' }} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #c7c4d8', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '13px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#2a313d', marginBottom: '4px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Line type="monotone" dataKey="Vendor A" stroke="#3525cd" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Vendor B" stroke="#818cf8" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Vendor C" stroke="#c7c4d8" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic Distribution */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold text-surface-inverse">Traffic Distribution</h2>
            <button className="btn-icon"><span className="material-symbols-rounded">more_vert</span></button>
          </div>
          <div className="h-[240px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={trafficData}
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {trafficData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-surface-inverse">100%</span>
              <span className="text-xs text-outline-default">Routed</span>
            </div>
          </div>
          
          <div className="space-y-3 mt-4">
            {trafficData.map((entry, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.fill }}></div>
                  <span className="text-surface-inverse">{entry.name}</span>
                </div>
                <span className="font-medium">{entry.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
