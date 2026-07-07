import React from 'react';

const UniversalVehicleCard = ({
  title,
  subtitle,
  icon: Icon,
  badgeText,
  statusText,
  statusVariant = 'success', // 'success' | 'warning' | 'danger'
  metrics = [], 
  specs = [],   
  onActionClick, // Callback function handler for button clicks
  actionText = "Assign Operator", // Customizable action string button name
}) => {
  // Design system color mapping tokens
  const variants = {
    success: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
    danger: 'bg-rose-500/20 text-rose-200 border-rose-500/30'
  };

  const statusStyle = variants[statusVariant] || variants.success;

  return (
    <div className="w-full bg-white rounded-[10px] shadow-[0_4px_15px_rgba(0,0,0,0.05)] overflow-hidden border border-gray-100 flex flex-col justify-between h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)]">
      <div>
        {/* Accent Banner Row */}
        <div className="bg-gradient-to-r from-ntc-blue to-blue-700 p-5 text-white flex justify-between items-center">
          <div>
            {badgeText && (
              <span className="text-[10px] font-bold tracking-widest uppercase text-ntc-light-blue opacity-80 block mb-0.5">
                {badgeText}
              </span>
            )}
            <h2 className="text-lg font-black tracking-tight flex items-center gap-2 capitalize">
              {Icon && <Icon size={18} className="opacity-90" />}
              {title}
            </h2>
            {subtitle && <p className="text-[11px] text-ntc-light-blue/80 font-medium mt-0.5">{subtitle}</p>}
          </div>
          
          {statusText && (
            <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider shadow-sm ${statusStyle}`}>
              {statusText}
            </span>
          )}
        </div>

        {/* Highlight Metrics Bar */}
        {metrics.length > 0 && (
          <div className="bg-ntc-gray/50 border-b border-gray-100 px-5 py-3 flex justify-between gap-4">
            {metrics.map((metric, idx) => (
              <div key={idx} className="min-w-0">
                <span className="text-[9px] text-ntc-muted font-bold uppercase tracking-wider block">{metric.label}</span>
                <span className="text-xs font-black text-black truncate block mt-0.5">{metric.value || '—'}</span>
              </div>
            ))}
          </div>
        )}

        {/* Technical Specification Elements Grid */}
        <div className="p-5 grid grid-cols-1 gap-3">
          {specs.map((spec, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 w-full gap-4">
              <div className="flex items-center gap-2 text-ntc-muted text-[11px] font-bold uppercase tracking-wider shrink-0">
                {spec.icon && <spec.icon size={14} className="text-ntc-blue" />}
                <span>{spec.label}</span>
              </div>
              <div className="text-xs font-bold text-ntc-blue text-right flex justify-end items-center min-w-0">
                {spec.render ? spec.render(spec.value) : (spec.value || '—')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Button Row Footer */}
      {onActionClick && (
        <div className="p-5 pt-0">
          <button
            type="button"
            onClick={onActionClick}
            className="w-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-[11px] uppercase tracking-wider py-2 px-4 rounded-lg shadow-sm transition-colors duration-150 flex justify-center items-center gap-1.5"
          >
            👤 {actionText}
          </button>
        </div>
      )}
    </div>
  );
};

export default UniversalVehicleCard;
