import React, { useState } from 'react';
import { Shield, HelpCircle, Car, Calendar, Clock, Play, CheckCircle, ChevronDown, ChevronUp, Gauge, Fuel, Wrench, Send } from 'lucide-react';
import driverServices from '../../api/services/driverservices';

export default function DispatchCard({ item, onStatusUpdate }) {
  const [isMutating, setIsMutating] = useState(false);

  // --- Telemetry Drawer State ---
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [telemetryForm, setTelemetryForm] = useState({
    kilometers_driven: '',
    mileage: '',
    last_fuel_date: '',
    last_service_date: '',
  });
  const [telemetrySubmitting, setTelemetrySubmitting] = useState(false);
  const [telemetryFeedback, setTelemetryFeedback] = useState(null); // { type: 'success'|'error', message: string }

  // Formatting date string cleanly via built-in localization
  const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    const dateObj = new Date(isoString);
    
    const dateStr = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(dateObj);

    const timeStr = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(dateObj);

    return `${dateStr} • ${timeStr}`;
  };

const handleTripAction = async (newStatus) => {
  setIsMutating(true);
  try {
    let updatedData;
    if (typeof driverServices.updateDispatchStatus === 'function') {
      // Hits your backend patch endpoint: /api/driver/dispatch-status-update/9/
      updatedData = await driverServices.updateDispatchStatus(item.id, { dispatch_status: newStatus });
    } 

    if (onStatusUpdate) {
      // 🌟 FIX: Explicitly ensure dispatch_status is passed down to the parent state!
      // This protects your state tree even if your backend returns a plain message payload
      onStatusUpdate(item.id, { 
        ...item, 
        ...(updatedData && typeof updatedData === 'object' ? updatedData : {}),
        dispatch_status: newStatus 
      });
    }
  } catch (error) {
    console.error(`Failed to update dispatch status:`, error);
    alert(`Error updating trip status to ${newStatus}. Please try again.`);
  } finally {
    setIsMutating(false);
  }
};

  // Handler for telemetry form field changes
  const handleTelemetryChange = (e) => {
    const { name, value } = e.target;
    setTelemetryForm(prev => ({ ...prev, [name]: value }));
    setTelemetryFeedback(null); // Clear feedback on any edit
  };

  // Submit telemetry payload to backend
  const handleTelemetrySubmit = async (e) => {
    e.preventDefault();
    setTelemetrySubmitting(true);
    setTelemetryFeedback(null);

    // Strip out any empty fields before submitting
    const payload = Object.fromEntries(
      Object.entries(telemetryForm).filter(([, v]) => v !== '')
    );

    if (Object.keys(payload).length === 0) {
      setTelemetryFeedback({ type: 'error', message: 'Please fill in at least one field before submitting.' });
      setTelemetrySubmitting(false);
      return;
    }

    try {
      await driverServices.updateVehicleTelemetry(payload);
      setTelemetryFeedback({ type: 'success', message: 'Vehicle metrics updated successfully.' });
      setTelemetryForm({ kilometers_driven: '', mileage: '', last_fuel_date: '', last_service_date: '' });
    } catch (err) {
      const detail = err?.response?.data?.detail || 'Failed to submit. Please try again.';
      setTelemetryFeedback({ type: 'error', message: detail });
    } finally {
      setTelemetrySubmitting(false);
    }
  };

  // Logic flags to control conditional rendering and disabled states
  const isPending = item.dispatch_status === 'PENDING';
  const isInProgress = item.dispatch_status === 'IN_PROGRESS';
  const isCompleted = item.dispatch_status === 'COMPLETED';

  return (
    <div className="bg-white rounded-[10px] shadow-[0_4px_15px_rgba(0,0,0,0.05)] overflow-hidden border border-gray-100 transition-all duration-200 hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)]">
      
      {/* Banner Top Header */}
      <div className="bg-linear-to-r from-ntc-blue to-blue-800 px-6 py-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-ntc-light-blue uppercase block opacity-80">Line-haul Manifest Node</span>
          <h3 className="text-lg font-black tracking-wide">DISPATCH #00{item.id}</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide border ${
            isInProgress
              ? 'bg-blue-500/20 text-blue-200 border-blue-500/30'
              : isCompleted
              ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30'
              : 'bg-amber-500/20 text-amber-200 border-amber-500/30'
          }`}>
            Dispatch: {item.dispatch_status}
          </span>
        </div>
      </div>

      {/* Core Metrics Content Panel Section */}
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Booking Requestor details */}
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-ntc-light-blue text-ntc-blue mt-0.5">
              <Shield size={18} />
            </div>
            <div>
              <span className="text-xs text-ntc-muted font-bold block uppercase tracking-wider">Assigned Task Custodian</span>
              <span className="text-sm font-bold text-ntc-dark block mt-0.5">{item.booking_user}</span>
              <span className="text-xs text-ntc-muted font-medium mt-1 flex items-center gap-1">
                <HelpCircle size={12} /> Purpose: {item.booking_purpose || 'Standard Operational Assignment'}
              </span>
            </div>
          </div>

          {/* Fleet Asset Details Section */}
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-ntc-light-blue text-ntc-blue mt-0.5">
              <Car size={18} />
            </div>
            <div>
              <span className="text-xs text-ntc-muted font-bold block uppercase tracking-wider">Allocated Fleet Machine</span>
              <span className="text-sm font-bold text-ntc-dark block mt-0.5">{item.vehicle_manufacturer} {item.vehicle_model}</span>
              <span className="inline-block mt-1.5 font-mono text-xs font-black text-ntc-dark bg-ntc-gray border px-2 py-0.5 rounded shadow-sm tracking-wider">
                {item.vehicle_license_plate}
              </span>
            </div>
          </div>
        </div>

        {/* Operational Timeframe Schedule Block Section */}
        <div className="border-t border-gray-100 pt-4 bg-ntc-gray/50 rounded-xl p-4 border border-dashed grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg text-ntc-blue shadow-sm border border-gray-100">
              <Calendar size={16} />
            </div>
            <div>
              <span className="text-[10px] text-ntc-muted font-bold uppercase tracking-wider">Deployment Start Time</span>
              <span className="text-xs font-mono font-bold text-ntc-dark block mt-0.5">{formatDateTime(item.booking_start_time)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg text-ntc-danger shadow-sm border border-gray-100">
              <Clock size={16} />
            </div>
            <div>
              <span className="text-[10px] text-ntc-muted font-bold uppercase tracking-wider">Expected Completion</span>
              <span className="text-xs font-mono font-bold text-ntc-dark block mt-0.5">{formatDateTime(item.booking_end_time)}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Action Buttons Section */}
        {!isCompleted && (
          <div className="border-t border-gray-100 pt-4 flex justify-end gap-3">
            {isPending && (
              <button
                onClick={() => handleTripAction('IN_PROGRESS')}
                disabled={isMutating}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded shadow transition-all duration-150 cursor-pointer disabled:cursor-not-allowed"
              >
                <Play size={14} /> {isMutating ? 'Processing...' : 'Start Trip'}
              </button>
            )}

            {isInProgress && (
              <button
                onClick={() => handleTripAction('COMPLETED')}
                disabled={isMutating}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded shadow transition-all duration-150 cursor-pointer disabled:cursor-not-allowed"
              >
                <CheckCircle size={14} /> {isMutating ? 'Completing...' : 'End Trip'}
              </button>
            )}
          </div>
        )}

        {/* ── Telemetry Drawer Toggle ── */}
        {!isCompleted && (
          <div className="border-t border-gray-100 pt-2">
            <button
              onClick={() => { setIsDrawerOpen(prev => !prev); setTelemetryFeedback(null); }}
              className="flex items-center gap-2 text-xs font-bold text-ntc-blue hover:text-blue-800 uppercase tracking-wider transition-colors cursor-pointer py-1"
            >
              <Gauge size={14} />
              Log Vehicle Telemetry
              {isDrawerOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>

            {/* Collapsible Drawer Body */}
            {isDrawerOpen && (
              <form
                onSubmit={handleTelemetrySubmit}
                className="mt-3 bg-ntc-gray/60 border border-dashed border-gray-200 rounded-xl p-4 space-y-4"
              >
                <p className="text-[10px] text-ntc-muted font-bold uppercase tracking-widest">Operational Asset Metrics Update</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Odometer */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-ntc-muted uppercase tracking-wider flex items-center gap-1">
                      <Gauge size={11} /> Odometer Reading (km)
                    </label>
                    <input
                      type="number"
                      name="kilometers_driven"
                      value={telemetryForm.kilometers_driven}
                      onChange={handleTelemetryChange}
                      placeholder="e.g. 24500"
                      min="0"
                      className="w-full text-xs font-mono font-bold text-ntc-dark bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ntc-blue/30 focus:border-ntc-blue transition-all placeholder:text-gray-300"
                    />
                  </div>

                  {/* Fuel Mileage */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-ntc-muted uppercase tracking-wider flex items-center gap-1">
                      <Fuel size={11} /> Fuel Mileage (km/l)
                    </label>
                    <input
                      type="number"
                      name="mileage"
                      value={telemetryForm.mileage}
                      onChange={handleTelemetryChange}
                      placeholder="e.g. 14"
                      min="0"
                      className="w-full text-xs font-mono font-bold text-ntc-dark bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ntc-blue/30 focus:border-ntc-blue transition-all placeholder:text-gray-300"
                    />
                  </div>

                  {/* Last Fuel Date */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-ntc-muted uppercase tracking-wider flex items-center gap-1">
                      <Fuel size={11} /> Last Fuel Date
                    </label>
                    <input
                      type="date"
                      name="last_fuel_date"
                      value={telemetryForm.last_fuel_date}
                      onChange={handleTelemetryChange}
                      className="w-full text-xs font-mono font-bold text-ntc-dark bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ntc-blue/30 focus:border-ntc-blue transition-all"
                    />
                  </div>

                  {/* Last Service Date */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-ntc-muted uppercase tracking-wider flex items-center gap-1">
                      <Wrench size={11} /> Last Service Date
                    </label>
                    <input
                      type="date"
                      name="last_service_date"
                      value={telemetryForm.last_service_date}
                      onChange={handleTelemetryChange}
                      className="w-full text-xs font-mono font-bold text-ntc-dark bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ntc-blue/30 focus:border-ntc-blue transition-all"
                    />
                  </div>
                </div>

                {/* Feedback Line */}
                {telemetryFeedback && (
                  <p className={`text-xs font-bold ${telemetryFeedback.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {telemetryFeedback.type === 'success' ? '✓ ' : '✗ '}{telemetryFeedback.message}
                  </p>
                )}

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={telemetrySubmitting}
                    className="flex items-center gap-2 bg-ntc-blue hover:bg-blue-800 disabled:bg-blue-300 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded shadow transition-all duration-150 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Send size={13} />
                    {telemetrySubmitting ? 'Submitting...' : 'Submit Metrics'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
