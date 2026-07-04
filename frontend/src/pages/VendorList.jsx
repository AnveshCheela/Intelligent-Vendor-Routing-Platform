import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import VendorModal from '../components/VendorModal';
import { useToast } from '../context/ToastContext';

export default function VendorList() {
  const [vendors, setVendors] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCap, setFilterCap] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50 });
  
  // Modal & Toast State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    fetchData();
  }, [filterCap, page]); // Re-fetch on filter or page change

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vendorsRes, summaryRes] = await Promise.all([
        api.getVendors({ capability: filterCap, page }),
        api.getVendorSummary()
      ]);
      setVendors(vendorsRes.data.vendors);
      setPagination(vendorsRes.data.pagination || { total: vendorsRes.data.vendors.length, page: 1, limit: 50 });
      setSummary(summaryRes.data);
    } catch (error) {
      console.error("Failed to fetch vendors:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClick = () => {
    setEditingVendor(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (vendor) => {
    setEditingVendor(vendor);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to block/delete vendor: ${name}?`)) return;
    
    try {
      const res = await fetch(`/api/vendors/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete vendor');
      addToast(`${name} has been deleted successfully.`, 'success');
      fetchData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleExportCsv = () => {
    if (!filteredVendors.length) {
      addToast('No vendors to export', 'error');
      return;
    }
    
    const headers = ['ID', 'Name', 'Capability', 'Priority', 'Weight', 'Cost Per Request', 'Rate Limit', 'Status'];
    const rows = filteredVendors.map(v => 
      [v.id, v.name, v.capability, v.priority, v.weight, v.costPerRequest, v.rateLimit, v.status].join(',')
    );
    
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + '\n' + rows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vendors-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Vendor list exported successfully!', 'success');
  };

  const handleModalSave = (savedVendor) => {
    addToast(`Vendor ${savedVendor.name} saved successfully!`, 'success');
    fetchData(); // Refresh list
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-surface-inverse">Vendors</h1>
          <p className="text-sm text-outline-default mt-1">Manage vendor routing targets and configurations</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary" onClick={handleExportCsv}>
            <span className="material-symbols-rounded">download</span>
            Export CSV
          </button>
          <button className="btn-primary" onClick={handleAddClick}>
            <span className="material-symbols-rounded">add</span>
            Add Vendor
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <h3 className="text-sm font-medium text-surface-inverse/70 mb-2">Total Active</h3>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold text-surface-inverse">{summary?.totalActive || 0}</div>
          </div>
        </div>
        <div className="card p-5 border-l-4 border-l-amber-500">
          <h3 className="text-sm font-medium text-surface-inverse/70 mb-2">Degraded/Down</h3>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold text-surface-inverse">{summary?.degradedDown || 0}</div>
          </div>
        </div>
        <div className="card p-5">
          <h3 className="text-sm font-medium text-surface-inverse/70 mb-2">Avg Latency (Top 5)</h3>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold text-surface-inverse">{summary?.avgLatencyMs || 0}<span className="text-lg font-medium text-outline-default ml-1">ms</span></div>
          </div>
        </div>
        <div className="card p-5 relative overflow-hidden">
          <h3 className="text-sm font-medium text-surface-inverse/70 mb-2">Monthly Spend Est.</h3>
          <div className="flex items-end justify-between mb-3">
            <div className="text-3xl font-bold text-surface-inverse">${((summary?.monthlySpendEst || 0) / 1000).toFixed(1)}k</div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-surface-low">
            <div className="h-full bg-primary" style={{ width: '65%' }}></div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="card flex flex-col">
        {/* Table Controls */}
        <div className="p-4 border-b border-outline-variant/30 flex items-center justify-between gap-4 bg-surface-lowest">
          <div className="relative w-72">
            <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-outline-default text-[20px]">search</span>
            <input 
              type="text" 
              placeholder="Search vendors by name or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <div className="flex items-center gap-3">
            <select 
              value={filterCap}
              onChange={(e) => { setFilterCap(e.target.value); setPage(1); }}
              className="bg-surface-low border border-surface-high rounded-lg pl-4 pr-10 py-2 text-surface-inverse focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="all">All Capabilities</option>
              <option value="kyc">KYC / Identity</option>
              <option value="ocr">OCR / Document</option>
              <option value="fraud">Fraud Detection</option>
            </select>
            <button className="btn-secondary py-1.5" onClick={() => addToast('More filters coming soon', 'info')}>
              <span className="material-symbols-rounded text-[20px]">filter_list</span>
              More Filters
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-low text-surface-inverse/70 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4 rounded-tl-xl">Vendor Name</th>
                <th className="px-6 py-4">Capability</th>
                <th className="px-6 py-4 text-center">Priority</th>
                <th className="px-6 py-4 text-right">Weight</th>
                <th className="px-6 py-4 text-right">Cost/Req</th>
                <th className="px-6 py-4 text-right">Rate Limit</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 rounded-tr-xl text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-outline-default">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    Loading vendors...
                  </td>
                </tr>
              ) : filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-outline-default">
                    No vendors found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className={`hover:bg-surface-low transition-colors group ${vendor.status === 'down' ? 'bg-error-container/10' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          {vendor.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-surface-inverse">{vendor.name}</div>
                          <div className="text-xs text-outline-default font-mono">{vendor.id.substring(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-surface-high px-2.5 py-1 rounded-md text-xs font-medium text-surface-inverse">
                        {vendor.capability.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-surface-high font-semibold text-xs text-surface-inverse">
                        {vendor.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-medium">{vendor.weight}%</div>
                      <div className="w-full bg-surface-high h-1.5 rounded-full mt-1.5 overflow-hidden flex justify-end">
                        <div className="h-full bg-primary" style={{ width: `${vendor.weight}%` }}></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-outline-default">
                      ${vendor.costPerRequest.toFixed(4)}
                    </td>
                    <td className="px-6 py-4 text-right text-outline-default">
                      {vendor.rateLimit}/s
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={vendor.status} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="btn-icon p-1.5 hover:text-primary" onClick={() => handleEditClick(vendor)} title="Edit Vendor">
                          <span className="material-symbols-rounded text-[20px]">edit</span>
                        </button>
                        <button className="btn-icon p-1.5 hover:text-primary" onClick={() => addToast('Monitoring dashboard coming soon', 'info')} title="View Metrics">
                          <span className="material-symbols-rounded text-[20px]">monitoring</span>
                        </button>
                        <button className="btn-icon p-1.5 hover:text-error" onClick={() => handleDelete(vendor.id, vendor.name)} title="Block/Delete Vendor">
                          <span className="material-symbols-rounded text-[20px]">block</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-outline-variant/30 flex items-center justify-between text-sm text-outline-default">
          <div>
            Showing {pagination.total === 0 ? 0 : ((pagination.page - 1) * pagination.limit) + 1}-
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} vendors
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="btn-icon p-1 disabled:opacity-50" 
              disabled={pagination.page <= 1}
              onClick={() => setPage(p => p - 1)}
            >
              <span className="material-symbols-rounded">chevron_left</span>
            </button>
            <span className="px-2 font-medium text-surface-inverse">{pagination.page}</span>
            <button 
              className="btn-icon p-1 disabled:opacity-50" 
              disabled={pagination.page * pagination.limit >= pagination.total}
              onClick={() => setPage(p => p + 1)}
            >
              <span className="material-symbols-rounded">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Add/Edit Modal */}
      <VendorModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vendor={editingVendor}
        onSave={handleModalSave}
      />
    </div>
  );
}
