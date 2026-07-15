import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, MapPin, Building2, Activity, Save, X } from 'lucide-react';

const AdminEditDriverForm = ({ driverData, branches = [], onSave, onCancel, isSaving = false }) => {
  // Localized form payload tracking dictionary
  const [formData, setFormData] = useState({
    license_number: '',
    address: '',
    driver_status: 'AVAILABLE',
    branch: '',
    license_image: null
  });

  // Hydrate current record properties into editing scopes upon selection changes
  useEffect(() => {
    if (driverData) {
      setFormData({
        license_number: driverData.license_number || '',
        address: driverData.address || '',
        driver_status: driverData.driver_status || 'AVAILABLE',
        branch: driverData.branch_id || driverData.branch || '',
        license_image: null // Keeps current server file asset untouched unless altered manually
      });
    }
  }, [driverData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => ({ ...prev, license_image: e.target.files[0] }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Construct raw multi-part payloads for cross-origin binary file delivery channels
    const packedPayload = new FormData();
    packedPayload.append('license_number', formData.license_number);
    packedPayload.append('address', formData.address);
    packedPayload.append('driver_status', formData.driver_status);
    
    // Fallback assignment strings for unlinked regional logistics branches
    if (formData.branch) {
      packedPayload.append('branch', formData.branch);
    }

    // Only serialize new image payloads if explicitly selected
    if (formData.license_image) {
      packedPayload.append('license_image', formData.license_image);
    }

    // Direct invocation up to master context handler alongside target operational identifier
    onSave(driverData.id, packedPayload);
  };

  return (
    <div className="w-full bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-xl mx-auto space-y-6">
      
      {/* 1. Header Frame */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg text-ntc-blue">
            <User size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-ntc-dark">Modify Driver Registry Profile</h3>
            <p className="text-xs text-gray-500">Target Record Assignment Instance ID: #{driverData?.id}</p>
          </div>
        </div>
        <button 
          onClick={onCancel}
          className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 transition-colors duration-200"
        >
          <X size={18} />
        </button>
      </div>

      {/* 2. Core Editing Inputs Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Field: License Number */}
        <div>
          <label className="text-sm font-semibold text-ntc-dark flex items-center gap-2 mb-1.5">
            <ShieldCheck size={16} className="text-gray-400" /> Driver License Number
          </label>
          <input
            type="text"
            name="license_number"
            value={formData.license_number}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-ntc-blue focus:ring-1 focus:ring-ntc-blue text-sm font-mono"
          />
        </div>

        {/* Field: Base Core Address */}
        <div>
          <label className="text-sm font-semibold text-ntc-dark flex items-center gap-2 mb-1.5">
            <MapPin size={16} className="text-gray-400" /> Operational Base Address
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-ntc-blue focus:ring-1 focus:ring-ntc-blue text-sm"
          />
        </div>

        {/* Dual Configurations Dropdowns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Field: Driver Logistics Tracking Status Selector */}
          <div>
            <label className="text-sm font-semibold text-ntc-dark flex items-center gap-2 mb-1.5">
              <Activity size={16} className="text-gray-400" /> Driver Status Mode
            </label>
            <select
              name="driver_status"
              value={formData.driver_status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-200 bg-white rounded-md focus:outline-none focus:border-ntc-blue text-sm font-bold text-slate-700"
            >
              <option value="AVAILABLE">AVAILABLE (In Hub Pool)</option>
              <option value="ON TRIP">ON TRIP (Active Allocation)</option>
              <option value="UNAVAILABLE">UNAVAILABLE (Off-Duty/Leave)</option>
            </select>
          </div>

          {/* Field: Fleet Operations Regional Branch Selector */}
          <div>
            <label className="text-sm font-semibold text-ntc-dark flex items-center gap-2 mb-1.5">
              <Building2 size={16} className="text-gray-400" /> Assigned Logistics Branch
            </label>
            <select
              name="branch"
              value={formData.branch}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-200 bg-white rounded-md focus:outline-none focus:border-ntc-blue text-sm font-medium text-slate-700"
            >
              <option value="">Unassigned Pool / Floating</option>
              {branches.map(branchItem => (
                <option key={branchItem.id} value={branchItem.id}>
                  {branchItem.name}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Field: Document File Payload Update */}
        <div className="pt-2">
          <label className="text-sm font-semibold text-ntc-dark block mb-1.5">
            Replace Operating License Image Document <span className="text-xs font-normal text-gray-400">(Optional)</span>
          </label>
          
          {/* Show a micro badge indicating if there's a file on-record right now */}
          {driverData?.license_image && !formData.license_image && (
            <div className="mb-2 p-2 bg-slate-50 border border-gray-100 rounded text-xs text-gray-500 font-medium">
              ℹ️ Current asset is stored safely. Selecting a new file overrides it permanently.
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-ntc-light-blue file:text-ntc-blue hover:file:bg-opacity-80 px-3 py-2 border border-gray-200 rounded-md focus:outline-none"
          />
        </div>

        {/* Action Controls Section */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="px-4 py-2 border border-gray-200 text-gray-600 rounded-md text-xs font-bold hover:bg-gray-50 transition-colors duration-150 disabled:opacity-50"
          >
            Cancel Alteration
          </button>
          
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-ntc-blue text-white rounded-md text-xs font-bold hover:bg-opacity-90 flex items-center gap-1.5 transition-colors duration-150 shadow-sm disabled:opacity-50"
          >
            <Save size={14} />
            {isSaving ? "Synchronizing Storage..." : "Save Modifications"}
          </button>
        </div>

      </form>
    </div>
  );
};

export default AdminEditDriverForm;
