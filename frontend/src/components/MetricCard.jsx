import React from 'react';

export default function MetricCard({ title, value, change, trend, suffix }) {
  const isUp = trend === 'up';
  const isNeutral = trend === 'neutral';
  
  return (
    <div className="card p-5">
      <h3 className="text-sm font-medium text-surface-inverse/70 mb-2">{title}</h3>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-bold text-surface-inverse">
          {value}
          {suffix && <span className="text-lg font-medium text-outline-default ml-1">{suffix}</span>}
        </div>
        
        {change && (
          <div className={`flex items-center text-sm font-medium ${
            isUp ? 'text-error' : isNeutral ? 'text-outline-default' : 'text-emerald-600'
          }`}>
            {!isNeutral && (
              <span className="material-symbols-rounded text-lg leading-none mr-1">
                {isUp ? 'trending_up' : 'trending_down'}
              </span>
            )}
            {change}
          </div>
        )}
      </div>
    </div>
  );
}
