import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car, MapPin, Calendar, LayoutDashboard, History, ClipboardList } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';

// Shared Presentation Layout Layers
import Sidebar from '../../components/Sidebar';
import Header from '../../components/dashboard/Header';

// 🟢 NAVIGATION CONFIGURATION: Placed outside component block to stop infinite rendering loops
const EMPLOYEE_NAVIGATION_OPTIONS = [
  { label: 'Employee Dashboard', path: '/dashboard/employee', icon: LayoutDashboard },
  { label: 'My Requests', path: '/dashboard/employee/bookinglist', icon: History },
      { label: 'Request Vehicle', path: '/dashboard/employee/booking', icon: Car }
];

const MyRequests = () => {
  const { user } = useAuth();
  
  // Layout Structural Toggle States
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Application Operational Core States
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
        setMyRequests(response.data || []);
      } catch (error) {
        console.error('❌ Error loading personal history stream:', error);
        setMyRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyRequests();
  }, [user]);

  // Helper to generate semantic Tailwind layout status badges dynamically
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
    <div className="flex h-screen w-screen overflow-hidden bg-ntc-gray font-sans antialiased text-ntc-dark">
      
      {/* Shared Sidebar Shell Component */}
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen} 
        sidebarcomp={EMPLOYEE_NAVIGATION_OPTIONS} 
      />

      <div className="flex-1 flex flex-col min-w-0 h-full w-full transition-all duration-300">
        
        {/* Shared Top Navigation Bar Component */}
        <Header 
          userRole={user?.role} 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
          setIsMobileOpen={setIsMobileOpen}
          branchName={user?.userbranch|| 'N/A'} 
        />

        {/* Scroll Container Workspace Main Body Area */}
        <main className="flex-1 p-6 overflow-y-auto bg-ntc-gray space-y-6">
          
          {/* Header Bar Area */}
          <div className="pb-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-ntc-dark font-black text-2xl tracking-tight flex items-center gap-3">
                <ClipboardList className="text-ntc-blue" size={28} />
                My Vehicle Booking History
              </h1>
              <p className="text-ntc-muted text-xs font-medium mt-1">
                Monitor, filter, and track your active transport authorizations
              </p>
            </div>
            
            {/* Dynamic Action Buttons Group */}
            <div className="flex gap-3 flex-wrap">
              <Link 
                to="/dashboard/employee/bookings" 
                className="inline-flex items-center justify-center bg-ntc-blue text-white font-semibold text-xs px-4 py-2.5 rounded-md transition-colors duration-200 hover:bg-opacity-90 select-none shadow-sm cursor-pointer"
              >
                New Booking Request
              </Link>
              <Link
                to="/dashboard/employee"
                className="inline-flex items-center justify-center bg-gray-200 text-ntc-dark font-semibold text-xs px-4 py-2.5 rounded-md transition-colors duration-200 hover:bg-gray-300 select-none shadow-sm cursor-pointer"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>

          {/* Main Container Card Component Box */}
          <div className="bg-white p-6 rounded-[10px] shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-gray-100">
            
            {myRequests.length === 0 ? (
              /* Empty State Template Display Layout */
              <div className="text-center py-16 flex flex-col items-center justify-center">
                <div className="p-4 bg-ntc-gray rounded-full text-ntc-muted mb-4">
                  <Car size={40} />
                </div>
                <p className="text-ntc-dark font-bold text-lg mb-1">No bookings found</p>
                <p className="text-ntc-muted text-sm mb-6 max-w-sm">You haven't submitted any transport allocation requests yet.</p>
                <Link 
                  to="/dashboard/employee/bookings" 
                  className="border border-ntc-blue text-ntc-blue font-semibold text-xs px-4 py-2 rounded-md transition-colors duration-200 hover:bg-ntc-light-blue/20"
                >
                  Request Your First Vehicle
                </Link>
              </div>
            ) : (
              /* Secure Responsive Data Table Canvas Grid */
              <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-ntc-gray border-b-2 border-gray-200 text-ntc-muted font-bold text-xs uppercase tracking-wider">
                      <th className="p-4">Req ID</th>
                      <th className="p-4">Vehicle</th>
                      <th className="p-4">Route Parameters</th>
                      <th className="p-4">Scheduled Window</th>
                      <th className="p-4">Purpose Context</th>
                      <th className="p-4 text-center">Approval Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm text-ntc-dark">
                    {myRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                        
                        {/* Booking ID Parameter Column */}
                        <td className="p-4 font-bold">
                          #{req.id}
                        </td>
                        
                        {/* Vehicle Identity Assignment Key Column */}
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 text-ntc-dark font-medium text-xs rounded-md border border-gray-200">
                            <Car size={12} className="text-ntc-muted" />
                            {req.vehicle_manufacturer ? `${req.vehicle_manufacturer} ${req.vehicle_model || ''}` : 'Auto Allocating'}
                          </span>
                        </td>
                        
                        {/* Source and Destination Travel Vectors Route Column */}
                        <td className="p-4">
                          <div className="flex flex-col gap-1 max-w-xs">
                            <div className="flex items-center gap-1 text-xs font-semibold text-ntc-dark">
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
                              <span className="font-medium">{req.start_time ? new Date(req.start_time).toLocaleString() : 'Pending Slot'}</span>
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
                          <span className={`inline-block px-3 py-1 font-bold text-xs uppercase tracking-wide rounded-full ${getStatusBadgeClass(req.status)}`}>
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

        </main>
      </div>
    </div>
  );
};

export default MyRequests;


