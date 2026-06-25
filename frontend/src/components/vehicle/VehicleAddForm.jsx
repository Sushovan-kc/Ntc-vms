import React, { useState } from 'react';
import { Car, Calendar, Hash, CheckCircle, UserCheck } from 'lucide-react';
import adminservices from '../../api/services/adminservices'; // Adjust path to match your layout structure

const VehicleAddForm = ({ onAdditionSuccess }) => {
  // 1. Structural matching state instance initialized cleanly
  const [formData, setFormData] = useState({
    manufacturer: '',
    model: '',
    year: '',
    license_plate: '',
    approval_status: 'AVAILABLE', // Natively pre-fill default state
    current_driver: '' // Kept null explicitly on creation
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorFeedback, setErrorFeedback] = useState(null);
  const [successFeedback, setSuccessFeedback] = useState(false);

  // 2. Controlled form field state handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errorFeedback) setErrorFeedback(null);
  };

  // 3. Request submission pipeline
  const handleSubmitAction = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorFeedback(null);
    setSuccessFeedback(false);

    // Form payload transformation matching backend relational limits
    const operationalPayload = {
      manufacturer: formData.manufacturer.trim(),
      model: formData.model.trim(),
      year: formData.year ? parseInt(formData.year, 10) : null,
      license_plate: formData.license_plate.trim().toUpperCase(),
      approval_status: formData.approval_status || null,
      current_driver: null // Newly registered assets start unassigned
    };

    try {
      // Fire request over system pipeline network
      await adminservices.AddVehicle(operationalPayload);
      
      setSuccessFeedback(true);
      // Clear inputs
      setFormData({
        manufacturer: '',
        model: '',
        year: '',
        license_plate: '',
        approval_status: 'AVAILABLE',
        current_driver: ''
      });

      if (onAdditionSuccess) onAdditionSuccess();
    } catch (err) {
      console.error("Failed executing vehicle insertion query:", err);
      // Fallback check extracting nested error logs from backend if available
      setErrorFeedback(err.response?.data?.detail || "Rejected asset creation. Ensure all database constraint fields are verified.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-[10px] shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
      {/* Banner Ribbon Section Header */}
      <div className="bg-gradient-to-r from-ntc-blue to-blue-700 p-5 text-white">
        <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
          <Car size={20} className="opacity-90" />
          Vehicle Registration Form
        </h2>
        <p className="text-[11px] text-ntc-light-blue/80 font-medium mt-0.5">
          Enter vehicle details and register vehicle records in the system.
        </p>
      </div>

      <form onSubmit={handleSubmitAction} className="p-6 space-y-5">
        {/* Status Notification Banners */}
        {successFeedback && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-lg animate-fadeIn">
            Vehicle asset registered in the global fleet infrastructure registry successfully!
          </div>
        )}
        
        {errorFeedback && (
          <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold rounded-lg">
            Error: {errorFeedback}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Manufacturer Input Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-ntc-muted uppercase tracking-wider flex items-center gap-1">
              <Car size={12} className="text-ntc-blue" /> Manufacturer Name
            </label>
            <input
              type="text"
              name="manufacturer"
              required
              value={formData.manufacturer}
              onChange={handleInputChange}
              placeholder="e.g., Tesla, Isuzu, Scania"
              className="w-full bg-ntc-gray border border-gray-200 rounded-md px-3 py-2 text-xs font-bold text-ntc-dark focus:outline-none focus:border-ntc-blue transition-all placeholder:text-gray-300 placeholder:font-normal"
            />
          </div>

          {/* Model Name Input Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-ntc-muted uppercase tracking-wider flex items-center gap-1">
              <Car size={12} className="text-ntc-blue" /> Model Variant
            </label>
            <input
              type="text"
              name="model"
              required
              value={formData.model}
              onChange={handleInputChange}
              placeholder="e.g., Semi Truck, Cybertruck, Model X"
              className="w-full bg-ntc-gray border border-gray-200 rounded-md px-3 py-2 text-xs font-bold text-ntc-dark focus:outline-none focus:border-ntc-blue transition-all placeholder:text-gray-300 placeholder:font-normal"
            />
          </div>

          {/* Production Year Input Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-ntc-muted uppercase tracking-wider flex items-center gap-1">
              <Calendar size={12} className="text-ntc-blue" /> Production Year
            </label>
            <input
              type="number"
              name="year"
              min="1900"
              max={new Date().getFullYear() + 1}
              value={formData.year}
              onChange={handleInputChange}
              placeholder="e.g., 2024"
              className="w-full bg-ntc-gray border border-gray-200 rounded-md px-3 py-2 text-xs font-bold text-ntc-dark focus:outline-none focus:border-ntc-blue transition-all placeholder:text-gray-300 placeholder:font-normal"
            />
          </div>

          {/* License Plate Input Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-ntc-muted uppercase tracking-wider flex items-center gap-1">
              <Hash size={12} className="text-ntc-blue" /> License Plate Identifier
            </label>
            <input
              type="text"
              name="license_plate"
              required
              value={formData.license_plate}
              onChange={handleInputChange}
              placeholder="e.g., BA-3-PA-8824"
              className="w-full bg-ntc-gray border border-gray-200 rounded-md px-3 py-2 text-xs font-mono font-bold text-ntc-dark uppercase focus:outline-none focus:border-ntc-blue transition-all placeholder:text-gray-300 placeholder:font-sans placeholder:font-normal"
            />
          </div>
        </div>

        {/* Approval Dropdown Menu State Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-ntc-muted uppercase tracking-wider flex items-center gap-1">
            <CheckCircle size={12} className="text-ntc-blue" /> Operational Node Status
          </label>
          <select
            name="approval_status"
            value={formData.approval_status}
            onChange={handleInputChange}
            className="w-full bg-ntc-gray border border-gray-200 rounded-md px-3 py-2 text-xs font-bold text-ntc-dark focus:outline-none focus:border-ntc-blue transition-all"
          >
            <option value="AVAILABLE">🟢 AVAILABLE FOR OPERATIONS</option>
            <option value="MAINTENANCE">🟡 UNDERGOING MAINTENANCE INSPECTION</option>
            <option value="UNAVAILABLE">🔴 COMPROMISED / DECOMMISSIONED</option>
          </select>
        </div>

        {/* Fixed Driver Node Alert Box */}
        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg flex items-start gap-3">
          <UserCheck size={16} className="text-slate-500 mt-0.5" />
          <div>
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wide">Crew Allocation Initialization</h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              New vehicle registry instances initialize inside the **Unassigned Pool** by default. Crew assignment workflows can be handled via the dashboard after saving.
            </p>
          </div>
        </div>

        {/* Form Footer Action Submit Row Container */}
        <div className="pt-3 border-t border-gray-50 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto bg-slate-950 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider py-2.5 px-6 rounded-lg shadow-sm transition-colors duration-150 disabled:opacity-50 flex justify-center items-center gap-2 cursor-pointer"
          >
            {submitting ? "Committing Node Record..." : "💾 Register Asset Node"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleAddForm;
