import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import driverServices from '../../api/services/driverservices';

const VehicleUpdateForm = ({ vehicle, onUpdateSuccess }) => {
  // 1. Resolve ID mapping to ensure we don't request 'undefined' routes
  const id = vehicle?.vehicle;

  // Initialize internal form states
  const [formData, setFormData] = useState({
    mileage: '',
    kilometers_driven: '',
    last_fuel_date: '',
    last_service_date: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});

  // Sync state values when API records load or change from the parent layer
  useEffect(() => {
    if (vehicle) {
      setFormData({
        mileage: vehicle.mileage !== null && vehicle.mileage !== undefined ? vehicle.mileage : '',
        kilometers_driven: vehicle.kilometers_driven !== null && vehicle.kilometers_driven !== undefined ? vehicle.kilometers_driven : '',
        last_fuel_date: vehicle.last_fuel_date || '',
        last_service_date: vehicle.last_service_date || '',
      });
    }
  }, [vehicle]);

  // Handle dynamic text input updates
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear validation warnings actively while typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Comprehensive Front-End Business Validation Engine
  const validateForm = () => {
    const localErrors = {};
    const today = new Date().toISOString().split('T')[0];

    // Odometer Mileage / Distance Integrity Check
    if (formData.kilometers_driven !== '') {
      const enteredKm = Number(formData.kilometers_driven);
      const existingKm = vehicle?.kilometers_driven ? Number(vehicle.kilometers_driven) : 0;
      
      if (enteredKm < 0) {
        localErrors.kilometers_driven = 'Odometer reading cannot be a negative value.';
      } else if (enteredKm < existingKm) {
        localErrors.kilometers_driven = `Odometer cannot be rolled back. Current minimum is ${existingKm} km.`;
      }
    } else if (vehicle?.kilometers_driven !== null && vehicle?.kilometers_driven !== undefined) {
      localErrors.kilometers_driven = 'Odometer history cannot be cleared out to a blank field.';
    }

    // Engine Fuel Economy Validation
    if (formData.mileage !== '') {
      const enteredMileage = Number(formData.mileage);
      if (enteredMileage <= 0) {
        localErrors.mileage = 'Fuel performance mileage must sit above zero.';
      } else if (enteredMileage > 150) {
        localErrors.mileage = 'Value exceeds standard vehicle operational boundaries.';
      }
    }

    // Historical Calendar Validation Bounds
    if (formData.last_fuel_date && formData.last_fuel_date > today) {
      localErrors.last_fuel_date = 'Fuel entry logs cannot be stamped in future horizons.';
    }

    if (formData.last_service_date) {
      if (formData.last_service_date > today) {
        localErrors.last_service_date = 'Technical workshop logs cannot be stamped in future horizons.';
      }
      if (vehicle?.last_service_date && formData.last_service_date < vehicle.last_service_date) {
        localErrors.last_service_date = 'New entries cannot date older than the current service record.';
      }
    }

    setErrors(localErrors);
    return Object.keys(localErrors).length === 0;
  };

  // Submit and Payload Dispatch Router
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Validate the input via our custom JS framework
    if (!validateForm()) {
      setMessage({
        type: 'error',
        text: 'Please resolve errors across the highlighted validation rows.',
      });
      return;
    }

    if (!id) {
      setMessage({
        type: 'error',
        text: 'Unable to sync changes: Missing valid vehicle reference identification.',
      });
      return;
    }

    setIsSubmitting(true);

    // Secure numeric parsing to block 'NaN' field submissions
    const parseNumericValue = (val) => {
      if (val === '' || val === null || val === undefined) return null;
      const parsed = Number(val);
      return isNaN(parsed) ? null : parsed;
    };

    const payload = {
      mileage: parseNumericValue(formData.mileage),
      kilometers_driven: parseNumericValue(formData.kilometers_driven),
      last_fuel_date: formData.last_fuel_date || null,
      last_service_date: formData.last_service_date || null,
    };

    try {
      const response = await driverServices.updateVehicletelemetrydata(id, payload);
      setMessage({ type: 'success', text: 'Operational logs successfully synced to server!' });
      if (onUpdateSuccess) {
        onUpdateSuccess(response);
      }
    } catch (error) {
      console.error("Backend validation mapping crash:", error);
      
      // Parse detailed database constraints directly into the view state
      let errorText = 'Database validation rules rejected your changes.';
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          errorText = Object.entries(error.response.data)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(' ') : msgs}`)
            .join(' | ');
        } else if (error.response.data.detail) {
          errorText = error.response.data.detail;
        }
      }
      setMessage({ type: 'error', text: errorText });
    } finally {
      setIsSubmitting(false);
    }
  };

  return(
    <div className="p-6 bg-white border-t border-gray-100 space-y-6"> 
  <div className="border-b border-gray-100 pb-4"> 
    <h3 className="text-lg font-bold text-gray-900">Update Operational Logs</h3> 
    <p className="text-xs text-gray-500 mt-1">Review parameters carefully. Blank fields clear metrics on the server profile.</p> 
  </div> 

  {/* Form utilizing noValidate constraint engine to unlock routing blocks */}
  <form onSubmit={handleSubmit} noValidate className="space-y-5"> 
    
    {/* Unchanging Core Identity Parameters Area */} 
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100"> 
      <div> 
        <label className="text-xs text-gray-500 font-bold block mb-1">Telemetry Record Tracking Identifier</label> 
        <input 
          type="text" 
          value={vehicle?.id || 'N/A'} 
          readOnly 
          className="w-full text-sm font-mono font-bold text-gray-500 bg-gray-200/60 border border-gray-300 px-3 py-2 rounded-lg cursor-not-allowed outline-none" 
        /> 
      </div> 
      <div> 
        <label className="text-xs text-gray-500 font-bold block mb-1">Engine Block Sub-System</label> 
        <input 
          type="text" 
          value={vehicle?.engine_type || 'PETROL'} 
          readOnly 
          className="w-full text-sm font-bold text-gray-500 bg-gray-200/60 border border-gray-300 px-3 py-2 rounded-lg cursor-not-allowed outline-none" 
        /> 
      </div> 
    </div> 

    {/* Dynamic Modifiable Workspace Metrics */} 
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> 
      <div> 
        <label htmlFor="mileage" className="text-xs text-gray-900 font-bold block mb-1">Current Logged Economy (mpg/kpl)</label> 
        <input 
          type="number" 
          id="mileage" 
          name="mileage" 
          value={formData.mileage} 
          onChange={handleChange} 
          placeholder="No active value" 
          step="0.1" 
          className={`w-full text-sm text-gray-900 bg-white border px-3 py-2 rounded-lg focus:outline-none focus:ring-1 ${ 
            errors.mileage ? 'border-rose-500 focus:ring-rose-500' : 'border-gray-300 focus:border-blue-600 focus:ring-blue-600' 
          }`} 
        /> 
        {errors.mileage && <p className="text-rose-500 text-[11px] font-medium mt-1">{errors.mileage}</p>} 
      </div> 

      <div> 
        <label htmlFor="kilometers_driven" className="text-xs text-gray-900 font-bold block mb-1">Current Odometer Value (km)</label> 
        <input 
          type="number" 
          id="kilometers_driven" 
          name="kilometers_driven" 
          value={formData.kilometers_driven} 
          onChange={handleChange} 
          placeholder={vehicle?.kilometers_driven ? `Current minimum: ${vehicle.kilometers_driven}` : "No active value"} 
          className={`w-full text-sm text-gray-900 bg-white border px-3 py-2 rounded-lg focus:outline-none focus:ring-1 ${ 
            errors.kilometers_driven ? 'border-rose-500 focus:ring-rose-500' : 'border-gray-300 focus:border-blue-600 focus:ring-blue-600' 
          }`} 
        /> 
        {errors.kilometers_driven && <p className="text-rose-500 text-[11px] font-medium mt-1">{errors.kilometers_driven}</p>} 
      </div> 

      <div> 
        <label htmlFor="last_fuel_date" className="text-xs text-gray-900 font-bold block mb-1">Last Fueling Registry Entry</label> 
        <input 
          type="date" 
          id="last_fuel_date" 
          name="last_fuel_date" 
          value={formData.last_fuel_date} 
          onChange={handleChange} 
          className={`w-full text-sm text-gray-900 bg-white border px-3 py-2 rounded-lg focus:outline-none focus:ring-1 ${ 
            errors.last_fuel_date ? 'border-rose-500 focus:ring-rose-500' : 'border-gray-300 focus:border-blue-600 focus:ring-blue-600' 
          }`} 
        /> 
        {errors.last_fuel_date && <p className="text-rose-500 text-[11px] font-medium mt-1">{errors.last_fuel_date}</p>} 
      </div> 

      {/* FIXED: Restored layout balance with clean labeling elements */}
      <div> 
        <label htmlFor="last_service_date" className="text-xs text-gray-900 font-bold block mb-1">Last Workshop Service Date</label>
        <input 
          type="date" 
          id="last_service_date" 
          name="last_service_date" 
          value={formData.last_service_date} 
          onChange={handleChange} 
          className={`w-full text-sm text-gray-900 bg-white border px-3 py-2 rounded-lg focus:outline-none focus:ring-1 ${ 
            errors.last_service_date ? 'border-rose-500 focus:ring-rose-500' : 'border-gray-300 focus:border-blue-600 focus:ring-blue-600' 
          }`} 
        /> 
        {errors.last_service_date && <p className="text-rose-500 text-[11px] font-medium mt-1">{errors.last_service_date}</p>} 
      </div> 
    </div> 

    {/* Global form tracking notification row */} 
    {message.text && ( 
      <div className={`p-3 rounded-lg text-xs font-semibold border ${ 
        message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200' 
      }`}> 
        {message.text} 
      </div> 
    )} 

    {/* FIXED: Repaired Tailwind class disabled selector syntax parameters */} 
    <div className="pt-2">
      <button 
        type="submit" 
        disabled={isSubmitting} 
        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all shadow-sm" 
      > 
        {isSubmitting ? "Updating Registry..." : "Save Configuration Logs"} 
      </button> 
    </div>
  </form> 
</div>


  )
}

export default VehicleUpdateForm;
