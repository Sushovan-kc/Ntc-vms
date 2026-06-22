import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Car, Fuel, Calendar, MapPin, ClipboardText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; // 🟢 Adjusted relative path to your context root
import apiClient from '../../api/client'; // 🟢 Swapped raw fetch for your custom interceptor client

const MyRequests = () => {
  const { user } = useAuth();
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyRequests = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // 🟢 ALIGNED: Pulls directly from your server-filtered Django API endpoint
        const response = await apiClient.get('api/booking/mybookings/');
        setMyRequests(response.data);
      } catch (error) {
        console.error('❌ Error loading personal history stream:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyRequests();
  }, [user]);

  // Helper helper to generate semantic Tailwind layout status badges dynamically
  const getStatusBadgeClass = (status) => {
    const normalized = (status || '').toUpperCase();
    if (['APPROVED', 'APPROVED_TRIP', 'ON TRIP', 'IN_PROGRESS'].includes(normalized)) {
      return 'bg-ntc-success/10 text-ntc-success border border-ntc-success/20';
    }
    if (['REJECTED', 'CANCELLED', 'FAILED'].includes(normalized)) {
      return 'bg-ntc-danger/10 text-ntc-danger border border-ntc-danger/20';
    }
    return 'bg-amber-500/10 text-amber-600 border border-amber-500/20';
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-ntc-gray text-ntc-muted font-medium font-sans">
        Loading your booking history...
      </div>
    );
  }

  return (
    // 🟢 REMOVED BOOTSTRAP: Pure Tailwind layout shell matching your EmployeeDashboard design
    <div className="w-full min-h-screen p-6 md:p-8 bg-linear-to-br from-ntc-gray to-gray-200/50 font-sans">
      
      {/* Header Bar Area */}
      <div className="mb-8 border-b border-gray-200 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl md:text-3xl font-black bg-linear-to-r from-ntc-blue to-cyan-500 bg-clip-text text-transparent tracking-tight">
            My Vehicle Booking History
          </h3>
          <p className="text-ntc-muted text-sm mt-1">Monitor, filter, and track your active transport authorizations</p>
        </div>
        
        {/* Dynamic New Request Call To Action Anchor Link */}
        <Link 
          to="/dashboard/request-vehicle" 
          className="inline-flex items-center justify-center bg-ntc-blue text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-300 hover:bg-ntc-blue-hover hover:shadow-lg active:scale-98 select-none"
        >
          New Booking Request
        </Link>
      </div>

      {/* Main Container Card Component Box */}
      <div className="bg-white/95 backdrop-blur-md border border-white/50 rounded-2xl shadow-xs p-6">
        
        {myRequests.length === 0 ? (
          // Empty State Template Display Layout
          <div className="text-center py-16 flex flex-col items-center justify-center">
            <div className="p-4 bg-ntc-gray rounded-full text-ntc-muted mb-4">
              <Car size={40} />
            </div>
            <p className="text-ntc-dark-text font-semibold text-lg mb-1">No bookings found</p>
            <p className="text-ntc-muted text-sm mb-6 max-w-sm">You haven't submitted any transport allocation requests yet.</p>
            <Link 
              to="/dashboard/request-vehicle" 
              className="border border-ntc-blue text-ntc-blue font-semibold text-sm px-4 py-2 rounded-xl transition-all duration-200 hover:bg-ntc-light-blue/30"
            >
              Request Your First Vehicle
            </Link>
          </div>
        ) : (
          // Secure Responsive Data Table Canvas Grid
          <div className="w-full overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-ntc-gray border-b border-gray-200 text-ntc-dark-text font-bold text-xs uppercase tracking-wider">
                  <th className="p-4">Req ID</th>
                  <th className="p-4">Vehicle Data ID</th>
                  <th className="p-4">Route Parameters</th>
                  <th className="p-4">Scheduled Window</th>
                  <th className="p-4">Purpose Context</th>
                  <th className="p-4 text-center">Approval Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {myRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-ntc-gray/40 transition-colors duration-150">
                    
                    {/* Booking ID Parameter Column */}
                    <td className="p-4 font-bold text-ntc-dark-text">
                      #{req.id}
                    </td>
                    
                    {/* Vehicle Identity Assignment Key Column */}
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-ntc-dark-text font-medium text-xs rounded-md border border-gray-200">
                        <Fuel size={12} className="text-ntc-muted" />
                        Vehicle Ref: {req.vehicle || 'Auto Allocating'}
                      </span>
                    </td>
                    
                    {/* Source and Destination Travel Vectors Route Column */}
                    <td className="p-4">
                      <div className="flex flex-col gap-1 max-w-xs">
                        <div className="flex items-center gap-1 text-xs font-semibold text-ntc-dark-text">
                          <MapPin size={12} className="text-ntc-blue shrink-0" />
                          <span className="truncate">From: {req.start_location || 'Not Specified'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-ntc-muted">
                          <MapPin size={12} className="text-ntc-danger shrink-0" />
                          <span className="truncate">To: {req.end_location || 'Not Specified'}</span>
                        </div>
                      </div>
                    </td>
                    
                    {/* Calendar Timestamps Window Fields Column */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Calendar size={14} className="text-ntc-muted" />
                        <div className="flex flex-col">
                          <span>{req.start_time ? new Date(req.start_time).toLocaleString() : 'Pending Slot'}</span>
                          {req.end_time && (
                            <span className="text-gray-400 text-[0.7rem]">Until: {new Date(req.end_time).toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    {/* Travel Mission Objective / Notes Block Column */}
                    <td className="p-4">
                      <p className="max-w-[180px] text-xs text-ntc-muted truncate" title={req.purpose}>
                        {req.purpose || 'No description listed.'}
                      </p>
                    </td>
                    
                    {/* Server Validation State Status Badge Element Column */}
                    <td className="p-4 text-center">
                      <span className={`inline-flex px-3 py-1 font-bold text-xs uppercase tracking-wide rounded-full ${getStatusBadgeClass(req.status)}`}>
                        {req.status || 'PENDING'}
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRequests;
