import React, { useState } from 'react';

export default function TestRequest() {
  const defaultPayloads = {
    kyc: '{\n  "firstName": "Jane",\n  "lastName": "Doe",\n  "documentType": "PASSPORT",\n  "documentNumber": "A123456789"\n}',
    ocr: '{\n  "documentUrl": "https://example.com/id-front.jpg",\n  "expectedType": "DRIVERS_LICENSE",\n  "extractFields": ["name", "dob", "address"]\n}',
    fraud: '{\n  "ipAddress": "192.168.1.100",\n  "deviceId": "dev_8899aabbcc",\n  "email": "jane.doe@example.com",\n  "transactionAmount": 1500.00\n}',
    kyc_aml: '{\n  "firstName": "Jane",\n  "lastName": "Doe",\n  "dateOfBirth": "1985-04-12",\n  "country": "US",\n  "screeningLevel": "ENHANCED"\n}'
  };

  const [capability, setCapability] = useState('kyc');
  const [strategy, setStrategy] = useState('');
  const [payloadText, setPayloadText] = useState(defaultPayloads.kyc);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const capabilities = [
    { id: 'kyc', label: 'KYC / Identity' },
    { id: 'ocr', label: 'OCR / Document' },
    { id: 'fraud', label: 'Fraud Check' },
    { id: 'kyc_aml', label: 'KYC + AML Screening' }
  ];

  const strategies = [
    { id: '', label: 'Auto (Use Global AI Config)' },
    { id: 'priority', label: 'Priority' },
    { id: 'weighted', label: 'Weighted' },
    { id: 'round_robin', label: 'Round Robin' },
    { id: 'lowest_latency', label: 'Lowest Latency' },
    { id: 'lowest_cost', label: 'Lowest Cost' },
    { id: 'health_based', label: 'Health Based' },
    { id: 'feature_based', label: 'Feature Based' }
  ];

  const handleTestRoute = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      // Validate JSON
      let parsedPayload;
      try {
        parsedPayload = JSON.parse(payloadText);
      } catch (err) {
        throw new Error('Invalid JSON payload. Please fix syntax errors.');
      }

      const requestBody = {
        capability,
        payload: parsedPayload
      };
      
      if (strategy) {
        requestBody.routing_preference = strategy;
      }

      const startTime = performance.now();
      const res = await fetch('/api/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      const endTime = performance.now();
      
      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json.message || 'Routing failed');
      }

      setResult({
        ...json,
        timeTaken: Math.round(endTime - startTime)
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-surface-inverse">Test Routing Engine</h1>
        <p className="text-sm text-outline-default mt-1">Simulate a request to see which vendor the routing engine selects in real-time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="bg-surface rounded-xl border border-surface-high shadow-sm p-6 flex flex-col h-full">
          <h2 className="text-lg font-medium text-surface-inverse mb-6 flex items-center gap-2">
            <span className="material-symbols-rounded text-primary">send</span>
            Request Details
          </h2>
          
          <div className="space-y-6 flex-1 flex flex-col">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-outline mb-2">Required Capability</label>
                <select 
                  value={capability}
                  onChange={(e) => {
                    const newCap = e.target.value;
                    setCapability(newCap);
                    setPayloadText(defaultPayloads[newCap]);
                  }}
                  className="w-full bg-surface-low border border-surface-high rounded-lg pl-4 pr-10 py-3 text-surface-inverse focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  {capabilities.map(cap => (
                    <option key={cap.id} value={cap.id}>{cap.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-outline mb-2">Override Strategy</label>
                <select 
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                  className="w-full bg-surface-low border border-surface-high rounded-lg pl-4 pr-10 py-3 text-surface-inverse focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  {strategies.map(strat => (
                    <option key={strat.id} value={strat.id}>{strat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-[300px]">
              <label className="block text-sm font-medium text-outline mb-2">JSON Payload</label>
              <textarea 
                value={payloadText}
                onChange={(e) => setPayloadText(e.target.value)}
                className="flex-1 w-full bg-[#1e1e2e] border border-surface-high rounded-lg p-4 text-green-400 font-mono text-sm focus:outline-none focus:border-primary resize-none custom-scrollbar"
                spellCheck="false"
              ></textarea>
            </div>
            
            <button 
              onClick={handleTestRoute}
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-medium transition-colors shadow-primary/20 shadow-lg flex justify-center items-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Routing...
                </>
              ) : (
                <>
                  <span className="material-symbols-rounded">route</span>
                  Send Request to Router
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="bg-surface-low rounded-xl border border-surface-high shadow-inner p-6 flex flex-col h-full">
          <h2 className="text-lg font-medium text-surface-inverse mb-6 flex items-center gap-2">
            <span className="material-symbols-rounded text-green-400">terminal</span>
            Routing Result
          </h2>
          
          <div className="flex-1">
            {!result && !error && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-outline-default opacity-50">
                <span className="material-symbols-rounded text-6xl mb-4">compare_arrows</span>
                <p>Send a request to see the routing decision here.</p>
              </div>
            )}

            {loading && (
              <div className="h-full flex flex-col items-center justify-center text-primary space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin"></div>
                  <div className="absolute inset-2 border-r-2 border-purple-400 rounded-full animate-spin animation-delay-200"></div>
                  <div className="absolute inset-4 border-b-2 border-blue-400 rounded-full animate-spin animation-delay-400"></div>
                  <div className="w-16 h-16"></div>
                </div>
                <p className="animate-pulse">Analyzing vendors...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-symbols-rounded">error</span>
                  <h3 className="font-medium text-lg">Routing Failed</h3>
                </div>
                <p className="text-sm opacity-90">{error}</p>
              </div>
            )}

            {result && !loading && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface border border-surface-high p-4 rounded-xl">
                    <p className="text-xs text-outline-default mb-1 uppercase tracking-wider font-semibold">Selected Vendor</p>
                    <p className="text-lg font-medium text-surface-inverse">{result.vendorUsed || result.routed_to || result.selectedVendor || result.data?.vendor?.name || 'Unknown'}</p>
                  </div>
                  <div className="bg-surface border border-surface-high p-4 rounded-xl">
                    <p className="text-xs text-outline-default mb-1 uppercase tracking-wider font-semibold">Strategy Used</p>
                    <p className="text-lg font-medium text-primary">{result.strategyUsed?.replace('_', ' ') || result.strategy_used?.replace('_', ' ') || result.strategy?.replace('_', ' ') || result.data?.strategyUsed?.replace('_', ' ') || 'Auto-Evaluated'}</p>
                  </div>
                  <div className="bg-surface border border-surface-high p-4 rounded-xl">
                    <p className="text-xs text-outline-default mb-1 uppercase tracking-wider font-semibold">Round Trip</p>
                    <p className="text-lg font-medium text-surface-inverse">{result.timeTaken} ms</p>
                  </div>
                  <div className="bg-surface border border-surface-high p-4 rounded-xl">
                    <p className="text-xs text-outline-default mb-1 uppercase tracking-wider font-semibold">Status</p>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                      <p className="text-lg font-medium text-green-400">Success</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-outline-default mb-2 uppercase tracking-wider font-semibold">Raw Response</p>
                  <pre className="bg-[#1e1e2e] border border-surface-high rounded-xl p-4 text-xs font-mono text-blue-300 overflow-x-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
