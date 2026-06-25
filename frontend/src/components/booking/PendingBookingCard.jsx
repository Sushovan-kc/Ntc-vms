import React, { useState, useEffect } from 'react';
import { Calendar, User, CheckCircle, XCircle, AlertCircle, Car } from 'lucide-react';
import  bookingServices  from '../../api/services/bookingservices';

const PendingBookingCard = ({ booking, onUpdateSuccess }) => {
  const [status, setStatus] = useState(booking.status || 'pending');
  const [selectedVehicle, setSelectedVehicle] = useState(booking.assigned_vehicle || '');
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch available vehicles using the booking's time window
  const fetchAvailableVehicles = async () => {
  // 1. Keep the check to prevent repeated network hits
  if (vehicles.length > 0) return; 
  
  setLoadingVehicles(true);
  try {
    const rawStart = booking.start_time || '2026-06-22T14:46:00+05:45';
    const rawEnd = booking.end_time || '2026-06-22T14:49:00+05:45';
    
    // 2. Explicitly URL encode the strings to transform '+' into '%2B'
    const startTime = encodeURIComponent(rawStart);
    const endTime = encodeURIComponent(rawEnd);
    
    const [response] = await Promise.allSettled([
      bookingServices.getAvailableVehicles(startTime, endTime)
    ]);

    // 3. Destructure the fulfilled promise using .value
    if (response.status === 'fulfilled') {
      // response.value represents the resolved Axios/Fetch HTTP object
      setVehicles(response.value || []); 
    } else {
      console.error("Vehicle service rejected:", response.reason);
    }
  } catch (error) {
    console.error("Error fetching available vehicles:", error);
  } finally {
    // 4. Reset loading state safely
    setLoadingVehicles(false);
  }
};
  const handleUpdate = async () => {
    setSubmitting(true);
    try {
      const payload = {
        id: booking.id,
        status: status,
        approved_by: booking.approved_by,
        vehicle: booking.vehicle,
        assigned_vehicle: selectedVehicle ? parseInt(selectedVehicle) : null,
        assigned_driver: booking.assigned_driver // Stays null or handles on backend
      };

      const [response] = await Promise.allSettled([
        bookingServices.approvalStatusUpdate(booking.id, payload)
      ]);

      if (response.status === 'fulfilled') {
        // Trigger parent state re-fetch to clean up the UI
        onUpdateSuccess();
      } else {
        alert("Failed to update booking status.");
      }
    } catch (error) {
      console.error("Error updating booking:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col justify-between space-y-4 transition-all hover:shadow-md">
      {/* Card Header */}
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-bold text-ntc-blue uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-full">
            Booking ID: #{booking.id}
          </span>
          <h3 className="text-lg font-bold text-ntc-dark mt-2 flex items-center gap-1.5">
            <Car size={18} className="text-gray-400 text-sm" />
            Booked By: {booking.user}
          </h3>
        </div>
        <span className="flex items-center gap-1 text-sm font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
          <AlertCircle size={14} />
          Pending Review
        </span>
      </div>

      {/* Booking Meta Details */}
      <div className="text-sm text-gray-500 space-y-1">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-gray-400" />
          <span>Window: {booking.start_time ? new Date(booking.start_time).toLocaleString() : 'N/A'}</span>
        </div>
      </div>

      {/* Form Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {/* Status Dropdown */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
            Set Action
          </label>
          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
            className="w-full text-sm rounded-lg border border-gray-300 bg-gray-50 p-2.5 font-medium text-ntc-dark focus:border-ntc-blue focus:ring-1 focus:ring-ntc-blue outline-none"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Assigned Vehicle Dropdown */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
            Assign Vehicle
          </label>
          <select 
            value={selectedVehicle} 
            onFocus={fetchAvailableVehicles}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="w-full text-sm rounded-lg border border-gray-300 bg-gray-50 p-2.5 font-medium text-ntc-dark focus:border-ntc-blue focus:ring-1 focus:ring-ntc-blue outline-none"
          >
            <option value="">-- Choose Car --</option>
            {loadingVehicles && <option disabled>Loading system assets...</option>}
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.manufacturer} {v.model} ({v.license_plate})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submit Action Button */}
      <button
        onClick={handleUpdate}
        disabled={submitting}
        className="w-full bg-ntc-blue text-white text-sm font-bold py-2.5 px-4 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
      >
        {submitting ? 'Processing...' : 'Submit'}
      </button>
    </div>
  );
};

export default PendingBookingCard;
