import React from 'react';
import { FileText, Lock, ShieldCheck, MapPin, Building2, ExternalLink } from 'lucide-react';

const DocumentVault = ({ driverDetails, isLocked = true }) => {
  // Graceful fallback destructuring directly matching your verified backend payload
  const {
    license_number = '—',
    license_image = null,
    address = '—',
    branch_name = 'Unassigned Branch'
  } = driverDetails || {};

  return (
    <div className="bg-white p-[30px] rounded-[10px] shadow-[0_4px_15px_rgba(0,0,0,0.05)] space-y-6">
      
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-b-gray-100">
        <div>
          <h4 className="text-lg font-bold text-ntc-dark mb-1 flex items-center gap-2">
            <FileText size={22} className="text-ntc-blue" /> Secure Verification Vault
          </h4>
          <p className="text-ntc-muted text-xs font-medium">
            Archived mandatory commercial transit license documentation materials.
          </p>
        </div>
        <span className="inline-flex items-center text-xs font-black bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
          <Lock size={14} className="mr-1.5 text-slate-500" /> Record Locked
        </span>
      </div>

      {/* 2. Structured Operational Metadata Details Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* License Field Card */}
        <div className="p-3.5 bg-slate-50 border border-gray-100 rounded-lg flex items-start gap-3">
          <ShieldCheck className="text-emerald-500 mt-0.5" size={18} />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">License Registry Number</span>
            <span className="text-sm font-bold font-mono text-slate-800 mt-0.5">{license_number}</span>
          </div>
        </div>

        {/* Branch Field Card */}
        <div className="p-3.5 bg-slate-50 border border-gray-100 rounded-lg flex items-start gap-3">
          <Building2 className="text-ntc-blue mt-0.5" size={18} />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Assigned Operations Branch</span>
            <span className="text-sm font-semibold text-slate-800 mt-0.5">{branch_name}</span>
          </div>
        </div>

        {/* Address Field Card Span Full */}
        <div className="p-3.5 bg-slate-50 border border-gray-100 rounded-lg flex items-start gap-3 md:col-span-2">
          <MapPin className="text-slate-400 mt-0.5" size={18} />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Registered Base Address</span>
            <span className="text-sm font-medium text-slate-700 mt-0.5 capitalize">{address}</span>
          </div>
        </div>

      </div>

      {/* 3. Document Payload & Inspection Viewport */}
      {license_image && (
        <div className="space-y-3 pt-2">
          <div className="p-3 bg-ntc-gray rounded-lg border border-gray-100 flex items-center justify-between text-xs">
            <span className="text-ntc-dark font-bold text-xs">Active Operating Document Payload:</span>
            <a 
              href={license_image} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-ntc-blue hover:underline font-black flex items-center gap-1"
            >
              Inspect Direct Source <ExternalLink size={12} />
            </a>
          </div>

          {/* Embedded Secure Image View Frame */}
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-slate-50 flex flex-col items-center justify-center p-4 min-h-[220px]">
            <img 
              src={license_image} 
              alt="Official Driver Document Asset" 
              className="max-h-64 w-auto object-contain rounded-md shadow-sm border border-gray-100"
              onError={(e) => {
                // If local configurations block the absolute cross-origin lookup, fall back instantly to avoid broken tags
                e.target.style.display = 'none';
                console.error("Local network path mapping error encountered on resource loading link.");
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentVault;
