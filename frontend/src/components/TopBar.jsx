import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export default function TopBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      
      // Basic smart routing
      if (query.startsWith('req_')) {
        navigate(`/logs?search=${query}`);
        addToast(`Searching logs for ${query}`, 'info');
      } else if (['priority', 'weight', 'latency', 'cost', 'ai', 'strategy', 'rule'].some(k => query.includes(k))) {
        navigate('/configuration');
        addToast('Navigated to Configuration', 'info');
      } else {
        navigate(`/vendors`);
        addToast(`Searching vendors for "${query}"`, 'info');
      }
      setSearchQuery('');
    }
  };


  const handleProfileClick = (action) => {
    setShowDropdown(false);
    addToast(`${action} functionality is not required for this assignment`, 'info');
  };

  return (
    <header className="h-16 bg-surface-lowest border-b border-outline-variant/30 flex items-center justify-between px-8 shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-96">
          <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-outline-default text-xl">search</span>
          <input 
            type="text" 
            placeholder="Search request ID, vendor, or rule... (Press Enter)" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full bg-surface-low border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-shadow"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 hover:bg-surface-low p-1 pr-3 rounded-full transition-colors"
          >
            <img 
              src="https://ui-avatars.com/api/?name=Admin+User&background=3525cd&color=fff" 
              alt="User avatar" 
              className="w-8 h-8 rounded-full"
            />
            <div className="text-left hidden sm:block">
              <div className="text-sm font-medium leading-none text-surface-inverse mb-1">Admin</div>
              <div className="text-xs text-outline-default leading-none">System Ops</div>
            </div>
            <span className="material-symbols-rounded text-outline-default text-sm">expand_more</span>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-surface border border-surface-high rounded-xl shadow-lg py-1 z-50">
              <button onClick={() => handleProfileClick('Profile Settings')} className="w-full text-left px-4 py-2 text-sm text-surface-inverse hover:bg-surface-low transition-colors">
                Profile Settings
              </button>
              <button onClick={() => handleProfileClick('Manage Users')} className="w-full text-left px-4 py-2 text-sm text-surface-inverse hover:bg-surface-low transition-colors">
                Manage Users
              </button>
              <div className="h-px bg-surface-high my-1"></div>
              <button onClick={() => handleProfileClick('Logout')} className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error-container/10 transition-colors">
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
