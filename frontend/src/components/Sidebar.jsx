import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';

const navItems = [
  { name: 'Dashboard', path: '/', icon: 'dashboard' },
  { name: 'Vendors', path: '/vendors', icon: 'storefront' },
  { name: 'Routing Logs', path: '/logs', icon: 'list_alt' },
  { name: 'Configuration', path: '/config', icon: 'tune' },
  { name: 'Test Request', path: '/test', icon: 'science' },
];

export default function Sidebar() {
  return (
    <aside className="w-[264px] bg-surface-inverse text-surface-low h-full flex flex-col shrink-0">
      <Link to="/" className="h-16 flex items-center px-6 border-b border-white/10 shrink-0 hover:bg-white/5 transition-colors cursor-pointer">
        <div className="flex items-center gap-2 text-primary-container font-bold text-xl tracking-tight">
          <span className="material-symbols-rounded filled text-2xl">route</span>
          VendorRoute
        </div>
      </Link>
      


      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <span className="material-symbols-rounded">{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
