import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { API_BASE_URL } from '../utils/api.js';

export default function VendorModal({ isOpen, onClose, vendor, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    capability: 'kyc',
    priority: 1,
    weight: 50,
    costPerRequest: 0.05,
    rateLimit: 100
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (vendor) {
      setFormData({
        name: vendor.name,
        capability: vendor.capability,
        priority: vendor.priority,
        weight: vendor.weight,
        costPerRequest: vendor.costPerRequest,
        rateLimit: vendor.rateLimit
      });
    } else {
      setFormData({
        name: '',
        capability: 'kyc',
        priority: 1,
        weight: 50,
        costPerRequest: 0.05,
        rateLimit: 100
      });
    }
  }, [vendor, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Basic validation
      if (!formData.name) throw new Error('Vendor name is required');
      
      const isEdit = !!vendor;
      const url = isEdit ? `/api/vendors/${vendor.id}` : '/api/vendors';
      const method = isEdit ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        priority: Number(formData.priority),
        weight: Number(formData.weight),
        costPerRequest: Number(formData.costPerRequest),
        rateLimit: Number(formData.rateLimit)
      };

      const res = await fetch(`${API_BASE_URL}${url}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json.message || 'Failed to save vendor');
      }
      
      onSave(json.data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface border border-surface-high rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up">
        
        <div className="flex items-center justify-between p-6 border-b border-surface-high">
          <h2 className="text-xl font-semibold text-surface-inverse">
            {vendor ? 'Edit Vendor' : 'Add New Vendor'}
          </h2>
          <button 
            onClick={onClose}
            className="text-outline-default hover:text-surface-inverse transition-colors"
          >
            <span className="material-symbols-rounded">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-outline mb-1">Vendor Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-surface-low border border-surface-high rounded-lg px-4 py-2 text-surface-inverse focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="e.g., Stripe Identity"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-outline mb-1">Capability</label>
              <select 
                value={formData.capability}
                onChange={e => setFormData({...formData, capability: e.target.value})}
                className="w-full bg-surface-low border border-surface-high rounded-lg pl-4 pr-10 py-2 text-surface-inverse focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="kyc">KYC / Identity</option>
                <option value="kyc_aml">KYC + AML</option>
                <option value="ocr">OCR</option>
                <option value="fraud">Fraud Detection</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-outline mb-1">Priority (1 = Highest)</label>
                <input 
                  type="number" 
                  min="1"
                  value={formData.priority}
                  onChange={e => setFormData({...formData, priority: e.target.value})}
                  className="w-full bg-surface-low border border-surface-high rounded-lg px-4 py-2 text-surface-inverse focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-outline mb-1">Weight (0-100)</label>
                <input 
                  type="number" 
                  min="0"
                  max="100"
                  value={formData.weight}
                  onChange={e => setFormData({...formData, weight: e.target.value})}
                  className="w-full bg-surface-low border border-surface-high rounded-lg px-4 py-2 text-surface-inverse focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-outline mb-1">Cost Per Request (₹)</label>
                <input 
                  type="number" 
                  step="0.001"
                  min="0"
                  value={formData.costPerRequest}
                  onChange={e => setFormData({...formData, costPerRequest: e.target.value})}
                  className="w-full bg-surface-low border border-surface-high rounded-lg px-4 py-2 text-surface-inverse focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-outline mb-1">Rate Limit (req/s)</label>
                <input 
                  type="number" 
                  min="1"
                  value={formData.rateLimit}
                  onChange={e => setFormData({...formData, rateLimit: e.target.value})}
                  className="w-full bg-surface-low border border-surface-high rounded-lg px-4 py-2 text-surface-inverse focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-surface-high">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-outline hover:text-surface-inverse transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              {vendor ? 'Update Vendor' : 'Add Vendor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
