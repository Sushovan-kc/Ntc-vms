import React from 'react';
import { FileText, CheckCircle } from 'lucide-react';

const DocumentVault = ({ licenseImage, uploading, fileInputRef, onFileUpload }) => {
  return (
    <div className="bg-white p-[30px] rounded-[10px] shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-b-gray-100">
        <div>
          <h4 className="text-lg font-bold text-ntc-dark mb-1 flex items-center gap-2">
            <FileText size={22} className="text-ntc-blue" /> Secure Verification Vault
          </h4>
          <p className="text-ntc-muted text-xs font-medium">Upload, process, and inspect mandatory commercial transit license documentation materials.</p>
        </div>
        {licenseImage && (
          <span className="inline-flex items-center text-xs font-black bg-emerald-50 text-ntc-success border border-emerald-200 px-3 py-1.5 rounded-full shadow-sm">
            <CheckCircle size={14} className="mr-1.5" /> Verified Profile
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-ntc-dark mb-2">
            Upload Professional Operating License (PDF, PNG, JPG)
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="file" 
              ref={fileInputRef}
              className="w-full text-sm text-ntc-dark file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-ntc-light-blue file:text-ntc-blue hover:file:bg-opacity-80 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-ntc-blue"
            />
            <button 
              onClick={onFileUpload}
              disabled={uploading}
              className="bg-ntc-blue hover:bg-ntc-blue-hover disabled:bg-opacity-50 text-white font-bold text-xs py-2.5 px-5 rounded-md transition-colors duration-200 whitespace-nowrap cursor-pointer shadow-sm"
            >
              {uploading ? 'Processing File Stream...' : 'Upload Document'}
            </button>
          </div>
        </div>

        {licenseImage && (
          <div className="mt-4 p-3 bg-ntc-gray rounded-lg border border-gray-100 flex items-center justify-between text-xs">
            <span className="text-ntc-dark font-semibold">Active Registered Target Link:</span>
            <a 
              href={licenseImage} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-ntc-blue hover:underline font-black flex items-center gap-1"
            >
              Inspect Payload ↗
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentVault;
