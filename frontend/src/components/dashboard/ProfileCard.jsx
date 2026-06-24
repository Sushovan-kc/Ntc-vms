import React from 'react';

const ProfileCard = ({ 
  title, 
  icon: Icon, 
  badgeText,
  statusLabel, 
  statusText, 
  statusVariant = 'success', 
  fields = [] 
}) => {
  const variants = {
    success: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    warning: { badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' }
  };

  const style = variants[statusVariant] || variants.success;

  return (

    <div className="bg-white p-6 rounded-[10px] shadow-[0_4px_15px_rgba(0,0,0,0.05)] h-full flex flex-col justify-between">
      
      <div>
        <div className="text-center mb-6">
          <div className="bg-blue-50 rounded-full inline-flex p-4 mb-3 relative text-blue-600">
            {Icon && <Icon size={48} />}
            {statusText && <span className={`absolute top-0 right-0 -translate-y-0.5 translate-x-0.5 p-2 border-2 border-white rounded-full w-4 h-4 ${style.dot}`} />}
          </div>
          {/* 💡 FIX: Force displaying title explicitly if it is passed down correctly */}
          <h4 className="text-xl font-black text-slate-800 mb-1">{title || 'N/A'}</h4>
          {badgeText && (
            <span className="text-gray-500 font-mono bg-gray-50 px-3 py-0.5 rounded-full border text-xs font-semibold">
              {badgeText}
            </span>
          )}
        </div>

        {statusText && (
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-6 border border-gray-100">
            <span className="text-gray-500 text-sm font-bold">{statusLabel}</span>
            <span className={`inline-block px-3 py-1 rounded-[20px] text-xs font-black border uppercase ${style.badge}`}>
              {statusText}
            </span>
          </div>
        )}

        <div className="border-t border-gray-100 pt-4 flex flex-col gap-4">
          {fields.map((field, idx) => (
            <div key={idx} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0 w-full gap-4">
              <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wider shrink-0">
                {field.icon && <field.icon size={14} className="text-blue-600" />}
                <span>{field.label}</span>
              </div>
              {/* 💡 shrink-0 stops your license plate span from shrinking down to a 0-pixel box */}
              <div className="text-sm font-bold text-slate-800 text-right flex justify-end items-center shrink-0 min-w-0">
                {field.render ? field.render(field.value) : (field.value || '—')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
