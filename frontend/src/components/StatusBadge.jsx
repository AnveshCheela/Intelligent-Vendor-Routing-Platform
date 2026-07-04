import React from 'react';

export default function StatusBadge({ status }) {
  const statusConfig = {
    healthy: { class: 'badge-healthy', icon: 'check_circle' },
    degraded: { class: 'badge-degraded', icon: 'warning' },
    down: { class: 'badge-down', icon: 'error' }
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig.down;

  return (
    <span className={`badge ${config.class}`}>
      <span className="material-symbols-rounded text-[14px]">{config.icon}</span>
      <span className="capitalize">{status}</span>
    </span>
  );
}
