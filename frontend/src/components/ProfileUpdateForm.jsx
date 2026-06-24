import React, { useState, useEffect } from 'react';

const ProfileUpdateCard = ({ 
  title = "Update Account Node", 
  subtitle = "Modify authorized registry parameters securely below.",
  icon: Icon, 
  initialData = {}, 
  fields = [], // Config array defining layout structure, field keys, and inputs
  onSave, 
  isSubmitting = false 
}) => {
  // Local form state manager holding active user modifications
  const [formData, setFormData] = useState({});

  // Sync incoming API hydration states cleanly with local form state
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Handle standard tracking updates on text typing intervals
  const handleInputChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData);
    }
  };

  return (
    <div className="bg-white p-6 rounded-[10px] shadow-[0_4px_15px_rgba(0,0,0,0.05)] transition-all duration-200 hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)] h-full flex flex-col justify-between">
      <form onSubmit={handleSubmit} className="flex flex-col h-full justify-between gap-6">
        <div>
          {/* Header Identity Block */}
          <div className="mb-4 pb-2 border-b border-gray-100 flex items-center gap-3">
            {Icon && (
              <div className="bg-ntc-light-blue p-2.5 rounded-lg text-ntc-blue shadow-sm shrink-0">
                <Icon size={22} />
              </div>
            )}
            <div>
              <h3 className="text-base font-black text-ntc-dark capitalize leading-tight">{title}</h3>
              {subtitle && <p className="text-ntc-muted text-[11px] font-semibold mt-0.5">{subtitle}</p>}
            </div>
          </div>

          {/* Dynamic Configuration Form Input Field Loop */}
          <div className="flex flex-col gap-4 mt-4">
            {fields.map((field) => {
              const isReadOnly = field.readOnly;
              const currentValue = formData[field.key] !== undefined ? formData[field.key] : '';

              return (
                <div key={field.key} className="flex flex-col gap-1.5 w-full">
                  <label className="text-ntc-muted text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                    {field.icon && <field.icon size={12} className="text-ntc-blue opacity-80" />}
                    {field.label}
                  </label>

                  {isReadOnly ? (
                    /* Read-Only Mode Block */
                    <div className="w-full bg-ntc-gray border border-gray-100 rounded-lg px-3 py-2 text-xs font-bold text-gray-400 font-mono select-none">
                      {currentValue || '—'}
                    </div>
                  ) : (
                    /* Editable Form Input Field Control */
                    <input
                      type={field.type || "text"}
                      value={currentValue}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                      disabled={isSubmitting}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-ntc-dark placeholder-gray-300 focus:outline-none focus:border-ntc-blue focus:ring-1 focus:ring-ntc-blue/20 transition-all font-sans disabled:opacity-60"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Execution Action Row Footer */}
        <div className="border-t border-gray-100 pt-4 mt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg shadow-sm transition-colors duration-150 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent inline-block" />
                Synchronizing Ledger...
              </>
            ) : (
              "Commit Profile Updates"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileUpdateCard;
