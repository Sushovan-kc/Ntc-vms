import React, { useState } from 'react';
import { Shield, HelpCircle, Car, Calendar, Clock, Play, CheckCircle } from 'lucide-react';
import driverServices from '../../api/services/driverservices';

export default function DispatchCard({ item, onStatusUpdate }) {
  const [isMutating, setIsMutating] = useState(false);

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
        updatedData = await driverServices.updateDispatchStatus(item.id, { dispatch_status: newStatus });
      } 

      if (onStatusUpdate) {
        onStatusUpdate(item.id, updatedData || { ...item, dispatch_status: newStatus });
      }
    } catch (error) {
      console.error(`Failed to update dispatch status:`, error);
      alert(`Error updating trip status to ${newStatus}. Please try again.`);
    } finally {
      setIsMutating(false);
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

      </div>
    </div>
  );
}
