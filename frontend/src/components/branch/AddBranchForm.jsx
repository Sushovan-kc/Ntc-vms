import React, { useState } from 'react';
import axios from 'axios';
import { useBranches } from '../../context/BranchContext';
import { parseBackendError } from '../utils/errorHandler'; 
import { PlusCircle, Loader2, MapPin, Building2, CheckCircle2, AlertCircle } from 'lucide-react';
import adminservices from '../../api/services/adminservices';

const AddBranchForm = () => {
  // Consume your existing context layer hooks
  const { setBranches } = useBranches();

  // Local Form state trackers
  const [formData, setFormData] = useState({ name: '', location: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: null, message: '' });

  // Native field input typing listener
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear notifications actively when users start adjusting their inputs again
    if (feedback.type) setFeedback({ type: null, message: '' });
  };

  // Submission Pipeline Interceptor
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Quick frontend safety sanity check
    if (!formData.name.trim() || !formData.location.trim()) {
      setFeedback({ type: 'error', message: 'All form fields are strictly mandatory.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: null, message: '' });
    const  payload = {
      name: formData.name.trim(),
      location: formData.location.trim(),
    }
    try {
      // Axios points cleanly through your Vite Docker Reverse Proxy setup
      const response = await adminservices.addBranch(payload);
      // Synchronize the fresh backend instance directly with the global table context state
      if (response.data && setBranches) {
        setBranches((prevBranches) => [...prevBranches, response.data]);
      }

      // Success layout refresh indicators
      setFeedback({ type: 'success', message: 'New Branch workspace successfully synchronized!' });
      setFormData({ name: '', location: '' }); // Flush input fields
      
    } catch (error) {
      console.error('Transaction context exception intercept:', error);
      
      // 🛠️ DRF PROPER ERROR HANDLER IN ACTION
      const cleanStringMessage = parseBackendError(error);
      
      setFeedback({ 
        type: 'error', 
        message: cleanStringMessage 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-[0_10px_30px_rgba(0,56,147,0.04)] border border-slate-100 overflow-hidden font-sans">
      {/* Module View Header Block */}
      <div className="px-6 py-4 bg-ntc-gray border-b border-slate-200 flex items-center gap-2.5">
        <div className="p-2 bg-ntc-light-blue text-ntc-blue rounded-lg">
          <PlusCircle size={20} />
        </div>
        <div>
          <h3 className="text-base font-black text-ntc-dark-text leading-tight">Add New Branch</h3>
          <p className="text-xs text-ntc-muted font-medium mt-0.5">Inject dynamic entries into Django core</p>
        </div>
      </div>

      {/* Primary Interaction Form Container */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        
        {/* Dynamic Alerts Banner */}
        {feedback.type && (
          <div className={`p-3.5 rounded-lg text-xs font-semibold flex items-start gap-2.5 border transition-all ${
            feedback.type === 'success' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
              : 'bg-rose-50 text-rose-700 border-rose-100'
          }`}>
            {feedback.type === 'success' ? (
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
            )}
            <span className="leading-relaxed">{feedback.message}</span>
          </div>
        )}

        {/* Form Field: Branch Title Identification */}
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-ntc-muted block">
            Branch Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Building2 size={16} />
            </div>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="e.g. Headquarters East"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-sm font-medium text-ntc-dark-text border border-slate-200 focus:border-ntc-blue rounded-lg outline-none transition-all placeholder:text-slate-400"
              required
            />
          </div>
        </div>

        {/* Form Field: Geospatial Coordinate Layout mapping */}
        <div className="space-y-1.5">
          <label htmlFor="location" className="text-xs font-bold uppercase tracking-wider text-ntc-muted block">
            Location Coordinate / City
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <MapPin size={16} />
            </div>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="e.g. New York, NY"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-sm font-medium text-ntc-dark-text border border-slate-200 focus:border-ntc-blue rounded-lg outline-none transition-all placeholder:text-slate-400"
              required
            />
          </div>
        </div>

        {/* Execution Submit Action Handler Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 bg-ntc-blue hover:bg-opacity-90 disabled:bg-slate-300 text-white font-bold text-sm py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed shadow-md shadow-blue-500/10"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Registering Record...</span>
            </>
          ) : (
            <>
              <PlusCircle size={16} />
              <span>Add New Branch</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AddBranchForm;
