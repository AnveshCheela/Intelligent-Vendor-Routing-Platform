import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/api.js';

export default function Configuration() {
  const [activeStrategy, setActiveStrategy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  
  // AI Settings State
  const [aiModel, setAiModel] = useState('gemini-2.5-flash');
  const [aiTemperature, setAiTemperature] = useState(20);
  
  // AI Generator State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [generatedConfig, setGeneratedConfig] = useState(null);

  const strategies = [
    {
      id: 'feature_based',
      name: 'Gemini AI Routing Advisor',
      description: 'Uses a large language model to dynamically select the best vendor based on real-time metrics and text analysis.',
      icon: 'smart_toy',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20'
    },
    {
      id: 'weighted',
      name: 'Default Weighted Routing',
      description: 'Distributes traffic based on pre-configured vendor weights. Best for stable, predictable load balancing.',
      icon: 'balance',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20'
    },
    {
      id: 'lowest_cost',
      name: 'Cost Optimized Routing',
      description: 'Always routes to the cheapest available vendor that supports the required capability.',
      icon: 'payments',
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20'
    },
    {
      id: 'lowest_latency',
      name: 'Latency Optimized Routing',
      description: 'Routes to the vendor with the lowest historical response time for lightning-fast verifications.',
      icon: 'speed',
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20'
    }
  ];

  useEffect(() => {
    fetchActiveStrategy();
  }, []);

  const fetchActiveStrategy = async () => {
    try {
      setLoading(true);
      const [stratRes, aiRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/strategy/active`),
        fetch(`${API_BASE_URL}/api/ai/settings`)
      ]);
      
      if (stratRes.ok) {
        const stratJson = await stratRes.json();
        setActiveStrategy(stratJson.data?.strategy || 'DEFAULT_WEIGHTED');
      }
      
      if (aiRes.ok) {
        const aiJson = await aiRes.json();
        if (aiJson.data) {
          setAiModel(aiJson.data.model);
          setAiTemperature(aiJson.data.temperature * 100);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStrategy = async (strategyId) => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMsg(null);
      
      const strategyData = {
        name: `User Selected ${strategyId}`,
        strategy: strategyId,
        config: {}
      };

      const res = await fetch(`${API_BASE_URL}/api/strategy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(strategyData)
      });
      
      if (!res.ok) throw new Error('Failed to save strategy');
      
      setActiveStrategy(strategyId);
      setSuccessMsg(`Successfully updated routing strategy to ${strategyId.replace('_', ' ')}`);
      
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAiSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMsg(null);
      
      const tempValue = aiTemperature / 100;
      
      const res = await fetch(`${API_BASE_URL}/api/ai/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: aiModel, temperature: tempValue })
      });
      
      if (!res.ok) throw new Error('Failed to save AI settings');
      
      setSuccessMsg(`AI Model updated to ${aiModel} with temperature ${tempValue.toFixed(1)}`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateConfig = async () => {
    try {
      setAiGenerating(true);
      setError(null);
      
      const res = await fetch(`${API_BASE_URL}/api/ai/generate-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt })
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to generate config');
      
      setGeneratedConfig(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-surface-inverse">Routing Configuration</h1>
        <p className="text-sm text-outline-default mt-1">Manage global routing rules and AI settings.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center gap-3">
          <span className="material-symbols-rounded text-lg">error</span>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {successMsg && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg flex items-center gap-3">
          <span className="material-symbols-rounded text-lg">check_circle</span>
          <p className="text-sm">{successMsg}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {strategies.map((strat) => {
            const isActive = activeStrategy === strat.id;
            return (
              <div 
                key={strat.id}
                className={`relative overflow-hidden rounded-xl border transition-all duration-300 ${isActive ? 'border-primary bg-surface-low shadow-[0_0_20px_rgba(139,92,246,0.1)]' : 'border-surface-high bg-surface hover:border-outline'}`}
              >
                {isActive && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary-hover"></div>
                )}
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${strat.bg} ${strat.border} border`}>
                      <span className={`material-symbols-rounded text-2xl ${strat.color}`}>{strat.icon}</span>
                    </div>
                    {isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                        Active
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSaveStrategy(strat.id)}
                        disabled={saving}
                        className="px-4 py-1.5 rounded-lg border border-surface-high text-sm font-medium hover:bg-surface-low transition-colors disabled:opacity-50"
                      >
                        Activate
                      </button>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-medium text-surface-inverse mb-2">{strat.name}</h3>
                  <p className="text-sm text-outline-default leading-relaxed">{strat.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 bg-surface rounded-xl border border-surface-high p-6 shadow-sm">
        <h3 className="text-lg font-medium text-surface-inverse mb-4 flex items-center gap-2">
          <span className="material-symbols-rounded text-primary">auto_awesome</span>
          AI Model Configuration
        </h3>
        <p className="text-sm text-outline-default mb-6">
          When the AI Routing Advisor is enabled, these settings control how the Gemini model evaluates vendors.
        </p>

        <div className="space-y-4 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-outline mb-1">Model Selection</label>
            <select 
              value={aiModel}
              onChange={(e) => setAiModel(e.target.value)}
              className="w-full bg-surface-low border border-surface-high rounded-lg px-4 py-2.5 text-surface-inverse focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
            >
              <option value="gemini-2.5-flash">gemini-2.5-flash</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-outline mb-1">Temperature</label>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={aiTemperature} 
                onChange={(e) => setAiTemperature(e.target.value)}
                className="flex-1 accent-primary cursor-pointer" 
              />
              <span className="text-sm text-surface-inverse w-8">{(aiTemperature / 100).toFixed(1)}</span>
            </div>
            <p className="text-xs text-outline-default mt-1">Lower values produce more deterministic routing decisions.</p>
          </div>
          
          <div className="pt-4 flex justify-end">
             <button 
               onClick={handleSaveAiSettings}
               disabled={saving}
               className="bg-surface-low border border-surface-high hover:border-outline text-surface-inverse px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
             >
              {saving ? 'Saving...' : 'Save AI Settings'}
            </button>
          </div>
        </div>
      </div>

      {/* Agentic AI Bonus Generator */}
      <div className="mt-8 bg-surface rounded-xl border border-surface-high p-6 shadow-sm border-t-4 border-t-purple-500">
        <h3 className="text-lg font-medium text-surface-inverse mb-4 flex items-center gap-2">
          <span className="material-symbols-rounded text-purple-400">smart_toy</span>
          Agentic AI Config Generator
        </h3>
        <p className="text-sm text-outline-default mb-6">
          Describe your routing rules in plain English, and the AI will automatically generate the JSON configuration required.
        </p>

        <div className="space-y-4">
          <textarea 
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="e.g., Use Vendor A for 70% traffic, Vendor B for 30%, but switch to Vendor C if latency crosses 2 seconds or error rate is above 5%."
            className="w-full bg-surface-lowest border border-surface-high rounded-lg p-4 text-surface-inverse text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none min-h-[100px]"
          />
          <div className="flex justify-end">
            <button 
              onClick={handleGenerateConfig}
              disabled={aiGenerating || !aiPrompt}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {aiGenerating ? (
                <><span className="material-symbols-rounded animate-spin">refresh</span> Generating...</>
              ) : (
                <><span className="material-symbols-rounded">auto_awesome</span> Generate Config</>
              )}
            </button>
          </div>

          {generatedConfig && (
            <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-purple-300 mb-2">AI Explanation</h4>
                <p className="text-sm text-surface-inverse/90">{generatedConfig.data?.reasoning || generatedConfig.reasoning || "No explanation provided."}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-outline-default mb-2">Generated JSON Configuration</h4>
                <pre className="bg-[#1e1e2e] border border-surface-high rounded-xl p-4 text-xs font-mono text-green-400 overflow-x-auto">
                  {JSON.stringify(generatedConfig.data || generatedConfig, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
