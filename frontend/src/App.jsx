import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import { ToastProvider } from './context/ToastContext';

// Lazy load pages for better performance
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const VendorList = React.lazy(() => import('./pages/VendorList'));
const VendorMetrics = React.lazy(() => import('./pages/VendorMetrics'));
const RoutingLogs = React.lazy(() => import('./pages/RoutingLogs'));
const Configuration = React.lazy(() => import('./pages/Configuration'));
const TestRequest = React.lazy(() => import('./pages/TestRequest'));
const HealthDashboard = React.lazy(() => import('./pages/HealthDashboard'));
const GlobalSettings = React.lazy(() => import('./pages/GlobalSettings'));

// Placeholder for unbuilt pages
const Placeholder = ({ title }) => (
  <div className="flex-1 p-8 flex items-center justify-center">
    <div className="text-center text-outline-default">
      <span className="material-symbols-rounded text-6xl mb-4">construction</span>
      <h2 className="text-xl font-medium text-surface-inverse mb-2">{title} Page</h2>
      <p>This page is currently being built.</p>
    </div>
  </div>
);

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <div className="flex h-screen w-screen bg-surface-low overflow-hidden font-sans">
        <Sidebar />
        
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar />
          
          <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8">
            <React.Suspense fallback={<div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/vendors" element={<VendorList />} />
                <Route path="/test" element={<TestRequest />} />
                <Route path="/metrics" element={<VendorMetrics />} />
                <Route path="/logs" element={<RoutingLogs />} />
                <Route path="/health" element={<HealthDashboard />} />
                <Route path="/config" element={<Configuration />} />
                <Route path="/settings" element={<GlobalSettings />} />
              </Routes>
            </React.Suspense>
          </main>
        </div>
      </div>
      </BrowserRouter>
    </ToastProvider>
  );
}
