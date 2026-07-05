import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';

export default function GlobalSettings() {
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    latencyExclusionThreshold: 2000,
    defaultTimeout: 3000,
    highErrorRateThreshold: 50,
    minSamplesHealthCheck: 5,
    cooldownMs: 60000,
    rateLimitWindowMs: 60000,
    vendorCacheTtlMs: 3000,
    strictAgenticAiMode: false
  });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setSettings(prev => ({ ...prev, ...data }));
        }
      })
      .catch(err => console.error('Failed to load settings:', err));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : Number(value)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        addToast('Global settings updated dynamically', 'success');
      } else {
        addToast('Failed to update settings', 'error');
      }
    } catch (err) {
      addToast('Network error saving settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[900px] mx-auto animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-semibold text-surface-inverse">Global Settings</h1>
        <p className="text-sm text-outline-default mt-1">Configure core system limits, circuit breakers, and AI fallback behavior.</p>
      </div>

      <div className="space-y-6">
        {/* Routing & Timeout */}
        <div className="card p-6 border-l-4 border-l-primary">
          <h2 className="text-lg font-semibold text-surface-inverse mb-1">Routing & Timeout</h2>
          <p className="text-sm text-outline-default mb-5">Global defaults for evaluating active vendor responses.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-surface-inverse mb-1">Latency Exclusion Threshold (ms)</label>
              <p className="text-xs text-outline-default mb-2">Vendors with current latency above this are skipped.</p>
              <input 
                type="number" 
                name="latencyExclusionThreshold"
                value={settings.latencyExclusionThreshold}
                onChange={handleChange}
                className="w-full bg-surface-low border border-surface-high rounded-lg px-4 py-2 text-surface-inverse focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-inverse mb-1">Default Timeout (ms)</label>
              <p className="text-xs text-outline-default mb-2">Used if a vendor does not specify its own timeout.</p>
              <input 
                type="number" 
                name="defaultTimeout"
                value={settings.defaultTimeout}
                onChange={handleChange}
                className="w-full bg-surface-low border border-surface-high rounded-lg px-4 py-2 text-surface-inverse focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Circuit Breaker & Health */}
        <div className="card p-6 border-l-4 border-l-emerald-500">
          <h2 className="text-lg font-semibold text-surface-inverse mb-1">Circuit Breaker & Health</h2>
          <p className="text-sm text-outline-default mb-5">Controls how vendors are marked unhealthy and when they recover.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-surface-inverse mb-1">High Error Rate Threshold (%)</label>
              <input 
                type="number" 
                name="highErrorRateThreshold"
                value={settings.highErrorRateThreshold}
                onChange={handleChange}
                className="w-full bg-surface-low border border-surface-high rounded-lg px-4 py-2 text-surface-inverse focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-inverse mb-1">Min Samples for Health Check</label>
              <input 
                type="number" 
                name="minSamplesHealthCheck"
                value={settings.minSamplesHealthCheck}
                onChange={handleChange}
                className="w-full bg-surface-low border border-surface-high rounded-lg px-4 py-2 text-surface-inverse focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-inverse mb-1">Cooldown / Half-Open (ms)</label>
              <input 
                type="number" 
                name="cooldownMs"
                value={settings.cooldownMs}
                onChange={handleChange}
                className="w-full bg-surface-low border border-surface-high rounded-lg px-4 py-2 text-surface-inverse focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* System */}
        <div className="card p-6 border-l-4 border-l-amber-500">
          <h2 className="text-lg font-semibold text-surface-inverse mb-1">System</h2>
          <p className="text-sm text-outline-default mb-5">Global backend constraints and AI orchestration settings.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-surface-inverse mb-1">Rate Limit Window (ms)</label>
              <p className="text-xs text-outline-default mb-2">Rolling window for API rate limits.</p>
              <input 
                type="number" 
                name="rateLimitWindowMs"
                value={settings.rateLimitWindowMs}
                onChange={handleChange}
                className="w-full bg-surface-low border border-surface-high rounded-lg px-4 py-2 text-surface-inverse focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-inverse mb-1">Vendor Cache TTL (ms)</label>
              <p className="text-xs text-outline-default mb-2">How long vendor list is cached in memory.</p>
              <input 
                type="number" 
                name="vendorCacheTtlMs"
                value={settings.vendorCacheTtlMs}
                onChange={handleChange}
                className="w-full bg-surface-low border border-surface-high rounded-lg px-4 py-2 text-surface-inverse focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-surface-high">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-0.5">
                <input 
                  type="checkbox" 
                  name="strictAgenticAiMode"
                  checked={settings.strictAgenticAiMode}
                  onChange={handleChange}
                  className="peer appearance-none w-5 h-5 border-2 border-outline rounded bg-surface-low checked:bg-primary checked:border-primary transition-colors cursor-pointer"
                />
                <span className="material-symbols-rounded absolute text-white text-[16px] opacity-0 peer-checked:opacity-100 pointer-events-none">check</span>
              </div>
              <div>
                <div className="text-sm font-medium text-surface-inverse group-hover:text-primary transition-colors">Strict Agentic AI Mode (Disable Fallback)</div>
                <div className="text-xs text-outline-default mt-1 leading-relaxed">
                  If checked, rule generation will strictly require the Gemini AI to function and will throw an error if unavailable. If unchecked, it will fall back to a regex parser.
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="btn-primary"
          >
            {saving ? (
              <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Saving...</>
            ) : (
              'Save Settings'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
